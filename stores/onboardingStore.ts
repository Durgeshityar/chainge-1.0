import { create } from 'zustand';

export interface OnboardingState {
  email: string;
  password: string;
  name: string;
  username: string;
  birthday: string;
  gender: string;
  height: { value: number; unit: 'cm' | 'ft' };
  weight: { value: number; unit: 'kg' | 'lbs' };
  activityTracker: string;
  interests: string[];
  coverImage: string | null;
  profilePicture: string | null;

  // Actions
  setCredentials: (email: string, password: string) => void;
  setName: (name: string) => void;
  setUsername: (username: string) => void;
  setBirthday: (birthday: string) => void;
  setGender: (gender: string) => void;
  setHeight: (value: number, unit: 'cm' | 'ft') => void;
  setWeight: (value: number, unit: 'kg' | 'lbs') => void;
  setActivityTracker: (tracker: string) => void;
  toggleInterest: (interest: string) => void;
  setCoverImage: (uri: string | null) => void;
  setProfilePicture: (uri: string | null) => void;
  reset: () => void;
}

export const useOnboardingStore = create<OnboardingState>((set) => ({
  email: '',
  password: '',
  name: '',
  username: '',
  birthday: '',
  gender: '',
  height: { value: 170, unit: 'cm' },
  weight: { value: 70, unit: 'kg' },
  activityTracker: '',
  interests: [],
  coverImage: null,
  profilePicture: null,

  setCredentials: (email, password) => set({ email, password }),
  setName: (name) => set({ name }),
  setUsername: (username) => set({ username }),
  setBirthday: (birthday) => set({ birthday }),
  setGender: (gender) => set({ gender }),
  setHeight: (value, unit) => set({ height: { value, unit } }),
  setWeight: (value, unit) => set({ weight: { value, unit } }),
  setActivityTracker: (activityTracker) => set({ activityTracker }),
  toggleInterest: (interest) => set((state) => {
    const exists = state.interests.includes(interest);
    if (exists) {
      return { interests: state.interests.filter((i) => i !== interest) };
    } else {
      return { interests: [...state.interests, interest] };
    }
  }),
  setCoverImage: (coverImage) => set({ coverImage }),
  setProfilePicture: (profilePicture) => set({ profilePicture }),
  reset: () =>
    set({
      email: '',
      password: '',
      name: '',
      username: '',
      birthday: '',
      gender: '',
      height: { value: 170, unit: 'cm' },
      weight: { value: 70, unit: 'kg' },
      activityTracker: '',
      interests: [],
      coverImage: null,
      profilePicture: null,
    }),
}));
