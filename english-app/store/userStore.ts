import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

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
    user: User;
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
            storage: createJSONStorage(() => AsyncStorage),  // 데이터를 저장할 장소로 AsyncStorage를 지정
        }
    )
)