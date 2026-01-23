## English Education Platform (english-edu)
영어 교육을 위한 올인원 플랫폼 프로젝트<br/>
Spring Boot 기반의 백엔드와 React 기반의 프론트엔드로 구성된 모노레포 구조<br/>

## 🛠 Tech Stack
### Frontend 
- **Core**: React 18, TypeScript, Vite
- **State Management**: Zustand
- **Styling**: TailwindCSS, clsx, tailwind-merge
- **Routing**: React Router DOM v6
- **UI Components**: React Icons, Lucide React, Toast UI Editor
- **Http Client**: Axios
  
### Backend 
- **Framework**: Spring Boot 3.x
- **Language**: Java 17+
- **Build Tool**: Gradle
- **Database**: MySQL (JPA/Hibernate)
- **Security**: Spring Security, JWT
- **Cloud/Infra**: Google Cloud Platform (Text-to-Speech, Storage)<br/>

## 📂 Project Structure
```bash
english-edu/
├── api-server/       # Spring Boot Backend Code
│   ├── src/
│   └── build.gradle
├── english-app/      # React Frontend Code
│   ├── src/
│   ├── vite.config.ts
│   └── package.json
└── settings.gradle   # Gradle Root Settings

Prerequisites
Java JDK 17 이상
Node.js 18 이상
MySQL Server

1. Backend Setup (api-server)
bash
### 디렉토리 이동
cd api-server
### Build & Run
./gradlew bootRun
### 설정파일
application.yml

2. Frontend Setup (english-app)
bash
### 디렉토리 이동
cd english-app
### 의존성 설치
npm install
### 개발 서버 실행
npm run dev

Game Contents
Crossword Puzzle: 단어 십자말풀이
Falling Words: 떨어지는 단어 맞추기 게임
Maze Adventure: 미로 찾기 모험
Mystery Cards: 카드 뒤집기 퀴즈

Core Features
User System: 회원가입, 로그인 (JWT 기반), 마이페이지
Dashboard: 학습 현황 차트 및 통계 (Chart.js)
Community: 게시판 기능, 에디터 지원 (Toast UI)
Admin: 관리자 전용 대시보드 및 콘텐츠 관리
