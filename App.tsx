import React, { useCallback, useEffect, useState } from 'react';
import { View, StyleSheet, Text, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { colors } from './src/utils/theme';
import Constants from 'expo-constants';
import { t } from './src/i18n';

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error(`Timeout after ${ms}ms`)), ms)),
  ]);
}

// Lazy imports to catch crashes
let GestureHandlerRootView: any = View;
let SplashScreen: any = null;
let RootNavigator: any = null;
let fontsModule: any = null;

try { GestureHandlerRootView = require('react-native-gesture-handler').GestureHandlerRootView; } catch (e) { console.warn('GestureHandler import failed:', e); }
let SafeAreaProvider: any = View;
try { SafeAreaProvider = require('react-native-safe-area-context').SafeAreaProvider; } catch (e) { console.warn('SafeAreaProvider import failed:', e); }
try { SplashScreen = require('expo-splash-screen'); SplashScreen.preventAutoHideAsync().catch((e: any) => console.warn('SplashScreen preventAutoHide failed:', e)); } catch (e) { console.warn('SplashScreen import failed:', e); }

// Error boundary
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean; error: string }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: '' };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error: error.message || 'Unknown error' };
  }
  render() {
    if (this.state.hasError) {
      return (
        <View style={{ flex: 1, backgroundColor: '#0a0a0b', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
          <Text style={{ fontSize: 48, marginBottom: 16 }}>😔</Text>
          <Text style={{ color: '#fff', fontSize: 20, fontWeight: '700', marginBottom: 8 }}>{t('app.error')}</Text>
          <Text style={{ color: '#888', fontSize: 13, textAlign: 'center' }}>{this.state.error}</Text>
        </View>
      );
    }
    return this.props.children;
  }
}

function AppContent() {
  const [ready, setReady] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    // Safety net: force app ready after 10s no matter what
    const safetyTimeout = setTimeout(() => {
      try { if (SplashScreen) SplashScreen.hideAsync(); } catch (e) { console.warn('SplashScreen hideAsync (safety timeout):', e); }
      setReady(true);
    }, 10000);

    const init = async () => {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;

      try {
        // Load fonts with 5s timeout
        const Font = require('expo-font');
        const InterFonts = require('@expo-google-fonts/inter');
        await withTimeout(Font.loadAsync({
          Inter_300Light: InterFonts.Inter_300Light,
          Inter_400Regular: InterFonts.Inter_400Regular,
          Inter_500Medium: InterFonts.Inter_500Medium,
          Inter_600SemiBold: InterFonts.Inter_600SemiBold,
          Inter_700Bold: InterFonts.Inter_700Bold,
          Inter_800ExtraBold: InterFonts.Inter_800ExtraBold,
          Inter_900Black: InterFonts.Inter_900Black,
        }), 5000);
      } catch (e: any) {
        console.warn('Font loading failed:', e);
      }

      try {
        // Initialize RevenueCat/Stripe with 3s timeout
        const { initPurchases } = require('./src/services/purchases');
        await withTimeout(initPurchases('local-user'), 3000);
        // Re-read profile after premium sync to update Zustand store
        const stored = await AsyncStorage.getItem('user_profile');
        if (stored) {
          const { useUserStore } = require('./src/store/userStore');
          const profile = JSON.parse(stored);
          useUserStore.getState().updateProfile({ premium_expires_at: profile.premium_expires_at });
        }
      } catch (e) { console.warn('RevenueCat/purchases init failed:', e); }

      try {
        // Install tracking
        const { getDeviceId } = require('./src/services/purchases');
        const { supabase } = require('./src/services/supabase');
        const deviceId = await getDeviceId();
        await supabase.from('app_installs').upsert(
          { device_id: deviceId, platform: Platform.OS, app_version: Constants.expoConfig?.version ?? 'unknown', last_seen: new Date().toISOString() },
          { onConflict: 'device_id' }
        );
      } catch (e) { console.warn('Install tracking failed:', e); }

      try {
        // Re-schedule notifications on launch
        const { rescheduleNotificationsOnLaunch, rescheduleSmartNotifications } = require('./src/services/notifications');
        await rescheduleNotificationsOnLaunch();
        await rescheduleSmartNotifications();
      } catch (e) { console.warn('Notification reschedule failed:', e); }

      try {
        // Update iOS home screen widget with current data
        const { syncWidgetFromStores } = require('./src/services/widgetData');
        syncWidgetFromStores();
      } catch (e) { console.warn('Widget sync failed:', e); }

      try {
        // Load navigator
        RootNavigator = require('./src/navigation/RootNavigator').RootNavigator;
      } catch (e: any) {
        setLoadError(`Navigator: ${e.message}`);
      }

      try {
        if (SplashScreen) await SplashScreen.hideAsync();
      } catch (e) { console.warn('SplashScreen hideAsync failed:', e); }

      clearTimeout(safetyTimeout);
      setReady(true);
    };

    init();

    return () => clearTimeout(safetyTimeout);
  }, []);

  if (!ready) {
    return (
      <View style={styles.loading}>
        <Text style={{ fontSize: 42, fontWeight: '900', color: '#FF6B35', textShadowColor: 'rgba(255,107,53,0.3)', textShadowOffset: { width: 0, height: 4 }, textShadowRadius: 12 }}>Skilly</Text>
        <Text style={{ fontSize: 14, color: '#888', textTransform: 'uppercase', letterSpacing: 2, marginTop: 8 }}>{t('app.tagline')}</Text>
      </View>
    );
  }

  if (loadError) {
    return (
      <View style={styles.loading}>
        <Text style={{ fontSize: 48, marginBottom: 16 }}>⚠️</Text>
        <Text style={{ color: '#fff', fontSize: 18, fontWeight: '700', marginBottom: 8 }}>{t('app.loadError')}</Text>
        <Text style={{ color: '#888', fontSize: 12, textAlign: 'center', paddingHorizontal: 40 }}>{loadError}</Text>
      </View>
    );
  }

  if (!RootNavigator) {
    return (
      <View style={styles.loading}>
        <Text style={{ color: '#fff', fontSize: 16 }}>{t('app.failedToLoad')}</Text>
      </View>
    );
  }

  return (
    <>
      <StatusBar style="light" />
      <RootNavigator />
    </>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <AppContent />
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
