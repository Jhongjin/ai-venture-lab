import type { Metadata } from "next";

import { WorkspaceBoardPage, type WorkspaceInitialView } from "@/components/workspace-board-page";

export const metadata: Metadata = {
  title: "아이디어 실행 보드 | AI Venture Lab",
  description: "아이디어 찾기부터 검증, 제작 준비, 출시 후 학습까지 한 보드에서 관리합니다.",
};

export const dynamic = "force-dynamic";

export default async function WorkspacePage({
  searchParams,
}: {
  searchParams?: Promise<{ view?: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const view = Array.isArray(params?.view) ? params?.view[0] : params?.view;
  const initialView: WorkspaceInitialView = view === "ideas" || view === "deleted" ? view : undefined;

  return <WorkspaceBoardPage initialView={initialView} />;
}
