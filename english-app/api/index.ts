import axios, { AxiosError } from 'axios';
import { router } from 'expo-router';
import { useUserStore } from '../store/userStore';

// JSON 데이터를 위한 기본 API 클라이언트
const apiClient = axios.create({
    baseURL: 'http://localhost:8080',
    headers: {
        'Content-Type': 'application/json',
    },
});

// 파일 등 멀티파트 데이터를 위한 API 클라이언트
export const apiClientWithFile = axios.create({
    baseURL: 'http://localhost:8080',
    headers: {
        'Content-Type': 'multipart/form-data',
    },
});

// 모든 요청에 토큰을 주입하는 '요청 인터셉터' 함수
const requestInterceptor = (config: any) => { // config 타입을 any 또는 InternalAxiosRequestConfig로 지정
    const token = useUserStore.getState().token; // 'toekn' 오타 수정
    if (token) {
        config.headers.Authorization = `Bearer ${token}`; // 템플릿 리터럴 오타 수정
    }
    return config;
};

// 토큰 만료 시 자동 로그아웃을 처리하는 '응답 인터셉터' 함수
const responseInterceptor = (error: AxiosError) => {
    if (error.response && error.response.status === 401) {
        console.log('인증 실패 또는 토큰 만료. 로그아웃 처리합니다.');
        useUserStore.getState().logout();
        router.replace('/login');
    }
    return Promise.reject(error);
};

// 생성된 두 개의 클라이언트 인스턴스에 인터셉터를 적용
apiClient.interceptors.request.use(requestInterceptor);
apiClientWithFile.interceptors.request.use(requestInterceptor); // 파일 클라이언트에도 동일하게 적용

apiClient.interceptors.response.use(
    (response) => response, // 성공 응답은 그대로 통과
    responseInterceptor    // 실패 응답은 위에서 만든 함수로 처리
);
apiClientWithFile.interceptors.response.use(
    (response) => response, // 성공 응답은 그대로 통과
    responseInterceptor    // 실패 응답은 위에서 만든 함수로 처리
);


export default apiClient;