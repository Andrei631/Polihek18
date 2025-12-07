import { useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { COLORS } from '../constants/colors';
import { useRAGContext } from '../context/RAGContext';
import { MANUALS_DATA, Manual } from '../data/manuals';

interface SurvivalManualsProps {
  onSelectManual?: (manual: Manual) => void;
}

export function SurvivalManuals({ onSelectManual }: SurvivalManualsProps) {
  const { vectorStore } = useRAGContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredData, setFilteredData] = useState(MANUALS_DATA);
  const [isSearching, setIsSearching] = useState(false);

  // Indexing is now handled by RAGContext

  const handleSearch = async (text: string) => {
    setSearchQuery(text);
    
    if (!text.trim()) {
      setFilteredData(MANUALS_DATA);
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
           const matchedManuals = MANUALS_DATA.filter(manual => 
             results.some(r => r.document && r.document.includes(manual.disaster_type))
           );
           
           if (matchedManuals.length > 0) {
             setFilteredData(matchedManuals);
           } else {
             // Fallback to keyword search
             const keywordFiltered = MANUALS_DATA.filter((item) =>
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
        const keywordFiltered = MANUALS_DATA.filter((item) =>
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
      const filtered = MANUALS_DATA.filter((item) =>
        item.disaster_type.toLowerCase().includes(text.toLowerCase()) ||
        item.warning_signs_and_conditions.some(sign => sign.toLowerCase().includes(text.toLowerCase())) ||
        item.protective_measures.some(measure => measure.toLowerCase().includes(text.toLowerCase()))
      );
      setFilteredData(filtered);
    }
  };

  return (
    <View style={styles.container}>
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
            onPress={() => onSelectManual?.(item)}
            disabled={!onSelectManual}
          >
            <Text style={styles.disasterType}>{item.disaster_type}</Text>
            
            <Text style={styles.sectionTitle}>Warning Signs:</Text>
            {item.warning_signs_and_conditions.map((sign, index) => (
              <Text key={`sign-${index}`} style={styles.text}>• {sign}</Text>
            ))}
            
            <Text style={styles.sectionTitle}>Protective Measures:</Text>
            {item.protective_measures.map((measure, index) => (
              <Text key={`measure-${index}`} style={styles.text}>• {measure}</Text>
            ))}
          </TouchableOpacity>
        )}
      />
    </View>
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
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  disasterType: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.accent,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.textSecondary,
    marginTop: 8,
    marginBottom: 4,
  },
  text: {
    fontSize: 14,
    color: COLORS.textPrimary,
    marginLeft: 8,
    marginBottom: 2,
    lineHeight: 20,
  },
});
