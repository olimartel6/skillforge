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
import { supabase } from '../../services/supabase';
import { analyzePractice } from '../../services/aiCoach';

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

  const [isRecording, setIsRecording] = useState(false);
  const [capturedUri, setCapturedUri] = useState<string | null>(null);
  const cameraRef = useRef<any>(null);

  // Auto-start timer on mount
  useEffect(() => {
    start();
  }, []);

  // Timer complete handler
  useEffect(() => {
    if (remaining === 0 && !isRunning && !isPaused) {
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
    // If expo-camera is available, take a photo
    if (cameraRef.current?.takePictureAsync) {
      try {
        const photo = await cameraRef.current.takePictureAsync({ quality: 0.7 });
        setCapturedUri(photo.uri);
        await handleSubmit(photo.uri);
      } catch (err) {
        console.error('Camera capture error:', err);
        // Fallback: submit without media
        await handleSubmit(null);
      }
    } else {
      // No camera — submit without media
      await handleSubmit(null);
    }
  };

  const handleSubmit = async (mediaUri: string | null) => {
    pause();

    if (!profile?.id || !challenge) {
      navigation.goBack();
      return;
    }

    let mediaUrl: string | null = null;

    // Upload media if captured
    if (mediaUri) {
      try {
        const ext = mediaUri.split('.').pop() || 'jpg';
        const fileName = `${profile.id}/${Date.now()}.${ext}`;
        const response = await fetch(mediaUri);
        const blob = await response.blob();

        const { error: uploadError } = await supabase.storage
          .from('practice-media')
          .upload(fileName, blob, { contentType: `image/${ext}` });

        if (!uploadError) {
          const { data: urlData } = supabase.storage
            .from('practice-media')
            .getPublicUrl(fileName);
          mediaUrl = urlData.publicUrl;
        }
      } catch (err) {
        console.error('Upload error:', err);
      }
    }

    // Create practice session record
    try {
      const { data: session, error: sessionError } = await supabase
        .from('practice_sessions')
        .insert({
          user_id: profile.id,
          challenge_id: challenge.id,
          skill_id: challenge.skill_id,
          media_url: mediaUrl,
          media_type: 'photo' as const,
          is_shared: false,
        })
        .select()
        .single();

      if (sessionError) throw sessionError;

      // Record practice for streak
      await recordPractice(profile.id);

      // Request AI feedback
      let feedback = null;
      if (mediaUrl) {
        try {
          feedback = await analyzePractice(mediaUrl, 'photo', challenge.id);
        } catch (err) {
          console.error('AI analysis error:', err);
          feedback = {
            strengths: [],
            mistakes: [],
            improvement_tip: '',
            encouragement: 'Great job completing your practice!',
            score: 0,
            error: true,
            message: 'Could not analyze your practice. Try again later.',
          };
        }
      } else {
        feedback = {
          strengths: ['You showed up and practiced!'],
          mistakes: [],
          improvement_tip: 'Try capturing your practice next time for detailed feedback.',
          encouragement: 'Consistency is key. Keep going!',
          score: 70,
        };
      }

      // Update session with feedback
      if (session && feedback) {
        await supabase
          .from('practice_sessions')
          .update({ ai_feedback: feedback })
          .eq('id', session.id);
      }

      // Mark roadmap node as completed
      const roadmap = useChallengeStore.getState().roadmap;
      const todayNode = roadmap.find((r) => r.node_id === challenge.node_id);
      if (todayNode && !todayNode.completed_at) {
        await supabase
          .from('user_roadmap')
          .update({ completed_at: new Date().toISOString() })
          .eq('id', todayNode.id);
      }

      // Navigate to feedback screen
      navigation.replace('AIFeedback', {
        feedback,
        sessionId: session?.id,
        challengeTitle: challenge.title,
        skillName: challenge.skill_id,
        duration: challenge.duration_minutes,
        dayNumber: todayNode?.day_number ?? 1,
      });
    } catch (err) {
      console.error('Session save error:', err);
      navigation.goBack();
    }
  };

  const handlePauseResume = () => {
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
          <View style={styles.cameraPlaceholder}>
            <Text style={styles.cameraPlaceholderIcon}>📹</Text>
            <Text style={styles.cameraPlaceholderText}>Camera Preview</Text>
            <Text style={styles.cameraPlaceholderSub}>
              Position your device to capture your practice
            </Text>
          </View>
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
