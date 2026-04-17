import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Animated,
  Share,
  Alert,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
let Clipboard: any = { setStringAsync: async () => {} };
try { Clipboard = require('expo-clipboard'); } catch (e) { console.warn('expo-clipboard import failed:', e); }
import * as Haptics from 'expo-haptics';
import { GlassCard } from '../../components/GlassCard';
import { AmbientGlow } from '../../components/AmbientGlow';
import { useUserStore } from '../../store/userStore';
import {
  createRoom,
  joinRoom,
  onPlayersChanged,
  onGameStarted,
  startGame,
  leaveRoom,
  getRoomCode,
  LivePlayer,
} from '../../services/liveGame';
import { getQuestionsForLesson } from '../../utils/gameQuestions';
import { colors, spacing, typography, borderRadius, glowShadow } from '../../utils/theme';
import { t } from '../../i18n';

const SCREEN_WIDTH = Dimensions.get('window').width;

export function LiveLobbyScreen({ navigation, route }: { navigation: any; route: any }) {
  const profile = useUserStore((s) => s.profile);
  const playerName = profile?.username || 'Player';
  const skillName = profile?.selected_skill_id || 'General';

  const initialCode = route.params?.roomCode || '';
  const initialMode = route.params?.mode === 'join' || initialCode ? 'join' : 'create';

  const [tab, setTab] = useState<'create' | 'join'>(initialMode);
  const [roomCode, setRoomCode] = useState('');
  const [joinCode, setJoinCode] = useState(initialCode);
  const [players, setPlayers] = useState<LivePlayer[]>([]);
  const [isHost, setIsHost] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const dotAnim = useRef(new Animated.Value(0)).current;

  // Pulse animation for waiting
  useEffect(() => {
    if (isConnected) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.1, duration: 800, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        ]),
      );
      pulse.start();

      const dots = Animated.loop(
        Animated.timing(dotAnim, { toValue: 3, duration: 1500, useNativeDriver: false }),
      );
      dots.start();

      return () => {
        pulse.stop();
        dots.stop();
      };
    }
  }, [isConnected]);

  // Auto-join if room code provided via deep link
  useEffect(() => {
    if (initialCode && initialMode === 'join') {
      handleJoin();
    }
  }, []);

  // Listen for game start (non-host)
  useEffect(() => {
    if (isConnected && !isHost) {
      onGameStarted((state) => {
        navigation.replace('LiveGame', {
          questions: state.questions,
          roomCode: getRoomCode(),
          playerName,
          isHost: false,
        });
      });
    }
  }, [isConnected, isHost]);

  // Listen for players
  useEffect(() => {
    if (isConnected) {
      onPlayersChanged((p) => setPlayers(p));
    }
  }, [isConnected]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (!isConnected) return;
      // Only leave if we navigate back, not to game
    };
  }, []);

  const handleCreate = async () => {
    setIsLoading(true);
    try {
      const code = await createRoom(playerName);
      setRoomCode(code);
      setIsHost(true);
      setIsConnected(true);
      onPlayersChanged((p) => setPlayers(p));
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e) {
      Alert.alert('Error', 'Could not create room. Try again.');
    }
    setIsLoading(false);
  };

  const handleJoin = async () => {
    const code = joinCode.toUpperCase().trim();
    if (code.length !== 6) {
      Alert.alert('Error', 'Enter a valid 6-character room code.');
      return;
    }
    setIsLoading(true);
    try {
      const success = await joinRoom(code, playerName);
      if (success) {
        setRoomCode(code);
        setIsHost(false);
        setIsConnected(true);
        onPlayersChanged((p) => setPlayers(p));
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        Alert.alert('Error', 'Could not join room. Check the code and try again.');
      }
    } catch (e) {
      Alert.alert('Error', 'Connection failed. Try again.');
    }
    setIsLoading(false);
  };

  const handleShare = async () => {
    const code = getRoomCode();
    if (!code) return;
    const link = `skilly://live/${code}`;
    try {
      await Share.share({
        message: `Join my Skilly quiz! Code: ${code}\n${link}`,
      });
    } catch (e) { console.warn('Share lobby code failed:', e); }
  };

  const handleCopyCode = async () => {
    const code = getRoomCode();
    if (!code) return;
    await Clipboard.setStringAsync(code);
    setCopied(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleStartGame = async () => {
    if (players.length < 2) {
      Alert.alert('Error', t('live.needMorePlayers'));
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    // Get questions for the current skill
    const questions = getQuestionsForLesson(skillName, 1, 10);
    const filtered = questions.filter(
      (q) => q.type === 'multiple_choice' || q.type === 'true_false',
    );
    const gameQuestions = filtered.slice(0, 10);

    await startGame(gameQuestions);

    navigation.replace('LiveGame', {
      questions: gameQuestions,
      roomCode: getRoomCode(),
      playerName,
      isHost: true,
    });
  };

  const handleBack = async () => {
    await leaveRoom();
    navigation.goBack();
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((w) => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const AVATAR_COLORS = ['#FF6B35', '#6C63FF', '#34D399', '#F59E0B', '#EC4899', '#8B5CF6'];

  // ---- RENDER ----

  if (isConnected) {
    return (
      <SafeAreaView style={styles.screen} edges={['top']}>
        <AmbientGlow color={colors.primary} size={300} opacity={0.06} top={-50} left="50%" />

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('live.liveWithFriends')}</Text>
          <View style={{ width: 36 }} />
        </View>

        {/* Room Code */}
        <TouchableOpacity onPress={handleCopyCode} activeOpacity={0.7}>
          <GlassCard strong style={styles.codeCard}>
            <Text style={styles.codeLabel}>{t('live.roomCode')}</Text>
            <View style={styles.codeRow}>
              {roomCode.split('').map((char, i) => (
                <View key={i} style={styles.codeLetter}>
                  <Text style={styles.codeChar}>{char}</Text>
                </View>
              ))}
            </View>
            <Text style={styles.copyHint}>
              {copied ? t('settings.copied') : t('live.tapToCopy')}
            </Text>
          </GlassCard>
        </TouchableOpacity>

        {/* Share Button */}
        <TouchableOpacity onPress={handleShare} activeOpacity={0.7} style={styles.shareBtn}>
          <LinearGradient
            colors={[colors.primary, colors.primaryDark]}
            style={styles.shareGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Ionicons name="share-outline" size={20} color="#fff" />
            <Text style={styles.shareBtnText}>{t('live.shareRoom')}</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Players */}
        <View style={styles.playersSection}>
          <View style={styles.playersSectionHeader}>
            <Text style={styles.playersLabel}>
              {t('live.playersConnected', { count: players.length })}
            </Text>
            <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
              <View style={styles.liveDot} />
            </Animated.View>
          </View>

          <ScrollView style={styles.playersList} showsVerticalScrollIndicator={false}>
            {players.map((player, idx) => (
              <GlassCard key={player.deviceId} style={styles.playerRow}>
                <View
                  style={[
                    styles.playerAvatar,
                    { backgroundColor: AVATAR_COLORS[idx % AVATAR_COLORS.length] + '30' },
                  ]}
                >
                  <Text
                    style={[
                      styles.playerInitials,
                      { color: AVATAR_COLORS[idx % AVATAR_COLORS.length] },
                    ]}
                  >
                    {getInitials(player.name)}
                  </Text>
                </View>
                <Text style={styles.playerName}>{player.name}</Text>
                {idx === 0 && (
                  <View style={styles.hostBadge}>
                    <Text style={styles.hostBadgeText}>HOST</Text>
                  </View>
                )}
              </GlassCard>
            ))}
          </ScrollView>
        </View>

        {/* Waiting / Start */}
        {isHost ? (
          <TouchableOpacity
            onPress={handleStartGame}
            activeOpacity={0.7}
            style={[styles.startBtn, players.length < 2 && { opacity: 0.4 }]}
            disabled={players.length < 2}
          >
            <LinearGradient
              colors={[colors.primary, colors.primaryDark]}
              style={styles.startGradient}
            >
              <Ionicons name="play" size={24} color="#fff" />
              <Text style={styles.startBtnText}>{t('live.startGame')}</Text>
            </LinearGradient>
          </TouchableOpacity>
        ) : (
          <View style={styles.waitingContainer}>
            <Text style={styles.waitingText}>{t('live.waitingForHost')}</Text>
          </View>
        )}
      </SafeAreaView>
    );
  }

  // ---- NOT CONNECTED ----
  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <AmbientGlow color={colors.primary} size={300} opacity={0.06} top={-50} left="50%" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('live.liveWithFriends')}</Text>
        <View style={{ width: 36 }} />
      </View>

      {/* Tabs */}
      <View style={styles.tabRow}>
        <TouchableOpacity
          onPress={() => setTab('create')}
          style={[styles.tabBtn, tab === 'create' && styles.tabBtnActive]}
        >
          <Text style={[styles.tabText, tab === 'create' && styles.tabTextActive]}>
            {t('live.createRoom')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setTab('join')}
          style={[styles.tabBtn, tab === 'join' && styles.tabBtnActive]}
        >
          <Text style={[styles.tabText, tab === 'join' && styles.tabTextActive]}>
            {t('live.joinRoom')}
          </Text>
        </TouchableOpacity>
      </View>

      {tab === 'create' ? (
        <View style={styles.tabContent}>
          <GlassCard strong style={styles.createCard}>
            <Ionicons name="people" size={48} color={colors.primary} />
            <Text style={styles.createTitle}>{t('live.challengeFriends')}</Text>
            <Text style={styles.createSub}>{t('live.challengeSub')}</Text>
          </GlassCard>

          <TouchableOpacity onPress={handleCreate} activeOpacity={0.7} disabled={isLoading}>
            <LinearGradient
              colors={[colors.primary, colors.primaryDark]}
              style={styles.actionBtn}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Ionicons name="add-circle-outline" size={22} color="#fff" />
              <Text style={styles.actionBtnText}>
                {isLoading ? '...' : t('live.createRoom')}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.tabContent}>
          <GlassCard strong style={styles.joinCard}>
            <Text style={styles.joinLabel}>{t('live.enterCode')}</Text>
            <TextInput
              style={styles.codeInput}
              value={joinCode}
              onChangeText={(v) => setJoinCode(v.toUpperCase().slice(0, 6))}
              placeholder="ABC123"
              placeholderTextColor={colors.textMuted}
              autoCapitalize="characters"
              maxLength={6}
              autoFocus={!!initialCode}
            />
          </GlassCard>

          <TouchableOpacity
            onPress={handleJoin}
            activeOpacity={0.7}
            disabled={isLoading || joinCode.length !== 6}
            style={joinCode.length !== 6 ? { opacity: 0.4 } : {}}
          >
            <LinearGradient
              colors={[colors.secondary, colors.secondaryDark]}
              style={styles.actionBtn}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Ionicons name="enter-outline" size={22} color="#fff" />
              <Text style={styles.actionBtnText}>
                {isLoading ? '...' : t('live.join')}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.glassBg,
  },
  headerTitle: { ...typography.h3, color: colors.textPrimary },

  // Tabs
  tabRow: {
    flexDirection: 'row',
    marginHorizontal: spacing.xl,
    marginBottom: spacing.xl,
    backgroundColor: colors.glassBg,
    borderRadius: borderRadius.lg,
    padding: 4,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderRadius: borderRadius.md,
  },
  tabBtnActive: {
    backgroundColor: colors.glassStrongBg,
  },
  tabText: { ...typography.bodySmall, color: colors.textSecondary, fontWeight: '600' },
  tabTextActive: { color: colors.textPrimary },

  // Tab Content
  tabContent: { paddingHorizontal: spacing.xl, flex: 1 },

  // Create
  createCard: {
    alignItems: 'center',
    padding: spacing['4xl'],
    marginBottom: spacing.xl,
  },
  createTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginTop: spacing.lg,
    textAlign: 'center',
  },
  createSub: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    textAlign: 'center',
  },

  // Join
  joinCard: {
    padding: spacing['3xl'],
    marginBottom: spacing.xl,
  },
  joinLabel: {
    ...typography.label,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  codeInput: {
    fontSize: 32,
    fontWeight: '900',
    color: colors.textPrimary,
    textAlign: 'center',
    letterSpacing: 8,
    paddingVertical: spacing.lg,
    borderBottomWidth: 2,
    borderBottomColor: colors.glassBorder,
  },

  // Action btn
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.xl,
    gap: spacing.sm,
    ...glowShadow(colors.primary),
  },
  actionBtnText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 16,
  },

  // Connected Lobby
  codeCard: {
    alignItems: 'center',
    padding: spacing['3xl'],
    marginHorizontal: spacing.xl,
  },
  codeLabel: {
    ...typography.label,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  codeRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  codeLetter: {
    width: 44,
    height: 52,
    borderRadius: borderRadius.md,
    backgroundColor: colors.glassBg,
    borderWidth: 1,
    borderColor: colors.primary + '40',
    alignItems: 'center',
    justifyContent: 'center',
  },
  codeChar: {
    fontSize: 28,
    fontWeight: '900',
    color: colors.primary,
  },
  copyHint: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },

  // Share
  shareBtn: {
    marginHorizontal: spacing.xl,
    marginTop: spacing.lg,
  },
  shareGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    gap: spacing.sm,
  },
  shareBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },

  // Players
  playersSection: {
    flex: 1,
    marginTop: spacing.xl,
    paddingHorizontal: spacing.xl,
  },
  playersSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  playersLabel: {
    ...typography.label,
    color: colors.textSecondary,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.success,
  },
  playersList: { flex: 1 },
  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  playerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playerInitials: {
    fontWeight: '800',
    fontSize: 14,
  },
  playerName: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '600',
    marginLeft: spacing.md,
    flex: 1,
  },
  hostBadge: {
    backgroundColor: colors.primary + '20',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  hostBadgeText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '800',
  },

  // Start
  startBtn: {
    marginHorizontal: spacing.xl,
    marginBottom: spacing['4xl'],
  },
  startGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.xl,
    gap: spacing.sm,
    ...glowShadow(colors.primary),
  },
  startBtnText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 18,
  },

  // Waiting
  waitingContainer: {
    alignItems: 'center',
    paddingBottom: spacing['4xl'],
  },
  waitingText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
});
