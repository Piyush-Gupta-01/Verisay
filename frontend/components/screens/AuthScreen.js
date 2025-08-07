import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function AuthScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <View style={styles.langRow}>
        <Text style={styles.langText}>English</Text>
        <Ionicons name="chevron-down" size={16} color="#555" />
      </View>

      <View style={styles.mainContent}>
        <View style={styles.logoContainer}>
          <Image source={require('../../assets/auth-screen-logo.png')} style={styles.logoImage} />
        </View>

        <Text style={styles.logoTitle}>VeriSay</Text>
        <Text style={styles.logoSubtitle}>Verify and authenticate with confidence</Text>

        <Image
          source={require('../../assets/auth-screen-computer.png')}
          style={styles.image}
        />

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => navigation.navigate('SignupScreen')}
        >
          <Text style={styles.primaryButtonText}>Sign Up</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => navigation.navigate('LoginScreen')}
        >
          <Text style={styles.secondaryButtonText}>Log In</Text>
        </TouchableOpacity>

        <Text style={styles.termsText}>
          By continuing, you agree to our Terms of Service
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f9ff',
    paddingHorizontal: 24,
    paddingTop: 30,
  },

  langRow: {
    position: 'absolute',
    top: 40,
    right: 24,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 10,
  },

  langText: {
    fontSize: 14,
    color: '#555',
    marginRight: 4,
  },

  mainContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 100,
  },

  logoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },

  logoImage: {
    height: 90,
    resizeMode: 'contain',
    alignSelf: 'center',
  },

  logoTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111',
    marginTop: 12,
  },

  logoSubtitle: {
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
    marginTop: 6,
    paddingHorizontal: 20,
  },

  image: {
    width: 220,
    height: 220,
    resizeMode: 'contain',
    marginTop: 30,
    marginBottom: 30,
  },

  primaryButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 10,
    alignItems: 'center',
    width: '100%',
    marginBottom: 12,
  },

  secondaryButton: {
    borderColor: '#2563eb',
    borderWidth: 1.5,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 10,
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
  },

  primaryButtonText: {
    fontWeight: 'bold',
    color: '#fff',
    fontSize: 16,
  },

  secondaryButtonText: {
    fontWeight: 'bold',
    color: '#2563eb',
    fontSize: 16,
  },

  termsText: {
    fontSize: 12,
    textAlign: 'center',
    color: '#888',
    paddingTop: 8,
  },
});
