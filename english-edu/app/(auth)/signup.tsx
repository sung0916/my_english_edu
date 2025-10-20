import apiClient from "@/api";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Button, StyleSheet, Text, TextInput, View } from "react-native";

const SignUpPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username,setUsername] = useState('');
  const router = useRouter();

  const handleSignUp = async () => {
    try {
      const response = await apiClient.post('/api/users', {
        email: email,
        password: password,
        username: username,
      });

      if (response.status === 201) {
        alert("회원가입이 완료되었습니다! 로그인 페이지로 이동합니다.");
        // router.push('/login');
      }
    } catch (error) {
      console.error("회원가입 실패: ", error);
      alert("회원가입 중 오류 발생");
    } 
  };

  return (
    <View style={styles.formContainer}>
      <Text style={styles.title}>SignUp</Text>
      <TextInput
        style={styles.input}
        placeholder="이름을 입력하세요."
        value={username}
        onChangeText={setUsername}
      />

      <TextInput
        style={styles.input}
        placeholder="이메일"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />

      <TextInput
        style={styles.input}
        placeholder="비밀번호"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button title="가입하기" onPress={handleSignUp} />
    </View>
  );
};

const styles = StyleSheet.create({
  formContainer: {},
  title: {},
  input: {},

});

export default SignUpPage;