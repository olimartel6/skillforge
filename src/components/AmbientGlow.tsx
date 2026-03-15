import React from 'react';
import { View, StyleSheet, DimensionValue } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface AmbientGlowProps {
  color: string;
  size?: number;
  opacity?: number;
  top?: DimensionValue;
  left?: DimensionValue;
}

export function AmbientGlow({ color, size = 200, opacity = 0.1, top = '50%', left = '50%' }: AmbientGlowProps) {
  return (
    <View
      pointerEvents="none"
      style={[styles.container, {
        width: size, height: size, top, left,
        transform: [{ translateX: -size / 2 }, { translateY: -size / 2 }],
      }]}
    >
      <LinearGradient
        colors={[color, 'transparent']}
        style={[styles.gradient, { opacity }]}
        start={{ x: 0.5, y: 0.5 }}
        end={{ x: 0.5, y: 0 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { position: 'absolute', borderRadius: 9999 },
  gradient: { width: '100%', height: '100%', borderRadius: 9999 },
});
