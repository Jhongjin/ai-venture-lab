import { NextResponse } from "next/server";

import { verifyBuildSyncToken } from "@/lib/build-sync-token";
import { getBuildSyncIdeaAccess } from "@/lib/build-sync-permissions";
import { markBuildSyncTokenUsed, validateRegisteredBuildSyncToken } from "@/lib/build-sync-registry";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import type {
  Database,
  ImplementationTaskPriority,
  ImplementationTaskStatus,
  ImplementationTaskType,
} from "@/lib/supabase/types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type ImplementationTaskRow = Database["public"]["Tables"]["implementation_tasks"]["Row"];

type SyncRecord = {
  task: string;
  status: ImplementationTaskStatus;
  summary: string;
  files: string[];
  verification: string;
  recordedAt: string;
};

type FallbackTask = {
  title: string;
  task_type: ImplementationTaskType;
  priority: ImplementationTaskPriority;
  owner_role: string;
  acceptance_criteria: string;
};

const fallbackTasks: FallbackTask[] = [
  {
    title: "기획서와 첫 제작 범위 잠금",
    task_type: "planning",
    priority: "high",
    owner_role: "prd-writer",
    acceptance_criteria: "포함 범위, 제외 범위, 성공 지표, 중단 기준이 명확해야 합니다.",
  },
  {
    title: "핵심 사용자 여정 와이어프레임 정리",
    task_type: "design",
    priority: "high",
    owner_role: "design-reviewer",
    acceptance_criteria: "첫 화면부터 저장/완료까지의 주요 상태와 빈/오류/성공 상태를 확인할 수 있어야 합니다.",
  },
  {
    title: "데이터 모델과 마이그레이션",
    task_type: "data",
    priority: "high",
    owner_role: "prototype-builder",
    acceptance_criteria: "필요한 테이블, 소유권, 인덱스, 롤백 기준이 문서와 마이그레이션에 반영되어야 합니다.",
  },
  {
    title: "백엔드 권한 경계 구현",
    task_type: "backend",
    priority: "high",
    owner_role: "prototype-builder",
    acceptance_criteria: "인증 세션, 서버 경계, RLS 또는 API 권한 체크가 허용/거부 기준과 함께 검증되어야 합니다.",
  },
  {
    title: "핵심 입력/저장/조회 화면 구현",
    task_type: "frontend",
    priority: "high",
    owner_role: "prototype-builder",
    acceptance_criteria: "핵심 여정의 입력, 저장, 조회, 수정 흐름이 한 번에 이어져야 합니다.",
  },
  {
    title: "상태 UX와 폼 검증 추가",
    task_type: "frontend",
    priority: "medium",
    owner_role: "prototype-builder",
    acceptance_criteria: "빈 상태, 로딩, 저장 중, 실패, 성공, 재시도 상태가 사용자가 이해할 수 있게 보여야 합니다.",
  },
  {
    title: "품질 스모크와 회귀 검증",
    task_type: "qa",
    priority: "high",
    owner_role: "qa-runner",
    acceptance_criteria: "핵심 명령과 브라우저 스모크가 통과하고 실패 시 재현 경로가 남아야 합니다.",
  },
  {
    title: "보안/개인정보 점검",
    task_type: "security",
    priority: "high",
    owner_role: "security-reviewer",
    acceptance_criteria: "비밀값, 개인정보, 권한 경계, 로그 노출 위험이 점검되어야 합니다.",
  },
  {
    title: "배포와 출시 보고",
    task_type: "deploy",
    priority: "high",
    owner_role: "launch-gate",
    acceptance_criteria: "배포 URL, 검증 결과, 롤백 기준, 남은 리스크가 한 번에 확인되어야 합니다.",
  },
];

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function toBoundedText(value: unknown, maxLength: number) {
  if (typeof value !== "string" && typeof value !== "number" && typeof value !== "boolean") {
    return "";
  }

  return String(value).trim().slice(0, maxLength);
}

function toBoundedTextArray(value: unknown, maxItems = 12) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map((item) => toBoundedText(item, 240)).filter(Boolean).slice(0, maxItems);
}

function normalizeStatus(value: unknown): ImplementationTaskStatus {
  const normalized = toBoundedText(value, 80).toLowerCase();

  if (
    ["done", "completed", "complete", "finish", "finished", "reported", "recorded", "완료", "마침", "통과", "기록"].some(
      (keyword) => normalized.includes(keyword),
    )
  ) {
    return "done";
  }

  if (["doing", "running", "progress", "in_progress", "진행"].some((keyword) => normalized.includes(keyword))) {
    return "doing";
  }

  if (["blocked", "blocker", "stuck", "차단", "막힘", "보류"].some((keyword) => normalized.includes(keyword))) {
    return "blocked";
  }

  return "todo";
}

