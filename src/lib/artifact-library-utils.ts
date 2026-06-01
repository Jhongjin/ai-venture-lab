import type { VentureArtifactStatus, VentureArtifactType } from "@/lib/supabase/types";
import type { VentureArtifact } from "@/lib/venture-data";
import { artifactSourceLabels } from "@/lib/artifact-labels";

export type ArtifactTypeFilter = VentureArtifactType | "all";
export type ArtifactStatusFilter = VentureArtifactStatus | "all";

export function buildArtifactSourceOptions(artifacts: VentureArtifact[]) {
  return [
    "all",
    ...Array.from(new Set(artifacts.map((artifact) => artifact.source || "manual"))).sort((a, b) =>
      a.localeCompare(b, "ko-KR"),
    ),
  ];
}

export function buildArtifactSourceFilterLabels(sourceOptions: string[]) {
  return Object.fromEntries(
    sourceOptions.map((source) => [
      source,
      source === "all" ? "전체 출처" : (artifactSourceLabels[source] ?? source),
    ]),
  ) as Record<string, string>;
}

export function resolveArtifactSourceFilter(sourceOptions: string[], sourceFilter: string) {
  return sourceOptions.includes(sourceFilter) ? sourceFilter : "all";
}

export function filterArtifactLibrary({
  artifacts,
  limit = 8,
  sourceFilter,
  statusFilter,
  typeFilter,
}: {
  artifacts: VentureArtifact[];
  limit?: number;
  sourceFilter: string;
  statusFilter: ArtifactStatusFilter;
  typeFilter: ArtifactTypeFilter;
}) {
  return artifacts
    .filter((artifact) => typeFilter === "all" || artifact.artifact_type === typeFilter)
    .filter((artifact) => statusFilter === "all" || (artifact.status ?? "draft") === statusFilter)
    .filter((artifact) => sourceFilter === "all" || (artifact.source || "manual") === sourceFilter)
    .slice(0, limit);
}

export function getRecentDevelopmentHandoffArtifacts(artifacts: VentureArtifact[], limit = 3) {
  return artifacts
    .filter(
      (artifact) =>
        artifact.artifact_type === "dev_runbook" &&
        ["filtered_implementation_run", "development_process"].includes(artifact.source || ""),
    )
    .slice(0, limit);
}
