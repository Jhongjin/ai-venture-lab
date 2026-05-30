"use client";

import { ArrowsClockwise, PlusCircle } from "@phosphor-icons/react";

type ExtractionDetailCandidate = {
  assumptions: string[];
  buyer: string;
  confidence: number;
  evidence: string[];
  firstPrototypeScope: string;
  id: string;
  killCriteria: string;
  name: string;
  one_liner: string;
  pricingHypothesis: string;
  productSurface: {
    shortLabel: string;
  };
  recommendation: string;
  riskLevel: "낮음" | "보통" | "높음";
  sevenDayExperiment: string;
  successMetric: string;
  target_user: string;
  validationQuestions: string[];
  validationScore: number;
};

type ExtractionDetailGate = {
  blockers: string[];
  label: string;
  nextAction: string;
  summary: string;
  threshold: string;
};

type ExtractionDetailGateStyle = {
  badge: string;
  panel: string;
  score: string;
  title: string;
};

type ExtractionDetailLens = {
  detail: string;
  label: string;
  score: number;
  tone: "good" | "watch" | "risk";
};

type ExtractionDetailReadinessCheck = {
  detail: string;
  label: string;
  passed: boolean;
};

type ExtractionDetailSimilarIdea = {
  idea: {
    name: string;
  };
  reason: string;
  score: number;
};

type IdeaExtractionDetailCardProps = {
  canSave: boolean;
  candidate: ExtractionDetailCandidate;
  extractionGate: ExtractionDetailGate;
  gateStyle: ExtractionDetailGateStyle;
  isSaveLocked: boolean;
  isSaving: boolean;
  nextReadinessGap: ExtractionDetailReadinessCheck | undefined;
  onLoad: () => void;
  onSave: () => void | Promise<void>;
  passedReadinessCount: number;
  readinessChecks: ExtractionDetailReadinessCheck[];
  readinessScore: number;
  selectedBuildDeliveryShortLabel: string;
  similarIdea: ExtractionDetailSimilarIdea | null | undefined;
  sourceEvidence: string;
  strategyLenses: ExtractionDetailLens[];
  strategyScore: number;
};

