import { useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View, Modal, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from './constants/colors';
import { useRAGContext } from './context/RAGContext';
import { MANUALS_DATA, Manual } from './data/manuals';

interface SurvivalManualsProps {
  onSelectManual?: (manual: Manual) => void;
}

// Flatten the dataset and add category
const ALL_MANUALS = Object.entries(MANUALS_DATA.dataset).flatMap(([category, manuals]) => 
  manuals.map(manual => ({ ...manual, category: category.replace(/_/g, ' ') }))
);

export default function SurvivalManuals({ onSelectManual }: SurvivalManualsProps) {
  const { vectorStore } = useRAGContext();
  const [searchQuery, setSearchQuery] = useState('');
  
  const [filteredData, setFilteredData] = useState(ALL_MANUALS);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedManual, setSelectedManual] = useState<Manual & { category: string } | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Indexing is now handled by RAGContext

  const handleSearch = async (text: string) => {
    setSearchQuery(text);
    
    if (!text.trim()) {
      setFilteredData(ALL_MANUALS);
      return;
    }

    if (vectorStore) {
      setIsSearching(true);
      try {
        // Semantic search
        const results = await vectorStore.query({
          queryText: text,
          nResults: 1,
        });

        if (results.length > 0) {
           // Try to find matching manuals from our static data based on the returned documents
           const matchedManuals = ALL_MANUALS.filter(manual => 
             results.some(r => r.document && r.document.includes(manual.disaster_type))
           );
           
           if (matchedManuals.length > 0) {
             setFilteredData(matchedManuals);
           } else {
             // Fallback to keyword search
             const keywordFiltered = ALL_MANUALS.filter((item) =>
                item.disaster_type.toLowerCase().includes(text.toLowerCase()) ||
                item.warning_signs_and_conditions.some(sign => sign.toLowerCase().includes(text.toLowerCase())) ||
                item.protective_measures.some(measure => measure.toLowerCase().includes(text.toLowerCase()))
              );
              setFilteredData(keywordFiltered);
           }
        } else {
           setFilteredData([]);
        }
      } catch (error) {
        console.error("Semantic search failed:", error);
        // Fallback to keyword search
        const keywordFiltered = ALL_MANUALS.filter((item) =>
          item.disaster_type.toLowerCase().includes(text.toLowerCase()) ||
          item.warning_signs_and_conditions.some(sign => sign.toLowerCase().includes(text.toLowerCase())) ||
          item.protective_measures.some(measure => measure.toLowerCase().includes(text.toLowerCase()))
        );
        setFilteredData(keywordFiltered);
      } finally {
        setIsSearching(false);
      }
    } else {
      // Keyword search fallback
      const filtered = ALL_MANUALS.filter((item) =>
        item.disaster_type.toLowerCase().includes(text.toLowerCase()) ||
        item.warning_signs_and_conditions.some(sign => sign.toLowerCase().includes(text.toLowerCase())) ||
        item.protective_measures.some(measure => measure.toLowerCase().includes(text.toLowerCase()))
      );
      setFilteredData(filtered);
    }
  };

  const openManual = (manual: Manual & { category: string }) => {
    setSelectedManual(manual);
    setModalVisible(true);
  };

  const closeManual = () => {
    setModalVisible(false);
    setSelectedManual(null);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Survival Manuals</Text>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search manuals (Semantic)..."
          placeholderTextColor={COLORS.textSecondary}
          value={searchQuery}
          onChangeText={handleSearch}
        />
        {isSearching && <ActivityIndicator size="small" color={COLORS.accent} style={styles.loader} />}
      </View>
      <FlatList
        data={filteredData}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.card}
            onPress={() => openManual(item)}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.category}>{item.category}</Text>
              <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
            </View>
            <Text style={styles.disasterType}>{item.disaster_type}</Text>
            <Text style={styles.shortDescription} numberOfLines={2}>
              {item.warning_signs_and_conditions[0]}
            </Text>
          </TouchableOpacity>
        )}
      />

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeManual}
      >
        <View style={styles.modalContainer}>
          <SafeAreaView style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={closeManual} style={styles.closeButton}>
                <Ionicons name="close" size={24} color={COLORS.textPrimary} />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>{selectedManual?.disaster_type}</Text>
              <View style={{ width: 40 }} /> 
            </View>
            
            <ScrollView contentContainerStyle={styles.modalScrollContent}>
              {selectedManual && (
                <>
                  <Text style={styles.modalCategory}>{selectedManual.category}</Text>
                  
                  <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                      <Ionicons name="warning-outline" size={20} color={COLORS.accent} />
                      <Text style={styles.sectionTitle}>Warning Signs</Text>
                    </View>
                    {selectedManual.warning_signs_and_conditions.map((sign, index) => (
                      <View key={`sign-${index}`} style={styles.listItem}>
                        <Text style={styles.bullet}>•</Text>
                        <Text style={styles.text}>{sign}</Text>
                      </View>
                    ))}
                  </View>
                  
                  <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                      <Ionicons name="shield-checkmark-outline" size={20} color={COLORS.success} />
                      <Text style={styles.sectionTitle}>Protective Measures</Text>
                    </View>
                    {selectedManual.protective_measures.map((measure, index) => (
                      <View key={`measure-${index}`} style={styles.listItem}>
                        <Text style={styles.bullet}>•</Text>
                        <Text style={styles.text}>{measure}</Text>
                      </View>
                    ))}
                  </View>
                </>
              )}
            </ScrollView>
          </SafeAreaView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    padding: 16,
    textAlign: 'center',
  },
  searchContainer: {
    paddingHorizontal: 16,
    marginBottom: 8,
    position: 'relative',
    justifyContent: 'center',
  },
  searchInput: {
    backgroundColor: COLORS.inputBg,
    color: COLORS.textPrimary,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    fontSize: 16,
    paddingRight: 40,
  },
  loader: {
    position: 'absolute',
    right: 24,
  },
  listContent: {
    padding: 16,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  category: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  disasterType: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  shortDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    flex: 1,
    backgroundColor: COLORS.background,
    marginTop: 50,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: COLORS.card,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  modalScrollContent: {
    padding: 20,
  },
  modalCategory: {
    fontSize: 12,
    color: COLORS.accent,
    textTransform: 'uppercase',
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
    letterSpacing: 1,
  },
  section: {
    marginBottom: 24,
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  listItem: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  bullet: {
    color: COLORS.textSecondary,
    marginRight: 8,
    fontSize: 14,
    lineHeight: 22,
  },
  text: {
    fontSize: 14,
    color: COLORS.textPrimary,
    flex: 1,
    lineHeight: 22,
  },
});
