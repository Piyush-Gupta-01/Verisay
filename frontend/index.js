// Add URL polyfill for Appwrite SDK
import 'react-native-url-polyfill/auto';

// Add Buffer polyfill for file uploads
global.Buffer = global.Buffer || require('buffer').Buffer;

import { registerRootComponent } from 'expo';

import App from './App';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
