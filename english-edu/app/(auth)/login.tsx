import apiClient from "@/api";
import { useUserStore } from "@/store/userStore";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Button, StyleSheet, Text, TextInput, View } from "react-native";


const LoginPage = () => {
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();
  const login = useUserStore((state) => state.login);

  const handleLogin = async () => {
    if (!loginId || !password) {
      Alert.alert("입력 오류", "아이디와 비밀번호를 모두 입력해주세요.");
      return;
    }

    try {
      const response = await apiClient.post('/api/auth/login', {
        loginId: loginId,
        password: password,
      });

      const {token, user} = response.data;

      if (token && user) {
        login(user, token);

        Alert.alert("로그인 성공", `${user.username}님, 환영합니다!`);
        router.replace('/');
      } else {
        throw new Error("서버 응답 형식이 올바르지 않습니다.");
      }

    } catch (error: any) {
      console.error("로그인 실패: ", error);

      if (error.response) {
        Alert.alert("로그인 실패: ", error.response.data.message || "아이디 또는 비밀번호를 확인해주세요.");
      } else {
        Alert.alert("로그인 실패", "로그인 중 오류 발생, 네트워크 상태를 확인해주세요.");
      }
    }
  };

  return (
    <View style={styles.loginContainer}>
      <Text style={styles.title}>Login</Text>
      <TextInput
        style={styles.input}
        placeholder="아이디를 입력하세요."
        value={loginId}
        onChangeText={setLoginId}
      />

      <TextInput
        style={styles.input}
        placeholder="비밀번호를 입력하세요."
        value={password}
        onChangeText={setPassword}
      />

      <Button title="Login" onPress={handleLogin} />
    </View>
  );
};

const styles = StyleSheet.create({
  loginContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 40,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 15,
    paddingHorizontal: 10,
  },
});

export default LoginPage;