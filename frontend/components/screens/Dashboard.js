import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

export default function Dashboard({ onClose, onLogout, navigation }) {
  const [username, setUsername] = useState('Guest');
  const [loading, setLoading] = useState(true);
  
  const auth = getAuth();
  const user = auth.currentUser; // Get the current logged-in user
  const db = getFirestore(); // Firestore reference

  useEffect(() => {
    if (user) {
      // Fetch username from Firestore using the user's email
      const fetchUserProfile = async () => {
        try {
          const userRef = doc(db, 'users', user.uid); // Assuming your collection is named 'users'
          const docSnap = await getDoc(userRef);
          if (docSnap.exists()) {
            setUsername(docSnap.data().username); // Set the username from Firestore
          } else {
            console.log("No such document!");
            setUsername('Guest'); // Fallback if username is not found
          }
        } catch (error) {
          console.log('Error fetching user profile:', error);
          setUsername('Guest'); // Fallback in case of error
        }
        setLoading(false); // Stop loading once the fetch is complete
      };

      fetchUserProfile();
    }
  }, [user]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    ); // Display loading spinner while fetching user data
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Image
            source={{ uri: user.photoURL || 'https://i.pravatar.cc/100' }} // Use photoURL if available
            style={styles.avatar}
          />
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Ionicons name="close" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
        <Text style={styles.name}>{username}</Text> {/* Display username */}
      </View>

      {/* Contact Info */}
      <View style={styles.section}>
        <View style={styles.row}>
          <Ionicons name="mail-outline" size={18} color="#333" />
          <Text style={styles.text}>{user.email}</Text> {/* Display user email */}
        </View>
      </View>

      {/* Menu Items */}
      <View style={styles.section}>
        <MenuItem icon="create-outline" label="Edit Profile" onPress={() => navigation.navigate('ProfileScreen')} />
        <MenuItem icon="settings-outline" label="Settings" />
        <MenuItem icon="notifications-outline" label="Notifications" />
        <MenuItem icon="help-circle-outline" label="Help & Support" />
      </View>

      {/* Logout */}
      <TouchableOpacity style={styles.logoutRow} onPress={onLogout}>
        <Ionicons name="log-out-outline" size={20} color="#dc2626" />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const MenuItem = ({ icon, label, onPress }) => (
  <TouchableOpacity style={styles.row} onPress={onPress}>
    <Ionicons name={icon} size={18} color="#333" />
    <Text style={styles.text}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  header: {
    backgroundColor: '#2563eb',
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#fff',
  },
  name: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
  },
  role: {
    color: '#dbeafe',
    fontSize: 12,
    marginTop: 2,
  },
  closeBtn: {
    padding: 8,
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  text: {
    fontSize: 14,
    color: '#333',
  },
  logoutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderColor: '#eee',
  },
  logoutText: {
    fontSize: 14,
    color: '#dc2626',
    fontWeight: 'bold',
  },
});
