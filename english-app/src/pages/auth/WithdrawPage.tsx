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
      "Do you want to withdraw?",
      "This action is irreversible and will delete all information\nin your account",
      proceedWithdrawal 
    );
  };

  const proceedWithdrawal = async () => {
    try {
      const response = await apiClient.delete('/api/users/me');
      
      if (response.status === 200) {
        logout();
        crossPlatformAlert("Success", "See you again");
        navigate('/auth/login', { replace: true });
      }
    } catch (error: any) {
      console.error("탈퇴 실패: ", error);
      crossPlatformAlert("Failed", error.response?.data?.message || "Try again");
    }
  };

  return (
    <div className="h-screen flex justify-center items-center bg-[#f5f5f5] p-4">
      <div className="w-full max-w-[400px] bg-white rounded-lg p-8 shadow-lg text-center mb-60">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Delete account</h1>
        
        <div className="bg-red-50 border border-red-100 rounded-lg p-4 mb-8">
            <p className="text-gray-700 text-sm leading-6">
              If you cancel your membership, 
              <p className="font-bold text-red-500">all data related to your account will be deleted and cannot be recovered</p>
            </p>
            <p className="text-gray-700 text-sm leading-6 mt-2 font-semibold">
            Please decide carefully
            </p>
        </div>

        <RefuseCustomButton 
            title="Proceed" 
            onClick={handleWithdraw} 
            className="w-full"
        />
      </div>
    </div>
  );
};

export default WithdrawPage;
