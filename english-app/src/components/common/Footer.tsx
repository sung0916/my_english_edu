import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="bg-gray-100 py-8 px-8 flex flex-col items-center text-center mt-auto w-full">
            <h3 className="text-lg font-bold text-gray-800 mb-4">(주)My Edu</h3>

            <div className="mb-4 text-sm text-gray-600 leading-relaxed">
                <p>대표 : sung0916</p>
                <p>사업자등록번호: 9l9-b7-jf0f87</p>
                <p>통신판매 신고번호 : f392-서울-2f5j</p>
                <p>사업장주소 : 서울특별시</p>
                <p>문의 전화 : o2-5oo9-4o3o</p>
            </div>

            <div className="flex flex-row items-center space-x-2 mb-4">
                <Link to="/policy/service_term" className="text-sm font-semibold text-gray-800 underline hover:text-blue-600">
                    서비스이용약관
                </Link>
                <span className="text-gray-400">|</span>
                <Link to="/policy/privacy_term" className="text-sm font-semibold text-gray-800 underline hover:text-blue-600">
                    개인정보처리방침
                </Link>
            </div>

            <p className="text-xs text-gray-500">
                Copyright © 2025 My Edu Online. All Rights Reserved.
            </p>
        </footer>
    );
};

export default Footer;
