import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AmbientGlow } from '../../components/AmbientGlow';
import { Button } from '../../components/Button';
import { colors, spacing, borderRadius, typography } from '../../utils/theme';
import { useUserStore } from '../../store/userStore';
import { OnboardingStackParamList } from '../../navigation/OnboardingNavigator';
import { t } from '../../i18n';

type Nav = NativeStackNavigationProp<OnboardingStackParamList, 'ProfileSetup'>;

export function ProfileSetupScreen() {
  const navigation = useNavigation<Nav>();
  const { updateProfile } = useUserStore();
  const [name, setName] = useState('');
  const [birthDay, setBirthDay] = useState('');
  const [birthMonth, setBirthMonth] = useState('');
  const [birthYear, setBirthYear] = useState('');

  const isValid = name.trim().length >= 2 && birthDay && birthMonth && birthYear.length === 4;

  const handleContinue = async () => {
    if (!isValid) return;
    const dateOfBirth = `${birthYear}-${birthMonth.padStart(2, '0')}-${birthDay.padStart(2, '0')}`;
    await updateProfile({
      username: name.trim(),
      avatar_url: dateOfBirth,  // store DOB in avatar_url for now (we'll add a proper field)
    });
    navigation.navigate('SkillSelection');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          <AmbientGlow color={colors.primary} size={250} top="10%" left="60%" opacity={0.1} />

          <View style={styles.header}>
            <Text style={styles.emoji}>👋</Text>
            <Text style={styles.heading}>{t('profileSetup.heading')}</Text>
            <Text style={styles.sub}>{t('profileSetup.sub')}</Text>
          </View>

          {/* Name Input */}
          <View style={styles.inputSection}>
            <Text style={styles.label}>{t('profileSetup.nameLabel')}</Text>
            <TextInput
              style={styles.input}
              placeholder={t('profileSetup.namePlaceholder')}
              placeholderTextColor={colors.textMuted}
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              autoFocus
            />
          </View>

          {/* Date of Birth */}
          <View style={styles.inputSection}>
            <Text style={styles.label}>{t('profileSetup.dobLabel')}</Text>
            <View style={styles.dobRow}>
              <TextInput
                style={[styles.input, styles.dobInput]}
                placeholder="DD"
                placeholderTextColor={colors.textMuted}
                value={birthDay}
                onChangeText={(t) => {
                  const num = t.replace(/\D/g, '').slice(0, 2);
                  setBirthDay(num);
                }}
                keyboardType="number-pad"
                maxLength={2}
              />
              <TextInput
                style={[styles.input, styles.dobInput]}
                placeholder="MM"
                placeholderTextColor={colors.textMuted}
                value={birthMonth}
                onChangeText={(t) => {
                  const num = t.replace(/\D/g, '').slice(0, 2);
                  setBirthMonth(num);
                }}
                keyboardType="number-pad"
                maxLength={2}
              />
              <TextInput
                style={[styles.input, styles.dobInputYear]}
                placeholder="YYYY"
                placeholderTextColor={colors.textMuted}
                value={birthYear}
                onChangeText={(t) => {
                  const num = t.replace(/\D/g, '').slice(0, 4);
                  setBirthYear(num);
                }}
                keyboardType="number-pad"
                maxLength={4}
              />
            </View>
          </View>

          {/* Age display */}
          {birthYear.length === 4 && birthMonth && birthDay && (
            <View style={styles.ageContainer}>
              <Text style={styles.ageText}>
                {calculateAge(parseInt(birthYear), parseInt(birthMonth), parseInt(birthDay))} {t('profileSetup.yearsOld')}
              </Text>
            </View>
          )}
        </ScrollView>

        <View style={styles.footer}>
          <Button
            title={t('profileSetup.continue')}
            onPress={handleContinue}
            disabled={!isValid}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function calculateAge(year: number, month: number, day: number): number {
  const today = new Date();
  const birth = new Date(year, month - 1, day);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing['6xl'],
  },
  header: {
    marginBottom: spacing['4xl'],
  },
  emoji: {
    fontSize: 40,
    marginBottom: spacing.lg,
  },
  heading: {
    ...typography.h1,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  sub: {
    ...typography.body,
    color: colors.textSecondary,
  },
  inputSection: {
    marginBottom: spacing['2xl'],
  },
  label: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.textMuted,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: spacing.sm,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    color: colors.textPrimary,
    borderRadius: borderRadius.lg,
    padding: 16,
    fontSize: 16,
    fontWeight: '500',
  },
  dobRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  dobInput: {
    flex: 1,
    textAlign: 'center',
  },
  dobInputYear: {
    flex: 1.5,
    textAlign: 'center',
  },
  ageContainer: {
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  ageText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },
  footer: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing['4xl'],
  },
});
