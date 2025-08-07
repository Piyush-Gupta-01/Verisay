import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Alert, Image, ScrollView, Platform, ActivityIndicator, TextInput
} from 'react-native';
import { auth } from '../../firebaseConfig';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Audio } from 'expo-av';
import { Picker } from '@react-native-picker/picker';
import * as DocumentPicker from 'expo-document-picker';

// Configuration
const API_BASE_URL = 'http://172.31.104.71:8000/api';

const STEPS = {
  SELECT_AGREEMENT: 0,
  RECORD_AGREEMENT: 1, 
  PARTY1_FACE: 2,
  PARTY1_ID_PROOF: 3,
  PARTY2_FACE: 4,
  PARTY2_ID_PROOF: 5,
  AI_PROCESSING: 6,    // AI processes audio + saves data
  MISSING_FIELDS: 7,   // Show missing fields form
  FINAL_REVIEW: 8,     // Final PDF review
  COMPLETED: 9         // Success page
};

const AGREEMENT_TYPE_MAPPING = {
  'rental': 'RENTAL',
  'loan': 'LOAN', 
  'exchange': 'BUSINESS',
  'business': 'BUSINESS',
  'custom': 'FREELANCING'
};

// Field definitions for each agreement type
const AGREEMENT_FIELDS = {
  RENTAL: [
    { key: 'landlordName', label: 'Landlord Name', required: true },
    { key: 'tenantName', label: 'Tenant Name', required: true },
    { key: 'propertyAddress', label: 'Property Address', required: true },
    { key: 'rentAmount', label: 'Monthly Rent Amount', required: true },
    { key: 'securityDeposit', label: 'Security Deposit', required: true },
    { key: 'startDate', label: 'Lease Start Date', required: true },
    { key: 'endDate', label: 'Lease End Date', required: true },
    { key: 'utilities', label: 'Utilities Responsibility', required: false },
    { key: 'noticePeriod', label: 'Notice Period (days)', required: false }
  ],
  LOAN: [
    { key: 'lenderName', label: 'Lender Name', required: true },
    { key: 'borrowerName', label: 'Borrower Name', required: true },
    { key: 'loanAmount', label: 'Loan Amount', required: true },
    { key: 'interestRate', label: 'Interest Rate (%)', required: true },
    { key: 'repaymentPeriod', label: 'Repayment Period (months)', required: true },
    { key: 'startDate', label: 'Loan Start Date', required: true },
    { key: 'endDate', label: 'Repayment End Date', required: true },
    { key: 'collateral', label: 'Collateral Details', required: false }
  ],
  BUSINESS: [
    { key: 'businessName', label: 'Business Name', required: true },
    { key: 'partnerName', label: 'Partner Name', required: true },
    { key: 'businessType', label: 'Business Type', required: true },
    { key: 'investmentAmount', label: 'Investment Amount', required: true },
    { key: 'profitSharingRatio', label: 'Profit Sharing Ratio', required: true },
    { key: 'startDate', label: 'Partnership Start Date', required: true },
    { key: 'responsibilities', label: 'Responsibilities', required: false },
    { key: 'terminationClause', label: 'Termination Clause', required: false }
  ],
  FREELANCING: [
    { key: 'clientName', label: 'Client Name', required: true },
    { key: 'freelancerName', label: 'Freelancer Name', required: true },
    { key: 'projectDescription', label: 'Project Description', required: true },
    { key: 'projectAmount', label: 'Project Amount', required: true },
    { key: 'deadline', label: 'Project Deadline', required: true },
    { key: 'paymentTerms', label: 'Payment Terms', required: true },
    { key: 'deliverables', label: 'Deliverables', required: false },
    { key: 'revisionPolicy', label: 'Revision Policy', required: false }
  ]
};

const SafeContainer = ({ children }) => (
  <View style={{ 
    flex: 1,
    backgroundColor: '#f7fafc',
    paddingTop: Platform.OS === 'android' ? 25 : 0 
  }}>
    {children}
  </View>
);

