"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import type { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { fetchApiJson } from "@/lib/api-client";
import { buildJsonPostRequestInit } from "@/lib/api-request-utils";
import { copyBrowserText } from "@/lib/browser-file-download";
import { getBrowserLocationSnapshot, replaceBrowserHistoryUrl } from "@/lib/browser-location";
import { clearBrowserTimeout, scheduleBrowserTimeout } from "@/lib/browser-timing";
import {
  buildWorkspaceEmailRedirectUrl,
  readAuthCallbackErrorState,
  readMagicLinkCodeState,
} from "@/lib/auth-callback-url";
import {
  inferProductSurface,
  productSurfaceProfiles,
  type ProductSurfaceKey,
} from "@/lib/product-surface";
import { isMissingProductSurfaceColumnError, omitProductSurface } from "@/lib/product-surface-db";
import { redactSensitiveSource } from "@/lib/source-redaction";
import {
  buildExtractIdeasRequestPayload,
  buildGenerateSampleIdeasRequestPayload,
  buildGeneratedIdeaSourceFromSlots,
  createExtractionRunMeta,
  getExtractIdeasUrl,
  getGenerateSampleIdeasUrl,
  mergeGeneratedIdeaSlots,
  type AiGeneratedSampleIdea,
  type ExtractionRunMeta,
  type GeneratedIdeaSlot,
} from "@/lib/generated-idea-slots";
import {
  defaultBuildDeliveryPreference,
  externalBuildToolProfiles,
  normalizeBuildDeliveryPreference,
  type BuildDeliveryPreference,
} from "@/lib/build-delivery";
import { formatAuthCallbackMessage, formatAuthError, formatWorkspaceError } from "@/lib/venture-console-errors";
import {
  buildCandidateReadiness,
  buildExtractionGate,
  type ExtractionGate,
  type ExtractionGateId,
} from "@/lib/extraction-gate";
import {
  buildCandidateStrategyLens,
  getCandidateStrategyScore,
} from "@/lib/extraction-strategy-lens";
import {
  buildExtractionPortfolioReportArtifactRow,
  buildExtractionPortfolioReviewMarkdown,
  type ExtractionPortfolioMarkdownItem,
} from "@/lib/extraction-report-markdown";
import {
  buildExtractionReplaySummary,
  type ExtractionReplayMode,
  type ExtractionReplaySummary as ExtractionReplaySummaryBase,
} from "@/lib/extraction-replay-summary";
import {
  buildExtractionDetailItems,
  buildExtractionGateMap,
  buildExtractionPortfolioItems,
  buildExtractionPortfolioMarkdownItems,
  buildExtractionSimilarIdeaMatches,
  buildBulkExtractionSaveMessage,
  buildSingleExtractionSaveMessage,
  countExtractionPortfolioGates,
  type ExtractionPortfolioListItem,
  getBulkSavableExtractionItems,
  getSecondaryExtractionPortfolioItems,
  selectRecommendedExtractionCandidate,
} from "@/lib/extraction-portfolio-utils";
import {
  buildExtractedIdeaExperimentRow,
  buildExtractedIdeaInsertRow,
  buildExtractedIdeaPackageArtifactRows,
  buildExtractedIdeaRiskRow,
} from "@/lib/extracted-idea-artifact-rows";
import { compactText } from "@/lib/extraction-text-utils";
import { findBestCandidateMatch, findSimilarIdea, type SimilarIdeaMatch } from "@/lib/extraction-candidate-match";
import {
  extractIdeasFromText,
  hydrateAiExtractedIdeas,
  type AiExtractedIdeaCandidate,
  type ExtractedIdea,
} from "@/lib/extracted-idea-normalization";
import { buildTelemetryEventInsertRow } from "@/lib/telemetry-format";
import {
  addableOrganizationRoles,
  buildAddOrganizationMemberParams,
  buildAttachPersonalRecordsPatch,
  buildDefaultWorkspaceInsertRow,
  buildRemoveOrganizationMemberParams,
  buildUpdateOrganizationMemberRoleParams,
  organizationRoleLabels,
  type AddableOrganizationRole,
  workspaceRecordTables,
} from "@/lib/workspace-organization-rows";
import { emitVentureEvent } from "@/lib/venture-events";
import { IdeaExtractionAdvancedQueue } from "@/components/idea-extraction-advanced-queue";
import { IdeaExtractionDetailList } from "@/components/idea-extraction-detail-list";
import { IdeaExtractionLeftPanel } from "@/components/idea-extraction-left-panel";
import { IdeaExtractionRightPanel } from "@/components/idea-extraction-right-panel";
import { IdeaExtractionSectionHeader } from "@/components/idea-extraction-section-header";
import { ManualIdeaIntakeForm } from "@/components/manual-idea-intake-form";
import { VentureConsoleAuthCard } from "@/components/venture-console-auth-card";
import { VentureConsoleStartGuide, type VentureConsoleStartGuideTask } from "@/components/venture-console-start-guide";
import { VentureConsoleWorkspaceCard } from "@/components/venture-console-workspace-card";
import { buildManualIdeaDirectionArtifactRowFromProfiles, buildManualIdeaInsertRow } from "@/lib/manual-idea-artifact";
import type { Database, Json } from "@/lib/supabase/types";

type Organization = Database["public"]["Tables"]["organizations"]["Row"];
type OrganizationMember = Database["public"]["Tables"]["organization_members"]["Row"];
type AuditEvent = Database["public"]["Tables"]["audit_events"]["Row"];
type Idea = Database["public"]["Tables"]["ideas"]["Row"];
type VentureArtifact = Database["public"]["Tables"]["venture_artifacts"]["Row"];
type TelemetryEvent = Database["public"]["Tables"]["telemetry_events"]["Row"];
type FormState = {
  name: string;
  one_liner: string;
  target_user: string;
  buyer: string;
  signal: string;
  risk_summary: string;
  next_evidence: string;
};

export type ConsoleActionTask = "auth" | "workspace" | "extract" | "idea";
export type ConsoleWorkflowStatus = {
  isAuthLoaded: boolean;
  isAuthenticated: boolean;
  hasWorkspace: boolean;
  hasExtractedIdeas: boolean;
  hasIdeaSource: boolean;
};

type AiExtractIdeasResponse = {
  mode?: string;
  model?: string;
  error?: string;
  candidates?: AiExtractedIdeaCandidate[];
};

type AiGenerateSampleIdeasResponse = {
  mode?: string;
  model?: string;
  error?: string;
  ideas?: AiGeneratedSampleIdea[];
  source?: string;
};

type ExtractionReplaySummary = ExtractionReplaySummaryBase<ExtractedIdea>;

type ExtractionPortfolioItem = ExtractionPortfolioListItem<ExtractedIdea, ExtractionGate, SimilarIdeaMatch>;

const extractionGateStyles: Record<
  ExtractionGateId,
  {
    badge: string;
    panel: string;
    title: string;
    score: string;
  }
> = {
  proceed: {
    badge: "avl-pill avl-pill-success",
    panel: "avl-surface-muted border-emerald-200 bg-emerald-50",
    title: "text-emerald-950",
    score: "bg-slate-950 text-white",
  },
  research: {
    badge: "avl-pill avl-pill-info",
    panel: "avl-surface-muted border-blue-200 bg-blue-50",
    title: "text-blue-950",
    score: "bg-slate-950 text-white",
  },
  pivot: {
    badge: "avl-pill avl-pill-warning",
    panel: "avl-surface-muted border-amber-200 bg-amber-50",
    title: "text-amber-950",
    score: "bg-slate-950 text-white",
  },
  kill: {
    badge: "avl-pill avl-pill-danger",
    panel: "avl-surface-muted border-rose-200 bg-rose-50",
    title: "text-rose-950",
    score: "bg-slate-950 text-white",
  },
};

const emptyForm: FormState = {
  name: "",
  one_liner: "",
  target_user: "",
  buyer: "",
  signal: "",
  risk_summary: "",
  next_evidence: "",
};

