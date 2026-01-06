import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="bg-gray-100 py-8 px-8 flex flex-col items-center text-center mt-auto w-full">
            <h3 className="text-lg font-bold text-gray-800 mb-4">(주)몬스터어학원</h3>

            <div className="mb-4 text-sm text-gray-600 leading-relaxed">
                <p>대표 : 박은영</p>
                <p>사업자등록번호: 282-87-03084</p>
                <p>통신판매 신고번호 : 2022-서울광진-2437</p>
                <p>사업장주소 : 서울시 광진구 아차산로 463 4-5층</p>
                <p>문의 전화 : 02-6929-4299</p>
            </div>

            <div className="flex flex-row items-center space-x-2 mb-4">
                <Link to="/terms" className="text-sm font-semibold text-gray-800 underline hover:text-blue-600">
                    서비스이용약관
                </Link>
                <span className="text-gray-400">|</span>
                <Link to="/privacy" className="text-sm font-semibold text-gray-800 underline hover:text-blue-600">
                    개인정보처리방침
                </Link>
            </div>

            <p className="text-xs text-gray-500">
                Copyright © 2025-2028 Monster English Online. All Rights Reserved.
            </p>
        </footer>
    );
};

export default Footer;
