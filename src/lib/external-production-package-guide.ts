import {
  buildDeliveryModeLabels,
  externalBuildToolProfiles,
  type BuildDeliveryMode,
  type ExternalBuildToolProfile,
} from "@/lib/build-delivery";
import type { ProductSurfaceProfile } from "@/lib/product-surface";

export function buildExternalProductionPackageGuide(
  profile: ProductSurfaceProfile,
  deliveryMode: BuildDeliveryMode = "external_tool",
  selectedTool: ExternalBuildToolProfile = externalBuildToolProfiles.cursor,
) {
  const isExternalDelivery = deliveryMode === "external_tool";
  const deliveryLabel = buildDeliveryModeLabels[deliveryMode];
  const deliveryFocus = isExternalDelivery
    ? selectedTool.packageFocus
    : "Venture Lab의 작업 순서 보드, 실행 할 일, 최종 실행, 성과 확인 화면에서 이어서 처리합니다.";
  const startMethod = isExternalDelivery
    ? selectedTool.startMethod
    : "STEP 6 작업 순서 보드에서 필요한 단계 결과만 저장하고, STEP 7 최종 실행과 STEP 8 성과 확인으로 이어갑니다.";
  const selectedToolSteps = selectedTool.handoffSteps.map((step, index) => `${index + 1}. ${step}`).join("\n");
  const selectedToolFiles = selectedTool.packageFiles.map((file) => `- ${file}`).join("\n");

  return `## 제작 패키지 목차

| 묶음 | 포함 내용 | 다음 제작 환경에서 할 일 |
| --- | --- | --- |
| 00 실행 요약 | 가치, 사용자, 현재 판단, 제작 형태 | 이번 제작 범위가 맞는지 먼저 확인 |
| 01 검증 근거 | 조사 요약, 시장·경쟁 점검, 실험/근거 기록 | 아직 추정인 항목과 확정 근거를 분리 |
| 02 제품 기획 | 제품 기획서, 첫 제작 범위, 제외 범위 | Slice 1에 들어갈 화면과 기능만 잠금 |
| 03 디자인 기준 | 화면 구조, 상태, 모바일/접근성 기준 | ${profile.iaHint} 기준으로 화면 설계 |
| 04 기술 방향 | 스택, 데이터/권한 경계, 환경변수 | ${profile.stackHint} 기준으로 구현 경계 확인 |
| 05 작업 순서 | 바로 시작할 태스크, 대기 태스크, 수용 기준 | 첫 태스크부터 작게 구현하고 증거 저장 |
| 06 검증/배포 | 품질 명령, smoke, 배포/롤백 기준 | 완료 보고에 실행 결과와 URL 남기기 |

## 외부 제작 패키지 구성

\`\`\`yaml
package_version: 1
product_surface: ${profile.key}
product_surface_label: ${profile.label}
build_delivery_mode: ${deliveryMode}
build_delivery_label: ${deliveryLabel}
external_tool: ${isExternalDelivery ? selectedTool.key : "none"}
external_tool_label: ${isExternalDelivery ? selectedTool.label : "none"}
entrypoint: 00-execution-summary
read_order:
  - 00-execution-summary
  - 01-validation-evidence
  - 02-product-scope
  - 03-design-direction
  - 04-technical-boundary
  - 05-implementation-sequence
  - 06-quality-deploy
required_before_build:
  - saved_validation_summary
  - saved_market_competition_scan
  - saved_design_direction
  - saved_development_plan
  - saved_production_package
first_build: ${profile.firstBuild}
implementation_boundary: ${profile.harnessFocus}
handoff_boundary: ${profile.handoffHint}
delivery_focus: ${deliveryFocus}
secret_policy: never include secret values in execution instructions, artifacts, screenshots, external resources, or completion reports
completion_report:
  - changed_files
  - quality_commands
  - deployment_or_preview_url
  - remaining_risks
  - rollback_notes
\`\`\`

## 선택한 제작 방식

- 결과물 형태: ${profile.label}
- 제작 방식: ${deliveryLabel}
- 선택 도구: ${isExternalDelivery ? selectedTool.label : "Venture Lab 내부 진행"}
- 도구 상태: ${isExternalDelivery ? selectedTool.automationLabel : "내부 개발 준비"}
- 전달 초점: ${deliveryFocus}
- 시작 방법: ${startMethod}
- 시작 파일: ${isExternalDelivery ? selectedTool.startFileName : "Venture Lab 내부 실행 자료"}

## 선택 도구 시작 순서

${isExternalDelivery ? selectedToolSteps : "1. STEP 6에서 작업 순서를 확인합니다.\n2. 내부 개발 도구가 연결되면 같은 패키지로 구현 세션을 시작합니다.\n3. 완료 보고와 성과 확인은 Venture Lab 안에 남깁니다."}

## 선택 도구에 맞춘 파일

${isExternalDelivery ? selectedToolFiles : "- AI_VENTURE_PACKAGE.md\n- AI_VENTURE_TASKS.md\n- Venture Lab 내부 완료 보고"}

${isExternalDelivery ? `> ${selectedTool.handoffNote}` : "> 내부 개발 자동화는 별도 개발 도구 연결 후 열립니다."}

## 외부 제작 도구 자료

| 리소스 URI | 내용 | 권한 |
| --- | --- | --- |
| venture://production-package/00-execution-summary | 가치, 사용자, 제작 형태, 현재 판단 | 읽기 전용 |
| venture://production-package/01-validation-evidence | 조사 요약, 시장·경쟁 점검, 검증 결과 | 읽기 전용 |
| venture://production-package/02-product-scope | 제품 기획서, 첫 제작 범위, 제외 범위 | 읽기 전용 |
| venture://production-package/03-design-direction | 화면 구조, 상태, 모바일/접근성 기준 | 읽기 전용 |
| venture://production-package/04-technical-boundary | 스택, 데이터/권한 경계, 환경변수 경계 | 읽기 전용 |
| venture://production-package/05-implementation-sequence | 작업 순서, 수용 기준, 담당 역할 | 읽기 전용 |
| venture://production-package/06-quality-deploy | 품질 명령, smoke, 배포/롤백 기준 | 읽기 전용 |

## 전달 전 확인

- 제작 형태: ${profile.label}
- 제작 방식: ${deliveryLabel}
- 선택 도구: ${isExternalDelivery ? selectedTool.label : "내부 진행"}
- 첫 제작 형태: ${profile.firstBuild}
- 제작 기준: ${profile.harnessFocus}
- 외부 전달 기준: ${profile.handoffHint}
- 승인되지 않은 결제, 고급 자동화, 외부 계정 직접 조작, 대규모 관리자 기능은 만들지 않습니다.`;
}
