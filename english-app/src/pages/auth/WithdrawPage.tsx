import React from 'react';
import { useNavigate } from "react-router-dom";
import apiClient from "@/api";
import RefuseCustomButton from "@/components/common/NegButtonProps"; // 이전에 만든 빨간 버튼
import { useUserStore } from "@/store/userStore";
import { crossPlatformAlert, crossPlatformConfirm } from "@/utils/crossPlatformAlert";

const WithdrawPage = () => {
  const navigate = useNavigate();
  const logout = useUserStore((state) => state.logout);

  const handleWithdraw = () => {
    crossPlatformConfirm(
      "정말로 탈퇴하시겠습니까?",
      "이 작업은 되돌릴 수 없으며, 계정의 모든 정보가 영구적으로 삭제됩니다.",
      proceedWithdrawal 
    );
  };

  const proceedWithdrawal = async () => {
    try {
      const response = await apiClient.delete('/api/users/me');
      
      if (response.status === 200) {
        logout();
        crossPlatformAlert("탈퇴 완료", "회원 탈퇴가 완료되었습니다.");
        navigate('/auth/login', { replace: true });
      }
    } catch (error: any) {
      console.error("탈퇴 실패: ", error);
      crossPlatformAlert("탈퇴 실패", error.response?.data?.message || "오류가 발생했습니다.");
    }
  };

  return (
    <div className="h-full flex justify-center items-center bg-[#f5f5f5] p-4">
      <div className="w-full max-w-[400px] bg-white rounded-lg p-8 shadow-lg text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">회원 탈퇴</h1>
        
        <div className="bg-red-50 border border-red-100 rounded-lg p-4 mb-8">
            <p className="text-gray-700 text-sm leading-6">
            회원 탈퇴를 진행하면 계정과 관련된 <span className="font-bold text-red-500">모든 데이터가 삭제</span>되며 복구할 수 없습니다.
            </p>
            <p className="text-gray-700 text-sm leading-6 mt-2 font-semibold">
            신중하게 결정해주세요.
            </p>
        </div>

        <RefuseCustomButton 
            title="회원 탈퇴" 
            onClick={handleWithdraw} 
            className="w-full"
        />
      </div>
    </div>
  );
};

export default WithdrawPage;
