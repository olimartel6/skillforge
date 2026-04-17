import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, borderRadius, typography } from '../../utils/theme';
import { purchasePackage, restorePurchases, getOfferings, isStripePayment, purchaseStripe } from '../../services/purchases';
import { useUserStore } from '../../store/userStore';

const FEATURES = [
  { icon: 'infinite-outline', text: 'Unlimited lessons per day' },
  { icon: 'game-controller-outline', text: 'All 30+ skills unlocked' },
  { icon: 'trending-up-outline', text: 'Pro Trading Simulator' },
  { icon: 'book-outline', text: 'Story Mode & Flashcards' },
  { icon: 'flash-outline', text: '1v1 Challenges' },
  { icon: 'trophy-outline', text: 'Exclusive badges & certificates' },
];

export function OnboardingPaywallScreen() {
  const navigation = useNavigation();
  const { profile, completeOnboarding } = useUserStore();
  const [loading, setLoading] = useState(false);
  const [offerings, setOfferings] = useState<any>(null);

  useEffect(() => {
    (async () => {
      try {
        const o = await getOfferings();
        setOfferings(o);
      } catch {}
    })();
  }, []);

  const handlePurchase = async () => {
    setLoading(true);
    try {
      if (isStripePayment()) {
        await purchaseStripe();
      } else if (offerings?.current?.availablePackages?.[0]) {
        await purchasePackage(offerings.current.availablePackages[0]);
      }
      goToMain();
    } catch (e: any) {
      if (!e.userCancelled) console.warn('Purchase failed:', e);
    }
    setLoading(false);
  };

  const handleRestore = async () => {
    setLoading(true);
    try {
      await restorePurchases();
      goToMain();
    } catch {}
    setLoading(false);
  };

  const handleSkip = () => {
    goToMain();
  };

  const goToMain = async () => {
    // Now complete onboarding
    if (profile) {
      await completeOnboarding(
        profile.selected_skill_id || '',
        (profile.skill_level || 'beginner') as any,
        (profile.goal || 'learn') as any,
      );
    }
    (navigation as any).reset({
      index: 0,
      routes: [{ name: 'Main' }],
    });
  };

  return (
    <View style={styles.screen}>
      <LinearGradient
        colors={['#0a0a0b', '#1a0f05', '#0a0a0b']}
        style={StyleSheet.absoluteFill}
      />
      {/* Orange glow at top */}
      <View style={styles.glow} />

      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        {/* Skip button */}
        <TouchableOpacity onPress={handleSkip} style={styles.skipBtn}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* Hero */}
          <Text style={styles.emoji}>⚡</Text>
          <Text style={styles.title}>Unlock Your{'\n'}Full Potential</Text>
          <Text style={styles.subtitle}>Get unlimited access to all skills, modes, and features</Text>

          {/* Features */}
          <View style={styles.features}>
            {FEATURES.map((f, i) => (
              <View key={i} style={styles.featureRow}>
                <LinearGradient
                  colors={[colors.primary + '30', colors.primaryDark + '20']}
                  style={styles.featureIcon}
                >
                  <Ionicons name={f.icon as any} size={20} color={colors.primary} />
                </LinearGradient>
                <Text style={styles.featureText}>{f.text}</Text>
              </View>
            ))}
          </View>

          {/* Price */}
          <View style={styles.priceCard}>
            <View style={styles.priceHeader}>
              <Text style={styles.priceBadge}>MOST POPULAR</Text>
            </View>
            <Text style={styles.priceAmount}>$6.99<Text style={styles.pricePer}>/month</Text></Text>
            <Text style={styles.priceNote}>Cancel anytime</Text>
          </View>

          {/* CTA */}
          <TouchableOpacity onPress={handlePurchase} activeOpacity={0.8} disabled={loading}>
            <LinearGradient
              colors={[colors.primary, colors.primaryDark]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.ctaBtn}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.ctaText}>Go Premium — $6.99/month</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>

          {/* Free option */}
          <TouchableOpacity onPress={handleSkip} style={styles.freeBtn}>
            <Text style={styles.freeText}>Continue with free plan (1 lesson/day)</Text>
          </TouchableOpacity>

          {/* Restore */}
          <TouchableOpacity onPress={handleRestore} style={styles.restoreBtn}>
            <Text style={styles.restoreText}>Restore purchase</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#0a0a0b',
  },
  safe: {
    flex: 1,
  },
  glow: {
    position: 'absolute',
    top: -150,
    alignSelf: 'center',
    width: 400,
    height: 400,
    borderRadius: 200,
    backgroundColor: 'rgba(255,107,53,0.1)',
  },
  skipBtn: {
    alignSelf: 'flex-end',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  skipText: {
    color: colors.textSecondary,
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    paddingBottom: 40,
  },
  emoji: {
    fontSize: 64,
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: 36,
    fontWeight: '900',
    color: '#fff',
    textAlign: 'center',
    letterSpacing: -1,
    lineHeight: 42,
    marginBottom: spacing.md,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl * 1.5,
    lineHeight: 22,
  },
  features: {
    width: '100%',
    gap: spacing.md,
    marginBottom: spacing.xl * 1.5,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  priceCard: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.primary + '40',
    marginBottom: spacing.xl,
  },
  priceHeader: {
    marginBottom: spacing.md,
  },
  priceBadge: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  priceAmount: {
    fontSize: 48,
    fontWeight: '900',
    color: '#fff',
    marginBottom: spacing.xs,
  },
  pricePer: {
    fontSize: 18,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  priceNote: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  ctaBtn: {
    width: '100%',
    paddingVertical: 18,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    marginBottom: spacing.md,
  },
  ctaText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
  },
  freeBtn: {
    paddingVertical: spacing.md,
    marginBottom: spacing.sm,
  },
  freeText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '500',
  },
  restoreBtn: {
    paddingVertical: spacing.sm,
  },
  restoreText: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
});
