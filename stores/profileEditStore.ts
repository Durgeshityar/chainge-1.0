import { create } from 'zustand';

export interface ProfileEditState {
  name: string;
  username: string;
  location: string;
  bio: string;
  gender: string;
  dateOfBirth: string;
  height: { value: number; unit: 'cm' | 'ft' };
  weight: { value: number; unit: 'kg' | 'lbs' };
  activityTracker: string;
  interests: string[];
  avatarUri?: string;
  coverUri?: string;

  // Actions
  setField: <K extends keyof ProfileEditState>(field: K, value: ProfileEditState[K]) => void;
  toggleInterest: (interest: string) => void;
  reset: () => void;
  initialize: (data: Partial<ProfileEditState>) => void;
}

export const useProfileEditStore = create<ProfileEditState>((set) => ({
  name: '',
  username: '',
  location: '',
  bio: '',
  gender: '',
  dateOfBirth: '',
  height: { value: 170, unit: 'cm' },
  weight: { value: 70, unit: 'kg' },
  activityTracker: '',
  interests: [],
  avatarUri: undefined,
  coverUri: undefined,

  setField: (field, value) => set((state) => ({ ...state, [field]: value })),
  
  toggleInterest: (interest) => set((state) => {
    const exists = state.interests.includes(interest);
    if (exists) {
      return { interests: state.interests.filter((i) => i !== interest) };
    } else {
      return { interests: [...state.interests, interest] };
    }
  }),

  initialize: (data) => set((state) => ({ ...state, ...data })),

  reset: () => set({
    name: '',
    username: '',
    location: '',
    bio: '',
    gender: '',
    dateOfBirth: '',
    height: { value: 170, unit: 'cm' },
    weight: { value: 70, unit: 'kg' },
    activityTracker: '',
    interests: [],
    avatarUri: undefined,
    coverUri: undefined,
  }),
}));
