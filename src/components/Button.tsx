import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, borderRadius, shadows } from '../utils/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function Button({ title, onPress, variant = 'primary', disabled, style, textStyle }: ButtonProps) {
  if (variant === 'primary') {
    return (
      <TouchableOpacity onPress={onPress} disabled={disabled} activeOpacity={0.8} style={style}>
        <LinearGradient
          colors={[colors.primary, colors.primaryDark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.primary, shadows.button, disabled && styles.disabled]}
        >
          <Text style={[styles.primaryText, textStyle]}>{title}</Text>
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  if (variant === 'secondary') {
    return (
      <TouchableOpacity onPress={onPress} disabled={disabled} activeOpacity={0.8}
        style={[styles.secondary, disabled && styles.disabled, style]}>
        <Text style={[styles.secondaryText, textStyle]}>{title}</Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity onPress={onPress} disabled={disabled} activeOpacity={0.7}
      style={[styles.ghost, disabled && styles.disabled, style]}>
      <Text style={[styles.ghostText, textStyle]}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  primary: { padding: 16, borderRadius: borderRadius.lg, alignItems: 'center' },
  primaryText: { color: '#fff', fontSize: 16, fontWeight: '700', letterSpacing: 0.3 },
  secondary: { padding: 14, borderRadius: borderRadius.lg, alignItems: 'center', backgroundColor: colors.glassBg, borderWidth: 1, borderColor: colors.glassBorder },
  secondaryText: { color: colors.textSecondary, fontSize: 14, fontWeight: '600' },
  ghost: { padding: 14, alignItems: 'center' },
  ghostText: { color: colors.secondary, fontSize: 14, fontWeight: '500' },
  disabled: { opacity: 0.5 },
});
