import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
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
const requestInterceptor = (config: InternalAxiosRequestConfig) => { // config 타입을 any 또는 InternalAxiosRequestConfig로 지정
    const token = useUserStore.getState().token; 
    if (token) {
        config.headers.Authorization = `Bearer ${token}`; // 템플릿 리터럴 오타 수정
    }
    return config;
};

// 토큰 만료 시 자동 로그아웃을 처리하는 '응답 인터셉터' 함수
const responseInterceptor = (error: AxiosError) => {
    // interceptor에 진입해서 서버에서 에러에 대한 응답을 포함하는지 콘솔로 체크
    // console.log('--- [AXIOS INTERCEPTOR] ERROR DETECTED! ---', 'Status:', error.response?.status);

    // 에러 응답이 없으면 그대로 에러를 반환
    if (!error.response || !error.config) {
        return Promise.reject(error);
    }

    const { status } = error.response;
    const { getState } = useUserStore; // getState 함수 자체를 가져옵니다.

    // [확인용 로그] 조건문에 들어가는 모든 값을 확인합니다.
    console.log(`- Status: ${status}`);
    console.log(`- Token in store: ${getState().token}`);

    // isLoggedIn 상태 대신, 스토어에 토큰이 존재하는지 여부로 판단합니다.
    // 401 에러가 발생했고, 스토어에 토큰이 있다면 해당 토큰이 만료된 것이므로 로그아웃 처리합니다.
    if (status === 401 && getState().token && error.config.url !== '/api/auth/confirm-password') {
        console.log('인증 실패(401) 및 토큰 존재. 로그아웃 처리합니다.');
        
        // logout() 함수는 스토어의 상태를 변경하므로, 한 번만 호출하는 것이 안전합니다.
        getState().logout(); 

        alert('세션이 만료되었습니다. 다시 로그인해주세요.');

        router.replace('/auth/login'); // 로그인 페이지로 이동
    }
    // 403 Forbidden (인가 실패 - 권한 없음)
    // 403 에러는 로그인 상태는 유효한 경우이므로 isLoggedIn 체크를 유지하는 것이 좋습니다.
    else if (status === 403 && getState().isLoggedIn) {
        console.log('권한 없음(403). 홈페이지로 이동합니다.');
        alert('해당 페이지에 접근할 권한이 없습니다.');
        router.replace('/'); // 홈페이지로 이동
    }

    // 처리한 에러 외의 다른 에러들은 그대로 반환하여 다음 로직에서 처리
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
