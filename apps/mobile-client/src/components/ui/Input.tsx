import React from 'react';
import { TextInput, TextInputProps } from 'react-native';
import { theme } from '../../theme/theme';

export default function Input(props: TextInputProps) {
  return (
    <TextInput
      placeholderTextColor={theme.colors.textSecondary}
      style={{
        backgroundColor: theme.colors.card,
        borderColor: theme.colors.border,
        borderWidth: 1,
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 12,
        color: theme.colors.textPrimary,
      }}
      {...props}
    />
  );
}
