import { useCallback, useEffect } from 'react';

import { useActivityStore } from '@/stores/activityStore';
import { ActivitySessionMeta, ActivitySummary, ActivityTrackingStatus, TrackPoint } from '@/types';

import type { LocationObject } from 'expo-location';

import { useLocation } from './useLocation';

interface SessionResult {
  success: boolean;
  error?: string;
}

const toTrackPoint = (location: LocationObject): TrackPoint => ({
  latitude: location.coords.latitude,
  longitude: location.coords.longitude,
  timestamp: location.timestamp ?? Date.now(),
  accuracy: location.coords.accuracy ?? undefined,
  altitude: location.coords.altitude,
  heading: location.coords.heading,
  speed: location.coords.speed,
});

const isLiveSession = (status?: ActivityTrackingStatus | null) =>
  status === ActivityTrackingStatus.ACTIVE || status === ActivityTrackingStatus.PAUSED;

const LOCATION_ACTIVITY_TYPES = new Set(['running', 'cycling', 'hike', 'walking']);

const requiresLocationTracking = (meta: ActivitySessionMeta): boolean => {
  const type = meta.activityType?.toLowerCase?.();
  return type ? LOCATION_ACTIVITY_TYPES.has(type) : false;
};

export const useActivity = () => {
  const {
    currentSession,
    trackPoints,
    distanceMeters,
    elapsedMs,
    averagePace,
    lastSummary,
    startActivity,
    pauseActivity,
    resumeActivity,
    stopActivity,
    addTrackPoint,
  } = useActivityStore();

  const {
    permissionStatus,
    requestPermission,
    startTracking,
    stopTracking,
    isTracking,
    error: locationError,
    getCurrentLocation,
    lastKnownLocation,
  } = useLocation();

  const primeCurrentPosition = useCallback(async () => {
    if (permissionStatus !== 'granted') return;
    const location = await getCurrentLocation();
    if (location) {
      addTrackPoint(toTrackPoint(location));
    }
  }, [addTrackPoint, getCurrentLocation, permissionStatus]);

  const beginSession = useCallback(
    async (meta: ActivitySessionMeta): Promise<SessionResult> => {
      if (isLiveSession(currentSession?.status)) {
        return { success: true };
      }

      const needsLocation = requiresLocationTracking(meta);

      const ensureTrackingActive = async () => {
        const trackingStarted = await startTracking({ onTrack: addTrackPoint });
        if (trackingStarted) {
          void primeCurrentPosition();
        }
        return trackingStarted;
      };

      if (needsLocation) {
        if (permissionStatus !== 'granted') {
          const granted = await requestPermission();
          if (!granted) {
            return { success: false, error: 'Location permission is required to start tracking.' };
          }
        }

        const trackingReady = await ensureTrackingActive();
        if (!trackingReady) {
          return { success: false, error: 'Unable to start location updates. Try again.' };
        }

        startActivity(meta);
        return { success: true };
      }

      // Indoor / non-map activity: start timing immediately
      startActivity(meta);

      if (permissionStatus === 'granted') {
        void ensureTrackingActive();
      } else {
        // Soft request without blocking the session
        void requestPermission();
      }

      return { success: true };
    },
    [
      currentSession?.status,
      permissionStatus,
      requestPermission,
      startTracking,
      addTrackPoint,
      startActivity,
      primeCurrentPosition,
    ],
  );

  const pauseSession = useCallback(async () => {
    if (currentSession?.status !== ActivityTrackingStatus.ACTIVE) return;
    pauseActivity();
    await stopTracking();
  }, [currentSession?.status, pauseActivity, stopTracking]);

  const resumeSession = useCallback(async () => {
    if (currentSession?.status !== ActivityTrackingStatus.PAUSED) return false;
    const trackingStarted = await startTracking({ onTrack: addTrackPoint });
    if (!trackingStarted) return false;
    resumeActivity();
    return true;
  }, [currentSession?.status, startTracking, addTrackPoint, resumeActivity]);

  const endSession = useCallback(async (): Promise<ActivitySummary | null> => {
    await stopTracking();
    return stopActivity();
  }, [stopTracking, stopActivity]);

  useEffect(() => {
    return () => {
      void stopTracking();
    };
  }, [stopTracking]);

  return {
    currentSession,
    trackPoints,
    distanceMeters,
    elapsedMs,
    averagePace,
    lastSummary,
    locationPermissionStatus: permissionStatus,
    locationError,
    lastKnownLocation,
    isLocationTracking: isTracking,
    beginSession,
    pauseSession,
    resumeSession,
    endSession,
    requestLocationPermission: requestPermission,
  };
};
