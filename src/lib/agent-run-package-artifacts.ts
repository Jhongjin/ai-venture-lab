import type { VentureArtifact } from "@/lib/venture-data";

export function getAgentRunPackageArtifactCreatedAtTime(artifact: Pick<VentureArtifact, "created_at">) {
  const timestamp = new Date(artifact.created_at).getTime();

  return Number.isFinite(timestamp) ? timestamp : 0;
}

export function compareApprovedAgentRunPackageArtifactsByCreatedAt(
  a: Pick<VentureArtifact, "created_at">,
  b: Pick<VentureArtifact, "created_at">,
) {
  return getAgentRunPackageArtifactCreatedAtTime(b) - getAgentRunPackageArtifactCreatedAtTime(a);
}

export function getApprovedAgentRunPackageArtifacts(artifacts: VentureArtifact[]) {
  return artifacts
    .filter((artifact) => artifact.status === "approved")
    .sort(compareApprovedAgentRunPackageArtifactsByCreatedAt);
}
