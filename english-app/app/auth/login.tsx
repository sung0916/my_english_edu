import { useRouter } from "expo-router";
import { useState } from "react";
import { Platform, StyleSheet, Text, TextInput, View } from "react-native";
import apiClient from "../../api";
import CustomButton from "../../components/common/PermitButtonProps";
import { useUserStore } from "../../store/userStore";
import { crossPlatformAlert } from "../../utils/crossPlatformAlert";

const LoginPage = () => {
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();
  const login = useUserStore((state) => state.login);

  const handleLogin = async () => {
    if (!loginId || !password) {
      crossPlatformAlert("", "Please Enter your ID and Password");
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

        crossPlatformAlert("Logged In", `Welcome, ${user.username}`);
        router.replace('/');
      } else {
        throw new Error("Not Correct Server");
      }

    } catch (error: any) {
      console.error("Failed Login: ", error);

      if (error.response) {
        crossPlatformAlert("Failed Login: ", error.response.data.message || "Please check your ID and Password.");
      } else {
        crossPlatformAlert("Failed Login", "Please Check your Network.");
      }
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.formWrapper}>
        <Text style={styles.title}>Login</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter ID"
          value={loginId}
          onChangeText={setLoginId}
          autoCapitalize="none"
        />

        <TextInput
          style={styles.input}
          placeholder="Enter Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry // 비밀번호 가리기
        />

        <CustomButton title="Login" onPress={handleLogin} />
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
