import { useEffect, useState } from "react";
import { useLocation, useNavigate, Outlet } from "react-router-dom";
import { useUserStore } from "@/store/userStore";
import Header from "@/components/common/Header"; // Header 컴포넌트 경로 확인 필요

export default function RootLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoggedIn, user } = useUserStore();
  
  // Hydration 체크 (Zustand Persist)
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // Zustand persist hydration 체크
    const unsub = (useUserStore as any).persist.onFinishHydration(() => setIsHydrated(true));
    if ((useUserStore as any).persist.hasHydrated()) {
      setIsHydrated(true);
    }
    return () => unsub();
  }, []);

  // 라우트 세그먼트 분석 (URL 파싱)
  // 예: /admin/dashboard -> ['', 'admin', 'dashboard']
  const pathSegments = location.pathname.split('/');
  const rootSegment = pathSegments[1] || 'main'; // 첫 번째 경로 (없으면 main)
  const secondSegment = pathSegments[2];

  // 헤더 숨김 처리 로직
  const hideHeaderRoutes = ['game', 'english'];
  const shouldHideHeader = hideHeaderRoutes.includes(rootSegment);

  // 권한 체크 로직 (Auth Guard)
  useEffect(() => {
    if (!isHydrated) return;

    const inAdminZone = rootSegment === 'admin';
    const inUserZone = rootSegment === 'user' || (rootSegment === 'auth' && (secondSegment === 'cart' || secondSegment === 'place'));

    // 1. 비로그인 접근 제한
    if (!isLoggedIn && (inAdminZone || inUserZone)) {
      navigate('/auth/login', { replace: true });
      return;
    }

    // 2. 관리자 권한 제한
    if (inAdminZone && user?.role !== 'ADMIN') {
      alert("Permission required by admin");
      navigate(-1); // 뒤로가기
      return;
    }
  }, [isLoggedIn, user, rootSegment, secondSegment, isHydrated, navigate]);

  // Hydration 전에는 아무것도 렌더링하지 않음 (깜빡임 방지)
  if (!isHydrated) return null;

  return (
    <div className="flex flex-col min-h-screen">
      {/* 조건부 헤더 렌더링 */}
      {!shouldHideHeader && <Header />}
      
      {/* 실제 페이지 내용이 들어가는 곳 */}
      <main className="flex-1 flex flex-col relative">
        <Outlet />
      </main>
    </div>
  );
}
