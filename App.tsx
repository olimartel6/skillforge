import React, { useCallback, useEffect, useState } from 'react';
import { View, StyleSheet, Text, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { colors } from './src/utils/theme';

// Lazy imports to catch crashes
let GestureHandlerRootView: any = View;
let SplashScreen: any = null;
let RootNavigator: any = null;
let fontsModule: any = null;

try { GestureHandlerRootView = require('react-native-gesture-handler').GestureHandlerRootView; } catch {}
try { SplashScreen = require('expo-splash-screen'); SplashScreen.preventAutoHideAsync().catch(() => {}); } catch {}

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
          <Text style={{ color: '#fff', fontSize: 20, fontWeight: '700', marginBottom: 8 }}>Something went wrong</Text>
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
    const init = async () => {
      try {
        // Clean AsyncStorage
        const AsyncStorage = require('@react-native-async-storage/async-storage').default;
        const keys = await AsyncStorage.getAllKeys();
        const supabaseKeys = keys.filter((k: string) => k.startsWith('sb-') || k.includes('supabase'));
        if (supabaseKeys.length > 0) {
          await AsyncStorage.multiRemove(supabaseKeys);
        }
      } catch {}

      try {
        // Load fonts
        const Font = require('expo-font');
        const InterFonts = require('@expo-google-fonts/inter');
        await Font.loadAsync({
          Inter_300Light: InterFonts.Inter_300Light,
          Inter_400Regular: InterFonts.Inter_400Regular,
          Inter_500Medium: InterFonts.Inter_500Medium,
          Inter_600SemiBold: InterFonts.Inter_600SemiBold,
          Inter_700Bold: InterFonts.Inter_700Bold,
          Inter_800ExtraBold: InterFonts.Inter_800ExtraBold,
          Inter_900Black: InterFonts.Inter_900Black,
        });
      } catch (e: any) {
        // Fonts failed — continue anyway
      }

      try {
        // Load navigator
        RootNavigator = require('./src/navigation/RootNavigator').RootNavigator;
      } catch (e: any) {
        setLoadError(`Navigator: ${e.message}`);
      }

      try {
        if (SplashScreen) await SplashScreen.hideAsync();
      } catch {}

      setReady(true);
    };

    init();
  }, []);

  if (!ready) {
    return (
      <View style={styles.loading}>
        <Text style={{ fontSize: 30 }}>⚡</Text>
      </View>
    );
  }

  if (loadError) {
    return (
      <View style={styles.loading}>
        <Text style={{ fontSize: 48, marginBottom: 16 }}>⚠️</Text>
        <Text style={{ color: '#fff', fontSize: 18, fontWeight: '700', marginBottom: 8 }}>Load Error</Text>
        <Text style={{ color: '#888', fontSize: 12, textAlign: 'center', paddingHorizontal: 40 }}>{loadError}</Text>
      </View>
    );
  }

  if (!RootNavigator) {
    return (
      <View style={styles.loading}>
        <Text style={{ color: '#fff', fontSize: 16 }}>Failed to load app</Text>
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
        <AppContent />
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
