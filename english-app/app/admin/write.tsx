// import { Platform } from 'react-native';

// const WriteComponent = 
//     Platform.OS === 'web'
//     ? require('./write.web').default
//     : require('./write.native').default;

// export default WriteComponent;

import { Platform } from 'react-native';

let mod: any;
try {
  mod = Platform.OS === 'web'
    ? require('./write.web')
    : require('./write.native');
  console.log('write loader ok:', Platform.OS, Object.keys(mod));
} catch (e) {
  console.error('write loader fail:', e);
}
export default mod?.default;
