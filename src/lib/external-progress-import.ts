import type {
  ImplementationTaskPriority,
  ImplementationTaskStatus,
  ImplementationTaskType,
} from "@/lib/supabase/types";
import type { ImplementationTask } from "@/lib/venture-data";
import { isPlainRecord } from "@/lib/record-utils";

export type ImplementationTaskDraft = {
  title: string;
  task_type: ImplementationTaskType;
  priority: ImplementationTaskPriority;
  owner_role: string;
  acceptance_criteria: string;
};

type CursorProgressImportItem = {
  taskCode: string;
  draftIndex: number;
  title: string;
  status: ImplementationTaskStatus;
  evidence: string;
};

export type CursorProgressImportDraft = ImplementationTaskDraft & {
  taskCode: string;
  status: ImplementationTaskStatus;
  evidence: string;
};

export type CursorProgressDisplayItem = {
  taskCode: string;
  title: string;
  status: ImplementationTaskStatus;
  detail: string;
};

export type CursorProgressTaskInsertDraft = {
  idea_id: string;
  organization_id: string | null;
  source_artifact_id: string | null;
  title: string;
  task_type: ImplementationTaskType;
  priority: ImplementationTaskPriority;
  status: ImplementationTaskStatus;
  owner_role: string;
  acceptance_criteria: string;
  evidence: string;
  sort_order: number;
};

export type CursorProgressTaskUpdateDraft = {
  task: ImplementationTask;
  status: ImplementationTaskStatus;
  evidence: string;
};

export type CursorProgressTaskUpdatePatch = {
  status: ImplementationTaskStatus;
  evidence: string;
};

const externalProgressStatusLabels: Record<ImplementationTaskStatus, string> = {
  todo: "할 일",
  doing: "진행 중",
  blocked: "막힘",
  done: "완료",
};

export function getCursorTaskCode(index: number) {
  return `T-${String(index + 1).padStart(3, "0")}`;
}

