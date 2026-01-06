import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '@/api';
import PermitCustomButton from '@/components/common/PosButtonProps';

interface Props {
    nextPath: string; // 비밀번호 확인 후 이동할 경로 (예: '/auth/edit-profile' or '/auth/withdraw')
    title?: string;
    subtitle?: string;
}

const ConfirmPasswordPage = ({ nextPath, title = "Checking Password", subtitle }: Props) => {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleConfirmPassword = async () => {
        if (!password) {
            setError('Enter your password');
            return;
        }
        setError("");

        try {
            await apiClient.post('/api/auth/confirm-password', { password });
            // 성공 시 다음 페이지로 이동
            navigate(nextPath, { replace: true });

        } catch (err: any) {
            if (err.response?.status === 401) {
                setError('Please check your password again');
            } else {
                console.error("비밀번호 확인 오류:", err);
                setError('Please try again');
            }
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') handleConfirmPassword();
    };

    return (
        <div className="h-full flex justify-center items-center bg-[#f5f5f5] p-4">
            <div className="w-full max-w-[400px] bg-white rounded-lg p-8 shadow-lg">
                <h1 className="text-2xl font-bold text-center mb-2 text-gray-800">{title}</h1>
                <p className="text-sm text-center text-gray-500 mb-8">
                    {subtitle || "안전한 정보 보호를 위해 현재 비밀번호를 입력해주세요."}
                </p>

                <div className="mb-6">
                    <input
                        type="password"
                        className="w-full h-11 border border-gray-300 rounded px-3 text-base outline-none focus:border-blue-500 transition-colors"
                        placeholder="Current Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onKeyDown={handleKeyDown}
                    />
                    {/* 에러 메시지 높이 확보 (레이아웃 흔들림 방지) */}
                    <div className="h-4 mt-1 text-xs text-red-500 ml-1">
                        {error}
                    </div>
                </div>

                <PermitCustomButton title="Confirm" onClick={handleConfirmPassword} className="w-full" />
            </div>
        </div>
    );
};

export default ConfirmPasswordPage;
