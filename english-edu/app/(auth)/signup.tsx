import apiClient from "@/api";
import CustomButton from "@/components/common/CustomButtonProps";
import { isNotEmpty, validateEmail, validatePassword } from "@/utils/validators";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Platform, StyleSheet, Text, TextInput, View } from "react-native";

interface SignUpErrors {
  username?: string;
  loginId?: string;
  password?: string;
  passwordConfirm?: string;
  email?: string;
  tel?: string;
}

const SignUpPage = () => {
  const [username, setUsername] = useState('');
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [email, setEmail] = useState('');
  const [tel, setTel] = useState('');
  const [errors, setErrors] = useState<SignUpErrors>({});
  const router = useRouter();

  // 전화번호 입력 자동 하이픈을 위한 핸들러 함수
  const handleTelChange = (text: string) => {
    // 숫자 이외의 문자 모두 제거
    const digitsOnly = text.replace(/[^0-9]/g, '');

    // 11자리를 초과하는 입력은 무시
    if (digitsOnly.length > 11) {
      return;
    }

    let formattedTel = digitsOnly;
    // 길이에 따라 하이픈 추가
    if (digitsOnly.length > 3 && digitsOnly.length <= 7) {
      formattedTel = `${digitsOnly.slice(0, 3)}-${digitsOnly.slice(3)}`;
    } else if (digitsOnly.length > 7) {
      formattedTel = `${digitsOnly.slice(0, 3)}-${digitsOnly.slice(3, 7)}-${digitsOnly.slice(7, 11)}`;
    }

    setTel(formattedTel);
  };

  const handleSignUp = async () => {
    setErrors({}); // 이전 에러 초기화
    const newErrors: SignUpErrors = {};

    if (!isNotEmpty(username)) newErrors.username = "이름을 입력해주세요.";
    if (!isNotEmpty(loginId)) newErrors.loginId = "아이디를 입력해주세요.";
    if (!validatePassword(password)) newErrors.password = "비밀번호는 8자 이상, 15자 이하로 영문과 숫자를 포함해야 합니다.";
    if (password !== passwordConfirm) newErrors.passwordConfirm = "비밀번호가 일치하지 않습니다.";
    if (!validateEmail(email)) newErrors.email = "올바른 이메일 형식이 아닙니다.";
    
    // 전화번호 유효성 검사
    const telDigitsOnly = tel.replace(/[^0-9]/g, '');
    if (telDigitsOnly.length < 10) { // 최소 10자리 이상 (예: 02-123-4567)
      newErrors.tel = "올바른 전화번호를 입력해주세요.";
    }

    // 유효성 검사 실패 시
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      // 백엔드 API 엔드포인트 수정 및 요청 데이터 구성
      const response = await apiClient.post('/api/users/signup', {
        username, // username: username 과 동일
        loginId,
        password,
        email,
        tel, // 하이픈이 포함된 채로 전송
      });

      if (response.status === 201) {
        Alert.alert("성공", "회원가입이 완료되었습니다! 로그인 페이지로 이동합니다.");
        router.push('/login');
      }
    } catch (error: any) {
      console.error("회원가입 실패: ", error);
      if (error.response) {
        // 백엔드에서 구체적인 에러 메시지를 보낼 경우 (예: "이미 존재하는 아이디입니다.")
        Alert.alert("회원가입 실패", error.response.data.message || "입력한 정보를 다시 확인해주세요.");
      } else {
        Alert.alert("오류", "회원가입 중 오류가 발생했습니다.");
      }
    }
  };

  return (
    <View style={styles.container}>
      {/* 폼 자체를 감싸는 View를 추가하여 웹에서의 너비를 제어합니다. */}
      <View style={styles.formWrapper}>
        <Text style={styles.title}>SignUp</Text>
        
        {/* === JSX 구조 변경 부분 === */}
        <View style={styles.inputContainer}>
          <TextInput style={styles.input} placeholder="이름을 입력하세요." value={username} onChangeText={setUsername} />
          <Text style={styles.errorText}>{errors.username || ''}</Text>
        </View>

        <View style={styles.inputContainer}>
          <TextInput style={styles.input} placeholder="아이디를 입력하세요." value={loginId} onChangeText={setLoginId} autoCapitalize="none" />
          <Text style={styles.errorText}>{errors.loginId || ''}</Text>
        </View>
        
        <View style={styles.inputContainer}>
          <TextInput style={styles.input} placeholder="비밀번호를 입력하세요." value={password} onChangeText={setPassword} secureTextEntry />
          <Text style={styles.errorText}>{errors.password || ''}</Text>
        </View>

        <View style={styles.inputContainer}>
          <TextInput style={styles.input} placeholder="비밀번호를 확인해주세요." value={passwordConfirm} onChangeText={setPasswordConfirm} secureTextEntry />
          <Text style={styles.errorText}>{errors.passwordConfirm || ''}</Text>
        </View>

        <View style={styles.inputContainer}>
          <TextInput style={styles.input} placeholder="이메일을 입력하세요." value={email} onChangeText={setEmail} keyboardType="email-address" />
          <Text style={styles.errorText}>{errors.email || ''}</Text>
        </View>
        
        <View style={styles.inputContainer}>
          <TextInput 
            style={styles.input} 
            placeholder="전화번호를 입력하세요." 
            value={tel} 
            onChangeText={handleTelChange} // 여기를 수정!
            keyboardType="number-pad" // 숫자 키패드를 사용하도록
            maxLength={13} // "010-1234-5678"의 최대 길이
          />
          <Text style={styles.errorText}>{errors.tel || ''}</Text>
        </View>
        
        <CustomButton title="가입하기" onPress={handleSignUp} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center', // 수직 중앙 정렬
    alignItems: 'center',     // 수평 중앙 정렬 (formWrapper를 가운데로)
    backgroundColor: '#f5f5f5', // 배경색을 살짝 주어 구분
  },
  // 웹에서 폼의 최대 너비를 제한하고 중앙에 배치하기 위한 래퍼
  formWrapper: {
    width: '100%',
    // Platform.select를 사용하여 웹일 때만 다른 스타일을 적용
    ...Platform.select({
      web: {
        maxWidth: 400, // 웹 화면에서 폼이 너무 넓어지는 것을 방지
      },
      default: {
        padding: 20, // 모바일에서는 패딩을 줌
      }
    }),
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 30, // 내부 여백
    shadowColor: "#000", // 그림자 효과 (선택 사항)
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    fontSize: 28, // 타이틀 크기 조정
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
  },
  // 각 입력 필드와 에러 메시지를 묶는 컨테이너
  inputContainer: {
    marginBottom: 5, // 컨테이너 간의 간격
  },
  input: {
    height: 45, // 입력창 높이 약간 증가
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
  },
  // 에러 메시지 스타일: 항상 공간을 차지하도록 height를 줌
  errorText: {
    color: 'red',
    fontSize: 12,
    marginLeft: 5,
    height: 16,     // 에러 메시지를 위한 고정 높이
    marginTop: 4,   // 입력창과의 간격
  }
});

export default SignUpPage;