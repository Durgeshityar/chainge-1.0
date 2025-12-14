import { useAdapters } from '@/hooks/useAdapter';
import { useProfileStore } from '@/stores/profileStore';
import { useCallback } from 'react';

export const useProfile = () => {
  const adapters = useAdapters();
  const store = useProfileStore();

  const fetchProfile = useCallback(async (userId?: string) => {
    const state = useProfileStore.getState();
    state.setIsLoading(true);

    try {
      const currentAuthUser = adapters.auth.getCurrentUser();
      const targetUserId = userId || currentAuthUser?.id;

      if (!targetUserId) {
        state.setUser(null, false);
        state.setIsLoading(false);
        return;
      }

      const user = await adapters.database.get('user', targetUserId);
      
      // Calculate stats (mock logic)
      const currentStats = useProfileStore.getState().stats; 
      const stats = {
        posts: currentStats.posts, // Keep existing post count if expected
        followers: user?.followerCount || 0,
        following: user?.followingCount || 0,
      };

      state.setUser(user, currentAuthUser?.id === targetUserId);
      state.setStats(stats);
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      useProfileStore.getState().setIsLoading(false);
    }
  }, [adapters]);

  const fetchPosts = useCallback(async (userId?: string) => {
    try {
      const currentAuthUser = adapters.auth.getCurrentUser();
      const targetUserId = userId || currentAuthUser?.id;

      if (!targetUserId) return;

      const posts = await adapters.database.query('post', [
        { field: 'userId', operator: 'eq', value: targetUserId }
      ]);
      
      // Update stats with real post count
      const state = useProfileStore.getState();
      state.setStats({
          ...state.stats,
          posts: posts.length
      });

      state.setPosts(posts);
    } catch (error) {
      console.error('Failed to fetch posts:', error);
    }
  }, [adapters]);
  
  const toggleFollow = useCallback(async () => {
       console.log('Toggle follow not implemented yet');
  }, []);

  return {
    ...store,
    fetchProfile,
    fetchPosts,
    toggleFollow
  };
};
