import { Ionicons } from '@expo/vector-icons';
import { 
  getAuth, 
  onAuthStateChanged, 
  fetchSignInMethodsForEmail, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword 
} from '@react-native-firebase/auth';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  serverTimestamp 
} from '@react-native-firebase/firestore';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../constants/theme';

export default function LoginScreen() {
  const router = useRouter();
  
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  
  const [showPaywall, setShowPaywall] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);

  
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const auth = getAuth();
    const subscriber = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (initializing) setInitializing(false);
    });
    return subscriber; 
  }, []);

  useEffect(() => {
    if (user) router.replace('/dashboard');
  }, [user]);

  
  const handlePreRegister = async () => {
    if (!email || !password) {
      Alert.alert('Missing Info', 'Please enter both email and password.');
      return;
    }

    setLoading(true);
    try {
      
      const auth = getAuth();
      const methods = await fetchSignInMethodsForEmail(auth, email);
      
      if (methods && methods.length > 0) {
        Alert.alert('Account Exists', 'This email is already registered. Please log in.');
        setLoading(false);
        return;
      }

      setLoading(false);
      setShowPaywall(true);

    } catch (error: any) {
      setLoading(false);
      if (error.code === 'auth/invalid-email') {
        Alert.alert('Invalid Email', 'Please enter a valid email address.');
      } else {
        setShowPaywall(true); 
      }
    }
  };

  const handleFinalizePurchaseAndRegister = async () => {
    setProcessingPayment(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500)); 

      const auth = getAuth();
      const authResponse = await createUserWithEmailAndPassword(auth, email, password);
      
      const db = getFirestore();
      await setDoc(doc(db, 'users', authResponse.user.uid), {
        email: email,
        createdAt: serverTimestamp(),
        isLifetimePremium: true, 
        lastLogin: serverTimestamp(),
        paymentId: `sim_${Date.now()}` 
      });

    } catch (error: any) {
      setProcessingPayment(false);
      let msg = error.message;
      if (error.code === 'auth/email-already-in-use') msg = "This email was taken while you were paying.";
      Alert.alert('Registration Failed', msg);
    }
  };

  const handleLogin = async () => { 
    if (!email || !password) return;
    setLoading(true);
    try {
      const auth = getAuth();
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      Alert.alert('Login Failed', "Incorrect email or password.");
    } finally {
      setLoading(false);
    }
  };

  if (initializing) return (
    <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
      <ActivityIndicator size="large" color={COLORS.accent} />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{flex:1, justifyContent:'center'}}>
        
        {/* LOGIN FORM */}
        <View style={styles.loginHeader}>
          <View style={styles.logoCircle}>
            <Ionicons name="shield-checkmark" size={32} color={COLORS.accent} />
          </View>
          <Text style={styles.appTitle}>SENTINEL</Text>
          <Text style={styles.appSubtitle}>LIFETIME ACCESS ACCOUNT</Text>
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Email Address"
            placeholderTextColor={COLORS.textSecondary}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor={COLORS.textSecondary}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <View style={styles.buttonRow}>
            {/* REGISTER BUTTON (Triggers Pre-Check) */}
            <TouchableOpacity 
              style={[styles.button, styles.registerButton]} 
              onPress={handlePreRegister} 
              disabled={loading}
            >
              {loading ? <ActivityIndicator color="#000" /> : <Text style={styles.registerText}>CREATE ACCOUNT</Text>}
            </TouchableOpacity>

            {/* LOGIN BUTTON */}
            <TouchableOpacity 
              style={[styles.button, styles.loginButton]} 
              onPress={handleLogin} 
              disabled={loading}
            >
              <Text style={styles.loginText}>LOGIN</Text>
            </TouchableOpacity>
          </View>
        </View>

      </KeyboardAvoidingView>

      {/* --- PAYWALL MODAL --- */}
      <Modal
        animationType="slide"
        visible={showPaywall}
        presentationStyle="pageSheet"
        onRequestClose={() => setShowPaywall(false)}
      >
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowPaywall(false)} style={styles.closeButton}>
              <Ionicons name="close" size={28} color="#FFF" />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.modalContent}>
            <Ionicons name="diamond-outline" size={60} color={COLORS.accent} style={{marginBottom: 20}} />
            
            <Text style={styles.modalTitle}>UNLOCK SENTINEL</Text>
            <Text style={styles.modalSubtitle}>ONE-TIME PAYMENT • LIFETIME ACCESS</Text>

            <View style={styles.priceTag}>
              <Text style={styles.priceText}>$19.99</Text>
              <Text style={styles.lifetimeText}> / Lifetime</Text>
            </View>

            {/* Features List */}
            <View style={styles.featuresContainer}>
              {[
                { icon: "cloud-download", title: "Unlimited Offline Maps", desc: "Download massive regions (100km+) & global data." },
                { icon: "warning", title: "Live Hazard Alerts", desc: "Real-time sync of active disaster zones." },
                { icon: "chatbubbles", title: "Sentinel AI Assistant", desc: "Unlimited queries for survival strategies." },
                { icon: "shield-checkmark", title: "Cloud Backup", desc: "Securely sync your safe zones across devices." },
              ].map((item, index) => (
                <View key={index} style={styles.featureItem}>
                  <View style={styles.featureIcon}>
                    <Ionicons name={item.icon as any} size={24} color={COLORS.accent} />
                  </View>
                  <View style={styles.featureTextContainer}>
                    <Text style={styles.featureTitle}>{item.title}</Text>
                    <Text style={styles.featureDesc}>{item.desc}</Text>
                  </View>
                </View>
              ))}
            </View>
          </ScrollView>

          {/* Footer / Pay Button */}
          <View style={styles.modalFooter}>
            <Text style={styles.guaranteeText}>
              <Ionicons name="lock-closed" size={12} color={COLORS.textSecondary} /> Secure SSL Payment
            </Text>
            <TouchableOpacity 
              style={styles.payButton} 
              onPress={handleFinalizePurchaseAndRegister}
              disabled={processingPayment}
            >
              {processingPayment ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.payButtonText}>PAY $19.99 & CREATE ACCOUNT</Text>
              )}
            </TouchableOpacity>
          </View>

        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, paddingHorizontal: 24 },
  
  loginHeader: { alignItems: 'center', marginBottom: 50 },
  logoCircle: { width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(82, 99, 121, 0.15)', alignItems: 'center', justifyContent: 'center', marginBottom: 16, borderWidth: 1, borderColor: COLORS.accent },
  appTitle: { fontSize: 28, fontWeight: '900', color: COLORS.textPrimary, letterSpacing: 3 },
  appSubtitle: { fontSize: 10, color: COLORS.accent, marginTop: 5, letterSpacing: 1.5, fontWeight: 'bold' },
  inputContainer: { width: '100%' },
  input: { backgroundColor: '#1A1A1A', color: '#FFF', padding: 16, borderRadius: 8, marginBottom: 12, fontSize: 15, borderWidth: 1, borderColor: '#333' },
  buttonRow: { flexDirection: 'column', gap: 10, marginTop: 10 },
  button: { paddingVertical: 16, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  loginButton: { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#444' },
  loginText: { color: '#CCC', fontSize: 14, fontWeight: 'bold', letterSpacing: 1 },
  registerButton: { backgroundColor: COLORS.accent, borderWidth: 1, borderColor: COLORS.accent },
  registerText: { color: '#FFF', fontSize: 14, fontWeight: 'bold', letterSpacing: 1 },

  modalContainer: { flex: 1, backgroundColor: '#000' },
  modalHeader: { padding: 16, alignItems: 'flex-end' },
  closeButton: { padding: 8, backgroundColor: '#222', borderRadius: 20 },
  modalContent: { paddingHorizontal: 24, paddingBottom: 100, alignItems: 'center' },
  modalTitle: { fontSize: 24, fontWeight: '900', color: '#FFF', letterSpacing: 2, marginBottom: 4 },
  modalSubtitle: { fontSize: 12, color: COLORS.textSecondary, letterSpacing: 1, fontWeight: 'bold' },
  
  priceTag: { flexDirection: 'row', alignItems: 'baseline', marginVertical: 30 },
  priceText: { fontSize: 42, fontWeight: 'bold', color: COLORS.accent },
  lifetimeText: { fontSize: 18, color: '#FFF', fontWeight: 'bold' },

  featuresContainer: { width: '100%', gap: 16 },
  featureItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#111', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#222' },
  featureIcon: { width: 40, alignItems: 'center' },
  featureTextContainer: { flex: 1 },
  featureTitle: { color: '#FFF', fontSize: 15, fontWeight: 'bold', marginBottom: 2 },
  featureDesc: { color: '#888', fontSize: 12 },

  modalFooter: { position: 'absolute', bottom: 0, width: '100%', padding: 24, backgroundColor: 'rgba(0,0,0,0.95)', borderTopWidth: 1, borderTopColor: '#222' },
  guaranteeText: { color: COLORS.textSecondary, fontSize: 10, textAlign: 'center', marginBottom: 12 },
  payButton: { backgroundColor: COLORS.success, paddingVertical: 18, borderRadius: 10, alignItems: 'center', shadowColor: COLORS.success, shadowOpacity: 0.3, shadowRadius: 10 },
  payButtonText: { color: '#FFF', fontSize: 16, fontWeight: '900', letterSpacing: 1 },
});