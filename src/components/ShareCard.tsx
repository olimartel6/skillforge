import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing } from '../utils/theme';
import { t } from '../i18n';

interface ShareCardProps {
  skillName: string;
  moduleName: string;
  correctCount: number;
  totalCount: number;
  percentage: number;
  stars: number;
  maxCombo: number;
  elapsed: number;
}

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function ShareCard({
  skillName,
  moduleName,
  correctCount,
  totalCount,
  percentage,
  stars,
  maxCombo,
  elapsed,
}: ShareCardProps) {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0a0a0f', '#1a1020', '#2a1525', '#1a0a0f']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        {/* Decorative glow circles */}
        <View style={styles.glowTopRight} />
        <View style={styles.glowBottomLeft} />

        {/* Logo */}
        <Text style={styles.logo}>Skilly</Text>
        <View style={styles.logoDivider} />

        {/* Skill & Module */}
        <Text style={styles.skillName}>{skillName}</Text>
        <Text style={styles.moduleName}>{moduleName}</Text>

        {/* Score */}
        <View style={styles.scoreContainer}>
          <LinearGradient
            colors={[colors.primary, colors.primaryDark]}
            style={styles.scoreCircle}
          >
            <Text style={styles.scoreNumber}>
              {correctCount}
              <Text style={styles.scoreSlash}>/{totalCount}</Text>
            </Text>
          </LinearGradient>
        </View>

        {/* Accuracy + Stars */}
        <View style={styles.accuracyRow}>
          <Text style={styles.accuracyValue}>{percentage}%</Text>
          <View style={styles.starsRow}>
            {[0, 1, 2].map((i) => (
              <Text
                key={i}
                style={[styles.star, i < stars ? styles.starActive : styles.starInactive]}
              >
                {'\u2605'}
              </Text>
            ))}
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{maxCombo}x</Text>
            <Text style={styles.statLabel}>{t('gameResult.maxCombo')}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{formatTime(elapsed)}</Text>
            <Text style={styles.statLabel}>{t('gameResult.time')}</Text>
          </View>
        </View>

        {/* Challenge text */}
        <View style={styles.challengeContainer}>
          <Text style={styles.challengeText}>{t('share.canYouBeatMe')}</Text>
        </View>

        {/* Download link */}
        <View style={styles.footer}>
          <View style={styles.footerDivider} />
          <Text style={styles.downloadText}>{t('share.downloadSkilly')}</Text>
        </View>
      </LinearGradient>
    </View>
  );
}

// Render at 1080x1920 story ratio but scaled down for capture
const CARD_WIDTH = 360;
const CARD_HEIGHT = 640;

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 24,
    overflow: 'hidden',
  },
  gradient: {
    flex: 1,
    paddingHorizontal: 32,
    paddingTop: 48,
    paddingBottom: 32,
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  // Decorative glows
  glowTopRight: {
    position: 'absolute',
    top: -60,
    right: -60,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: colors.primary,
    opacity: 0.08,
  },
  glowBottomLeft: {
    position: 'absolute',
    bottom: -40,
    left: -40,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: colors.secondary,
    opacity: 0.06,
  },

  // Logo
  logo: {
    fontSize: 36,
    fontWeight: '900',
    color: colors.primary,
    letterSpacing: -1,
  },
  logoDivider: {
    width: 40,
    height: 3,
    backgroundColor: colors.primary,
    borderRadius: 2,
    marginTop: 8,
    opacity: 0.6,
  },

  // Skill info
  skillName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 24,
    letterSpacing: -0.5,
  },
  moduleName: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center',
    marginTop: 4,
  },

  // Score circle
  scoreContainer: {
    marginTop: 28,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 12,
  },
  scoreCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreNumber: {
    fontSize: 48,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  scoreSlash: {
    fontSize: 24,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.7)',
  },

  // Accuracy
  accuracyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 20,
  },
  accuracyValue: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  starsRow: {
    flexDirection: 'row',
    gap: 4,
  },
  star: {
    fontSize: 24,
  },
  starActive: {
    color: '#FFD700',
  },
  starInactive: {
    color: 'rgba(255,255,255,0.15)',
  },

  // Stats row
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 32,
    marginTop: 20,
    width: '100%',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.4)',
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },

  // Challenge
  challengeContainer: {
    marginTop: 24,
  },
  challengeText: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.primary,
    textAlign: 'center',
  },

  // Footer
  footer: {
    alignItems: 'center',
    width: '100%',
    marginTop: 16,
  },
  footerDivider: {
    width: '60%',
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginBottom: 12,
  },
  downloadText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.35)',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
});
