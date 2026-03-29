import React from 'react';
import { View, ViewProps } from 'react-native';
import { theme } from '../../theme/theme';

export default function Card({ style, children, ...rest }: ViewProps) {
  return (
    <View
      style={[
        {
          backgroundColor: theme.colors.card,
          borderRadius: theme.borderRadius.lg,
          padding: theme.spacing.lg,
          borderWidth: 1,
          borderColor: theme.colors.border,
          shadowColor: '#000',
          shadowOpacity: 0.05,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 3 },
          elevation: 2,
        },
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  );
}
