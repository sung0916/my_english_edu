import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Platform, StyleSheet, Text, TextInput, View } from 'react-native';
import apiClient from '../../api'; // 기존 apiClient 사용
import CustomButton from '../../components/common/PermitButtonProps';

const ConfirmPassword = () => {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();

    const handleConfirmPassword = async () => {
        if (!password) {
            setError('비밀번호를 입력해주세요.');
            return;
        }
        setError("");

        try {
            // [백엔드 API 필요] 현재 로그인된 사용자의 비밀번호가 맞는지 확인하는 API
            // 이 API는 성공 시 200 OK, 실패 시 401 Unauthorized를 반환해야 합니다.
            await apiClient.post('/api/auth/confirm-password', { password });

            // 비밀번호 확인 성공! editProfile 페이지로 이동합니다.
            router.replace('/auth/editProfile');

        } catch (err: any) {

            // axios 에러이고, 상태 코드가 401인 경우를 먼저 확인합니다.
        if (err.isAxiosError && err.response?.status === 401) {
            // 이 경우는 '비밀번호 불일치'이므로, 로그아웃 시키지 않고 에러 메시지만 표시합니다.
            console.log("비밀번호 불일치(401) 확인. 로그아웃을 방지합니다.");
            setError('비밀번호가 일치하지 않습니다.');

            if (Platform.OS !== 'web') {
                Alert.alert('인증 실패', '비밀번호가 일치하지 않습니다.');
            }
        } else {
            // 그 외의 다른 에러 (네트워크 문제, 500 서버 에러 등)는 기존처럼 처리합니다.
            // 이 에러들은 전역 인터셉터로 전달되어 처리될 수 있습니다.
            console.error("비밀번호 확인 중 예측하지 못한 오류:", err);
            setError('오류가 발생했습니다. 다시 시도해주세요.');
        }
    }
    };

    return (
        <View style={styles.container}>
            <View style={styles.formWrapper}>
                <Text style={styles.title}>Checking Password</Text>
                <Text style={styles.subtitle}>
                    안전한 정보 수정을 위해 현재 비밀번호를 입력해주세요.
                </Text>

                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="현재 비밀번호"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                        onSubmitEditing={handleConfirmPassword} // 엔터 키로 제출
                    />
                    {error ? <Text style={styles.errorText}>{error}</Text> : <View style={styles.errorText} />}
                </View>

                <CustomButton title="확인" onPress={handleConfirmPassword} />
            </View>
        </View>
    );
};

// SignUpPage 또는 EditProfilePage의 스타일을 재활용합니다.
const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
    },
    formWrapper: {
        width: '100%',
        ...Platform.select({
            web: { maxWidth: 400 },
            default: { padding: 20 }
        }),
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 30,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 14,
        textAlign: 'center',
        color: '#6c757d',
        marginBottom: 30,
    },
    inputContainer: {
        marginBottom: 15,
    },
    input: {
        height: 45,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 5,
        paddingHorizontal: 10,
        backgroundColor: '#fff',
    },
    errorText: {
        color: 'red',
        fontSize: 12,
        marginLeft: 5,
        height: 16,
        marginTop: 4,
    }
});

export default ConfirmPassword;
