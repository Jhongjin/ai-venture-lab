import type { Metadata } from "next";

import { WorkspaceIdeaListPage } from "@/components/workspace-idea-list-page";

export const metadata: Metadata = {
  title: "삭제한 아이디어 | AI Venture Lab",
  description: "삭제 목록으로 옮긴 아이디어를 확인합니다.",
};

export const dynamic = "force-dynamic";

export default async function WorkspaceDeletedIdeasPage() {
  return <WorkspaceIdeaListPage mode="deleted" />;
}
