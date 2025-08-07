import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, SafeAreaView, Platform, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Dashboard from './Dashboard';
import { auth } from '../../firebaseConfig'; // Ensure correct import for Firebase

export default function HomeScreen({ navigation }) {
  const [showDashboard, setShowDashboard] = useState(false);
  const [showAgreementTypeModal, setShowAgreementTypeModal] = useState(false);
  const [user, setUser] = useState(null);

  // Fetch user info from Firebase Authentication when the component mounts
  useEffect(() => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      setUser(currentUser); // Set the user info
    } else {
      navigation.replace('Auth'); // Redirect to Auth screen if no user is logged in
    }
  }, []);

  const handleLogout = () => {
    auth.signOut()
      .then(() => {
        setShowDashboard(false);
        navigation.replace('Auth'); // Navigate to Auth screen after logout
      })
      .catch((error) => console.error("Logout error: ", error));
  };

  const handleCreateAgreement = () => {
    setShowAgreementTypeModal(true);
  };

  const handleNormalAgreement = () => {
    setShowAgreementTypeModal(false);
    navigation.navigate('CreateAgreement', { userId: user.uid });
  };

  const handleLiveSharing = () => {
    setShowAgreementTypeModal(false);
    Alert.alert('Coming Soon', 'Live sharing feature will be available in future updates!');
  };

  if (!user) {
    return <Text>Loading...</Text>; // Render loading state while fetching user info
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setShowDashboard(true)} style={styles.menuIcon}>
          <Ionicons name="menu-outline" size={28} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>Agreements</Text>
        <View style={{ width: 28 }} /> {/* Spacer */}
      </View>

      {/* Cards */}
      <ScrollView contentContainerStyle={styles.cardsContainer}>
        <AgreementCard title="Service Agreement" date="Jan 15, 2025" pages="2 Pages" status="Active" />
        <AgreementCard title="NDA Agreement" date="Jan 10, 2025" pages="1 Page" status="Pending" />
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={handleCreateAgreement}
      >
        <Ionicons name="add" size={28} color="white" />
      </TouchableOpacity>

      {/* Agreement Type Selection Modal */}
      <Modal visible={showAgreementTypeModal} animationType="fade" transparent={true}>
        <View style={styles.agreementTypeModalOverlay}>
          <View style={styles.agreementTypeModalContent}>
            <Text style={styles.agreementTypeModalTitle}>Select Agreement Type</Text>
            
            <TouchableOpacity 
              style={styles.agreementTypeButton}
              onPress={handleNormalAgreement}
            >
              <Ionicons name="document-text-outline" size={24} color="#2563eb" />
              <Text style={styles.agreementTypeButtonText}>Normal Agreement</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.agreementTypeButton}
              onPress={handleLiveSharing}
            >
              <Ionicons name="people-outline" size={24} color="#2563eb" />
              <Text style={styles.agreementTypeButtonText}>Live Sharing Agreement</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={() => setShowAgreementTypeModal(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Dashboard Drawer */}
      <Modal visible={showDashboard} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.dashboardDrawer}>
            {/* Pass the navigation prop here */}
            <Dashboard 
              user={user} 
              onClose={() => setShowDashboard(false)} 
              onLogout={handleLogout} 
              navigation={navigation}  // Make sure navigation is passed
            />
          </View>
        </View>
      </Modal>

      {/* Bottom Navigation */}
      <View style={styles.nav}>
        <Ionicons name="home" size={24} color="#2563eb" />
        <Ionicons name="newspaper-outline" size={24} color="#777" />
        <Ionicons name="document-text-outline" size={24} color="#777" />
        <Ionicons name="person-outline" size={24} color="#777" />
        <Ionicons name="settings-outline" size={24} color="#777" />
      </View>
    </SafeAreaView>
  );
}

const AgreementCard = ({ title, date, pages, status }) => {
  const isActive = status === 'Active';
  return (
    <View style={styles.card}>
      <View style={styles.rowSpaceBetween}>
        <Text style={styles.cardTitle}>{title}</Text>
        <View style={[styles.statusTag, isActive ? styles.active : styles.pending]}>
          <Text style={styles.statusText}>{status}</Text>
        </View>
      </View>
      <Text style={styles.cardSub}>Created on {date}</Text>
      <View style={styles.row}>
        <Ionicons name="document-outline" size={16} color="#555" />
        <Text style={styles.cardSub}>{pages}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? 40 : 0,
    backgroundColor: '#f9f9f9',
  },
  header: {
    paddingHorizontal: 16,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  menuIcon: {
    padding: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111',
  },
  cardsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 100,
    gap: 12,
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  cardSub: {
    fontSize: 12,
    color: '#555',
    marginTop: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  rowSpaceBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statusTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  active: {
    backgroundColor: '#e6f7ec',
  },
  pending: {
    backgroundColor: '#fff5e6',
  },
  statusText: {
    fontSize: 10,
  },
  fab: {
    backgroundColor: '#2563eb',
    position: 'absolute',
    bottom: 80,
    right: 20,
    borderRadius: 50,
    padding: 14,
    zIndex: 2,
  },
  nav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: '#fff',
  },
  modalOverlay: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  dashboardDrawer: {
    width: '60%',
    height: '100%',
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  // New styles for agreement type modal
  agreementTypeModalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  agreementTypeModalContent: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  agreementTypeModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  agreementTypeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  agreementTypeButtonText: {
    marginLeft: 15,
    fontSize: 16,
  },
  cancelButton: {
    marginTop: 15,
    padding: 10,
  },
  cancelButtonText: {
    color: '#777',
    fontSize: 16,
  },
});