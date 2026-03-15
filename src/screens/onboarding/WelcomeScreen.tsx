import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AmbientGlow } from '../../components/AmbientGlow';
import { Button } from '../../components/Button';
import { colors, spacing, borderRadius, typography } from '../../utils/theme';
import { useUserStore } from '../../store/userStore';
import { OnboardingStackParamList } from '../../navigation/OnboardingNavigator';

type Nav = NativeStackNavigationProp<OnboardingStackParamList, 'Welcome'>;

export function WelcomeScreen() {
  const navigation = useNavigation<Nav>();
  const { signUp, signIn } = useUserStore();

  const [mode, setMode] = useState<'signup' | 'signin'>('signup');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError('');
    setLoading(true);
    try {
      if (mode === 'signup') {
        if (!username.trim()) {
          setError('Username is required');
          setLoading(false);
          return;
        }
        await signUp(email.trim(), password, username.trim());
      } else {
        await signIn(email.trim(), password);
      }
      navigation.navigate('SkillSelection');
    } catch (e: any) {
      setError(e.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          {/* Ambient glows */}
          <AmbientGlow color={colors.primary} size={300} top="18%" left="50%" opacity={0.12} />
          <AmbientGlow color={colors.secondary} size={200} top="12%" left="30%" opacity={0.08} />

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
            Master any creative skill{'\n'}5 minutes a day · AI coaching
          </Text>

          {/* Form */}
          <View style={styles.form}>
            {mode === 'signup' && (
              <TextInput
                style={styles.input}
                placeholder="Username"
                placeholderTextColor={colors.textMuted}
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
              />
            )}
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor={colors.textMuted}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor={colors.textMuted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <Button
              title={loading ? '' : mode === 'signup' ? 'Begin Your Journey' : 'Sign In'}
              onPress={handleSubmit}
              disabled={loading}
            />
            {loading && (
              <ActivityIndicator
                color={colors.textPrimary}
                style={styles.loader}
              />
            )}
          </View>

          {/* Toggle */}
          <TouchableOpacity
            onPress={() => {
              setMode(mode === 'signup' ? 'signin' : 'signup');
              setError('');
            }}
            activeOpacity={0.7}
          >
            <Text style={styles.toggle}>
              {mode === 'signup'
                ? 'Already forging? Sign in'
                : 'New here? Sign up'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: { flex: 1 },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing['4xl'],
  },
  logoWrapper: {
    marginBottom: spacing.xl,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoEmoji: {
    fontSize: 36,
  },
  title: {
    ...typography.h1,
    fontSize: 28,
    fontWeight: '900',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: '300',
    color: colors.textSecondary,
    letterSpacing: 3,
    textTransform: 'uppercase',
    marginBottom: spacing.lg,
  },
  body: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing['4xl'],
  },
  form: {
    width: '100%',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    color: colors.textPrimary,
    borderRadius: borderRadius.lg,
    padding: 16,
    fontSize: 15,
  },
  error: {
    color: colors.error,
    fontSize: 13,
    textAlign: 'center',
  },
  loader: {
    position: 'absolute',
    bottom: 18,
    alignSelf: 'center',
  },
  toggle: {
    color: colors.secondary,
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: spacing.md,
  },
});
