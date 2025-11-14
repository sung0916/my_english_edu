import { crossPlatformAlert, crossPlatformConfirm } from "@/utils/crossPlatformAlert";
import { useRouter } from "expo-router";
import { Platform, StyleSheet, Text, View } from "react-native"; // Platform은 스타일시트용으로 남겨둡니다.
import apiClient from "../../api";
import CustomButton from "../../components/common/RefuseButtonProps";
import { useUserStore } from "../../store/userStore";
// 1. crossPlatformAlert와 crossPlatformConfirm을 모두 임포트합니다.

const WithdrawPage = () => {
  const router = useRouter();
  const logout = useUserStore((state) => state.logout);

  // 2. handleWithdraw 함수를 crossPlatformConfirm을 사용하도록 수정
  const handleWithdraw = () => {
    crossPlatformConfirm(
      "정말로 탈퇴하시겠습니까?",
      "이 작업은 되돌릴 수 없으며, 계정의 모든 정보가 영구적으로 삭제됩니다.",
      // 세 번째 인자로 '확인'을 눌렀을 때 실행될 함수(proceedWithdrawal)를 전달합니다.
      proceedWithdrawal 
    );
  };

  const proceedWithdrawal = async () => {
    try {
      const response = await apiClient.delete('/api/users/me');
      
      if (response.status === 200) {
        logout();
        crossPlatformAlert(
            "탈퇴 완료", 
            "회원 탈퇴가 완료되었습니다. 이용해주셔서 감사합니다."
        );
        router.replace('/auth/login');
      }
    } catch (error: any) {
      console.error("회원 탈퇴 실패: ", error);
      crossPlatformAlert(
          "탈퇴 실패", 
          error.response?.data?.message || "회원 탈퇴 중 오류가 발생했습니다."
      );
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.formWrapper}>
        <Text style={styles.title}>회원 탈퇴</Text>
        <Text style={styles.warningText}>
          회원 탈퇴를 진행하면 계정과 관련된 모든 데이터가 삭제되며 복구할 수 없습니다.
        </Text>
        <Text style={styles.warningText}>
          신중하게 결정해주세요.
        </Text>
        <View style={{marginTop: 30}}>
            <CustomButton 
                title="회원 탈퇴" 
                onPress={handleWithdraw} 
            />
        </View>
      </View>
    </View>
  );
};

// 스타일은 변경 사항 없습니다.
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
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    color: '#343a40',
  },
  warningText: {
    fontSize: 15,
    textAlign: 'center',
    color: '#495057',
    lineHeight: 22,
    marginBottom: 10,
  }
});

export default WithdrawPage;
