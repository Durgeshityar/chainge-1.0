import { calculatePaceSecondsPerKm, haversineDistanceMeters } from '@/lib/geo';
import { TrackPoint } from '@/types';
import * as Location from 'expo-location';
import { useCallback, useEffect, useRef, useState } from 'react';

type PermissionState = 'undetermined' | 'granted' | 'denied';

type StartTrackingOptions = {
  /** Optional callback (e.g., pass through to activity store addTrackPoint) */
  onTrack?: (point: TrackPoint) => void;
  distanceIntervalMeters?: number;
  timeIntervalMs?: number;
};

const mapPermissionStatus = (status: Location.PermissionStatus): PermissionState => {
  if (status === Location.PermissionStatus.GRANTED) return 'granted';
  if (status === Location.PermissionStatus.DENIED) return 'denied';
  return 'undetermined';
};

/**
 * Location hook that requests permissions, fetches current position,
 * and streams foreground tracking updates with derived metrics.
 */
export const useLocation = () => {
  const [permissionStatus, setPermissionStatus] = useState<PermissionState>('undetermined');
  const [isRequestingPermission, setIsRequestingPermission] = useState(false);
  const [isTracking, setIsTracking] = useState(false);
  const [distanceMeters, setDistanceMeters] = useState(0);
  const [paceSecondsPerKm, setPaceSecondsPerKm] = useState<number | null>(null);
  const [lastKnownLocation, setLastKnownLocation] = useState<Location.LocationObject | null>(null);
  const [error, setError] = useState<string | null>(null);

  const watchRef = useRef<Location.LocationSubscription | null>(null);
  const lastPointRef = useRef<TrackPoint | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const distanceRef = useRef<number>(0);

  const syncPermission = useCallback(async () => {
    const { status } = await Location.getForegroundPermissionsAsync();
    const mapped = mapPermissionStatus(status);
    setPermissionStatus(mapped);
    return mapped;
  }, []);

  const requestPermission = useCallback(async () => {
    setIsRequestingPermission(true);
    setError(null);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      const mapped = mapPermissionStatus(status);
      setPermissionStatus(mapped);
      return mapped === 'granted';
    } catch (err) {
      setError((err as Error).message);
      return false;
    } finally {
      setIsRequestingPermission(false);
    }
  }, []);

  const getCurrentLocation = useCallback(async () => {
    if (permissionStatus !== 'granted') {
      setError('Location permission not granted');
      return null;
    }

    try {
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      setLastKnownLocation(loc);
      return loc;
    } catch (err) {
      setError((err as Error).message);
      return null;
    }
  }, [permissionStatus]);

  const stopTracking = useCallback(async () => {
    if (watchRef.current) {
      watchRef.current.remove();
      watchRef.current = null;
    }
    setIsTracking(false);
  }, []);

  const startTracking = useCallback(
    async (options?: StartTrackingOptions) => {
      if (permissionStatus !== 'granted') {
        setError('Location permission not granted');
        return false;
      }

      if (watchRef.current) return true; // already tracking

      startTimeRef.current = Date.now();
      distanceRef.current = 0;
      setDistanceMeters(0);
      setPaceSecondsPerKm(null);
      setError(null);

      watchRef.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: options?.timeIntervalMs ?? 1000,
          distanceInterval: options?.distanceIntervalMeters ?? 5,
        },
        (loc) => {
          setLastKnownLocation(loc);

          const point: TrackPoint = {
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
            timestamp: loc.timestamp ?? Date.now(),
            accuracy: loc.coords.accuracy ?? undefined,
            altitude: loc.coords.altitude,
            heading: loc.coords.heading,
            speed: loc.coords.speed,
          };

          if (lastPointRef.current) {
            distanceRef.current += haversineDistanceMeters(lastPointRef.current, point);
          }
          lastPointRef.current = point;

          const elapsedMs = startTimeRef.current ? Date.now() - startTimeRef.current : 0;
          const pace = calculatePaceSecondsPerKm(distanceRef.current, elapsedMs);

          setDistanceMeters(distanceRef.current);
          setPaceSecondsPerKm(pace);
          options?.onTrack?.(point);
        },
      );

      setIsTracking(true);
      return true;
    },
    [permissionStatus],
  );

  useEffect(() => {
    syncPermission();
    return () => {
      stopTracking();
    };
  }, [syncPermission, stopTracking]);

  return {
    permissionStatus,
    isRequestingPermission,
    isTracking,
    distanceMeters,
    paceSecondsPerKm,
    lastKnownLocation,
    error,
    requestPermission,
    getCurrentLocation,
    startTracking,
    stopTracking,
  };
};

/**
 * Lightweight validation harness to assert permission mapping logic works.
 */
export const runLocationPermissionHarness = () => {
  const denied = mapPermissionStatus(Location.PermissionStatus.DENIED) === 'denied';
  const granted = mapPermissionStatus(Location.PermissionStatus.GRANTED) === 'granted';
  return denied && granted;
};
