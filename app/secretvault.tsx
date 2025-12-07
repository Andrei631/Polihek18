import React, { useState, useEffect } from 'react';
import 'react-native-get-random-values';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Alert, 
  ActivityIndicator, 
  StatusBar,
  Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { File, Directory, Paths } from 'expo-file-system';
import * as DocumentPicker from 'expo-document-picker';
import * as Sharing from 'expo-sharing';
import CryptoJS from 'crypto-js';
import * as Random from 'expo-crypto';
import Pdf from 'react-native-pdf';

// Override CryptoJS random number generator to use expo-crypto
// This fixes "crypto module could not be used to get secure random number"
CryptoJS.lib.WordArray.random = (nBytes) => {
  const randomBytes = Random.getRandomBytes(nBytes);
  const words = [];
  for (let i = 0; i < nBytes; i += 4) {
    words.push(
      (randomBytes[i] << 24) |
      (randomBytes[i + 1] << 16) |
      (randomBytes[i + 2] << 8) |
      randomBytes[i + 3]
    );
  }
  return CryptoJS.lib.WordArray.create(words, nBytes);
};

import { COLORS } from './constants/colors';

// --- CONFIGURATION ---
const VAULT_DIR = new Directory(Paths.document, 'sentinel_vault');
// In a real app, fetch this from SecureStore or generate uniquely per user
const ENCRYPTION_KEY = 'my-secret-sentinel-key-123'; 

// --- TYPES ---
interface VaultDoc {
  id: string;
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  status: 'missing' | 'secured';
  fileName: string | null; // The encrypted filename on disk
  mimeType: string | null;
}

// --- INITIAL DATA ---
const REQUIRED_DOCS: VaultDoc[] = [
  { id: '1', title: 'Personal ID', subtitle: 'Passport, Driver License, ID Card', icon: 'id-card-outline', status: 'missing', fileName: null, mimeType: null },
  { id: '2', title: 'Medical Records', subtitle: 'Prescriptions, Blood Type, History', icon: 'medkit-outline', status: 'missing', fileName: null, mimeType: null },
  { id: '3', title: 'Insurance Policies', subtitle: 'Home, Auto, Life, Health', icon: 'shield-checkmark-outline', status: 'missing', fileName: null, mimeType: null },
  { id: '4', title: 'Property Documents', subtitle: 'Deeds, Leases, Titles', icon: 'home-outline', status: 'missing', fileName: null, mimeType: null },
  { id: '5', title: 'Financial Records', subtitle: 'Bank Accounts, Credit Cards', icon: 'card-outline', status: 'missing', fileName: null, mimeType: null },
  { id: '6', title: 'Legal Documents', subtitle: 'Wills, Power of Attorney', icon: 'document-text-outline', status: 'missing', fileName: null, mimeType: null },
];

