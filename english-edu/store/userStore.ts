import { create } from 'zustand';

// 스토어에서 관리할 상태의 타입
interface UserState {
    user: {
        userId: number | null;
        username: string | null;
        email: string | null;
        role: string | null;
    };
    token: string | null;
    isLoggedIn: boolean;
    login: (userData: any, token: string) => void;
    logout: () => void;
}

// 스토어 생성
export const useUserStore = create<UserState>((set) => ({
    // 초기상태
    user: {
        userId: null,
        username: null,
        email: null,
        role: null,
    },
    token: null,
    isLoggedIn: false,

    // 상태를 변경하는 함수 (액션)
    login: (userData, token) => set({
        user: userData,
        token: token,
        isLoggedIn: true,
    }),

    logout: () => set({
        user: { userId: null, username: null, email: null, role: null },
        token: null,
        isLoggedIn: false,
    }),
}));