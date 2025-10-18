# Waffice-Web

와플 스튜디오 내부 관리 시스템 프론트엔드

## 프로젝트 소개

**Waffice-Web**은 와플 스튜디오의 내부 운영을 효율적으로 관리하기 위한 관리자 대시보드 웹 애플리케이션입니다. Next.js 15 기반으로 구축되었으며, 멤버 관리, 프로젝트 추적 등의 기능을 제공합니다.

## 주요 기능

### 대시보드 (/)
- 전체 통계 한눈에 보기 (멤버 수, 활성 프로젝트)
- 최근 활동 피드
- 빠른 작업 바로가기

### 멤버 관리 (/members)
- 스튜디오 멤버 조회 및 관리
- 멤버 추가, 수정, 삭제
- 상태 관리 (활성, 비활성, 정지)
- 멤버 정보 (이름, 이메일, 전화번호)

### 프로젝트 관리 (/projects)
- 프로젝트 생성 및 관리
- 프로젝트 상태 추적 (기획 중, 진행 중, 완료, 취소)
- 예산 설정 및 관리
- 프로젝트 멤버 할당
- 프로젝트 편집 및 삭제

## 기술 스택

### 프레임워크 및 라이브러리
- **Next.js 15.5.3** - React 프레임워크 (App Router, Turbopack)
- **React 19.1.0** - UI 라이브러리
- **TypeScript 5** - 정적 타입 검사

### UI 및 스타일링
- **Tailwind CSS 4** - 유틸리티 기반 CSS 프레임워크
- **Radix UI** - 접근성을 고려한 UI 컴포넌트 프리미티브
- **lucide-react** - 아이콘 라이브러리
- **shadcn/ui** - 재사용 가능한 컴포넌트 컬렉션

### 폼 및 검증
- **react-hook-form 7.62.0** - 고성능 폼 관리
- **zod 4.1.9** - TypeScript 기반 스키마 검증

### 데이터 관리
- **@tanstack/react-query 5.89.0** - 서버 상태 관리 및 데이터 페칭

### 개발 도구
- **Biomejs 2.2.6** - 린터 및 포매터
- **pnpm** - 빠르고 효율적인 패키지 매니저

## 프로젝트 구조

```
waffice-web/
├── src/
│   ├── app/                      # Next.js App Router 페이지
│   │   ├── layout.tsx           # 루트 레이아웃
│   │   ├── page.tsx             # 대시보드 홈
│   │   ├── members/             # 멤버 관리 페이지
│   │   └── projects/            # 프로젝트 관리 페이지
│   │
│   ├── components/
│   │   ├── layout/              # 레이아웃 컴포넌트 (사이드바, 네비게이션)
│   │   ├── ui/                  # 재사용 가능한 UI 컴포넌트
│   │   ├── members/             # 멤버 관련 컴포넌트
│   │   ├── projects/            # 프로젝트 관련 컴포넌트
│   │   └── providers/           # React Query 프로바이더
│   │
│   ├── lib/
│   │   ├── api.ts               # API 클라이언트
│   │   └── utils.ts             # 유틸리티 함수
│   │
│   └── types/
│       └── index.ts             # TypeScript 타입 정의
│
├── .github/
│   └── workflows/
│       └── ci.yml               # GitHub Actions CI 설정
│
├── openapi.json                 # 백엔드 API 명세
├── package.json
├── tsconfig.json
├── biome.json
├── next.config.ts
└── tailwind.config.ts
```

## 시작하기

### 사전 요구사항

- **Node.js** 18 이상
- **pnpm** 8 이상 (권장) 또는 npm/yarn

### 설치

```bash
# 저장소 클론
git clone https://github.com/wafflestudio/waffice-web.git
cd waffice-web

# 의존성 설치
pnpm install
```

### 환경 변수 설정

프로젝트 루트에 `.env.local` 파일을 생성하고 다음 변수를 설정하세요:

```bash
# 백엔드 API URL
NEXT_PUBLIC_API_URL=http://localhost:8000
```

**참고**: 환경 변수를 설정하지 않으면 기본값 `http://localhost:8000`이 사용됩니다.

### 개발 서버 실행

