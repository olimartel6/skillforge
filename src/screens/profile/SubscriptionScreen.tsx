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
import { purchasePackage, restorePurchases, getOfferings } from '../../services/purchases';

interface FeatureRow {
  label: string;
  free: boolean;
  premium: boolean;
}

const FEATURES: FeatureRow[] = [
  { label: '1 skill track', free: true, premium: true },
  { label: 'Unlimited skills', free: false, premium: true },
  { label: 'Basic AI feedback', free: true, premium: true },
  { label: 'Advanced AI feedback', free: false, premium: true },
  { label: 'Streak tracking', free: true, premium: true },
  { label: 'Community access', free: false, premium: true },
  { label: 'Detailed analytics', free: false, premium: true },
  { label: 'Freeze tokens', free: false, premium: true },
];

export function SubscriptionScreen() {
  const [purchasing, setPurchasing] = useState(false);
  const [restoring, setRestoring] = useState(false);

  const handleSubscribe = async () => {
    setPurchasing(true);
    try {
      const packages = await getOfferings();
      if (packages.length === 0) {
        Alert.alert('Unavailable', 'No subscription packages available. Please check RevenueCat dashboard: offerings must have a "default" offering with at least one package linked to an App Store Connect product.');
        return;
      }
      const success = await purchasePackage(packages[0]);
      if (success) {
        Alert.alert('Success', 'Welcome to Skilly Premium!');
      }
    } catch (err) {
      Alert.alert('Error', 'Could not complete purchase. Please try again.');
    } finally {
      setPurchasing(false);
    }
  };

  const handleRestore = async () => {
    setRestoring(true);
    try {
      const success = await restorePurchases();
      if (success) {
        Alert.alert('Restored', 'Your premium subscription has been restored.');
      } else {
        Alert.alert('No Purchases', 'No previous purchases found.');
      }
    } catch (err) {
      Alert.alert('Error', 'Could not restore purchases. Please try again.');
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
            <Text style={styles.title}>Go Premium</Text>
          </LinearGradient>

          {/* Feature Comparison */}
          <GlassCard strong style={styles.comparisonCard}>
            {/* Header */}
            <View style={styles.comparisonHeader}>
              <Text style={[styles.columnLabel, styles.featureColumn]}>Feature</Text>
              <Text style={styles.columnLabel}>Free</Text>
              <Text style={[styles.columnLabel, { color: colors.secondary }]}>Pro</Text>
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

          {/* Price */}
          <View style={styles.priceSection}>
            <Text style={styles.price}>$6.99</Text>
            <Text style={styles.priceLabel}>/month</Text>
          </View>

          {/* Subscribe Button */}
          <Button
            title={purchasing ? 'Processing...' : 'Subscribe'}
            onPress={handleSubscribe}
            disabled={purchasing}
            style={styles.subscribeButton}
          />

          {/* Restore */}
          <Button
            title={restoring ? 'Restoring...' : 'Restore Purchases'}
            variant="ghost"
            onPress={handleRestore}
            disabled={restoring}
          />

          {/* Subscription Terms (Required by App Store Guideline 3.1.2) */}
          <Text style={styles.terms}>
            Subscription automatically renews monthly at $6.99/month unless cancelled at least 24 hours before the end of the current period. Payment will be charged to your Apple ID account at confirmation of purchase. You can manage or cancel your subscription in your Apple ID account settings. Any unused portion of a free trial period will be forfeited upon purchase.
          </Text>

          {/* Legal Links */}
          <TouchableOpacity onPress={() => Linking.openURL('https://www.apple.com/legal/internet-services/itunes/dev/stdeula/')}>
            <Text style={styles.legalLink}>Terms of Use (EULA)</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => Linking.openURL('https://karztsksjqohxhgxdeje.supabase.co/storage/v1/object/public/pages/privacy-policy.html')}>
            <Text style={styles.legalLink}>Privacy Policy</Text>
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
    paddingBottom: spacing['6xl'],
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
