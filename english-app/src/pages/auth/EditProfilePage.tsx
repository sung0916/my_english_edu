import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "@/api";
import PermitCustomButton from "@/components/common/PosButtonProps";
import { isNotEmpty, validateEmail, validatePassword } from "@/utils/validators";
import { crossPlatformAlert } from "@/utils/crossPlatformAlert";

interface UserProfile {
  username: string;
  loginId: string;
  email: string;
  tel: string;
}

interface EditProfileErrors {
  password?: string;
  passwordConfirm?: string;
  email?: string;
  tel?: string;
}

const EditProfilePage = () => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [email, setEmail] = useState('');
  const [tel, setTel] = useState('');
  
  const [errors, setErrors] = useState<EditProfileErrors>({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await apiClient.get<UserProfile>('/api/users/me'); 
        setUserProfile(response.data);
        setEmail(response.data.email);
        setTel(response.data.tel);
      } catch (error) {
        console.error("사용자 정보 로딩 실패:", error);
        crossPlatformAlert("오류", "사용자 정보를 불러오지 못했습니다.");
        navigate(-1);
      }
    };

    fetchUserProfile();
  }, [navigate]);

  const handleTelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
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

  const handleUpdateProfile = async () => {
    setErrors({});
    const newErrors: EditProfileErrors = {};
    const payload: any = { email, tel };

    if (isNotEmpty(password) || isNotEmpty(passwordConfirm)) {
      if (!validatePassword(password)) {
        newErrors.password = "비밀번호는 8~15자 (영문, 숫자 포함)여야 합니다.";
      } else if (password !== passwordConfirm) {
        newErrors.passwordConfirm = "비밀번호가 일치하지 않습니다.";
      } else {
        payload.password = password;
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
      const response = await apiClient.patch('/api/users/me', payload);
      if (response.status === 200) {
        crossPlatformAlert("수정 완료", "정보가 성공적으로 수정되었습니다.");
        navigate(-1);
      }
    } catch (error: any) {
      console.error("수정 실패: ", error);
      crossPlatformAlert("수정 실패", error.response?.data?.message || "오류가 발생했습니다.");
    }
  };

  if (!userProfile) return <div className="p-10 text-center">Loading...</div>;

  return (
    <div className="h-full flex justify-center items-center bg-[#f5f5f5] p-4">
      <div className="w-full max-w-[400px] bg-white rounded-lg p-8 shadow-lg">
        <h1 className="text-2xl font-bold text-center mb-8 text-gray-800">Edit My Profile</h1>
        
        <div className="flex flex-col gap-1">
            {/* 읽기 전용 필드 */}
            <div className="mb-2">
                <input 
                    className="w-full h-11 border border-gray-300 rounded px-3 bg-gray-100 text-gray-500 cursor-not-allowed"
                    value={userProfile.username} 
                    disabled 
                />
                 <div className="h-4 mt-1" />
            </div>
            <div className="mb-2">
                <input 
                    className="w-full h-11 border border-gray-300 rounded px-3 bg-gray-100 text-gray-500 cursor-not-allowed"
                    value={userProfile.loginId} 
                    disabled 
                />
                 <div className="h-4 mt-1" />
            </div>

            {/* 수정 가능 필드 */}
            <div className="mb-2">
                <input 
                    type="password"
                    className="w-full h-11 border border-gray-300 rounded px-3 outline-none focus:border-blue-500"
                    placeholder="새로운 비밀번호" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                />
                <div className="h-4 mt-1 text-xs text-red-500 ml-1">{errors.password}</div>
            </div>

            <div className="mb-2">
                <input 
                    type="password"
                    className="w-full h-11 border border-gray-300 rounded px-3 outline-none focus:border-blue-500"
                    placeholder="비밀번호 확인" 
                    value={passwordConfirm} 
                    onChange={(e) => setPasswordConfirm(e.target.value)} 
                />
                <div className="h-4 mt-1 text-xs text-red-500 ml-1">{errors.passwordConfirm}</div>
            </div>

            <div className="mb-2">
                <input 
                    className="w-full h-11 border border-gray-300 rounded px-3 outline-none focus:border-blue-500"
                    placeholder="이메일" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                />
                <div className="h-4 mt-1 text-xs text-red-500 ml-1">{errors.email}</div>
            </div>

            <div className="mb-4">
                <input 
                    className="w-full h-11 border border-gray-300 rounded px-3 outline-none focus:border-blue-500"
                    placeholder="전화번호" 
                    value={tel} 
                    onChange={handleTelChange} 
                    maxLength={13}
                />
                <div className="h-4 mt-1 text-xs text-red-500 ml-1">{errors.tel}</div>
            </div>

            <PermitCustomButton title="수정하기" onClick={handleUpdateProfile} className="w-full" />
        </div>
      </div>
    </div>
  );
};

export default EditProfilePage;
