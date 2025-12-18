import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../../constants/theme';

interface ConsentModalProps {
  visible: boolean;
  onAccept: () => void;
  onDecline: () => void;
}

export function ConsentModal({ visible, onAccept, onDecline }: ConsentModalProps) {
  const { t } = useTranslation();
  
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false} 
      onRequestClose={() => {
        // Prevent closing by back button
        Alert.alert(t('consent.alertTitle'), t('consent.alertMessage'));
      }}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Ionicons name="shield-checkmark-outline" size={48} color={COLORS.accent} />
          <Text style={styles.title}>{t('consent.title')}</Text>
          <Text style={styles.subtitle}>{t('consent.subtitle')}</Text>
        </View>

        <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
          <Text style={styles.sectionHeader}>{t('consent.sections.liabilityTitle')}</Text>
          <Text style={styles.text}>{t('consent.sections.liabilityBody')}</Text>

          <Text style={styles.sectionHeader}>{t('consent.sections.accuracyTitle')}</Text>
          <Text style={styles.text}>{t('consent.sections.accuracyBody')}</Text>

          <Text style={styles.sectionHeader}>{t('consent.sections.aiTitle')}</Text>
          <Text style={styles.text}>{t('consent.sections.aiBody')}</Text>

          <Text style={styles.sectionHeader}>{t('consent.sections.vaultTitle')}</Text>
          <Text style={styles.text}>{t('consent.sections.vaultBody')}</Text>

          <Text style={styles.sectionHeader}>{t('consent.sections.privacyTitle')}</Text>
          <Text style={styles.text}>{t('consent.sections.privacyBody')}</Text>

          <Text style={styles.sectionHeader}>{t('consent.sections.acceptanceTitle')}</Text>
          <Text style={styles.text}>{t('consent.sections.acceptanceBody')}</Text>
          
          <View style={{height: 40}} />
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.declineButton} onPress={onDecline}>
            <Text style={styles.declineText}>{t('consent.decline')}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.acceptButton} onPress={onAccept}>
            <Text style={styles.acceptText}>{t('consent.accept')}</Text>
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