export default function CreateAgreementScreen({ navigation, route }) {
  
  React.useEffect(() => {
    console.log("Navigation params:", route.params);
    if (!route.params?.userId) {
      Alert.alert("Error", "User ID not found");
      navigation.goBack();
    }
  }, []);

  const { userId } = route.params;
  const [currentStep, setCurrentStep] = useState(STEPS.SELECT_AGREEMENT);
  const [agreementType, setAgreementType] = useState('');
  const [recording, setRecording] = useState(null);
  const [audioURI, setAudioURI] = useState(null);
  const [face1URI, setFace1URI] = useState(null);
  const [face2URI, setFace2URI] = useState(null);
  const [idProofType1, setIdProofType1] = useState('');
  const [idProofType2, setIdProofType2] = useState('');
  const [idProof1URI, setIdProof1URI] = useState(null);
  const [idProof2URI, setIdProof2URI] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // AI Processing states
  const [agreementId, setAgreementId] = useState(null);
  const [extractedFields, setExtractedFields] = useState({});
  const [missingFields, setMissingFields] = useState([]);
  const [missingFieldsData, setMissingFieldsData] = useState({});
  const [processingStage, setProcessingStage] = useState('');

  // Audio recording functions
  const startRecording = async () => {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (permission.status !== 'granted') {
        Alert.alert('Permission required', 'Microphone access is needed.');
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync({
        android: {
          extension: '.mp3',
          outputFormat: Audio.RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_MPEG_4,
          audioEncoder: Audio.RECORDING_OPTION_ANDROID_AUDIO_ENCODER_AAC,
          sampleRate: 44100,
          numberOfChannels: 2,
          bitRate: 128000,
        },
        ios: {
          extension: '.mp3',
          outputFormat: Audio.RECORDING_OPTION_IOS_OUTPUT_FORMAT_MPEG4AAC,
          audioQuality: Audio.RECORDING_OPTION_IOS_AUDIO_QUALITY_HIGH,
          sampleRate: 44100,
          numberOfChannels: 2,
          bitRate: 128000,
        },
      });
      setRecording(recording);
      console.log('Recording started');
    } catch (err) {
      console.error('Recording error:', err);
      Alert.alert('Error', 'Could not start recording.');
    }
  };

  const stopRecording = async () => {
    try {
      if (!recording) return;
      
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setAudioURI(uri);
      setRecording(null);
      console.log('Recording stopped, URI:', uri);
    } catch (err) {
      console.error('Stop recording error:', err);
      Alert.alert('Error', 'Could not stop recording.');
    }
  };

  const captureFace = async (setter) => {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission denied', 'Camera permission is required.');
        return false;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        cameraType: ImagePicker.CameraType.front,
        quality: 0.8,
        allowsEditing: true,
        aspect: [1, 1],
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        setter(result.assets[0].uri);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Camera error:', error);
      Alert.alert('Error', 'Failed to capture image');
      return false;
    }
  };

  const selectIDProof = async (setter) => {
    try {
      setLoading(true);
      
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        copyToCacheDirectory: true,
        multiple: false
      });

      if (result.canceled) {
        return false;
      }

      if (result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        setter(file.uri);
        return true;
      }

      return false;
    } catch (err) {
      console.error('Document picker error:', err);
      Alert.alert('Error', err.message || 'Failed to select document');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    setCurrentStep(prev => prev + 1);
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, STEPS.SELECT_AGREEMENT));
  };

  // MAIN FUNCTION: Process after Party 2 documents
  const processAgreement = async () => {
    // Validate required fields
    if (!agreementType || !face1URI || !idProofType1 || !idProof1URI || !face2URI || !idProofType2 || !idProof2URI) {
      Alert.alert('Missing Information', 'Please complete all required fields.');
      return;
    }

    setLoading(true);
    setCurrentStep(STEPS.AI_PROCESSING);

    try {
      // Step 1: Get internal user ID
      setProcessingStage('Getting user information...');
      const firebaseUid = auth.currentUser?.uid;
      if (!firebaseUid) {
        throw new Error('User not authenticated');
      }

      const userResponse = await fetch(`${API_BASE_URL}/users/getInternalId`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firebaseUid }),
      });

      if (!userResponse.ok) {
        throw new Error('Failed to get user information');
      }

      const userData = await userResponse.json();
      const internalUserId = userData.internalUserId;

      // Step 2: Create agreement
      setProcessingStage('Creating agreement...');
      const agreementData = {
        userId: internalUserId,
        type: AGREEMENT_TYPE_MAPPING[agreementType],
        title: `${agreementType.charAt(0).toUpperCase() + agreementType.slice(1)} Agreement`,
        description: `Agreement created via mobile app`,
        status: 'IN_PROGRESS'
      };

      const agreementResponse = await fetch(`${API_BASE_URL}/agreements/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(agreementData),
      });

      if (!agreementResponse.ok) {
        throw new Error('Failed to create agreement');
      }

      const agreementResult = await agreementResponse.json();
      const newAgreementId = agreementResult.id;
      setAgreementId(newAgreementId);

      // Step 3: Upload all files simultaneously
      setProcessingStage('Uploading files...');
      await uploadAllFiles(newAgreementId);

      // Step 4: Process audio with AI (if available)
      if (audioURI) {
        setProcessingStage('AI processing audio...');
        await processAudioWithAI(newAgreementId);
      } else {
        setProcessingStage('No audio provided, showing form...');
        // No audio, show all required fields as missing
        const requiredFields = AGREEMENT_FIELDS[AGREEMENT_TYPE_MAPPING[agreementType]]
          .filter(field => field.required)
          .map(field => field.key);
        setMissingFields(requiredFields);
        setExtractedFields({});
      }

      // Step 5: Move to missing fields form
      setCurrentStep(STEPS.MISSING_FIELDS);

    } catch (error) {
      console.error('Processing error:', error);
      Alert.alert('Processing Failed', error.message || 'Failed to process agreement');
      setCurrentStep(STEPS.PARTY2_ID_PROOF); // Go back to last step
    } finally {
      setLoading(false);
    }
  };

  // Upload all files function
  // ... inside CreateAgreementScreen.js

  // Upload all files function
  const uploadAllFiles = async (agreementId) => {
    const uploadPromises = [];

    // --- CORRECTED API ENDPOINTS BELOW ---

    // Upload audio (MP3)
    if (audioURI) {
      const audioFormData = new FormData();
      audioFormData.append('agreementId', agreementId.toString());
      // The 'file' part must match the @RequestParam("file") in the Java controller
      audioFormData.append('file', {
        uri: audioURI,
        type: 'audio/mp3', // or 'audio/mpeg'
        name: 'agreement_audio.mp3',
      });

      uploadPromises.push(
        fetch(`${API_BASE_URL}/agreements/audiorecords/save`, { // Corrected URL
          method: 'POST',
          body: audioFormData,
          // 'Content-Type': 'multipart/form-data' is set automatically by fetch with FormData
        })
      );
    }

    // Upload Party 1 face (JPG)
    const face1FormData = new FormData();
    face1FormData.append('agreementId', agreementId.toString());
    face1FormData.append('partyType', 'PARTY1');
    face1FormData.append('file', {
      uri: face1URI,
      type: 'image/jpeg', // Use standard jpeg type
      name: 'party1_face.jpg',
    });

    uploadPromises.push(
      fetch(`${API_BASE_URL}/agreements/faceidentities/save`, { // Corrected URL
        method: 'POST',
        body: face1FormData,
      })
    );

    // Upload Party 2 face (JPG)
    const face2FormData = new FormData();
    face2FormData.append('agreementId', agreementId.toString());
    face2FormData.append('partyType', 'PARTY2');
    face2FormData.append('file', {
      uri: face2URI,
      type: 'image/jpeg',
      name: 'party2_face.jpg',
    });

    uploadPromises.push(
      fetch(`${API_BASE_URL}/agreements/faceidentities/save`, { // Corrected URL
        method: 'POST',
        body: face2FormData,
      })
    );

    // Upload Party 1 ID Proof
    const idProof1FormData = new FormData();
    idProof1FormData.append('agreementId', agreementId.toString());
    idProof1FormData.append('partyType', 'PARTY1');
    idProof1FormData.append('idProofType', idProofType1.toUpperCase());
    idProof1FormData.append('file', {
      uri: idProof1URI,
      // This needs to be a general type that can handle both PDF and images
      // The backend doesn't strictly validate this, but it's good practice.
      type: 'application/octet-stream', 
      name: `party1_${idProofType1}.id`, // Let backend handle extension
    });

    uploadPromises.push(
      fetch(`${API_BASE_URL}/agreements/id-proofs/save`, { // Corrected URL
        method: 'POST',
        body: idProof1FormData,
      })
    );

    // Upload Party 2 ID Proof
    const idProof2FormData = new FormData();
    idProof2FormData.append('agreementId', agreementId.toString());
    idProof2FormData.append('partyType', 'PARTY2');
    idProof2FormData.append('idProofType', idProofType2.toUpperCase());
    idProof2FormData.append('file', {
      uri: idProof2URI,
      type: 'application/octet-stream',
      name: `party2_${idProofType2}.id`,
    });

    uploadPromises.push(
      fetch(`${API_BASE_URL}/agreements/id-proofs/save`, { // Corrected URL
        method: 'POST',
        body: idProof2FormData,
      })
    );

    // Wait for all uploads to complete
    const uploadResults = await Promise.all(uploadPromises);

    // Optional: Add error checking for uploads
    for (const result of uploadResults) {
      if (!result.ok) {
        const errorText = await result.text();
        console.error('An upload failed:', errorText);
        // Throw an error to stop the processAgreement flow
        throw new Error('One or more file uploads failed.');
      }
    }
    
    console.log('All files uploaded successfully.');
  };

// ... rest of your CreateAgreementScreen.js file


  // Process audio with AI
  const processAudioWithAI = async (agreementId) => {
    try {
      // Call your transcription API
      const transcriptionResponse = await fetch(`${API_BASE_URL}/agreements/transcribe/${agreementId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (transcriptionResponse.ok) {
        const transcriptionResult = await transcriptionResponse.json();
        setExtractedFields(transcriptionResult.extractedFields || {});
        setMissingFields(transcriptionResult.missingFields || []);
        console.log('AI Extraction completed:', transcriptionResult);
      } else {
        // AI failed, show all required fields
        const requiredFields = AGREEMENT_FIELDS[AGREEMENT_TYPE_MAPPING[agreementType]]
          .filter(field => field.required)
          .map(field => field.key);
        setMissingFields(requiredFields);
        setExtractedFields({});
        console.log('AI processing failed, showing manual form');
      }
    } catch (error) {
      console.error('AI processing error:', error);
      // Fallback to manual form
      const requiredFields = AGREEMENT_FIELDS[AGREEMENT_TYPE_MAPPING[agreementType]]
        .filter(field => field.required)
        .map(field => field.key);
      setMissingFields(requiredFields);
      setExtractedFields({});
    }
  };

  // Submit missing fields
  const submitMissingFields = async () => {
    setLoading(true);
    
    try {
      // Combine extracted fields with user input
      const allFields = { ...extractedFields, ...missingFieldsData };
      
      // Submit to backend
      const response = await fetch(`${API_BASE_URL}/agreements/complete-fields/${agreementId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fields: allFields }),
      });

      if (response.ok) {
        setCurrentStep(STEPS.FINAL_REVIEW);
      } else {
        throw new Error('Failed to submit fields');
      }
    } catch (error) {
      console.error('Submit error:', error);
      Alert.alert('Error', 'Failed to submit fields');
    } finally {
      setLoading(false);
    }
  };

  // Final submission
  const finalSubmit = async () => {
    setLoading(true);
    
    try {
      // Update agreement status to completed
      const response = await fetch(`${API_BASE_URL}/agreements/update-status/${agreementId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'SIGNED' }),
      });

      if (response.ok) {
        setCurrentStep(STEPS.COMPLETED);
      } else {
        throw new Error('Failed to complete agreement');
      }
    } catch (error) {
      console.error('Final submit error:', error);
      Alert.alert('Error', 'Failed to complete agreement');
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch(currentStep) {
      case STEPS.SELECT_AGREEMENT:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Select Agreement Type</Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={agreementType}
                onValueChange={setAgreementType}
                style={styles.picker}
              >
                <Picker.Item label="Select Agreement Type" value="" />
                <Picker.Item label="🏠 Rental Agreement" value="rental" />
                <Picker.Item label="💰 Loan Agreement" value="loan" />
                <Picker.Item label="🔄 Exchange of Goods" value="exchange" />
                <Picker.Item label="🤝 Business Agreement" value="business" />
                <Picker.Item label="📝 Custom Agreement" value="custom" />
              </Picker>
            </View>
            <View style={styles.buttonGroup}>
              <TouchableOpacity
                style={[styles.button, agreementType ? styles.buttonPrimary : styles.buttonDisabled]}
                onPress={nextStep}
                disabled={!agreementType}
              >
                <Text style={styles.buttonText}>Next</Text>
              </TouchableOpacity>
            </View>
          </View>
        );

      case STEPS.RECORD_AGREEMENT:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Record Agreement (Optional)</Text>
            <Text style={styles.stepSubtitle}>{agreementType}</Text>
            
            <View style={styles.recordingContainer}>
              <TouchableOpacity 
                style={[
                  styles.recordButton, 
                  recording && styles.recordButtonActive
                ]}
                onPress={recording ? stopRecording : startRecording}
              >
                <Ionicons 
                  name={recording ? "stop" : "mic"} 
                  size={40} 
                  color={recording ? "#e53e3e" : "#4a5568"} 
                />
              </TouchableOpacity>
              
              {recording && (
                <Text style={styles.recordingStatus}>
                  🎤 Recording in progress...
                </Text>
              )}
              
              {audioURI && !recording && (
                <Text style={styles.recordingStatus}>
                  ✅ Recording completed (MP3 format)
                </Text>
              )}
            </View>

            <View style={styles.buttonGroup}>
              <TouchableOpacity style={styles.secondaryButton} onPress={prevStep}>
                <Text style={styles.secondaryButtonText}>Back</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.button} onPress={nextStep}>
                <Text style={styles.buttonText}>Next</Text>
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity style={styles.skipButton} onPress={nextStep}>
              <Text style={styles.skipButtonText}>Skip this step</Text>
            </TouchableOpacity>
          </View>
        );

      case STEPS.PARTY1_FACE:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Party 1: Capture Face</Text>
            <Text style={styles.stepSubtitle}>{agreementType}</Text>
            
            <TouchableOpacity 
              style={[styles.optionCard, face1URI && styles.optionCardActive]}
              onPress={async () => {
                await captureFace(setFace1URI);
              }}
            >
              <Ionicons name="person" size={28} color="#4a5568" />
              <Text style={styles.optionCardText}>📸 Capture Face (JPG)</Text>
              {face1URI && (
                <Ionicons name="checkmark-circle" size={20} color="#38a169" style={styles.optionCheckmark} />
              )}
            </TouchableOpacity>

            {face1URI && (
              <Image source={{ uri: face1URI }} style={styles.facePreview} />
            )}

            <View style={styles.buttonGroup}>
              <TouchableOpacity style={styles.secondaryButton} onPress={prevStep}>
                <Text style={styles.secondaryButtonText}>Back</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.button, !face1URI && styles.buttonDisabled]} 
                onPress={nextStep}
                disabled={!face1URI}
              >
                <Text style={styles.buttonText}>Next</Text>
              </TouchableOpacity>
            </View>
          </View>
        );

      case STEPS.PARTY1_ID_PROOF:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Party 1: Upload ID Proof</Text>
            <Text style={styles.stepSubtitle}>{agreementType}</Text>
            
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={idProofType1}
                onValueChange={setIdProofType1}
                style={styles.picker}
              >
                <Picker.Item label="Select ID Proof Type" value="" />
                <Picker.Item label="🆔 Aadhaar Card" value="aadhaar" />
                <Picker.Item label="🚗 Driving License" value="dl" />
                <Picker.Item label="🗳️ Voter ID" value="voter" />
                <Picker.Item label="📘 Passport" value="passport" />
                <Picker.Item label="💳 PAN Card" value="pan" />
              </Picker>
            </View>

            <TouchableOpacity 
              style={[
                styles.optionCard, 
                idProof1URI && styles.optionCardActive,
                loading && styles.optionCardDisabled
              ]}
              onPress={async () => {
                if (!idProofType1) {
                  Alert.alert('Select Type', 'Please select ID proof type first');
                  return;
                }
                await selectIDProof(setIdProof1URI);
              }}
              disabled={loading || !idProofType1}
            >
              {loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color="#4a5568" />
                  <Text style={styles.optionCardText}>Selecting...</Text>
                </View>
              ) : (
                <>
                  <Ionicons name="document-attach" size={24} color="#4a5568" />
                  <Text style={styles.optionCardText}>
                    {idProof1URI ? "📄 Document Selected" : "📎 Select Document"}
                  </Text>
                  {idProof1URI && (
                    <Ionicons 
                      name="checkmark-circle" 
                      size={20} 
                      color="#38a169" 
                      style={styles.optionCheckmark} 
                    />
                  )}
                </>
              )}
            </TouchableOpacity>

            <View style={styles.buttonGroup}>
              <TouchableOpacity style={styles.secondaryButton} onPress={prevStep}>
                <Text style={styles.secondaryButtonText}>Back</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[
                  styles.button, 
                  (!idProofType1 || !idProof1URI) && styles.buttonDisabled
                ]} 
                onPress={nextStep}
                disabled={!idProofType1 || !idProof1URI}
              >
                <Text style={styles.buttonText}>Next</Text>
              </TouchableOpacity>
            </View>
          </View>
        );

      case STEPS.PARTY2_FACE:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Party 2: Capture Face</Text>
            <Text style={styles.stepSubtitle}>{agreementType}</Text>
            
            <TouchableOpacity 
              style={[styles.optionCard, face2URI && styles.optionCardActive]}
              onPress={async () => {
                await captureFace(setFace2URI);
              }}
            >
              <Ionicons name="person" size={28} color="#4a5568" />
              <Text style={styles.optionCardText}>📸 Capture Face (JPG)</Text>
              {face2URI && (
                <Ionicons name="checkmark-circle" size={20} color="#38a169" style={styles.optionCheckmark} />
              )}
            </TouchableOpacity>

            {face2URI && (
              <Image source={{ uri: face2URI }} style={styles.facePreview} />
            )}

            <View style={styles.buttonGroup}>
              <TouchableOpacity style={styles.secondaryButton} onPress={prevStep}>
                <Text style={styles.secondaryButtonText}>Back</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.button, !face2URI && styles.buttonDisabled]} 
                onPress={nextStep}
                disabled={!face2URI}
              >
                <Text style={styles.buttonText}>Next</Text>
              </TouchableOpacity>
            </View>
          </View>
        );

      case STEPS.PARTY2_ID_PROOF:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Party 2: Upload ID Proof</Text>
            <Text style={styles.stepSubtitle}>{agreementType}</Text>
            
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={idProofType2}
                onValueChange={setIdProofType2}
                style={styles.picker}
              >
                <Picker.Item label="Select ID Proof Type" value="" />
                <Picker.Item label="🆔 Aadhaar Card" value="aadhaar" />
                <Picker.Item label="🚗 Driving License" value="dl" />
                <Picker.Item label="🗳️ Voter ID" value="voter" />
                <Picker.Item label="📘 Passport" value="passport" />
                <Picker.Item label="💳 PAN Card" value="pan" />
              </Picker>
            </View>

            <TouchableOpacity 
              style={[
                styles.optionCard, 
                idProof2URI && styles.optionCardActive,
                loading && styles.optionCardDisabled
              ]}
              onPress={async () => {
                if (!idProofType2) {
                  Alert.alert('Select ID Type', 'Please select ID proof type first');
                  return;
                }
                await selectIDProof(setIdProof2URI);
              }}
              disabled={!idProofType2 || loading}
            >
              {loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color="#4a5568" />
                  <Text style={styles.optionCardText}>Selecting...</Text>
                </View>
              ) : (
                <>
                  <Ionicons name="document-attach" size={28} color="#4a5568" />
                  <Text style={styles.optionCardText}>
                    {idProof2URI ? "📄 Document Selected" : "📎 Select Document"}
                  </Text>
                  {idProof2URI && (
                    <Ionicons name="checkmark-circle" size={20} color="#38a169" style={styles.optionCheckmark} />
                  )}
                </>
              )}
            </TouchableOpacity>

            <View style={styles.buttonGroup}>
              <TouchableOpacity style={styles.secondaryButton} onPress={prevStep}>
                <Text style={styles.secondaryButtonText}>Back</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.button, (!idProofType2 || !idProof2URI || loading) && styles.buttonDisabled]} 
                onPress={processAgreement}
                disabled={!idProofType2 || !idProof2URI || loading}
              >
                {loading ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator color="#fff" size="small" />
                    <Text style={[styles.buttonText, { marginLeft: 8 }]}>Processing...</Text>
                  </View>
                ) : (
                  <Text style={styles.buttonText}>Next</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        );

      // AI Processing Screen
      case STEPS.AI_PROCESSING:
        return (
          <View style={styles.stepContainer}>
            <View style={styles.aiProcessingContainer}>
              <Text style={styles.aiTitle}>🤖 AI Processing Your Agreement</Text>
              
              <View style={styles.processingSteps}>
                <View style={styles.processingStep}>
                  <ActivityIndicator size="small" color="#2563eb" />
                  <Text style={styles.processingText}>{processingStage}</Text>
                </View>
                
                <View style={styles.processingStep}>
                  <Ionicons name="cloud-upload" size={20} color="#38a169" />
                  <Text style={styles.processingCompleted}>✅ Files uploading (MP3, JPG)</Text>
                </View>
                
                {audioURI && (
                  <View style={styles.processingStep}>
                    <ActivityIndicator size="small" color="#2563eb" />
                    <Text style={styles.processingText}>🎤 AI extracting from audio...</Text>
                  </View>
                )}
                
                <View style={styles.processingStep}>
                  <ActivityIndicator size="small" color="#2563eb" />
                  <Text style={styles.processingText}>📄 Generating dynamic agreement...</Text>
                </View>
              </View>
              
              <Text style={styles.waitingText}>
                Please wait while AI processes your data...
              </Text>
            </View>
          </View>
        );

      // Missing Fields Form
      case STEPS.MISSING_FIELDS:
        const agreementFields = AGREEMENT_FIELDS[AGREEMENT_TYPE_MAPPING[agreementType]] || [];
        
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Complete Agreement Details</Text>
            <Text style={styles.stepSubtitle}>
              {audioURI ? "AI extracted some fields. Please complete the missing ones:" : "Please fill in the agreement details:"}
            </Text>
            
            <ScrollView style={styles.formContainer}>
              {/* Show AI extracted data */}
              {Object.keys(extractedFields).length > 0 && (
                <View style={styles.extractedSection}>
                  <Text style={styles.sectionTitle}>✅ AI Extracted:</Text>
                  {Object.entries(extractedFields).map(([key, value]) => (
                    <View key={key} style={styles.extractedItem}>
                      <Text style={styles.fieldLabel}>{agreementFields.find(f => f.key === key)?.label || key}:</Text>
                      <Text style={styles.fieldValue}>{value}</Text>
                    </View>
                  ))}
                </View>
              )}
              
              {/* Missing fields form */}
              <View style={styles.missingSection}>
                <Text style={styles.sectionTitle}>
                  {audioURI ? "❗ Please provide missing details:" : "📝 Agreement Details:"}
                </Text>
                
                {agreementFields.map((field) => {
                  // Show field if it's missing or if no audio was provided
                  const shouldShow = !audioURI || missingFields.includes(field.key) || !extractedFields[field.key];
                  
                  if (!shouldShow) return null;
                  
                  return (
                    <View key={field.key} style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>
                        {field.label} {field.required && <Text style={styles.required}>*</Text>}
                      </Text>
                      <TextInput
                        style={styles.textInput}
                        value={missingFieldsData[field.key] || ''}
                        onChangeText={(text) => setMissingFieldsData(prev => ({
                          ...prev,
                          [field.key]: text
                        }))}
                        placeholder={`Enter ${field.label.toLowerCase()}`}
                        multiline={field.key.includes('description') || field.key.includes('address')}
                        numberOfLines={field.key.includes('description') || field.key.includes('address') ? 3 : 1}
                      />
                    </View>
                  );
                })}
              </View>
            </ScrollView>
            
            <View style={styles.buttonGroup}>
              <TouchableOpacity 
                style={styles.secondaryButton} 
                onPress={() => setCurrentStep(STEPS.PARTY2_ID_PROOF)}
              >
                <Text style={styles.secondaryButtonText}>Back</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={submitMissingFields}
                disabled={loading}
              >
                {loading ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator color="#fff" size="small" />
                    <Text style={[styles.buttonText, { marginLeft: 8 }]}>Submitting...</Text>
                  </View>
                ) : (
                  <Text style={styles.buttonText}>Continue to Review</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        );

      // Final Review Screen
      case STEPS.FINAL_REVIEW:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Final Agreement Review</Text>
            <Text style={styles.stepSubtitle}>Review your complete agreement before finalizing</Text>
            
            <ScrollView style={styles.reviewContainer}>
              <View style={styles.agreementPreview}>
                <View style={styles.previewHeader}>
                  <Ionicons name="document-text" size={40} color="#2563eb" />
                  <Text style={styles.previewTitle}>{agreementType.toUpperCase()} AGREEMENT</Text>
                  <Text style={styles.previewId}>Agreement ID: {agreementId}</Text>
                </View>
                
                {/* Combined data preview */}
                <View style={styles.dataPreview}>
                  <Text style={styles.dataTitle}>Agreement Details:</Text>
                  
                  {/* Show all fields (extracted + user input) */}
                  {Object.entries({ ...extractedFields, ...missingFieldsData }).map(([key, value]) => {
                    const field = AGREEMENT_FIELDS[AGREEMENT_TYPE_MAPPING[agreementType]]?.find(f => f.key === key);
                    if (!field || !value) return null;
                    
                    return (
                      <View key={key} style={styles.dataItem}>
                        <Text style={styles.dataLabel}>{field.label}:</Text>
                        <Text style={styles.dataValue}>{value}</Text>
                      </View>
                    );
                  })}
                </View>
                
                <View style={styles.attachmentsSummary}>
                  <Text style={styles.dataTitle}>Attachments:</Text>
                  <View style={styles.attachmentItem}>
                    <Ionicons name="person" size={16} color="#38a169" />
                    <Text style={styles.attachmentText}>✅ Party 1 Face (JPG)</Text>
                  </View>
                  <View style={styles.attachmentItem}>
                    <Ionicons name="person" size={16} color="#38a169" />
                    <Text style={styles.attachmentText}>✅ Party 2 Face (JPG)</Text>
                  </View>
                  <View style={styles.attachmentItem}>
                    <Ionicons name="document" size={16} color="#38a169" />
                    <Text style={styles.attachmentText}>✅ Party 1 ID ({idProofType1.toUpperCase()})</Text>
                  </View>
                  <View style={styles.attachmentItem}>
                    <Ionicons name="document" size={16} color="#38a169" />
                    <Text style={styles.attachmentText}>✅ Party 2 ID ({idProofType2.toUpperCase()})</Text>
                  </View>
                  {audioURI && (
                    <View style={styles.attachmentItem}>
                      <Ionicons name="musical-notes" size={16} color="#38a169" />
                      <Text style={styles.attachmentText}>✅ Audio Recording (MP3)</Text>
                    </View>
                  )}
                </View>
              </View>
            </ScrollView>
            
            <View style={styles.buttonGroup}>
              <TouchableOpacity 
                style={styles.secondaryButton} 
                onPress={() => setCurrentStep(STEPS.MISSING_FIELDS)}
              >
                <Text style={styles.secondaryButtonText}>Back to Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={finalSubmit}
                disabled={loading}
              >
                {loading ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator color="#fff" size="small" />
                    <Text style={[styles.buttonText, { marginLeft: 8 }]}>Finalizing...</Text>
                  </View>
                ) : (
                  <Text style={styles.buttonText}>✅ Finalize Agreement</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        );

      // Completion Screen
      case STEPS.COMPLETED:
        return (
          <View style={styles.stepContainer}>
            <View style={styles.completionContainer}>
              <View style={styles.successIcon}>
                <Ionicons name="checkmark-circle" size={80} color="#38a169" />
              </View>
              
              <Text style={styles.successTitle}>🎉 Agreement Created Successfully!</Text>
              
              <View style={styles.successDetails}>
                <Text style={styles.successText}>Agreement ID: {agreementId}</Text>
                <Text style={styles.successText}>Type: {agreementType.toUpperCase()}</Text>
                <Text style={styles.successText}>Status: SIGNED</Text>
                <Text style={styles.successText}>Created: {new Date().toLocaleDateString()}</Text>
              </View>
              
              <View style={styles.successFeatures}>
                <View style={styles.featureItem}>
                  <Ionicons name="shield-checkmark" size={24} color="#38a169" />
                  <Text style={styles.featureText}>Blockchain Secured</Text>
                </View>
                <View style={styles.featureItem}>
                  <Ionicons name="lock-closed" size={24} color="#38a169" />
                  <Text style={styles.featureText}>Legally Binding</Text>
                </View>
                <View style={styles.featureItem}>
                  <Ionicons name="cloud-done" size={24} color="#38a169" />
                  <Text style={styles.featureText}>AI Processed</Text>
                </View>
              </View>
              
              <View style={styles.completionButtons}>
                <TouchableOpacity 
                  style={styles.secondaryButton}
                  onPress={() => {
                    // Reset all states for new agreement
                    setCurrentStep(STEPS.SELECT_AGREEMENT);
                    setAgreementType('');
                    setAudioURI(null);
                    setFace1URI(null);
                    setFace2URI(null);
                    setIdProof1URI(null);
                    setIdProof2URI(null);
                    setIdProofType1('');
                    setIdProofType2('');
                    setRecording(null);
                    setExtractedFields({});
                    setMissingFields([]);
                    setMissingFieldsData({});
                    setAgreementId(null);
                  }}
                >
                  <Text style={styles.secondaryButtonText}>Create New Agreement</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.button}
                  onPress={() => navigation.navigate('Home')}
                >
                  <Text style={styles.buttonText}>Go to Home</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <SafeContainer>
      {/* Progress Bar */}
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { 
          width: `${(currentStep / (Object.keys(STEPS).length - 1)) * 100}%` 
        }]} />
      </View>

      {/* Back Button */}
      {currentStep !== STEPS.SELECT_AGREEMENT && 
       currentStep !== STEPS.AI_PROCESSING && 
       currentStep !== STEPS.COMPLETED && (
        <TouchableOpacity style={styles.backButton} onPress={prevStep}>
          <Ionicons name="arrow-back" size={24} color="#2d3748" />
        </TouchableOpacity>
      )}

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {renderStep()}
      </ScrollView>
    </SafeContainer>
  );
}

