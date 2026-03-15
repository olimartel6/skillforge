import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GlassCard } from '../../components/GlassCard';
import { Button } from '../../components/Button';
import { colors, spacing, borderRadius, typography } from '../../utils/theme';
import { useUserStore } from '../../store/userStore';
import {
  requestPermissions,
  scheduleDailyReminder,
} from '../../services/notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

const REMINDER_KEY = 'daily_reminder_enabled';

export function SettingsScreen() {
  const profile = useUserStore((s) => s.profile);
  const signOut = useUserStore((s) => s.signOut);
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderTime] = useState('8:00 PM');

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const enabled = await AsyncStorage.getItem(REMINDER_KEY);
        setReminderEnabled(enabled === 'true');
      } catch (err) {
        console.error('Error loading settings:', err);
      }
    };
    loadSettings();
  }, []);

  const toggleReminder = async (value: boolean) => {
    setReminderEnabled(value);

    try {
      if (value) {
        const granted = await requestPermissions();
        if (granted) {
          await scheduleDailyReminder(20, 0);
          await AsyncStorage.setItem(REMINDER_KEY, 'true');
        } else {
          setReminderEnabled(false);
        }
      } else {
        const Notifications = require('expo-notifications');
        await Notifications.cancelAllScheduledNotificationsAsync();
        await AsyncStorage.setItem(REMINDER_KEY, 'false');
      }
    } catch (err) {
      console.error('Error toggling reminder:', err);
      setReminderEnabled(!value);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (err) {
      console.error('Error signing out:', err);
    }
  };

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>Settings</Text>

          {/* Notifications Section */}
          <Text style={styles.sectionLabel}>NOTIFICATIONS</Text>
          <GlassCard style={styles.sectionCard}>
            <View style={styles.settingRow}>
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingTitle}>Daily Reminder</Text>
                <Text style={styles.settingDescription}>
                  Get reminded to practice every day
                </Text>
              </View>
              <Switch
                value={reminderEnabled}
                onValueChange={toggleReminder}
                trackColor={{ false: 'rgba(255,255,255,0.1)', true: colors.primary }}
                thumbColor="#FFFFFF"
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.settingRow}>
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingTitle}>Reminder Time</Text>
                <Text style={styles.settingDescription}>{reminderTime}</Text>
              </View>
              <Text style={styles.adaptNote}>Adapts to your practice time</Text>
            </View>
          </GlassCard>

          {/* Account Section */}
          <Text style={styles.sectionLabel}>ACCOUNT</Text>
          <GlassCard style={styles.sectionCard}>
            <View style={styles.settingRow}>
              <Text style={styles.settingTitle}>Username</Text>
              <Text style={styles.settingValue}>{profile?.username || '—'}</Text>
            </View>
          </GlassCard>

          {/* Sign Out */}
          <View style={styles.signOutContainer}>
            <Button
              title="Sign Out"
              variant="secondary"
              onPress={handleSignOut}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  safe: {
    flex: 1,
  },
  scroll: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing['6xl'],
  },
  title: {
    ...typography.h2,
    color: colors.textPrimary,
    marginTop: spacing.lg,
    marginBottom: spacing['2xl'],
  },

  // Sections
  sectionLabel: {
    ...typography.label,
    color: colors.textMuted,
    marginBottom: spacing.md,
    marginTop: spacing.lg,
  },
  sectionCard: {
    padding: spacing.lg,
  },

  // Setting rows
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  settingTextContainer: {
    flex: 1,
    marginRight: spacing.lg,
  },
  settingTitle: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  settingDescription: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  settingValue: {
    ...typography.body,
    color: colors.textSecondary,
  },
  adaptNote: {
    ...typography.caption,
    color: colors.textMuted,
    fontStyle: 'italic',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
    marginVertical: spacing.md,
  },

  // Sign Out
  signOutContainer: {
    marginTop: spacing['3xl'],
  },
});
