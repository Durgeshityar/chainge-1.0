import { Activity } from '@/types';
import { create } from 'zustand';

export type NearbyTimeFilter = 'NOW' | 'NEXT_HOUR' | 'TODAY' | 'THIS_WEEK';

export interface NearbyFilters {
  activityTypes: string[];
  maxDistanceKm: number;
  timeRange: NearbyTimeFilter;
}

const defaultFilters = (): NearbyFilters => ({
  activityTypes: [],
  maxDistanceKm: 15,
  timeRange: 'TODAY',
});

interface NearbyStoreState {
  activities: Activity[];
  passedActivityIds: Set<string>;
  filters: NearbyFilters;
  isLoading: boolean;
  lastFetchedAt: number | null;
}

interface NearbyStoreActions {
  setActivities: (activities: Activity[]) => void;
  appendActivities: (activities: Activity[]) => void;
  passActivity: (activityId: string) => void;
  resetPassedActivities: () => void;
  setFilters: (filters: NearbyFilters) => void;
  updateFilters: (filters: Partial<NearbyFilters>) => void;
  resetFilters: () => void;
  setIsLoading: (isLoading: boolean) => void;
  setLastFetchedAt: (timestamp?: number) => void;
  getVisibleActivities: () => Activity[];
  getNextActivity: () => Activity | null;
}

type NearbyStore = NearbyStoreState & NearbyStoreActions;

export const useNearbyStore = create<NearbyStore>((set, get) => ({
  activities: [],
  passedActivityIds: new Set<string>(),
  filters: defaultFilters(),
  isLoading: false,
  lastFetchedAt: null,

  setActivities: (activities) =>
    set(() => ({
      activities,
      passedActivityIds: new Set<string>(),
      lastFetchedAt: Date.now(),
    })),

  appendActivities: (incoming) =>
    set((state) => {
      const existingById = new Map(state.activities.map((activity) => [activity.id, activity]));
      incoming.forEach((activity) => existingById.set(activity.id, activity));

      return {
        activities: Array.from(existingById.values()),
        lastFetchedAt: Date.now(),
      };
    }),

  passActivity: (activityId) =>
    set((state) => {
      if (state.passedActivityIds.has(activityId)) {
        return state;
      }

      const next = new Set(state.passedActivityIds);
      next.add(activityId);

      return { passedActivityIds: next };
    }),

  resetPassedActivities: () => set({ passedActivityIds: new Set<string>() }),

  setFilters: (filters) =>
    set({ filters: { ...filters, activityTypes: [...filters.activityTypes] } }),

  updateFilters: (filters) =>
    set((state) => ({
      filters: {
        ...state.filters,
        ...filters,
        activityTypes:
          filters.activityTypes !== undefined
            ? [...filters.activityTypes]
            : state.filters.activityTypes,
      },
    })),

  resetFilters: () => set({ filters: defaultFilters() }),

  setIsLoading: (isLoading) => set({ isLoading }),

  setLastFetchedAt: (timestamp = Date.now()) => set({ lastFetchedAt: timestamp }),

  getVisibleActivities: () => {
    const { activities, passedActivityIds } = get();
    return activities.filter((activity) => !passedActivityIds.has(activity.id));
  },

  getNextActivity: () => {
    const visible = get().getVisibleActivities();
    return visible.length > 0 ? visible[0] : null;
  },
}));

export const createDefaultNearbyFilters = defaultFilters;
