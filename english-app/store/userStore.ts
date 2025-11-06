// import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

// 플래폼 별 스토리지 선택 함수
const getStorage = () => {

    if (Platform.OS === 'web') {

        // 웹에서 localStorage 사용 (SSR 안전)
        if(typeof window === 'undefined') {

            // SSR 중에는 빈 스토리지 반환(에러 방지)
            return {
                getItem: () => null,
                setItem: () => null,
                removeItem: () => {},
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
}

// 스토어 생성
export const useUserStore = create(
    persist<UserState>(
        (set) => ({
            user: null,
            token: null,
            isLoggedIn: false,

            // 상태 변경하는 함수
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
        }),

        // persist 설정 추가
        {
            name: 'user-auth-storage',  // 기기에 저장될 때 사용될 이름(랜덤 가능)
            storage: createJSONStorage(getStorage),  // 데이터를 저장할 장소로 AsyncStorage를 지정
        }
    )
);
