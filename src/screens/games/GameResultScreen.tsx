import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { AmbientGlow } from '../../components/AmbientGlow';
import { GlassCard } from '../../components/GlassCard';
import { Button } from '../../components/Button';
import { useGameStore } from '../../store/gameStore';
import { colors, spacing, typography, borderRadius, glowShadow } from '../../utils/theme';
const SCREEN_WIDTH = Dimensions.get('window').width;
const CONFETTI_COUNT = 30;

function ConfettiParticle({ delay, color }: { delay: number; color: string }) {
  const translateY = useRef(new Animated.Value(-50)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;
  const rotation = useRef(new Animated.Value(0)).current;
  const startX = Math.random() * SCREEN_WIDTH;

  useEffect(() => {
    const duration = 2000 + Math.random() * 1500;
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(translateY, { toValue: 600, duration, useNativeDriver: true }),
        Animated.timing(translateX, {
          toValue: (Math.random() - 0.5) * 150,
          duration,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, { toValue: 0, duration, useNativeDriver: true }),
        Animated.timing(rotation, { toValue: 1, duration, useNativeDriver: true }),
      ]).start();
    }, delay);
  }, [delay, translateY, translateX, opacity, rotation]);

  const rotate = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', `${Math.random() * 720}deg`],
  });

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        left: startX,
        top: -20,
        width: 8,
        height: 8,
        borderRadius: 2,
        backgroundColor: color,
        opacity,
        transform: [{ translateY }, { translateX }, { rotate }],
      }}
    />
  );
}

export function GameResultScreen({ navigation, route }: { navigation: any; route: any }) {
  const { xpEarned, correctCount, totalCount, maxCombo, lessonNumber, elapsed } =
    route.params;
  const { completeLesson } = useGameStore();

  const percentage = Math.round((correctCount / totalCount) * 100);
  const stars = percentage >= 90 ? 3 : percentage >= 60 ? 2 : percentage > 0 ? 1 : 0;
  const confettiColors = [colors.primary, colors.secondary, colors.success, '#FFD700', '#FF69B4'];

  // Animations
  const xpScale = useRef(new Animated.Value(0)).current;
  const starAnims = [
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
  ];
  const statsOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    completeLesson(lessonNumber);

    Animated.sequence([
      Animated.spring(xpScale, { toValue: 1, tension: 50, friction: 6, useNativeDriver: true }),
      Animated.stagger(200, starAnims.map((anim) =>
        Animated.spring(anim, { toValue: 1, tension: 80, friction: 5, useNativeDriver: true }),
      )),
      Animated.timing(statsOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleContinue = () => {
    (navigation as any).navigate('GamesHome');
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      {/* Confetti */}
      {stars >= 2 &&
        Array.from({ length: CONFETTI_COUNT }).map((_, i) => (
          <ConfettiParticle
            key={i}
            delay={i * 60}
            color={confettiColors[i % confettiColors.length]}
          />
        ))}

      <AmbientGlow color={colors.primary} size={350} opacity={0.08} top="15%" left="50%" />
      <AmbientGlow color={colors.secondary} size={250} opacity={0.05} top="60%" left="30%" />

      <View style={styles.content}>
        {/* Title */}
        <Text style={styles.title}>
          {percentage >= 90 ? 'Perfect!' : percentage >= 60 ? 'Well Done!' : 'Keep Trying!'}
        </Text>

        {/* XP */}
        <Animated.View style={[styles.xpContainer, { transform: [{ scale: xpScale }] }]}>
          <LinearGradient
            colors={[colors.primary, colors.primaryDark]}
            style={[styles.xpCircle, glowShadow(colors.primary)]}
          >
            <Text style={styles.xpPlus}>+</Text>
            <Text style={styles.xpNumber}>{xpEarned}</Text>
            <Text style={styles.xpLabel}>XP</Text>
          </LinearGradient>
        </Animated.View>

        {/* Stars */}
        <View style={styles.starsRow}>
          {[0, 1, 2].map((i) => (
            <Animated.View
              key={i}
              style={[
                styles.starWrapper,
                {
                  transform: [{ scale: starAnims[i] }],
                  opacity: starAnims[i],
                },
              ]}
            >
              <Text style={[styles.star, i < stars ? styles.starActive : styles.starInactive]}>
                &#9733;
              </Text>
            </Animated.View>
          ))}
        </View>

        {/* Stats */}
        <Animated.View style={[styles.statsContainer, { opacity: statsOpacity }]}>
          <GlassCard strong style={styles.statsCard}>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Accuracy</Text>
              <Text style={[styles.statValue, percentage >= 80 && { color: colors.success }]}>
                {percentage}%
              </Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Score</Text>
              <Text style={styles.statValue}>
                {correctCount}/{totalCount}
              </Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Max Combo</Text>
              <Text style={[styles.statValue, maxCombo >= 3 && { color: colors.primary }]}>
                {maxCombo}x
              </Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Time</Text>
              <Text style={styles.statValue}>{formatTime(elapsed)}</Text>
            </View>
          </GlassCard>
        </Animated.View>

        {/* Continue Button */}
        <Animated.View style={{ opacity: statsOpacity, width: '100%' }}>
          <Button title="Continue" onPress={handleContinue} style={styles.continueBtn} />
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  title: {
    ...typography.h1,
    color: colors.textPrimary,
    marginBottom: spacing['2xl'],
    fontSize: 32,
  },
  xpContainer: { marginBottom: spacing['2xl'] },
  xpCircle: {
    width: 130,
    height: 130,
    borderRadius: 65,
    alignItems: 'center',
    justifyContent: 'center',
  },
  xpPlus: { color: 'rgba(255,255,255,0.6)', fontSize: 20, fontWeight: '300', marginBottom: -4 },
  xpNumber: { color: '#fff', fontSize: 42, fontWeight: '900' },
  xpLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 14, fontWeight: '600', marginTop: -2 },

  starsRow: { flexDirection: 'row', gap: spacing.lg, marginBottom: spacing['3xl'] },
  starWrapper: {},
  star: { fontSize: 44 },
  starActive: { color: '#FFD700' },
  starInactive: { color: 'rgba(255,255,255,0.1)' },

  statsContainer: { width: '100%', marginBottom: spacing['3xl'] },
  statsCard: { padding: spacing.xl },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  statLabel: { ...typography.body, color: colors.textSecondary },
  statValue: { ...typography.h3, color: colors.textPrimary },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },

  continueBtn: { marginTop: spacing.sm },
});
