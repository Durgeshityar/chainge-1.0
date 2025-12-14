import { SummaryCard } from '@/components/activity/SummaryCard';
import { Button } from '@/components/ui/Button';
import { useActivityStore } from '@/stores/activityStore';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const THEME_COLORS = [
  '#1a1a1a', // Default Dark
  '#FF5F5F', // Red
  '#ADFF2F', // Neon Green
  '#4a90e2', // Blue
  '#F5A623', // Orange
  '#9013FE', // Purple
];

const SummaryScreen = () => {
  const router = useRouter();
  const { lastSummary, currentSession, resetActivity } = useActivityStore();
  
  const [caption, setCaption] = useState('');
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const [themeColor, setThemeColor] = useState<string | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);

  if (!lastSummary || !currentSession) {
    // Should typically not happen if we navigate correctly, but handle gracefully
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>No activity data found.</Text>
        <Button title="Go Home" onPress={() => router.replace('/(tabs)')} />
      </View>
    );
  }

  const activityType = currentSession.meta.activityType;

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      setBackgroundImage(result.assets[0].uri);
      setThemeColor(null); // Clear theme color if image is picked
    }
  };

  const handlePublish = async () => {
    setIsPublishing(true);
    // Simulate API call
    setTimeout(() => {
        setIsPublishing(false);
        resetActivity();
        Alert.alert('Published!', 'Your activity has been shared.', [
            { text: 'OK', onPress: () => router.replace('/(tabs)') }
        ]);
    }, 1500);
  };

  const handleDiscard = () => {
    Alert.alert('Discard Activity?', 'This cannot be undone.', [
        { text: 'Cancel', style: 'cancel'},
        { 
            text: 'Discard', 
            style: 'destructive', 
            onPress: () => {
                resetActivity();
                router.replace('/(tabs)');
            }
        }
    ]);
  };

  const handleSaveDraft = () => {
      // Logic for saving draft would go here
      resetActivity();
      router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Session Summary</Text>
        <TouchableOpacity onPress={handleDiscard}>
            <Ionicons name="close" size={24} color={colors.text.secondary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Preview Card */}
        <View style={styles.cardWrapper}>
            <SummaryCard 
                activityType={activityType}
                summary={lastSummary}
                trackPoints={lastSummary.trackPoints}
                backgroundImage={backgroundImage}
                themeColor={themeColor}
            />
        </View>

        {/* Caption Input */}
        <View style={styles.inputSection}>
            <TextInput 
                style={styles.captionInput}
                placeholder="How was your workout?"
                placeholderTextColor={colors.text.tertiary}
                multiline
                value={caption}
                onChangeText={setCaption}
            />
        </View>

        {/* Customization Controls */}
        <View style={styles.controlsSection}>
            <Text style={styles.sectionLabel}>Customize Post</Text>
            
            <View style={styles.themeRow}>
                <TouchableOpacity style={styles.addImageBtn} onPress={handlePickImage}>
                    <Ionicons name="image-outline" size={24} color="#fff" />
                </TouchableOpacity>

                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.colorScroll}>
                    {THEME_COLORS.map((color) => (
                        <TouchableOpacity 
                            key={color}
                            style={[
                                styles.colorOption, 
                                { backgroundColor: color },
                                themeColor === color && styles.selectedColorOption
                            ]}
                            onPress={() => {
                                setThemeColor(color);
                                setBackgroundImage(null);
                            }}
                        />
                    ))}
                </ScrollView>
            </View>
        </View>

      </ScrollView>

      {/* Footer Actions */}
      <View style={styles.footer}>
         <View style={styles.footerButtons}>
            <Button 
                title="Save" 
                variant="secondary" 
                style={styles.saveBtn}
                onPress={handleSaveDraft}
            />
            <Button 
                title="Publish" 
                variant="primary" 
                style={styles.publishBtn} 
                onPress={handlePublish}
                isLoading={isPublishing}
            />
         </View>
      </View>
    </SafeAreaView>
  );
};

export default SummaryScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  errorContainer: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    color: '#fff',
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  scrollContent: {
    padding: spacing.lg,
    gap: spacing.xl,
  },
  cardWrapper: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  inputSection: {
    backgroundColor: '#111',
    borderRadius: 16,
    padding: spacing.md,
  },
  captionInput: {
    color: '#fff',
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  controlsSection: {
    gap: spacing.md,
  },
  sectionLabel: {
    color: colors.text.secondary,
    fontSize: 14,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  themeRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  addImageBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#333',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#444',
  },
  colorScroll: {
    gap: spacing.md,
    paddingRight: spacing.lg,
  },
  colorOption: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedColorOption: {
    borderColor: '#fff',
    borderWidth: 3,
  },
  footer: {
    padding: spacing.lg,
    paddingBottom: 20, 
    borderTopWidth: 1,
    borderTopColor: '#222',
  },
  footerButtons: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  saveBtn: {
    flex: 1,
  },
  publishBtn: {
    flex: 2,
  },
});
