import React from 'react';
import { Platform } from 'react-native';
import AddProductNative from '../../components/admin/addProduct.native';
import AddProductWeb from '../../components/admin/addProduct.web';

const AddProduct = () => {

    if (Platform.OS === 'web') {
        return <AddProductWeb />;

    } else {
        return <AddProductNative />;
    }
};

export default AddProduct;
