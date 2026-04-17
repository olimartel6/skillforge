import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabase';
import { getDeviceId } from './purchases';

// All AsyncStorage keys that hold user progress
const BACKUP_KEYS = [
  'user_profile',
  'user_roadmap',
  'streak_data',
  'earned_badges',
  'practice_count',
  'game_store',
  'game_xp',
  'game_daily_xp',
  'game_daily_date',
  'game_completed_lessons',
  'daily_reminder_enabled',
  'practice_times',
  'skilly_device_id',
];

// Also backup any skill_progress_* keys (per-skill snapshots)
async function getAllBackupKeys(): Promise<string[]> {
  try {
    const allKeys = await AsyncStorage.getAllKeys();
    const skillProgressKeys = allKeys.filter((k) => k.startsWith('skill_progress_'));
    return [...BACKUP_KEYS, ...skillProgressKeys];
  } catch {
    return BACKUP_KEYS;
  }
}

// Generate a short recovery code from the device ID for users to note down
export function getRecoveryCode(deviceId: string): string {
  // Take last 8 chars of the device ID as a simple recovery code
  return deviceId.replace('dev_', '').slice(-8).toUpperCase();
}

// Parse a recovery code back to find the device — we search by suffix
export async function findDeviceByRecoveryCode(code: string): Promise<string | null> {
  const normalizedCode = code.trim().toLowerCase();
  try {
    const { data, error } = await supabase
      .from('user_backups')
      .select('device_id')
      .ilike('device_id', `%${normalizedCode}`);

    if (error || !data || data.length === 0) return null;
    return data[0].device_id;
  } catch {
    return null;
  }
}

/**
 * Save all user progress to Supabase.
 * Debounced internally — safe to call frequently.
 */
let saveTimeout: ReturnType<typeof setTimeout> | null = null;

export function saveBackupDebounced(): void {
  if (saveTimeout) clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    saveBackup().catch((e) => console.log('[CloudSync] Auto-save error:', e.message));
  }, 3000); // 3s debounce
}

export async function saveBackup(): Promise<{ success: boolean; error?: string }> {
  try {
    const deviceId = await getDeviceId();
    const keys = await getAllBackupKeys();

    const pairs = await AsyncStorage.multiGet(keys);
    const backupData: Record<string, string | null> = {};
    for (const [key, value] of pairs) {
      if (value !== null) {
        backupData[key] = value;
      }
    }

    const { error } = await supabase
      .from('user_backups')
      .upsert(
        {
          device_id: deviceId,
          backup_data: backupData,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'device_id' }
      );

    if (error) {
      return { success: false, error: error.message };
    }

    // Store last backup timestamp locally
    await AsyncStorage.setItem('last_backup_at', new Date().toISOString());
    return { success: true };
  } catch (e: any) {
    console.log('[CloudSync] Save error:', e.message);
    return { success: false, error: e.message };
  }
}

export async function restoreBackup(deviceIdOrCode: string): Promise<{ success: boolean; error?: string }> {
  try {
    let targetDeviceId = deviceIdOrCode;

    // If it looks like a recovery code (short, no dev_ prefix), search by suffix
    if (!deviceIdOrCode.startsWith('dev_')) {
      const found = await findDeviceByRecoveryCode(deviceIdOrCode);
      if (!found) {
        return { success: false, error: 'No backup found for this recovery code.' };
      }
      targetDeviceId = found;
    }

    const { data, error } = await supabase
      .from('user_backups')
      .select('backup_data')
      .eq('device_id', targetDeviceId)
      .single();

    if (error || !data) {
      return { success: false, error: 'No backup found.' };
    }

    const backupData = data.backup_data as Record<string, string>;

    // Write all keys back to AsyncStorage
    const pairs: [string, string][] = Object.entries(backupData);
    await AsyncStorage.multiSet(pairs);

    return { success: true };
  } catch (e: any) {
    console.log('[CloudSync] Restore error:', e.message);
    return { success: false, error: e.message };
  }
}

export async function getBackupInfo(): Promise<{ lastBackup: string | null; recoveryCode: string | null }> {
  try {
    const lastBackup = await AsyncStorage.getItem('last_backup_at');
    const deviceId = await getDeviceId();
    const recoveryCode = getRecoveryCode(deviceId);
    return { lastBackup, recoveryCode };
  } catch {
    return { lastBackup: null, recoveryCode: null };
  }
}
