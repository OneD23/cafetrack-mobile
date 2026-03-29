import React from 'react';
import { Text, TouchableOpacity, TouchableOpacityProps } from 'react-native';
import { theme } from '../../theme/theme';

type ButtonVariant = 'primary' | 'secondary' | 'outline';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
}

export default function Button({ title, onPress, variant = 'primary', disabled = false, ...rest }: ButtonProps) {
  const backgroundColor =
    variant === 'primary'
      ? theme.colors.primary
      : variant === 'secondary'
      ? theme.colors.primaryDark
      : theme.colors.card;

  const textColor = variant === 'outline' ? theme.colors.textPrimary : '#FFFFFF';

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={{
        backgroundColor,
        borderRadius: theme.borderRadius.md,
        borderWidth: variant === 'outline' ? 1 : 0,
        borderColor: theme.colors.border,
        paddingVertical: theme.spacing.lg,
        alignItems: 'center',
        opacity: disabled ? 0.6 : 1,
      }}
      {...rest}
    >
      <Text style={{ color: textColor, fontWeight: '700' }}>{title}</Text>
    </TouchableOpacity>
  );
}
