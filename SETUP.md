# 설정 가이드

## 1. 환경변수 채우기

`.env.local` 파일을 열어 아래 네 값을 직접 채워주세요 (플레이스홀더만 들어있는 상태입니다).

```
NEXT_PUBLIC_SUPABASE_URL=      # Supabase 프로젝트 Settings > API > Project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY= # Supabase 프로젝트 Settings > API > anon public key
GEMINI_API_KEY=                # Google AI Studio에서 발급받은 키
GEMINI_MODEL=gemini-3.5-flash  # 모델이 종료(404)되면 이 값만 교체하면 됩니다
```

## 2. Supabase 스키마 적용

1. Supabase 대시보드 > **SQL Editor** 로 이동
2. `supabase/migrations/0001_init.sql` 파일 내용 전체를 복사해서 붙여넣고 **Run**
   - `pins` 테이블 + RLS 정책 4개
   - `walk-photos` 비공개 Storage 버킷 + 정책 4개
   - Realtime publication에 `pins` 테이블 추가

## 3. 이메일 인증 끄기 (중요)

Supabase는 기본적으로 회원가입 시 이메일 인증을 요구합니다. 이 앱은 PRD상 **이메일 인증 없이** 가입 즉시 로그인되어야 합니다.

- Authentication > Providers > Email > **Confirm email** 토글을 꺼주세요

이 설정을 끄지 않으면 회원가입 후 세션이 없어서 곧바로 로그인 화면으로 돌아가게 됩니다.

## 4. 실행

```bash
npm run dev
```

`http://localhost:3000` 접속 → 회원가입 → 온보딩 → 피드.

## 5. 확인해볼 것

- 갤러리 업로드(카메라가 없는 데스크톱에서도 테스트 가능)로 촬영 플로우 진행
- 피드에 pending 스켈레톤이 뜬 뒤 몇 초 안에 캡션이 채워지는지 확인 (Gemini 응답)
- 지도 탭에서 핀이 찍히는지, 대시보드에서 태그/요일/무드 위젯이 나오는지 확인 (핀 3개 이상부터)
- 모바일(특히 iOS Safari)에서 실제 카메라 촬영 + 위치 권한 흐름은 로컬 HTTPS 또는 배포 환경에서만 정확히 테스트됩니다 (카메라 제스처 제약, geolocation 권한 등)

## 6. PWA 설치 확인

`npm run build && npm run start` 로 프로덕션 빌드를 띄운 뒤 브라우저에서:

- `/manifest.json`, `/sw.js`, `/icons/icon-192.png`, `/icons/icon-512.png` 가 모두 200으로 응답하는지 확인 (이미 로컬에서 확인됨)
- 크롬 개발자도구 > Application > Manifest 탭에서 아이콘/이름/테마색이 올바르게 인식되는지 확인
- 실제 "홈 화면에 추가" 설치는 **HTTPS 환경(배포 후)**에서만 브라우저가 허용합니다. `localhost`는 예외적으로 허용되지만 배포 도메인은 반드시 HTTPS여야 합니다.

## 7. Vercel 배포

1. GitHub 등에 레포지토리를 올린 뒤 [vercel.com](https://vercel.com)에서 Import
2. Framework는 Next.js로 자동 인식됩니다 (별도 설정 파일 불필요)
3. **Settings > Environment Variables** 에 `.env.local`과 동일한 4개 값을 등록
   - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `GEMINI_API_KEY`, `GEMINI_MODEL`
4. 등록 후에는 반드시 **재배포**해야 값이 반영됩니다 (환경변수만 바꾸고 재배포 안 하면 이전 빌드에 반영 안 됨)
5. `/api/caption` 라우트는 Node 런타임 + `maxDuration=30`으로 설정되어 있어 Vercel의 서버리스 함수로 그대로 동작합니다
6. 배포된 도메인(HTTPS)에서 모바일로 접속 → 브라우저 메뉴의 "홈 화면에 추가"로 설치 테스트
