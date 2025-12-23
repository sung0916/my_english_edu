// import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';
import { Platform } from 'react-native';
import create from 'zustand';
import { persist } from 'zustand/middleware';

// 플래폼 별 스토리지 선택 함수
const getStorage = () => {

    if (Platform.OS === 'web') {

        // 웹에서 localStorage 사용 (SSR 안전)
        if (typeof window === 'undefined') {

            // SSR 중에는 빈 스토리지 반환(에러 방지)
            return {
                getItem: () => null,
                setItem: () => null,
                removeItem: () => { },
            };
        }
        // 클라이언트에서는 window.localStorage 사용
        return window.localStorage;
    }

    // IOS, Android에서는 AsyncStorage 사용
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    return AsyncStorage;
};

// User 타입을 명확히 분리 -> 재사용성 및 가독성
interface User {
    userId: number;
    username: string;
    email: string;
    tel: string;
    role: 'STUDENT' | 'TEACHER' | 'ADMIN';
}

// 스토어에서 관리할 상태의 타입
interface UserState {
    user: User | null;
    token: string | null;
    isLoggedIn: boolean;
    login: (userData: User, token: string) => void;
    logout: () => void;
    clearPersistedStorage: () => void;  // 스토리지 비우기 함수
    checkTokenExpiry: () => void;
}

// JWT 디코딩 타입 정의
interface JwtPayload {
    exp: number;  // 만료 시간 (Unix Timestamp)
}

// 스토어 생성
export const useUserStore = create<UserState>(
    
    persist<UserState>(
        (set, get, api) => ({
            user: null,
            token: null,
            isLoggedIn: false,

            checkTokenExpiry: () => {
                const { token } = get();
                if (!token) {
                    set({ isLoggedIn: false, user: null });
                    return;
                }

                try {
                    const decoded = jwtDecode<JwtPayload>(token);
                    const currentTiem = Date.now() / 1000;  // 초 단위

                    // 토큰이 만료되었다면 로그아웃 처리
                    if (decoded.exp < currentTiem) {
                        console.log("토큰 만료, 자동 로그아웃 실행");
                        set({ user: null, token: null, isLoggedIn: false });
                    }

                } catch (err) {
                    set({ user: null, token: null, isLoggedIn: false });
                }
            },

            login: (userData, token) => set({
                user: userData,
                token: token,
                isLoggedIn: true,
            }),

            logout: () => set({
                user: null,
                token: null,
                isLoggedIn: false,
            }),

            // api를 사용하여 persist의 유틸리티 함수를 호출
            clearPersistedStorage: () => {
                return (api as any).persist.clearStorage();
            },
        }),
        { 
            // persist 설정 (v3 방식)
            name: 'user-auth-storage', // 1. 스토리지에 저장될 이름
            getStorage: getStorage,    // 2. v4의 'storage' 대신 'getStorage' 사용

            // 앱이 켜지거나, 사이트 방문하여 스토리지 불러온 직후 실행
            onRehydrateStorage: () => (state) => {
                state?.checkTokenExpiry();  // 만료 체크
            }
        }
    ),
);
