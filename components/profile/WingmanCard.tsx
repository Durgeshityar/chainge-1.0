import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface WingmanCardProps {
  onPress: () => void;
}

export const WingmanCard = ({ onPress }: WingmanCardProps) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
            {/* Placeholder for the "spy" icon in the design */}
             <Text style={{fontSize: 20}}>🕵️</Text>
        </View>
        <Text style={styles.text}>Hey there, I'm your wingman 🌶️</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: spacing.lg,
    marginVertical: spacing.md,
    padding: spacing.md,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.primary, // Using primary color for the border as seen in design (orange/red)
    borderStyle: 'dashed',
    backgroundColor: 'rgba(0,0,0,0.3)', // Slight dark background
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  iconContainer: {
      width: 32,
      height: 32,
      justifyContent: 'center',
      alignItems: 'center',
  },
  text: {
    ...typography.presets.bodyMedium,
    color: colors.text.secondary,
  },
});
