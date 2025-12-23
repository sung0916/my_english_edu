import { Feather } from '@expo/vector-icons';
import { Link, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Image, Modal, Pressable, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useUserStore } from "../../store/userStore";

const Header = () => {
  // userStore에서 user 객체 전체를 추출
  const { isLoggedIn, logout, user, checkTokenExpiry } = useUserStore();
  const router = useRouter();

  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    checkTokenExpiry();
  }, []);

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
    alert("You logged out");
    router.push('/');
  }

  const navigateAndCloseMenu = (path: string) => {
    router.push(path as any);
    setIsMenuOpen(false);
  }

  return (
    <>
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Link href="/" asChild>
            <Pressable>
              <Image 
                source={require('../../assets/images/favicon.png')} 
                style={styles.logo} 
              />
            </Pressable>
          </Link>
        </View>

        {isMobile ? (
          <Pressable onPress={() => setIsMenuOpen(true)}>
            <Feather name="menu" size={28} color="black" />
          </Pressable>
        ) : (
          <>
            <View style={styles.navContainer}>
              <Link href="/main/about" asChild><Pressable><Text style={styles.navItem}>About</Text></Pressable></Link>
              <Link href="/main/english" asChild><Pressable><Text style={styles.navItem}>English</Text></Pressable></Link>
              <Link href="/main/games" asChild><Pressable><Text style={styles.navItem}>Games</Text></Pressable></Link>
              <Link href="/main/store" asChild><Pressable><Text style={styles.navItem}>Store</Text></Pressable></Link>
              <Link href="/main/board" asChild><Pressable><Text style={styles.navItem}>Board</Text></Pressable></Link>
            </View>

            <View style={styles.userContainer}>
              {isLoggedIn ? (
                <>
                  {user?.role === 'ADMIN' ? (
                    <Link href="/admin/studentList" asChild><Pressable><Text style={styles.userItem}>ManagerPage</Text></Pressable></Link>
                  ) : (
                    <Link href="/user/place" asChild><Pressable><Text style={styles.userItem}>MyPage</Text></Pressable></Link>
                  )}

                  {user?.role !== 'ADMIN' && (
                    <Link href="/user/cart" asChild><Pressable><Text style={styles.userItem}>Cart</Text></Pressable></Link>
                  )}
                  <Pressable onPress={handleLogout}><Text style={styles.userItem}>Logout</Text></Pressable>
                </>
              ) : (
                <>
                  <Link href="/auth/login" asChild><Pressable><Text style={styles.userItem}>Login</Text></Pressable></Link>
                  <Link href="/auth/signup" asChild><Pressable><Text style={styles.userItem}>SignUp</Text></Pressable></Link>
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
            <Pressable style={styles.modalLink} onPress={() => navigateAndCloseMenu('/main/about')}><Text style={styles.modalLinkText}>About</Text></Pressable>
            <Pressable style={styles.modalLink} onPress={() => navigateAndCloseMenu('/main/english')}><Text style={styles.modalLinkText}>English</Text></Pressable>
            <Pressable style={styles.modalLink} onPress={() => navigateAndCloseMenu('/main/games')}><Text style={styles.modalLinkText}>Games</Text></Pressable>
            <Pressable style={styles.modalLink} onPress={() => navigateAndCloseMenu('/main/store')}><Text style={styles.modalLinkText}>Store</Text></Pressable>
            <Pressable style={styles.modalLink} onPress={() => navigateAndCloseMenu('/main/board')}><Text style={styles.modalLinkText}>Board</Text></Pressable>

            <View style={styles.separator} />

            {isLoggedIn ? (
              <>
                {/* 모바일 */}
                {user?.role === 'ADMIN' ? (
                  <Pressable style={styles.modalLink} onPress={() => navigateAndCloseMenu('/admin/studentList')}><Text style={styles.modalLinkText}>ManagerPage</Text></Pressable>
                ) : (
                  <Pressable style={styles.modalLink} onPress={() => navigateAndCloseMenu('/user/place')}><Text style={styles.modalLinkText}>MyPage</Text></Pressable>
                )}

                {user?.role !== 'ADMIN' && (
                  <Pressable style={styles.modalLink} onPress={() => navigateAndCloseMenu('/user/cart')}><Text style={styles.modalLinkText}>Cart</Text></Pressable>
                )}
                <Pressable style={styles.modalLink} onPress={handleLogout}><Text style={styles.modalLinkText}>Logout</Text></Pressable>
              </>
            ) : (
              <>
                <Pressable style={styles.modalLink} onPress={() => navigateAndCloseMenu('/auth/login')}><Text style={styles.modalLinkText}>Login</Text></Pressable>
                <Pressable style={styles.modalLink} onPress={() => navigateAndCloseMenu('/auth/signup')}><Text style={styles.modalLinkText}>Signup</Text></Pressable>
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
  logo: { 
    width: 70,
    height: 70,
    resizeMode: 'contain',
  },
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
