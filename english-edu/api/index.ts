import axios from 'axios';
import { useUserStore } from '../store/userStore';

// api클라이언트
const apiClient = axios.create({
    baseURL: 'http://localhost:8080',
    headers: {
        'Content-Type': 'application/json',
    },
});

// 인터셉터
apiClient.interceptors.request.use(
    (config) => {
        const toekn = useUserStore.getState().token;
        if (toekn) {
            config.headers.Authorization = `Bearer $(token)`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
)

// 파일 등 멀티파트 데이터를 위한 인스턴스
export const apiClientWithFile = axios.create({
    baseURL: 'http://localhost:8080',
    headers: {
        'Content-Type': 'multipart/form-data',
    },
});

export default apiClient;