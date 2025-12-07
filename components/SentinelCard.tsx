import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { COLORS } from '../constants/theme';

interface SentinelCardProps {
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  // 1. ADD THIS NEW PROP DEFINITION
  onLongPress?: () => void; 
  isPremium?: boolean;
  isLocked?: boolean;
}

export const SentinelCard = ({ 
  title, 
  subtitle, 
  icon, 
  onPress, 
  onLongPress, // 2. DESTRUCTURE IT HERE
  isPremium = false,
  isLocked = false
}: SentinelCardProps) => {
  
  return (
    <TouchableOpacity 
      style={[styles.card, isLocked && styles.lockedCard]} 
      onPress={onPress}
      // 3. PASS IT TO THE TOUCHABLE COMPONENT
      onLongPress={onLongPress}
      delayLongPress={500} // Optional: Adjusts how long (ms) to hold (default is 500ms)
      activeOpacity={0.7}
    >
      <View style={styles.iconContainer}>
        <Ionicons 
          name={isLocked ? "lock-closed" : icon} 
          size={28} 
          color={isLocked ? COLORS.textSecondary : COLORS.accent} 
        />
      </View>
      
      <View style={styles.textContainer}>
        <Text style={[styles.title, isLocked && styles.lockedText]}>
          {title}
        </Text>
        <Text style={styles.subtitle} numberOfLines={2}>
          {subtitle}
        </Text>
      </View>

      {/* Optional: Visual cue for interactivity */}
      <Ionicons 
        name="chevron-forward" 
        size={20} 
        color={COLORS.textSecondary} 
        style={{ opacity: 0.5 }}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
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
});