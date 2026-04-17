import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Share,
  Platform,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography, glowShadow } from '../../utils/theme';
import { useUserStore } from '../../store/userStore';
import { useGameStore } from '../../store/gameStore';
import * as Haptics from 'expo-haptics';

let ViewShot: any = ({ children, ...p }: any) => <View {...p}>{children}</View>;
let captureRef: any = async () => '';
try {
  const vs = require('react-native-view-shot');
  ViewShot = vs.default;
  captureRef = vs.captureRef;
} catch (e) {
  console.warn('react-native-view-shot import failed:', e);
}
let Sharing: any = { shareAsync: async () => {} };
try {
  Sharing = require('expo-sharing');
} catch (e) {
  console.warn('expo-sharing import failed:', e);
}

const SCREEN_WIDTH = Dimensions.get('window').width;
const GOLD = '#D4AF37';
const GOLD_LIGHT = '#F5D87A';
const GOLD_DARK = '#A67C00';

export function CertificateScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { skillName, modulesCompleted, totalModules, xpEarned, completionDate } = route.params;
  const profile = useUserStore((s) => s.profile);
  const username = profile?.username || 'Forger';
  const viewShotRef = useRef<any>(null);

  const formattedDate = new Date(completionDate || Date.now()).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  async function handleShare() {
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); } catch {}

    try {
      const uri = await captureRef(viewShotRef, {
        format: 'png',
        quality: 1,
        result: 'tmpfile',
      });

      if (Platform.OS === 'ios') {
        await Sharing.shareAsync(uri, {
          mimeType: 'image/png',
          UTI: 'public.png',
        });
      } else {
        await Share.share({ url: uri, message: getLinkedInText() });
      }
    } catch {
      try {
        await Share.share({ message: getLinkedInText() });
      } catch {}
    }
  }

  function getLinkedInText() {
    return `I just earned my ${skillName} Certificate on Skilly! ${modulesCompleted} modules completed with ${xpEarned.toLocaleString()} XP earned. #Skilly #Learning #${skillName.replace(/\s+/g, '')}`;
  }

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        {/* Back button */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>

        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          <ViewShot
            ref={viewShotRef}
            options={{ format: 'png', quality: 1 }}
            style={styles.captureArea}
          >
            <View style={styles.certificate}>
              {/* Gold border frame */}
              <View style={styles.outerFrame}>
                <View style={styles.innerFrame}>
                  {/* Corner ornaments */}
                  <View style={[styles.corner, styles.cornerTL]} />
                  <View style={[styles.corner, styles.cornerTR]} />
                  <View style={[styles.corner, styles.cornerBL]} />
                  <View style={[styles.corner, styles.cornerBR]} />

                  {/* Top decorative line */}
                  <LinearGradient
                    colors={[GOLD_DARK, GOLD, GOLD_LIGHT, GOLD, GOLD_DARK]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.topLine}
                  />

                  {/* Skilly Logo */}
                  <Text style={styles.logoText}>Skilly</Text>

                  {/* Title */}
                  <Text style={styles.certTitle}>Certificate of Completion</Text>

                  {/* Decorative divider */}
                  <LinearGradient
                    colors={[GOLD_DARK, GOLD, GOLD_LIGHT, GOLD, GOLD_DARK]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.divider}
                  />

                  {/* Body */}
                  <Text style={styles.certBody}>This certifies that</Text>
                  <Text style={styles.certName}>{username}</Text>
                  <Text style={styles.certBody}>has successfully completed</Text>
                  <Text style={styles.certSkill}>{skillName}</Text>

                  {/* Stats row */}
                  <View style={styles.statsRow}>
                    <View style={styles.statItem}>
                      <Text style={styles.statNumber}>{modulesCompleted}</Text>
                      <Text style={styles.statDesc}>Modules{'\n'}Completed</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                      <Text style={styles.statNumber}>{xpEarned.toLocaleString()}</Text>
                      <Text style={styles.statDesc}>XP{'\n'}Earned</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                      <Text style={styles.statNumber}>{totalModules}</Text>
                      <Text style={styles.statDesc}>Total{'\n'}Lessons</Text>
                    </View>
                  </View>

                  {/* Date */}
                  <Text style={styles.dateText}>{formattedDate}</Text>

                  {/* Bottom decorative line */}
                  <LinearGradient
                    colors={[GOLD_DARK, GOLD, GOLD_LIGHT, GOLD, GOLD_DARK]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.bottomLine}
                  />

                  {/* Branding */}
                  <Text style={styles.brandingFooter}>skilly.app</Text>
                </View>
              </View>
            </View>
          </ViewShot>

          {/* Share Button */}
          <TouchableOpacity onPress={handleShare} activeOpacity={0.8} style={styles.shareButton}>
            <LinearGradient
              colors={[GOLD, GOLD_DARK]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.shareGradient}
            >
              <Ionicons name="share-outline" size={20} color="#000" />
              <Text style={styles.shareText}>Share Certificate</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* LinkedIn suggestion */}
          <View style={styles.linkedInSection}>
            <Text style={styles.linkedInTitle}>Share to LinkedIn</Text>
            <View style={styles.linkedInCard}>
              <Text style={styles.linkedInCopy}>{getLinkedInText()}</Text>
            </View>
            <TouchableOpacity
              style={styles.copyButton}
              activeOpacity={0.7}
              onPress={() => {
                try { Haptics.selectionAsync(); } catch {}
                Share.share({ message: getLinkedInText() });
              }}
            >
              <Ionicons name="copy-outline" size={16} color={colors.textSecondary} />
              <Text style={styles.copyText}>Copy text</Text>
            </TouchableOpacity>
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
  backButton: {
    position: 'absolute',
    top: 8,
    left: spacing.lg,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.glassBg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  scroll: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing['5xl'],
    paddingBottom: 120,
  },
  captureArea: {
    backgroundColor: colors.background,
  },

  // Certificate
  certificate: {
    alignItems: 'center',
  },
  outerFrame: {
    width: '100%',
    borderWidth: 2,
    borderColor: GOLD,
    borderRadius: borderRadius['2xl'],
    padding: 4,
    ...glowShadow(GOLD),
  },
  innerFrame: {
    width: '100%',
    borderWidth: 1,
    borderColor: GOLD_DARK,
    borderRadius: borderRadius.xl,
    paddingVertical: spacing['4xl'],
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    backgroundColor: 'rgba(10,10,11,0.95)',
  },

  // Corner ornaments
  corner: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderColor: GOLD,
  },
  cornerTL: {
    top: 8,
    left: 8,
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderTopLeftRadius: 6,
  },
  cornerTR: {
    top: 8,
    right: 8,
    borderTopWidth: 2,
    borderRightWidth: 2,
    borderTopRightRadius: 6,
  },
  cornerBL: {
    bottom: 8,
    left: 8,
    borderBottomWidth: 2,
    borderLeftWidth: 2,
    borderBottomLeftRadius: 6,
  },
  cornerBR: {
    bottom: 8,
    right: 8,
    borderBottomWidth: 2,
    borderRightWidth: 2,
    borderBottomRightRadius: 6,
  },

  topLine: {
    width: '80%',
    height: 2,
    borderRadius: 1,
    marginBottom: spacing['2xl'],
  },
  logoText: {
    fontSize: 16,
    fontWeight: '900',
    color: colors.primary,
    letterSpacing: -0.5,
    marginBottom: spacing.xl,
  },
  certTitle: {
    fontSize: 22,
    fontWeight: '300',
    color: GOLD,
    letterSpacing: 3,
    textTransform: 'uppercase',
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  divider: {
    width: '60%',
    height: 1,
    marginBottom: spacing['2xl'],
  },
  certBody: {
    fontSize: 13,
    fontWeight: '400',
    color: colors.textSecondary,
    letterSpacing: 1,
    marginBottom: spacing.sm,
  },
  certName: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.5,
    marginBottom: spacing.md,
  },
  certSkill: {
    fontSize: 24,
    fontWeight: '700',
    color: GOLD,
    letterSpacing: -0.3,
    marginBottom: spacing['2xl'],
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing['2xl'],
    gap: spacing.lg,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 22,
    fontWeight: '900',
    color: colors.textPrimary,
  },
  statDesc: {
    fontSize: 10,
    fontWeight: '500',
    color: colors.textSecondary,
    textAlign: 'center',
    letterSpacing: 0.5,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 36,
    backgroundColor: 'rgba(212,175,55,0.2)',
  },

  dateText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textMuted,
    letterSpacing: 1,
    marginBottom: spacing.xl,
  },
  bottomLine: {
    width: '80%',
    height: 2,
    borderRadius: 1,
    marginBottom: spacing.lg,
  },
  brandingFooter: {
    fontSize: 11,
    fontWeight: '500',
    color: colors.textMuted,
    letterSpacing: 2,
  },

  // Share
  shareButton: {
    marginTop: spacing['2xl'],
    ...glowShadow(GOLD),
  },
  shareGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
  },
  shareText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  // LinkedIn
  linkedInSection: {
    marginTop: spacing['2xl'],
  },
  linkedInTitle: {
    ...typography.caption,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: spacing.md,
  },
  linkedInCard: {
    backgroundColor: colors.glassBg,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    padding: spacing.lg,
  },
  linkedInCopy: {
    ...typography.bodySmall,
    color: colors.textPrimary,
    lineHeight: 20,
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    marginTop: spacing.md,
    padding: spacing.sm,
  },
  copyText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    fontWeight: '600',
  },
});
