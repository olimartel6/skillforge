import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { GlassCard } from '../../components/GlassCard';
import { Button } from '../../components/Button';
import { colors, spacing, borderRadius, typography } from '../../utils/theme';
import { purchasePackage, restorePurchases, getOfferings, isStripePayment, purchaseStripe } from '../../services/purchases';
import { useUserStore } from '../../store/userStore';
import { t } from '../../i18n';

interface FeatureRow {
  label: string;
  free: boolean;
  premium: boolean;
}

const FEATURES: FeatureRow[] = [
  { label: t('subscription.oneSkill'), free: true, premium: true },
  { label: t('subscription.unlimitedSkills'), free: false, premium: true },
  { label: t('subscription.basicFeedback'), free: true, premium: true },
  { label: t('subscription.advancedFeedback'), free: false, premium: true },
  { label: t('subscription.streakTracking'), free: true, premium: true },
  { label: t('subscription.communityAccess'), free: false, premium: true },
  { label: t('subscription.detailedAnalytics'), free: false, premium: true },
  { label: t('subscription.freezeTokens'), free: false, premium: true },
];

export function SubscriptionScreen() {
  const [purchasing, setPurchasing] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const { initialize, profile } = useUserStore();
  const isPremium = profile?.premium_expires_at ? new Date(profile.premium_expires_at) > new Date() : false;

  const handleSubscribe = async () => {
    setPurchasing(true);
    try {
      if (isStripePayment()) {
        const success = await purchaseStripe();
        if (success) {
          await initialize();
          Alert.alert(t('subscription.success'), t('subscription.welcomePremium'));
        }
      } else {
        const packages = await getOfferings();
        if (packages.length === 0) {
          Alert.alert(t('subscription.unavailable'), t('subscription.unavailableMsg'));
          return;
        }
        const success = await purchasePackage(packages[0]);
        if (success) {
          await initialize();
          Alert.alert(t('subscription.success'), t('subscription.welcomePremium'));
        }
      }
    } catch (err) {
      Alert.alert(t('subscription.error'), t('subscription.purchaseError'));
    } finally {
      setPurchasing(false);
    }
  };

  const handleRestore = async () => {
    setRestoring(true);
    try {
      const success = await restorePurchases();
      if (success) {
        Alert.alert(t('subscription.restored'), t('subscription.restoredMsg'));
      } else {
        Alert.alert(t('subscription.noPurchases'), t('subscription.noPurchasesMsg'));
      }
    } catch (err) {
      Alert.alert(t('subscription.error'), t('subscription.purchaseError'));
    } finally {
      setRestoring(false);
    }
  };

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Title */}
          <LinearGradient
            colors={[colors.secondary, colors.secondaryDark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.titleGradient}
          >
            <Text style={styles.title}>{t('subscription.title')}</Text>
          </LinearGradient>

          {/* Feature Comparison */}
          <GlassCard strong style={styles.comparisonCard}>
            {/* Header */}
            <View style={styles.comparisonHeader}>
              <Text style={[styles.columnLabel, styles.featureColumn]}>{t('subscription.feature')}</Text>
              <Text style={styles.columnLabel}>{t('subscription.free')}</Text>
              <Text style={[styles.columnLabel, { color: colors.secondary }]}>{t('subscription.pro')}</Text>
            </View>

            {/* Rows */}
            {FEATURES.map((feature, index) => (
              <View
                key={index}
                style={[
                  styles.featureRow,
                  index < FEATURES.length - 1 && styles.featureRowBorder,
                ]}
              >
                <Text style={[styles.featureLabel, styles.featureColumn]}>{feature.label}</Text>
                <Text style={styles.checkMark}>
                  {feature.free ? (
                    <Text style={{ color: colors.success }}>✓</Text>
                  ) : (
                    <Text style={{ color: colors.error }}>✕</Text>
                  )}
                </Text>
                <Text style={styles.checkMark}>
                  {feature.premium ? (
                    <Text style={{ color: colors.success }}>✓</Text>
                  ) : (
                    <Text style={{ color: colors.error }}>✕</Text>
                  )}
                </Text>
              </View>
            ))}
          </GlassCard>

          {isPremium ? (
            <View style={{ alignItems: 'center', marginBottom: spacing['2xl'] }}>
              <Text style={{ fontSize: 48, marginBottom: spacing.md }}>✓</Text>
              <Text style={{ ...typography.h2, color: colors.success, marginBottom: spacing.sm }}>Premium Active</Text>
              <Text style={{ ...typography.body, color: colors.textSecondary, textAlign: 'center' }}>
                You have access to all premium features.
              </Text>
            </View>
          ) : (
            <>
              {/* Price */}
              <View style={styles.priceSection}>
                <Text style={styles.price}>$6.99</Text>
                <Text style={styles.priceLabel}>{t('subscription.perMonth')}</Text>
              </View>

              {/* Subscribe Button */}
              <Button
                title={purchasing ? t('subscription.processing') : t('subscription.subscribe')}
                onPress={handleSubscribe}
                disabled={purchasing}
                style={styles.subscribeButton}
              />

              {/* Restore */}
              <Button
                title={restoring ? t('subscription.restoring') : t('subscription.restorePurchases')}
                variant="ghost"
                onPress={handleRestore}
                disabled={restoring}
              />
            </>
          )}

          {/* Subscription Terms (Required by App Store Guideline 3.1.2) */}
          <Text style={styles.terms}>
            {t('subscription.terms')}
          </Text>

          {/* Legal Links */}
          <TouchableOpacity onPress={() => Linking.openURL('https://www.apple.com/legal/internet-services/itunes/dev/stdeula/')}>
            <Text style={styles.legalLink}>{t('subscription.termsOfUse')}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => Linking.openURL('https://karztsksjqohxhgxdeje.supabase.co/storage/v1/object/public/pages/privacy-policy.html')}>
            <Text style={styles.legalLink}>{t('subscription.privacyPolicy')}</Text>
          </TouchableOpacity>
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

  // Title
  titleGradient: {
    alignSelf: 'flex-start',
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    marginTop: spacing.lg,
    marginBottom: spacing['2xl'],
  },
  title: {
    ...typography.h2,
    color: '#FFFFFF',
  },

  // Comparison
  comparisonCard: {
    padding: spacing.lg,
    marginBottom: spacing['2xl'],
  },
  comparisonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
    marginBottom: spacing.sm,
  },
  columnLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '700',
    textTransform: 'uppercase',
    width: 50,
    textAlign: 'center',
  },
  featureColumn: {
    flex: 1,
    textAlign: 'left',
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  featureRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.04)',
  },
  featureLabel: {
    ...typography.bodySmall,
    color: colors.textPrimary,
  },
  checkMark: {
    width: 50,
    textAlign: 'center',
    fontSize: 14,
  },

  // Price
  priceSection: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    marginBottom: spacing['2xl'],
  },
  price: {
    fontSize: 40,
    fontWeight: '900',
    color: colors.textPrimary,
    letterSpacing: -1,
  },
  priceLabel: {
    ...typography.body,
    color: colors.textSecondary,
    marginLeft: spacing.xs,
  },

  // Buttons
  subscribeButton: {
    marginBottom: spacing.md,
  },

  // Terms & Legal
  terms: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.xl,
    lineHeight: 18,
  },
  legalLink: {
    ...typography.caption,
    color: colors.primary,
    textAlign: 'center',
    marginTop: spacing.md,
    textDecorationLine: 'underline',
  },
});
