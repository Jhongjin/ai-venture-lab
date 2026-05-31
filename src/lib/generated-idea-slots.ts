import { productSurfaceProfiles, type ProductSurfaceKey, type ProductSurfaceProfile } from "@/lib/product-surface";

export type AiGeneratedSampleIdea = {
  title: string;
  pain: string;
  solution: string;
  targetUser: string;
  buyer: string;
  firstValidation: string;
  productSurface?: ProductSurfaceKey;
  firstBuild?: string;
};

export type GeneratedIdeaSlot = {
  id: string;
  idea: AiGeneratedSampleIdea | null;
  kept: boolean;
};

export type ExtractionRunMeta = {
  engine: "openai" | "rules" | "fallback";
  model: string | null;
  sourceLength: number;
  candidateCount: number;
  generatedAt: string;
  note: string;
};

const generatedIdeaSlotIndexes = [0, 1, 2] as const;

function compactGeneratedIdeaText(value: string, maxLength = 180) {
  return value.replace(/\s+/g, " ").trim().slice(0, maxLength);
}

function isProductSurfaceKey(value: string | undefined): value is ProductSurfaceKey {
  return Boolean(value && value in productSurfaceProfiles);
}

function getGeneratedIdeaProductSurface(idea: AiGeneratedSampleIdea): ProductSurfaceProfile | null {
  return isProductSurfaceKey(idea.productSurface) ? productSurfaceProfiles[idea.productSurface] : null;
}

function normalizeGeneratedIdea(idea: AiGeneratedSampleIdea | null | undefined): AiGeneratedSampleIdea | null {
  if (!idea) {
    return null;
  }

  const title = compactGeneratedIdeaText(idea.title ?? "", 80);
  const solution = compactGeneratedIdeaText(idea.solution ?? "", 260);

  if (!title || !solution) {
    return null;
  }

  return {
    title,
    pain: compactGeneratedIdeaText(idea.pain ?? "", 260),
    solution,
    targetUser: compactGeneratedIdeaText(idea.targetUser ?? "", 180),
    buyer: compactGeneratedIdeaText(idea.buyer ?? "", 180),
    firstValidation: compactGeneratedIdeaText(idea.firstValidation ?? "", 260),
    productSurface: isProductSurfaceKey(idea.productSurface) ? idea.productSurface : undefined,
    firstBuild: compactGeneratedIdeaText(idea.firstBuild ?? "", 260),
  };
}

function getGeneratedIdeaKey(idea: AiGeneratedSampleIdea) {
  return compactGeneratedIdeaText(`${idea.title} ${idea.solution}`, 260).toLowerCase();
}

function createGeneratedIdeaSlot(idea: AiGeneratedSampleIdea | null, index: number, kept = false): GeneratedIdeaSlot {
  const safeTitle = idea ? compactGeneratedIdeaText(idea.title, 28).replace(/\s+/g, "-") : "empty";

  return {
    id: `${Date.now()}-${index}-${safeTitle}-${Math.random().toString(36).slice(2, 8)}`,
    idea,
    kept,
  };
}

export function createExtractionRunMeta({
  engine,
  model,
  sourceLength,
  candidateCount,
  note,
}: Omit<ExtractionRunMeta, "generatedAt">): ExtractionRunMeta {
  return {
    engine,
    model,
    sourceLength,
    candidateCount,
    generatedAt: new Date().toISOString(),
    note,
  };
}

export function mergeGeneratedIdeaSlots({
  currentSlots,
  generatedIdeas,
  preserveKept,
}: {
  currentSlots: GeneratedIdeaSlot[];
  generatedIdeas: AiGeneratedSampleIdea[];
  preserveKept: boolean;
}) {
  const normalizedCurrentSlots = generatedIdeaSlotIndexes.map(
    (index) => currentSlots[index] ?? createGeneratedIdeaSlot(null, index),
  );
  const existingKeys = new Set(
    normalizedCurrentSlots
      .filter((slot) => preserveKept && slot.kept && slot.idea)
      .map((slot) => getGeneratedIdeaKey(slot.idea as AiGeneratedSampleIdea)),
  );
  const replacementIdeas = generatedIdeas
    .map(normalizeGeneratedIdea)
    .filter((idea): idea is AiGeneratedSampleIdea => Boolean(idea))
    .filter((idea) => {
      const key = getGeneratedIdeaKey(idea);

      if (existingKeys.has(key)) {
        return false;
      }

      existingKeys.add(key);
      return true;
    });
  let replacementIndex = 0;

  return normalizedCurrentSlots.map((slot, index) => {
    if (preserveKept && slot.kept && slot.idea) {
      return slot;
    }

    return createGeneratedIdeaSlot(replacementIdeas[replacementIndex++] ?? slot.idea, index, false);
  });
}

export function formatGeneratedIdeaSource(idea: AiGeneratedSampleIdea, index: number) {
  const productSurface = getGeneratedIdeaProductSurface(idea);

  return `아이디어 ${index + 1}: ${idea.title}
문제: ${idea.pain}
해결: ${idea.solution}
대상: ${idea.targetUser}
구매자: ${idea.buyer}
예상 결과물: ${productSurface?.label ?? "웹 서비스"}
첫 결과물 범위: ${idea.firstBuild || productSurface?.firstBuild || "로그인, 입력, 결과 확인, 저장까지 이어지는 첫 제작 흐름"}
먼저 확인할 것: ${idea.firstValidation}`;
}

export function buildGeneratedIdeaSourceFromSlots(slots: GeneratedIdeaSlot[]) {
  return slots
    .map((slot, index) => (slot.idea ? formatGeneratedIdeaSource(slot.idea, index) : ""))
    .filter(Boolean)
    .join("\n\n");
}

export function generatedIdeaToExistingContext(idea: AiGeneratedSampleIdea) {
  return {
    name: idea.title,
    one_liner: idea.solution,
    target_user: idea.targetUser,
    buyer: idea.buyer,
  };
}
