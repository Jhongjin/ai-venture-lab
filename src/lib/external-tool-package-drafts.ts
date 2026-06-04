import { buildAntigravityCliScript, buildClaudeCliScript, buildCodexCliScript } from "@/lib/external-tool-cli-scripts";
import {
  buildAntigravityMcpConfigJson,
  buildClaudeMcpConfigJson,
  buildCursorMcpConfigJson,
} from "@/lib/external-tool-connector-config";
import { buildCursorMcpServerScript } from "@/lib/cursor-mcp-server-script";
import {
  buildAntigravityAcceptanceMarkdown,
  buildAntigravityAgentInstructionsMarkdown,
  buildAntigravityGuideMarkdown,
  buildAntigravityStartPromptMarkdown,
  buildAntigravityTaskMarkdown,
  buildClaudeGuideMarkdown,
  buildClaudeInstructionsMarkdown,
  buildClaudeStartPromptMarkdown,
  buildClaudeTaskMarkdown,
  buildCodexAgentInstructionsMarkdown,
  buildCodexGuideMarkdown,
  buildCodexStartPromptMarkdown,
  buildCodexTaskMarkdown,
  buildCursorGuideMarkdown,
  buildCursorRulesMarkdown,
  buildCursorStartPromptMarkdown,
  buildCursorTaskMarkdown,
} from "@/lib/external-tool-handoff-markdown";
import type { ImplementationTaskDraft } from "@/lib/external-progress-import";
import type { ProductSurfaceProfile } from "@/lib/product-surface";
import type { Idea, ImplementationTask } from "@/lib/venture-data";

export type ExternalToolPackageDrafts = {
  antigravityAcceptanceDraft: string;
  antigravityAgentInstructionsDraft: string;
  antigravityCliScriptDraft: string;
  antigravityGuideDraft: string;
  antigravityMcpConfigDraft: string;
  antigravityStartPromptDraft: string;
  antigravityTaskPackageDraft: string;
  claudeCliScriptDraft: string;
  claudeGuideDraft: string;
  claudeInstructionsDraft: string;
  claudeMcpConfigDraft: string;
  claudeStartPromptDraft: string;
  claudeTaskPackageDraft: string;
  codexAgentInstructionsDraft: string;
  codexCliScriptDraft: string;
  codexGuideDraft: string;
  codexStartPromptDraft: string;
  codexTaskPackageDraft: string;
  cursorGuideDraft: string;
  cursorMcpConfigDraft: string;
  cursorMcpServerDraft: string;
  cursorRuleDraft: string;
  cursorStartPromptDraft: string;
  cursorTaskPackageDraft: string;
};
export type ExternalToolIdeaPackageDrafts = Pick<
  ExternalToolPackageDrafts,
  | "antigravityAcceptanceDraft"
  | "antigravityAgentInstructionsDraft"
  | "antigravityGuideDraft"
  | "antigravityStartPromptDraft"
  | "antigravityTaskPackageDraft"
  | "claudeGuideDraft"
  | "claudeInstructionsDraft"
  | "claudeStartPromptDraft"
  | "claudeTaskPackageDraft"
  | "codexAgentInstructionsDraft"
  | "codexGuideDraft"
  | "codexStartPromptDraft"
  | "codexTaskPackageDraft"
  | "cursorGuideDraft"
  | "cursorRuleDraft"
  | "cursorStartPromptDraft"
  | "cursorTaskPackageDraft"
>;

const emptyExternalToolIdeaPackageDrafts: ExternalToolIdeaPackageDrafts = {
  antigravityAcceptanceDraft: "",
  antigravityAgentInstructionsDraft: "",
  antigravityGuideDraft: "",
  antigravityStartPromptDraft: "",
  antigravityTaskPackageDraft: "",
  claudeGuideDraft: "",
  claudeInstructionsDraft: "",
  claudeStartPromptDraft: "",
  claudeTaskPackageDraft: "",
  codexAgentInstructionsDraft: "",
  codexGuideDraft: "",
  codexStartPromptDraft: "",
  codexTaskPackageDraft: "",
  cursorGuideDraft: "",
  cursorRuleDraft: "",
  cursorStartPromptDraft: "",
  cursorTaskPackageDraft: "",
};

