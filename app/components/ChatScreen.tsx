import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { type Message, useRAG } from 'react-native-rag';
import { COLORS } from '../constants/colors';
import { useRAGContext } from '../context/RAGContext';
import { ChatInput } from './ChatInput';
import { MessagesList } from './MessagesList';

export function ChatScreen() {
  const { vectorStore, llm, isReady } = useRAGContext();
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
      const response = await rag.generate({
        input: newMessage.content,
        augmentedGeneration: true,
      });
      
      setMessages((prevMessages) => [
        ...prevMessages,
        { role: 'assistant', content: response },
      ]);
    } catch (error) {
      console.error('Error searching documents:', error);
      Alert.alert('Error', 'Failed to search documents. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <View style={styles.logoCircle}>
          <Ionicons name="shield" size={40} color={COLORS.accent} />
        </View>
        <Text style={styles.headerTitle}>SENTINEL</Text>
        <Text style={styles.headerSubtitle}>CRISIS RESPONSE SYSTEM</Text>
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
              Loading Models...
            </Text>
          </View>
        ) : (
          <View style={styles.emptyStateContainer}>
            <Text style={styles.emptyStateTitle}>Hello! 👋</Text>
            <Text style={styles.emptyStateSubtitle}>
              What can I help you with?
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
    </View>
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
