import { accumulateDistanceMeters, calculatePaceSecondsPerKm } from '@/lib/geo';
import {
    Activity,
    ActivitySession,
    ActivitySessionMeta,
    ActivitySummary,
    ActivityTrackingStatus,
    TrackPoint,
} from '@/types';
import { create } from 'zustand';

interface ActivityStoreState {
  currentSession: ActivitySession | null;
  scheduledActivities: Activity[];
  trackPoints: TrackPoint[];
  distanceMeters: number;
  elapsedMs: number;
  averagePace: number | null;
  lastSummary: ActivitySummary | null;
  tempMusicSelection: {
     id: string; 
     title: string; 
     artist: string; 
     coverUrl: string; 
     duration: number; 
     startTime: number; 
     endTime: number; 
  } | null;
}

interface ActivityStoreActions {
  setScheduledActivities: (activities: Activity[]) => void;
  startActivity: (meta: ActivitySessionMeta) => void;
  pauseActivity: () => void;
  resumeActivity: () => void;
  addTrackPoint: (point: TrackPoint) => void;
  stopActivity: () => ActivitySummary | null;
  resetActivity: () => void;
  setMusicSelection: (selection: ActivityStoreState['tempMusicSelection']) => void;
}

type ActivityStore = ActivityStoreState & ActivityStoreActions;

const initialState: ActivityStoreState = {
  currentSession: null,
  scheduledActivities: [],
  trackPoints: [],
  distanceMeters: 0,
  elapsedMs: 0,
  averagePace: null,
  lastSummary: null,
  tempMusicSelection: null,
};

const makeSessionId = (): string => Math.random().toString(36).slice(2);

const computeElapsedMs = (session: ActivitySession, now = Date.now()): number => {
  const end = session.endedAt ?? now;
  const pausedRuntime = session.pausedAt ? end - session.pausedAt : 0;
  const totalPaused = session.totalPausedMs + pausedRuntime;

  return Math.max(0, end - session.startedAt - totalPaused);
};

export const useActivityStore = create<ActivityStore>((set) => ({
  ...initialState,

  setScheduledActivities: (activities) => set({ scheduledActivities: activities }),

  startActivity: (meta) =>
    set(() => ({
      currentSession: {
        id: makeSessionId(),
        status: ActivityTrackingStatus.ACTIVE,
        startedAt: Date.now(),
        endedAt: null,
        pausedAt: null,
        totalPausedMs: 0,
        meta,
      },
      trackPoints: [],
      distanceMeters: 0,
      elapsedMs: 0,
      averagePace: null,
      lastSummary: null,
    })),

  pauseActivity: () =>
    set((state) => {
      if (!state.currentSession || state.currentSession.status !== ActivityTrackingStatus.ACTIVE) {
        return state;
      }

      return {
        currentSession: {
          ...state.currentSession,
          status: ActivityTrackingStatus.PAUSED,
          pausedAt: Date.now(),
        },
      };
    }),

  resumeActivity: () =>
    set((state) => {
      if (!state.currentSession || state.currentSession.status !== ActivityTrackingStatus.PAUSED) {
        return state;
      }

      const now = Date.now();
      const pausedAt = state.currentSession.pausedAt ?? now;

      return {
        currentSession: {
          ...state.currentSession,
          status: ActivityTrackingStatus.ACTIVE,
          pausedAt: null,
          totalPausedMs: state.currentSession.totalPausedMs + (now - pausedAt),
        },
      };
    }),

  addTrackPoint: (point) =>
    set((state) => {
      if (
        !state.currentSession ||
        state.currentSession.status === ActivityTrackingStatus.COMPLETED
      ) {
        return state;
      }

      const trackPoints = [...state.trackPoints, point];
      const distanceMeters = accumulateDistanceMeters(trackPoints);
      const elapsedMs = computeElapsedMs(state.currentSession);
      const averagePace = calculatePaceSecondsPerKm(distanceMeters, elapsedMs);

      return {
        trackPoints,
        distanceMeters,
        elapsedMs,
        averagePace,
      };
    }),

  stopActivity: () => {
    let summary: ActivitySummary | null = null;

    set((state) => {
      if (!state.currentSession) return state;

      const endedAt = Date.now();
      const session: ActivitySession = {
        ...state.currentSession,
        status: ActivityTrackingStatus.COMPLETED,
        endedAt,
        pausedAt: null,
        totalPausedMs:
          state.currentSession.totalPausedMs +
          (state.currentSession.pausedAt ? endedAt - state.currentSession.pausedAt : 0),
      };

      const distanceMeters = accumulateDistanceMeters(state.trackPoints);
      const durationMs = computeElapsedMs(session, endedAt);
      const paceSecondsPerKm = calculatePaceSecondsPerKm(distanceMeters, durationMs);

      summary = {
        sessionId: session.id,
        startedAt: session.startedAt,
        endedAt,
        distanceMeters,
        durationMs,
        paceSecondsPerKm,
        trackPoints: state.trackPoints,
      };

      return {
        currentSession: session,
        distanceMeters,
        elapsedMs: durationMs,
        averagePace: paceSecondsPerKm,
        lastSummary: summary,
      };
    });

    return summary;
  },

  resetActivity: () =>
    set((state) => ({
      ...initialState,
      scheduledActivities: state.scheduledActivities,
      tempMusicSelection: null,
    })),

  setMusicSelection: (selection) => set({ tempMusicSelection: selection }),
}));

/**
 * Lightweight validation harness to verify distance/pace calculations and lifecycle flow.
 */
export const runActivityStoreHarness = () => {
  const store = useActivityStore;
  store.getState().resetActivity();
  store.getState().startActivity({ activityType: 'run' });

  const start = Date.now();
  store.getState().addTrackPoint({ latitude: 0, longitude: 0, timestamp: start });
  store.getState().addTrackPoint({ latitude: 0, longitude: 0.001, timestamp: start + 60000 });

  const paused = store.getState().currentSession?.status === ActivityTrackingStatus.ACTIVE;
  if (paused) {
    store.getState().pauseActivity();
    store.getState().resumeActivity();
  }

  const summary = store.getState().stopActivity();

  return {
    summary,
    hasDistance: (summary?.distanceMeters ?? 0) > 0,
    hasDuration: (summary?.durationMs ?? 0) >= 60000,
    wasPausedAndResumed: paused ? store.getState().currentSession?.totalPausedMs !== 0 : true,
  };
};
