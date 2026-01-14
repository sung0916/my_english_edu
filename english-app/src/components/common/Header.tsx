import { Menu, X } from 'lucide-react';
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUserStore } from '../../store/userStore';

const Header = () => {
    const { isLoggedIn, logout, user } = useUserStore();
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        setIsMenuOpen(false);
        alert("You logged out");
        navigate('/');
    };

    const closeMenu = () => setIsMenuOpen(false);

    return (
        <header className="flex flex-row justify-between items-center px-5 h-20 bg-white border-b border-gray-200">
            {/* Logo */}
            <div className="flex-shrink-0">
                <Link to="/" onClick={closeMenu}>
                    <img
                        src="/logo.png"
                        alt="MonsterEdu"
                        className="w-[100px] h-[70px] object-contain"
                    />
                </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-6">
                <Link to="/main/about" className="text-lg font-bold text-gray-700 hover:text-blue-500">About</Link>
                <Link to="/main/english" className="text-lg font-bold text-gray-700 hover:text-blue-500">English</Link>
                <Link to="/main/games" className="text-lg font-bold text-gray-700 hover:text-blue-500">Games</Link>
                <Link to="/main/store" className="text-lg font-bold text-gray-700 hover:text-blue-500">Store</Link>
                <Link to="/main/board" className="text-lg font-bold text-gray-700 hover:text-blue-500">Board</Link>
            </nav>

            {/* Desktop User Menu */}
            <div className="hidden md:flex items-center space-x-4">
                {isLoggedIn ? (
                    <>
                        {user?.role === 'ADMIN' ? (
                            <Link to="/admin/studentList" className="text-sm font-medium hover:text-blue-500">ManagerPage</Link>
                        ) : (
                            <Link to="/user/place" className="text-sm font-medium hover:text-blue-500">MyPage</Link>
                        )}
                        <Link to="/user/cart" className="text-sm font-medium hover:text-blue-500">Cart</Link>
                        <button onClick={handleLogout} className="text-sm font-medium hover:text-red-500">Logout</button>
                    </>
                ) : (
                    <>
                        <Link to="/auth/login" className="text-sm font-medium hover:text-blue-500">Login</Link>
                        <Link to="/auth/signup" className="text-sm font-medium hover:text-blue-500">SignUp</Link>
                    </>
                )}
            </div>

            {/* Mobile Menu Button */}
            <button className="md:hidden" onClick={() => setIsMenuOpen(true)}>
                <Menu className="w-8 h-8 text-black" />
            </button>

            {/* Mobile Sidebar / Modal */}
            {isMenuOpen && (
                <div className="fixed inset-0 z-50 flex justify-end">
                    {/* Backdrop */}
                    <div className="absolute inset-0 bg-black bg-opacity-50" onClick={closeMenu}></div>

                    {/* Drawer */}
                    <div className="relative w-64 bg-white h-full shadow-xl flex flex-col p-5 animate-in slide-in-from-right">
                        <div className="flex justify-end mb-5">
                            <button onClick={closeMenu}>
                                <X className="w-8 h-8 text-black" />
                            </button>
                        </div>

                        <div className="flex flex-col space-y-4">
                            <Link to="/main/about" onClick={closeMenu} className="text-xl font-medium text-center">About</Link>
                            <Link to="/main/english" onClick={closeMenu} className="text-xl font-medium text-center">English</Link>
                            <Link to="/main/games" onClick={closeMenu} className="text-xl font-medium text-center">Games</Link>
                            <Link to="/main/store" onClick={closeMenu} className="text-xl font-medium text-center">Store</Link>
                            <Link to="/main/board" onClick={closeMenu} className="text-xl font-medium text-center">Board</Link>

                            <hr className="border-gray-200 my-2" />

                            {isLoggedIn ? (
                                <>
                                    {user?.role === 'ADMIN' ? (
                                        <Link to="/admin/studentList" onClick={closeMenu} className="text-xl font-medium text-center">ManagerPage</Link>
                                    ) : (
                                        <Link to="/user/place" onClick={closeMenu} className="text-xl font-medium text-center">MyPage</Link>
                                    )}
                                    {user?.role !== 'ADMIN' && (
                                        <Link to="/user/cart" onClick={closeMenu} className="text-xl font-medium text-center">Cart</Link>
                                    )}
                                    <button onClick={handleLogout} className="text-xl font-medium text-center text-red-500">Logout</button>
                                </>
                            ) : (
                                <>
                                    <Link to="/auth/login" onClick={closeMenu} className="text-xl font-medium text-center">Login</Link>
                                    <Link to="/auth/signup" onClick={closeMenu} className="text-xl font-medium text-center">Signup</Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
};

export default Header;
