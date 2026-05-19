import type { Metadata } from "next";

import { WorkspaceIdeaListPage } from "@/components/workspace-idea-list-page";

export const metadata: Metadata = {
  title: "검토 아이디어 | AI Venture Lab",
  description: "진행 중인 아이디어를 확인하고 마지막 단계에서 이어갑니다.",
};

export const dynamic = "force-dynamic";

export default async function WorkspaceIdeasPage() {
  return <WorkspaceIdeaListPage mode="active" />;
}
