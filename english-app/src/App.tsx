import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/auth/LoginPage';

import RootLayout from './components/RootLayout';
import SignupPage from './pages/auth/SignupPage';
import ConfirmPasswordPage from './pages/auth/ConfirmPassword';
import EditProduct from './components/admin/EditProduct';
import AddProduct from './components/admin/AddProduct';
import ProductListPage from './pages/admin/ProductListPage';
import TeacherListPage from './pages/admin/TeacherListPage';
import StudentListPage from './pages/admin/StudentListPage';
import PermitListPage from './pages/admin/PermitListPage';
import EditAnnouncement from './components/admin/EditAnnouncement';
import AddAnnouncement from './components/admin/AddAnnouncement';
import BoardListPage from './pages/admin/BoardListPage';
import ChartPage from './pages/admin/ChartPage';
import AdminLayout from './components/layout/AdminLayout';
import CartPage from './pages/user/CartPage';
import UserLayout from './components/layout/UserLayout';
import WithdrawPage from './pages/auth/WithdrawPage';
import EditProfilePage from './pages/auth/EditProfilePage';
import FallingWordsLobbyPage from './pages/game/fallingWords/FallingWordsLobby';
import FallingWordsGamePage from './pages/game/fallingWords/FallingWordsPlay';
import MysteryCardsLobbyPage from './pages/game/mysteryCards/MysteryCardsLobby';
import MysteryCardsGamePage from './pages/game/mysteryCards/MysteryCardsPlay';
import MazeAdventureLobbyPage from './pages/game/mazeAdventure/MazeAdventureLobby';
import MazeAdventureGamePage from './pages/game/mazeAdventure/MazeAdventurePlay';
import WordPuzzleLobbyPage from './pages/game/crossWordPuzzle/WordPuzzleLobby';
import CrosswordPuzzlePage from './pages/game/crossWordPuzzle/WordPuzzlePlay';
import BoardPage from './pages/main/BoardPage';
import EnglishPage from './pages/main/EnglishPage';
import GamesPage from './pages/main/GamePage';
import StorePage from './pages/main/StorePage';
import EnglishDetailPage from './pages/detail/EnglishEdu';
import BoardDetailPage from './pages/detail/BoardDetailPage';
import StoreDetailPage from './pages/detail/StoreDetailPage';

function App() {
    return (
        <Routes>
            {/* RootLayout이 헤더 및 전역 권한 체크 담당 */}
            <Route path="/" element={<RootLayout />}>

                {/* 1. Home */}
                <Route index element={<HomePage />} />

                {/* 2. Auth */}
                <Route path="auth">
                    <Route path="login" element={<LoginPage />} />
                    <Route path="signup" element={<SignupPage />} />
                    <Route
                        path="confirm-edit"
                        element={<ConfirmPasswordPage nextPath="/auth/edit-profile" subtitle="정보 수정을 위해 비밀번호를 입력해주세요." />}
                    />
                    <Route path="edit-profile" element={<EditProfilePage />} />
                    <Route
                        path="confirm-withdraw"
                        element={<ConfirmPasswordPage nextPath="/auth/withdraw" subtitle="계정 삭제를 위해 비밀번호를 입력해주세요." />}
                    />
                    <Route path="withdraw" element={<WithdrawPage />} />
                </Route>

                {/* 3. Main Features (메인 메뉴) */}
                <Route path="main">
                    {/* 게시판 */}
                    <Route path="board" element={<BoardPage />} />
                    <Route path="board/:id" element={<BoardDetailPage />} />

                    {/* 영어 학습 (목록) */}
                    <Route path="english" element={<EnglishPage />} />

                    {/* 게임 (목록) */}
                    <Route path="games" element={<GamesPage />} />

                    {/* 상점 (목록) */}
                    <Route path="store" element={<StorePage />} />
                    <Route path="store/:id" element={<StoreDetailPage />} />
                </Route>

                {/* 4. English Detail (영어 학습 상세 - 팝업으로 열리기도 함) */}
                {/* EnglishPage에서 window.open으로 /english/:id 로 이동함 */}
                <Route path="english/:id" element={<EnglishDetailPage />} />

                {/* 5. Game Play Routes */}
                <Route path="game">
                    <Route path="fallingWords" element={<FallingWordsLobbyPage />} />
                    <Route path="fallingWords/play" element={<FallingWordsGamePage />} />

                    <Route path="mysteryCards" element={<MysteryCardsLobbyPage />} />
                    <Route path="mysteryCards/play" element={<MysteryCardsGamePage />} />

                    <Route path="mazeAdventure" element={<MazeAdventureLobbyPage />} />
                    <Route path="mazeAdventure/play" element={<MazeAdventureGamePage />} />

                    <Route path="crossWordPuzzle" element={<WordPuzzleLobbyPage />} />
                    <Route path="crossWordPuzzle/play" element={<CrosswordPuzzlePage />} />
                </Route>

                {/* 6. User Routes (UserLayout 적용) */}
                <Route path="user" element={<UserLayout />}>
                    <Route path="cart" element={<CartPage />} />
                    <Route path="payment" element={<div className="p-10 text-center">Payment Page (Ready)</div>} />
                    <Route path="place" element={<div className="p-10 text-center">Place Page (Ready)</div>} />
                    <Route path="result" element={<div className="p-10 text-center">Result Page (Ready)</div>} />
                </Route>

                {/* 7. Admin Routes (AdminLayout 적용) */}
                <Route path="admin" element={<AdminLayout />}>
                    <Route index element={<Navigate to="chart" replace />} />
                    <Route path="chart" element={<ChartPage />} />

                    {/* 게시판 관리 */}
                    <Route path="boardList" element={<BoardListPage />} />
                    <Route path="write" element={<AddAnnouncement />} />
                    <Route path="board/:id" element={<div className="p-10">Board Detail (View Only)</div>} />
                    <Route path="editAnnouncement/:id" element={<EditAnnouncement />} />

                    {/* 회원 관리 */}
                    <Route path="permitList" element={<PermitListPage />} />
                    <Route path="studentList" element={<StudentListPage />} />
                    <Route path="teacherList" element={<TeacherListPage />} />

                    {/* 상품 관리 */}
                    <Route path="productList" element={<ProductListPage />} />
                    <Route path="addProduct" element={<AddProduct />} />
                    <Route path="editProduct/:id" element={<EditProduct />} />
                </Route>

                {/* 404 Not Found */}
                <Route path="*" element={
                    <div className="flex h-screen flex-col items-center justify-center bg-gray-50">
                        <h1 className="text-6xl font-bold text-gray-300">404</h1>
                        <p className="text-xl text-gray-500 mt-4">Page Not Found</p>
                    </div>
                } />
            </Route>
        </Routes>
    );
}

export default App;
