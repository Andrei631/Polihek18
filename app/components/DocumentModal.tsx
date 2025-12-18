import { useTranslation } from 'react-i18next';
import {
    Modal,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { COLORS } from '../constants/colors';

interface DocumentModalProps {
  visible: boolean;
  onClose: () => void;
  ids: string[];
  document: string;
  onDocumentChange: (document: string) => void;
  onModifyDocument: () => void;
}

export function DocumentModal({
  visible,
  onClose,
  ids,
  document,
  onDocumentChange,
  onModifyDocument,
}: DocumentModalProps) {
  const { t } = useTranslation();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={modalStyles.overlay}>
        <View style={modalStyles.container}>
          <Text style={modalStyles.title}>
            {ids.length ? t('documentModal.titleUpdate') : t('documentModal.titleAdd')}
          </Text>
          <TextInput
            style={modalStyles.input}
            value={document}
            onChangeText={onDocumentChange}
            placeholder={t('documentModal.placeholder')}
            placeholderTextColor={COLORS.textSecondary}
            multiline
            numberOfLines={10}
            textAlignVertical="top"
          />
          <View style={modalStyles.buttonRow}>
            <TouchableOpacity
              onPress={onClose}
              style={[modalStyles.button, modalStyles.cancelButton]}
            >
              <Text style={modalStyles.cancelButtonText}>{t('documentModal.cancel')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onModifyDocument}
              style={[modalStyles.button, modalStyles.saveButton]}
            >
              <Text style={modalStyles.saveButtonText}>
                {ids.length ? t('documentModal.update') : t('documentModal.add')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 20,
    width: '100%',
    maxWidth: 500,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: COLORS.textPrimary,
  },
  input: {
    backgroundColor: COLORS.inputBg,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 200,
    marginBottom: 16,
    color: COLORS.textPrimary,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: COLORS.inputBg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  saveButton: {
    backgroundColor: COLORS.accent,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
