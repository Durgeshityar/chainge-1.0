import { Avatar } from '@/components/ui/Avatar';
import { useAuth } from '@/hooks/useAuth';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { MessageWithSender } from '@/types';
import { format } from 'date-fns';
import { Image } from 'expo-image';
import React, { useCallback, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { ChatBubbleLeftRightIcon, Squares2X2Icon } from 'react-native-heroicons/solid';
import Animated, {
  Extrapolate,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  type SharedValue,
} from 'react-native-reanimated';
import { MediaPreviewModal } from './MediaPreviewModal';
import { MessageReaction } from './MessageActionsSheet';

const STACK_WIDTH = 220;
const STACK_HEIGHT = 200;
const STACK_OFFSET = 8;
const SWIPE_THRESHOLD = 80;
const SCALE_FACTOR = 0.04;

const SPRING_CONFIG = {
  damping: 80,
  stiffness: 100,
  mass: 5,
  overshootClamping: false,
  restDisplacementThreshold: 0.1,
  restSpeedThreshold: 0.1,
};

interface MessageBubbleProps {
  message: MessageWithSender & {
    mediaUrls?: string[];
    reactions?: MessageReaction[];
    threadCount?: number;
  };
  showSenderName?: boolean;
  onLongPress?: (message: MessageWithSender) => void;
  onThreadPress?: (message: MessageWithSender) => void;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  showSenderName = false,
  onLongPress,
  onThreadPress,
}) => {
  const { user } = useAuth();
  const [modalVisible, setModalVisible] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const isMe = user?.id === message.senderId;
  const time = new Date(message.createdAt);
  const mediaUrls = message.mediaUrls || [];
  const mediaCount = mediaUrls.length;
  const reactions = message.reactions || [];
  const threadCount = message.threadCount || 0;

  const handleLongPress = useCallback(() => {
    onLongPress?.(message);
  }, [message, onLongPress]);

  const handleThreadPress = useCallback(() => {
    onThreadPress?.(message);
  }, [message, onThreadPress]);

  const dragX = useSharedValue(0);
  const animatedIndex = useSharedValue(0);

  const handleNextMedia = useCallback(() => {
    setCurrentIndex((prev) => prev + 1);
    animatedIndex.value = withSpring(currentIndex + 1, SPRING_CONFIG);
  }, [currentIndex, animatedIndex]);

  const gesture = Gesture.Pan()
    .onChange((event) => {
      // Allow horizontal swipe with slight resistance
      dragX.value = event.translationX;
    })
    .onEnd((event) => {
      const shouldDismiss = Math.abs(dragX.value) > SWIPE_THRESHOLD || Math.abs(event.velocityX) > 500;

      if (shouldDismiss) {
        runOnJS(handleNextMedia)();
        // Reset drag - the animation will handle the card movement
        dragX.value = withSpring(0, SPRING_CONFIG);
      } else {
        dragX.value = withSpring(0, SPRING_CONFIG);
      }
    });

  const renderMediaStack = () => {
    if (mediaCount === 0) return null;

    return (
      <View style={[
        styles.mediaSection,
        isMe ? styles.mediaSectionMe : styles.mediaSectionOther
      ]}>
        {mediaCount > 1 && (
          <View style={[
            styles.mediaHeader,
            isMe ? styles.mediaHeaderMe : styles.mediaHeaderOther
          ]}>
            <View style={styles.itemCountBadge}>
              <Squares2X2Icon size={12} color={colors.primary} />
              <Text style={styles.itemCountText}>{mediaCount} Items</Text>
            </View>
          </View>
        )}

        <GestureDetector gesture={gesture}>
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => setModalVisible(true)}
            style={styles.stackContainer}
          >
            {/* Visual stack logic matching activityStack - render back-to-front */}
            {[currentIndex - 1, currentIndex, currentIndex + 1, currentIndex + 2].reverse().map((i) => {
              const displayIdx = ((i % mediaCount) + mediaCount) % mediaCount;
              const url = mediaUrls[displayIdx];
              if (!url) return null;

              return (
                <MediaStackItem
                  key={`${displayIdx}-${i}`}
                  url={url}
                  actualIndex={i}
                  animatedIndex={animatedIndex}
                  dragX={dragX}
                />
              );
            })}
          </TouchableOpacity>
        </GestureDetector>
      </View>
    );
  };

  // Render reactions row
  const renderReactions = () => {
    if (reactions.length === 0) return null;

    return (
      <View style={[
        styles.reactionsContainer,
        isMe ? styles.reactionsContainerMe : styles.reactionsContainerOther
      ]}>
        {reactions.map((reaction, index) => (
          <View key={index} style={styles.reactionBadge}>
            <Text style={styles.reactionEmoji}>{reaction.emoji}</Text>
            {reaction.count > 1 && (
              <Text style={styles.reactionCount}>{reaction.count}</Text>
            )}
          </View>
        ))}
      </View>
    );
  };

  // Render thread indicator
  const renderThreadIndicator = () => {
    if (threadCount === 0) return null;

    return (
      <TouchableOpacity
        style={[
          styles.threadIndicator,
          isMe ? styles.threadIndicatorMe : styles.threadIndicatorOther
        ]}
        onPress={handleThreadPress}
        activeOpacity={0.7}
      >
        <ChatBubbleLeftRightIcon size={12} color={colors.primary} />
        <Text style={styles.threadCount}>
          {threadCount} {threadCount === 1 ? 'reply' : 'replies'}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <>
      <View style={[
        styles.outerContainer,
        isMe ? styles.outerContainerMe : styles.outerContainerOther
      ]}>
        {!isMe && (
          <View style={styles.avatarContainer}>
            <Avatar
              source={message.sender?.avatarUrl || undefined}
              name={message.sender?.name || message.sender?.username}
              size="sm"
            />
          </View>
        )}

        <TouchableOpacity
          style={[
            styles.contentWrapper,
            isMe ? styles.contentWrapperMe : styles.contentWrapperOther
          ]}
          onLongPress={handleLongPress}
          delayLongPress={300}
          activeOpacity={0.9}
        >
          {showSenderName && !isMe && message.sender && (
            <Text style={styles.senderName}>
              {message.sender.name || message.sender.username}
            </Text>
          )}

          {renderMediaStack()}

          {message.content ? (
            <View style={[
              styles.bubble,
              isMe ? styles.bubbleMe : styles.bubbleOther
            ]}>
              <Text style={[
                styles.content,
                isMe ? styles.contentMe : styles.contentOther
              ]}>
                {message.content}
              </Text>
              <Text style={[
                styles.time,
                isMe ? styles.timeMe : styles.timeOther
              ]}>
                {format(time, 'h:mm a')}
              </Text>
            </View>
          ) : (
            <Text style={[
              styles.timeStandalone,
              isMe ? styles.timeMe : styles.timeOther
            ]}>
              {format(time, 'h:mm a')}
            </Text>
          )}

          {renderReactions()}
          {renderThreadIndicator()}
        </TouchableOpacity>

      </View>

      <MediaPreviewModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        mediaUrls={mediaUrls}
        initialIndex={mediaCount > 0 ? ((currentIndex % mediaCount) + mediaCount) % mediaCount : 0}
      />
    </>
  );
};

