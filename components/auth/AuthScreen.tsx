import { ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ScrollViewProps,
  StyleProp,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors } from '@/theme/colors';

export type AuthScreenProps = {
  children: ReactNode;
  footer?: ReactNode;
  contentContainerStyle?: StyleProp<ViewStyle>;
  scrollViewProps?: ScrollViewProps;
};

export function AuthScreen({
  children,
  footer,
  contentContainerStyle,
  scrollViewProps,
}: AuthScreenProps) {
  const mergedScrollProps: ScrollViewProps = {
    keyboardShouldPersistTaps: 'handled',
    showsVerticalScrollIndicator: false,
    ...scrollViewProps,
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          {...mergedScrollProps}
          contentContainerStyle={[
            styles.scrollContent,
            contentContainerStyle,
            mergedScrollProps.contentContainerStyle,
          ]}
        >
          {children}
          {footer}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.black,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
  },
});
