import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { getAuth, updateProfile } from 'firebase/auth';
import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Ionicons } from '@expo/vector-icons';

export default function ProfileScreen({ navigation }) {
  const auth = getAuth();
  const db = getFirestore();
  const storage = getStorage();

  const user = auth.currentUser;
  const [imageUri, setImageUri] = useState(null);
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      const fetchData = async () => {
        try {
          const userRef = doc(db, 'users', user.uid);
          const docSnap = await getDoc(userRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setUsername(data.username || '');
            setImageUri(data.photoURL || user.photoURL || null);
          }
        } catch (error) {
          console.log('Error fetching profile:', error);
        }
        setLoading(false);
      };
      fetchData();
    }
  }, []);

  const pickImage = async () => {
    try {
      // Launch image picker and wait for the result
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.7,
      });

      // Check if the user didn't cancel the image picker
      if (!result.canceled && result.assets.length > 0) {
        setImageUri(result.assets[0].uri);
      }

    } catch (error) {
      console.log("Error picking image:", error);
      Alert.alert("Error", "Could not pick image.");
    }
  };

  const handleSaveChanges = async () => {
    if (!user) return;

    try {
      setSaving(true);
      let downloadURL = imageUri;

      // Only upload if the image URI is a local file
      if (imageUri && !imageUri.startsWith('http')) {
        const response = await fetch(imageUri);
        const blob = await response.blob();
        const imageRef = ref(storage, `profilePictures/${user.uid}.jpg`);
        await uploadBytes(imageRef, blob);
        downloadURL = await getDownloadURL(imageRef);
      }

      // Update Firebase Auth
      await updateProfile(user, { photoURL: downloadURL });

      // Update Firestore
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        photoURL: downloadURL,
        username: username,
      });

      Alert.alert('Success', 'Profile updated!');
    } catch (error) {
      console.log('Error saving changes:', error);
      Alert.alert('Error', 'Could not update profile.');
    } finally {
      setSaving(false);
      navigation.goBack(); // Navigate back only after the profile update is complete
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <TouchableOpacity onPress={handleSaveChanges}>
          <Text style={styles.saveText}>SAVE</Text>
        </TouchableOpacity>
      </View>

      {/* Profile Picture */}
      <View style={styles.profilePicContainer}>
        <TouchableOpacity onPress={pickImage}>
          <Image
            source={{ uri: imageUri || 'https://i.pravatar.cc/150?img=12' }}
            style={styles.avatar}
          />
          <View style={styles.cameraIcon}>
            <Ionicons name="camera" size={18} color="#fff" />
          </View>
        </TouchableOpacity>
      </View>

      {/* Editable Fields */}
      <View style={styles.form}>
        <Text style={styles.label}>Username</Text>
        <TextInput
          value={username}
          onChangeText={setUsername}
          style={styles.input}
        />
        
        {/* Email Field */}
        <Text style={styles.label}>Email</Text>
        <TextInput
          value={user.email}  // Display the current user's email
          editable={false}  // Make the email field non-editable
          style={styles.input}
        />
      </View>

      {saving && (
        <ActivityIndicator size="small" color="#2563eb" style={{ marginTop: 20 }} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 15,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  saveText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  profilePicContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: '#2563eb',
  },
  cameraIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#2563eb',
    padding: 6,
    borderRadius: 20,
  },
  form: {
    marginTop: 30,
    paddingHorizontal: 20,
  },
  label: {
    fontSize: 14,
    color: '#333',
    marginBottom: 6,
  },
  input: {
    height: 44,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 10,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
});
