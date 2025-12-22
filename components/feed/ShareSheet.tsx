import { BottomSheet, BottomSheetRef } from '@/components/ui/BottomSheet';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { forwardRef, useImperativeHandle, useRef } from 'react';
import { Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import {
  ArrowUpOnSquareIcon,
  ChatBubbleLeftIcon,
  ClipboardIcon,
  XMarkIcon,
} from 'react-native-heroicons/outline';

export interface ShareSheetHandle {
  open: () => void;
  close: () => void;
}

interface ShareSheetProps {
  onClose?: () => void;
  onCopy?: () => Promise<void> | void;
  onShareToChat?: () => Promise<void> | void;
  shareUrl?: string;
}

export const ShareSheet = forwardRef<ShareSheetHandle, ShareSheetProps>(
  ({ onClose, onCopy, onShareToChat, shareUrl }, ref) => {
    const sheetRef = useRef<BottomSheetRef>(null);

    const open = () => sheetRef.current?.scrollTo(-420);
    const close = () => sheetRef.current?.scrollTo(0);

    useImperativeHandle(ref, () => ({ open, close }), []);

    const handleSystemShare = async () => {
      if (shareUrl) {
        await Linking.openURL(`sms:&body=${encodeURIComponent(shareUrl)}`);
      }
      onClose?.();
      close();
    };

    return (
      <BottomSheet ref={sheetRef} snapPoints={['45%']} onClose={onClose}>
        <View style={styles.sheetContent}>
          <View style={styles.header}>
            <TouchableOpacity onPress={close} hitSlop={10}>
              <XMarkIcon size={20} color={colors.text.secondary} />
            </TouchableOpacity>
            <Text style={styles.title}>Share</Text>
            <View style={{ width: 20 }} />
          </View>

          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.row}
              onPress={async () => {
                await onCopy?.();
                close();
              }}
            >
              <ClipboardIcon size={22} color={colors.text.primary} />
              <Text style={styles.actionText}>Copy link</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.row}
              onPress={async () => {
                await onShareToChat?.();
                close();
              }}
            >
              <ChatBubbleLeftIcon size={22} color={colors.text.primary} />
              <Text style={styles.actionText}>Share to chat</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.row} onPress={handleSystemShare}>
              <ArrowUpOnSquareIcon size={22} color={colors.text.primary} />
              <Text style={styles.actionText}>System share</Text>
            </TouchableOpacity>
          </View>
        </View>
      </BottomSheet>
    );
  },
);

ShareSheet.displayName = 'ShareSheet';

const styles = StyleSheet.create({
  sheetContent: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  title: {
    color: colors.text.primary,
    fontFamily: typography.fonts.medium,
    fontSize: typography.sizes.lg,
  },
  actions: {
    marginTop: spacing.xl,
    gap: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  actionText: {
    color: colors.text.primary,
    fontFamily: typography.fonts.medium,
    fontSize: typography.sizes.md,
  },
});