function parseTaskCode(value: string) {
  const match = value.match(/\bT-(\d{3})\b/i);
  return match ? `T-${match[1].padStart(3, "0")}` : null;
}

function stripTaskCode(value: string) {
  return value.replace(/\bT-\d{3}\b[:\s-]*/i, "").trim();
}

function normalizeTaskTitle(value: string) {
  return stripTaskCode(value)
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "");
}

function toSyncRecord(value: unknown): SyncRecord | null {
  if (!isRecord(value)) {
    return null;
  }

  const task = toBoundedText(value.task ?? value.title ?? value.name, 240);
  const summary = toBoundedText(value.summary ?? value.detail ?? value.description ?? value.output, 2000);
  const verification = toBoundedText(value.verification ?? value.checks ?? value.test ?? value.tests, 1200);
  const recordedAt = toBoundedText(value.recordedAt ?? value.updatedAt ?? value.completedAt, 80) || new Date().toISOString();

  if (!task && !summary) {
    return null;
  }

  return {
    task: task || "제작 작업",
    status: normalizeStatus(value.status),
    summary,
    files: toBoundedTextArray(value.files ?? value.changedFiles),
    verification,
    recordedAt,
  };
}

function extractSyncRecords(body: unknown) {
  const candidates = isRecord(body) && Array.isArray(body.records) ? body.records : [body];
  return candidates.map(toSyncRecord).filter((record): record is SyncRecord => Boolean(record)).slice(0, 20);
}

function buildEvidence(record: SyncRecord) {
  const lines = [
    "# Cursor 자동 동기화",
    "",
    `- 작업: ${record.task}`,
    `- 상태: ${record.status}`,
    record.summary ? `- 요약: ${record.summary}` : "",
    record.verification ? `- 검증: ${record.verification}` : "",
    record.files.length > 0 ? `- 변경 파일: ${record.files.join(", ")}` : "",
    `- 기록 시각: ${record.recordedAt}`,
  ];

  return lines.filter(Boolean).join("\n");
}

function findTaskMatch(record: SyncRecord, tasks: ImplementationTaskRow[]) {
  const taskCode = parseTaskCode(record.task) ?? parseTaskCode(record.summary);
  const codeIndex = taskCode ? Number(taskCode.replace("T-", "")) - 1 : -1;
  const normalizedRecordTitle = normalizeTaskTitle(record.task);

  if (codeIndex >= 0 && tasks[codeIndex]) {
    return tasks[codeIndex];
  }

  if (normalizedRecordTitle) {
    const exactMatch = tasks.find((task) => normalizeTaskTitle(task.title) === normalizedRecordTitle);

    if (exactMatch) {
      return exactMatch;
    }

    return tasks.find((task) => {
      const normalizedTaskTitle = normalizeTaskTitle(task.title);
      return normalizedTaskTitle.includes(normalizedRecordTitle) || normalizedRecordTitle.includes(normalizedTaskTitle);
    });
  }

  return null;
}

function fallbackForRecord(record: SyncRecord) {
  const taskCode = parseTaskCode(record.task) ?? parseTaskCode(record.summary);
  const codeIndex = taskCode ? Number(taskCode.replace("T-", "")) - 1 : -1;

  if (codeIndex >= 0 && fallbackTasks[codeIndex]) {
    return fallbackTasks[codeIndex];
  }

  return {
    title: stripTaskCode(record.task) || "Cursor에서 추가한 제작 작업",
    task_type: "planning" as ImplementationTaskType,
    priority: record.status === "blocked" ? ("high" as ImplementationTaskPriority) : ("medium" as ImplementationTaskPriority),
    owner_role: "prototype-builder",
    acceptance_criteria: "Cursor 자동 동기화로 추가된 제작 작업입니다. 변경 파일, 검증, 남은 리스크가 기록되어야 합니다.",
  };
}

function mergeStatus(existingStatus: ImplementationTaskStatus, incomingStatus: ImplementationTaskStatus) {
  if (existingStatus === "done" && incomingStatus !== "blocked") {
    return "done";
  }

  return incomingStatus;
}

function getBearerToken(request: Request) {
  const authorization = request.headers.get("authorization") ?? "";
  const [scheme, token] = authorization.split(/\s+/, 2);

  if (scheme?.toLowerCase() !== "bearer" || !token) {
    return "";
  }

  return token.trim();
}

