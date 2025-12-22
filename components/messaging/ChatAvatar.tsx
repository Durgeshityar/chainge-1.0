import { Avatar } from '@/components/ui/Avatar';
import { colors } from '@/theme/colors';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';

interface ChatAvatarProps {
  // We can pass full users to handle fallbacks (initials) if needed,
  // or just passed avatars if we want to stick strictly to the visual snippet.
  // Let's support both for flexibility.
  avatars: (string | null | undefined)[];
  names?: (string | null | undefined)[]; // For initials fallback
  size?: number;
  variant?: 'single' | 'matched' | 'group';
}

export function ChatAvatar({ avatars, names = [], size = 50, variant }: ChatAvatarProps) {
  const validAvatars = avatars;
  const count = validAvatars.length;

  // Auto-determine variant unless forced
  const resolvedVariant = variant || (count === 1 ? 'single' : count === 2 ? 'matched' : 'group');

  const overlap = size * 0.32;
  const singleSize = size * 1.2;
  const matchedSize = size * 0.78;
  const groupSize = size * 0.75; // Adjusted slightly for better fit
  const matchedGraphicWidth = matchedSize * 2 - overlap + 14; // pill padding and overlap
  const groupGraphicWidth = groupSize + overlap * 2;
  const graphicWidth =
    resolvedVariant === 'matched'
      ? matchedGraphicWidth
      : resolvedVariant === 'group'
      ? groupGraphicWidth
      : singleSize;
  const shellWidth = Math.max(size * 1.6, graphicWidth);
  const shellHeight = Math.max(size, groupSize);

  // 1) SINGLE AVATAR
  if (resolvedVariant === 'single') {
    return (
      <View style={[styles.shell, { width: shellWidth, minHeight: shellHeight }]}>
        <Avatar
          source={validAvatars[0] || undefined}
          name={names[0] || undefined}
          size={singleSize}
        />
      </View>
    );
  }

  // 2) MATCHED PILL
  if (resolvedVariant === 'matched') {
    // Check if we have avatars, else fallback
    const av1 = validAvatars[0];
    const av2 = validAvatars[1];

    return (
      <View style={[styles.shell, { width: shellWidth, minHeight: shellHeight }]}>
        <LinearGradient
          colors={['#9CF450', '#7F7BFF']} // User provided colors
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.pillBorder}
        >
          <View style={styles.pillInner}>
            {/* We use basic Image or Avatar. 
                User snippet used Image. 
                Using Avatar component might add extra borders/wrappers we don't want here 
                unless we explicitly turn them off. 
                Let's use Avatar with overrides to keep 'initials' fallback working if image missing.
            */}
            <View style={{ marginRight: -overlap, zIndex: 1 }}>
              <Avatar
                source={av1 || undefined}
                name={names[0] || undefined}
                size={matchedSize}
                // Override internal size-based styles if needed,
                // but Avatar component is rigid on sizes (sm/md/lg).
                // We might need to use Image directly if custom size is strict.
                // User snippet used custom px sizes.
                // Let's use simple Image for exact match to snippet if URL exists, else fallback.
              />
            </View>

            <View style={{ zIndex: 2 }}>
              <Avatar source={av2 || undefined} name={names[1] || undefined} size={matchedSize} />
            </View>
          </View>
        </LinearGradient>
      </View>
    );
  }

  // 3) GROUP (stacked)
  return (
    <View style={[styles.shell, { width: shellWidth, minHeight: shellHeight }]}>
      <View
        style={[
          styles.groupContainer,
          {
            width: groupSize + overlap * 2,
            height: groupSize,
          },
        ]}
      >
        {validAvatars.slice(0, 3).map((url, i) => (
          <View
            key={i}
            style={[
              styles.groupAvatarWrapper,
              {
                width: groupSize,
                height: groupSize,
                left: i * overlap,
                zIndex: 3 - i,
              },
            ]}
          >
            <Avatar
              source={url || undefined}
              name={names[i] || undefined}
              size={groupSize}
              borderColor={colors.background.input}
              borderWidth={2}
            />
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    justifyContent: 'center',
    alignItems: 'center',
  },

  /** MATCHED */
  pillBorder: {
    padding: 3,
    borderRadius: 999, // Pill shape
    // alignSelf: 'flex-start', // Removed to allow parent to center vertically
  },

  pillInner: {
    backgroundColor: '#000', // Or colors.background.charcoal
    borderRadius: 999,
    paddingHorizontal: 4, // Tight padding
    paddingVertical: 2,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
  },

  /** GROUP STACKED */
  groupContainer: {
    position: 'relative',
    marginRight: 12,
  },

  groupAvatarWrapper: {
    position: 'absolute',
    borderRadius: 999,
  },
});
