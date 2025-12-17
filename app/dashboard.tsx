import { Ionicons } from '@expo/vector-icons';
import { OfflineManager } from "@maplibre/maplibre-react-native";
import { useNetInfo } from '@react-native-community/netinfo';
import { getAuth, onAuthStateChanged, signOut } from '@react-native-firebase/auth';
import { doc, getDoc, getFirestore, serverTimestamp, updateDoc } from '@react-native-firebase/firestore';
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
import { ConsentModal } from './components/ConsentModal';
import { CreditsModal } from './components/CreditsModal';
import { useRAGContext } from './context/RAGContext';
import { getLocalConsent, saveConsentLocally } from './utils/storage';

export default function Dashboard() {
  const router = useRouter();
  const { isConnected } = useNetInfo();
  const { isDownloading: isModelDownloading, progress: modelProgress } = useRAGContext();
  
  const isPremium = true; 

  const [downloadedRadius, setDownloadedRadius] = useState<string | null>(null);
  const [existingPack, setExistingPack] = useState<any>(null);
  
  
  const [modalVisible, setModalVisible] = useState(false);
  const [radiusInput, setRadiusInput] = useState('20'); 
  const [estimatedSize, setEstimatedSize] = useState('~40 MB'); 
  const [isDownloading, setIsDownloading] = useState(false);
  const [creditsVisible, setCreditsVisible] = useState(false);
  const [consentVisible, setConsentVisible] = useState(false);

  
  useEffect(() => {
    checkExistingDownloads();

    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      if (u) checkConsent(u.uid);
    });

    return unsubscribe;
  }, []);

  const checkConsent = async (uid: string) => {
    // 1) Check local storage first (offline-first)
    const localConsent = await getLocalConsent(uid);
    if (localConsent) return;

    // 2) Try to sync from Firestore (may fail offline)
    const db = getFirestore();
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));

      if (userDoc.exists()) {
        const userData = userDoc.data();
        if (userData?.hasConsented) {
          await saveConsentLocally(uid, true);
          return;
        }
      }

      // No Firestore consent found and no local consent -> show modal
      setConsentVisible(true);
    } catch (e) {
      console.log('Error checking consent', e);
      // Offline / fetch failure and no local consent -> show modal
      setConsentVisible(true);
    }
  };

  const handleAcceptConsent = async () => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) return;

    // 1. Save locally immediately (per-user)
    await saveConsentLocally(user.uid, true);
    setConsentVisible(false);

    // 2. Try to sync with Firestore (will queue if offline)
    try {
      const db = getFirestore();
      await updateDoc(doc(db, 'users', user.uid), {
        hasConsented: true,
        consentDate: serverTimestamp()
      });
    } catch (error) {
      console.log("Firestore update failed (likely offline), but local consent saved.");
    }
  };

  const handleDeclineConsent = async () => {
    const auth = getAuth();
    await signOut(auth);
    router.replace('/');
  };

  
  useEffect(() => {
    const r = parseInt(radiusInput);
    if (!isNaN(r) && r > 0) {

        const sizeMB = Math.round((r * r) * 0.1); 

        const totalSize = sizeMB + 10; 
        setEstimatedSize(`~${totalSize} MB`);
    } else {
        setEstimatedSize('Unknown');
    }
  }, [radiusInput]);

  const checkExistingDownloads = async () => {
    try {
      const packs = await OfflineManager.getPacks();

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

  const handleInitiateDownload = async () => {
    const km = parseInt(radiusInput);


    if (isNaN(km) || km < 20) {
        Alert.alert("Minimum Radius Required", "Please enter at least 20km to ensure safe coverage.");
        return;
    }

    setIsDownloading(true);

    try {
        OfflineManager.setTileCountLimit(1000000); 


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


        const MAP_STYLE = `https://api.maptiler.com/maps/streets/style.json?key=i2gNH16bxfhHTv62Ijhp`;


        await OfflineManager.createPack({
            name: `offlinePack_Global`,
            styleURL: MAP_STYLE,
            bounds: [[-180, -85], [180, 85]], 
            minZoom: 0,
            maxZoom: 4, 
            metadata: { type: 'global_overview' }
        }, (p) => {}, (e) => console.log(e));


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
      {isModelDownloading && (
        <View style={styles.modelDownloadContainer}>
          <Text style={styles.modelDownloadText}>Downloading AI Models... {Math.round(((modelProgress.llm + modelProgress.embeddings) / 2) * 100)}%</Text>
          <View style={styles.progressBarBackground}>
            <View style={[styles.progressBarFill, { width: `${((modelProgress.llm + modelProgress.embeddings) / 2) * 100}%` }]} />
          </View>
        </View>
      )}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>DASHBOARD</Text>
          <Text style={[styles.headerSubtitle, { color: isConnected ? COLORS.success : COLORS.danger }]}>
            {isConnected ? "● NETWORK: ONLINE" : "○ NETWORK: OFFLINE"}
          </Text>
        </View>
        <TouchableOpacity onPress={() => setCreditsVisible(true)}>
            <Ionicons name="information-circle-outline" size={24} color={COLORS.textSecondary} />
        </TouchableOpacity>
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

        <SentinelCard
          title="Secret Vault"
          subtitle="Encrypted documents. Stored locally on-device."
          icon="lock-closed-outline" 
          isLocked={false}
          isPremium={true} 
          onPress={() => router.push('/secretvault')} 
        />
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={() => { signOut(getAuth()); router.replace('/'); }}>
        <Text style={styles.logoutText}>DISCONNECT</Text>
      </TouchableOpacity>

      <CreditsModal visible={creditsVisible} onClose={() => setCreditsVisible(false)} />
      
      <ConsentModal 
        visible={consentVisible} 
        onAccept={handleAcceptConsent} 
        onDecline={handleDeclineConsent} 
      />

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

  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.8)' },
  modalContent: { backgroundColor: '#181818', padding: 24, borderTopLeftRadius: 20, borderTopRightRadius: 20, borderWidth: 1, borderColor: '#333' },
  modalHeader: { alignItems: 'center', marginBottom: 16 },
  modalTitle: { color: '#FFF', fontSize: 20, fontWeight: '900', marginTop: 10, letterSpacing: 2 },
  modalDesc: { color: COLORS.textSecondary, textAlign: 'center', marginBottom: 10 },
  
  inputRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  modalInput: { backgroundColor: '#222', color: '#FFF', fontSize: 32, fontWeight: 'bold', width: 100, textAlign: 'center', padding: 10, borderRadius: 8, borderWidth: 1, borderColor: COLORS.accent },
  kmText: { color: COLORS.accent, fontSize: 24, fontWeight: 'bold', marginLeft: 12 },
  

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
  modelDownloadContainer: {
    paddingHorizontal: 0,
    paddingBottom: 10,
    marginBottom: 10,
  },
  modelDownloadText: {
    color: COLORS.success,
    fontSize: 12,
    marginBottom: 4,
    fontWeight: 'bold',
  },
  progressBarBackground: {
    height: 4,
    backgroundColor: COLORS.card,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: COLORS.success,
  },
  downloadingText: { color: COLORS.accent, marginTop: 10, fontWeight: 'bold' }
});