import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { colors, spacing, borderRadius, typography } from '../../utils/theme';
import { AmbientGlow } from '../../components/AmbientGlow';
import { useUserStore } from '../../store/userStore';
import { useGameStore } from '../../store/gameStore';
import { useStreakStore } from '../../store/streakStore';
import { chatAICoach, CoachMessage, CoachMissed } from '../../services/aiCoach';

const FREE_LIMIT_PER_WEEK = 1;
const STORAGE_KEY_USAGE = 'ai_coach_usage';
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

interface UsageRecord {
  weekStart: number; // epoch ms of start of rolling week
  count: number;
}

async function loadUsage(): Promise<UsageRecord> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY_USAGE);
    if (!raw) return { weekStart: Date.now(), count: 0 };
    const parsed = JSON.parse(raw) as UsageRecord;
    if (Date.now() - parsed.weekStart > WEEK_MS) {
      return { weekStart: Date.now(), count: 0 };
    }
    return parsed;
  } catch {
    return { weekStart: Date.now(), count: 0 };
  }
}

async function saveUsage(u: UsageRecord): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY_USAGE, JSON.stringify(u));
  } catch {}
}

export function AICoachScreen() {
  const navigation = useNavigation<any>();
  const profile = useUserStore((s) => s.profile);
  const missedQuestions = useGameStore((s) => s.missedQuestions);
  const xp = useGameStore((s) => s.xp);
  const level = useGameStore((s) => s.level);
  const currentStreak = useStreakStore((s) => s.currentStreak);

  const isPremium = profile?.premium_expires_at
    ? new Date(profile.premium_expires_at) > new Date()
    : false;

  const [messages, setMessages] = useState<CoachMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [skillName, setSkillName] = useState('');
  const [usage, setUsage] = useState<UsageRecord>({ weekStart: Date.now(), count: 0 });
  const [hasStarted, setHasStarted] = useState(false);

  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    AsyncStorage.getItem('skilly_current_skill_name').then((n) => {
      if (n) setSkillName(n);
    });
    loadUsage().then(setUsage);
  }, []);

  const remainingFree = Math.max(0, FREE_LIMIT_PER_WEEK - usage.count);
  const canSend = isPremium || remainingFree > 0;

  const buildMissedPayload = (): CoachMissed[] =>
    missedQuestions.slice(-25).map((m) => ({
      skillName: m.skillName,
      moduleName: m.moduleName,
      prompt: m.question.prompt,
      correctAnswer: String(m.question.correctAnswer ?? ''),
      explanation: (m.question as any).explanation,
    }));

  const incrementUsage = async () => {
    if (isPremium) return;
    const next: UsageRecord = { weekStart: usage.weekStart, count: usage.count + 1 };
    setUsage(next);
    await saveUsage(next);
  };

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;
    if (!canSend) {
      Alert.alert(
        'Premium required',
        'Free users can use AI Coach once per week. Upgrade to premium for unlimited sessions.',
        [
          { text: 'Later', style: 'cancel' },
          {
            text: 'Go Premium',
            onPress: () =>
              navigation.navigate('ProfileTab', { screen: 'Subscription' }),
          },
        ],
      );
      return;
    }

    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch {}

    const userMsg: CoachMessage = { role: 'user', content: text.trim() };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInput('');
    setLoading(true);

    try {
      const reply = await chatAICoach({
        messages: nextMessages,
        missed: buildMissedPayload(),
        skillName: skillName || undefined,
        xp,
        level,
        streak: currentStreak,
      });
      setMessages([...nextMessages, { role: 'assistant', content: reply }]);
      if (!hasStarted) {
        await incrementUsage();
        setHasStarted(true);
      }
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    } catch (e: any) {
      setMessages([
        ...nextMessages,
        {
          role: 'assistant',
          content:
            "Sorry, I couldn't reach the coach right now. Check your connection and try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Auto-kick the first diagnostic on screen open
  useEffect(() => {
    if (messages.length === 0 && !loading && canSend && !hasStarted) {
      const missedCount = missedQuestions.length;
      const firstPrompt =
        missedCount > 0
          ? `Analyze my weak spots and give me a personalized plan. I've missed ${missedCount} questions recently.`
          : `Hi coach! I'm learning ${skillName || 'skills'}. What should I focus on first?`;
      // slight delay to let state settle
      const timer = setTimeout(() => sendMessage(firstPrompt), 300);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [skillName]);

  const handleClose = () => {
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch {}
    navigation.goBack();
  };

  return (
    <View style={styles.root}>
      <AmbientGlow color={colors.primary} size={280} opacity={0.08} top={-40} left="60%" />
      <AmbientGlow color={colors.secondary} size={220} opacity={0.05} top="50%" left="-10%" />

      <SafeAreaView style={styles.safe} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose} style={styles.iconButton}>
            <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <View style={styles.titleRow}>
              <Text style={styles.headerEmoji}>🤖</Text>
              <Text style={styles.headerTitle}>AI Coach</Text>
            </View>
            <Text style={styles.headerSubtitle}>
              {isPremium
                ? 'Premium · unlimited'
                : `Free · ${remainingFree}/${FREE_LIMIT_PER_WEEK} this week`}
            </Text>
          </View>
          <View style={styles.iconButton} />
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.flex}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
        >
          <ScrollView
            ref={scrollRef}
            style={styles.messagesScroll}
            contentContainerStyle={styles.messagesContent}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() =>
              scrollRef.current?.scrollToEnd({ animated: true })
            }
          >
            {messages.length === 0 && !loading && (
              <View style={styles.welcomeCard}>
                <Text style={styles.welcomeEmoji}>✨</Text>
                <Text style={styles.welcomeTitle}>Your personal AI Coach</Text>
                <Text style={styles.welcomeText}>
                  I'll analyze your missed questions and build a plan tailored to you.
                </Text>
              </View>
            )}

            {messages.map((msg, i) => (
              <View
                key={i}
                style={[
                  styles.bubbleWrap,
                  msg.role === 'user' ? styles.bubbleWrapUser : styles.bubbleWrapAssistant,
                ]}
              >
                {msg.role === 'assistant' ? (
                  <View style={styles.bubbleAssistant}>
                    <Text style={styles.bubbleTextAssistant}>{msg.content}</Text>
                  </View>
                ) : (
                  <LinearGradient
                    colors={[colors.primary, colors.primaryDark]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.bubbleUser}
                  >
                    <Text style={styles.bubbleTextUser}>{msg.content}</Text>
                  </LinearGradient>
                )}
              </View>
            ))}

            {loading && (
              <View style={[styles.bubbleWrap, styles.bubbleWrapAssistant]}>
                <View style={styles.bubbleAssistant}>
                  <ActivityIndicator color={colors.primary} size="small" />
                </View>
              </View>
            )}
          </ScrollView>

          {/* Input */}
          <View style={styles.inputBar}>
            <TextInput
              style={styles.input}
              placeholder={
                canSend
                  ? 'Ask your coach anything...'
                  : 'Upgrade to premium to chat more'
              }
              placeholderTextColor={colors.textSecondary}
              value={input}
              onChangeText={setInput}
              multiline
              maxLength={500}
              editable={!loading && canSend}
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                (!input.trim() || loading || !canSend) && styles.sendButtonDisabled,
              ]}
              onPress={() => sendMessage(input)}
              disabled={!input.trim() || loading || !canSend}
            >
              <LinearGradient
                colors={
                  !input.trim() || loading || !canSend
                    ? ['#333', '#333']
                    : [colors.primary, colors.primaryDark]
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.sendButtonGradient}
              >
                <Ionicons name="arrow-up" size={20} color="#fff" />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  safe: { flex: 1 },
  flex: { flex: 1 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: { flex: 1, alignItems: 'center' },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  headerEmoji: { fontSize: 18 },
  headerTitle: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  headerSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },

  messagesScroll: { flex: 1 },
  messagesContent: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing['2xl'],
  },

  welcomeCard: {
    alignItems: 'center',
    padding: spacing['2xl'],
    marginTop: spacing['2xl'],
  },
  welcomeEmoji: { fontSize: 48, marginBottom: spacing.md },
  welcomeTitle: {
    ...typography.h2,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  welcomeText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },

  bubbleWrap: {
    marginVertical: spacing.xs,
    maxWidth: '85%',
  },
  bubbleWrapUser: { alignSelf: 'flex-end' },
  bubbleWrapAssistant: { alignSelf: 'flex-start' },

  bubbleAssistant: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.xl,
    borderBottomLeftRadius: 4,
  },
  bubbleUser: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.xl,
    borderBottomRightRadius: 4,
  },
  bubbleTextAssistant: {
    ...typography.body,
    color: colors.textPrimary,
    lineHeight: 22,
  },
  bubbleTextUser: {
    ...typography.body,
    color: '#fff',
    lineHeight: 22,
  },

  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    gap: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
    backgroundColor: 'rgba(10,10,11,0.8)',
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: spacing.lg,
    paddingVertical: Platform.OS === 'ios' ? spacing.md : spacing.sm,
    color: colors.textPrimary,
    fontSize: 15,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
  },
  sendButtonDisabled: { opacity: 0.5 },
  sendButtonGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
