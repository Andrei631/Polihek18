import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { SurvivalManuals } from './components/SurvivalManuals';
import { COLORS } from './constants/colors';
import { useRAGContext } from './context/RAGContext';

export default function Index() {
  const { isReady, progress } = useRAGContext();

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      <SafeAreaView style={styles.safeArea}>
        {!isReady ? (
             <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Initializing Sentinel System...</Text>
              <Text style={styles.progressText}>
                Embeddings: {(progress.embeddings * 100).toFixed(1)}%
              </Text>
              <Text style={styles.progressText}>
                LLM: {(progress.llmDownload * 100).toFixed(1)}%
              </Text>
            </View>
        ) : (
            <>
              <SurvivalManuals />
              <Link href="/chat" asChild>
                <TouchableOpacity style={styles.fab}>
                  <Ionicons name="chatbubble-ellipses-outline" size={24} color="white" />
                </TouchableOpacity>
              </Link>
            </>
        )}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    color: COLORS.textPrimary,
  },
  progressText: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.accent,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});
