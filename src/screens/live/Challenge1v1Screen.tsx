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
import { useStreakStore } from '../../store/streakStore';
import {
  createRoom,
  joinRoom,
  onPlayersChanged,
  onGameStarted,
  onAnswerReceived,
  startGame,
  submitAnswer,
  sendGameEnd,
  leaveRoom,
  getRoomCode,
  getPlayers,
  getDeviceIdSync,
  LivePlayer,
  LiveAnswer,
} from '../../services/liveGame';
import { getQuestionsForLesson } from '../../utils/gameQuestions';
import type { GameQuestion } from '../../utils/gameQuestions';
import { colors, spacing, typography, borderRadius, glowShadow } from '../../utils/theme';
import { t } from '../../i18n';

const SCREEN_WIDTH = Dimensions.get('window').width;
const TOTAL_TIME = 60;
const TOTAL_QUESTIONS = 10;
const BASE_POINTS = 100;
const MAX_SPEED_BONUS = 50;

// Colors for each side
const RED_SIDE = '#EF4444';
const RED_DARK = '#B91C1C';
const BLUE_SIDE = '#3B82F6';
const BLUE_DARK = '#1D4ED8';

type Phase = 'setup' | 'waiting' | 'countdown' | 'playing' | 'result';

export function Challenge1v1Screen({ navigation, route }: { navigation: any; route: any }) {
  const profile = useUserStore((s) => s.profile);
  const playerName = profile?.username || 'Player';
  const skillName = profile?.selected_skill_id || 'General';
  const updateAchievementStats = useStreakStore((s) => s.updateAchievementStats);

  const initialCode = route.params?.roomCode || '';
  const initialMode = route.params?.mode === 'join' || initialCode ? 'join' : 'create';

  const [phase, setPhase] = useState<Phase>('setup');
  const [tab, setTab] = useState<'create' | 'join'>(initialMode);
  const [roomCode, setRoomCode] = useState('');
  const [joinCode, setJoinCode] = useState(initialCode);
  const [players, setPlayers] = useState<LivePlayer[]>([]);
  const [isHost, setIsHost] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Game state
  const [questions, setQuestions] = useState<GameQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [myScore, setMyScore] = useState(0);
  const [myCorrect, setMyCorrect] = useState(0);
  const [opponentScore, setOpponentScore] = useState(0);
  const [opponentCorrect, setOpponentCorrect] = useState(0);
  const [opponentIndex, setOpponentIndex] = useState(0);
  const [countdownValue, setCountdownValue] = useState(3);

  // Result state
  const [finalPlayers, setFinalPlayers] = useState<LivePlayer[]>([]);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const questionStartRef = useRef<number>(Date.now());
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const countdownAnim = useRef(new Animated.Value(1)).current;

  const myDeviceId = getDeviceIdSync();
  const currentQuestion = questions[currentIndex];
  const isLastQuestion = currentIndex >= questions.length - 1;

  // Get opponent from players
  const opponent = players.find((p) => p.deviceId !== myDeviceId);

  // Pulse animation for waiting phase
  useEffect(() => {
    if (phase === 'waiting') {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.1, duration: 800, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        ]),
      );
      pulse.start();
      return () => pulse.stop();
    }
  }, [phase]);

  // Auto-join if code provided
  useEffect(() => {
    if (initialCode && initialMode === 'join') {
      handleJoin();
    }
  }, []);

  // Listen for opponent joining (host: auto-start when 2 players)
  useEffect(() => {
    if (phase === 'waiting' && isHost) {
      onPlayersChanged((p) => {
        setPlayers(p);
        if (p.length >= 2) {
          // 2 players connected, start the game
          const gameQuestions = getQuestionsForLesson(skillName, 1, TOTAL_QUESTIONS)
            .filter((q) => q.type === 'multiple_choice' || q.type === 'true_false')
            .slice(0, TOTAL_QUESTIONS);
          setQuestions(gameQuestions);
          startGame(gameQuestions);
          startCountdown(gameQuestions);
        }
      });
    }
  }, [phase, isHost]);

  // Non-host: listen for game_start
  useEffect(() => {
    if (phase === 'waiting' && !isHost) {
      onGameStarted((state) => {
        setQuestions(state.questions);
        startCountdown(state.questions);
      });
    }
  }, [phase, isHost]);

  // Listen for opponent answers during gameplay
  useEffect(() => {
    if (phase === 'playing') {
      onAnswerReceived((answer: LiveAnswer) => {
        if (answer.deviceId !== myDeviceId) {
          setOpponentScore((prev) => prev + answer.points);
          setOpponentCorrect((prev) => prev + (answer.correct ? 1 : 0));
          setOpponentIndex((prev) => Math.max(prev, answer.questionIndex + 1));
        }
      });
      onPlayersChanged((p) => setPlayers(p));
    }
  }, [phase]);

  const startCountdown = (gameQs: GameQuestion[]) => {
    setPhase('countdown');
    setCountdownValue(3);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    let count = 3;
    const cdInterval = setInterval(() => {
      count--;
      if (count <= 0) {
        clearInterval(cdInterval);
        setPhase('playing');
        questionStartRef.current = Date.now();
        startGlobalTimer();
      } else {
        setCountdownValue(count);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
    }, 1000);
  };

  const startGlobalTimer = () => {
    setTimeLeft(TOTAL_TIME);
    progressAnim.setValue(1);
    Animated.timing(progressAnim, {
      toValue: 0,
      duration: TOTAL_TIME * 1000,
      useNativeDriver: false,
    }).start();

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          finishGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleAnswer = useCallback((answer: string) => {
    if (selectedAnswer !== null || phase !== 'playing') return;

    const timeMs = Date.now() - questionStartRef.current;
    const correct = answer === String(currentQuestion.correctAnswer);
    const speedBonus = correct
      ? Math.round(MAX_SPEED_BONUS * Math.max(0, 1 - timeMs / 10000))
      : 0;
    const points = correct ? BASE_POINTS + speedBonus : 0;

    setSelectedAnswer(answer);

    if (correct) {
      setMyScore((prev) => prev + points);
      setMyCorrect((prev) => prev + 1);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }

    submitAnswer(currentIndex, answer, timeMs, correct, points, playerName);

    // Auto-advance after brief delay
    setTimeout(() => {
      if (currentIndex < questions.length - 1) {
        setCurrentIndex((prev) => prev + 1);
        setSelectedAnswer(null);
        questionStartRef.current = Date.now();

        // Question entrance animation
        fadeAnim.setValue(0);
        scaleAnim.setValue(0.8);
        Animated.parallel([
          Animated.timing(fadeAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
          Animated.spring(scaleAnim, { toValue: 1, friction: 6, useNativeDriver: true }),
        ]).start();
      } else {
        finishGame();
      }
    }, 800);
  }, [selectedAnswer, phase, currentIndex, currentQuestion, questions.length]);

  const finishGame = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (isHost) sendGameEnd();

    const fp = getPlayers().sort((a, b) => b.score - a.score);
    setFinalPlayers(fp);
    setPhase('result');

    // Track achievement
    const currentStats = useStreakStore.getState().achievementStats;
    updateAchievementStats({ liveGamesPlayed: currentStats.liveGamesPlayed + 1 });

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, [isHost]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // ---- HANDLERS ----

  const handleCreate = async () => {
    setIsLoading(true);
    try {
      const code = await createRoom(playerName);
      setRoomCode(code);
      setIsHost(true);
      setPhase('waiting');
      onPlayersChanged((p) => setPlayers(p));
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e) {
      Alert.alert('Error', 'Could not create room. Try again.');
    }
    setIsLoading(false);
  };

  const handleJoin = async () => {
    const code = (joinCode || initialCode).toUpperCase().trim();
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
        setPhase('waiting');
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
    try {
      await Share.share({
        message: `Challenge me in Skilly 1v1! Code: ${code}\nskilly://challenge/${code}`,
      });
    } catch (e) { console.warn('Share 1v1 code failed:', e); }
  };

  const handleCopyCode = async () => {
    const code = getRoomCode();
    if (!code) return;
    await Clipboard.setStringAsync(code);
    setCopied(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleBack = async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    await leaveRoom();
    navigation.goBack();
  };

  const handlePlayAgain = async () => {
    await leaveRoom();
    setPhase('setup');
    setTab('create');
    setRoomCode('');
    setJoinCode('');
    setPlayers([]);
    setIsHost(false);
    setQuestions([]);
    setCurrentIndex(0);
    setTimeLeft(TOTAL_TIME);
    setSelectedAnswer(null);
    setShowResult(false);
    setMyScore(0);
    setMyCorrect(0);
    setOpponentScore(0);
    setOpponentCorrect(0);
    setOpponentIndex(0);
    setFinalPlayers([]);
  };

  const handleGoHome = async () => {
    await leaveRoom();
    navigation.popToTop();
  };

  const getInitials = (name: string) =>
    name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);

  // ================================================================
  // RENDER: SETUP PHASE
  // ================================================================
  if (phase === 'setup') {
    return (
      <SafeAreaView style={styles.screen} edges={['top']}>
        <AmbientGlow color={RED_SIDE} size={200} opacity={0.05} top={-40} left="20%" />
        <AmbientGlow color={BLUE_SIDE} size={200} opacity={0.05} top={-40} left="80%" />

        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>1v1 Challenge</Text>
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
            <GlassCard strong style={styles.setupCard}>
              <View style={styles.vsContainer}>
                <View style={[styles.vsCircle, { backgroundColor: RED_SIDE + '20' }]}>
                  <Ionicons name="person" size={28} color={RED_SIDE} />
                </View>
                <Text style={styles.vsText}>VS</Text>
                <View style={[styles.vsCircle, { backgroundColor: BLUE_SIDE + '20' }]}>
                  <Ionicons name="person" size={28} color={BLUE_SIDE} />
                </View>
              </View>
              <Text style={styles.setupTitle}>1v1 Challenge</Text>
              <Text style={styles.setupSub}>Head-to-head, 10 questions, 60 seconds</Text>
            </GlassCard>

            <TouchableOpacity onPress={handleCreate} activeOpacity={0.7} disabled={isLoading}>
              <LinearGradient
                colors={[RED_SIDE, RED_DARK]}
                style={styles.actionBtn}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Ionicons name="flash" size={22} color="#fff" />
                <Text style={styles.actionBtnText}>
                  {isLoading ? '...' : 'Create Challenge'}
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
                colors={[BLUE_SIDE, BLUE_DARK]}
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

  // ================================================================
  // RENDER: WAITING PHASE
  // ================================================================
  if (phase === 'waiting') {
    return (
      <SafeAreaView style={styles.screen} edges={['top']}>
        <AmbientGlow color={isHost ? RED_SIDE : BLUE_SIDE} size={300} opacity={0.06} top={-50} left="50%" />

        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>1v1 Challenge</Text>
          <View style={{ width: 36 }} />
        </View>

        {/* Room Code */}
        <TouchableOpacity onPress={handleCopyCode} activeOpacity={0.7}>
          <GlassCard strong style={styles.codeCard}>
            <Text style={styles.codeLabel}>CHALLENGE CODE</Text>
            <View style={styles.codeRow}>
              {(roomCode || getRoomCode() || '').split('').map((char, i) => (
                <View key={i} style={[styles.codeLetter, { borderColor: (isHost ? RED_SIDE : BLUE_SIDE) + '40' }]}>
                  <Text style={[styles.codeChar, { color: isHost ? RED_SIDE : BLUE_SIDE }]}>{char}</Text>
                </View>
              ))}
            </View>
            <Text style={styles.copyHint}>
              {copied ? 'Copied!' : t('live.tapToCopy')}
            </Text>
          </GlassCard>
        </TouchableOpacity>

        {/* Share */}
        <TouchableOpacity onPress={handleShare} activeOpacity={0.7} style={styles.shareBtn}>
          <LinearGradient
            colors={isHost ? [RED_SIDE, RED_DARK] : [BLUE_SIDE, BLUE_DARK]}
            style={styles.shareGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Ionicons name="share-outline" size={20} color="#fff" />
            <Text style={styles.shareBtnText}>Share Challenge</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* VS Display */}
        <View style={styles.waitingVsContainer}>
          <View style={styles.waitingPlayer}>
            <View style={[styles.waitingAvatar, { backgroundColor: RED_SIDE + '20', borderColor: RED_SIDE }]}>
              <Text style={[styles.waitingInitials, { color: RED_SIDE }]}>
                {isHost ? getInitials(playerName) : (opponent ? getInitials(opponent.name) : '?')}
              </Text>
            </View>
            <Text style={styles.waitingName} numberOfLines={1}>
              {isHost ? playerName : (opponent?.name || '...')}
            </Text>
          </View>

          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <Text style={styles.waitingVs}>VS</Text>
          </Animated.View>

          <View style={styles.waitingPlayer}>
            <View style={[styles.waitingAvatar, { backgroundColor: BLUE_SIDE + '20', borderColor: players.length >= 2 ? BLUE_SIDE : colors.textMuted }]}>
              <Text style={[styles.waitingInitials, { color: players.length >= 2 ? BLUE_SIDE : colors.textMuted }]}>
                {!isHost ? getInitials(playerName) : (opponent ? getInitials(opponent.name) : '?')}
              </Text>
            </View>
            <Text style={styles.waitingName} numberOfLines={1}>
              {!isHost ? playerName : (opponent?.name || 'Waiting...')}
            </Text>
          </View>
        </View>

        <View style={styles.waitingFooter}>
          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <View style={styles.waitingDot} />
          </Animated.View>
          <Text style={styles.waitingText}>
            {players.length >= 2 ? 'Starting...' : 'Waiting for opponent...'}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // ================================================================
  // RENDER: COUNTDOWN PHASE
  // ================================================================
  if (phase === 'countdown') {
    return (
      <SafeAreaView style={styles.screen} edges={['top']}>
        <View style={styles.countdownContainer}>
          <Text style={styles.countdownLabel}>GET READY</Text>
          <Text style={styles.countdownNumber}>{countdownValue}</Text>
          <View style={styles.countdownVs}>
            <Text style={[styles.countdownPlayer, { color: RED_SIDE }]}>
              {isHost ? playerName : (opponent?.name || 'Opponent')}
            </Text>
            <Text style={styles.countdownVsText}>VS</Text>
            <Text style={[styles.countdownPlayer, { color: BLUE_SIDE }]}>
              {!isHost ? playerName : (opponent?.name || 'Opponent')}
            </Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // ================================================================
  // RENDER: RESULT PHASE
  // ================================================================
  if (phase === 'result') {
    const meInResults = finalPlayers.find((p) => p.deviceId === myDeviceId);
    const oppInResults = finalPlayers.find((p) => p.deviceId !== myDeviceId);
    const iWon = meInResults && oppInResults ? meInResults.score > oppInResults.score : false;
    const isDraw = meInResults && oppInResults ? meInResults.score === oppInResults.score : false;

    return (
      <SafeAreaView style={styles.screen} edges={['top']}>
        <AmbientGlow
          color={iWon ? '#FFD700' : isDraw ? colors.primary : RED_SIDE}
          size={350}
          opacity={0.08}
          top={-80}
          left="50%"
        />

        <View style={styles.resultContent}>
          {/* Result Header */}
          <Text style={styles.resultTitle}>
            {isDraw ? 'Draw!' : iWon ? 'You Won!' : 'You Lost!'}
          </Text>
          <Text style={styles.resultSubtitle}>1v1 Challenge Complete</Text>

          {/* Score Comparison */}
          <View style={styles.resultVsContainer}>
            {/* Player 1 (me) */}
            <View style={styles.resultPlayerCard}>
              <LinearGradient
                colors={[RED_SIDE + '20', RED_SIDE + '05']}
                style={styles.resultPlayerGradient}
              >
                <View style={[styles.resultAvatar, { borderColor: RED_SIDE }]}>
                  <Text style={[styles.resultAvatarText, { color: RED_SIDE }]}>
                    {getInitials(meInResults?.name || playerName)}
                  </Text>
                </View>
                <Text style={styles.resultPlayerName} numberOfLines={1}>
                  {meInResults?.name || playerName}
                </Text>
                <Text style={[styles.resultPlayerScore, { color: RED_SIDE }]}>
                  {meInResults?.score || myScore}
                </Text>
                <Text style={styles.resultPlayerLabel}>points</Text>
                <Text style={styles.resultPlayerStat}>
                  {meInResults?.correctCount || myCorrect}/{TOTAL_QUESTIONS} correct
                </Text>
              </LinearGradient>
            </View>

            <View style={styles.resultVsDivider}>
              <Text style={styles.resultVsText}>VS</Text>
            </View>

            {/* Player 2 (opponent) */}
            <View style={styles.resultPlayerCard}>
              <LinearGradient
                colors={[BLUE_SIDE + '20', BLUE_SIDE + '05']}
                style={styles.resultPlayerGradient}
              >
                <View style={[styles.resultAvatar, { borderColor: BLUE_SIDE }]}>
                  <Text style={[styles.resultAvatarText, { color: BLUE_SIDE }]}>
                    {getInitials(oppInResults?.name || 'OP')}
                  </Text>
                </View>
                <Text style={styles.resultPlayerName} numberOfLines={1}>
                  {oppInResults?.name || 'Opponent'}
                </Text>
                <Text style={[styles.resultPlayerScore, { color: BLUE_SIDE }]}>
                  {oppInResults?.score || opponentScore}
                </Text>
                <Text style={styles.resultPlayerLabel}>points</Text>
                <Text style={styles.resultPlayerStat}>
                  {oppInResults?.correctCount || opponentCorrect}/{TOTAL_QUESTIONS} correct
                </Text>
              </LinearGradient>
            </View>
          </View>

          {/* Winner badge */}
          {!isDraw && (
            <GlassCard strong style={styles.winnerBadge}>
              <Ionicons name="trophy" size={20} color="#FFD700" />
              <Text style={styles.winnerBadgeText}>
                {iWon ? 'Victory!' : `${oppInResults?.name || 'Opponent'} wins`}
              </Text>
            </GlassCard>
          )}

          {/* Actions */}
          <View style={styles.resultButtons}>
            <TouchableOpacity onPress={handlePlayAgain} activeOpacity={0.7}>
              <LinearGradient
                colors={[RED_SIDE, BLUE_SIDE]}
                style={styles.primaryBtn}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Ionicons name="refresh" size={20} color="#fff" />
                <Text style={styles.primaryBtnText}>Rematch</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleGoHome} activeOpacity={0.7}>
              <Text style={styles.goHomeText}>{t('gameResult.continue')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // ================================================================
  // RENDER: PLAYING PHASE
  // ================================================================
  const options =
    currentQuestion?.type === 'true_false'
      ? ['True', 'False']
      : currentQuestion?.options || [];

  const OPTION_COLORS = [
    [RED_SIDE, RED_DARK],
    [BLUE_SIDE, BLUE_DARK],
    ['#34D399', '#059669'],
    ['#F59E0B', '#D97706'],
  ];

  const getOptionStyle = (option: string) => {
    if (!selectedAnswer) return {};
    const isCorrect = option === String(currentQuestion?.correctAnswer);
    const isSelected = option === selectedAnswer;
    if (isCorrect) return { borderColor: colors.success, borderWidth: 2 };
    if (isSelected && !isCorrect) return { borderColor: colors.error, borderWidth: 2 };
    return { opacity: 0.4 };
  };

  // Progress bars
  const myProgress = Math.min((currentIndex + (selectedAnswer ? 1 : 0)) / TOTAL_QUESTIONS, 1);
  const oppProgress = Math.min(opponentIndex / TOTAL_QUESTIONS, 1);

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      {/* Top bar: scores side by side */}
      <View style={styles.gameTopBar}>
        {/* My side (red) */}
        <View style={styles.sideScore}>
          <Text style={[styles.sideScoreLabel, { color: RED_SIDE }]}>
            {playerName.slice(0, 8)}
          </Text>
          <Text style={[styles.sideScoreValue, { color: RED_SIDE }]}>{myScore}</Text>
        </View>

        {/* Timer */}
        <View style={[styles.timerCircle, timeLeft <= 10 && { borderColor: colors.error }]}>
          <Text style={[styles.timerText, timeLeft <= 10 && { color: colors.error }]}>
            {timeLeft}
          </Text>
        </View>

        {/* Opponent side (blue) */}
        <View style={styles.sideScore}>
          <Text style={[styles.sideScoreLabel, { color: BLUE_SIDE }]}>
            {(opponent?.name || 'Opponent').slice(0, 8)}
          </Text>
          <Text style={[styles.sideScoreValue, { color: BLUE_SIDE }]}>{opponentScore}</Text>
        </View>
      </View>

      {/* Progress bars */}
      <View style={styles.progressBars}>
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBarFill, { width: `${myProgress * 100}%`, backgroundColor: RED_SIDE }]} />
        </View>
        <Text style={styles.progressQuestion}>{currentIndex + 1}/{TOTAL_QUESTIONS}</Text>
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBarFill, { width: `${oppProgress * 100}%`, backgroundColor: BLUE_SIDE }]} />
        </View>
      </View>

      {/* Global timer bar */}
      <View style={styles.timerBar}>
        <Animated.View
          style={[
            styles.timerFill,
            {
              width: progressAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%'],
              }),
              backgroundColor: timeLeft <= 10 ? colors.error : colors.primary,
            },
          ]}
        />
      </View>

      {/* Question */}
      <View style={styles.questionContainer}>
        <Text style={styles.questionText}>{currentQuestion?.prompt}</Text>
      </View>

      {/* Options */}
      <View style={styles.optionsContainer}>
        {options.map((option, idx) => {
          const optColors = OPTION_COLORS[idx % OPTION_COLORS.length];
          return (
            <TouchableOpacity
              key={option}
              onPress={() => handleAnswer(option)}
              disabled={selectedAnswer !== null}
              activeOpacity={0.7}
              style={[styles.optionWrapper, getOptionStyle(option)]}
            >
              <LinearGradient
                colors={
                  selectedAnswer && option === String(currentQuestion?.correctAnswer)
                    ? [colors.success, colors.successDark]
                    : selectedAnswer && option === selectedAnswer
                      ? [colors.error, '#B91C1C']
                      : [optColors[0] + '20', optColors[1] + '20']
                }
                style={styles.optionGradient}
              >
                <Text
                  style={[
                    styles.optionText,
                    selectedAnswer && option === String(currentQuestion?.correctAnswer) && {
                      color: '#fff',
                      fontWeight: '800',
                    },
                  ]}
                >
                  {option}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },

  // Header
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
  tabBtnActive: { backgroundColor: colors.glassStrongBg },
  tabText: { ...typography.bodySmall, color: colors.textSecondary, fontWeight: '600' },
  tabTextActive: { color: colors.textPrimary },

  // Tab Content
  tabContent: { paddingHorizontal: spacing.xl, flex: 1 },

  // Setup
  setupCard: {
    alignItems: 'center',
    padding: spacing['4xl'],
    marginBottom: spacing.xl,
  },
  vsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    marginBottom: spacing.xl,
  },
  vsCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vsText: {
    fontSize: 24,
    fontWeight: '900',
    color: colors.textPrimary,
    letterSpacing: 2,
  },
  setupTitle: {
    ...typography.h2,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  setupSub: {
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
    ...glowShadow(RED_SIDE),
  },
  actionBtnText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 16,
  },

  // Waiting - Code
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  codeChar: {
    fontSize: 28,
    fontWeight: '900',
  },
  copyHint: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
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

  // Waiting VS
  waitingVsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    marginTop: spacing['4xl'],
    flex: 1,
  },
  waitingPlayer: {
    alignItems: 'center',
    flex: 1,
  },
  waitingAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  waitingInitials: {
    fontSize: 22,
    fontWeight: '900',
  },
  waitingName: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '700',
    maxWidth: 100,
    textAlign: 'center',
  },
  waitingVs: {
    fontSize: 28,
    fontWeight: '900',
    color: colors.textSecondary,
    letterSpacing: 3,
    marginHorizontal: spacing.xl,
  },
  waitingFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingBottom: spacing['4xl'],
  },
  waitingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.success,
  },
  waitingText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },

  // Countdown
  countdownContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countdownLabel: {
    ...typography.label,
    color: colors.textSecondary,
    letterSpacing: 6,
    marginBottom: spacing.xl,
  },
  countdownNumber: {
    fontSize: 96,
    fontWeight: '900',
    color: colors.textPrimary,
  },
  countdownVs: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    marginTop: spacing['3xl'],
  },
  countdownPlayer: {
    ...typography.body,
    fontWeight: '800',
  },
  countdownVsText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    fontWeight: '900',
    letterSpacing: 2,
  },

  // Game - Top bar
  gameTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
  },
  sideScore: {
    alignItems: 'center',
    flex: 1,
  },
  sideScoreLabel: {
    ...typography.caption,
    fontWeight: '700',
    letterSpacing: 1,
  },
  sideScoreValue: {
    fontSize: 24,
    fontWeight: '900',
  },
  timerCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerText: {
    fontSize: 20,
    fontWeight: '900',
    color: colors.primary,
  },

  // Progress bars
  progressBars: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    marginTop: spacing.sm,
    gap: spacing.sm,
  },
  progressBarContainer: {
    flex: 1,
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressQuestion: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '800',
    minWidth: 30,
    textAlign: 'center',
  },

  // Timer bar
  timerBar: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.06)',
    marginHorizontal: spacing.xl,
    borderRadius: 2,
    overflow: 'hidden',
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  timerFill: {
    height: '100%',
    borderRadius: 2,
  },

  // Question
  questionContainer: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing['3xl'],
    flex: 1,
    justifyContent: 'center',
  },
  questionText: {
    ...typography.h2,
    color: colors.textPrimary,
    textAlign: 'center',
    lineHeight: 32,
  },

  // Options
  optionsContainer: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing['4xl'],
    gap: spacing.md,
  },
  optionWrapper: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  optionGradient: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    borderRadius: borderRadius.lg,
  },
  optionText: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '600',
    textAlign: 'center',
  },

  // Result
  resultContent: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    justifyContent: 'center',
  },
  resultTitle: {
    ...typography.h1,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  resultSubtitle: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing['3xl'],
  },
  resultVsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  resultPlayerCard: {
    flex: 1,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
  },
  resultPlayerGradient: {
    alignItems: 'center',
    paddingVertical: spacing['3xl'],
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.xl,
  },
  resultAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  resultAvatarText: {
    fontSize: 20,
    fontWeight: '900',
  },
  resultPlayerName: {
    ...typography.bodySmall,
    color: colors.textPrimary,
    fontWeight: '700',
    marginBottom: spacing.md,
    maxWidth: 100,
    textAlign: 'center',
  },
  resultPlayerScore: {
    fontSize: 36,
    fontWeight: '900',
  },
  resultPlayerLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  resultPlayerStat: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  resultVsDivider: {
    paddingHorizontal: spacing.md,
  },
  resultVsText: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.textSecondary,
    letterSpacing: 2,
  },
  winnerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  winnerBadgeText: {
    ...typography.body,
    color: '#FFD700',
    fontWeight: '800',
  },
  resultButtons: {
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.xl,
    gap: spacing.sm,
    ...glowShadow(colors.primary),
  },
  primaryBtnText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 16,
  },
  goHomeText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingVertical: spacing.md,
  },
});
