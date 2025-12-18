import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { type Message, useRAG } from 'react-native-rag';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChatInput } from './components/ChatInput';
import { MessagesList } from './components/MessagesList';
import { COLORS } from './constants/colors';
import { useRAGContext } from './context/RAGContext';

export default function ChatScreen() {
  const { t } = useTranslation();
  const { vectorStore, llm, isReady, progress } = useRAGContext();
  const [message, setMessage] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const rag = useRAG({ 
    vectorStore: vectorStore!, 
    llm: llm!,
  });
  
  const handleMessageSubmit = async () => {
    if (!isReady) {
      console.warn('RAG not ready');
      return;
    }
    if (!message.trim()) {
      console.warn('Message is empty');
      return;
    }

    const newMessage: Message = {
      role: 'user',
      content: message,
    };

    setMessages((prevMessages) => [...prevMessages, newMessage]);
    setMessage('');
    setIsSearching(true);

    try {
      const systemPrompt = t('chat.systemPrompt');
      const response = await rag.generate({
        input: `${systemPrompt}\n\nQuestion: ${newMessage.content}`,
        augmentedGeneration: true,
      });
      
      setMessages((prevMessages) => [
        ...prevMessages,
        { role: 'assistant', content: response },
      ]);
    } catch (error) {
      console.error('Error searching documents:', error);
      Alert.alert(t('chat.alerts.errorTitle'), t('chat.alerts.searchFailed'));
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <View style={styles.logoCircle}>
          <Ionicons name="shield" size={40} color={COLORS.accent} />
        </View>
        <Text style={styles.headerTitle}>SENTINEL</Text>
        <Text style={styles.headerSubtitle}>{t('chat.headerSubtitle')}</Text>
      </View>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {messages.length > 0 ? (
          <MessagesList
            messages={messages}
            response={rag.response}
            isGenerating={rag.isGenerating || isSearching}
          />
        ) : !isReady ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>
              {t('chat.loading.title')}
            </Text>
            <Text style={styles.progressText}>
              {t('chat.loading.llmProgress', { percent: (progress.llm * 100).toFixed(2) })}
            </Text>
            <Text style={styles.progressText}>
              {t('chat.loading.embeddingsProgress', { percent: (progress.embeddings * 100).toFixed(2) })}
            </Text>
            <Text style={styles.statusText}>
              {progress.llmDownload < 1
                ? t('chat.loading.downloadingLlm')
                : t('chat.loading.initializing')}
            </Text>
          </View>
        ) : (
          <View style={styles.emptyStateContainer}>
            <Text style={styles.emptyStateTitle}>{t('chat.empty.title')}</Text>
            <Text style={styles.emptyStateSubtitle}>
              {t('chat.empty.subtitle')}
            </Text>
          </View>
        )}
      <ChatInput
        message={message}
        onMessageChange={setMessage}
        onMessageSubmit={handleMessageSubmit}
        isGenerating={rag.isGenerating || isSearching}
        isReady={isReady}
      />
    </KeyboardAvoidingView>
  </SafeAreaView>

  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  headerContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    marginBottom: 10,
  },
  logoCircle: {
    width: 64,
    height: 64,
    borderRadius: 12,
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.accent,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: COLORS.textPrimary,
    letterSpacing: 4,
  },
  headerSubtitle: {
    fontSize: 10,
    color: COLORS.textSecondary,
    marginTop: 4,
    letterSpacing: 2,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  keyboardAvoidingView: {
    flex: 1,
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
  statusText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 8,
    fontStyle: 'italic',
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  emptyStateTitle: {
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 8,
    color: COLORS.textPrimary,
  },
  emptyStateSubtitle: {
    fontSize: 20,
    textAlign: 'center',
    color: COLORS.textSecondary,
  },
});
