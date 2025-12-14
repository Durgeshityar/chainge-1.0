// Centralized app-wide constants and enumerations
// Keep this file small and focused on immutable config (labels, option lists, etc.)

export const ONBOARDING_TOTAL_STEPS = 13;
export const ONBOARDING_MIN_INTERESTS = 3;

export const ONBOARDING_GENDER_OPTIONS = [
  'Male',
  'Female',
  'Non-binary',
  'Prefer not to say',
] as const;
export type OnboardingGenderOption = (typeof ONBOARDING_GENDER_OPTIONS)[number];

export const ONBOARDING_ACTIVITY_TRACKERS = [
  'Apple Watch',
  'Garmin',
  'Fitbit',
  'Whoop',
  'None',
] as const;
export type OnboardingActivityTracker = (typeof ONBOARDING_ACTIVITY_TRACKERS)[number];

export const HEIGHT_UNITS = ['cm', 'ft'] as const;
export type HeightUnit = (typeof HEIGHT_UNITS)[number];

export const WEIGHT_UNITS = ['kg', 'lbs'] as const;
export type WeightUnit = (typeof WEIGHT_UNITS)[number];

export type OnboardingInterestCategory = {
  title: string;
  items: string[];
};

export const ONBOARDING_INTEREST_CATEGORIES: OnboardingInterestCategory[] = [
  {
    title: 'Sports',
    items: [
      'Running',
      'Cycling',
      'Swimming',
      'Football',
      'Basketball',
      'Tennis',
      'Badminton',
      'Cricket',
    ],
  },
  {
    title: 'Fitness',
    items: ['Gym', 'Yoga', 'Pilates', 'Crossfit', 'Calisthenics', 'Zumba', 'Dance'],
  },
  {
    title: 'Outdoors',
    items: ['Hiking', 'Trekking', 'Camping', 'Rock Climbing', 'Surfing', 'Skating'],
  },
];

export const DEFAULT_AVATAR_URL = 'https://i.pravatar.cc/150?u=a042581f4e29026704d';
export const DEFAULT_COVER_URL = 'https://picsum.photos/800/600';

export const CARD_MESH_VARIANTS = {
  purple: {
    colors: [
      '#131118', // top-left (lighter edge)
      '#3A2356', // top-center
      '#1C132C', // top-right

      '#140F1A', // mid-left
      '#4B2A74', // **expanded glow center**
      '#201329', // mid-right (less dark)

      '#0F0F13', // bottom-left (not pure black)
      '#141417', // bottom-center
      '#0F0F13', // bottom-right
    ],
    points: [
      [0, 0],
      [0.5, 0],
      [1, 0],
      [0, 0.5],
      [0.5, 0.22],
      [1, 0.5], // **glow pulled up**
      [0, 1],
      [0.5, 1],
      [1, 1],
    ],
    accent: '#A78BFA', // Light purple for text/icons
    shadowColor: '#3A2356', // Matching shadow color
  },

  red: {
    colors: [
      '#1A0C0E',
      '#3E1823',
      '#240C10',

      '#170A0D',
      '#6A2230', // bigger glow
      '#1F0C12',

      '#111113',
      '#151416',
      '#111113',
    ],
    points: [
      [0, 0],
      [0.5, 0],
      [1, 0],
      [0, 0.5],
      [0.5, 0.24],
      [1, 0.5], // glow lifted
      [0, 1],
      [0.5, 1],
      [1, 1],
    ],
    accent: '#FF8BA7', // Soft red/pink for text
    shadowColor: '#6A2230', // Matching shadow color
  },

  yellow: {
    colors: [
      '#221C0E',
      '#3C3518',
      '#1F1A0B',

      '#1B150B',
      '#5A4F1E', // soft golden glow expanded
      '#241E0C',

      '#111113',
      '#151416',
      '#111113',
    ],
    points: [
      [0, 0],
      [0.5, 0],
      [1, 0],
      [0, 0.5],
      [0.5, 0.25],
      [1, 0.5], // glow higher
      [0, 1],
      [0.5, 1],
      [1, 1],
    ],
    accent: '#E3D786', // Soft gold for text
    shadowColor: '#5A4F1E', // Matching shadow color
  },

  teal: {
    colors: [
      '#0B1516',
      '#1C4446',
      '#102426',

      '#0B191A',
      '#2A7073', // glow point expanded
      '#112124',

      '#111214',
      '#151617',
      '#111214',
    ],
    points: [
      [0, 0],
      [0.5, 0],
      [1, 0],
      [0, 0.5],
      [0.5, 0.23],
      [1, 0.5], // glow pushed up
      [0, 1],
      [0.5, 1],
      [1, 1],
    ],
    accent: '#5EEAD4', // Teal accent
    shadowColor: '#2A7073', // Matching shadow color
  },
};
