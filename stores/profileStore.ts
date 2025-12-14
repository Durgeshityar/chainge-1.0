import { Post, User } from '@/types';
import { create } from 'zustand';

interface ProfileStats {
  posts: number;
  followers: number;
  following: number;
}

interface ProfileState {
  user: User | null;
  stats: ProfileStats;
  posts: Post[];
  isLoading: boolean;
  isCurrentUser: boolean;

  // Actions (State Setters)
  setUser: (user: User | null, isCurrentUser: boolean) => void;
  setStats: (stats: ProfileStats) => void;
  setPosts: (posts: Post[]) => void;
  setIsLoading: (isLoading: boolean) => void;
}

export const useProfileStore = create<ProfileState>((set) => ({
  user: null,
  stats: { posts: 0, followers: 0, following: 0 },
  posts: [],
  isLoading: false,
  isCurrentUser: true,

  setUser: (user, isCurrentUser) => set({ user, isCurrentUser }),
  setStats: (stats) => set({ stats }),
  setPosts: (posts) => set({ posts }),
  setIsLoading: (isLoading) => set({ isLoading }),
}));
