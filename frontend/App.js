import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import AuthScreen from './components/screens/AuthScreen';
import SignupScreen from './components/screens/SignupScreen';
import LoginScreen from './components/screens/LoginScreen';
import HomeScreen from './components/screens/HomeScreen';
import ProfileScreen from './components/screens/ProfileScreen';
import CreateAgreementScreen from './components/screens/CreateAgreementScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Auth" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Auth" component={AuthScreen} />
        <Stack.Screen name="SignupScreen" component={SignupScreen} />
        <Stack.Screen name="LoginScreen" component={LoginScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="CreateAgreement" component={CreateAgreementScreen} options={{ title: 'Create Agreement' }} />
        <Stack.Screen 
          name="ProfileScreen" 
          component={ProfileScreen} 
          options={{ title: 'Profile' }}  // Set title for ProfileScreen
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