```bash
pnpm dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 애플리케이션을 확인하세요.

### 프로덕션 빌드

```bash
# 빌드
pnpm build

# 프로덕션 서버 시작
pnpm start
```

## 사용 가능한 스크립트

```bash
# 개발 서버 실행 (Turbopack 사용)
pnpm dev

# 프로덕션 빌드
pnpm build

# 프로덕션 서버 시작
pnpm start

# 코드 린팅
pnpm lint

# 린팅 문제 자동 수정
pnpm lint:fix

# 코드 포매팅
pnpm format

# 포매팅 확인 (수정 없이)
pnpm format:check
```

## API 통합

이 프로젝트는 백엔드 API와 통합되어 있으며, API 명세는 `openapi.json` 파일에 정의되어 있습니다.

### API 클라이언트

모든 API 호출은 `src/lib/api.ts`의 `ApiClient` 클래스를 통해 이루어집니다.

**구현된 API:**
- 사용자 관리 (생성, 등록, 거부, 조회, 업데이트, 접근 제어)
- 사용자 히스토리 (생성, 조회, 전체 조회)

**대기 중인 API (백엔드 준비 중):**
- 멤버 관리
- 프로젝트 관리

현재 대기 중인 API는 모의 엔드포인트를 사용하며, 콘솔에 경고 메시지가 표시됩니다.

## 개발 가이드

### 코드 스타일

- **TypeScript**: 엄격 모드 사용, `any` 타입 지양
- **React**: 함수형 컴포넌트, Hooks 사용
- **스타일링**: Tailwind CSS 유틸리티 클래스 사용
- **폼**: react-hook-form + Zod 검증 패턴 사용

### 커밋 전 체크리스트

커밋하기 전에 **반드시** 다음 명령어를 실행하여 모든 검사를 통과해야 합니다:

```bash
# 1. 포매팅 확인
pnpm run format:check

# 2. 린팅 확인
pnpm run lint

# 3. 자동 수정 가능한 문제 수정
pnpm run lint:fix

# 4. 빌드 확인
pnpm run build
```

모든 검사가 통과해야 PR을 생성하거나 메인 브랜치에 푸시할 수 있습니다.

### CI/CD

GitHub Actions를 통해 다음 검사가 자동으로 실행됩니다:

1. 코드 포매팅 검사
2. 린팅 검사
3. 프로덕션 빌드 검사

**위치**: `.github/workflows/ci.yml`

### 새 기능 추가하기

1. 백엔드 API 명세 확인 (`openapi.json`)
2. 필요한 타입 정의 추가 (`src/types/index.ts`)
3. API 메서드 구현 (`src/lib/api.ts`)
4. 컴포넌트 작성 (`src/components/[domain]/`)
5. 페이지 작성 (`src/app/[route]/page.tsx`)
6. 네비게이션 업데이트 (`src/components/layout/navigation.tsx`)

## 트러블슈팅

### 빌드 오류

```bash
# 의존성 재설치
pnpm install

# .next 폴더 삭제 후 재빌드
rm -rf .next
pnpm build
```

### 린팅 오류

```bash
# 자동 수정 가능한 문제 수정
pnpm run lint:fix

# 나머지 문제는 수동으로 수정
```

### API 연결 오류

- 백엔드 서버가 실행 중인지 확인
- `.env.local`의 `NEXT_PUBLIC_API_URL`이 올바른지 확인
- CORS 설정 확인
- 브라우저 개발자 도구의 Network 탭에서 요청 확인

## 기여하기

1. 이슈를 생성하거나 기존 이슈를 선택합니다
2. 기능 브랜치를 생성합니다 (`git checkout -b feature/amazing-feature`)
3. 변경사항을 커밋합니다 (`git commit -m 'Add some amazing feature'`)
4. 브랜치를 푸시합니다 (`git push origin feature/amazing-feature`)
5. Pull Request를 생성합니다

**중요**: PR 생성 전 모든 CI 검사를 통과해야 합니다.

## 라이선스

이 프로젝트는 와플 스튜디오의 내부 프로젝트입니다.

## 문의

문제가 발생하거나 질문이 있으시면 이슈를 생성해주세요.

---

**개발자를 위한 추가 문서**: [AGENTS.md](./AGENTS.md)
