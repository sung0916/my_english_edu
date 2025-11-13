import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, Platform, StyleSheet, Text, TextInput, View } from "react-native";
import apiClient from "../../api";
import CustomButton from "../../components/common/PermitButtonProps";
import { isNotEmpty, validateEmail, validatePassword } from "../../utils/validators";

// User 데이터 타입 정의 (실제 API 응답에 맞춰 수정 필요)
interface UserProfile {
  username: string;
  loginId: string;
  email: string;
  tel: string;
}

// '?'로 선택적 프로퍼티
interface UpdateProfilePayload {
  email?: string;
  tel?: string;
  password?: string;
}

// 에러 상태 타입 정의
interface EditProfileErrors {
  password?: string;
  passwordConfirm?: string;
  email?: string;
  tel?: string;
}

const EditProfilePage = () => {
  // 기존 사용자 정보를 담을 상태
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  // 수정 가능한 필드들의 상태
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [email, setEmail] = useState('');
  const [tel, setTel] = useState('');
  
  const [errors, setErrors] = useState<EditProfileErrors>({});
  const router = useRouter();

  // 페이지 로드 시 사용자 정보 가져오기
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        // 실제 API 엔드포인트로 변경해야 합니다. (예: /api/users/me)
        const response = await apiClient.get('/api/users/me'); 
        const userData: UserProfile = response.data;
        setUserProfile(userData);
        setEmail(userData.email);
        setTel(userData.tel);
      } catch (error) {
        console.error("사용자 정보 로딩 실패:", error);
        Alert.alert("오류", "사용자 정보를 불러오는 데 실패했습니다.");
        router.back(); // 이전 페이지로 이동
      }
    };

    fetchUserProfile();
  }, []);

  // 전화번호 자동 하이픈 핸들러
  const handleTelChange = (text: string) => {
    const digitsOnly = text.replace(/[^0-9]/g, '');
    if (digitsOnly.length > 11) return;

    let formattedTel = digitsOnly;
    if (digitsOnly.length > 3 && digitsOnly.length <= 7) {
      formattedTel = `${digitsOnly.slice(0, 3)}-${digitsOnly.slice(3)}`;
    } else if (digitsOnly.length > 7) {
      formattedTel = `${digitsOnly.slice(0, 3)}-${digitsOnly.slice(3, 7)}-${digitsOnly.slice(7, 11)}`;
    }
    setTel(formattedTel);
  };

  // 정보 수정 핸들러
  const handleUpdateProfile = async () => {
    setErrors({});
    const newErrors: EditProfileErrors = {};
    const payload: UpdateProfilePayload = {
      email,
      tel,
      password,
    };

    // 비밀번호 필드가 하나라도 채워져 있다면 유효성 검사 실행
    if (isNotEmpty(password) || isNotEmpty(passwordConfirm)) {
      if (!validatePassword(password)) {
        newErrors.password = "비밀번호는 8자 이상, 15자 이하로 영문과 숫자를 포함해야 합니다.";
      } else if (password !== passwordConfirm) {
        newErrors.passwordConfirm = "비밀번호가 일치하지 않습니다.";
      } else {
        payload.password = password; // 유효성 통과 시에만 payload에 추가
      }
    }

    if (!validateEmail(email)) newErrors.email = "올바른 이메일 형식이 아닙니다.";
    
    const telDigitsOnly = tel.replace(/[^0-9]/g, '');
    if (telDigitsOnly.length < 10) newErrors.tel = "올바른 전화번호를 입력해주세요.";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      // 실제 업데이트 API 엔드포인트로 변경해야 합니다. (예: /api/users/profile)
      const response = await apiClient.patch('/api/users/me', payload);
          
      if (response.status === 200) {
        if (Platform.OS === 'web') {
          alert("정보가 성공적으로 수정되었습니다.");
        } else {
          Alert.alert("수정 완료", "정보가 성공적으로 수정되었습니다.");
        }
        router.back();
      }
    } catch (error: any) {
      console.error("정보 수정 실패: ", error);
      Alert.alert("수정 실패", error.response?.data?.message || "정보 수정 중 오류가 발생했습니다.");
    }
  };

  // 로딩 중 UI
  if (!userProfile) {
    return (
      <View style={styles.container}>
        <Text>사용자 정보를 불러오는 중...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.formWrapper}>
        <Text style={styles.title}>Edit My Profile</Text>
        
        {/* 수정 불가능한 필드 */}
        <View style={styles.inputContainer}>
          <TextInput 
            style={[styles.input, styles.inactiveInput]} 
            value={userProfile.username} 
            editable={false} // 편집 불가능
          />
          <Text style={styles.errorText} />
        </View>

        <View style={styles.inputContainer}>
          <TextInput 
            style={[styles.input, styles.inactiveInput]} 
            value={userProfile.loginId} 
            editable={false} 
          />
          <Text style={styles.errorText} />
        </View>
        
        {/* 수정 가능한 필드 */}
        <View style={styles.inputContainer}>
          <TextInput style={styles.input} placeholder="새로운 비밀번호" value={password} onChangeText={setPassword} secureTextEntry />
          <Text style={styles.errorText}>{errors.password || ''}</Text>
        </View>

        <View style={styles.inputContainer}>
          <TextInput style={styles.input} placeholder="비밀번호 확인" value={passwordConfirm} onChangeText={setPasswordConfirm} secureTextEntry />
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
            onChangeText={handleTelChange}
            keyboardType="number-pad"
            maxLength={13}
          />
          <Text style={styles.errorText}>{errors.tel || ''}</Text>
        </View>
        
        <CustomButton title="수정하기" onPress={handleUpdateProfile} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  // SignUpPage의 스타일 상속 및 수정
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
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
  },
  inputContainer: {
    marginBottom: 5,
  },
  input: {
    height: 45,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
  },
  // 수정 불가능한 필드를 위한 스타일
  inactiveInput: {
    backgroundColor: '#f0f0f0', // 비활성화된 느낌을 주는 배경색
    color: '#888', // 텍스트 색상도 변경
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginLeft: 5,
    height: 16,
    marginTop: 4,
  }
});

export default EditProfilePage;