// Complete Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7fafc',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 100,
  },
  progressBar: {
    top: 16,
    height: 5,
    width: '100%',
    backgroundColor: '#e2e8f0',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#2563eb',
    borderRadius: 2.5,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 10,
    zIndex: 10,
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 20,
  },
  stepContainer: {
    top: 35,
    padding: 24,
    flex: 1,
  },
  stepTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2d3748',
    marginBottom: 8,
    textAlign: 'center',
  },
  stepSubtitle: {
    fontSize: 16,
    color: '#4a5568',
    marginBottom: 24,
    textAlign: 'center',
    textTransform: 'capitalize',
    fontWeight: '500',
  },
  pickerWrapper: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 24,
    borderColor: '#e2e8f0',
    borderWidth: 1,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
  optionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  optionCardActive: {
    borderColor: '#4299e1',
    backgroundColor: '#ebf8ff',
  },
  optionCardDisabled: {
    opacity: 0.6,
  },
  optionCardText: {
    fontSize: 16,
    color: '#4a5568',
    marginLeft: 12,
    flex: 1,
  },
  optionCheckmark: {
    marginLeft: 'auto',
  },
  facePreview: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignSelf: 'center',
    marginVertical: 16,
    borderWidth: 3,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  button: {
    backgroundColor: '#2563eb',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    flex: 1,
    marginLeft: 8,
    alignItems: 'center',
  },
  buttonPrimary: {
    backgroundColor: '#2563eb',
  },
  buttonDisabled: {
    backgroundColor: '#a0aec0',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  secondaryButton: {
    backgroundColor: '#fff',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    flex: 1,
    marginRight: 8,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#4a5568',
    fontWeight: '600',
    fontSize: 16,
  },
  skipButton: {
    alignSelf: 'center',
    marginTop: 16,
    padding: 8,
  },
  skipButtonText: {
    color: '#718096',
    textDecorationLine: 'underline',
    fontSize: 14,
  },
  recordingContainer: {
    alignItems: 'center',
    marginVertical: 40,
  },
  recordButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#ebf8ff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#4299e1',
  },
  recordButtonActive: {
    backgroundColor: '#fed7d7',
    borderColor: '#e53e3e',
  },
  recordingStatus: {
    marginTop: 16,
    fontSize: 16,
    color: '#4a5568',
    fontWeight: '500',
    textAlign: 'center',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  // AI Processing Styles
  aiProcessingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  aiTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2563eb',
    marginBottom: 30,
    textAlign: 'center',
  },
  processingSteps: {
    width: '100%',
    marginBottom: 30,
  },
  processingStep: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  processingText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#4a5568',
    fontWeight: '500',
  },
  processingCompleted: {
    marginLeft: 12,
    fontSize: 16,
    color: '#38a169',
    fontWeight: '500',
  },
  waitingText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  // Form Styles
  formContainer: {
    flex: 1,
    marginBottom: 20,
  },
  extractedSection: {
    backgroundColor: '#f0fff4',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#38a169',
  },
  missingSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#2d3748',
  },
  extractedItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4a5568',
    flex: 1,
  },
  fieldValue: {
    fontSize: 14,
    color: '#2d3748',
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2d3748',
    marginBottom: 8,
  },
  required: {
    color: '#e53e3e',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    color: '#2d3748',
  },
  // Review Styles
  reviewContainer: {
    flex: 1,
    marginBottom: 20,
  },
  agreementPreview: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  previewHeader: {
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  previewTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2563eb',
    marginTop: 12,
  },
  previewId: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  dataPreview: {
    marginBottom: 20,
  },
  dataTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2d3748',
    marginBottom: 12,
  },
  dataItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingVertical: 4,
  },
  dataLabel: {
    fontSize: 14,
    color: '#4a5568',
    fontWeight: '500',
    flex: 1,
  },
  dataValue: {
    fontSize: 14,
    color: '#2d3748',
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  attachmentsSummary: {
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 20,
  },
  attachmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  attachmentText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#38a169',
    fontWeight: '500',
  },
  // Completion Styles
  completionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  successIcon: {
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#38a169',
    textAlign: 'center',
    marginBottom: 20,
  },
  successDetails: {
    backgroundColor: '#f0fff4',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    width: '100%',
    borderWidth: 1,
    borderColor: '#38a169',
  },
  successText: {
    fontSize: 16,
    color: '#2d3748',
    marginBottom: 8,
    textAlign: 'center',
    fontWeight: '500',
  },
  successFeatures: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 30,
  },
  featureItem: {
    alignItems: 'center',
  },
  featureText: {
    fontSize: 12,
    color: '#38a169',
    marginTop: 4,
    fontWeight: '500',
  },
  completionButtons: {
    flexDirection: 'row',
    width: '100%',
  },
});

