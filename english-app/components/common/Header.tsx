import { useUserStore } from "@/store/userStore";
import { Feather } from '@expo/vector-icons';
import { Href, Link, useRouter } from "expo-router";
import { useState } from "react";
import { Modal, Pressable, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Header = () => {
  // userStore에서 user 객체 전체를 추출
  const { isLoggedIn, logout, user } = useUserStore();
  const router = useRouter();

  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
    router.push('/');
  }

  const navigateAndCloseMenu = (path: string) => {
    router.push(path as Href);
    setIsMenuOpen(false);
  }

  return (
    <>
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Link href="/" asChild>
            <Pressable><Text style={styles.logo}>Monster English</Text></Pressable>
          </Link>
        </View>

        {isMobile ? (
          <Pressable onPress={() => setIsMenuOpen(true)}>
            <Feather name="menu" size={28} color="black" />
          </Pressable>
        ) : (
          <>
            <View style={styles.navContainer}>
              <Link href="/about" asChild><Pressable><Text style={styles.navItem}>About</Text></Pressable></Link>
              <Link href="/english" asChild><Pressable><Text style={styles.navItem}>English</Text></Pressable></Link>
              <Link href="/games" asChild><Pressable><Text style={styles.navItem}>Games</Text></Pressable></Link>
              <Link href="/store" asChild><Pressable><Text style={styles.navItem}>Store</Text></Pressable></Link>
              <Link href="/board" asChild><Pressable><Text style={styles.navItem}>Board</Text></Pressable></Link>
            </View>

            <View style={styles.userContainer}>
              {isLoggedIn ? (
                <>
                  {user?.role === 'ADMIN' ? (
                    <Link href="/studentList" asChild><Pressable><Text style={styles.userItem}>관리자페이지</Text></Pressable></Link>
                  ) : (
                    <Link href="/mypage" asChild><Pressable><Text style={styles.userItem}>마이페이지</Text></Pressable></Link>
                  )}

                  {user?.role !== 'ADMIN' && (
                    <Link href="/cart" asChild><Pressable><Text style={styles.userItem}>장바구니</Text></Pressable></Link>
                  )}
                  <Pressable onPress={handleLogout}><Text style={styles.userItem}>로그아웃</Text></Pressable>
                </>
              ) : (
                <>
                  <Link href="/login" asChild><Pressable><Text style={styles.userItem}>로그인</Text></Pressable></Link>
                  <Link href="/signup" asChild><Pressable><Text style={styles.userItem}>회원가입</Text></Pressable></Link>
                </>
              )}
            </View>
          </>
        )}
      </View>

      <Modal
        visible={isMenuOpen}
        animationType="slide"
        onRequestClose={() => setIsMenuOpen(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Pressable onPress={() => setIsMenuOpen(false)}>
              <Feather name="x" size={32} color="black" />
            </Pressable>
          </View>

          <View style={styles.modalContent}>
            <Pressable style={styles.modalLink} onPress={() => navigateAndCloseMenu('/about')}><Text style={styles.modalLinkText}>About</Text></Pressable>
            <Pressable style={styles.modalLink} onPress={() => navigateAndCloseMenu('/test')}><Text style={styles.modalLinkText}>Study</Text></Pressable>
            <Pressable style={styles.modalLink} onPress={() => navigateAndCloseMenu('/games')}><Text style={styles.modalLinkText}>Games</Text></Pressable>
            <Pressable style={styles.modalLink} onPress={() => navigateAndCloseMenu('/board')}><Text style={styles.modalLinkText}>Board</Text></Pressable>

            <View style={styles.separator} />

            {isLoggedIn ? (
              <>
                {/* 모바일 */}
                {user?.role === 'ADMIN' ? (
                  <Pressable style={styles.modalLink} onPress={() => navigateAndCloseMenu('/admin')}><Text style={styles.modalLinkText}>관리자 페이지</Text></Pressable>
                ) : (
                  <Pressable style={styles.modalLink} onPress={() => navigateAndCloseMenu('/mypage')}><Text style={styles.modalLinkText}>마이페이지</Text></Pressable>
                )}

                {user?.role !== 'ADMIN' && (
                  <Pressable style={styles.modalLink} onPress={() => navigateAndCloseMenu('/cart')}><Text style={styles.modalLinkText}>장바구니</Text></Pressable>
                )}
                <Pressable style={styles.modalLink} onPress={handleLogout}><Text style={styles.modalLinkText}>로그아웃</Text></Pressable>
              </>
            ) : (
              <>
                <Pressable style={styles.modalLink} onPress={() => navigateAndCloseMenu('/login')}><Text style={styles.modalLinkText}>로그인</Text></Pressable>
                <Pressable style={styles.modalLink} onPress={() => navigateAndCloseMenu('/signup')}><Text style={styles.modalLinkText}>회원가입</Text></Pressable>
              </>
            )}
          </View>
        </SafeAreaView>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    alignItems: 'center',
    backgroundColor: '#fff',
    height: 80,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  logo: { fontSize: 25, fontWeight: 'bold', color: 'orange' },
  logoContainer: {},
  navContainer: { flex: 1, justifyContent: 'space-evenly', flexDirection: 'row', alignItems: 'center' },
  navItem: { fontSize: 18, fontFamily: 'Mulish-Bold' },
  userContainer: { flexDirection: 'row', alignItems: 'center' },
  userItem: { marginHorizontal: 10, fontSize: 14 },
  modalContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 20,
  },
  modalContent: {
    paddingHorizontal: 20,
  },
  modalLink: {
    paddingVertical: 15,
  },
  modalLinkText: {
    fontSize: 20,
    textAlign: 'center',
  },
  separator: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 15,
  }
});

export default Header;