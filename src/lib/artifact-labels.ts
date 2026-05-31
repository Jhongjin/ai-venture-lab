import type { VentureArtifactStatus, VentureArtifactType } from "@/lib/supabase/types";

export const artifactLabels: Record<VentureArtifactType, string> = {
  idea_brief: "아이디어 요약",
  research_note: "리서치 노트",
  prd: "제품 기획서",
  mvp_spec: "첫 제작 범위",
  backend_decision: "백엔드 결정",
  design_brief: "디자인 기준",
  tech_spec: "기술 명세",
  dev_runbook: "제작 실행 계획",
  launch_checklist: "출시 체크리스트",
};

export const artifactStatusLabels: Record<VentureArtifactStatus, string> = {
  draft: "초안",
  approved: "승인됨",
  archived: "보관됨",
};

export const artifactStatusTone: Record<VentureArtifactStatus, string> = {
  draft: "avl-pill avl-pill-neutral",
  approved: "avl-pill avl-pill-success",
  archived: "avl-pill avl-pill-warning",
};

export const artifactStatusDefaultNotes: Record<VentureArtifactStatus, string> = {
  draft: "수정을 위해 초안 상태로 되돌렸습니다.",
  approved: "다음 단계로 넘기기 위해 승인했습니다.",
  archived: "현재 판단 경로에서 보관 처리했습니다.",
};

export const artifactSourceLabels: Record<string, string> = {
  workbench: "실행 보드",
  manual: "수동",
  evidence_capture: "근거 캡처",
  experiment_result: "검증 결과",
  validation_summary: "검증 완료 요약",
  validation_sprint: "7일 검증 계획",
  extracted_idea_package: "아이디어 정리 자료",
  extracted_research_brief: "아이디어 조사 요약",
  extraction_portfolio: "아이디어 비교 리포트",
  prd_readiness_handoff: "기획서 전환 전달 내용",
  mvp_slice_plan: "첫 제작 범위 플랜",
  development_kickoff: "제작 시작 요약",
  agent_run_package: "제작 도구 전달 자료",
  development_process: "제작 준비 과정",
  development_report: "제작 완료 보고서",
  filtered_implementation_run: "선별 제작 자료",
  mvp_build_command: "제작 시작 명령",
  qa_acceptance_matrix: "품질 점검표",
  post_launch_learning: "출시 후 성과 확인",
  telemetry_adapter: "성과 신호 연결 자료",
  product_telemetry_funnel: "제품 사용 퍼널",
};
