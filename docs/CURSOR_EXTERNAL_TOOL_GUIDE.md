# Cursor External Tool Guide

이 문서는 Cursor를 선택했을 때의 프로젝트 연결 절차만 다룬다. Cursor, Codex, Claude Code, Google Antigravity의 공통 패키지 계약은 `docs/EXTERNAL_PRODUCTION_PACKAGE.md`를 기준으로 본다.

AI Venture Lab의 Cursor 외부 제작 흐름은 최종 실행 단계에서 Cursor가 바로 읽을 수 있는 연결 파일을 만드는 방식으로 시작한다. 화면의 기본 흐름은 `실행만 하기`로, 연결 파일 받기, 실제 프로젝트 루트 이동, 설치/확인 명령 실행, 첫 작업 시작만 먼저 보여준다. 최종 실행 화면은 받을 setup 파일명을 함께 보여주며, `Cursor 연결 파일 받기`가 첫 행동이고 `설치 후 시작 지시문 복사`는 설치와 확인 명령이 끝난 뒤 사용하는 보조 행동이다.

## 사용자가 하는 일

1. Venture Lab에서 아이디어 검증과 제작 패키지 저장을 끝낸다.
2. 최종 실행 단계에서 제작 방식이 `외부 제작 도구로 개발`이고 도구가 `Cursor`인지 확인한다.
3. 화면이 `Codex`, `Claude Code`, `Google Antigravity` 등 다른 도구로 보이면 최종 실행 단계의 `사용할 개발 도구`에서 `Cursor`를 선택한다.
4. 화면에 표시된 받을 파일명을 확인한 뒤 `Cursor 연결 파일 받기`를 눌러 `*-cursor-setup.ps1` 파일을 받는다.
5. 브라우저 다운로드 폴더에 있는 파일을 실제 개발할 Cursor 프로젝트 루트로 옮긴다.
6. Cursor에서 해당 프로젝트 폴더를 연다. 현재 터미널이 다운로드 폴더라면 먼저 실제 프로젝트 루트로 이동한다.
7. Cursor 터미널 또는 PowerShell에서 먼저 설치 명령을 실행한다.

```powershell
powershell -ExecutionPolicy Bypass -File .\your-project-cursor-setup.ps1
```

8. 설치가 끝난 뒤 같은 프로젝트 루트 터미널에서 확인 명령을 실행해 첫 작업이 읽히는지 확인한다.

```bash
node .cursor/venture-lab-cli.mjs next-task
```

9. Cursor를 다시 열고 Settings > MCP의 `Workspace MCP Servers`에서 `ai-venture-lab` 서버가 보이는지 확인한다.
10. `ai-venture-lab`이 `Disabled`로 표시되면 토글을 켠다. 처음 1회는 Cursor 보안 확인 때문에 사용자가 직접 활성화해야 할 수 있다.
11. `ai-venture-lab`이 Enabled 상태이고 도구가 활성화됐는지 확인한다.
12. 설치와 확인 명령이 끝난 뒤 `설치 후 시작 지시문 복사` 또는 `AI_VENTURE_CURSOR_START.md` 내용을 Composer에 붙여 넣어 첫 작업을 시작한다.
13. 작업을 마치면 Cursor에게 `venture_record_progress` 도구로 완료 보고를 남기라고 지시한다.
14. Venture Lab 최종 실행 화면을 새로고침해 작업 상태가 반영됐는지 확인한다.
15. 자동 반영이 실패한 경우에만 `.cursor/venture-lab-progress.json` 내용을 Venture Lab 최종 실행 화면의 백업 가져오기에 붙여넣는다.

## 생성되는 파일

- `AI_VENTURE_PACKAGE.md`: PRD, IA, 디자인 기준, 기술 경계, 작업 순서, 검증 기준을 묶은 최종 제작 패키지
- `AI_VENTURE_TASKS.md`: Cursor가 순서대로 처리할 제작 작업 목록
- `AI_VENTURE_CURSOR_START.md`: Cursor Composer에 붙여 넣을 시작 지시문
- `README_VENTURE_LAB_CURSOR.md`: 사용자용 연결 가이드
- `.cursor/rules/ai-venture-lab.mdc`: Cursor가 항상 참고할 프로젝트 규칙
- `.cursor/mcp.json`: 프로젝트 전용 MCP 서버 설정
- `.cursor/venture-lab-cli.mjs`: `next-task`, `record-progress`, `status`, `read`, `mcp`를 제공하는 로컬 CLI 겸 MCP 브리지
- `.cursor/venture-lab-mcp-server.mjs`: 기존 설정 호환용 MCP 실행 파일
- `.cursor/venture-lab-sync.json`: Venture Lab 자동 반영 토큰과 서버 주소
- `.cursor/venture-lab-progress.json`: Cursor 작업 진행 기록

`AI_VENTURE_TASKS.md`는 Venture Lab에 저장된 작업이 아직 없어도 제작 패키지의 기본 작업 순서 9개를 포함한다. 작업 완료 후 Cursor가 `venture_record_progress`를 호출하면 진행 기록이 로컬 파일에 남고, 같은 내용이 Venture Lab의 `implementation_tasks` 목록과 상태로 저장 또는 갱신된다.

## MCP 연결 범위

현재 구현은 Cursor 프로젝트 내부에 로컬 MCP 브리지를 설치한다. Cursor는 다음 리소스와 도구를 사용할 수 있다.

