import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Speech from 'expo-speech';
import * as Haptics from 'expo-haptics';
import { AmbientGlow } from '../../components/AmbientGlow';
import { colors, spacing, borderRadius, typography } from '../../utils/theme';
import { AUDIO_INTROS } from '../../utils/audioIntros';
import { t } from '../../i18n';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CARD_GAP = 12;
const CARD_WIDTH = (SCREEN_WIDTH - spacing.xl * 2 - CARD_GAP) / 2;

interface ModeItem {
  key: string;
  title: string;
  subtitle: string;
  icon: string;
  isEmoji: boolean;
  color: string;
  onPress: (nav: any, skillName: string) => void;
}

const MODES: ModeItem[] = [
  {
    key: 'flashcards',
    title: 'Flashcards',
    subtitle: 'Flip & review key concepts',
    icon: 'albums-outline',
    isEmoji: false,
    color: '#6C63FF',
    onPress: (nav, skillName) =>
      nav.navigate('GamesTab', { screen: 'Flashcards', params: { skillName } }),
  },
  {
    key: 'story',
    title: 'Story Mode',
    subtitle: 'Interactive narrative adventure',
    icon: '\uD83D\uDCD6',
    isEmoji: true,
    color: '#8B5CF6',
    onPress: (nav, skillName) =>
      nav.navigate('GamesTab', { screen: 'StoryMode', params: { skillName } }),
  },
  {
    key: '1v1',
    title: '1v1 Challenge',
    subtitle: 'Head-to-head with a friend',
    icon: 'flash',
    isEmoji: false,
    color: '#EF4444',
    onPress: (nav) =>
      nav.navigate('GamesTab', { screen: 'Challenge1v1' }),
  },
  {
    key: 'live',
    title: 'Live with Friends',
    subtitle: 'Real-time multiplayer',
    icon: 'people',
    isEmoji: false,
    color: '#FF6B35',
    onPress: (nav) =>
      nav.navigate('GamesTab', { screen: 'LiveLobby' }),
  },
  {
    key: 'coach',
    title: 'AI Coach',
    subtitle: 'Personalized feedback',
    icon: '\uD83E\uDD16',
    isEmoji: true,
    color: '#6C63FF',
    onPress: (nav) =>
      nav.navigate('HomeTab', { screen: 'AICoach' }),
  },
  {
    key: 'audio',
    title: 'Audio Intro',
    subtitle: 'Listen to skill overview',
    icon: 'play',
    isEmoji: false,
    color: '#E55A2B',
    onPress: () => {}, // handled separately
  },
];

export function ModesScreen() {
  const navigation = useNavigation<any>();
  const [skillName, setSkillName] = useState('');

  useEffect(() => {
    AsyncStorage.getItem('skilly_current_skill_name').then((name) => {
      if (name) setSkillName(name);
    });
  }, []);

  const handleAudioPlay = useCallback(() => {
    if (!skillName) return;
    const introText = AUDIO_INTROS[skillName];
    if (!introText) return;
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); } catch {}
    Speech.stop();
    Speech.speak(introText, {
      language: 'en-US',
      rate: 0.95,
      pitch: 1.0,
    });
  }, [skillName]);

  const handlePress = useCallback(
    (mode: ModeItem) => {
      try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch {}
      if (mode.key === 'audio') {
        handleAudioPlay();
      } else {
        mode.onPress(navigation, skillName);
      }
    },
    [navigation, skillName, handleAudioPlay],
  );

  return (
    <View style={styles.root}>
      <AmbientGlow color={colors.secondary} size={280} opacity={0.06} top={-40} left="60%" />
      <AmbientGlow color={colors.primary} size={220} opacity={0.04} top="55%" left="-5%" />

      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.title}>Modes</Text>
          {skillName ? (
            <Text style={styles.subtitle}>{skillName}</Text>
          ) : null}

          <View style={styles.grid}>
            {MODES.map((mode) => (
              <TouchableOpacity
                key={mode.key}
                activeOpacity={0.8}
                onPress={() => handlePress(mode)}
                style={styles.cardWrapper}
              >
                <View style={styles.card}>
                  {/* Colored accent line at top */}
                  <View style={[styles.accentLine, { backgroundColor: mode.color }]} />

                  <View style={[styles.iconCircle, { backgroundColor: mode.color + '20' }]}>
                    {mode.isEmoji ? (
                      <Text style={styles.emojiIcon}>{mode.icon}</Text>
                    ) : (
                      <Ionicons
                        name={mode.icon as any}
                        size={26}
                        color={mode.color}
                      />
                    )}
                  </View>

                  <Text style={styles.cardTitle}>{mode.title}</Text>
                  <Text style={styles.cardSubtitle}>{mode.subtitle}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  safe: {
    flex: 1,
  },
  scroll: {
    paddingHorizontal: spacing.xl,
    paddingBottom: 120,
  },
  title: {
    ...typography.h1,
    color: colors.textPrimary,
    marginTop: spacing.lg,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: spacing['2xl'],
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: CARD_GAP,
    marginTop: spacing.lg,
  },
  cardWrapper: {
    width: CARD_WIDTH,
  },
  card: {
    backgroundColor: colors.glassStrongBg,
    borderWidth: 1,
    borderColor: colors.glassStrongBorder,
    borderRadius: borderRadius['2xl'],
    padding: spacing.xl,
    alignItems: 'center',
    minHeight: 160,
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  accentLine: {
    position: 'absolute',
    top: 0,
    left: 20,
    right: 20,
    height: 3,
    borderRadius: 2,
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  emojiIcon: {
    fontSize: 26,
  },
  cardTitle: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  cardSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 15,
  },
});
