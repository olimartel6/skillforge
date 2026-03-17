import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

export async function requestPermissions(): Promise<boolean> {
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function scheduleDailyReminder(hour: number = 20, minute: number = 0) {
  await Notifications.cancelAllScheduledNotificationsAsync();
  await Notifications.scheduleNotificationAsync({
    content: { title: 'Skilly', body: 'Your 5-minute practice is waiting 🔥' },
    trigger: { type: 'daily' as any, hour, minute },
  });
}

export async function recordPracticeTime() {
  const hour = new Date().getHours();
  const raw = await AsyncStorage.getItem('practice_times');
  const times: number[] = raw ? JSON.parse(raw) : [];
  times.push(hour);
  if (times.length > 7) times.shift();
  await AsyncStorage.setItem('practice_times', JSON.stringify(times));
}
