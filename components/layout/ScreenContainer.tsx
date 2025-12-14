import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import React from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { Edge } from 'react-native-safe-area-context';
import { SafeArea } from './SafeArea';

interface ScreenContainerProps {
  children: React.ReactNode;
  scrollable?: boolean;
  safeAreaEdges?: Edge[];
  keyboardAvoiding?: boolean;
  keyboardOffset?: number;
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
}

export const ScreenContainer = ({
  children,
  scrollable = false,
  safeAreaEdges,
  keyboardAvoiding = false,
  keyboardOffset = 0,
  style,
  contentContainerStyle,
}: ScreenContainerProps) => {
  const Wrapper = keyboardAvoiding ? KeyboardAvoidingView : View;
  const wrapperProps = keyboardAvoiding 
    ? { 
        behavior: Platform.OS === 'ios' ? 'padding' : 'height',
        keyboardVerticalOffset: keyboardOffset,
        style: { flex: 1 } 
      } as React.ComponentProps<typeof KeyboardAvoidingView>
    : { style: { flex: 1 } };

  const Content = scrollable ? ScrollView : View;
  const contentProps = scrollable
    ? {
        contentContainerStyle: [localStyles.contentContainer, contentContainerStyle],
        style: { flex: 1 },
        showsVerticalScrollIndicator: false,
      }
    : {
        style: [localStyles.container, localStyles.contentContainer, style],
      };

  return (
    <SafeArea edges={safeAreaEdges} style={[localStyles.container, style]}>
      <Wrapper {...wrapperProps}>
        <Content {...contentProps}>
          {children}
        </Content>
      </Wrapper>
    </SafeArea>
  );
};

const localStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.black,
  },
  contentContainer: {
    paddingHorizontal: spacing.md,
  },
});