export async function POST(request: Request) {
  const admin = getSupabaseAdminClient();

  if (!admin) {
    return jsonError("Supabase admin client is not configured.", 503);
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON body.", 400);
  }

  const token = getBearerToken(request) || (isRecord(body) ? toBoundedText(body.token, 4000) : "");

  if (!token) {
    return jsonError("Valid build sync token is required.", 401);
  }

  const verification = verifyBuildSyncToken(token);

  if (!verification.ok) {
    return jsonError(verification.error, 401);
  }

  const records = extractSyncRecords(body);

  if (records.length === 0) {
    return jsonError("No Cursor progress records were found.", 400);
  }

  const { payload } = verification;

  if (payload.tool !== "cursor") {
    return jsonError("This build sync token is not valid for Cursor.", 403);
  }

  const registryValidation = await validateRegisteredBuildSyncToken({
    admin,
    token,
    payload,
  });

  if (!registryValidation.ok) {
    return jsonError(registryValidation.error, registryValidation.status);
  }

  const access = await getBuildSyncIdeaAccess(admin, payload.ideaId, payload.actorId);

  if (!access.ok) {
    return jsonError(access.error, access.status);
  }

  if (!access.canManage) {
    return jsonError("Build sync token actor can no longer update this idea.", 403);
  }

  const idea = access.idea;

  if (idea.organization_id !== payload.organizationId) {
    return jsonError("Build sync token does not match this idea workspace.", 403);
  }

  const { data: existingTaskRows, error: taskError } = await admin
    .from("implementation_tasks")
    .select("*")
    .eq("idea_id", idea.id)
    .order("sort_order", { ascending: true });

  if (taskError) {
    return jsonError(`Could not read implementation tasks: ${taskError.message}`, 500);
  }

  const mutableTasks = [...(existingTaskRows ?? [])];
  let nextSortOrder =
    mutableTasks.reduce((maxSortOrder, task) => Math.max(maxSortOrder, task.sort_order ?? 0), 0) + 1;
  const items: Array<{
    taskCode: string | null;
    title: string;
    status: ImplementationTaskStatus;
    action: "inserted" | "updated";
  }> = [];
  let insertedTaskCount = 0;
  let updatedTaskCount = 0;

  for (const record of records) {
    const matchedTask = findTaskMatch(record, mutableTasks);
    const taskCode = parseTaskCode(record.task) ?? parseTaskCode(record.summary);
    const evidence = buildEvidence(record);

    if (matchedTask) {
      const status = mergeStatus(matchedTask.status, record.status);
      const { data: updatedTask, error: updateError } = await admin
        .from("implementation_tasks")
        .update({
          status,
          evidence,
        })
        .eq("id", matchedTask.id)
        .select("*")
        .single();

      if (updateError) {
        return jsonError(`Could not update task "${matchedTask.title}": ${updateError.message}`, 500);
      }

      const taskIndex = mutableTasks.findIndex((task) => task.id === matchedTask.id);

      if (taskIndex >= 0) {
        mutableTasks[taskIndex] = updatedTask;
      }

      updatedTaskCount += 1;
      items.push({ taskCode, title: updatedTask.title, status: updatedTask.status, action: "updated" });
      continue;
    }

    const fallbackTask = fallbackForRecord(record);
    const title = stripTaskCode(record.task) || fallbackTask.title;
    const { data: insertedTask, error: insertError } = await admin
      .from("implementation_tasks")
      .insert({
        idea_id: idea.id,
        organization_id: idea.organization_id,
        title,
        task_type: fallbackTask.task_type,
        priority: fallbackTask.priority,
        status: record.status,
        owner_role: fallbackTask.owner_role,
        acceptance_criteria: fallbackTask.acceptance_criteria,
        evidence,
        sort_order: nextSortOrder,
        created_by: payload.actorId,
      })
      .select("*")
      .single();

    if (insertError) {
      return jsonError(`Could not insert Cursor task "${title}": ${insertError.message}`, 500);
    }

    nextSortOrder += 1;
    mutableTasks.push(insertedTask);
    insertedTaskCount += 1;
    items.push({ taskCode, title: insertedTask.title, status: insertedTask.status, action: "inserted" });
  }

  await markBuildSyncTokenUsed(admin, registryValidation.tokenId);

  return NextResponse.json({
    ok: true,
    registryStatus: registryValidation.registryStatus,
    insertedTaskCount,
    updatedTaskCount,
    completedTaskCount: items.filter((item) => item.status === "done").length,
    items,
  });
}
