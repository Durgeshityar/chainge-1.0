import React, { useState } from 'react';
import {
    StyleSheet,
    Text,
    TextInput,
    TextInputProps,
    TouchableOpacity,
    View,
    ViewStyle,
} from 'react-native';
import { EyeIcon, EyeSlashIcon } from 'react-native-heroicons/outline';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerStyle?: ViewStyle;
  inputContainerStyle?: ViewStyle;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  leftIcon,
  rightIcon,
  containerStyle,
  inputContainerStyle,
  secureTextEntry,
  onFocus,
  onBlur,
  style,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(!secureTextEntry);

  const handleFocus = (e: any) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  const getBorderColor = () => {
    if (error) return colors.status.error;
    if (isFocused) return colors.primary;
    return colors.border.default;
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      
      <View
        style={[
          styles.inputContainer,
          { borderColor: getBorderColor() },
          inputContainerStyle,
        ]}
      >
        {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
        
        <TextInput
          style={[
            styles.input,
            leftIcon ? { paddingLeft: 0 } : {},
            rightIcon || secureTextEntry ? { paddingRight: 0 } : {},
            style,
          ]}
          placeholderTextColor={colors.text.secondary}
          secureTextEntry={secureTextEntry && !isPasswordVisible}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...props}
        />

        {secureTextEntry ? (
          <TouchableOpacity
            onPress={togglePasswordVisibility}
            style={styles.rightIcon}
          >
            {isPasswordVisible ? (
              <EyeSlashIcon size={20} color={colors.text.secondary} />
            ) : (
              <EyeIcon size={20} color={colors.text.secondary} />
            )}
          </TouchableOpacity>
        ) : (
          rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>
        )}
      </View>

      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    ...typography.presets.bodySmall,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
    marginLeft: spacing.xs,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.input,
    borderWidth: 1,
    borderRadius: 12,
    height: 56,
    paddingHorizontal: spacing.md,
  },
  input: {
    flex: 1,
    color: colors.text.primary,
    ...typography.presets.bodyMedium,
    height: '100%',
  },
  leftIcon: {
    marginRight: spacing.sm,
  },
  rightIcon: {
    marginLeft: spacing.sm,
  },
  errorText: {
    ...typography.presets.caption,
    color: colors.status.error,
    marginTop: spacing.xs,
    marginLeft: spacing.xs,
  },
});
