import Purchases, { PurchasesPackage } from 'react-native-purchases';
import { Platform } from 'react-native';

const API_KEY = Platform.select({
  ios: 'your_revenuecat_ios_key',
  android: 'your_revenuecat_android_key',
}) || '';

export async function initPurchases(userId: string) {
  Purchases.configure({ apiKey: API_KEY, appUserID: userId });
}

export async function getOfferings(): Promise<PurchasesPackage[]> {
  try {
    const offerings = await Purchases.getOfferings();
    return offerings.current?.availablePackages || [];
  } catch {
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
