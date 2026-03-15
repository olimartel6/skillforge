import React from 'react';
import { View, StyleSheet, ViewProps } from 'react-native';
import { colors, borderRadius } from '../utils/theme';
// Note: expo-blur BlurView can be added for true blur effect but
// semi-transparent backgrounds are used for MVP performance

interface GlassCardProps extends ViewProps {
  strong?: boolean;
  glowColor?: string;
  children: React.ReactNode;
}

export function GlassCard({ strong, glowColor, style, children, ...props }: GlassCardProps) {
  const bgColor = strong ? colors.glassStrongBg : colors.glassBg;
  const borderColor = strong ? colors.glassStrongBorder : colors.glassBorder;
  const glowShadow = glowColor
    ? { shadowColor: glowColor, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 20, elevation: 8 }
    : {};

  return (
    <View
      style={[styles.container, { backgroundColor: bgColor, borderColor }, glowShadow, style]}
      {...props}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { borderWidth: 1, borderRadius: borderRadius.xl, overflow: 'hidden' },
});