export function IdeaExtractionDetailCard({
  canSave,
  candidate,
  extractionGate,
  gateStyle,
  isSaveLocked,
  isSaving,
  nextReadinessGap,
  onLoad,
  onSave,
  passedReadinessCount,
  readinessChecks,
  readinessScore,
  selectedBuildDeliveryShortLabel,
  similarIdea,
  sourceEvidence,
  strategyLenses,
  strategyScore,
}: IdeaExtractionDetailCardProps) {
  return (
    <article className="border border-slate-200 bg-white p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-semibold text-slate-950">{candidate.name}</h3>
            <span className="avl-pill avl-pill-info">검증 {candidate.validationScore}/100</span>
            <span
              className={`avl-pill ${
                candidate.riskLevel === "높음"
                  ? "avl-pill-danger"
                  : candidate.riskLevel === "보통"
                    ? "avl-pill-warning"
                    : "avl-pill-success"
              }`}
            >
              리스크 {candidate.riskLevel}
            </span>
            <span className="avl-pill avl-pill-neutral">신뢰 {candidate.confidence}%</span>
            <span className="avl-pill avl-pill-success">
              준비 {passedReadinessCount}/{readinessChecks.length}
            </span>
            <span className="avl-pill avl-pill-brand">사업/제작 {strategyScore}%</span>
            <span className="avl-pill avl-pill-brand">결과물 형태 {candidate.productSurface.shortLabel}</span>
            <span className="avl-pill avl-pill-info">개발 방식 {selectedBuildDeliveryShortLabel}</span>
            <span className={gateStyle.badge}>{extractionGate.label}</span>
          </div>
          <p className="mt-2 text-sm leading-6 text-slate-600">{candidate.one_liner}</p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <button type="button" onClick={onLoad} className="avl-btn avl-btn-secondary h-10 px-4">
            입력칸에 가져오기
          </button>
          <button
            type="button"
            onClick={() => {
              void onSave();
            }}
            disabled={isSaveLocked || !canSave}
            className="avl-btn avl-btn-accent h-10 px-4 disabled:opacity-50"
          >
            {isSaving ? <ArrowsClockwise className="animate-spin" size={16} /> : <PlusCircle size={16} />}
            아이디어 패키지 저장
          </button>
        </div>
      </div>
      {similarIdea ? (
        <div className="avl-surface-muted mt-3 border-amber-200 bg-amber-50 p-3 text-sm leading-6 text-amber-900">
          <span className="font-semibold text-amber-950">기존 유사 기록:</span> {similarIdea.idea.name} · 유사도{" "}
          {similarIdea.score}% · {similarIdea.reason}
        </div>
      ) : null}
      <div className={`mt-3 border p-3 ${gateStyle.panel}`}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className={`text-sm font-semibold ${gateStyle.title}`}>추천 판단: {extractionGate.label}</div>
            <p className="mt-1 text-sm leading-6 text-slate-700">{extractionGate.summary}</p>
            <p className="mt-1 text-sm leading-6 text-slate-700">
              <span className="font-semibold text-slate-950">다음 작업:</span> {extractionGate.nextAction}
            </p>
          </div>
          <div className={`shrink-0 border px-3 py-2 text-right ${gateStyle.score}`}>
            <div className="text-[10px] font-semibold">기준</div>
            <div className="mt-1 max-w-[160px] text-xs leading-5">{extractionGate.threshold}</div>
          </div>
        </div>
        {extractionGate.blockers.length > 0 ? (
          <div className="mt-2 flex flex-wrap gap-2">
            {extractionGate.blockers.map((blocker) => (
              <span key={blocker} className="avl-pill avl-pill-neutral">
                보완 필요: {blocker}
              </span>
            ))}
          </div>
        ) : null}
      </div>
      <div className="avl-surface-muted mt-3 border-slate-200 p-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="text-sm font-semibold text-slate-950">AI가 본 사업성과 제작 난이도</div>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              수요, 수익화, 첫 제작 난이도, 도달 채널, 자동화 가치, 보안 부담을 함께 봅니다.
            </p>
          </div>
          <div className="avl-surface-muted px-3 py-2 text-right text-slate-950">
            <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">종합</div>
            <div className="text-2xl font-semibold">{strategyScore}%</div>
          </div>
        </div>
        <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {strategyLenses.map((lens) => (
            <div key={lens.label} className="border border-slate-200 bg-white px-3 py-2">
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-semibold text-slate-950">{lens.label}</span>
                <span
                  className={`avl-pill ${
                    lens.tone === "good"
                      ? "avl-pill-success"
                      : lens.tone === "watch"
                        ? "avl-pill-warning"
                        : "avl-pill-danger"
                  }`}
                >
                  {lens.score}%
                </span>
              </div>
              <p className="mt-1 text-xs leading-5 text-slate-600">{lens.detail}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="avl-surface-muted mt-3 border-emerald-200 bg-emerald-50 p-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="text-sm font-semibold text-emerald-950">검증 자료 준비도</div>
            <p className="mt-1 text-sm leading-6 text-emerald-900">
              {nextReadinessGap
                ? `다음 보완: ${nextReadinessGap.label} - ${nextReadinessGap.detail}`
                : "아이디어, 리스크, 7일 검증 계획으로 저장할 준비가 좋습니다."}
            </p>
          </div>
          <div className="avl-surface-muted px-3 py-2 text-right text-slate-950">
            <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">준비</div>
            <div className="text-2xl font-semibold">{readinessScore}%</div>
          </div>
        </div>
        <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {readinessChecks.map((check) => (
            <div key={check.label} className="border border-slate-200 bg-white px-3 py-2">
              <div className="flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${check.passed ? "bg-emerald-500" : "bg-slate-300"}`} />
                <span className="text-xs font-semibold text-slate-950">{check.label}</span>
              </div>
              <p className="mt-1 text-xs leading-5 text-slate-600">{check.detail}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-3 grid gap-3 md:grid-cols-2">
        <div className="avl-surface-muted p-3">
          <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">대상</div>
          <p className="mt-1 text-sm leading-6 text-slate-700">{candidate.target_user}</p>
        </div>
        <div className="avl-surface-muted p-3">
          <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">구매자</div>
          <p className="mt-1 text-sm leading-6 text-slate-700">{candidate.buyer}</p>
        </div>
        <div className="avl-surface-muted p-3">
          <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">핵심 가설</div>
          <ul className="mt-1 grid gap-1 text-sm leading-6 text-slate-700">
            {candidate.assumptions.map((item) => (
              <li key={item}>- {item}</li>
            ))}
          </ul>
        </div>
        <div className="avl-surface-muted p-3">
          <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">검증 질문</div>
          <ul className="mt-1 grid gap-1 text-sm leading-6 text-slate-700">
            {candidate.validationQuestions.slice(0, 3).map((item) => (
              <li key={item}>- {item}</li>
            ))}
          </ul>
        </div>
        <div className="avl-surface-muted p-3 md:col-span-2">
          <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">7일 검증 계획</div>
          <p className="mt-1 text-sm leading-6 text-slate-700">{candidate.sevenDayExperiment}</p>
          <p className="mt-2 text-sm leading-6 text-slate-700">
            <span className="font-semibold text-slate-950">성공 지표:</span> {candidate.successMetric}
          </p>
        </div>
        <div className="avl-surface-muted p-3 md:col-span-2">
          <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">메모 근거</div>
          <p className="mt-1 text-sm leading-6 text-slate-700">{sourceEvidence}</p>
        </div>
        <div className="avl-surface-muted p-3">
          <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">첫 제작 범위</div>
          <p className="mt-1 text-sm leading-6 text-slate-700">{candidate.firstPrototypeScope}</p>
        </div>
        <div className="avl-surface-muted p-3">
          <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">중단 기준</div>
          <p className="mt-1 text-sm leading-6 text-slate-700">{candidate.killCriteria}</p>
        </div>
        <div className="avl-surface-muted p-3 md:col-span-2">
          <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">가격/구매 가설</div>
          <p className="mt-1 text-sm leading-6 text-slate-700">{candidate.pricingHypothesis}</p>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <span className="avl-pill avl-pill-neutral">{candidate.recommendation}</span>
        {candidate.evidence.map((item) => (
          <span key={item} className="avl-pill avl-pill-neutral">
            {item}
          </span>
        ))}
      </div>
    </article>
  );
}
