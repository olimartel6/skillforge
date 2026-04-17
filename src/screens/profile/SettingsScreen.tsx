import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  Alert,
  Linking,
  TouchableOpacity,
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
import { saveBackup, restoreBackup, getBackupInfo } from '../../services/cloudSync';
let Clipboard: any = { setStringAsync: async () => {} };
try { Clipboard = require('expo-clipboard'); } catch (e) { console.warn('expo-clipboard import failed:', e); }
import { t } from '../../i18n';

const REMINDER_KEY = 'daily_reminder_enabled';

export function SettingsScreen() {
  const profile = useUserStore((s) => s.profile);
  const signOut = useUserStore((s) => s.signOut);
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderTime] = useState('8:00 PM');
  const [lastBackup, setLastBackup] = useState<string | null>(null);
  const [recoveryCode, setRecoveryCode] = useState<string | null>(null);
  const [backingUp, setBackingUp] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const enabled = await AsyncStorage.getItem(REMINDER_KEY);
        setReminderEnabled(enabled === 'true');
        const info = await getBackupInfo();
        setLastBackup(info.lastBackup);
        setRecoveryCode(info.recoveryCode);
      } catch {
        // Settings may not be available
      }
    };
    loadSettings();
  }, []);

  const handleBackup = async () => {
    setBackingUp(true);
    try {
      const result = await saveBackup();
      if (result.success) {
        Alert.alert(t('settings.backupSuccess'));
        const info = await getBackupInfo();
        setLastBackup(info.lastBackup);
      } else {
        Alert.alert(t('settings.backupError'));
      }
    } catch {
      Alert.alert(t('settings.backupError'));
    } finally {
      setBackingUp(false);
    }
  };

  const handleRestore = () => {
    Alert.prompt(
      t('settings.restoreTitle'),
      t('settings.restoreMsg'),
      async (code: string) => {
        if (!code?.trim()) return;
        const result = await restoreBackup(code.trim());
        if (result.success) {
          Alert.alert(t('settings.restoreSuccess'));
        } else {
          Alert.alert(t('settings.restoreError'));
        }
      },
      'plain-text',
      '',
      'default',
    );
  };

  const handleCopyCode = async () => {
    if (recoveryCode) {
      await Clipboard.setStringAsync(recoveryCode);
      Alert.alert(t('settings.copied'));
    }
  };

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
    } catch {
      setReminderEnabled(!value);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch {
      // Sign out error
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      t('settings.deleteTitle'),
      t('settings.deleteMsg'),
      [
        { text: t('changeSkill.cancel'), style: 'cancel' },
        {
          text: t('settings.deleteBtn'),
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.clear();
              await signOut();
            } catch {
              Alert.alert(t('subscription.error'), t('settings.deleteError'));
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>{t('settings.title')}</Text>

          {/* Notifications Section */}
          <Text style={styles.sectionLabel}>{t('settings.notifications')}</Text>
          <GlassCard style={styles.sectionCard}>
            <View style={styles.settingRow}>
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingTitle}>{t('settings.dailyReminder')}</Text>
                <Text style={styles.settingDescription}>
                  {t('settings.dailyReminderDesc')}
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
                <Text style={styles.settingTitle}>{t('settings.reminderTime')}</Text>
                <Text style={styles.settingDescription}>{reminderTime}</Text>
              </View>
              <Text style={styles.adaptNote}>{t('settings.adaptsNote')}</Text>
            </View>
          </GlassCard>

          {/* Backup & Restore Section */}
          <Text style={styles.sectionLabel}>{t('settings.backup')}</Text>
          <GlassCard style={styles.sectionCard}>
            <Text style={styles.settingDescription}>{t('settings.backupDesc')}</Text>

            <View style={styles.divider} />

            <View style={styles.settingRow}>
              <Text style={styles.settingTitle}>{t('settings.lastBackup')}</Text>
              <Text style={styles.settingValue}>
                {lastBackup ? new Date(lastBackup).toLocaleDateString() : t('settings.never')}
              </Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.settingRow}>
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingTitle}>{t('settings.recoveryCode')}</Text>
                <Text style={styles.settingDescription}>{t('settings.recoveryCodeDesc')}</Text>
              </View>
              <TouchableOpacity onPress={handleCopyCode} activeOpacity={0.7}>
                <Text style={[styles.settingValue, { color: colors.primary }]}>
                  {recoveryCode || '—'}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.divider} />

            <Button
              title={backingUp ? t('settings.backingUp') : t('settings.backupNow')}
              variant="secondary"
              onPress={handleBackup}
              disabled={backingUp}
            />

            <View style={{ height: spacing.sm }} />

            <Button
              title={t('settings.restore')}
              variant="ghost"
              onPress={handleRestore}
            />
          </GlassCard>

          {/* Account Section */}
          <Text style={styles.sectionLabel}>{t('settings.account')}</Text>
          <GlassCard style={styles.sectionCard}>
            <TouchableOpacity
              style={styles.settingRow}
              activeOpacity={0.7}
              onPress={() => {
                Alert.prompt(
                  t('settings.changeName') || 'Change Name',
                  t('settings.changeNameMsg') || 'Enter your new name',
                  (newName) => {
                    if (newName && newName.trim()) {
                      useUserStore.getState().updateProfile({ username: newName.trim() });
                    }
                  },
                  'plain-text',
                  profile?.username || '',
                );
              }}
            >
              <Text style={styles.settingTitle}>{t('settings.username')}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={styles.settingValue}>{profile?.username || '—'}</Text>
                <Text style={styles.chevron}>›</Text>
              </View>
            </TouchableOpacity>
          </GlassCard>

          {/* Legal Section */}
          <Text style={styles.sectionLabel}>{t('settings.legal')}</Text>
          <GlassCard style={styles.sectionCard}>
            <TouchableOpacity
              style={styles.settingRow}
              onPress={() => Linking.openURL('https://karztsksjqohxhgxdeje.supabase.co/storage/v1/object/public/pages/privacy-policy.html')}
              activeOpacity={0.7}
            >
              <Text style={styles.settingTitle}>{t('settings.privacyPolicy')}</Text>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity
              style={styles.settingRow}
              onPress={() => Linking.openURL('https://www.apple.com/legal/internet-services/itunes/dev/stdeula/')}
              activeOpacity={0.7}
            >
              <Text style={styles.settingTitle}>{t('settings.termsOfUse')}</Text>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>
          </GlassCard>

          {/* Sign Out */}
          <View style={styles.signOutContainer}>
            <Button
              title={t('settings.signOut')}
              variant="secondary"
              onPress={handleSignOut}
            />
          </View>

          {/* Delete Account (Required by App Store Guideline 5.1.1) */}
          <View style={styles.deleteContainer}>
            <Button
              title={t('settings.deleteAccount')}
              variant="ghost"
              onPress={handleDeleteAccount}
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
    paddingBottom: 120,
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

  chevron: {
    fontSize: 22,
    color: colors.textSecondary,
    fontWeight: '300',
  },

  // Sign Out
  signOutContainer: {
    marginTop: spacing['3xl'],
  },

  // Delete Account
  deleteContainer: {
    marginTop: spacing.lg,
  },
});
