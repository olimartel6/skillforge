import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { colors } from '../utils/theme';

interface StreakFlameProps {
  streak: number;
  size?: 'small' | 'large';
}

export function StreakFlame({ streak, size = 'small' }: StreakFlameProps) {
  const scale = useSharedValue(1);

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.08, { duration: 800, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const isLarge = size === 'large';
  const flameSize = isLarge ? 56 : 20;
  const textSize = isLarge ? 48 : 16;

  return (
    <View style={styles.container}>
      <Animated.View style={animatedStyle}>
        <Text style={{ fontSize: flameSize }}>🔥</Text>
      </Animated.View>
      {isLarge ? (
        <Text style={[styles.countLarge, { fontSize: textSize }]}>{streak}</Text>
      ) : (
        <Text style={[styles.countSmall, { fontSize: textSize }]}>{streak}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  countLarge: {
    fontWeight: '900',
    color: colors.primary,
    letterSpacing: -2,
  },
  countSmall: {
    fontWeight: '800',
    color: colors.primary,
  },
});