export function VentureConsoleActions({
  activeTask: controlledActiveTask,
  onActiveTaskChange,
  onWorkflowStatusChange,
  showSidebar = true,
  embedded = false,
  existingIdeas = [],
}: {
  activeTask?: ConsoleActionTask;
  onActiveTaskChange?: (task: ConsoleActionTask) => void;
  onWorkflowStatusChange?: (status: ConsoleWorkflowStatus) => void;
  showSidebar?: boolean;
  embedded?: boolean;
  existingIdeas?: Idea[];
} = {}) {
  const router = useRouter();
  const supabase = getSupabaseBrowserClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [isAuthLoaded, setIsAuthLoaded] = useState(() => !supabase);
  const [authMessage, setAuthMessage] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [members, setMembers] = useState<OrganizationMember[]>([]);
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>([]);
  const [activeOrganizationId, setActiveOrganizationId] = useState("");
  const [memberEmail, setMemberEmail] = useState("");
  const [memberRole, setMemberRole] = useState<AddableOrganizationRole>("member");
  const [isAuthBusy, setIsAuthBusy] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isWorkspaceBusy, setIsWorkspaceBusy] = useState(false);
  const [isMemberBusy, setIsMemberBusy] = useState(false);
  const [memberActionKey, setMemberActionKey] = useState<string | null>(null);
  const [extractSaveKey, setExtractSaveKey] = useState<string | null>(null);
  const [personalRecordCount, setPersonalRecordCount] = useState(0);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [workspaceMessage, setWorkspaceMessage] = useState<string | null>(null);
  const [rawIdeaSource, setRawIdeaSource] = useState("");
  const [generatedIdeaSlots, setGeneratedIdeaSlots] = useState<GeneratedIdeaSlot[]>([]);
  const [extractedIdeas, setExtractedIdeas] = useState<ExtractedIdea[]>([]);
  const [buildDeliveryPreference, setBuildDeliveryPreference] =
    useState<BuildDeliveryPreference>(defaultBuildDeliveryPreference);
  const [extractionRunMeta, setExtractionRunMeta] = useState<ExtractionRunMeta | null>(null);
  const [extractionReplay, setExtractionReplay] = useState<ExtractionReplaySummary | null>(null);
  const [extractMessage, setExtractMessage] = useState<string | null>(null);
  const [isAiExtracting, setIsAiExtracting] = useState(false);
  const [isGeneratingSample, setIsGeneratingSample] = useState(false);
  const [isReplayingExtraction, setIsReplayingExtraction] = useState(false);
  const [isSavingExtractionReport, setIsSavingExtractionReport] = useState(false);
  const [localActiveTask, setLocalActiveTask] = useState<ConsoleActionTask>("auth");
  const activeTask = controlledActiveTask ?? localActiveTask;
  const showAdvancedExtractionReview = false;
  const hasWorkspace = organizations.length > 0 && Boolean(activeOrganizationId || organizations[0]?.id);
  const trimmedIdeaSource = rawIdeaSource.trim();
  const hasIdeaSourceInput = trimmedIdeaSource.length > 0;
  const filledGeneratedIdeaSlots = generatedIdeaSlots.filter((slot) => slot.idea);
  const hasGeneratedIdeaSlots = filledGeneratedIdeaSlots.length > 0;
  const keptGeneratedIdeaCount = filledGeneratedIdeaSlots.filter((slot) => slot.kept).length;
  const refreshableGeneratedIdeaCount = Math.max(0, filledGeneratedIdeaSlots.length - keptGeneratedIdeaCount);
  const normalizedBuildDeliveryPreference = normalizeBuildDeliveryPreference(buildDeliveryPreference);
  const selectedExternalBuildTool = externalBuildToolProfiles[normalizedBuildDeliveryPreference.externalTool];
  const selectedBuildDeliveryPhrase =
    normalizedBuildDeliveryPreference.mode === "external_tool"
      ? `${selectedExternalBuildTool.label}로 개발합니다`
      : "Venture Lab에서 계속 진행합니다";
  const selectedBuildDeliveryShortLabel =
    normalizedBuildDeliveryPreference.mode === "external_tool" ? selectedExternalBuildTool.label : "Venture Lab 내부";
  const updateActiveTask = useCallback(
    (task: ConsoleActionTask) => {
      setLocalActiveTask(task);
      onActiveTaskChange?.(task);
    },
    [onActiveTaskChange],
  );

  useEffect(() => {
    onWorkflowStatusChange?.({
      isAuthLoaded,
      isAuthenticated: Boolean(user),
      hasWorkspace,
      hasExtractedIdeas: extractedIdeas.length > 0,
      hasIdeaSource: hasIdeaSourceInput,
    });
  }, [extractedIdeas.length, hasIdeaSourceInput, hasWorkspace, isAuthLoaded, onWorkflowStatusChange, user]);

  async function recordTelemetryEvent({
    eventName,
    eventCategory,
    idea,
    organizationId,
    properties = {},
  }: {
    eventName: string;
    eventCategory: string;
    idea?: Idea | null;
    organizationId?: string | null;
    properties?: Record<string, Json>;
  }) {
    if (!supabase || !user) {
      return;
    }

    const { data, error } = await supabase
      .from("telemetry_events")
      .insert(
        buildTelemetryEventInsertRow({
          eventCategory,
          eventName,
          idea,
          organizationId,
          properties,
          userId: user.id,
        }),
      )
      .select()
      .single();

    if (error) {
      console.warn("Failed to record telemetry event", error.message);
      return;
    }

    if (data) {
      emitVentureEvent<TelemetryEvent>("venture:telemetry-created", data);
    }
  }

  const activeOrganization = useMemo(
    () => organizations.find((organization) => organization.id === activeOrganizationId) ?? organizations[0] ?? null,
    [activeOrganizationId, organizations],
  );
  function recordIdeaExtractionTelemetry({
    eventName,
    properties,
    sourceLength,
  }: {
    eventName: "idea_extraction_started" | "idea_extraction_completed";
    properties?: Record<string, Json>;
    sourceLength: number;
  }) {
    void recordTelemetryEvent({
      eventName,
      eventCategory: "extraction",
      organizationId: activeOrganization?.id ?? null,
      properties: {
        source_length: sourceLength,
        ...properties,
      },
    });
  }

  const activeMembership = useMemo(
    () => members.find((member) => member.organization_id === activeOrganization?.id && member.user_id === user?.id) ?? null,
    [activeOrganization?.id, members, user?.id],
  );
  const activeMemberCount = useMemo(
    () => members.filter((member) => member.organization_id === activeOrganization?.id).length,
    [activeOrganization?.id, members],
  );
  const activeMembers = useMemo(
    () => members.filter((member) => member.organization_id === activeOrganization?.id),
    [activeOrganization?.id, members],
  );
  const canManageMembers = activeMembership?.role === "owner" || activeMembership?.role === "admin";
  const ownerCount = useMemo(
    () => activeMembers.filter((member) => member.role === "owner").length,
    [activeMembers],
  );
  const similarIdeaMatches = useMemo(() => {
    return buildExtractionSimilarIdeaMatches(extractedIdeas, existingIdeas, findSimilarIdea);
  }, [existingIdeas, extractedIdeas]);
  const duplicateCandidateCount = similarIdeaMatches.size;
  const extractedIdeaGates = useMemo(() => {
    return buildExtractionGateMap({
      buildGate: buildExtractionGate,
      buildReadiness: buildCandidateReadiness,
      candidates: extractedIdeas,
      similarIdeaMatches,
    });
  }, [extractedIdeas, similarIdeaMatches]);
  const recommendedExtractedIdea = useMemo(
    () => selectRecommendedExtractionCandidate(extractedIdeas, extractedIdeaGates),
    [extractedIdeaGates, extractedIdeas],
  );
  const recommendedExtractionGate = recommendedExtractedIdea
    ? extractedIdeaGates.get(recommendedExtractedIdea.id) ?? null
    : null;
  const recommendedGateStyle = recommendedExtractionGate ? extractionGateStyles[recommendedExtractionGate.id] : null;
  const extractionPortfolioItems = useMemo<ExtractionPortfolioItem[]>(
    () =>
      buildExtractionPortfolioItems({
        buildGate: buildExtractionGate,
        buildReadiness: buildCandidateReadiness,
        candidates: extractedIdeas,
        gatesByCandidateId: extractedIdeaGates,
        similarIdeaMatches,
      }),
    [extractedIdeaGates, extractedIdeas, similarIdeaMatches],
  );
  const recommendedPortfolioItem = useMemo(
    () =>
      recommendedExtractedIdea
        ? extractionPortfolioItems.find((item) => item.candidate.id === recommendedExtractedIdea.id) ?? null
        : null,
    [extractionPortfolioItems, recommendedExtractedIdea],
  );
  const secondaryPortfolioItems = useMemo(
    () => getSecondaryExtractionPortfolioItems(extractionPortfolioItems, recommendedExtractedIdea?.id ?? null),
    [extractionPortfolioItems, recommendedExtractedIdea],
  );
  const bulkSavableExtractionItems = useMemo(
    () => getBulkSavableExtractionItems(extractionPortfolioItems),
    [extractionPortfolioItems],
  );
  const extractionGateCounts = useMemo(
    () => countExtractionPortfolioGates(extractionPortfolioItems),
    [extractionPortfolioItems],
  );
  const extractionPortfolioMarkdownItems = useMemo<ExtractionPortfolioMarkdownItem[]>(
    () => buildExtractionPortfolioMarkdownItems(extractionPortfolioItems, getCandidateStrategyScore),
    [extractionPortfolioItems],
  );
  const extractionDetailItems = useMemo(
    () =>
      buildExtractionDetailItems({
        buildGate: buildExtractionGate,
        buildReadiness: buildCandidateReadiness,
        buildStrategyLens: buildCandidateStrategyLens,
        candidates: extractedIdeas,
        gateStyles: extractionGateStyles,
        gatesByCandidateId: extractedIdeaGates,
        getSourceEvidence: (candidate) => compactText(redactSensitiveSource(candidate.sourceBlock), 360),
        getStrategyScore: getCandidateStrategyScore,
        similarIdeaMatches,
      }),
    [extractedIdeaGates, extractedIdeas, similarIdeaMatches],
  );
  const extractionPortfolioMarkdown = useMemo(
    () =>
      buildExtractionPortfolioReviewMarkdown({
        items: extractionPortfolioMarkdownItems,
        replaySummary: extractionReplay,
      }),
    [extractionPortfolioMarkdownItems, extractionReplay],
  );
  const manualFormProductSurface = useMemo(() => {
    const hasFormInput = Object.values(form).some((value) => value.trim().length > 0);

    if (!hasFormInput) {
      return null;
    }

    return inferProductSurface({
      name: form.name,
      one_liner: form.one_liner,
      target_user: form.target_user,
      buyer: form.buyer,
      signal: form.signal,
      risk_summary: form.risk_summary,
      next_evidence: form.next_evidence,
    });
  }, [form]);
  const consoleTasks: VentureConsoleStartGuideTask[] = [
    {
      id: "auth",
      label: "로그인",
      description: "관리자 계정으로 로그인합니다.",
      status: user ? "완료" : "필수",
    },
    {
      id: "workspace",
      label: "협업 설정",
      description: "함께 볼 기록 범위를 정합니다.",
      status: activeOrganization ? "연결" : "선택",
    },
    {
      id: "extract",
      label: "아이디어 도출",
      description: "대화와 메모에서 검토할 아이디어를 정리합니다.",
      status: extractedIdeas.length > 0 ? `${extractedIdeas.length}개` : "입력 대기",
    },
    {
      id: "idea",
      label: "아이디어 저장",
      description: "검증 대상으로 등록합니다.",
      status: user ? "저장" : "로그인 필요",
    },
  ];

  const loadPersonalRecordCount = useCallback(
    async (operator: User | null) => {
      if (!supabase || !operator) {
        setPersonalRecordCount(0);
        return;
      }

      const results = await Promise.all(
        workspaceRecordTables.map((table) =>
          supabase
            .from(table)
            .select("id", { count: "exact", head: true })
            .eq("created_by", operator.id)
            .is("organization_id", null),
        ),
      );

      setPersonalRecordCount(results.reduce((sum, result) => sum + (result.count ?? 0), 0));
    },
    [supabase],
  );

  const loadAuditEvents = useCallback(
    async (organizationId: string) => {
      if (!supabase || !organizationId) {
        setAuditEvents([]);
        return;
      }

      const { data, error } = await supabase
        .from("audit_events")
        .select("*")
        .eq("organization_id", organizationId)
        .order("created_at", { ascending: false })
        .limit(6);

      if (error) {
        setWorkspaceMessage(error.message);
        return;
      }

      setAuditEvents(data ?? []);
    },
    [supabase],
  );
  const loadWorkspaceData = useCallback(async (operator: User | null, preferredOrganizationId = "") => {
    if (!supabase || !operator) {
      setOrganizations([]);
      setMembers([]);
      setAuditEvents([]);
      setActiveOrganizationId("");
      setPersonalRecordCount(0);
      return;
    }

    const [organizationsResult, membersResult] = await Promise.all([
      supabase.from("organizations").select("*").order("created_at", { ascending: true }),
      supabase.from("organization_members").select("*").order("created_at", { ascending: true }),
    ]);

    if (organizationsResult.error || membersResult.error) {
      setWorkspaceMessage(
        organizationsResult.error?.message ?? membersResult.error?.message ?? "워크스페이스 데이터를 불러오지 못했습니다.",
      );
      return;
    }

    const nextOrganizations = organizationsResult.data ?? [];
    const nextMembers = membersResult.data ?? [];
    const nextActiveId = preferredOrganizationId || nextOrganizations[0]?.id || "";

    setOrganizations(nextOrganizations);
    setMembers(nextMembers);
    setActiveOrganizationId(nextActiveId);

    if (!nextActiveId) {
      setAuditEvents([]);
      await loadPersonalRecordCount(operator);
      return;
    }

    await loadAuditEvents(nextActiveId);
    await loadPersonalRecordCount(operator);
  }, [loadAuditEvents, loadPersonalRecordCount, supabase]);

  useEffect(() => {
    const browserLocation = getBrowserLocationSnapshot();
    const callbackState = readAuthCallbackErrorState(browserLocation);

    if (!callbackState) {
      return;
    }

    const callbackMessage = formatAuthCallbackMessage(callbackState.error, callbackState.description);
    replaceBrowserHistoryUrl(callbackState.nextUrl);

    const messageTimer = scheduleBrowserTimeout(() => {
      setAuthMessage(callbackMessage);
    });

    return () => {
      clearBrowserTimeout(messageTimer);
    };
  }, []);

  useEffect(() => {
    if (!supabase) {
      return;
    }

    const browserLocation = getBrowserLocationSnapshot();
    const codeState = readMagicLinkCodeState(browserLocation);

    if (!codeState) {
      return;
    }

    const supabaseClient = supabase;
    const authCode = codeState.code;

    replaceBrowserHistoryUrl(codeState.nextUrl);

    const exchangeTimer = scheduleBrowserTimeout(() => {
      async function completeRootMagicLink() {
        setIsAuthBusy(true);
        setAuthMessage("이메일 로그인 링크를 확인하는 중입니다...");

        const { data, error } = await supabaseClient.auth.exchangeCodeForSession(authCode);

        setIsAuthBusy(false);

        if (error) {
          setAuthMessage(formatAuthCallbackMessage("callback_exchange_failed", error.message));
          return;
        }

        const nextUser = data.user ?? null;

        setUser(nextUser);
        if (nextUser) {
          updateActiveTask("extract");
        }
        setAuthMessage("로그인되었습니다. 바로 아이디어 도출부터 이어가면 됩니다. 협업이 필요하면 나중에 팀 공간을 열 수 있습니다.");
        await loadWorkspaceData(nextUser);
        router.refresh();
      }

      void completeRootMagicLink();
    });

    return () => {
      clearBrowserTimeout(exchangeTimer);
    };
  }, [loadWorkspaceData, router, supabase, updateActiveTask]);

  useEffect(() => {
    if (!supabase) {
      return;
    }

    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setIsAuthLoaded(true);
      updateActiveTask(data.user ? "extract" : "auth");
      void loadWorkspaceData(data.user);
    });

    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      const nextUser = session?.user ?? null;
      setIsAuthLoaded(true);
      setUser(nextUser);

      if (!nextUser) {
        updateActiveTask("auth");
      } else if (event === "SIGNED_IN" || event === "INITIAL_SESSION") {
        updateActiveTask("extract");
      }

      void loadWorkspaceData(nextUser);
      router.refresh();
    });

    return () => {
      data.subscription.unsubscribe();
    };
  }, [loadWorkspaceData, router, supabase, updateActiveTask]);

  async function handleEmailLinkSignIn() {
    setAuthMessage(null);

    if (!supabase) {
      setAuthMessage("로그인 환경 설정을 찾을 수 없습니다. 관리자에게 배포 설정 확인을 요청하세요.");
      return;
    }

    if (!email.trim()) {
      setAuthMessage("이메일 주소를 먼저 입력하세요.");
      return;
    }

    setIsAuthBusy(true);
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: buildWorkspaceEmailRedirectUrl(getBrowserLocationSnapshot().origin),
      },
    });
    setIsAuthBusy(false);

    if (error) {
      setAuthMessage(formatAuthError(error.message));
      return;
    }

    setAuthMessage("로그인 링크를 보냈습니다. 이메일의 링크를 열고 돌아오면 이 카드에 로그인 상태가 표시됩니다.");
  }

  async function handlePasswordSignIn(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    setAuthMessage(null);

    if (!supabase) {
      setAuthMessage("로그인 환경 설정을 찾을 수 없습니다. 관리자에게 배포 설정 확인을 요청하세요.");
      return;
    }

    if (!email.trim() || !password) {
      setAuthMessage("관리자가 만든 계정의 이메일과 비밀번호를 모두 입력하세요.");
      return;
    }

    setIsAuthBusy(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setIsAuthBusy(false);

    if (error) {
      setAuthMessage(formatAuthError(error.message));
      return;
    }

    setPassword("");
    updateActiveTask("extract");
    setAuthMessage("로그인되었습니다. 바로 아이디어 도출부터 이어가면 됩니다. 협업이 필요하면 팀 공간을 나중에 연결하면 됩니다.");
    router.refresh();
  }

  async function handleSignOut() {
    if (!supabase) {
      return;
    }

    setIsAuthBusy(true);
    await supabase.auth.signOut();
    setIsAuthBusy(false);
    updateActiveTask("auth");
    setAuthMessage("로그아웃되었습니다.");
  }

  async function handleCreateWorkspace() {
    setWorkspaceMessage(null);

    if (!supabase || !user) {
      setWorkspaceMessage("워크스페이스를 만들려면 먼저 로그인하세요.");
      return;
    }

    setIsWorkspaceBusy(true);
    const { data, error } = await supabase
      .from("organizations")
      .insert(buildDefaultWorkspaceInsertRow({ userId: user.id }))
      .select()
      .single();
    setIsWorkspaceBusy(false);

    if (error) {
      setWorkspaceMessage(formatWorkspaceError(error.message));
      return;
    }

    setActiveOrganizationId(data.id);
    setWorkspaceMessage("협업 공간을 만들었습니다. 필요할 때만 팀으로 같이 보면 됩니다. 이제 아이디어 도출로 돌아갑니다.");
    await loadWorkspaceData(user, data.id);
    updateActiveTask("extract");
  }

  async function handleAttachPersonalRecords() {
    setWorkspaceMessage(null);

    if (!supabase || !user || !activeOrganization) {
      setWorkspaceMessage("워크스페이스를 먼저 만들거나 선택하세요.");
      return;
    }

    setIsWorkspaceBusy(true);
    const results = await Promise.all(
      workspaceRecordTables.map((table) =>
        supabase
          .from(table)
          .update(buildAttachPersonalRecordsPatch({ organizationId: activeOrganization.id }))
          .eq("created_by", user.id)
          .is("organization_id", null),
      ),
    );
    setIsWorkspaceBusy(false);

    const error = results.find((result) => result.error)?.error;

    if (error) {
      setWorkspaceMessage(error.message);
      return;
    }

    setWorkspaceMessage(`${personalRecordCount}개의 개인 기록을 ${activeOrganization.name} 협업 공간에 연결했습니다.`);
    await loadWorkspaceData(user, activeOrganization.id);
    router.refresh();
  }

  async function handleSelectWorkspace(organizationId: string) {
    setActiveOrganizationId(organizationId);
    await loadAuditEvents(organizationId);
    setWorkspaceMessage("협업 공간을 선택했습니다. 이제 아이디어 도출을 계속 진행하면 됩니다.");
    updateActiveTask("extract");
  }

  async function handleAddMember(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setWorkspaceMessage(null);

    if (!supabase || !user || !activeOrganization) {
      setWorkspaceMessage("워크스페이스를 먼저 선택하세요.");
      return;
    }

    if (!canManageMembers) {
      setWorkspaceMessage("워크스페이스 소유자와 관리자만 멤버를 추가할 수 있습니다.");
      return;
    }

    if (!memberEmail.trim()) {
      setWorkspaceMessage("멤버 이메일을 입력하세요.");
      return;
    }

    setIsMemberBusy(true);
    const { error } = await supabase.rpc(
      "add_organization_member_by_email",
      buildAddOrganizationMemberParams({
        email: memberEmail,
        organizationId: activeOrganization.id,
        role: memberRole,
      }),
    );
    setIsMemberBusy(false);

    if (error) {
      setWorkspaceMessage(error.message);
      return;
    }

    setMemberEmail("");
    setWorkspaceMessage("워크스페이스 멤버를 추가했습니다.");
    await loadWorkspaceData(user, activeOrganization.id);
  }

  async function handleUpdateMemberRole(member: OrganizationMember, role: AddableOrganizationRole) {
    setWorkspaceMessage(null);

    if (!supabase || !user || !activeOrganization) {
      setWorkspaceMessage("워크스페이스를 먼저 선택하세요.");
      return;
    }

    setMemberActionKey(`${member.user_id}:role:${role}`);
    const { error } = await supabase.rpc(
      "update_organization_member_role",
      buildUpdateOrganizationMemberRoleParams({
        organizationId: activeOrganization.id,
        role,
        userId: member.user_id,
      }),
    );
    setMemberActionKey(null);

    if (error) {
      setWorkspaceMessage(error.message);
      return;
    }

    setWorkspaceMessage("멤버 역할을 변경했습니다.");
    await loadWorkspaceData(user, activeOrganization.id);
  }

  async function handleRemoveMember(member: OrganizationMember) {
    setWorkspaceMessage(null);

    if (!supabase || !user || !activeOrganization) {
      setWorkspaceMessage("워크스페이스를 먼저 선택하세요.");
      return;
    }

    setMemberActionKey(`${member.user_id}:remove`);
    const { error } = await supabase.rpc(
      "remove_organization_member",
      buildRemoveOrganizationMemberParams({
        organizationId: activeOrganization.id,
        userId: member.user_id,
      }),
    );
    setMemberActionKey(null);

    if (error) {
      setWorkspaceMessage(error.message);
      return;
    }

    setWorkspaceMessage("멤버를 제거했습니다.");
    await loadWorkspaceData(user, activeOrganization.id);
  }

  async function handleCreateIdea(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaveMessage(null);

    if (!supabase) {
      setSaveMessage("저장소가 설정되어 있지 않습니다.");
      return;
    }

    if (!user) {
      setSaveMessage("아이디어를 저장하려면 먼저 로그인하세요.");
      return;
    }

    if (!form.name.trim() || !form.one_liner.trim()) {
      setSaveMessage("아이디어 이름과 한 줄 설명은 필수입니다.");
      return;
    }

    setIsSaving(true);
    const manualProductSurface = inferProductSurface({
      name: form.name,
      one_liner: form.one_liner,
      target_user: form.target_user,
      buyer: form.buyer,
      signal: form.signal,
      risk_summary: form.risk_summary,
      next_evidence: form.next_evidence,
    });
    const ideaInsertPayload = buildManualIdeaInsertRow({
      form,
      organizationId: activeOrganization?.id ?? null,
      productSurfaceKey: manualProductSurface.key,
    });
    let ideaInsertResult = await supabase
      .from("ideas")
      .insert(ideaInsertPayload)
      .select()
      .single();

    if (isMissingProductSurfaceColumnError(ideaInsertResult.error)) {
      ideaInsertResult = await supabase
        .from("ideas")
        .insert(omitProductSurface(ideaInsertPayload))
        .select()
        .single();
    }

    const { data, error } = ideaInsertResult;
    setIsSaving(false);

    if (error) {
      setSaveMessage(error.message);
      return;
    }

    setForm(emptyForm);
    if (data) {
      emitVentureEvent<Idea>("venture:idea-created", data);
      const { data: manualArtifact } = await supabase
        .from("venture_artifacts")
        .insert(
          buildManualIdeaDirectionArtifactRowFromProfiles({
            buildDeliveryPreference,
            idea: data,
            productSurface: manualProductSurface,
          }),
        )
        .select()
        .single();
      if (manualArtifact) {
        emitVentureEvent<VentureArtifact>("venture:artifact-created", manualArtifact);
      }
      void recordTelemetryEvent({
        eventName: "idea_created",
        eventCategory: "intake",
        idea: data,
        properties: {
          source: "manual",
          has_workspace: Boolean(data.organization_id),
          product_surface: manualProductSurface.key,
          filled_field_count: Object.values(form).filter((value) => value.trim()).length,
        },
      });
    }
    setSaveMessage(
      activeOrganization
        ? `${activeOrganization.name}에 아이디어를 저장했습니다. 실행 보드에 바로 반영했습니다.`
        : "개인 기록으로 아이디어를 저장했습니다. 워크스페이스를 만들면 이후 기록을 연결할 수 있습니다.",
    );
    await loadPersonalRecordCount(user);
    await loadWorkspaceData(user, activeOrganization?.id ?? "");
    router.refresh();
  }

  function toggleGeneratedIdeaKeep(slotId: string) {
    setGeneratedIdeaSlots((currentSlots) =>
      currentSlots.map((slot) => (slot.id === slotId ? { ...slot, kept: !slot.kept } : slot)),
    );
  }

  async function handleGenerateSampleIdeas({ preserveKept = false }: { preserveKept?: boolean } = {}) {
    const currentGeneratedIdeas = generatedIdeaSlots
      .map((slot) => slot.idea)
      .filter((idea): idea is AiGeneratedSampleIdea => Boolean(idea));
    const keptIdeas = generatedIdeaSlots
      .filter((slot) => slot.kept && slot.idea)
      .map((slot) => slot.idea as AiGeneratedSampleIdea);
    const replaceCount = preserveKept && hasGeneratedIdeaSlots ? refreshableGeneratedIdeaCount : 3;

    if (preserveKept && hasGeneratedIdeaSlots && replaceCount === 0) {
      setExtractMessage("세 후보가 모두 킵되어 바꿀 자리가 없습니다. 새로 보고 싶은 후보의 킵을 먼저 해제하세요.");
      return;
    }

    setIsGeneratingSample(true);
    setExtractedIdeas([]);
    setExtractionRunMeta(null);
    setExtractionReplay(null);
    setExtractMessage(
      preserveKept && hasGeneratedIdeaSlots
        ? `킵한 후보 ${keptIdeas.length}개는 유지하고 ${replaceCount}개 후보를 새로 도출하는 중입니다.`
        : "AI가 검토할 아이디어 후보 3개를 도출하는 중입니다.",
    );

    if (!preserveKept) {
      setGeneratedIdeaSlots([]);
    }

    try {
      const { payload, response } = await fetchApiJson<AiGenerateSampleIdeasResponse>({
        fallback: {},
        init: buildJsonPostRequestInit(
          buildGenerateSampleIdeasRequestPayload({
            generatedIdeas: currentGeneratedIdeas,
            savedIdeas: existingIdeas,
          }),
        ),
        input: getGenerateSampleIdeasUrl(),
      });

      if (!response.ok || !payload.source) {
        setExtractMessage(payload.error ?? `AI 아이디어 도출에 실패했습니다. HTTP ${response.status}`);
        return;
      }

      const nextSlots = mergeGeneratedIdeaSlots({
        currentSlots: generatedIdeaSlots,
        generatedIdeas: payload.ideas ?? [],
        preserveKept,
      });
      const nextSource = buildGeneratedIdeaSourceFromSlots(nextSlots) || payload.source;

      setGeneratedIdeaSlots(nextSlots);
      setRawIdeaSource(nextSource);
      setExtractMessage(
        preserveKept && hasGeneratedIdeaSlots
          ? `킵한 후보 ${keptIdeas.length}개를 유지하고 ${replaceCount}개 후보를 새로 채웠습니다. 마음에 드는 후보는 계속 킵하세요.`
          : `AI가 ${payload.ideas?.length ?? 3}개 아이디어 후보를 도출했습니다. 좋은 후보는 킵하고, 더 보고 싶으면 다른 후보 더 확인하기를 누르세요.`,
      );
    } catch (error) {
      setExtractMessage(
        `AI 아이디어 도출 중 오류가 발생했습니다. ${error instanceof Error ? error.message : ""}`.trim(),
      );
    } finally {
      setIsGeneratingSample(false);
    }
  }

  async function handleAiExtractIdeas() {
    const source = rawIdeaSource.trim();

    if (!source) {
      setExtractMessage("대화 내용이나 메모를 먼저 붙여넣으세요.");
      setGeneratedIdeaSlots([]);
      setExtractedIdeas([]);
      setExtractionRunMeta(null);
      setExtractionReplay(null);
      return;
    }

    setExtractionReplay(null);
    setIsAiExtracting(true);
    setExtractMessage("AI가 메모를 살펴보고 아이디어를 정리하는 중입니다. 문제가 생기면 기본 방식으로 계속 진행합니다.");
    recordIdeaExtractionTelemetry({
      eventName: "idea_extraction_started",
      sourceLength: source.length,
      properties: {
        existing_idea_count: existingIdeas.length,
      },
    });

    try {
      const { payload, response } = await fetchApiJson<AiExtractIdeasResponse>({
        fallback: {},
        init: buildJsonPostRequestInit(buildExtractIdeasRequestPayload({ source, savedIdeas: existingIdeas })),
        input: getExtractIdeasUrl(),
      });

      if (!response.ok || !payload.candidates?.length) {
        const fallbackIdeas = extractIdeasFromText(source);
        setExtractedIdeas(fallbackIdeas);
        setExtractionRunMeta(
          createExtractionRunMeta({
            engine: "fallback",
            model: payload.model ?? null,
            sourceLength: source.length,
            candidateCount: fallbackIdeas.length,
            note: payload.error ?? `OpenAI HTTP ${response.status} 이후 기본 방식으로 계속 진행했습니다.`,
          }),
        );
        setExtractMessage(
          fallbackIdeas.length > 0
            ? `AI 정리를 끝까지 사용할 수 없어 기본 방식으로 ${fallbackIdeas.length}개 아이디어를 정리했습니다. 사유: ${
                payload.error ?? `HTTP ${response.status}`
              }`
            : `AI 정리를 끝까지 사용할 수 없었고 기본 방식으로도 아이디어를 찾지 못했습니다. 사유: ${
                payload.error ?? `HTTP ${response.status}`
              }`,
        );
        recordIdeaExtractionTelemetry({
          eventName: "idea_extraction_completed",
          sourceLength: source.length,
          properties: {
            engine: "fallback",
            model: payload.model ?? "none",
            candidate_count: fallbackIdeas.length,
            fallback_reason: payload.error ? "api_error" : `http_${response.status}`,
          },
        });
        return;
      }

      const aiIdeas = hydrateAiExtractedIdeas(source, payload.candidates);
      setExtractedIdeas(aiIdeas);
      setExtractionRunMeta(
        createExtractionRunMeta({
          engine: "openai",
          model: payload.model ?? "OpenAI",
          sourceLength: source.length,
          candidateCount: aiIdeas.length,
          note: "AI가 메모에서 아이디어를 정리했습니다.",
        }),
      );
      setExtractMessage(
        `${aiIdeas.length}개 아이디어를 정리했습니다. 추천 아이디어의 결과물 형태, 검증 판단, 중복 가능성을 확인하세요.`,
      );
      recordIdeaExtractionTelemetry({
        eventName: "idea_extraction_completed",
        sourceLength: source.length,
        properties: {
          engine: "openai",
          model: payload.model ?? "OpenAI",
          candidate_count: aiIdeas.length,
        },
      });
    } catch (error) {
      const fallbackIdeas = extractIdeasFromText(source);
      setExtractedIdeas(fallbackIdeas);
      setExtractionRunMeta(
        createExtractionRunMeta({
          engine: "fallback",
          model: null,
          sourceLength: source.length,
          candidateCount: fallbackIdeas.length,
          note: `AI 정리 중 오류가 발생해 기본 방식으로 계속 진행했습니다. ${
            error instanceof Error ? error.message : ""
          }`,
        }),
      );
      setExtractMessage(
        fallbackIdeas.length > 0
          ? `AI 정리 중 오류가 발생해 기본 방식으로 ${fallbackIdeas.length}개 아이디어를 정리했습니다. ${
              error instanceof Error ? error.message : ""
            }`
          : `AI 정리 중 오류가 발생했고 기본 방식으로도 아이디어를 찾지 못했습니다. ${
              error instanceof Error ? error.message : ""
            }`,
      );
      recordIdeaExtractionTelemetry({
        eventName: "idea_extraction_completed",
        sourceLength: source.length,
        properties: {
          engine: "fallback",
          model: "none",
          candidate_count: fallbackIdeas.length,
          fallback_reason: "request_error",
          error_type: error instanceof Error ? error.name : "unknown",
        },
      });
    } finally {
      setIsAiExtracting(false);
    }
  }

  async function handleReplayExtractionComparison() {
    const source = rawIdeaSource.trim();

    if (!source) {
      setExtractMessage("점검할 대화 내용이나 메모를 먼저 붙여넣으세요.");
      setExtractedIdeas([]);
      setExtractionRunMeta(null);
      setExtractionReplay(null);
      return;
    }

    setIsReplayingExtraction(true);
    setExtractMessage("같은 메모를 기본 기준과 AI 결과로 다시 비교해 빠진 아이디어나 과한 해석이 없는지 점검하는 중입니다.");

    try {
      const rulesIdeas = extractIdeasFromText(source);
      let aiIdeas: ExtractedIdea[] = [];
      let aiMode: ExtractionReplayMode = "unavailable";
      let model: string | null = null;
      let replayNote = "AI 추출을 사용할 수 없어 내부 기준 결과만 점검했습니다.";

      try {
        const { payload, response } = await fetchApiJson<AiExtractIdeasResponse>({
          fallback: {},
          init: buildJsonPostRequestInit(buildExtractIdeasRequestPayload({ source, savedIdeas: existingIdeas })),
          input: getExtractIdeasUrl(),
        });

        model = payload.model ?? null;

        if (response.ok && payload.candidates?.length) {
          aiIdeas = hydrateAiExtractedIdeas(source, payload.candidates);
          aiMode = payload.mode === "openai" ? "openai" : "fallback";
          replayNote = `${payload.model ?? "OpenAI"} 결과와 내부 기준 추출을 비교했습니다.`;
        } else {
          replayNote = payload.error ?? `AI 추출 HTTP ${response.status}로 내부 기준 결과만 비교했습니다.`;
        }
      } catch (error) {
        replayNote = `AI 추출 요청 중 오류가 발생해 내부 기준 결과만 비교했습니다. ${
          error instanceof Error ? error.message : ""
        }`;
      }

      const replaySummary = buildExtractionReplaySummary({
        sourceLength: source.length,
        rulesIdeas,
        aiIdeas,
        aiMode,
        findBestCandidateMatch,
        model,
        note: replayNote,
      });
      const replayCandidates = replaySummary.items.map((item) => item.primaryCandidate).slice(0, 8);
      const nextIdeas = replayCandidates.length > 0 ? replayCandidates : rulesIdeas;

      setExtractedIdeas(nextIdeas);
      setExtractionReplay(replaySummary);
      setExtractionRunMeta(
        createExtractionRunMeta({
          engine: aiIdeas.length > 0 ? "openai" : "fallback",
          model,
          sourceLength: source.length,
          candidateCount: nextIdeas.length,
          note: `AI 정리 다시 보기 완료: 공통 ${replaySummary.consensusCount}개, AI 단독 ${replaySummary.aiOnlyCount}개, 기준 추출 단독 ${replaySummary.rulesOnlyCount}개.`,
        }),
      );
      setExtractMessage(
        nextIdeas.length > 0
          ? `AI 정리 다시 보기 완료. 공통 ${replaySummary.consensusCount}개, AI 단독 ${replaySummary.aiOnlyCount}개, 기준 추출 단독 ${replaySummary.rulesOnlyCount}개 아이디어를 비교했습니다.`
          : "다시 확인했지만 아이디어를 찾지 못했습니다. 원문에 아이디어, 문제, 솔루션 단서를 더 넣어보세요.",
      );
    } finally {
      setIsReplayingExtraction(false);
    }
  }

  async function copyExtractionPortfolio() {
    if (extractionPortfolioItems.length === 0) {
      setExtractMessage("복사할 아이디어 비교 요약이 없습니다. 먼저 아이디어를 찾아 주세요.");
      return;
    }

    if (await copyBrowserText(extractionPortfolioMarkdown)) {
      setExtractMessage("아이디어 비교 실행 요약을 클립보드에 복사했습니다.");
    }
  }

  async function saveExtractionPortfolioReport() {
    if (extractionPortfolioItems.length === 0) {
      setExtractMessage("저장할 아이디어 비교 리포트가 없습니다. 먼저 아이디어를 찾아 주세요.");
      return;
    }

    if (!supabase) {
      setExtractMessage("저장소가 설정되어 있지 않습니다.");
      return;
    }

    if (!user) {
      setExtractMessage("아이디어 정리 리포트를 저장하려면 먼저 로그인하세요.");
      return;
    }

    setIsSavingExtractionReport(true);
    setExtractMessage(null);

    const { data, error } = await supabase
      .from("venture_artifacts")
      .insert(
        buildExtractionPortfolioReportArtifactRow({
          items: extractionPortfolioMarkdownItems,
          organizationId: activeOrganization?.id ?? null,
          organizationName: activeOrganization?.name ?? null,
          replaySummary: extractionReplay,
          runMeta: extractionRunMeta,
          sourceExcerpt: redactSensitiveSource(rawIdeaSource).trim().slice(0, 4000),
          sourceLength: rawIdeaSource.length,
        }),
      )
      .select()
      .single();

    setIsSavingExtractionReport(false);

    if (error) {
      setExtractMessage(error.message);
      return;
    }

    emitVentureEvent("venture:artifact-created", data);
    setExtractMessage("아이디어 정리 리포트를 제작 자료로 저장했습니다. 최근 리포트에서 다시 복사할 수 있습니다.");
    await loadPersonalRecordCount(user);
    await loadWorkspaceData(user, activeOrganization?.id ?? "");
    router.refresh();
  }

  function updateExtractedIdeaProductSurface(candidateId: string, surfaceKey: ProductSurfaceKey) {
    const nextSurface = productSurfaceProfiles[surfaceKey];

    setExtractedIdeas((currentIdeas) =>
      currentIdeas.map((candidate) =>
        candidate.id === candidateId
          ? {
              ...candidate,
              productSurface: nextSurface,
            }
          : candidate,
      ),
    );
    setExtractMessage(`${nextSurface.label} 기준으로 제작 패키지 방향을 바꿨습니다. 저장하면 이 기준이 다음 단계까지 이어집니다.`);
  }

  function loadExtractedIdea(candidate: ExtractedIdea) {
    setForm({
      name: candidate.name,
      one_liner: candidate.one_liner,
      target_user: candidate.target_user,
      buyer: candidate.buyer,
      signal: `${candidate.signal}\n\n핵심 가설\n- ${candidate.assumptions.join("\n- ")}`,
      risk_summary: `${candidate.risk_summary}\n\n리스크 등급: ${candidate.riskLevel}\n중단 기준\n${candidate.killCriteria}`,
      next_evidence: `결과물 형태\n${candidate.productSurface.label}: ${candidate.productSurface.harnessFocus}\n\n7일 검증 계획\n${candidate.sevenDayExperiment}\n\n검증 질문\n- ${candidate.validationQuestions.join(
        "\n- ",
      )}\n\n첫 제작 범위\n${candidate.firstPrototypeScope}\n\n가격/구매 가설\n${candidate.pricingHypothesis}`,
    });
    setSaveMessage(`'${candidate.name}' 아이디어를 검증 메모까지 포함해 입력 폼에 채웠습니다. 검토 후 저장하세요.`);
    updateActiveTask("idea");
  }

  async function createExtractedIdeaPackage(
    candidate: ExtractedIdea,
    extractionGate: ExtractionGate,
    deliveryPreference: BuildDeliveryPreference = normalizedBuildDeliveryPreference,
  ) {
    if (!supabase) {
      throw new Error("저장소가 설정되어 있지 않습니다.");
    }

    const organizationId = activeOrganization?.id ?? null;
    const extractedIdeaInsertPayload = buildExtractedIdeaInsertRow({
      candidate,
      extractionGate,
      organizationId,
    });
    let extractedIdeaInsertResult = await supabase
      .from("ideas")
      .insert(extractedIdeaInsertPayload)
      .select()
      .single();

    if (isMissingProductSurfaceColumnError(extractedIdeaInsertResult.error)) {
      extractedIdeaInsertResult = await supabase
        .from("ideas")
        .insert(omitProductSurface(extractedIdeaInsertPayload))
        .select()
        .single();
    }

    const { data: idea, error: ideaError } = extractedIdeaInsertResult;

    if (ideaError || !idea) {
      throw new Error(ideaError?.message ?? "아이디어를 저장하지 못했습니다.");
    }

    const [riskResult, experimentResult, artifactResult] = await Promise.all([
      supabase
        .from("risks")
        .insert(buildExtractedIdeaRiskRow({ candidate, ideaId: idea.id, organizationId }))
        .select()
        .single(),
      supabase
        .from("experiments")
        .insert(buildExtractedIdeaExperimentRow({ candidate, ideaId: idea.id, organizationId }))
        .select()
        .single(),
      supabase
        .from("venture_artifacts")
        .insert(
          buildExtractedIdeaPackageArtifactRows({
            buildDeliveryPreference: deliveryPreference,
            candidate,
            extractionGate,
            ideaId: idea.id,
            organizationId,
          }),
        )
        .select(),
    ]);

    emitVentureEvent<Idea & { autoOpenWorkbench: true }>("venture:idea-created", {
      ...idea,
      autoOpenWorkbench: true,
    });
    if (riskResult.data) {
      emitVentureEvent("venture:risk-created", riskResult.data);
    }
    if (experimentResult.data) {
      emitVentureEvent("venture:experiment-created", experimentResult.data);
    }
    if (artifactResult.data) {
      for (const artifact of artifactResult.data as VentureArtifact[]) {
        emitVentureEvent("venture:artifact-created", artifact);
      }
    }
    void recordTelemetryEvent({
      eventName: "idea_package_created",
      eventCategory: "extraction",
      idea,
      organizationId,
      properties: {
        gate: extractionGate.id,
        validation_score: candidate.validationScore,
        product_surface: candidate.productSurface.key,
        build_delivery_mode: deliveryPreference.mode,
        external_build_tool: deliveryPreference.mode === "external_tool" ? deliveryPreference.externalTool : "none",
        risk_created: Boolean(riskResult.data),
        experiment_created: Boolean(experimentResult.data),
        artifact_count: artifactResult.data?.length ?? 0,
      },
    });

    return {
      idea,
      artifactCount: artifactResult.data?.length ?? 0,
      partialError: riskResult.error?.message ?? experimentResult.error?.message ?? artifactResult.error?.message ?? null,
    };
  }

  async function saveExtractedIdeaPackage(candidate: ExtractedIdea) {
    setExtractMessage(null);

    if (!supabase) {
      setExtractMessage("저장소가 설정되어 있지 않습니다.");
      return;
    }

    if (!user) {
      setExtractMessage("아이디어를 저장하려면 먼저 로그인하세요.");
      return;
    }

    setExtractSaveKey(candidate.id);
    const similarIdea = similarIdeaMatches.get(candidate.id) ?? null;
    const readinessChecks = buildCandidateReadiness(candidate, similarIdea);
    const extractionGate = buildExtractionGate(candidate, readinessChecks, similarIdea);

    try {
      const result = await createExtractedIdeaPackage(candidate, extractionGate);

      setExtractMessage(
        buildSingleExtractionSaveMessage({
          artifactCount: result.artifactCount,
          candidateName: candidate.name,
          partialError: result.partialError,
        }),
      );
    } catch (error) {
      setExtractMessage(error instanceof Error ? error.message : "아이디어를 검증 자료로 저장하지 못했습니다.");
    }

    setExtractSaveKey(null);
    await loadPersonalRecordCount(user);
    await loadWorkspaceData(user, activeOrganization?.id ?? "");
  }

  async function saveBulkExtractedIdeaPackages() {
    setExtractMessage(null);

    if (!supabase) {
      setExtractMessage("저장소가 설정되어 있지 않습니다.");
      return;
    }

    if (!user) {
      setExtractMessage("아이디어를 저장하려면 먼저 로그인하세요.");
      return;
    }

    if (bulkSavableExtractionItems.length === 0) {
      setExtractMessage("일괄 저장할 진행/추가 조사 아이디어가 없습니다. 중복 아이디어나 준비도 70% 미만 아이디어는 제외됩니다.");
      return;
    }

    setExtractSaveKey("bulk");
    const savedNames: string[] = [];
    const partialErrors: string[] = [];

    for (const item of bulkSavableExtractionItems) {
      try {
        const result = await createExtractedIdeaPackage(item.candidate, item.gate);
        savedNames.push(item.candidate.name);

        if (result.partialError) {
          partialErrors.push(`${item.candidate.name}: ${result.partialError}`);
        }
      } catch (error) {
        partialErrors.push(`${item.candidate.name}: ${error instanceof Error ? error.message : "저장 실패"}`);
      }
    }

    setExtractSaveKey(null);
    setExtractMessage(
      buildBulkExtractionSaveMessage({
        partialErrors,
        savedNames,
      }),
    );
    await loadPersonalRecordCount(user);
    await loadWorkspaceData(user, activeOrganization?.id ?? "");
  }

  return (
    <section className={showSidebar ? "grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]" : embedded ? "grid gap-5" : "grid gap-6"}>
      {showSidebar ? (
        <VentureConsoleStartGuide activeTask={activeTask} onTaskSelect={updateActiveTask} tasks={consoleTasks} />
      ) : null}

      <div className="grid min-w-0 gap-6">
        <VentureConsoleAuthCard
          activeTask={activeTask}
          authMessage={authMessage}
          email={email}
          isAuthBusy={isAuthBusy}
          isAuthLoaded={isAuthLoaded}
          onEmailChange={setEmail}
          onEmailLinkSignIn={handleEmailLinkSignIn}
          onPasswordChange={setPassword}
          onPasswordSignIn={handlePasswordSignIn}
          onSignOut={handleSignOut}
          password={password}
          user={user}
        />

        <VentureConsoleWorkspaceCard
          activeMemberCount={activeMemberCount}
          activeMembers={activeMembers}
          activeMembership={activeMembership}
          activeOrganization={activeOrganization}
          activeTask={activeTask}
          auditEvents={auditEvents}
          canManageMembers={canManageMembers}
          isMemberBusy={isMemberBusy}
          isWorkspaceBusy={isWorkspaceBusy}
          memberActionKey={memberActionKey}
          memberEmail={memberEmail}
          memberRole={memberRole}
          memberRoles={addableOrganizationRoles}
          onAddMember={handleAddMember}
          onAttachPersonalRecords={handleAttachPersonalRecords}
          onCreateWorkspace={handleCreateWorkspace}
          onMemberEmailChange={setMemberEmail}
          onMemberRoleChange={setMemberRole}
          onRemoveMember={handleRemoveMember}
          onSelectWorkspace={handleSelectWorkspace}
          onUpdateMemberRole={handleUpdateMemberRole}
          organizationRoleLabels={organizationRoleLabels}
          organizations={organizations}
          ownerCount={ownerCount}
          personalRecordCount={personalRecordCount}
          user={user}
          workspaceMessage={workspaceMessage}
        />

        <div className={`${activeTask === "extract" ? "" : "hidden"} ${embedded ? "space-y-5" : "space-y-5"}`}>
          {!embedded ? <IdeaExtractionSectionHeader /> : null}

          <div className="space-y-3">
            <section className="avl-card p-4 text-slate-900">
              <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(320px,380px)]">
                <IdeaExtractionLeftPanel
                  duplicateCandidateCount={duplicateCandidateCount}
                  extractMessage={extractMessage}
                  filledGeneratedIdeaCount={filledGeneratedIdeaSlots.length}
                  generatedIdeaSlots={generatedIdeaSlots}
                  hasGeneratedIdeaSlots={hasGeneratedIdeaSlots}
                  hasIdeaSourceInput={hasIdeaSourceInput}
                  isAiExtracting={isAiExtracting}
                  isGeneratingSample={isGeneratingSample}
                  isReplayingExtraction={isReplayingExtraction}
                  keptGeneratedIdeaCount={keptGeneratedIdeaCount}
                  onClearInput={() => {
                    setRawIdeaSource("");
                    setGeneratedIdeaSlots([]);
                    setExtractedIdeas([]);
                    setExtractionRunMeta(null);
                    setExtractionReplay(null);
                    setExtractMessage(null);
                  }}
                  onExtractIdeas={() => {
                    void handleAiExtractIdeas();
                  }}
                  onGenerateMoreIdeas={() => {
                    void handleGenerateSampleIdeas({ preserveKept: true });
                  }}
                  onGenerateSampleIdeas={() => {
                    void handleGenerateSampleIdeas();
                  }}
                  onRawIdeaSourceChange={(value) => {
                    setRawIdeaSource(value);
                    setGeneratedIdeaSlots([]);
                  }}
                  onReplayExtractionComparison={() => {
                    void handleReplayExtractionComparison();
                  }}
                  onToggleGeneratedIdeaKeep={toggleGeneratedIdeaKeep}
                  rawIdeaSource={rawIdeaSource}
                  selectedBuildDeliveryPhrase={selectedBuildDeliveryPhrase}
                  selectedBuildDeliveryShortLabel={selectedBuildDeliveryShortLabel}
                  trimmedIdeaSourceLength={trimmedIdeaSource.length}
                />

                <IdeaExtractionRightPanel
                  buildDeliveryLabel={selectedBuildDeliveryShortLabel}
                  buildDeliveryPhrase={selectedBuildDeliveryPhrase}
                  buildDeliveryPreference={normalizedBuildDeliveryPreference}
                  canSave={Boolean(user)}
                  extractionRunEngine={extractionRunMeta?.engine}
                  extractionRunNote={extractionRunMeta?.note}
                  gateBadgeClassName={recommendedGateStyle?.badge}
                  gateLabel={recommendedExtractionGate?.label}
                  gateNextAction={recommendedExtractionGate?.nextAction}
                  gateSummary={recommendedExtractionGate?.summary}
                  hasGeneratedIdeaSlots={hasGeneratedIdeaSlots}
                  hasReplaySummary={Boolean(extractionReplay)}
                  idea={extractedIdeas.length > 0 ? recommendedExtractedIdea : null}
                  isSaveLocked={Boolean(extractSaveKey)}
                  isSaving={Boolean(recommendedExtractedIdea && extractSaveKey === recommendedExtractedIdea.id)}
                  onBuildDeliveryPreferenceChange={(preference) => setBuildDeliveryPreference(preference)}
                  onEdit={() => {
                    if (recommendedExtractedIdea) {
                      loadExtractedIdea(recommendedExtractedIdea);
                    }
                  }}
                  onProductSurfaceChange={(value) => {
                    if (recommendedExtractedIdea) {
                      updateExtractedIdeaProductSurface(recommendedExtractedIdea.id, value);
                    }
                  }}
                  onSave={() => {
                    if (recommendedExtractedIdea) {
                      saveExtractedIdeaPackage(recommendedExtractedIdea);
                    }
                  }}
                  readinessScore={recommendedPortfolioItem?.readinessScore ?? 0}
                  replayAiOnlyCount={extractionReplay?.aiOnlyCount}
                  replayConsensusCount={extractionReplay?.consensusCount}
                  replayNote={extractionReplay?.note}
                  strategyScore={
                    recommendedExtractedIdea
                      ? recommendedPortfolioItem
                        ? getCandidateStrategyScore(recommendedPortfolioItem.candidate)
                        : getCandidateStrategyScore(recommendedExtractedIdea)
                      : 0
                  }
                />
              </div>
            </section>

            {showAdvancedExtractionReview && extractedIdeas.length > 0 ? (
              <>
                <IdeaExtractionAdvancedQueue
                  bulkSavableCount={bulkSavableExtractionItems.length}
                  canSave={Boolean(user)}
                  extractionGateCounts={extractionGateCounts}
                  extractionGateStyles={extractionGateStyles}
                  extractSaveKey={extractSaveKey}
                  isSavingExtractionReport={isSavingExtractionReport}
                  onCopyPortfolio={() => {
                    void copyExtractionPortfolio();
                  }}
                  onLoadIdea={(candidateId) => {
                    const item = secondaryPortfolioItems.find((entry) => entry.candidate.id === candidateId);
                    if (item) {
                      loadExtractedIdea(item.candidate);
                    }
                  }}
                  onSaveBulk={() => {
                    void saveBulkExtractedIdeaPackages();
                  }}
                  onSaveIdea={(candidateId) => {
                    const item = secondaryPortfolioItems.find((entry) => entry.candidate.id === candidateId);
                    if (item) {
                      saveExtractedIdeaPackage(item.candidate);
                    }
                  }}
                  onSaveReport={() => {
                    void saveExtractionPortfolioReport();
                  }}
                  secondaryPortfolioItems={secondaryPortfolioItems}
                  selectedBuildDeliveryShortLabel={selectedBuildDeliveryShortLabel}
                />

                <IdeaExtractionDetailList
                  canSave={Boolean(user)}
                  detailItems={extractionDetailItems}
                  extractSaveKey={extractSaveKey}
                  onLoadIdea={(candidateId) => {
                    const item = extractionDetailItems.find((entry) => entry.candidate.id === candidateId);
                    if (item) {
                      loadExtractedIdea(item.candidate);
                    }
                  }}
                  onSaveIdea={(candidateId) => {
                    const item = extractionDetailItems.find((entry) => entry.candidate.id === candidateId);
                    if (item) {
                      saveExtractedIdeaPackage(item.candidate);
                    }
                  }}
                  selectedBuildDeliveryShortLabel={selectedBuildDeliveryShortLabel}
                />
                </>
              ) : null}
          </div>
        </div>

      <ManualIdeaIntakeForm
        activeOrganizationName={activeOrganization?.name ?? null}
        activeTask={activeTask}
        canSave={Boolean(user)}
        embedded={embedded}
        form={form}
        isSaving={isSaving}
        onFormChange={(nextForm) => setForm(nextForm)}
        onSubmit={handleCreateIdea}
        productSurface={manualFormProductSurface}
        saveMessage={saveMessage}
        selectedBuildDeliveryPhrase={selectedBuildDeliveryPhrase}
      />
      </div>
    </section>
  );
}