export default function SecretVaultScreen() {
  const router = useRouter();
  const [docs, setDocs] = useState<VaultDoc[]>(REQUIRED_DOCS);
  const [loading, setLoading] = useState(false);
  const [pdfViewerVisible, setPdfViewerVisible] = useState(false);
  const [pdfSource, setPdfSource] = useState<string | null>(null);

  // 1. Setup Vault Directory on Mount
  useEffect(() => {
    async function setupVault() {
      if (!VAULT_DIR.exists) {
        VAULT_DIR.create();
      }

      try {
        const files = VAULT_DIR.list();
        
        setDocs(currentDocs => {
          const newDocs = [...currentDocs];
          
          files.forEach((file: any) => {
             const fileName = file.name;
             if (fileName && fileName.endsWith('.enc')) {
                const parts = fileName.split('_');
                if (parts.length >= 2) {
                   const docId = parts[0];
                   const docIndex = newDocs.findIndex(d => d.id === docId);
                   
                   if (docIndex !== -1) {
                      newDocs[docIndex] = {
                         ...newDocs[docIndex],
                         status: 'secured',
                         fileName: fileName,
                         mimeType: 'application/pdf'
                      };
                   }
                }
             }
          });
          return newDocs;
        });
      } catch (e) {
        console.log("Error scanning vault:", e);
      }
    }
    setupVault();
  }, []);

  const encryptFile = async (uri: string) => {
    const file = new File(uri);
    const fileData = await file.base64();
    const encrypted = CryptoJS.AES.encrypt(fileData, ENCRYPTION_KEY).toString();
    return encrypted;
  };


  const decryptFile = async (encryptedData: string) => {
    const bytes = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY);
    const originalBase64 = bytes.toString(CryptoJS.enc.Utf8);
    return originalBase64;
  };


  const handleUpload = async (docId: string) => {
    try {
      setLoading(true);
      
      const result = await DocumentPicker.getDocumentAsync({
        copyToCacheDirectory: true,
        type: 'application/pdf', 
      });

      if (result.canceled) {
        setLoading(false);
        return;
      }

      const asset = result.assets[0];
      const encryptedData = await encryptFile(asset.uri);
      
      // Generate a unique filename for storage
      const storageName = `${docId}_${Date.now()}.enc`;
      const storageFile = new File(VAULT_DIR, storageName);

      // Write Encrypted file to disk
      storageFile.write(encryptedData);

      // Update State
      setDocs(currentDocs => currentDocs.map(doc => 
        doc.id === docId 
          ? { ...doc, status: 'secured', fileName: storageName, mimeType: asset.mimeType } 
          : doc
      ));

      Alert.alert("Secured", "Document encrypted and stored locally.");

    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to encrypt document.");
    } finally {
      setLoading(false);
    }
  };

  // 5. Handle View / Decrypt
  const handleView = async (doc: VaultDoc) => {
    if (!doc.fileName) return;

    try {
      setLoading(true);
      const storageFile = new File(VAULT_DIR, doc.fileName);
      
      // Read encrypted file
      const encryptedContent = await storageFile.text();
      
      // Decrypt
      const decryptedBase64 = await decryptFile(encryptedContent);

      // Create a temporary viewable file
      const tempFileName = 'temp_view_' + doc.fileName.replace('.enc', '.pdf');
      const tempFile = new File(Paths.cache, tempFileName);
      
      // Convert base64 to Uint8Array
      const words = CryptoJS.enc.Base64.parse(decryptedBase64);
      const binaryData = new Uint8Array(words.sigBytes);
      for (let i = 0; i < words.sigBytes; i++) {
        binaryData[i] = (words.words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
      }

      tempFile.write(binaryData);

      // Open modal
      setPdfSource(tempFile.uri);
      setPdfViewerVisible(true);

    } catch (error) {
      Alert.alert("Error", "Could not decrypt file.");
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    if (pdfSource) {
      try {
        await Sharing.shareAsync(pdfSource);
      } catch (error) {
        Alert.alert('Error', 'Could not share file');
      }
    }
  };

  const handleDelete = (docId: string) => {
    Alert.alert("Delete Document", "This will permanently remove the encrypted file.", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: async () => {
          const doc = docs.find(d => d.id === docId);
          if (doc?.fileName) {
            const file = new File(VAULT_DIR, doc.fileName);
            if (file.exists) {
              file.delete();
            }
            setDocs(currentDocs => currentDocs.map(d => 
              d.id === docId ? { ...d, status: 'missing', fileName: null, mimeType: null } : d
            ));
          }
      }}
    ]);
  };

  const renderItem = ({ item }: { item: VaultDoc }) => {
    const isSecured = item.status === 'secured';

    return (
      <View style={[styles.card, isSecured && styles.lockedCard]}>
        <View style={styles.iconContainer}>
          <Ionicons 
            name={isSecured ? 'lock-closed' : item.icon} 
            size={24} 
            color={isSecured ? COLORS.accent : COLORS.secondary} 
          />
        </View>

        <View style={styles.textContainer}>
          <Text style={[styles.title, isSecured && styles.lockedText]}>{item.title}</Text>
          <Text style={styles.subtitle}>{isSecured ? 'Encrypted & Stored' : item.subtitle}</Text>
        </View>

        <View style={styles.cardRight}>
          {isSecured ? (
            <View style={styles.actions}>
              <TouchableOpacity onPress={() => handleView(item)} style={styles.actionBtn}>
                <Ionicons name="eye-outline" size={20} color={COLORS.secondary} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.actionBtn}>
                <Ionicons name="trash-outline" size={20} color={COLORS.error} />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity 
              onPress={() => handleUpload(item.id)}
              style={styles.uploadBtn}
            >
              <Text style={styles.uploadBtnText}>Upload</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Secret Vault</Text>
        <View style={{ width: 24 }} /> 
      </View>
      {/* PDF VIEWER MODAL */}
      <Modal 
        visible={pdfViewerVisible} 
        animationType="slide"
        onRequestClose={() => setPdfViewerVisible(false)}
      >
        <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => setPdfViewerVisible(false)} style={styles.backButton}>
              <Ionicons name="close" size={24} color={COLORS.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Document Viewer</Text>
            <TouchableOpacity onPress={handleShare} style={styles.backButton}>
              <Ionicons name="share-outline" size={24} color={COLORS.textPrimary} />
            </TouchableOpacity>
          </View>
          {pdfSource && (
            <Pdf
              source={{uri: pdfSource}}
              style={{flex:1, backgroundColor: COLORS.background}}
              onError={(error) => {
                console.log(error);
                Alert.alert('Error', 'Could not load PDF');
              }}
            />
          )}
        </SafeAreaView>
      </Modal>

      {/* DOCUMENT LIST */}
      <FlatList 
        data={docs}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.infoBox}>
            <Ionicons name="shield-checkmark" size={20} color={COLORS.secondary} style={{marginRight: 8}}/>
            <Text style={styles.infoText}>
              Files are encrypted with AES-256 and stored only on this device.
            </Text>
          </View>
        }
      />

      {loading && (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={COLORS.accent} />
          <Text style={{color: COLORS.textPrimary, marginTop: 10}}>Processing Encryption...</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: COLORS.card,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  infoText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    flex: 1,
    lineHeight: 18,
  },
  listContent: {
    padding: 20,
    paddingTop: 0,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E1E1E', // Dark card background
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  lockedCard: {
    opacity: 0.6,
    backgroundColor: '#151515',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 4,
  },
  lockedText: {
    color: COLORS.textSecondary,
  },
  subtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 16,
  },
  cardRight: {
    marginLeft: 12,
  },
  uploadBtn: {
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  uploadBtnText: {
    color: '#000',
    fontSize: 12,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    padding: 8,
    backgroundColor: COLORS.inputBg,
    borderRadius: 8,
  },
  loader: {
    position: 'absolute',
    top: 0, 
    left: 0, 
    right: 0, 
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});