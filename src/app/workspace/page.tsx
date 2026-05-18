import type { Metadata } from "next";

import { WorkspaceBoardPage } from "@/components/workspace-board-page";

export const metadata: Metadata = {
  title: "아이디어 실행 보드 | AI Venture Lab",
  description: "아이디어 찾기부터 검증, 제작 준비, 출시 후 학습까지 한 보드에서 관리합니다.",
};

export const dynamic = "force-dynamic";

export default async function WorkspacePage() {
  return <WorkspaceBoardPage />;
}
