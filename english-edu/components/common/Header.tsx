import { useUserStore } from "@/store/userStore";
import { Link } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

const Header = () => {
  const { isLoggedIn, logout } = useUserStore();

  return (
    <View style={styles.header}>
      <View style={styles.logoContainer}>
        <Link href="/" asChild>
          <Pressable><Text style={styles.logo}>Monster English</Text></Pressable>
        </Link>
      </View>

      <View style={styles.navContainer}>
        <Link href="/" asChild><Pressable><Text style={styles.navItem}>Home</Text></Pressable></Link>
        {/* <Link href="/about" asChild><Pressable><Text style={styles.navItem}>About</Text></Pressable></Link>
        <Link href="/test" asChild><Pressable><Text style={styles.navItem}>Test</Text></Pressable></Link>
        <Link href="/games" asChild><Pressable><Text style={styles.navItem}>Games</Text></Pressable></Link>
        <Link href="/store" asChild><Pressable><Text style={styles.navItem}>Store</Text></Pressable></Link>
        <Link href="/board" asChild><Pressable><Text style={styles.navItem}>Board</Text></Pressable></Link> */}

        {/* 테스트 후 제거 */}
        <Link href="/login" asChild>
          <Pressable><Text style={styles.userItem}>로그인</Text></Pressable>
        </Link>

        
        {/* 테스트 후 제거 */}

      </View>

      {/* <View style={styles.userContainer}>
        {isLoggedIn ? (
          <>
            <Link href="/mypage" asChild>
              <Pressable><Text style={styles.userItem}>마이페이지</Text></Pressable>
            </Link>
            <Link href="/cart" asChild>
              <Pressable><Text style={styles.userItem}>장바구니</Text></Pressable>
            </Link>
            <Pressable onPress={logout}><Text style={styles.userItem}>로그아웃</Text></Pressable>
          </>
        ) : (
          <>
            <Link href="/login" asChild>
              <Pressable><Text style={styles.userItem}>로그인</Text></Pressable>
            </Link>
            <Link href="/create" asChild>
              <Pressable><Text style={styles.userItem}>회원가입</Text></Pressable>
            </Link>
          </>
        )};
      </View> */}
    </View>
  );
};

const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 15, alignItems: 'center', backgroundColor: '#fff' },
  logo: {fontSize: 20, fontWeight: 'bold', color: 'orange'},
  logoContainer: {},
  navContainer: {flexDirection: 'row'},
  navItem: {marginHorizontal: 10},
  userContainer: {flexDirection: 'row'},
  userItem: {marginHorizontal: 5},
});

export default Header;