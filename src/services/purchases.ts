import Purchases, { PurchasesPackage } from 'react-native-purchases';
import { Platform, Alert, Linking } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabase';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://karztsksjqohxhgxdeje.supabase.co';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imthcnp0c2tzanFvaHhoZ3hkZWplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM1ODgzMDUsImV4cCI6MjA4OTE2NDMwNX0.SVozYZfnM7ki72frIHMRuppaSglSC2qjAlXa0XvbQDE';

const API_KEY = Platform.select({
  ios: 'appl_vJjpXEYvprWlkEmRLXlgtVIPddF',
  android: '',
}) || '';

let isConfigured = false;

const DEVICE_ID_KEY = '@skilly_device_id';

export async function getDeviceId(): Promise<string> {
  let deviceId = await AsyncStorage.getItem(DEVICE_ID_KEY);
  if (!deviceId) {
    deviceId = 'dev_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
    await AsyncStorage.setItem(DEVICE_ID_KEY, deviceId);
  }
  return deviceId;
}

export function isStripePayment(): boolean {
  return Platform.OS === 'android';
}

export async function syncPremiumStatus(): Promise<void> {
  try {
    const customerInfo = await Purchases.getCustomerInfo();
    const isPremium = customerInfo.entitlements.active['premium'] !== undefined;
    const stored = await AsyncStorage.getItem('user_profile');
    if (stored) {
      const profile = JSON.parse(stored);
      if (isPremium) {
        const expDate = customerInfo.entitlements.active['premium']?.expirationDate;
        profile.premium_expires_at = expDate || null;
      } else {
        // User is NOT premium — clear any stale premium status
        profile.premium_expires_at = null;
      }
      await AsyncStorage.setItem('user_profile', JSON.stringify(profile));
    }
  } catch (e: any) {
    console.log('[RC] syncPremiumStatus error:', e.message);
    // On error, clear premium to be safe (don't grant free premium on failures)
    try {
      const stored = await AsyncStorage.getItem('user_profile');
      if (stored) {
        const profile = JSON.parse(stored);
        profile.premium_expires_at = null;
        await AsyncStorage.setItem('user_profile', JSON.stringify(profile));
      }
    } catch (e) { console.warn('Premium status clear failed:', e); }
  }
}

export async function syncPremiumStatusAndroid(): Promise<void> {
  try {
    const deviceId = await getDeviceId();
    const { data } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('device_id', deviceId)
      .eq('status', 'active')
      .maybeSingle();
    const stored = await AsyncStorage.getItem('user_profile');
    if (stored) {
      const profile = JSON.parse(stored);
      if (data) {
        profile.premium_expires_at = data.expires_at || data.current_period_end;
      } else {
        // No active subscription — clear stale premium
        profile.premium_expires_at = null;
      }
      await AsyncStorage.setItem('user_profile', JSON.stringify(profile));
    }
  } catch (e: any) {
    console.log('[RC] syncPremiumStatusAndroid error:', e.message);
  }
}

export async function purchaseStripe(): Promise<boolean> {
  try {
    const deviceId = await getDeviceId();
    const res = await fetch(`${SUPABASE_URL}/functions/v1/create-checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ device_id: deviceId }),
    });
    const { url } = await res.json();
    if (url) {
      await Linking.openURL(url);
      return true;
    }
    return false;
  } catch (e: any) {
    console.log('[RC] purchaseStripe error:', e.message);
    return false;
  }
}

export async function initPurchases(userId: string) {
  if (isStripePayment()) {
    // Android: use Stripe instead of RevenueCat
    await syncPremiumStatusAndroid();
    isConfigured = true;
    return;
  }
  if (!API_KEY) {
    return;
  }
  if (isConfigured) {
    return;
  }
  try {
    Purchases.configure({ apiKey: API_KEY, appUserID: userId });
    isConfigured = true;
    await syncPremiumStatus();
  } catch (e: any) {
    console.log('[RC] Configure error:', e.message);
  }
}

export async function getOfferings(): Promise<PurchasesPackage[]> {
  if (!isConfigured) {
    await initPurchases('local-user');
  }
  try {
    const offerings = await Purchases.getOfferings();
    return offerings.current?.availablePackages || [];
  } catch (e: any) {
    console.log('[RC] getOfferings error:', e.message);
    return [];
  }
}

export async function purchasePackage(pkg: PurchasesPackage): Promise<boolean> {
  try {
    const { customerInfo } = await Purchases.purchasePackage(pkg);
    return customerInfo.entitlements.active['premium'] !== undefined;
  } catch {
    return false;
  }
}

export async function restorePurchases(): Promise<boolean> {
  try {
    const customerInfo = await Purchases.restorePurchases();
    return customerInfo.entitlements.active['premium'] !== undefined;
  } catch {
    return false;
  }
}
