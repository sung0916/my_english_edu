import React from 'react';
import { Platform } from 'react-native';

// 1. 웹과 네이티브 컴포넌트를 모두 import 합니다.
import WriteNative from '../../components/admin/write.native';
import WriteWeb from '../../components/admin/write.web';

const WritePage = () => {
  // 2. Platform.OS를 확인하여 조건부로 렌더링합니다.
  if (Platform.OS === 'web') {
    // 현재 플랫폼이 웹이면 WriteWeb을 렌더링
    return <WriteWeb />;
  } else {
    // 그 외 (ios, android)의 경우 WriteNative를 렌더링
    return <WriteNative />;
  }
};

// 3. 이 통합 컴포넌트를 default로 export 합니다.
export default WritePage;
