import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import { type Message } from 'react-native-rag';
import { COLORS } from '../constants/colors';

interface MessagesListProps {
  messages: Message[];
  response: string;
  isGenerating: boolean;
}

export function MessagesList({
  messages,
  response,
  isGenerating,
}: MessagesListProps) {
  const renderMessage = ({ item }: { item: Message }) => (
    <View
      style={[
        messageStyles.messageContainer,
        item.role === 'user'
          ? messageStyles.userMessage
          : messageStyles.assistantMessage,
      ]}
    >
      <Text
        style={[
          messageStyles.messageText,
          item.role === 'user'
            ? messageStyles.userMessageText
            : messageStyles.assistantMessageText,
        ]}
      >
        {item.content}
      </Text>
    </View>
  );

  return (
    <FlatList
      data={messages}
      renderItem={renderMessage}
      keyExtractor={(item, index) => index.toString()}
      contentContainerStyle={messageStyles.listContainer}
      ListFooterComponent={
        isGenerating ? (
          <View style={[messageStyles.messageContainer, messageStyles.assistantMessage]}>
            {response ? (
              <Text style={messageStyles.assistantMessageText}>{response}</Text>
            ) : (
              <View style={messageStyles.thinkingContainer}>
                <ActivityIndicator size="small" color={COLORS.accent} />
                <Text style={messageStyles.thinkingText}>Thinking...</Text>
              </View>
            )}
          </View>
        ) : null
      }
    />
  );
}

const messageStyles = StyleSheet.create({
  listContainer: {
    padding: 16,
    flexGrow: 1,
  },
  messageContainer: {
    marginBottom: 12,
    padding: 12,
    borderRadius: 16,
    maxWidth: '80%',
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: COLORS.outgoingMessage,
  },
  assistantMessage: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.incomingMessage,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  messageText: {
    fontSize: 16,
  },
  userMessageText: {
    color: '#FFFFFF',
  },
  assistantMessageText: {
    color: COLORS.textPrimary,
  },
  thinkingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  thinkingText: {
    color: COLORS.textSecondary,
    fontStyle: 'italic',
    fontSize: 14,
  },
});
