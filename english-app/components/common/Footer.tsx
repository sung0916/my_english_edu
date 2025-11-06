import { Linking, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

const Footer = () => {
  // 웹에서는 링크를 새 탭에서 열도록 처리할 수 있습니다.
  const openLink = (url: string) => {
    if (Platform.OS === 'web') {

      if (typeof window !== 'undefined') {
        window.open(url, '_blank');
      }
    } else {
      Linking.openURL(url);
    }
  };

  return (
    <View style={styles.footerContainer}>
      <Text style={styles.companyName}>(주)몬스터어학원</Text>
      
      <View style={styles.infoBlock}>
        <Text style={styles.infoText}>대표 : 박은영</Text>
        <Text style={styles.infoText}>사업자등록번호: 282-87-03084</Text>
        <Text style={styles.infoText}>통신판매 신고번호 : 2022-서울광진-2437</Text>
        <Text style={styles.infoText}>사업장주소 : 서울시 광진구 아차산로 463 4-5층</Text>
        <Text style={styles.infoText}>문의 전화 : 02-6929-4299</Text>
      </View>

      <View style={styles.linksContainer}>
        <Pressable onPress={() => openLink('/terms')}>
          <Text style={styles.linkText}>서비스이용약관</Text>
        </Pressable>
        <Text style={styles.separator}>|</Text>
        <Pressable onPress={() => openLink('/privacy')}>
          <Text style={styles.linkText}>개인정보처리방침</Text>
        </Pressable>
      </View>

      <Text style={styles.copyrightText}>
        Copyright © 2025-2028 Monster English Online. All Rights Reserved.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  footerContainer: {
    backgroundColor: '#f0f0f0', // 이미지와 유사한 배경색
    paddingVertical: 15,
    paddingHorizontal: 30,
    alignItems: 'center', // 웹에서의 중앙 정렬을 위해
  },
  companyName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  infoBlock: {
    marginBottom: 15,
    alignItems: 'center',
  },
  infoText: {
    fontSize: 13,
    color: '#555',
    lineHeight: 20, // 줄 간격
  },
  linksContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  linkText: {
    fontSize: 13,
    color: '#333',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  separator: {
    marginHorizontal: 10,
    color: '#888',
  },
  copyrightText: {
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
  },
});

export default Footer;