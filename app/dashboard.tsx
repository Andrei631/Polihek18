import { Ionicons } from '@expo/vector-icons';
import { OfflineManager } from "@maplibre/maplibre-react-native";
import { useNetInfo } from '@react-native-community/netinfo';
import { getAuth, onAuthStateChanged, signOut } from '@react-native-firebase/auth';
import { doc, getDoc, getFirestore, serverTimestamp, updateDoc } from '@react-native-firebase/firestore';
import * as Location from "expo-location";
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  NativeScrollEvent,
  NativeSyntheticEvent,
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
import { normalizeLanguage, persistLanguage, type SupportedLanguage } from './i18n/language';
import { getLocalConsent, saveConsentLocally } from './utils/storage';

export default function Dashboard() {
  const router = useRouter();
  const { t, i18n } = useTranslation();
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
  const [languageVisible, setLanguageVisible] = useState(false);

  const LANGUAGE_ITEM_HEIGHT = 44;
  const LANGUAGE_PICKER_HEIGHT = 220;
  const languageListRef = React.useRef<FlatList<{ code: SupportedLanguage; label: string }>>(null);

  const availableLanguages: Array<{ code: SupportedLanguage; label: string }> = [
    { code: 'en', label: t('language.english') },
    { code: 'ro', label: t('language.romanian') },
    { code: 'de', label: t('language.german') },
    { code: 'es', label: t('language.spanish') },
    { code: 'fr', label: t('language.french') },
    { code: 'it', label: t('language.italian') },
    { code: 'pt', label: t('language.portuguese') },
  ];

  const selectedLanguage: SupportedLanguage = normalizeLanguage(i18n.language);

  const applyLanguage = async (language: SupportedLanguage) => {
    await persistLanguage(language);
    await i18n.changeLanguage(language);
  };

  const changeLanguage = (language: SupportedLanguage, closeAfter = true) => {
    void (async () => {
      await applyLanguage(language);
      if (closeAfter) setLanguageVisible(false);
    })();
  };

  const onLanguageScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const y = e.nativeEvent.contentOffset.y;
    const index = Math.round(y / LANGUAGE_ITEM_HEIGHT);
    const next = availableLanguages[index];
    if (!next) return;
    if (next.code === selectedLanguage) return;
    void applyLanguage(next.code);
  };

  useEffect(() => {
    if (!languageVisible) return;
    const index = Math.max(0, availableLanguages.findIndex((l) => l.code === selectedLanguage));

    const id = requestAnimationFrame(() => {
      languageListRef.current?.scrollToOffset({
        offset: index * LANGUAGE_ITEM_HEIGHT,
        animated: false,
      });
    });

    return () => cancelAnimationFrame(id);
  }, [availableLanguages, languageVisible, selectedLanguage]);

  
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
    } catch {
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
             setDownloadedRadius(t('common.cached'));
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
            params: { isPremium: "true", downloadedRadius: downloadedRadius || t('common.cached') }
        });
        return;
    }
    setRadiusInput('20');
    setModalVisible(true);
  };

  const promptDeleteAndRedownload = () => {
      Alert.alert(
        t('dashboard.alerts.updateOfflineMapTitle'),
        t('dashboard.alerts.updateOfflineMapMessage'),
          [
          { text: t('common.cancel'), style: "cancel" },
          { text: t('common.update'), style: "destructive", onPress: async () => {
                  setDownloadedRadius(null);
                  setExistingPack(null);
                  try {
                    const packs = await OfflineManager.getPacks();
                    for (const pack of packs) {

                        if (pack.name?.includes('offlinePack')) {
                            await OfflineManager.deletePack(pack.name);
                        }
                    }
                      Alert.alert(t('dashboard.alerts.cacheClearedTitle'), t('dashboard.alerts.cacheClearedMessage'));
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
      Alert.alert(t('dashboard.alerts.minRadiusTitle'), t('dashboard.alerts.minRadiusMessage'));
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
          Alert.alert(t('dashboard.alerts.permissionDeniedTitle'), t('dashboard.alerts.permissionDeniedMessage'));
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
      Alert.alert(t('dashboard.alerts.downloadFailedTitle'), t('dashboard.alerts.downloadFailedMessage'));
        setIsDownloading(false);
    }
  };

  const getMapSubtitle = () => {
    if (isDownloading) return t('dashboard.mapSubtitle.caching', { km: radiusInput });
    if (existingPack || downloadedRadius) return t('dashboard.mapSubtitle.offlineReady', { radius: downloadedRadius || '20km' });
    return t('dashboard.mapSubtitle.tapToConfigure');
  };

  return (
    <SafeAreaView style={styles.container}>
      {isModelDownloading && (
        <View style={styles.modelDownloadContainer}>
          <Text style={styles.modelDownloadText}>
            {t('dashboard.modelDownload', { percent: Math.round(((modelProgress.llm + modelProgress.embeddings) / 2) * 100) })}
          </Text>
          <View style={styles.progressBarBackground}>
            <View style={[styles.progressBarFill, { width: `${((modelProgress.llm + modelProgress.embeddings) / 2) * 100}%` }]} />
          </View>
        </View>
      )}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>{t('dashboard.title')}</Text>
          <Text style={[styles.headerSubtitle, { color: isConnected ? COLORS.success : COLORS.danger }]}>
            {isConnected ? t('dashboard.networkOnline') : t('dashboard.networkOffline')}
          </Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <TouchableOpacity onPress={() => setLanguageVisible(true)} accessibilityLabel={t('language.title')}>
            <Ionicons name="language-outline" size={24} color={COLORS.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setCreditsVisible(true)} accessibilityLabel={t('credits.title')}>
              <Ionicons name="information-circle-outline" size={24} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.menuContainer}>
        <SentinelCard
          title={t('dashboard.cards.manualsTitle')}
          subtitle={t('dashboard.cards.manualsSubtitle')}
          icon="documents-outline"
          onPress={() => router.push('/SurvivalManuals')}
        />
        
        <SentinelCard
          title={t('dashboard.cards.mapTitle')}
          subtitle={getMapSubtitle()}
          icon={isDownloading ? "cloud-download-outline" : "map-outline"}
          isPremium={true}
          onPress={navigateToMap}
          onLongPress={promptDeleteAndRedownload}
        />

        <SentinelCard
          title={t('dashboard.cards.aiTitle')}
          subtitle={t('dashboard.cards.aiSubtitle')}
          icon="hardware-chip-outline"
          isLocked={false}
          isPremium={true}
          onPress={() => router.push('/ChatScreen')}
        />

        <SentinelCard
          title={t('dashboard.cards.vaultTitle')}
          subtitle={t('dashboard.cards.vaultSubtitle')}
          icon="lock-closed-outline" 
          isLocked={false}
          isPremium={true} 
          onPress={() => router.push('/secretvault')} 
        />
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={() => { signOut(getAuth()); router.replace('/'); }}>
        <Text style={styles.logoutText}>{t('dashboard.logout')}</Text>
      </TouchableOpacity>

      <CreditsModal visible={creditsVisible} onClose={() => setCreditsVisible(false)} />

      <Modal
        animationType="fade"
        transparent={true}
        visible={languageVisible}
        onRequestClose={() => setLanguageVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.languageModalContent}>
            <View style={styles.languageModalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Ionicons name="language-outline" size={22} color={COLORS.accent} />
                <Text style={styles.languageModalTitle}>{t('language.title')}</Text>
              </View>
              <TouchableOpacity onPress={() => setLanguageVisible(false)} accessibilityLabel={t('common.close')}>
                <Ionicons name="close" size={22} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={[styles.languagePickerContainer, { height: LANGUAGE_PICKER_HEIGHT }]}>
              <View pointerEvents="none" style={[styles.languagePickerHighlight, { height: LANGUAGE_ITEM_HEIGHT }]} />

              <FlatList
                ref={languageListRef}
                data={availableLanguages}
                keyExtractor={(item) => item.code}
                showsVerticalScrollIndicator={false}
                bounces={false}
                snapToInterval={LANGUAGE_ITEM_HEIGHT}
                decelerationRate="fast"
                onMomentumScrollEnd={onLanguageScrollEnd}
                onScrollEndDrag={onLanguageScrollEnd}
                getItemLayout={(_, index) => ({
                  length: LANGUAGE_ITEM_HEIGHT,
                  offset: LANGUAGE_ITEM_HEIGHT * index,
                  index,
                })}
                contentContainerStyle={{
                  paddingVertical: (LANGUAGE_PICKER_HEIGHT - LANGUAGE_ITEM_HEIGHT) / 2,
                }}
                renderItem={({ item }) => {
                  const isActive = item.code === selectedLanguage;
                  return (
                    <TouchableOpacity
                      style={[styles.languagePickerItem, { height: LANGUAGE_ITEM_HEIGHT }]}
                      onPress={() => changeLanguage(item.code)}
                      accessibilityRole="button"
                      accessibilityState={{ selected: isActive }}
                    >
                      <Text style={[styles.languagePickerText, isActive && styles.languagePickerTextActive]}>
                        {item.label}
                      </Text>
                      {isActive && (
                        <Ionicons name="checkmark" size={16} color="#000" style={{ marginLeft: 8 }} />
                      )}
                    </TouchableOpacity>
                  );
                }}
              />
            </View>
          </View>
        </View>
      </Modal>
      
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
              <Text style={styles.modalTitle}>{t('dashboard.offlineCache.title')}</Text>
            </View>
            
            <Text style={styles.modalDesc}>
              {t('dashboard.offlineCache.desc')}
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
              <Text style={styles.kmText}>{t('dashboard.offlineCache.unitKm')}</Text>
            </View>

            <View style={styles.estimateContainer}>
              <Text style={styles.estimateLabel}>{t('dashboard.offlineCache.estimatedStorage')}</Text>
                <Text style={styles.estimateValue}>{estimatedSize}</Text>
            </View>

            {isDownloading ? (
              <View style={styles.downloadingContainer}>
                <ActivityIndicator size="large" color={COLORS.accent} />
                <Text style={styles.downloadingText}>{t('dashboard.offlineCache.downloading')}</Text>
              </View>
            ) : (
              <View style={styles.modalButtons}>
                <TouchableOpacity 
                  style={[styles.modalBtn, styles.cancelBtn]}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.cancelText}>{t('dashboard.offlineCache.cancel')}</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.modalBtn, styles.confirmBtn]}
                  onPress={handleInitiateDownload}
                >
                  <Text style={styles.confirmText}>{t('dashboard.offlineCache.download')}</Text>
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

  languageModalContent: {
    backgroundColor: '#181818',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    borderColor: '#333',
  },
  languageModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  languageModalTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1,
  },
  languagePickerContainer: {
    position: 'relative',
    backgroundColor: '#222',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#333',
    overflow: 'hidden',
  },
  languagePickerHighlight: {
    position: 'absolute',
    left: 12,
    right: 12,
    top: '50%',
    marginTop: -22,
    backgroundColor: COLORS.accent,
    borderRadius: 12,
  },
  languagePickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  languagePickerText: {
    color: COLORS.textSecondary,
    fontWeight: '800',
    fontSize: 14,
    letterSpacing: 0.5,
  },
  languagePickerTextActive: {
    color: '#000',
  },

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