- `venture://package`: 최종 제작 패키지
- `venture://tasks`: 제작 작업 목록
- `venture://guide`: 연결 가이드
- `venture://start`: 시작 지시문
- `venture_next_task`: 다음 제작 작업 확인
- `venture_record_progress`: 완료 요약을 `.cursor/venture-lab-progress.json`에 기록하고 Venture Lab 서버에 동기화

같은 파일은 터미널에서도 사용할 수 있다.

```bash
node .cursor/venture-lab-cli.mjs status
node .cursor/venture-lab-cli.mjs next-task
node .cursor/venture-lab-cli.mjs read start
node .cursor/venture-lab-cli.mjs record-progress --task T-001 --status done --summary "작업 완료" --verification "pnpm build passed"
```

CLI는 토큰 원문을 출력하지 않는다. 진행 결과는 로컬 기록에 먼저 남기고, 설정이 있으면 같은 내용을 Venture Lab 서버에 동기화한다.

## 자동 동기화 범위

최종 실행 단계에서 `Cursor 연결 파일 받기`를 누르면 Venture Lab이 프로젝트 전용 토큰을 발급한다. 이 토큰은 `.cursor/venture-lab-sync.json`에 들어가며, Cursor 로컬 MCP 브리지가 `/api/build-sync/progress`로 완료 기록을 보낼 때 사용한다.

서버는 이 토큰으로 다음 범위만 허용한다.

- 토큰에 묶인 아이디어의 `implementation_tasks` 생성/갱신
- 작업 상태, 완료 요약, 변경 파일, 검증 기록 저장
- 아이디어 소유자 또는 워크스페이스 owner/admin 권한 재확인

토큰은 서버 비밀값으로 서명되며, 기본 만료 기간은 30일이다. 만료 후에는 최종 실행 단계에서 `Cursor 연결 파일 받기`를 다시 눌러 새 연결 파일을 받아야 한다. 자동 동기화가 실패하면 로컬 기록 파일을 최종 실행 화면의 백업 가져오기에 붙여넣어 같은 결과를 반영한다.

## 토큰 수명과 회수

- 연결 파일을 다시 받으면 새 토큰이 발급된다.
- `public.build_sync_tokens` 마이그레이션이 적용된 환경에서는 토큰 원문을 저장하지 않고 SHA-256 해시, 상태, 만료 시각, 최근 사용 시각만 저장한다.
- 최종 실행 화면의 `Cursor 연결 관리`에서 개별 연결을 끊으면 해당 연결 파일의 서버 자동 반영이 거부된다.
- SQL이 아직 적용되지 않은 환경에서는 기존 서명 토큰이 legacy mode로 계속 동작하지만, 개별 연결 끊기는 비활성 상태로 보인다.
- 토큰이 외부에 노출됐다고 판단되면 해당 연결을 끊는다. 개별 회수 UI가 아직 열리지 않은 환경에서는 `BUILD_SYNC_TOKEN_SECRET`을 교체하고 프로덕션을 재배포해 기존 Cursor 연결 토큰을 모두 무효화한다.
- `BUILD_SYNC_TOKEN_SECRET`이 없을 때는 `SUPABASE_SERVICE_ROLE_KEY` 또는 `TELEMETRY_INGEST_SECRET`이 서명 비밀값으로 사용될 수 있으므로, 운영 환경에서는 별도 `BUILD_SYNC_TOKEN_SECRET`을 설정하는 편이 좋다.

## 운영 스모크

`build_sync_tokens` SQL 적용 후 아래 명령으로 연결 장부를 검증한다.

```bash
pnpm smoke:build-sync
```

이 스모크는 로그인 세션으로 named external connector 토큰을 발급하고, 연결 목록이 `ready`인지 확인하고, 가능한 경우 disposable 아이디어에 진행 결과를 한 번 반영한다. Cursor 경로에서는 STEP 7 최종 실행 화면에서 `Cursor에서 시작하는 순서`와 `node .cursor/venture-lab-cli.mjs next-task` 확인 명령이 보이는지 검증한다. Codex, Claude Code, Google Antigravity 경로에서는 각 도구의 설치 파일, 시작 지시문, 로컬 진행 기록, 차단된 토큰 거부 흐름이 같은 계약을 따르는지 확인한다. 이어서 `/workspace?task=learning&idea=...`로 STEP 8 성과 확인 화면을 열어 다음 작업 중심의 진행 요약과 `전체 진행표 보기` 안의 동기화된 작업 상태를 확인한다. 마지막으로 연결을 끊고 같은 토큰의 후속 반영이 401로 거부되는지 확인한다. 검증용 아이디어를 만들 수 있는 환경에서는 끝나면 자동 삭제한다.

## 운영 원칙

- 화면에는 자동 반영이 기본 흐름이고 백업 가져오기는 실패 시 보조 경로임을 분명히 쓴다.
- 최종 실행 단계는 파일을 받는 문서함이 아니라 외부 제작 도구에 실제 연결 자료를 설치하는 단계로 설명한다.
- Cursor 연결은 `.cursor/rules`와 `.cursor/mcp.json`을 중심으로 한다.
- 진행 기록은 먼저 로컬 파일에 남기고, 서버 자동 반영을 시도한다.
- `.cursor/venture-lab-sync.json`과 `.cursor/venture-lab-progress.json`은 설치 스크립트가 프로젝트 `.gitignore`에 추가한다.
