import { StatsDisplay } from '@/components/activity/StatsDisplay';
import { TrackingMap } from '@/components/activity/TrackingMap';
import { Modal } from '@/components/ui/Modal';
import { useActivity } from '@/hooks/useActivity';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { ActivityTrackingStatus } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const isLiveStatus = (status?: ActivityTrackingStatus | null) =>
  status === ActivityTrackingStatus.ACTIVE || status === ActivityTrackingStatus.PAUSED;

const ActivityTrackingScreen = () => {
  const { activityType } = useLocalSearchParams<{ activityType?: string | string[] }>();
  const router = useRouter();

  const resolvedActivityType = Array.isArray(activityType)
    ? activityType[0] ?? 'Activity'
    : activityType ?? 'Activity';

  const {
    currentSession,
    elapsedMs,
    distanceMeters,
    trackPoints,
    beginSession,
    pauseSession,
    resumeSession,
    endSession,
    locationPermissionStatus,
    requestLocationPermission,
    locationError,
    lastKnownLocation,
  } = useActivity();

  // Real-time timer display
  const [displayTime, setDisplayTime] = useState(0);
  const [sessionError, setSessionError] = useState<string | null>(null);
  const [showEndModal, setShowEndModal] = useState(false);
  const [isBootstrapping, setIsBootstrapping] = useState(false);

  // Calculate elapsed time in real-time
  const calculateElapsedTime = useCallback(() => {
    if (!currentSession) return 0;

    const now = Date.now();
    const { startedAt, pausedAt, totalPausedMs, status } = currentSession;

    if (status === ActivityTrackingStatus.PAUSED && pausedAt) {
      // When paused, show time up to pause point
      return Math.max(0, pausedAt - startedAt - totalPausedMs);
    }

    if (status === ActivityTrackingStatus.ACTIVE) {
      // When active, calculate real-time elapsed
      return Math.max(0, now - startedAt - totalPausedMs);
    }

    return 0;
  }, [currentSession]);

  useEffect(() => {
    let cancelled = false;

    const status = currentSession?.status ?? ActivityTrackingStatus.IDLE;
    if (status === ActivityTrackingStatus.ACTIVE || status === ActivityTrackingStatus.PAUSED) {
      setSessionError(null);
      setIsBootstrapping(false);
      return;
    }

    if (status === ActivityTrackingStatus.COMPLETED) {
      // Session already concluded; avoid starting a new one while summary flows run.
      setIsBootstrapping(false);
      return;
    }

    setIsBootstrapping(true);
    setSessionError(null);
    setDisplayTime(0);

    beginSession({ activityType: resolvedActivityType || 'Activity' }).then((result) => {
      if (cancelled) return;
      if (!result.success) {
        setSessionError(result.error ?? 'Unable to start tracking.');
      }
      setIsBootstrapping(false);
    });

    return () => {
      cancelled = true;
    };
  }, [beginSession, currentSession?.status, resolvedActivityType]);

  // Update display time every second when active
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;

    if (currentSession?.status === ActivityTrackingStatus.ACTIVE) {
      // Update immediately
      setDisplayTime(calculateElapsedTime());

      // Then update every second
      interval = setInterval(() => {
        setDisplayTime(calculateElapsedTime());
      }, 1000);
    } else if (currentSession?.status === ActivityTrackingStatus.PAUSED) {
      // When paused, show the paused time
      setDisplayTime(calculateElapsedTime());
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [currentSession?.status, calculateElapsedTime]);

  useEffect(() => {
    if (!isLiveStatus(currentSession?.status)) {
      setDisplayTime(0);
    }
  }, [currentSession?.status]);

  // Note: We no longer auto-end the session on unmount.
  // The user must explicitly end the session via handleEnd.

  const handlePauseToggle = () => {
    if (!currentSession) return;

    if (currentSession.status === ActivityTrackingStatus.ACTIVE) {
      void pauseSession();
    } else if (currentSession.status === ActivityTrackingStatus.PAUSED) {
      void resumeSession();
    }
  };

  const handleEnd = () => {
    setShowEndModal(true);
  };

  const confirmEndSession = async () => {
    const summary = await endSession();
    if (summary) {
      router.replace('/activity/summary');
    } else {
      router.back();
    }
  };

  const isMapActivity = ['Running', 'Cycling', 'Swimming'].includes(resolvedActivityType);
  const shouldShowPermissionPrompt = locationPermissionStatus === 'denied';
  const timerValue = displayTime;
  const activeStatus = currentSession?.status;
  const focusPoint = useMemo(() => {
    const latestTrackPoint =
      trackPoints && trackPoints.length > 0 ? trackPoints[trackPoints.length - 1] : undefined;

    if (latestTrackPoint) {
      return { latitude: latestTrackPoint.latitude, longitude: latestTrackPoint.longitude };
    }

    if (lastKnownLocation) {
      return {
        latitude: lastKnownLocation.coords.latitude,
        longitude: lastKnownLocation.coords.longitude,
      };
    }

    return undefined;
  }, [lastKnownLocation, trackPoints]);

  if (shouldShowPermissionPrompt) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Ionicons name="location-outline" size={48} color="#ADFF2F" />
        <Text style={styles.permissionTitle}>We need your location</Text>
        <Text style={styles.permissionBody}>
          Allow Chainge to access your location so we can draw your route and measure distance. If
          you previously denied access, re-enable it from Settings.
        </Text>
        <TouchableOpacity style={styles.actionButton} onPress={requestLocationPermission}>
          <Text style={styles.actionButtonText}>Grant Access</Text>
        </TouchableOpacity>
        {(sessionError || locationError) && (
          <Text style={styles.errorText}>{sessionError ?? locationError}</Text>
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {isMapActivity && <TrackingMap trackPoints={trackPoints} focusPoint={focusPoint} />}

      {/* Stats Overlay */}
      <View style={[styles.overlay, !isMapActivity && styles.fullScreenOverlay]}>
        <View style={styles.header}>
          <Text style={styles.activityType}>{resolvedActivityType}</Text>
        </View>

        {(sessionError || locationError) && (
          <Text style={styles.errorText}>{sessionError ?? locationError}</Text>
        )}

        {isBootstrapping && (
          <View style={styles.statusRow}>
            <ActivityIndicator color="#ADFF2F" />
            <Text style={styles.statusText}>Preparing sensors...</Text>
          </View>
        )}

        <StatsDisplay
          elapsedMs={timerValue}
          distanceMeters={distanceMeters}
          mode={isMapActivity ? 'map' : 'timer'}
        />

        <View style={styles.controls}>
          <TouchableOpacity
            style={[
              styles.controlButton,
              !isLiveStatus(activeStatus) && styles.controlButtonDisabled,
            ]}
            onPress={handlePauseToggle}
            disabled={!isLiveStatus(activeStatus)}
          >
            <Ionicons
              name={activeStatus === ActivityTrackingStatus.ACTIVE ? 'pause' : 'play'}
              size={32}
              color="#000"
            />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.controlButton, styles.stopButton]} onPress={handleEnd}>
            <View style={styles.stopIcon} />
          </TouchableOpacity>
        </View>
      </View>

      {/* End Session Confirmation Modal */}
      <Modal
        visible={showEndModal}
        onClose={() => setShowEndModal(false)}
        title="End Activity?"
        message="Are you sure you want to end this session? Your progress will be saved."
        actions={[
          {
            label: 'End Session',
            variant: 'destructive',
            onPress: confirmEndSession,
          },
          {
            label: 'Keep Going',
            variant: 'cancel',
            onPress: () => {},
          },
        ]}
      />
    </View>
  );
};

export default ActivityTrackingScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  centered: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.85)',
    padding: spacing.xl,
    paddingBottom: 50,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  fullScreenOverlay: {
    position: 'relative',
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#000',
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  activityType: {
    color: colors.text.secondary,
    fontSize: 18,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.xl,
  },
  controlButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#ADFF2F',
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlButtonDisabled: {
    opacity: 0.4,
  },
  stopButton: {
    backgroundColor: '#FF5F5F',
  },
  stopIcon: {
    width: 24,
    height: 24,
    backgroundColor: '#000',
    borderRadius: 4,
  },
  permissionTitle: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: '600',
    textAlign: 'center',
  },
  permissionBody: {
    color: colors.text.secondary,
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
  actionButton: {
    backgroundColor: '#ADFF2F',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: 30,
  },
  actionButtonText: {
    color: '#000',
    fontWeight: '600',
    fontSize: 16,
  },
  errorText: {
    color: '#FF6B6B',
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  statusText: {
    color: colors.text.secondary,
    fontSize: 14,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});
