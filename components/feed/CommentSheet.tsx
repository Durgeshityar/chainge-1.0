import { Avatar } from '@/components/ui/Avatar';
import { BottomSheet, BottomSheetRef } from '@/components/ui/BottomSheet';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { PostComment } from '@/types';
import { forwardRef, useImperativeHandle, useMemo, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    RefreshControl,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { XMarkIcon } from 'react-native-heroicons/outline';
import { ArrowUpIcon } from 'react-native-heroicons/solid';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export interface CommentSheetHandle {
  open: () => void;
  close: () => void;
}

interface CommentSheetProps {
  postTitle?: string;
  comments: (PostComment & { user?: { name?: string | null; avatarUrl?: string | null } })[];
  isLoading?: boolean;
  onClose?: () => void;
  onSend?: (message: string) => Promise<void> | void;
  onRefresh?: () => Promise<void> | void;
  isRefreshing?: boolean;
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const SNAP_POINT = -SCREEN_HEIGHT * 0.85;

export const CommentSheet = forwardRef<CommentSheetHandle, CommentSheetProps>(
  ({ postTitle, comments, isLoading = false, isRefreshing = false, onClose, onSend, onRefresh }, ref) => {
    const insets = useSafeAreaInsets();
    const bottomSheetRef = useRef<BottomSheetRef>(null);
    const [message, setMessage] = useState('');

    const title = useMemo(() => postTitle ?? 'Comments', [postTitle]);

    const open = () => bottomSheetRef.current?.scrollTo(SNAP_POINT);
    const close = () => bottomSheetRef.current?.scrollTo(0);

    useImperativeHandle(ref, () => ({ open, close }), []);

    const handleSend = async () => {
      if (!message.trim()) return;
      await onSend?.(message.trim());
      setMessage('');
    };

    return (
      <BottomSheet
        ref={bottomSheetRef}
        snapPoints={[`${(Math.abs(SNAP_POINT) / SCREEN_HEIGHT) * 100}%`]}
        onClose={onClose}
      >
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 12 : 0}
        >
          <View style={styles.sheetContent}>
            <View style={styles.header}>
              <Pressable onPress={close} hitSlop={10}>
                <XMarkIcon size={20} color={colors.text.secondary} />
              </Pressable>
              <View style={styles.titleWrap}>
                <View style={styles.commentPill}>
                  <Text style={styles.commentPillText}>{comments.length}</Text>
                </View>
                <Text style={styles.titleText}>{title}</Text>
              </View>
              <View style={{ width: 24 }} />
            </View>

            {isLoading ? (
              <View style={styles.loadingWrap}>
                <ActivityIndicator color={colors.primary} />
              </View>
            ) : (
              <>
                <View style={styles.inputContainer}>
                  <View style={styles.inputRow}>
                    <TextInput
                      value={message}
                      onChangeText={setMessage}
                      placeholder="Add comments"
                      placeholderTextColor={colors.text.tertiary}
                      style={styles.input}
                    />
                    <TouchableOpacity
                      style={[styles.sendButton, !message.trim() && styles.sendButtonDisabled]}
                      onPress={handleSend}
                      disabled={!message.trim()}
                    >
                      <ArrowUpIcon size={20} color={colors.text.inverse} strokeWidth={2.5} />
                    </TouchableOpacity>
                  </View>
                </View>

                <FlatList
                  data={comments}
                  keyExtractor={(item) => item.id}
                  style={styles.list}
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                  refreshControl={
                    onRefresh ? (
                      <RefreshControl
                        refreshing={isRefreshing}
                        onRefresh={onRefresh}
                        tintColor={colors.primary}
                        colors={[colors.primary]}
                      />
                    ) : undefined
                  }
                  renderItem={({ item }) => (
                    <View style={styles.commentRow}>
                      <Avatar
                        size={36}
                        source={item.user?.avatarUrl ?? undefined}
                        name={item.user?.name ?? ''}
                      />
                      <View style={styles.commentBody}>
                        <Text style={styles.commentAuthor}>{item.user?.name ?? 'User'}</Text>
                        <Text style={styles.commentText}>{item.content}</Text>
                      </View>
                    </View>
                  )}
                  ListEmptyComponent={() => (
                    <View style={styles.emptyState}>
                      <Text style={styles.emptyText}>Be the first to comment.</Text>
                    </View>
                  )}
                  contentContainerStyle={{ paddingBottom: spacing.massive }}
                />
              </>
            )}
          </View>
        </KeyboardAvoidingView>
      </BottomSheet>
    );
  },
);

CommentSheet.displayName = 'CommentSheet';

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  sheetContent: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
  },
  titleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  commentPill: {
    backgroundColor: colors.background.card, // Was #243028
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 12,
  },
  commentPillText: {
    color: colors.text.primary,
    fontFamily: typography.fonts.medium,
    fontSize: typography.sizes.sm,
  },
  titleText: {
    color: colors.text.primary,
    fontFamily: typography.fonts.medium,
    fontSize: typography.sizes.lg,
  },
  list: {
    flex: 1,
  },
  commentRow: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  commentBody: {
    flex: 1,
  },
  commentAuthor: {
    color: colors.text.primary,
    fontFamily: typography.fonts.medium,
    fontSize: typography.sizes.sm,
    marginBottom: spacing.xs,
  },
  commentText: {
    color: colors.text.primary,
    fontFamily: typography.fonts.regular,
    fontSize: typography.sizes.md,
    lineHeight: 20,
  },
  loadingWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: {
    paddingVertical: spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    color: colors.text.secondary,
    fontFamily: typography.fonts.regular,
    fontSize: typography.sizes.sm,
  },
  inputContainer: {
    paddingBottom: spacing.md,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.input, // Was #1E1E1E
    borderRadius: 30, // Pill shape
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border.default, // Was #333
  },
  input: {
    flex: 1,
    color: colors.text.primary,
    fontFamily: typography.fonts.medium,
    fontSize: typography.sizes.md,
    paddingVertical: spacing.sm,
  },
  sendButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
    backgroundColor: colors.text.disabled,
  },
  sendText: {
    color: colors.text.inverse,
    fontFamily: typography.fonts.bold,
    fontSize: typography.sizes.md,
  },
});
