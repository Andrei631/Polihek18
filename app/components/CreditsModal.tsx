import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Linking, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { COLORS } from '../../constants/theme';

interface CreditsModalProps {
  visible: boolean;
  onClose: () => void;
}

export function CreditsModal({ visible, onClose }: CreditsModalProps) {
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
            <Text style={styles.title}>Credits & Attributions</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={COLORS.textPrimary} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
            <Text style={styles.intro}>
              Sentinel is built using open-source software and free public APIs. We acknowledge and thank the following providers:
            </Text>

            {renderSection("Hazard Data APIs", [
              { name: "GDACS", url: "https://www.gdacs.org/", description: "Global Disaster Alert and Coordination System" },
              { name: "USGS Earthquake Hazards Program", url: "https://earthquake.usgs.gov/", description: "Real-time earthquake data" },
              { name: "NASA EONET", url: "https://eonet.gsfc.nasa.gov/", description: "Earth Observatory Natural Event Tracker" },
              { name: "Copernicus EMS", url: "https://emergency.copernicus.eu/", description: "Emergency Management Service" },
              { name: "ReliefWeb", url: "https://reliefweb.int/", description: "Humanitarian information service" },
              { name: "EMSC", url: "https://www.emsc-csem.org/", description: "European-Mediterranean Seismological Centre" },
            ])}

            {renderSection("Mapping & Location", [
              { name: "MapLibre React Native", url: "https://github.com/maplibre/maplibre-react-native", description: "Open-source mapping library" },
              { name: "OpenStreetMap", url: "https://www.openstreetmap.org/", description: "Map data contributors" },
            ])}

            {renderSection("Intelligence & AI", [
              { name: "ExecuTorch", url: "https://pytorch.org/executorch-overview", description: "On-device AI inference by PyTorch" },
              { name: "React Native RAG", description: "Local Retrieval-Augmented Generation" },
            ])}

            {renderSection("Infrastructure", [
              { name: "Firebase", url: "https://firebase.google.com/", description: "Backend and cloud functions" },
              { name: "Expo", url: "https://expo.dev/", description: "React Native framework" },
            ])}
            
             {renderSection("Content", [
              { name: "Survival Manuals", description: "Adapted from standard safety protocols (FEMA, Red Cross, etc.)" },
            ])}
            
            <View style={styles.footer}>
                <Text style={styles.footerText}>Sentinel v1.0</Text>
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
