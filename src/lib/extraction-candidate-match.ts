import { normalizeMatchText, tokenOverlapScore } from "./text-match-utils";
import type { Database } from "@/lib/supabase/types";

type Idea = Database["public"]["Tables"]["ideas"]["Row"];

export type SimilarIdeaMatch = {
  idea: Idea;
  score: number;
  reason: string;
};

type MatchableExtractedIdea = {
  id: string;
  name: string;
  one_liner: string;
  target_user: string;
  buyer: string;
  signal: string;
  firstPrototypeScope: string;
};

export function findSimilarIdea(candidate: MatchableExtractedIdea, existingIdeas: Idea[]): SimilarIdeaMatch | null {
  const candidateName = normalizeMatchText(candidate.name);
  const candidateText = `${candidate.name} ${candidate.one_liner} ${candidate.target_user} ${candidate.buyer} ${candidate.signal}`;

  const matches = sortCandidateMatchesByScore(
    existingIdeas
      .map((idea) => {
        const ideaName = normalizeMatchText(idea.name);
        const ideaText = `${idea.name} ${idea.one_liner} ${idea.target_user} ${idea.buyer} ${idea.signal}`;
        const nameScore =
          candidateName && ideaName && candidateName === ideaName
            ? 100
            : candidateName && ideaName && (candidateName.includes(ideaName) || ideaName.includes(candidateName))
              ? 86
              : tokenOverlapScore(candidate.name, idea.name);
        const textScore = tokenOverlapScore(candidateText, ideaText);
        const targetScore = tokenOverlapScore(candidate.target_user, idea.target_user);
        const score = Math.max(nameScore, Math.round(textScore * 0.7 + targetScore * 0.3));

        return {
          idea,
          score,
          reason:
            nameScore >= 86
              ? "이름이 거의 같습니다."
              : targetScore >= 55
                ? "대상 사용자와 문제 단서가 겹칩니다."
                : "문제 설명의 핵심 단어가 겹칩니다.",
        };
      })
      .filter((match) => match.score >= 52),
  );

  return matches[0] ?? null;
}

export function compareCandidateMatchesByScore<T extends { score: number }>(a: T, b: T) {
  return b.score - a.score;
}

export function sortCandidateMatchesByScore<T extends { score: number }>(matches: ReadonlyArray<T>) {
  return [...matches].sort(compareCandidateMatchesByScore);
}

function candidateComparisonText(candidate: MatchableExtractedIdea) {
  return [
    candidate.name,
    candidate.one_liner,
    candidate.target_user,
    candidate.buyer,
    candidate.signal,
    candidate.firstPrototypeScope,
  ].join(" ");
}

export function candidateSimilarityScore(left: MatchableExtractedIdea, right: MatchableExtractedIdea) {
  const nameScore = tokenOverlapScore(left.name, right.name);
  const problemScore = tokenOverlapScore(candidateComparisonText(left), candidateComparisonText(right));
  const userScore = tokenOverlapScore(`${left.target_user} ${left.buyer}`, `${right.target_user} ${right.buyer}`);

  return Math.max(nameScore, Math.round(problemScore * 0.65 + userScore * 0.35));
}

export function findBestCandidateMatch<T extends MatchableExtractedIdea>(
  candidate: T,
  pool: T[],
  usedIds = new Set<string>(),
) {
  return sortCandidateMatchesByScore(
    pool
      .filter((item) => !usedIds.has(item.id))
      .map((item) => ({ item, score: candidateSimilarityScore(candidate, item) })),
  )[0];
}
