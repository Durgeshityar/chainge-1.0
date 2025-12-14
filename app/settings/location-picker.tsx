import { Header } from '@/components/layout/Header';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { LocationMap } from '@/components/onboarding/LocationMap';
import { useAdapters } from '@/hooks/useAdapter';
import { useAuth } from '@/hooks/useAuth';
import { createUserService } from '@/services/users';
import { useAuthStore } from '@/stores/authStore';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function LocationPickerScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { setProfile: setAuthProfile } = useAuthStore();
  const adapters = useAdapters();
  const userService = useMemo(
    () => createUserService(adapters.database, adapters.storage),
    [adapters]
  );

  const [selectedLocation, setSelectedLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleLocationSelect = (loc: { latitude: number; longitude: number }) => {
    setSelectedLocation(loc);
  };

  const handleSave = async () => {
    if (!user || !selectedLocation) return;
    setIsSaving(true);
    try {
      // In a real app, we would reverse geocode to get a string address like "New York, USA"
      // For now, we will save the coordinates and a placeholder string, or just coordinates if schema supports.
      // The User type has `location: string` and `latitude/longitude: number`.
      // We will update both coords.
      
      // Since we don't have a configured geocoding API, I'll set a generic string based on coords for now
      // or keep the existing location string if we don't want to overwrite it with "Lat: ..., Long: ...".
      // Let's assume the user wants to update their map marker primarily.
      
      const updatedUser = await userService.updateProfile(user.id, {
        latitude: selectedLocation.latitude,
        longitude: selectedLocation.longitude,
        // Optional: location: `Lat: ${selectedLocation.latitude.toFixed(2)}, Long: ${selectedLocation.longitude.toFixed(2)}`
      });
      
      setAuthProfile(updatedUser);
      router.back();
    } catch (error) {
      console.error('Failed to save location', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ScreenContainer>
      <Header
        title="Select Location"
        rightElement={
          <TouchableOpacity 
            style={[styles.saveButton, (!selectedLocation || isSaving) && styles.disabledButton]} 
            onPress={handleSave}
            disabled={!selectedLocation || isSaving}
          >
             {isSaving ? (
                <ActivityIndicator size="small" color={colors.background.black} />
             ) : (
                <Text style={styles.saveButtonText}>Confirm</Text>
             )}
          </TouchableOpacity>
        }
      />
      <View style={styles.content}>
        <LocationMap onLocationSelect={handleLocationSelect} />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    padding: spacing.md, 
  },
  saveButton: {
    backgroundColor: '#ADFA1D', // Neon Green
    paddingHorizontal: spacing.lg,
    paddingVertical: 8,
    borderRadius: 20,
  },
  saveButtonText: {
    ...typography.presets.bodySmall,
    fontWeight: '800', 
    color: 'black',
    textTransform: 'none',
  },
  disabledButton: {
    opacity: 0.5,
  },
});
