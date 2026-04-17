import React, { useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, borderRadius, typography } from '../utils/theme';
import { t } from '../i18n';

const SCREEN_WIDTH = Dimensions.get('window').width;
const TOAST_HEIGHT = 80;
const AUTO_DISMISS_MS = 5000;

interface SocialToastProps {
  /** Friend's display name */
  friendName: string;
  /** First letter for the avatar circle */
  friendInitial?: string;
  /** Callback when the toast is tapped (navigate to leaderboard) */
  onPress?: () => void;
  /** Callback when the toast is dismissed (auto or manual) */
  onDismiss?: () => void;
  /** Controls visibility */
  visible: boolean;
}

export function SocialToast({
  friendName,
  friendInitial,
  onPress,
  onDismiss,
  visible,
}: SocialToastProps) {
  const insets = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(-(TOAST_HEIGHT + insets.top + 20))).current;
  const dismissTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const dismiss = useCallback(() => {
    Animated.spring(translateY, {
      toValue: -(TOAST_HEIGHT + insets.top + 20),
      useNativeDriver: true,
      tension: 80,
      friction: 12,
    }).start(() => {
      onDismiss?.();
    });
    if (dismissTimer.current) {
      clearTimeout(dismissTimer.current);
      dismissTimer.current = null;
    }
  }, [translateY, insets.top, onDismiss]);

  useEffect(() => {
    if (visible) {
      // Slide in
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        tension: 60,
        friction: 10,
      }).start();

      // Auto-dismiss after 5 seconds
      dismissTimer.current = setTimeout(dismiss, AUTO_DISMISS_MS);
    } else {
      dismiss();
    }

    return () => {
      if (dismissTimer.current) clearTimeout(dismissTimer.current);
    };
  }, [visible]);

  const initial = friendInitial || friendName.charAt(0).toUpperCase();

  return (
    <Animated.View
      style={[
        styles.container,
        {
          paddingTop: insets.top + spacing.sm,
          transform: [{ translateY }],
        },
      ]}
      pointerEvents={visible ? 'auto' : 'none'}
    >
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => {
          onPress?.();
          dismiss();
        }}
        style={styles.touchable}
      >
        <View style={styles.card}>
          {/* Subtle gold left accent bar */}
          <View style={styles.accentBar} />

          {/* Friend avatar */}
          <LinearGradient
            colors={['#FFD700', '#FFA500']}
            style={styles.avatar}
          >
            <Text style={styles.avatarText}>{initial}</Text>
          </LinearGradient>

          {/* Message — split around friendName so it can be gold-highlighted */}
          <View style={styles.textContainer}>
            <Text style={styles.message} numberOfLines={2}>
              {(() => {
                const full = t('social.friendPassedToast', { friendName: '\x00' });
                const parts = full.split('\x00');
                return (
                  <>
                    {parts[0]}
                    <Text style={styles.friendName}>{friendName}</Text>
                    {parts[1]}
                  </>
                );
              })()}
            </Text>
            <Text style={styles.cta}>{t('social.viewLeaderboard')}</Text>
          </View>

          {/* Chevron */}
          <Text style={styles.chevron}>{'\u203A'}</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    elevation: 9999,
    paddingHorizontal: spacing.lg,
  },
  touchable: {
    width: '100%',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(20, 20, 22, 0.97)',
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.15)',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    overflow: 'hidden',
    // Subtle shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  accentBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
    backgroundColor: '#FFD700',
    borderTopLeftRadius: borderRadius.xl,
    borderBottomLeftRadius: borderRadius.xl,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  avatarText: {
    color: '#1a1a1a',
    fontSize: 16,
    fontWeight: '800',
  },
  textContainer: {
    flex: 1,
    marginRight: spacing.sm,
  },
  message: {
    ...typography.bodySmall,
    color: colors.textPrimary,
    lineHeight: 18,
  },
  friendName: {
    color: '#FFD700',
    fontWeight: '700',
  },
  cta: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  chevron: {
    color: colors.textMuted,
    fontSize: 22,
    fontWeight: '300',
  },
});