interface MediaStackItemProps {
  url: string;
  actualIndex: number;
  animatedIndex: SharedValue<number>;
  dragX: SharedValue<number>;
}

const MediaStackItem: React.FC<MediaStackItemProps> = ({
  url,
  actualIndex,
  animatedIndex,
  dragX,
}) => {
  const animatedStyle = useAnimatedStyle(() => {
    const relativeIndex = actualIndex - animatedIndex.value;

    // 1. TRANSLATION X - stack offset effect (cards offset to right behind)
    const translateX = interpolate(
      relativeIndex,
      [-1, 0, 1, 2, 3],
      [
        -STACK_OFFSET * 2, // Index -1: Moves LEFT to the back of the stack
        0,                  // Index 0: Active Center
        STACK_OFFSET,       // Index 1: Behind (offset right)
        STACK_OFFSET * 2,   // Index 2: Further Behind
        STACK_OFFSET * 3,
      ],
      Extrapolate.CLAMP,
    );

    // 2. TRANSLATION Y - slight vertical offset for depth
    const translateY = interpolate(
      relativeIndex,
      [-1, 0, 1, 2],
      [-STACK_OFFSET, 0, -STACK_OFFSET * 0.5, -STACK_OFFSET],
      Extrapolate.CLAMP,
    );

    // 3. SCALE - cards behind are slightly smaller
    const scale = interpolate(
      relativeIndex,
      [-1, 0, 1, 2],
      [
        1 - SCALE_FACTOR * 2, // Index -1: Shrinks to look like it's in back
        1,                     // Index 0: Full Size
        1 - SCALE_FACTOR,      // Index 1: Smaller
        1 - SCALE_FACTOR * 2,  // Index 2: Smallest
      ],
      Extrapolate.CLAMP,
    );

    // 4. ROTATION - slight rotation for visual interest
    const rotation = interpolate(
      relativeIndex,
      [-1, 0, 1, 2],
      [-3, 0, 2, 4],
      Extrapolate.CLAMP,
    );

    // 5. Z-INDEX - Critical: must drop when card moves to back
    const zIndex = interpolate(
      relativeIndex,
      [-1, -0.5, 0, 1],
      [0, 1, 100, 90],
      Extrapolate.CLAMP,
    );

    // 6. OPACITY - fade out when moving to back
    const opacity = interpolate(
      relativeIndex,
      [-2, -1, 0, 1],
      [0, 1, 1, 1],
      Extrapolate.CLAMP,
    );

    // 7. DRAG INFLUENCE - gradually reduce as card transitions
    const dragStrength = interpolate(
      relativeIndex,
      [-0.5, 0, 0.5],
      [0, 1, 0],
      Extrapolate.CLAMP,
    );

    return {
      transform: [
        { translateX: translateX + dragX.value * dragStrength },
        { translateY },
        { rotate: `${rotation + (dragX.value * dragStrength) / 15}deg` },
        { scale },
      ],
      zIndex: Math.round(zIndex),
      opacity,
    };
  });

  return (
    <Animated.View style={[styles.stackItem, animatedStyle]}>
      <Image
        source={{ uri: url }}
        style={styles.mediaImage}
        contentFit="cover"
        transition={200}
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginVertical: 4,
    paddingHorizontal: 12,
  },
  outerContainerMe: {
    justifyContent: 'flex-end',
  },
  outerContainerOther: {
    justifyContent: 'flex-start',
  },
  avatarContainer: {
    marginBottom: 2,
  },
  contentWrapper: {
    maxWidth: '80%',
  },
  contentWrapperMe: {
    marginRight: 6,
    alignItems: 'flex-end',
  },
  contentWrapperOther: {
    marginLeft: 6,
    alignItems: 'flex-start',
  },
  senderName: {
    ...typography.presets.caption,
    color: colors.text.tertiary,
    marginBottom: 4,
    marginLeft: 4,
  },
  mediaSection: {
    marginBottom: 4,
    width: STACK_WIDTH + STACK_OFFSET * 3 + 10,
  },
  mediaSectionMe: {
    alignItems: 'flex-end',
  },
  mediaSectionOther: {
    alignItems: 'flex-start',
  },
  mediaHeader: {
    flexDirection: 'row',
    marginBottom: 4,
    width: STACK_WIDTH + STACK_OFFSET * 3,
    zIndex: 200, // Ensure badge is above stack
  },
  mediaHeaderMe: {
    justifyContent: 'flex-end',
  },
  mediaHeaderOther: {
    justifyContent: 'flex-start',
  },
  itemCountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(152, 255, 0, 0.15)', // Primary neon green with opacity
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
    borderWidth: 1,
    borderColor: 'rgba(152, 255, 0, 0.2)',
  },
  itemCountText: {
    ...typography.presets.labelSmall,
    color: colors.primary,
    fontSize: 10,
    fontWeight: '700',
  },
  stackContainer: {
    width: STACK_WIDTH + STACK_OFFSET * 3, // Extra width for offset cards
    height: STACK_HEIGHT + STACK_OFFSET * 2, // Extra height for visual depth
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stackItem: {
    position: 'absolute',
    width: STACK_WIDTH,
    height: STACK_HEIGHT,
    borderRadius: 16,
    backgroundColor: colors.background.charcoal,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  mediaImage: {
    width: '100%',
    height: '100%',
  },
  bubble: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    maxWidth: '100%',
  },
  bubbleMe: {
    backgroundColor: '#2E2E22', // Dark card background
    borderBottomRightRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  bubbleOther: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderBottomLeftRadius: 4,
  },
  content: {
    ...typography.presets.bodySmall,
    fontSize: 15, // Slightly reduced
    lineHeight: 21,
    marginBottom: 4,
  },
  contentMe: {
    color: '#FFFFFF',
  },
  contentOther: {
    color: colors.text.primary,
  },
  time: {
    ...typography.presets.caption,
    fontSize: 9, // Reduced from 10
    alignSelf: 'flex-end',
    opacity: 0.8,
  },
  timeStandalone: {
    ...typography.presets.caption,
    fontSize: 9, // Reduced from 10
    marginTop: 2,
    paddingHorizontal: 4,
    opacity: 0.8,
  },
  timeMe: {
    color: colors.text.secondary, // More subtle
  },
  timeOther: {
    color: colors.text.tertiary,
  },
  // Reactions styles
  reactionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 6,
  },
  reactionsContainerMe: {
    justifyContent: 'flex-end',
  },
  reactionsContainerOther: {
    justifyContent: 'flex-start',
  },
  reactionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  reactionEmoji: {
    fontSize: 14,
  },
  reactionCount: {
    ...typography.presets.caption,
    color: colors.text.secondary,
    fontSize: 11,
  },
  // Thread indicator styles
  threadIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 4,
  },
  threadIndicatorMe: {
    justifyContent: 'flex-end',
  },
  threadIndicatorOther: {
    justifyContent: 'flex-start',
  },
  threadCount: {
    ...typography.presets.caption,
    color: colors.primary,
    fontSize: 11,
    fontWeight: '500',
  },
});
