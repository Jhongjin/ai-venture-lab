import type { Metadata } from "next";

import { WorkspaceBoardPage, type WorkspaceInitialTask, type WorkspaceInitialView } from "@/components/workspace-board-page";
import { isWorkbenchTask } from "@/lib/workbench-tasks";

export const metadata: Metadata = {
  title: "아이디어 실행 보드 | AI Venture Lab",
  description: "아이디어 찾기부터 검증, 제작 준비, 출시 후 학습까지 한 보드에서 관리합니다.",
};

export const dynamic = "force-dynamic";

export default async function WorkspacePage({
  searchParams,
}: {
  searchParams?: Promise<{ view?: string | string[] | undefined; task?: string | string[] | undefined; idea?: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const view = Array.isArray(params?.view) ? params?.view[0] : params?.view;
  const task = Array.isArray(params?.task) ? params?.task[0] : params?.task;
  const idea = Array.isArray(params?.idea) ? params?.idea[0] : params?.idea;
  const initialView: WorkspaceInitialView = view === "ideas" || view === "deleted" ? view : undefined;
  const initialTask: WorkspaceInitialTask = isWorkbenchTask(task) ? task : undefined;

  return <WorkspaceBoardPage initialView={initialView} initialTask={initialTask} initialIdeaId={idea} />;
}
