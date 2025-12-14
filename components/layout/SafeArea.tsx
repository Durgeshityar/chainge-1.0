import React from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import { SafeAreaView, Edge } from 'react-native-safe-area-context';
import { globalStyles } from '@/theme/styles';

interface SafeAreaProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  edges?: Edge[];
}

export const SafeArea = ({ 
  children, 
  style, 
  edges = ['top', 'bottom', 'left', 'right'] 
}: SafeAreaProps) => {
  return (
    <SafeAreaView edges={edges} style={[globalStyles.safeArea, style]}>
      {children}
    </SafeAreaView>
  );
};
