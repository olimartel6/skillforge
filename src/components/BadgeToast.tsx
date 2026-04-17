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

const TOAST_HEIGHT = 80;
const AUTO_DISMISS_MS = 5000;

interface BadgeToastProps {
  badgeName: string;
  badgeIcon: string;
  onPress?: () => void;
  onDismiss?: () => void;
  visible: boolean;
}

export function BadgeToast({
  badgeName,
  badgeIcon,
  onPress,
  onDismiss,
  visible,
}: BadgeToastProps) {
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
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        tension: 60,
        friction: 10,
      }).start();

      dismissTimer.current = setTimeout(dismiss, AUTO_DISMISS_MS);
    } else {
      dismiss();
    }

    return () => {
      if (dismissTimer.current) clearTimeout(dismissTimer.current);
    };
  }, [visible]);

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
          {/* Accent bar */}
          <View style={styles.accentBar} />

          {/* Badge icon */}
          <LinearGradient
            colors={[colors.primary, colors.primaryDark]}
            style={styles.iconCircle}
          >
            <Text style={styles.iconText}>{badgeIcon}</Text>
          </LinearGradient>

          {/* Message */}
          <View style={styles.textContainer}>
            <Text style={styles.title}>{t('badge.earned')}</Text>
            <Text style={styles.badgeName} numberOfLines={1}>{badgeName}</Text>
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
    borderColor: 'rgba(255, 107, 53, 0.2)',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    overflow: 'hidden',
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
    backgroundColor: colors.primary,
    borderTopLeftRadius: borderRadius.xl,
    borderBottomLeftRadius: borderRadius.xl,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  iconText: {
    fontSize: 20,
  },
  textContainer: {
    flex: 1,
    marginRight: spacing.sm,
  },
  title: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  badgeName: {
    ...typography.bodySmall,
    color: colors.textPrimary,
    fontWeight: '600',
    marginTop: 2,
  },
  chevron: {
    color: colors.textMuted,
    fontSize: 22,
    fontWeight: '300',
  },
});
