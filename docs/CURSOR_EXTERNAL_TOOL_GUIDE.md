# Cursor External Tool Guide

AI Venture Lab의 외부 제작 도구 흐름은 최종 실행 단계에서 Cursor가 바로 읽을 수 있는 연결 파일을 만드는 방식으로 시작한다.

## 사용자가 하는 일

1. Venture Lab에서 아이디어 검증과 제작 패키지 저장을 끝낸다.
2. 최종 실행 단계에서 제작 방식이 `외부 제작 도구로 개발`이고 도구가 `Cursor`인지 확인한다.
3. 화면이 `Codex`, `Claude Code`, `Google Antigravity` 등 다른 도구로 보이면 최종 실행 단계의 `사용할 개발 도구`에서 `Cursor`를 선택한다.
4. `Cursor 연결 파일 받기`를 눌러 `*-cursor-setup.ps1` 파일을 받는다.
5. 브라우저 다운로드 폴더에 있는 파일을 실제 개발할 Cursor 프로젝트 루트로 옮긴다.
6. Cursor에서 해당 프로젝트 폴더를 연다.
7. Cursor 터미널 또는 PowerShell에서 실행한다.

```powershell
powershell -ExecutionPolicy Bypass -File .\your-project-cursor-setup.ps1
```

8. Cursor를 다시 열고 MCP 설정에서 `ai-venture-lab` 서버가 보이는지 확인한다.
9. `AI_VENTURE_CURSOR_START.md` 내용을 Composer에 붙여 넣어 첫 작업을 시작한다.
10. 작업을 마치면 Cursor 완료 보고 또는 `.cursor/venture-lab-progress.json` 내용을 Venture Lab 최종 실행 화면의 `Cursor 진행 결과 가져오기`에 붙여넣는다.

## 생성되는 파일

- `AI_VENTURE_PACKAGE.md`: PRD, IA, 디자인 기준, 기술 경계, 작업 순서, 검증 기준을 묶은 최종 제작 패키지
- `AI_VENTURE_TASKS.md`: Cursor가 순서대로 처리할 제작 작업 목록
- `AI_VENTURE_CURSOR_START.md`: Cursor Composer에 붙여 넣을 시작 지시문
- `README_VENTURE_LAB_CURSOR.md`: 사용자용 연결 가이드
- `.cursor/rules/ai-venture-lab.mdc`: Cursor가 항상 참고할 프로젝트 규칙
- `.cursor/mcp.json`: 프로젝트 전용 MCP 서버 설정
- `.cursor/venture-lab-mcp-server.mjs`: 로컬 MCP 브리지
- `.cursor/venture-lab-progress.json`: Cursor 작업 진행 기록

`AI_VENTURE_TASKS.md`는 Venture Lab에 저장된 작업이 아직 없어도 제작 패키지의 기본 작업 순서 9개를 포함한다. 작업 완료 후 진행 기록을 다시 가져오면 Venture Lab의 `implementation_tasks` 목록과 상태가 현재 로그인한 사용자 권한으로 저장 또는 갱신된다.

## MCP 연결 범위

현재 구현은 Cursor 프로젝트 내부에 로컬 MCP 브리지를 설치한다. Cursor는 다음 리소스와 도구를 사용할 수 있다.

- `venture://package`: 최종 제작 패키지
- `venture://tasks`: 제작 작업 목록
- `venture://guide`: 연결 가이드
- `venture://start`: 시작 지시문
- `venture_next_task`: 다음 제작 작업 확인
- `venture_record_progress`: 완료 요약을 `.cursor/venture-lab-progress.json`에 기록

## 아직 포함하지 않는 것

Venture Lab 서버의 `implementation_tasks` 상태를 Cursor가 자동으로 수정하는 원격 쓰기 동기화는 아직 넣지 않는다. 이 기능은 사용자별 인증 토큰, 프로젝트 권한 확인, 쓰기 범위 제한, 실패 시 롤백 기준이 필요하다. 현재는 최종 실행 화면의 가져오기 버튼이 로그인된 사용자의 권한으로 안전하게 서버 상태를 갱신한다.

## 운영 원칙

- 화면에는 “자동 동기화 완료”처럼 아직 없는 기능으로 보이는 표현을 쓰지 않는다.
- 최종 실행 단계는 파일을 받는 문서함이 아니라 외부 제작 도구에 실제 연결 자료를 설치하는 단계로 설명한다.
- Cursor 연결은 `.cursor/rules`와 `.cursor/mcp.json`을 중심으로 한다.
- 진행 기록은 먼저 로컬 파일에 남기고, Venture Lab 화면에서 사용자가 확인한 뒤 가져온다.
- 서버 자동 쓰기 동기화는 별도 보안 설계 후 추가한다.
