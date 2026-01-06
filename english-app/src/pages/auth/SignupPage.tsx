import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "@/api";
import PermitCustomButton from "@/components/common/PosButtonProps";
import { isNotEmpty, validateEmail, validatePassword } from "@/utils/validators";
import { crossPlatformAlert } from "@/utils/crossPlatformAlert";

interface SignUpErrors {
  username?: string;
  loginId?: string;
  password?: string;
  passwordConfirm?: string;
  email?: string;
  tel?: string;
}

const SignupPage = () => {
  const [username, setUsername] = useState('');
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [email, setEmail] = useState('');
  const [tel, setTel] = useState('');
  const [errors, setErrors] = useState<SignUpErrors>({});
  
  const navigate = useNavigate();

  // 전화번호 입력 자동 하이픈
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

  const handleSignUp = async () => {
    setErrors({});
    const newErrors: SignUpErrors = {};

    if (!isNotEmpty(username)) newErrors.username = "Please enter your name";
    if (!isNotEmpty(loginId)) newErrors.loginId = "Please enter your ID";
    if (!validatePassword(password)) newErrors.password = "Password must be at least 8 to 15 characters include letters and numbers";
    if (password !== passwordConfirm) newErrors.passwordConfirm = "The passwords doesn't match";
    if (!validateEmail(email)) newErrors.email = "Not correct Email form";
    
    const telDigitsOnly = tel.replace(/[^0-9]/g, '');
    if (telDigitsOnly.length < 10) {
      newErrors.tel = "Check your contact number form";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const response = await apiClient.post('/api/users/signup', {
        username,
        loginId,
        password,
        email,
        tel,
      });
          
      if (response.status === 201) {
        crossPlatformAlert("Completed", "Request has been completed.\nPlease wait for Administrator approval.");
        navigate('/', { replace: true });
      }
    } catch (error: any) {
      console.error("Failed Signup: ", error);
      if (error.response) {
        crossPlatformAlert("Failed Signup", error.response.data.message || "입력한 정보를 다시 확인해주세요.");
      } else {
        crossPlatformAlert("Error", "Server error occurred.");
      }
    }
  };

  return (
    <div className="flex-1 h-full flex justify-center items-center bg-[#f5f5f5] p-4">
      <div className="w-full max-w-[400px] bg-white rounded-lg p-8 shadow-lg">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">SignUp</h1>
        
        <div className="flex flex-col gap-1">
          {/* 이름 */}
          <div className="mb-2">
            <input 
              type="text" 
              className="w-full h-12 border border-gray-300 rounded px-3 text-base outline-none focus:border-blue-500"
              placeholder="Enter your name" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
            />
            <div className="h-4 mt-1 text-xs text-red-500 ml-1">{errors.username}</div>
          </div>

          {/* 아이디 */}
          <div className="mb-2">
            <input 
              type="text" 
              className="w-full h-12 border border-gray-300 rounded px-3 text-base outline-none focus:border-blue-500"
              placeholder="Enter your ID" 
              value={loginId} 
              onChange={(e) => setLoginId(e.target.value)} 
            />
            <div className="h-4 mt-1 text-xs text-red-500 ml-1">{errors.loginId}</div>
          </div>
          
          {/* 비밀번호 */}
          <div className="mb-2">
            <input 
              type="password" 
              className="w-full h-12 border border-gray-300 rounded px-3 text-base outline-none focus:border-blue-500"
              placeholder="Enter your password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
            />
            <div className="h-4 mt-1 text-xs text-red-500 ml-1">{errors.password}</div>
          </div>

          {/* 비밀번호 확인 */}
          <div className="mb-2">
            <input 
              type="password" 
              className="w-full h-12 border border-gray-300 rounded px-3 text-base outline-none focus:border-blue-500"
              placeholder="Password check" 
              value={passwordConfirm} 
              onChange={(e) => setPasswordConfirm(e.target.value)} 
            />
            <div className="h-4 mt-1 text-xs text-red-500 ml-1">{errors.passwordConfirm}</div>
          </div>

          {/* 이메일 */}
          <div className="mb-2">
            <input 
              type="email" 
              className="w-full h-12 border border-gray-300 rounded px-3 text-base outline-none focus:border-blue-500"
              placeholder="Enter your email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
            />
            <div className="h-4 mt-1 text-xs text-red-500 ml-1">{errors.email}</div>
          </div>
          
          {/* 전화번호 */}
          <div className="mb-4">
            <input 
              type="tel"
              className="w-full h-12 border border-gray-300 rounded px-3 text-base outline-none focus:border-blue-500"
              placeholder="Enter your contact number" 
              value={tel} 
              onChange={handleTelChange}
              maxLength={13}
            />
            <div className="h-4 mt-1 text-xs text-red-500 ml-1">{errors.tel}</div>
          </div>
          
          <PermitCustomButton title="Signup" onClick={handleSignUp} className="w-full" />
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
