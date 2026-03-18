import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, borderRadius, typography } from '../../utils/theme';
import { useChallengeStore } from '../../store/challengeStore';
import { useStreakStore } from '../../store/streakStore';
import { useUserStore } from '../../store/userStore';
import { useTimer } from '../../hooks/useTimer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Haptics from 'expo-haptics';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export function PracticeSessionScreen() {
  const navigation = useNavigation<any>();
  const profile = useUserStore((s) => s.profile);
  const challenge = useChallengeStore((s) => s.currentChallenge);
  const recordPractice = useStreakStore((s) => s.recordPractice);

  const durationSeconds = (challenge?.duration_minutes ?? 5) * 60;
  const { remaining, isRunning, isPaused, start, pause, resume, reset, progress } =
    useTimer(durationSeconds);

  const [capturedUri, setCapturedUri] = useState<string | null>(null);
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();

  useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
  }, [permission]);

  // Auto-start timer on mount
  useEffect(() => {
    start();
  }, []);

  // Haptic at 60 seconds remaining
  useEffect(() => {
    if (remaining === 60 && isRunning) {
      try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning); } catch {}
    }
  }, [remaining, isRunning]);

  // Timer complete handler
  useEffect(() => {
    if (remaining === 0 && !isRunning && !isPaused) {
      try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch {}
      handleTimerComplete();
    }
  }, [remaining, isRunning, isPaused]);

  const handleTimerComplete = () => {
    Alert.alert(
      'Time\'s Up!',
      'Your practice time is complete. Submit your session?',
      [
        { text: 'Continue', style: 'cancel', onPress: () => start() },
        { text: 'Submit', style: 'default', onPress: () => handleSubmit(null) },
      ]
    );
  };

  const handleClose = () => {
    pause();
    Alert.alert(
      'End Session?',
      'Your progress will be lost.',
      [
        { text: 'Continue', style: 'cancel', onPress: () => resume() },
        { text: 'End', style: 'destructive', onPress: () => navigation.goBack() },
      ]
    );
  };

  const handleCapture = async () => {
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy); } catch {}
    // If timer hasn't started or is done, this is the "Done" button
    if (!isRunning && remaining === 0) {
      await handleSubmit(null);
      return;
    }

    // If timer is running, try to take a photo (optional)
    if (cameraRef.current?.takePictureAsync) {
      try {
        const photo = await cameraRef.current.takePictureAsync({ quality: 0.7 });
        setCapturedUri(photo.uri);
      } catch {
        // Camera capture may fail if not ready
      }
    }

    // Show confirmation — don't auto-submit
    Alert.alert(
      'Finish Early?',
      'Submit your practice now or keep going?',
      [
        { text: 'Keep Going', style: 'cancel' },
        { text: 'Submit', style: 'default', onPress: () => handleSubmit(capturedUri) },
      ]
    );
  };

  const handleSubmit = async (mediaUri: string | null) => {
    pause();

    if (!profile?.id || !challenge) {
      navigation.goBack();
      return;
    }

    // Record practice for streak
    await recordPractice();

    // Increment local practice count
    const countStr = await AsyncStorage.getItem('practice_count');
    const count = countStr ? parseInt(countStr, 10) + 1 : 1;
    await AsyncStorage.setItem('practice_count', count.toString());

    // Generate feedback locally (no Supabase needed)
    const feedback = {
      strengths: ['You showed up and practiced!', 'Great consistency!'],
      mistakes: [],
      improvement_tip: 'Try to focus on one specific aspect each session for faster improvement.',
      encouragement: 'Amazing work! Keep showing up every day and you\'ll see incredible progress.',
      score: 75,
    };

    // Mark roadmap node as completed locally
    const roadmap = useChallengeStore.getState().roadmap;
    const todayNode = roadmap.find((r) => r.node_id === challenge.node_id);
    if (todayNode && !todayNode.completed_at) {
      const updatedRoadmap = roadmap.map((r) =>
        r.id === todayNode.id ? { ...r, completed_at: new Date().toISOString() } : r
      );
      await AsyncStorage.setItem('user_roadmap', JSON.stringify(updatedRoadmap));
      useChallengeStore.setState({ roadmap: updatedRoadmap });
    }

    try {
      // Navigate to feedback screen
      navigation.replace('AIFeedback', {
        feedback,
        sessionId: `local-${Date.now()}`,
        challengeTitle: challenge.title,
        skillName: challenge.skill_id,
        duration: challenge.duration_minutes,
        dayNumber: todayNode?.day_number ?? 1,
      });
    } catch {
      navigation.goBack();
    }
  };

  const handlePauseResume = () => {
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch {}
    if (isRunning) {
      pause();
    } else if (isPaused) {
      resume();
    }
  };

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        {/* Top Controls */}
        <View style={styles.topBar}>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <Text style={styles.closeIcon}>✕</Text>
          </TouchableOpacity>

          <View style={styles.timerContainer}>
            <Text style={styles.timerText}>{formatTime(remaining)}</Text>
          </View>

          <TouchableOpacity onPress={handlePauseResume} style={styles.pauseButton}>
            <Text style={styles.pauseIcon}>{isRunning ? '⏸' : '▶'}</Text>
          </TouchableOpacity>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressBarContainer}>
          <View style={styles.progressBarBg}>
            <LinearGradient
              colors={[colors.primary, colors.primaryDark]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.progressBarFill, { width: `${Math.min(progress * 100, 100)}%` }]}
            />
          </View>
        </View>

        {/* Camera Preview Area */}
        <View style={styles.cameraArea}>
          {permission?.granted ? (
            <CameraView
              ref={cameraRef}
              style={styles.camera}
              facing="back"
            />
          ) : (
            <View style={styles.cameraPlaceholder}>
              <Text style={styles.cameraPlaceholderIcon}>📹</Text>
              <Text style={styles.cameraPlaceholderText}>Camera Access Required</Text>
              <TouchableOpacity onPress={requestPermission}>
                <Text style={styles.cameraPlaceholderSub}>Tap to enable camera</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Challenge Description */}
        {challenge && (
          <View style={styles.descriptionContainer}>
            <Text style={styles.descriptionText} numberOfLines={3}>
              {challenge.description}
            </Text>
          </View>
        )}

        {/* Bottom Controls */}
        <View style={styles.bottomControls}>
          <TouchableOpacity style={styles.sideButton} onPress={handleCapture}>
            <Text style={styles.sideButtonIcon}>📷</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.recordButton}
            activeOpacity={0.8}
            onPress={handleCapture}
          >
            <LinearGradient
              colors={[colors.primary, colors.primaryDark]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.recordGradient}
            >
              <View style={styles.recordInner} />
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity style={styles.sideButton}>
            <Text style={styles.sideButtonIcon}>🎙</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#000000',
  },
  safe: {
    flex: 1,
  },

  // Top Bar
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeIcon: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  timerContainer: {
    alignItems: 'center',
  },
  timerText: {
    ...typography.timer,
    color: '#FFFFFF',
    fontVariant: ['tabular-nums'],
  },
  pauseButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pauseIcon: {
    color: '#FFFFFF',
    fontSize: 16,
  },

  // Progress Bar
  progressBarContainer: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
  },
  progressBarBg: {
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 2,
  },

  // Camera Area
  cameraArea: {
    flex: 1,
    marginHorizontal: spacing.xl,
    marginVertical: spacing.lg,
    borderRadius: borderRadius['2xl'],
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  camera: {
    flex: 1,
  },
  cameraPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing['2xl'],
  },
  cameraPlaceholderIcon: {
    fontSize: 48,
    marginBottom: spacing.lg,
  },
  cameraPlaceholderText: {
    ...typography.body,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  cameraPlaceholderSub: {
    ...typography.bodySmall,
    color: colors.textMuted,
    marginTop: spacing.sm,
    textAlign: 'center',
  },

  // Description
  descriptionContainer: {
    paddingHorizontal: spacing['2xl'],
    paddingBottom: spacing.lg,
  },
  descriptionText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },

  // Bottom Controls
  bottomControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: spacing['4xl'],
    gap: spacing['3xl'],
  },
  sideButton: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.full,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sideButtonIcon: {
    fontSize: 22,
  },
  recordButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    padding: 3,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  recordGradient: {
    flex: 1,
    borderRadius: 33,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordInner: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
  },
});