export function normalizeTaskLookupTitle(value: string) {
  return value
    .toLowerCase()
    .replace(/^[tT][-\s]?\d{1,3}\s*/g, "")
    .replace(/[()[\]{}:：._-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeCursorProgressStatus(
  value: unknown,
  fallback: ImplementationTaskStatus = "todo",
): ImplementationTaskStatus {
  const text = String(value ?? "").toLowerCase();

  if (/blocked|blocker|차단|막힘|보류/.test(text)) {
    return "blocked";
  }

  if (/doing|running|progress|진행|작업\s*중/.test(text)) {
    return "doing";
  }

  if (/done|complete|completed|finished|reported|recorded|완료|마침|통과|기록/.test(text)) {
    return "done";
  }

  if (/todo|next|pending|대기|미완료|다음/.test(text)) {
    return "todo";
  }

  return fallback;
}

function parseCursorTaskReference(value: string, fallbackIndex: number) {
  const match = value.match(/T[-\s]?(\d{1,3})/i);
  const parsedNumber = match ? Number.parseInt(match[1], 10) : Number.NaN;
  const draftIndex = Number.isFinite(parsedNumber) && parsedNumber > 0 ? parsedNumber - 1 : fallbackIndex;
  const taskCode = Number.isFinite(parsedNumber) && parsedNumber > 0 ? getCursorTaskCode(draftIndex) : getCursorTaskCode(fallbackIndex);
  const titleFromParentheses = value.match(/T[-\s]?\d{1,3}\s*[\(:：]\s*([^)\n]+)\)?/i)?.[1]?.trim() ?? "";
  const titleAfterCode = match
    ? value
        .slice((match.index ?? 0) + match[0].length)
        .replace(/^[\s:：()[\].,_-]+/g, "")
        .replace(/^(과|와|및|그리고|를|을|은|는)\s+/g, "")
        .replace(/\s*(이번에|이번 작업|마쳤|완료|입니다|진행합니다|작성)\s*.*$/g, "")
        .trim()
    : value.trim();
  const title = titleFromParentheses || titleAfterCode;

  return {
    taskCode,
    draftIndex,
    title,
  };
}

function buildCursorProgressEvidence(
  sourceText: string,
  taskCode: string,
  title: string,
  status: ImplementationTaskStatus,
) {
  const lines = sourceText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  const verificationLines = lines
    .filter((line) => /pnpm|lint|typecheck|harness|build|smoke|검증|통과/i.test(line))
    .slice(0, 12);
  const fileLines = lines
    .filter((line) => /AI_VENTURE_|docs\/|web\/|src\/|\.md|변경 파일|경로|포함 범위/i.test(line))
    .slice(0, 12);
  const nextLine = lines.find((line) => /다음|next|미완료|남은/i.test(line));
  const summaryLines = lines
    .filter((line) => !verificationLines.includes(line) && !fileLines.includes(line))
    .slice(0, 8);

  return [
    "# 외부 개발 도구 진행 결과 가져오기",
    "",
    `- 작업: ${taskCode} ${title || "제작 작업"}`,
    `- 반영 상태: ${externalProgressStatusLabels[status]}`,
    nextLine ? `- 다음 언급: ${nextLine}` : "",
    verificationLines.length > 0 ? `\n## 검증\n${verificationLines.map((line) => `- ${line}`).join("\n")}` : "",
    fileLines.length > 0 ? `\n## 변경 파일/범위\n${fileLines.map((line) => `- ${line}`).join("\n")}` : "",
    summaryLines.length > 0 ? `\n## 완료 보고 요약\n${summaryLines.map((line) => `- ${line}`).join("\n")}` : "",
  ]
    .filter(Boolean)
    .join("\n")
    .slice(0, 3600);
}

export function summarizeCursorProgressEvidence(evidence: string) {
  const preferredLine =
    evidence
      .split(/\r?\n/)
      .map((line) => line.trim())
      .find((line) => /요약|검증|변경 파일|범위|다음 언급/.test(line) && !line.startsWith("##")) ??
    evidence
      .split(/\r?\n/)
      .map((line) => line.trim())
      .find((line) => line.startsWith("- ")) ??
    "";

  return preferredLine.replace(/^-\s*/, "").replace(/^요약:\s*/, "").slice(0, 140);
}

function parseCursorProgressJsonItems(sourceText: string): CursorProgressImportItem[] {
  let parsed: unknown;

  try {
    parsed = JSON.parse(sourceText);
  } catch {
    return [];
  }

  const records = Array.isArray(parsed)
    ? parsed
    : isPlainRecord(parsed) && Array.isArray(parsed.records)
      ? parsed.records
      : isPlainRecord(parsed) && Array.isArray(parsed.progress)
        ? parsed.progress
        : isPlainRecord(parsed) && Array.isArray(parsed.tasks)
          ? parsed.tasks
          : [];

  return records.flatMap((record, index) => {
    if (!isPlainRecord(record)) {
      return [];
    }

    const rawTask = String(record.task ?? record.title ?? record.name ?? "").trim();
    if (!rawTask) {
      return [];
    }

    const reference = parseCursorTaskReference(rawTask, index);
    const status = normalizeCursorProgressStatus(record.status ?? record.state ?? record.result, "done");
    const files = Array.isArray(record.files) ? record.files.map(String).filter(Boolean) : [];
    const verification = String(record.verification ?? "").trim();
    const summary = String(record.summary ?? record.note ?? record.description ?? "").trim();
    const evidenceSource = [
      `작업: ${rawTask}`,
      `상태: ${String(record.status ?? status)}`,
      summary ? `요약: ${summary}` : "",
      files.length > 0 ? `변경 파일: ${files.join(", ")}` : "",
      verification ? `검증: ${verification}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    return [
      {
        ...reference,
        title: reference.title || rawTask,
        status,
        evidence: buildCursorProgressEvidence(evidenceSource, reference.taskCode, reference.title || rawTask, status),
      },
    ];
  });
}

function parseCursorProgressTextItems(sourceText: string): CursorProgressImportItem[] {
  const taskPattern = /T[-\s]?(\d{1,3})(?:\s*[\(:：]\s*([^)\n]+)\)?)?/gi;
  const lines = sourceText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  const items: CursorProgressImportItem[] = [];
  const looseJsonRecordPattern =
    /"task"\s*:\s*"([^"]+)"[\s\S]{0,900}?"status"\s*:\s*"([^"]+)"(?:[\s\S]{0,900}?"summary"\s*:\s*"([^"]+)")?/gi;

  for (const match of sourceText.matchAll(looseJsonRecordPattern)) {
    const rawTask = match[1]?.trim() ?? "";
    if (!rawTask) {
      continue;
    }

    const reference = parseCursorTaskReference(rawTask, items.length);
    const status = normalizeCursorProgressStatus(match[2], "done");
    const summary = match[3]?.trim() ?? "";

    items.push({
      ...reference,
      title: reference.title || rawTask,
      status,
      evidence: buildCursorProgressEvidence(
        [`작업: ${rawTask}`, `상태: ${match[2]}`, summary ? `요약: ${summary}` : ""].filter(Boolean).join("\n"),
        reference.taskCode,
        reference.title || rawTask,
        status,
      ),
    });
  }

  for (const line of lines) {
    const lowerLine = line.toLowerCase();
    const isNextLine = /다음|next|미완료|pending|todo/.test(lowerLine);
    const isDoneLine = !/미완료/.test(lowerLine) && /완료|마쳤|completed|done|finished|통과/.test(lowerLine);
    const isProgressLine = /진행|작업\s*중|running|progress/.test(lowerLine);

    if (!isNextLine && !isDoneLine && !isProgressLine) {
      continue;
    }

    const matches = Array.from(line.matchAll(taskPattern));
    for (const match of matches) {
      const taskNumber = Number.parseInt(match[1], 10);
      if (!Number.isFinite(taskNumber) || taskNumber <= 0) {
        continue;
      }

      const draftIndex = taskNumber - 1;
      const reference = parseCursorTaskReference(line, draftIndex);
      const status = isDoneLine ? "done" : isProgressLine ? "doing" : "todo";
      const title = (match[2] ?? reference.title).trim();

      items.push({
        taskCode: getCursorTaskCode(draftIndex),
        draftIndex,
        title,
        status,
        evidence: buildCursorProgressEvidence(sourceText, getCursorTaskCode(draftIndex), title, status),
      });
    }
  }

  const byCode = new Map<string, CursorProgressImportItem>();
  for (const item of items) {
    const previous = byCode.get(item.taskCode);
    if (!previous || (previous.status !== "done" && item.status === "done")) {
      byCode.set(item.taskCode, item);
    }
  }

  return Array.from(byCode.values()).sort((a, b) => a.draftIndex - b.draftIndex);
}

export function buildCursorProgressImportDrafts({
  sourceText,
  fallbackTasks,
}: {
  sourceText: string;
  fallbackTasks: ImplementationTaskDraft[];
}) {
  const trimmedSource = sourceText.trim();
  const parsedItems = parseCursorProgressJsonItems(trimmedSource);
  const importItems = parsedItems.length > 0 ? parsedItems : parseCursorProgressTextItems(trimmedSource);
  const itemByIndex = new Map<number, CursorProgressImportItem>();

  for (const item of importItems) {
    const previous = itemByIndex.get(item.draftIndex);
    if (!previous || (previous.status !== "done" && item.status === "done")) {
      itemByIndex.set(item.draftIndex, item);
    }
  }

  const drafts: CursorProgressImportDraft[] = fallbackTasks.map((task, index) => {
    const item = itemByIndex.get(index);

    return {
      ...task,
      taskCode: getCursorTaskCode(index),
      status: item?.status ?? "todo",
      evidence: item?.evidence ?? "",
    };
  });

  const extraDrafts = importItems
    .filter((item) => item.draftIndex < 0 || item.draftIndex >= fallbackTasks.length)
    .map((item) => ({
      taskCode: item.taskCode,
      title: item.title || item.taskCode,
      task_type: "planning" as ImplementationTaskType,
      priority: item.status === "blocked" ? ("high" as ImplementationTaskPriority) : ("medium" as ImplementationTaskPriority),
      owner_role: "prototype-builder",
      acceptance_criteria: "외부 개발 도구 진행 결과에서 가져온 추가 제작 작업입니다.",
      status: item.status,
      evidence: item.evidence,
    }));

  return {
    drafts: [...drafts, ...extraDrafts],
    parsedCount: importItems.length,
    completedCount: importItems.filter((item) => item.status === "done").length,
  };
}

export function buildCursorProgressPreviewItems({
  fallbackTasks,
  sourceText,
}: {
  fallbackTasks: ImplementationTaskDraft[];
  sourceText: string;
}): CursorProgressDisplayItem[] {
  if (!sourceText.trim() || fallbackTasks.length === 0) {
    return [];
  }

  return buildCursorProgressImportDrafts({
    sourceText,
    fallbackTasks,
  }).drafts
    .filter((draft) => draft.status !== "todo" || draft.evidence.trim())
    .map((draft) => ({
      taskCode: draft.taskCode,
      title: draft.title,
      status: draft.status,
      detail: summarizeCursorProgressEvidence(draft.evidence) || "붙여넣은 진행 결과에서 자동으로 읽은 작업입니다.",
    }));
}

export function buildCursorProgressImportDisplayItems({
  drafts,
  toolLabel,
}: {
  drafts: CursorProgressImportDraft[];
  toolLabel: string;
}): CursorProgressDisplayItem[] {
  return drafts
    .filter((draft) => draft.status !== "todo" || draft.evidence.trim())
    .map((draft) => ({
      taskCode: draft.taskCode,
      title: draft.title,
      status: draft.status,
      detail:
        summarizeCursorProgressEvidence(draft.evidence) ||
        (draft.status === "done"
          ? `${toolLabel} 완료 보고가 반영되었습니다.`
          : draft.status === "doing"
            ? `${toolLabel}에서 진행 중인 작업으로 표시되었습니다.`
            : draft.status === "blocked"
              ? `${toolLabel} 완료 보고에서 차단 상태로 표시되었습니다.`
              : "다음 미완료 작업으로 표시되었습니다."),
    }));
}

export function buildCursorProgressPersistencePlan({
  canManageTask,
  drafts,
  existingSortedTasks,
  existingTasks,
  ideaId,
  organizationId,
  sourceArtifactId,
}: {
  canManageTask: (task: ImplementationTask) => boolean;
  drafts: CursorProgressImportDraft[];
  existingSortedTasks: ImplementationTask[];
  existingTasks: ImplementationTask[];
  ideaId: string;
  organizationId: string | null;
  sourceArtifactId: string | null;
}) {
  const existingByTitle = new Map(
    existingTasks.map((task) => [normalizeTaskLookupTitle(task.title), task]),
  );
  const rowsToInsert: CursorProgressTaskInsertDraft[] = [];
  const updateRows: CursorProgressTaskUpdateDraft[] = [];
  let skippedTaskCount = 0;

  drafts.forEach((draft, index) => {
    const normalizedTitle = normalizeTaskLookupTitle(draft.title);
    const indexMatch = existingSortedTasks.length === drafts.length ? existingSortedTasks[index] ?? null : null;
    const matchedTask = existingByTitle.get(normalizedTitle) ?? indexMatch;
    const nextEvidence = draft.evidence.trim();

    if (matchedTask) {
      if (!canManageTask(matchedTask)) {
        skippedTaskCount += 1;
        return;
      }

      const nextStatus = matchedTask.status === "done" && draft.status !== "done" ? matchedTask.status : draft.status;
      const mergedEvidence = [matchedTask.evidence?.trim() ?? "", nextEvidence]
        .filter(Boolean)
        .join("\n\n---\n\n")
        .slice(0, 9000);

      if (matchedTask.status !== nextStatus || (nextEvidence && mergedEvidence !== (matchedTask.evidence ?? ""))) {
        updateRows.push({
          task: matchedTask,
          status: nextStatus,
          evidence: mergedEvidence,
        });
      }

      return;
    }

    rowsToInsert.push({
      idea_id: ideaId,
      organization_id: organizationId,
      source_artifact_id: sourceArtifactId,
      title: draft.title,
      task_type: draft.task_type,
      priority: draft.priority,
      status: draft.status,
      owner_role: draft.owner_role,
      acceptance_criteria: draft.acceptance_criteria,
      evidence: nextEvidence,
      sort_order: existingTasks.length + rowsToInsert.length,
    });
  });

  return {
    rowsToInsert,
    skippedTaskCount,
    updateRows,
  };
}

export function buildCursorProgressTaskUpdatePatch({
  evidence,
  status,
}: Pick<CursorProgressTaskUpdateDraft, "evidence" | "status">): CursorProgressTaskUpdatePatch {
  return { status, evidence };
}

export function getVisibleCursorProgressImportItems({
  importedItems,
  previewItems,
}: {
  importedItems: CursorProgressDisplayItem[];
  previewItems: CursorProgressDisplayItem[];
}) {
  return importedItems.length > 0 ? importedItems : previewItems;
}
