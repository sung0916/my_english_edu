import EditProductNative from '@/components/admin/EditProduct.native';
import EditProductWeb from '@/components/admin/EditProduct.web';
import React from 'react';
import { Platform } from 'react-native';

const EditProductPage = () => {
  // Platform.OS를 확인하여 조건부로 렌더링합니다.
  if (Platform.OS === 'web') {
    return <EditProductWeb />;
  } else {
    return <EditProductNative />;
  }
};

export default EditProductPage;
