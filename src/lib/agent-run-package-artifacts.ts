import type { VentureArtifact } from "@/lib/venture-data";

function getArtifactCreatedAtTime(artifact: Pick<VentureArtifact, "created_at">) {
  const timestamp = new Date(artifact.created_at).getTime();

  return Number.isFinite(timestamp) ? timestamp : 0;
}

export function getApprovedAgentRunPackageArtifacts(artifacts: VentureArtifact[]) {
  return artifacts
    .filter((artifact) => artifact.status === "approved")
    .sort((a, b) => getArtifactCreatedAtTime(b) - getArtifactCreatedAtTime(a));
}
