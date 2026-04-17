import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Speech from 'expo-speech';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, spacing, typography, borderRadius } from '../utils/theme';
import { AUDIO_INTROS } from '../utils/audioIntros';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const NUM_BARS = 5;
const BAR_ANIM_DURATION = 400;

interface AudioLessonCardProps {
  skillName: string;
}

export function AudioLessonCard({ skillName }: AudioLessonCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [alreadyHeard, setAlreadyHeard] = useState(false);
  const barAnims = useRef<Animated.Value[]>(
    Array.from({ length: NUM_BARS }, () => new Animated.Value(0.25)),
  ).current;
  const barAnimRef = useRef<Animated.CompositeAnimation | null>(null);

  const introText = AUDIO_INTROS[skillName];

  // Check if already heard today
  useEffect(() => {
    (async () => {
      try {
        const today = new Date().toISOString().split('T')[0];
        const key = `audio_intro_${skillName}_${today}`;
        const heard = await AsyncStorage.getItem(key);
        setAlreadyHeard(heard === '1');
      } catch {}
    })();
  }, [skillName]);

  // Clean up speech on unmount
  useEffect(() => {
    return () => {
      Speech.stop();
      barAnimRef.current?.stop();
    };
  }, []);

  const startBarAnimation = useCallback(() => {
    const animations = barAnims.map((anim, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim, {
            toValue: 0.6 + Math.random() * 0.4,
            duration: BAR_ANIM_DURATION + i * 80,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0.15 + Math.random() * 0.2,
            duration: BAR_ANIM_DURATION + i * 60,
            useNativeDriver: true,
          }),
        ]),
      ),
    );
    barAnimRef.current = Animated.parallel(animations);
    barAnimRef.current.start();
  }, [barAnims]);

  const stopBarAnimation = useCallback(() => {
    barAnimRef.current?.stop();
    barAnims.forEach((anim) => {
      Animated.timing(anim, { toValue: 0.25, duration: 200, useNativeDriver: true }).start();
    });
  }, [barAnims]);

  const markAsHeard = useCallback(async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const key = `audio_intro_${skillName}_${today}`;
      await AsyncStorage.setItem(key, '1');
      setAlreadyHeard(true);
    } catch {}
  }, [skillName]);

  const handlePlay = useCallback(() => {
    if (!introText) return;

    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(true);
    setPlaying(true);
    startBarAnimation();

    Speech.speak(introText, {
      language: 'en-US',
      rate: 0.95,
      pitch: 1.0,
      onDone: () => {
        setPlaying(false);
        stopBarAnimation();
        markAsHeard();
        setTimeout(() => {
          LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
          setExpanded(false);
        }, 1200);
      },
      onStopped: () => {
        setPlaying(false);
        stopBarAnimation();
      },
      onError: () => {
        setPlaying(false);
        stopBarAnimation();
      },
    });
  }, [introText, startBarAnimation, stopBarAnimation, markAsHeard]);

  const handleStop = useCallback(() => {
    Speech.stop();
    setPlaying(false);
    stopBarAnimation();
    markAsHeard();
  }, [stopBarAnimation, markAsHeard]);

  const handleToggle = useCallback(() => {
    if (playing) {
      handleStop();
    } else {
      handlePlay();
    }
  }, [playing, handlePlay, handleStop]);

  // Don't render if no intro text for this skill or already heard today
  if (!introText || alreadyHeard) return null;

  return (
    <TouchableOpacity
      onPress={handleToggle}
      activeOpacity={0.7}
      style={styles.container}
    >
      <LinearGradient
        colors={[colors.secondary + '25', colors.primary + '15']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        {/* Top row */}
        <View style={styles.topRow}>
          <View style={styles.leftSection}>
            <View style={[styles.iconCircle, playing && styles.iconCircleActive]}>
              <Ionicons
                name={playing ? 'stop' : 'play'}
                size={20}
                color={playing ? colors.error : colors.primary}
              />
            </View>
            <View style={styles.textSection}>
              <Text style={styles.label}>AUDIO INTRO</Text>
              <Text style={styles.title}>
                {playing ? 'Playing...' : 'Tap to listen'}
              </Text>
            </View>
          </View>

          {/* Waveform bars */}
          <View style={styles.waveform}>
            {barAnims.map((anim, i) => (
              <Animated.View
                key={i}
                style={[
                  styles.bar,
                  {
                    transform: [{ scaleY: anim }],
                    backgroundColor: playing ? colors.primary : colors.textMuted,
                  },
                ]}
              />
            ))}
          </View>
        </View>

        {/* Expanded: show the intro text */}
        {expanded && (
          <View style={styles.expandedSection}>
            <Text style={styles.introText}>{introText}</Text>
          </View>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  gradient: {
    padding: spacing.lg,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircleActive: {
    backgroundColor: colors.error + '20',
  },
  textSection: {
    marginLeft: spacing.md,
    flex: 1,
  },
  label: {
    ...typography.caption,
    color: colors.primary,
    letterSpacing: 1.5,
    marginBottom: 2,
  },
  title: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  waveform: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 28,
    gap: 3,
    marginLeft: spacing.md,
  },
  bar: {
    width: 4,
    height: 28,
    borderRadius: 2,
  },
  expandedSection: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.glassBorder,
  },
  introText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    lineHeight: 20,
  },
});
