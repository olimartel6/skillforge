import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { AmbientGlow } from '../../components/AmbientGlow';
import { GlassCard } from '../../components/GlassCard';
import { useGameStore } from '../../store/gameStore';
import { useUserStore } from '../../store/userStore';
import { colors, spacing, typography, borderRadius, glowShadow } from '../../utils/theme';
const SCREEN_WIDTH = Dimensions.get('window').width;
const BUBBLE_SIZE = 64;
const PATH_AMPLITUDE = 50;
const TOTAL_LESSONS = 24;

export function GamesHomeScreen({ navigation }: { navigation: any }) {
  const { xp, dailyXp, dailyXpGoal, level, completedLessons, currentLesson, initialize } =
    useGameStore();
  const profile = useUserStore((s) => s.profile);
  const skillName = profile?.selected_skill_id || 'General';

  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.08, duration: 1200, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1200, useNativeDriver: true }),
      ]),
    ).start();
  }, [pulseAnim]);

  const dailyProgress = Math.min(dailyXp / dailyXpGoal, 1);

  const lessons = Array.from({ length: TOTAL_LESSONS }, (_, i) => {
    const num = i + 1;
    const completed = completedLessons.includes(num);
    const isCurrent = num === currentLesson;
    const locked = num > currentLesson;
    return { num, completed, isCurrent, locked };
  });

  const handleLessonPress = (lessonNum: number) => {
    (navigation as any).navigate('GameSession', { lessonNumber: lessonNum, skillName });
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <AmbientGlow color={colors.primary} size={300} opacity={0.06} top={-50} left="50%" />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Games</Text>
          <Text style={styles.subtitle}>{skillName}</Text>
        </View>

        <View style={styles.headerRight}>
          <GlassCard style={styles.xpBadge}>
            <Text style={styles.xpText}>{xp} XP</Text>
          </GlassCard>
          <View style={styles.levelBadge}>
            <LinearGradient
              colors={[colors.secondary, colors.secondaryDark]}
              style={styles.levelGradient}
            >
              <Text style={styles.levelText}>Lv.{level}</Text>
            </LinearGradient>
          </View>
        </View>
      </View>

      {/* Daily Progress */}
      <View style={styles.dailyContainer}>
        <View style={styles.dailyHeader}>
          <Text style={styles.dailyLabel}>DAILY GOAL</Text>
          <Text style={styles.dailyValue}>
            {dailyXp}/{dailyXpGoal} XP
          </Text>
        </View>
        <View style={styles.progressBar}>
          <LinearGradient
            colors={[colors.primary, colors.primaryDark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.progressFill, { width: `${dailyProgress * 100}%` }]}
          />
        </View>
      </View>

      {/* Lesson Path */}
      <ScrollView
        style={styles.pathScroll}
        contentContainerStyle={styles.pathContent}
        showsVerticalScrollIndicator={false}
      >
        {lessons.map((lesson, idx) => {
          const xOffset =
            Math.sin((idx / 3) * Math.PI) * PATH_AMPLITUDE;
          const isLast = idx === lessons.length - 1;

          return (
            <View key={lesson.num} style={styles.lessonRow}>
              {/* Connecting line */}
              {!isLast && (
                <View
                  style={[
                    styles.connector,
                    {
                      left: SCREEN_WIDTH / 2 + xOffset - 1,
                    },
                    lesson.locked && styles.connectorLocked,
                  ]}
                />
              )}

              {/* Bubble */}
              <TouchableOpacity
                onPress={() => handleLessonPress(lesson.num)}
                disabled={lesson.locked}
                activeOpacity={0.7}
                style={[styles.bubbleWrapper, { marginLeft: xOffset }]}
              >
                {lesson.isCurrent ? (
                  <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                    <LinearGradient
                      colors={[colors.primary, colors.primaryDark]}
                      style={[styles.bubble, styles.currentBubble, glowShadow(colors.primary)]}
                    >
                      <Text style={styles.bubbleNumber}>{lesson.num}</Text>
                    </LinearGradient>
                  </Animated.View>
                ) : lesson.completed ? (
                  <LinearGradient
                    colors={[colors.success, colors.successDark]}
                    style={[styles.bubble, glowShadow(colors.success)]}
                  >
                    <Text style={styles.checkmark}>&#10003;</Text>
                  </LinearGradient>
                ) : (
                  <View style={[styles.bubble, styles.lockedBubble]}>
                    <Text style={styles.lockedNumber}>{lesson.num}</Text>
                  </View>
                )}

                {/* Label */}
                {(lesson.isCurrent || lesson.completed) && (
                  <Text
                    style={[
                      styles.lessonLabel,
                      lesson.isCurrent && styles.currentLabel,
                    ]}
                  >
                    Lesson {lesson.num}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          );
        })}

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
  title: { ...typography.h1, color: colors.textPrimary },
  subtitle: { ...typography.bodySmall, color: colors.textSecondary, marginTop: 2 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  xpBadge: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  xpText: { ...typography.bodySmall, color: colors.primary, fontWeight: '700' },
  levelBadge: { borderRadius: borderRadius.full, overflow: 'hidden' },
  levelGradient: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  levelText: { color: '#fff', fontWeight: '800', fontSize: 12 },

  dailyContainer: { paddingHorizontal: spacing.xl, marginBottom: spacing.lg },
  dailyHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm },
  dailyLabel: { ...typography.label, color: colors.textSecondary },
  dailyValue: { ...typography.bodySmall, color: colors.textSecondary },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: 3 },

  pathScroll: { flex: 1 },
  pathContent: { alignItems: 'center', paddingTop: spacing.lg },
  lessonRow: {
    alignItems: 'center',
    marginBottom: spacing.sm,
    position: 'relative',
    width: '100%',
  },
  connector: {
    position: 'absolute',
    top: BUBBLE_SIZE - 4,
    width: 2,
    height: 36,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  connectorLocked: { borderStyle: 'dashed', backgroundColor: 'rgba(255,255,255,0.04)' },
  bubbleWrapper: { alignItems: 'center' },
  bubble: {
    width: BUBBLE_SIZE,
    height: BUBBLE_SIZE,
    borderRadius: BUBBLE_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  currentBubble: {},
  lockedBubble: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.08)',
    borderStyle: 'dashed',
  },
  bubbleNumber: { color: '#fff', fontWeight: '800', fontSize: 18 },
  checkmark: { color: '#fff', fontSize: 24, fontWeight: '700' },
  lockedNumber: { color: colors.textMuted, fontWeight: '700', fontSize: 16 },
  lessonLabel: { ...typography.caption, color: colors.textSecondary, marginTop: spacing.xs },
  currentLabel: { color: colors.primary, fontWeight: '700' },
  bottomSpacer: { height: 100 },
});
