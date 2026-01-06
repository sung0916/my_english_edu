import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { useUserStore } from '../store/userStore';

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const apiClientWithFile = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'multipart/form-data',
    },
});

let isLogoutProcessing = false;

const requestInterceptor = (config: InternalAxiosRequestConfig) => {
    const token = useUserStore.getState().token;
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
};

const responseInterceptor = (error: AxiosError) => {
    if (!error.response || !error.config) {
        return Promise.reject(error);
    }

    const { status } = error.response;
    const { getState } = useUserStore;
    const currentToken = getState().token;

    if (status === 401 && currentToken) {
        if (isLogoutProcessing) {
            return Promise.reject(error);
        }

        console.log('Session expired, logging out');
        isLogoutProcessing = true;

        getState().logout();
        alert('세션이 만료되었습니다. 다시 로그인해주세요.');

        // Web Redirect
        window.location.href = '/auth/login';

        setTimeout(() => {
            isLogoutProcessing = false;
        }, 1500);
    }
    else if (status === 403 && getState().isLoggedIn) {
        alert('해당 페이지에 접근할 권한이 없습니다.');
        window.history.back();
    }

    return Promise.reject(error);
};

apiClient.interceptors.request.use(requestInterceptor);
apiClientWithFile.interceptors.request.use(requestInterceptor);

apiClient.interceptors.response.use(
    (response) => response,
    responseInterceptor
);
apiClientWithFile.interceptors.response.use(
    (response) => response,
    responseInterceptor
);

export default apiClient;