export function buildExternalToolConnectorDrafts() {
  return {
    cursorMcpConfigDraft: buildCursorMcpConfigJson(),
    cursorMcpServerDraft: buildCursorMcpServerScript(),
    claudeMcpConfigDraft: buildClaudeMcpConfigJson(),
    antigravityMcpConfigDraft: buildAntigravityMcpConfigJson(),
  };
}

export function buildExternalToolIdeaPackageDrafts({
  fallbackTasks,
  idea,
  productSurface,
  projectKey,
  tasks,
}: {
  fallbackTasks: ImplementationTaskDraft[];
  idea: Idea | null;
  productSurface: ProductSurfaceProfile;
  projectKey: string;
  tasks: ImplementationTask[];
}): ExternalToolIdeaPackageDrafts {
  if (!idea) {
    return emptyExternalToolIdeaPackageDrafts;
  }

  return {
    cursorTaskPackageDraft: buildCursorTaskMarkdown({ idea, productSurface, tasks, fallbackTasks }),
    cursorStartPromptDraft: buildCursorStartPromptMarkdown({ idea, productSurface, projectKey }),
    cursorRuleDraft: buildCursorRulesMarkdown({ idea, productSurface }),
    cursorGuideDraft: buildCursorGuideMarkdown({ idea, productSurface, projectKey }),
    codexTaskPackageDraft: buildCodexTaskMarkdown({ idea, productSurface, tasks, fallbackTasks }),
    codexStartPromptDraft: buildCodexStartPromptMarkdown({ idea, productSurface, projectKey }),
    codexAgentInstructionsDraft: buildCodexAgentInstructionsMarkdown({ idea, productSurface }),
    codexGuideDraft: buildCodexGuideMarkdown({ idea, productSurface, projectKey }),
    claudeTaskPackageDraft: buildClaudeTaskMarkdown({ idea, productSurface, tasks, fallbackTasks }),
    claudeStartPromptDraft: buildClaudeStartPromptMarkdown({ idea, productSurface, projectKey }),
    claudeInstructionsDraft: buildClaudeInstructionsMarkdown({ idea, productSurface }),
    claudeGuideDraft: buildClaudeGuideMarkdown({ idea, productSurface, projectKey }),
    antigravityTaskPackageDraft: buildAntigravityTaskMarkdown({ idea, productSurface, tasks, fallbackTasks }),
    antigravityStartPromptDraft: buildAntigravityStartPromptMarkdown({ idea, productSurface, projectKey }),
    antigravityAgentInstructionsDraft: buildAntigravityAgentInstructionsMarkdown({ idea, productSurface }),
    antigravityAcceptanceDraft: buildAntigravityAcceptanceMarkdown({ idea, productSurface }),
    antigravityGuideDraft: buildAntigravityGuideMarkdown({ idea, productSurface, projectKey }),
  };
}

export function buildExternalToolPackageDrafts({
  fallbackTasks,
  idea,
  productSurface,
  projectKey,
  tasks,
}: {
  fallbackTasks: ImplementationTaskDraft[];
  idea: Idea | null;
  productSurface: ProductSurfaceProfile;
  projectKey: string;
  tasks: ImplementationTask[];
}): ExternalToolPackageDrafts {
  const { antigravityMcpConfigDraft, claudeMcpConfigDraft, cursorMcpConfigDraft, cursorMcpServerDraft } =
    buildExternalToolConnectorDrafts();
  const ideaDrafts = buildExternalToolIdeaPackageDrafts({ fallbackTasks, idea, productSurface, projectKey, tasks });

  return {
    ...ideaDrafts,
    cursorMcpConfigDraft,
    cursorMcpServerDraft,
    codexCliScriptDraft: buildCodexCliScript(cursorMcpServerDraft),
    claudeMcpConfigDraft,
    claudeCliScriptDraft: buildClaudeCliScript(cursorMcpServerDraft),
    antigravityMcpConfigDraft,
    antigravityCliScriptDraft: buildAntigravityCliScript(cursorMcpServerDraft),
  };
}
