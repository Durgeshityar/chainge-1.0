import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import * as Location from 'expo-location';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MapPinIcon } from 'react-native-heroicons/outline';
import MapView, { Marker, Region } from 'react-native-maps';

interface LocationMapProps {
  onLocationSelect: (location: { latitude: number; longitude: number }) => void;
}

export const LocationMap: React.FC<LocationMapProps> = ({ onLocationSelect }) => {
  const [region, setRegion] = useState<Region | null>(null);
  const [loading, setLoading] = useState(true);
  const [permissionStatus, setPermissionStatus] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setPermissionStatus(status);
      
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({});
        const initialRegion = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        };
        setRegion(initialRegion);
        onLocationSelect({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
      } else {
        // Default to a fallback location (e.g., New York) if permission denied
        setRegion({
          latitude: 40.7128,
          longitude: -74.0060,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        });
      }
      setLoading(false);
    })();
  }, []);

  const handleRegionChangeComplete = (newRegion: Region) => {
    setRegion(newRegion);
    onLocationSelect({
      latitude: newRegion.latitude,
      longitude: newRegion.longitude,
    });
  };

  const handleUseCurrentLocation = async () => {
    setLoading(true);
    const { status } = await Location.requestForegroundPermissionsAsync();
    
    if (status === 'granted') {
      const location = await Location.getCurrentPositionAsync({});
      const newRegion = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      };
      setRegion(newRegion);
      onLocationSelect({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    }
    setLoading(false);
  };

  if (loading || !region) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Getting location...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={region}
        region={region}
        onRegionChangeComplete={handleRegionChangeComplete}
      >
        <Marker 
          coordinate={{ latitude: region.latitude, longitude: region.longitude }}
          title="Selected Location"
          pinColor={colors.primary}
        />
      </MapView>
      
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.currentLocationButton} onPress={handleUseCurrentLocation}>
          <MapPinIcon size={24} color={colors.background.default} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.centerMarkerContainer} pointerEvents="none">
        {/* Center marker visual aid if needed, but we are using actual Marker */}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: colors.background.input,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background.input,
    borderRadius: 24,
    minHeight: 300,
  },
  loadingText: {
    ...typography.presets.bodyMedium,
    color: colors.text.secondary,
    marginTop: spacing.md,
  },
  overlay: {
    position: 'absolute',
    bottom: spacing.md,
    right: spacing.md,
    alignItems: 'flex-end',
  },
  currentLocationButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  centerMarkerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
