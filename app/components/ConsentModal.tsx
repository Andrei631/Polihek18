import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Alert, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../../constants/theme';

interface ConsentModalProps {
  visible: boolean;
  onAccept: () => void;
  onDecline: () => void;
}

export function ConsentModal({ visible, onAccept, onDecline }: ConsentModalProps) {
  
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false} 
      onRequestClose={() => {
        // Prevent closing by back button
        Alert.alert("Action Required", "You must accept the terms to use Sentinel.");
      }}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Ionicons name="shield-checkmark-outline" size={48} color={COLORS.accent} />
          <Text style={styles.title}>Legal Consent</Text>
          <Text style={styles.subtitle}>Please review our terms of service and privacy policy.</Text>
        </View>

        <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
          <Text style={styles.sectionHeader}>1. Disclaimer of Liability</Text>
          <Text style={styles.text}>
            Sentinel is an informational tool designed to assist in emergency preparedness and situational awareness. 
            It is NOT a substitute for professional emergency services (911, 112, etc.) or official government alerts.
            The developers of Sentinel assume no liability for any injuries, damages, or losses resulting from the use or misuse of this application.
          </Text>

          <Text style={styles.sectionHeader}>2. Data Accuracy</Text>
          <Text style={styles.text}>
            Hazard data, maps, and survival manuals are aggregated from third-party sources (e.g., USGS, GDACS, OpenStreetMap). 
            While we strive for accuracy, we cannot guarantee the real-time precision or completeness of this data. 
            Always verify information with official local authorities.
          </Text>

          <Text style={styles.sectionHeader}>3. AI Assistant Limitations</Text>
          <Text style={styles.text}>
            The Sentinel Local AI is an artificial intelligence model running on your device. 
            It may occasionally generate incorrect or misleading information (hallucinations). 
            Do not rely solely on the AI for critical medical or life-and-death decisions.
          </Text>

          <Text style={styles.sectionHeader}>4. Secret Vault & Data Security</Text>
          <Text style={styles.text}>
            The Secret Vault stores your sensitive documents (e.g., passports, medical records) locally on your device using encryption. 
            We do not have access to these documents. You are solely responsible for securing your device. 
            We are not liable for any unauthorized access to your data if your device is lost, stolen, or compromised.
          </Text>

          <Text style={styles.sectionHeader}>5. Privacy Policy</Text>
          <Text style={styles.text}>
            We prioritize your privacy. 
            - Location data is processed locally for map rendering and hazard alerts.
            - Secret Vault documents are encrypted and stored on your device.
            - We do not sell your personal data to third parties.
            - Account information (email) is used solely for authentication.
          </Text>

          <Text style={styles.sectionHeader}>6. Acceptance of Terms</Text>
          <Text style={styles.text}>
            By clicking I Accept, you acknowledge that you have read, understood, and agreed to these terms. 
            You agree to use Sentinel responsibly and at your own risk.
          </Text>
          
          <View style={{height: 40}} />
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.declineButton} onPress={onDecline}>
            <Text style={styles.declineText}>DECLINE</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.acceptButton} onPress={onAccept}>
            <Text style={styles.acceptText}>I ACCEPT</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginTop: 16,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 8,
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.accent,
    marginTop: 20,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  text: {
    fontSize: 14,
    color: '#E0E0E0',
    lineHeight: 22,
  },
  footer: {
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: '#333',
    flexDirection: 'row',
    gap: 16,
  },
  declineButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.danger,
    alignItems: 'center',
    justifyContent: 'center',
  },
  declineText: {
    color: COLORS.danger,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  acceptButton: {
    flex: 2,
    padding: 16,
    borderRadius: 8,
    backgroundColor: COLORS.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  acceptText: {
    color: '#000',
    fontWeight: 'bold',
    letterSpacing: 1,
  },
});
