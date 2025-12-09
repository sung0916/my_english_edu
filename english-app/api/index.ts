import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { router } from 'expo-router';
import { useUserStore } from '../store/userStore';

// addProduct, EditProduct, write 등에서 URL 조립과정에 사용할 api 주소
export const API_BASE_URL = 'http://localhost:8080';

// JSON 데이터를 위한 기본 API 클라이언트
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// 파일 등 멀티파트 데이터를 위한 API 클라이언트
export const apiClientWithFile = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'multipart/form-data',
    },
});

// 중복 로그아웃 방지를 위한 플래스 (파일 스코프 변수)
let isLogoutProcessing = false;

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

    // 에러 응답이 없으면 그대로 에러를 반환
    if (!error.response || !error.config) {
        return Promise.reject(error);
    }

    const { status } = error.response;
    const { getState } = useUserStore;  // getState 함수 자체를 가져옴
    const currentToken = getState().token;

    // [확인용 로그] 조건문에 들어가는 모든 값을 확인
    // console.log(`- Status: ${status}`);
    // console.log(`- Token in store: ${getState().token}`);

    // 토큰 만료 (401) - 로그아웃 처리 
    if (status === 401 && currentToken) {

        // 이미 로그아웃 처리 중이면, 추가 Alert 무시하고 리턴
        if (isLogoutProcessing) {
            return Promise.reject(error);
        }

        console.log('세션 만료, 로그아웃 시작');
        isLogoutProcessing = true;  // Lock 걸기
        
        getState().logout();  // 스토어 초기화
        alert('세션이 만료되었습니다. 다시 로그인해주세요.');  // Alert 한 번만 뜸

        router.replace('/auth/login');  // 로그인 페이지로 이동

        // 1.5초 뒤에 플래그 초기화 (로그인 페이지에서 바로 다시 401이 터지는 케이스 방지)
        setTimeout(() => {
            isLogoutProcessing = false;
        }, 1500);
    }
    // 403 Forbidden (인가 실패 - 권한 없음)
    // 403 에러는 로그인 상태는 유효한 경우이므로 isLoggedIn 체크를 유지하는 것이 좋습니다.
    else if (status === 403 && getState().isLoggedIn) {
        alert('해당 페이지에 접근할 권한이 없습니다.');
        //router.replace('/'); // 홈페이지로 이동
        router.back(); // 뒤로 가기
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
