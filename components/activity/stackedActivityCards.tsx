import { CARD_MESH_VARIANTS } from '@/lib/constants';
import { useActivityStore } from '@/stores/activityStore';
import { useMemo } from 'react';
import { Text, View } from 'react-native';
import { ActivityCard } from './activityCard';
import { ActivityStack } from './activityStack';

export const StackedActivityCards = () => {
  const scheduledActivities = useActivityStore((state) => state.scheduledActivities);

  const formatTime = (date: Date | null | undefined) => {
    if (!date) return 'Scheduled';
    const d = new Date(date);
    const now = new Date();
    const isToday = d.getDate() === now.getDate() && d.getMonth() === now.getMonth();
    
    if (isToday) {
        return `Today at ${d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`;
    }
    return d.toLocaleDateString([], { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
  };

  const activityItems = useMemo(() => {
    if (scheduledActivities.length === 0) return [];
    
    const variantKeys = Object.keys(CARD_MESH_VARIANTS) as (keyof typeof CARD_MESH_VARIANTS)[];
    // Ensure the sequence always starts from 'yellow' when possible.
    const preferredStart: keyof typeof CARD_MESH_VARIANTS = 'yellow';
    const startIndex = variantKeys.indexOf(preferredStart);
    const orderedVariantKeys =
        startIndex >= 0
        ? [...variantKeys.slice(startIndex), ...variantKeys.slice(0, startIndex)]
        : variantKeys;

    return scheduledActivities.map((activity, idx) => ({
        id: activity.id,
        element: (
        <ActivityCard
            title={activity.activityType}
            time={formatTime(activity.scheduledAt)}
            location={activity.locationName || 'Unknown Location'}
            variant={orderedVariantKeys[idx % orderedVariantKeys.length]}
        />
        ),
    }));
  }, [scheduledActivities]);

  if (activityItems.length === 0) {
      return (
          <View style={{ padding: 20, alignItems: 'center' }}>
              <Text style={{ color: 'rgba(255,255,255,0.4)' }}>No upcoming activities</Text>
          </View>
      );
  }

  return <ActivityStack items={activityItems} />;
};
