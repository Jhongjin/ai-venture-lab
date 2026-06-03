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

export function buildExternalToolConnectorDrafts() {
  return {
    cursorMcpConfigDraft: buildCursorMcpConfigJson(),
    cursorMcpServerDraft: buildCursorMcpServerScript(),
    claudeMcpConfigDraft: buildClaudeMcpConfigJson(),
    antigravityMcpConfigDraft: buildAntigravityMcpConfigJson(),
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

  return {
    cursorTaskPackageDraft: idea
      ? buildCursorTaskMarkdown({ idea, productSurface, tasks, fallbackTasks })
      : "",
    cursorStartPromptDraft: idea ? buildCursorStartPromptMarkdown({ idea, productSurface, projectKey }) : "",
    cursorRuleDraft: idea ? buildCursorRulesMarkdown({ idea, productSurface }) : "",
    cursorGuideDraft: idea ? buildCursorGuideMarkdown({ idea, productSurface, projectKey }) : "",
    cursorMcpConfigDraft,
    cursorMcpServerDraft,
    codexTaskPackageDraft: idea
      ? buildCodexTaskMarkdown({ idea, productSurface, tasks, fallbackTasks })
      : "",
    codexStartPromptDraft: idea ? buildCodexStartPromptMarkdown({ idea, productSurface, projectKey }) : "",
    codexAgentInstructionsDraft: idea ? buildCodexAgentInstructionsMarkdown({ idea, productSurface }) : "",
    codexGuideDraft: idea ? buildCodexGuideMarkdown({ idea, productSurface, projectKey }) : "",
    codexCliScriptDraft: buildCodexCliScript(cursorMcpServerDraft),
    claudeTaskPackageDraft: idea
      ? buildClaudeTaskMarkdown({ idea, productSurface, tasks, fallbackTasks })
      : "",
    claudeStartPromptDraft: idea ? buildClaudeStartPromptMarkdown({ idea, productSurface, projectKey }) : "",
    claudeInstructionsDraft: idea ? buildClaudeInstructionsMarkdown({ idea, productSurface }) : "",
    claudeGuideDraft: idea ? buildClaudeGuideMarkdown({ idea, productSurface, projectKey }) : "",
    claudeMcpConfigDraft,
    claudeCliScriptDraft: buildClaudeCliScript(cursorMcpServerDraft),
    antigravityTaskPackageDraft: idea
      ? buildAntigravityTaskMarkdown({ idea, productSurface, tasks, fallbackTasks })
      : "",
    antigravityStartPromptDraft: idea ? buildAntigravityStartPromptMarkdown({ idea, productSurface, projectKey }) : "",
    antigravityAgentInstructionsDraft: idea ? buildAntigravityAgentInstructionsMarkdown({ idea, productSurface }) : "",
    antigravityAcceptanceDraft: idea ? buildAntigravityAcceptanceMarkdown({ idea, productSurface }) : "",
    antigravityGuideDraft: idea ? buildAntigravityGuideMarkdown({ idea, productSurface, projectKey }) : "",
    antigravityMcpConfigDraft,
    antigravityCliScriptDraft: buildAntigravityCliScript(cursorMcpServerDraft),
  };
}
