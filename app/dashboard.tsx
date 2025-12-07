import { Ionicons } from '@expo/vector-icons';
import { OfflineManager } from "@maplibre/maplibre-react-native";
import { useNetInfo } from '@react-native-community/netinfo';
import { firebase } from '@react-native-firebase/auth';
import * as Location from "expo-location";
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SentinelCard } from '../components/SentinelCard';
import { COLORS } from '../constants/theme';

export default function Dashboard() {
  const router = useRouter();
  const { isConnected } = useNetInfo();
  
  const isPremium = true; 

  const [downloadedRadius, setDownloadedRadius] = useState<string | null>(null);
  const [existingPack, setExistingPack] = useState<any>(null);
  
  // Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [radiusInput, setRadiusInput] = useState('20'); // Default to min
  const [estimatedSize, setEstimatedSize] = useState('~40 MB'); // Initial estimate
  const [isDownloading, setIsDownloading] = useState(false);

  // --- 1. CHECK FOR EXISTING DOWNLOADS ---
  useEffect(() => {
    checkExistingDownloads();
  }, []);

  // --- 2. UPDATE SIZE ESTIMATE WHEN INPUT CHANGES ---
  useEffect(() => {
    const r = parseInt(radiusInput);
    if (!isNaN(r) && r > 0) {
        // Heuristic: Area * 0.1 MB (Adjust based on testing)
        // 20km -> 40MB
        // 50km -> 250MB
        const sizeMB = Math.round((r * r) * 0.1); 
        // Add roughly 10MB for the global overview tiles
        const totalSize = sizeMB + 10; 
        setEstimatedSize(`~${totalSize} MB`);
    } else {
        setEstimatedSize('Unknown');
    }
  }, [radiusInput]);

  const checkExistingDownloads = async () => {
    try {
      const packs = await OfflineManager.getPacks();
      // We look for the "Detail" pack specifically
      const foundPack = packs.find(p => p.name?.includes('offlinePack_Detail'));
      
      if (foundPack) {
        setExistingPack(foundPack);
        if (foundPack.metadata && foundPack.metadata.radius) {
           setDownloadedRadius(`${foundPack.metadata.radius}km`);
        } else {
           setDownloadedRadius("Cached");
        }
      }
    } catch (err) {
      console.log("Error checking offline packs:", err);
    }
  };

  const navigateToMap = () => {
    if (downloadedRadius || existingPack) {
        router.push({
            pathname: '/map',
            params: { isPremium: "true", downloadedRadius: downloadedRadius || "Cached" }
        });
        return;
    }
    setRadiusInput('20');
    setModalVisible(true);
  };

  const promptDeleteAndRedownload = () => {
      Alert.alert(
          "Update Offline Map?",
          "This will delete the existing map cache and download a new area.",
          [
              { text: "Cancel", style: "cancel" },
              { text: "Update", style: "destructive", onPress: async () => {
                  setDownloadedRadius(null);
                  setExistingPack(null);
                  try {
                    const packs = await OfflineManager.getPacks();
                    for (const pack of packs) {
                        // Delete BOTH global and detail packs to be clean
                        if (pack.name?.includes('offlinePack')) {
                            await OfflineManager.deletePack(pack.name);
                        }
                    }
                    Alert.alert("Cache Cleared", "You can now download a new area.");
                  } catch (e) {
                    console.log("Delete error", e);
                  }
              }}
          ]
      );
  };

  // --- DOWNLOAD LOGIC (HYBRID STRATEGY) ---
  const handleInitiateDownload = async () => {
    const km = parseInt(radiusInput);

    // 1. VALIDATION: Minimum 20km
    if (isNaN(km) || km < 20) {
        Alert.alert("Minimum Radius Required", "Please enter at least 20km to ensure safe coverage.");
        return;
    }

    setIsDownloading(true);

    try {
        OfflineManager.setTileCountLimit(1000000); 

        // Cleanup old packs
        const packs = await OfflineManager.getPacks();
        for (const pack of packs) {
            if (pack.name?.includes('offlinePack')) {
                await OfflineManager.deletePack(pack.name);
            }
        }

        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
            Alert.alert("Permission denied", "Location access is required.");
            setIsDownloading(false);
            return;
        }

        const loc = await Location.getCurrentPositionAsync({});
        const lng = loc.coords.longitude;
        const lat = loc.coords.latitude;

        // Use your MapTiler Key
        const MAP_STYLE = `https://api.maptiler.com/maps/streets/style.json?key=i2gNH16bxfhHTv62Ijhp`;

        // --- PART A: DOWNLOAD GLOBAL OVERVIEW (Zoom 0-4) ---
        // This takes ~10MB and ensures the user never sees a blank world
        await OfflineManager.createPack({
            name: `offlinePack_Global`,
            styleURL: MAP_STYLE,
            bounds: [[-180, -85], [180, 85]], 
            minZoom: 0,
            maxZoom: 4, 
            metadata: { type: 'global_overview' }
        }, (p) => {}, (e) => console.log(e));

        // --- PART B: DOWNLOAD DETAILED REGION (Zoom 5-14) ---
        const R = 6371; 
        const dLng = (km / R) * (180 / Math.PI) / Math.cos(lat * Math.PI / 180);
        const dLat = (km / R) * (180 / Math.PI);
        const bounds: [[number, number], [number, number]] = [
          [lng - dLng, lat - dLat], 
          [lng + dLng, lat + dLat], 
        ];

        await OfflineManager.createPack({
            name: `offlinePack_Detail_${Date.now()}`,
            styleURL: MAP_STYLE,
            bounds: bounds,
            minZoom: 5,   
            maxZoom: 14, 
            metadata: { radius: km }
        }, (p) => {}, (e) => console.log(e));

        await checkExistingDownloads();
        setIsDownloading(false);
        setModalVisible(false);

        const finalRadius = `${km}km`;
        setDownloadedRadius(finalRadius);

        setTimeout(() => {
            router.push({
                pathname: "/map",
                params: { isPremium: "true", downloadedRadius: finalRadius },
            });
        }, 500);

    } catch (err) {
        console.log("Download Error:", err);
        Alert.alert("Download Failed", "Check internet connection or storage.");
        setIsDownloading(false);
    }
  };

  const getMapSubtitle = () => {
    if (isDownloading) return `Caching ${radiusInput}km terrain packet...`;
    if (existingPack || downloadedRadius) return `Offline Ready • ${downloadedRadius || "20km"}`;
    return "Tap to configure offline download";
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>DASHBOARD</Text>
          <Text style={[styles.headerSubtitle, { color: isConnected ? COLORS.success : COLORS.danger }]}>
            {isConnected ? "● NETWORK: ONLINE" : "○ NETWORK: OFFLINE"}
          </Text>
        </View>
      </View>

      <View style={styles.menuContainer}>
        <SentinelCard
          title="Universal Crisis Manuals"
          subtitle="Comprehensive guides for any survival condition"
          icon="documents-outline"
          onPress={() => router.push('/SurvivalManuals')}
        />
        
        <SentinelCard
          title="Map"
          subtitle={getMapSubtitle()}
          icon={isDownloading ? "cloud-download-outline" : "map-outline"}
          isPremium={true}
          onPress={navigateToMap}
          onLongPress={promptDeleteAndRedownload}
        />

        <SentinelCard
          title="Sentinel Local AI"
          subtitle="On-device intelligence. Works 100% offline."
          icon="hardware-chip-outline"
          isLocked={false}
          isPremium={true}
          onPress={() => router.push('/ChatScreen')}
        />
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={() => { firebase.auth().signOut(); router.replace('/'); }}>
        <Text style={styles.logoutText}>DISCONNECT</Text>
      </TouchableOpacity>

      {/* MODAL */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Ionicons name="cloud-download" size={40} color={COLORS.accent} />
              <Text style={styles.modalTitle}>OFFLINE CACHE</Text>
            </View>
            
            <Text style={styles.modalDesc}>
              Enter download radius (Min: 20km).
            </Text>

            <View style={styles.inputRow}>
              <TextInput
                style={styles.modalInput}
                placeholder="20"
                placeholderTextColor={COLORS.textSecondary}
                keyboardType="numeric"
                value={radiusInput}
                onChangeText={setRadiusInput}
                autoFocus
              />
              <Text style={styles.kmText}>KM</Text>
            </View>

            {/* SIZE ESTIMATOR UI */}
            <View style={styles.estimateContainer}>
                <Text style={styles.estimateLabel}>ESTIMATED STORAGE:</Text>
                <Text style={styles.estimateValue}>{estimatedSize}</Text>
            </View>

            {isDownloading ? (
              <View style={styles.downloadingContainer}>
                <ActivityIndicator size="large" color={COLORS.accent} />
                <Text style={styles.downloadingText}>Downloading Terrain...</Text>
              </View>
            ) : (
              <View style={styles.modalButtons}>
                <TouchableOpacity 
                  style={[styles.modalBtn, styles.cancelBtn]}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.cancelText}>CANCEL</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.modalBtn, styles.confirmBtn]}
                  onPress={handleInitiateDownload}
                >
                  <Text style={styles.confirmText}>DOWNLOAD</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </KeyboardAvoidingView>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, paddingHorizontal: 24 },
  header: { marginTop: 20, marginBottom: 40, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { fontSize: 16, fontWeight: '800', color: COLORS.textPrimary, letterSpacing: 1 },
  headerSubtitle: { fontSize: 10, marginTop: 4, fontWeight: 'bold' },
  menuContainer: { flex: 1 },
  logoutButton: { alignSelf: 'center', marginBottom: 20, padding: 15 },
  logoutText: { color: COLORS.danger, fontSize: 12, fontWeight: 'bold', letterSpacing: 1 },
  
  // MODAL STYLES
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.8)' },
  modalContent: { backgroundColor: '#181818', padding: 24, borderTopLeftRadius: 20, borderTopRightRadius: 20, borderWidth: 1, borderColor: '#333' },
  modalHeader: { alignItems: 'center', marginBottom: 16 },
  modalTitle: { color: '#FFF', fontSize: 20, fontWeight: '900', marginTop: 10, letterSpacing: 2 },
  modalDesc: { color: COLORS.textSecondary, textAlign: 'center', marginBottom: 10 },
  
  inputRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  modalInput: { backgroundColor: '#222', color: '#FFF', fontSize: 32, fontWeight: 'bold', width: 100, textAlign: 'center', padding: 10, borderRadius: 8, borderWidth: 1, borderColor: COLORS.accent },
  kmText: { color: COLORS.accent, fontSize: 24, fontWeight: 'bold', marginLeft: 12 },
  
  // New Estimate Styles
  estimateContainer: { flexDirection: 'row', justifyContent: 'center', marginBottom: 30, backgroundColor: '#222', padding: 8, borderRadius: 6, alignSelf: 'center' },
  estimateLabel: { color: COLORS.textSecondary, fontSize: 12, marginRight: 8, fontWeight: 'bold' },
  estimateValue: { color: COLORS.success, fontSize: 12, fontWeight: 'bold' },

  modalButtons: { flexDirection: 'row', gap: 12 },
  modalBtn: { flex: 1, padding: 16, borderRadius: 8, alignItems: 'center' },
  cancelBtn: { backgroundColor: '#222' },
  confirmBtn: { backgroundColor: COLORS.accent },
  cancelText: { color: '#FFF', fontWeight: 'bold' },
  confirmText: { color: '#FFF', fontWeight: 'bold' },
  downloadingContainer: { alignItems: 'center', paddingVertical: 10 },
  downloadingText: { color: COLORS.accent, marginTop: 10, fontWeight: 'bold' }
});