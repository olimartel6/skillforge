import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { colors, typography } from '../utils/theme';

interface TimerProps {
  remaining: number;
  style?: any;
}

export function Timer({ remaining, style }: TimerProps) {
  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const display = `${minutes}:${seconds.toString().padStart(2, '0')}`;

  const isUrgent = remaining <= 60;
  const textColor = isUrgent ? colors.primary : colors.textPrimary;

  return (
    <Text
      style={[
        styles.timer,
        { color: textColor },
        style,
      ]}
    >
      {display}
    </Text>
  );
}

const styles = StyleSheet.create({
  timer: {
    ...typography.timer,
    fontVariant: ['tabular-nums'],
    textAlign: 'center',
  },
});
