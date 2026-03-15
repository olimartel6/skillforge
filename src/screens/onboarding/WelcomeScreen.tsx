import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AmbientGlow } from '../../components/AmbientGlow';
import { Button } from '../../components/Button';
import { colors, spacing, borderRadius, typography } from '../../utils/theme';
import { OnboardingStackParamList } from '../../navigation/OnboardingNavigator';

type Nav = NativeStackNavigationProp<OnboardingStackParamList, 'Welcome'>;

export function WelcomeScreen() {
  const navigation = useNavigation<Nav>();

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* Ambient glows */}
        <AmbientGlow color={colors.primary} size={300} top="30%" left="50%" opacity={0.12} />
        <AmbientGlow color={colors.secondary} size={200} top="25%" left="30%" opacity={0.08} />

        {/* Logo */}
        <View style={styles.logoWrapper}>
          <LinearGradient
            colors={[colors.primary, colors.primaryDark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.logo}
          >
            <Text style={styles.logoEmoji}>⚡</Text>
          </LinearGradient>
        </View>

        {/* Title */}
        <Text style={styles.title}>SkillForge</Text>
        <Text style={styles.subtitle}>TALENT IS PRACTICE</Text>
        <Text style={styles.body}>
          Master any creative skill{'\n'}
          <Text style={styles.bodyBold}>5 minutes a day</Text> · AI coaching
        </Text>

        {/* CTA */}
        <View style={styles.cta}>
          <Button
            title="Begin Your Journey"
            onPress={() => navigation.navigate('SkillSelection')}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  logoWrapper: {
    marginBottom: spacing['2xl'],
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: borderRadius['3xl'],
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoEmoji: {
    fontSize: 36,
  },
  title: {
    ...typography.h1,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: '300',
    color: colors.textSecondary,
    letterSpacing: 3,
    textTransform: 'uppercase',
    marginBottom: spacing['4xl'],
  },
  body: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: spacing['6xl'],
  },
  bodyBold: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  cta: {
    width: '100%',
    paddingHorizontal: spacing.xl,
  },
});
