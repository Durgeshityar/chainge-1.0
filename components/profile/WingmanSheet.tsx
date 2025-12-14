import { Button } from '@/components/ui/Button';
import { useProfileStore } from '@/stores/profileStore';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { Image, StyleSheet, Text, View } from 'react-native';

export const WingmanSheet = () => {
  const { user } = useProfileStore();

  if (!user) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.subtitle}>Your wingman</Text>
        <Button variant="ghost" size="sm" title="Edit" onPress={() => {}} />
      </View>

      <Text style={styles.title}>
        Hey {user.name.split(' ')[0]}, I'm your wingman!
      </Text>

      <View style={styles.imageContainer}>
         {/* Using a placeholder or the user's avatar if we want, 
             but the design shows a specific "Wingman" face. 
             We'll use a placeholder for now. */}
        <Image 
            source={{ uri: 'https://images.unsplash.com/photo-1531384441138-2736e62e0919?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' }} 
            style={styles.image} 
            resizeMode="cover"
        />
        <View style={styles.gogglesOverlay} /> 
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  subtitle: {
    ...typography.presets.bodySmall,
    color: colors.text.secondary,
  },
  title: {
    ...typography.presets.h2,
    color: colors.text.primary,
    marginBottom: spacing.xl,
    maxWidth: '80%',
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 24,
    overflow: 'hidden',
    position: 'relative',
    alignSelf: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  gogglesOverlay: {
      // This would be where we'd put the orange goggles overlay if we had the asset
      // For now, just leaving it as a placeholder structure
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.2)',
  }
});
