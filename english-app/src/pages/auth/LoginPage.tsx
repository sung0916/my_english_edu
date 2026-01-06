import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "@/api";
import PermitCustomButton from "@/components/common/PosButtonProps"; // 이전에 마이그레이션한 버튼
import { useUserStore } from "@/store/userStore";
import { crossPlatformAlert } from "@/utils/crossPlatformAlert";

const LoginPage = () => {
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
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
        navigate('/', { replace: true });
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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  return (
    <div className="flex-1 h-full flex justify-center items-center bg-[#f5f5f5] p-4">
      <div className="w-full max-w-[400px] bg-white rounded-lg p-8 shadow-lg mb-20">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">Login</h1>
        
        <div className="flex flex-col gap-5">
          <input
            type="text"
            className="h-12 border border-gray-300 rounded px-3 text-base outline-none focus:border-blue-500 transition-colors"
            placeholder="Enter ID"
            value={loginId}
            onChange={(e) => setLoginId(e.target.value)}
            onKeyDown={handleKeyDown}
          />

          <input
            type="password"
            className="h-12 border border-gray-300 rounded px-3 text-base outline-none focus:border-blue-500 transition-colors"
            placeholder="Enter Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={handleKeyDown}
          />

          <div className="mt-2">
            <PermitCustomButton title="Login" onClick={handleLogin} className="w-full" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
