import { useTranslation } from 'react-i18next';
import {
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { COLORS } from '../constants/colors';

interface ChatInputProps {
  message: string;
  onMessageChange: (message: string) => void;
  onMessageSubmit: () => void;
  isGenerating: boolean;
  isReady: boolean;
}

export function ChatInput({
  message,
  onMessageChange,
  onMessageSubmit,
  isGenerating,
  isReady,
}: ChatInputProps) {
  const { t } = useTranslation();

  return (
    <View style={chatInputStyles.container}>
      <View style={chatInputStyles.inputRow}>
        <TextInput
          style={chatInputStyles.input}
          value={message}
          onChangeText={onMessageChange}
          placeholder={t('chat.input.placeholder')}
          placeholderTextColor={COLORS.textSecondary}
          multiline
          editable={!isGenerating && isReady}
        />
        <TouchableOpacity
          onPress={onMessageSubmit}
          style={[
            chatInputStyles.sendButton,
            (!isReady || isGenerating || !message.trim()) &&
              chatInputStyles.disabledButton,
          ]}
          disabled={!isReady || isGenerating || !message.trim()}
        >
          <Text style={chatInputStyles.sendButtonText}>{t('chat.input.send')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const chatInputStyles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: COLORS.background,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  buttonRow: {
    flexDirection: 'row',
    marginBottom: 8,
    gap: 8,
  },
  actionButton: {
    backgroundColor: COLORS.inputBg,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  activeButton: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.accent,
  },
  buttonText: {
    fontSize: 14,
    color: COLORS.textPrimary,
    fontWeight: 'bold',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.inputBg,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    maxHeight: 100,
    color: COLORS.textPrimary,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sendButton: {
    backgroundColor: COLORS.accent,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  disabledButton: {
    backgroundColor: COLORS.border,
    opacity: 0.5,
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
