import Purchases, { PurchasesPackage, LOG_LEVEL } from 'react-native-purchases';
import { Platform, Alert } from 'react-native';

const API_KEY = Platform.select({
  ios: 'appl_vJjpXEYvprWlkEmRLXlgtVIPddF',
  android: '',
}) || '';

let isConfigured = false;

export async function initPurchases(userId: string) {
  if (!API_KEY) {
    console.log('[RC] No API key, skipping');
    return;
  }
  if (isConfigured) {
    console.log('[RC] Already configured');
    return;
  }
  try {
    Purchases.setLogLevel(LOG_LEVEL.DEBUG);
    Purchases.configure({ apiKey: API_KEY, appUserID: userId });
    isConfigured = true;
    console.log('[RC] Configured successfully with key:', API_KEY.substring(0, 10) + '...');
  } catch (e: any) {
    console.log('[RC] Configure error:', e.message);
  }
}

export async function getOfferings(): Promise<PurchasesPackage[]> {
  if (!isConfigured) {
    console.log('[RC] Not configured, trying to configure now...');
    await initPurchases('local-user');
  }
  try {
    console.log('[RC] Fetching offerings...');
    const offerings = await Purchases.getOfferings();
    console.log('[RC] Offerings result:', JSON.stringify({
      hasCurrentOffering: !!offerings.current,
      currentId: offerings.current?.identifier,
      packageCount: offerings.current?.availablePackages?.length || 0,
      allOfferingIds: Object.keys(offerings.all || {}),
    }));
    if (!offerings.current) {
      console.log('[RC] No current offering! Check RevenueCat dashboard.');
    }
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
