import apiClient from "../../api";
import CustomButton from "../../components/common/PermitButtonProps";
import { useUserStore } from "../../store/userStore";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Platform, StyleSheet, Text, TextInput, View } from "react-native";
import crossPlatformAlert from "../../utils/crossPlatformAlert";

const LoginPage = () => {
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();
  const login = useUserStore((state) => state.login);

  const handleLogin = async () => {
    if (!loginId || !password) {
      crossPlatformAlert("입력 오류", "아이디와 비밀번호를 모두 입력해주세요.");
      return;
    }

    try {
      const response = await apiClient.post('/api/auth/login', {
        loginId: loginId,
        password: password,
      });

      const { token, user } = response.data;

      if (token && user) {
        login(user, token);

        crossPlatformAlert("로그인 성공", `${user.username}님, 환영합니다!`);
        router.replace('/');
      } else {
        throw new Error("서버 응답 형식이 올바르지 않습니다.");
      }

    } catch (error: any) {
      console.error("로그인 실패: ", error);

      if (error.response) {
        crossPlatformAlert("로그인 실패: ", error.response.data.message || "아이디 또는 비밀번호를 확인해주세요.");
      } else {
        crossPlatformAlert("로그인 실패", "로그인 중 오류 발생, 네트워크 상태를 확인해주세요.");
      }
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.formWrapper}>
        <Text style={styles.title}>Login</Text>
        <TextInput
          style={styles.input}
          placeholder="아이디를 입력하세요."
          value={loginId}
          onChangeText={setLoginId}
          autoCapitalize="none"
        />

        <TextInput
          style={styles.input}
          placeholder="비밀번호를 입력하세요."
          value={password}
          onChangeText={setPassword}
          secureTextEntry // 비밀번호 가리기
        />

        <CustomButton title="로그인" onPress={handleLogin} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center', // 수직 중앙 정렬
    alignItems: 'center',     // 수평 중앙 정렬
    backgroundColor: '#f5f5f5',
  },
  formWrapper: {
    width: '100%',
    ...Platform.select({
      web: {
        maxWidth: 400, // 웹에서 최대 너비 제한
      },
      default: {
        paddingHorizontal: 20, // 모바일에서는 좌우 패딩
      }
    }),
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 30,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
  },
  input: {
    height: 45,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
    marginBottom: 20, // 입력창 사이의 간격을 넉넉하게 줌
  },
});

export default LoginPage;