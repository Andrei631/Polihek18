import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Linking, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { COLORS } from '../../constants/theme';

interface CreditsModalProps {
  visible: boolean;
  onClose: () => void;
}

export function CreditsModal({ visible, onClose }: CreditsModalProps) {
  const { t } = useTranslation();

  const openLink = (url: string) => {
    Linking.openURL(url).catch(err => console.error("Couldn't load page", err));
  };

  const renderSection = (title: string, items: { name: string; url?: string; description?: string }[]) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {items.map((item, index) => (
        <TouchableOpacity 
          key={index} 
          style={styles.item} 
          onPress={() => item.url && openLink(item.url)}
          disabled={!item.url}
        >
          <View style={styles.itemHeader}>
            <Text style={[styles.itemName, item.url && styles.link]}>{item.name}</Text>
            {item.url && <Ionicons name="open-outline" size={14} color={COLORS.accent} />}
          </View>
          {item.description && <Text style={styles.itemDescription}>{item.description}</Text>}
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>{t('credits.title')}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={COLORS.textPrimary} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
            <Text style={styles.intro}>
              {t('credits.intro')}
            </Text>

            {renderSection(t('credits.sections.hazardApis'), [
              { name: "GDACS", url: "https://www.gdacs.org/", description: t('credits.items.gdacs') },
              { name: "USGS Earthquake Hazards Program", url: "https://earthquake.usgs.gov/", description: t('credits.items.usgs') },
              { name: "NASA EONET", url: "https://eonet.gsfc.nasa.gov/", description: t('credits.items.eonet') },
              { name: "Copernicus EMS", url: "https://emergency.copernicus.eu/", description: t('credits.items.copernicus') },
              { name: "ReliefWeb", url: "https://reliefweb.int/", description: t('credits.items.reliefweb') },
              { name: "EMSC", url: "https://www.emsc-csem.org/", description: t('credits.items.emsc') },
            ])}

            {renderSection(t('credits.sections.mapping'), [
              { name: "MapLibre React Native", url: "https://github.com/maplibre/maplibre-react-native", description: t('credits.items.maplibre') },
              { name: "OpenStreetMap", url: "https://www.openstreetmap.org/", description: t('credits.items.osm') },
            ])}

            {renderSection(t('credits.sections.ai'), [
              { name: "ExecuTorch", url: "https://pytorch.org/executorch-overview", description: t('credits.items.executorch') },
              { name: "React Native RAG", description: t('credits.items.rag') },
            ])}

            {renderSection(t('credits.sections.infrastructure'), [
              { name: "Firebase", url: "https://firebase.google.com/", description: t('credits.items.firebase') },
              { name: "Expo", url: "https://expo.dev/", description: t('credits.items.expo') },
            ])}
            
             {renderSection(t('credits.sections.content'), [
              { name: "Survival Manuals", description: t('credits.items.manuals') },
            ])}
            
            <View style={styles.footer}>
                <Text style={styles.footerText}>{t('credits.footer')}</Text>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '90%',
    height: '80%',
    backgroundColor: COLORS.card,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.accent,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  intro: {
    color: COLORS.textSecondary,
    marginBottom: 20,
    fontSize: 14,
    lineHeight: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.accent,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  item: {
    marginBottom: 12,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  itemName: {
    fontSize: 16,
    color: COLORS.textPrimary,
    marginRight: 6,
  },
  link: {
    textDecorationLine: 'underline',
  },
  itemDescription: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  footer: {
      marginTop: 20,
      alignItems: 'center',
      paddingBottom: 20
  },
  footerText: {
      color: COLORS.textSecondary,
      fontSize: 12
  }
});
