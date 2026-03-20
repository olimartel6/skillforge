import React, { useCallback, useEffect } from 'react';
import { View, StyleSheet, Text, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as SplashScreen from 'expo-splash-screen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFonts, Inter_300Light, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold, Inter_800ExtraBold, Inter_900Black } from '@expo-google-fonts/inter';
import { RootNavigator } from './src/navigation/RootNavigator';
import { colors } from './src/utils/theme';

SplashScreen.preventAutoHideAsync().catch(() => {});

// Error boundary to prevent white screen crashes
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) {
      return (
        <View style={{ flex: 1, backgroundColor: '#0a0a0b', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
          <Text style={{ fontSize: 48, marginBottom: 16 }}>😔</Text>
          <Text style={{ color: '#fff', fontSize: 20, fontWeight: '700', marginBottom: 8 }}>Something went wrong</Text>
          <Text style={{ color: '#888', fontSize: 14, textAlign: 'center' }}>Please restart the app</Text>
        </View>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  useEffect(() => {
    const cleanup = async () => {
      try {
        const keys = await AsyncStorage.getAllKeys();
        const supabaseKeys = keys.filter(k => k.startsWith('sb-') || k.includes('supabase'));
        if (supabaseKeys.length > 0) {
          await AsyncStorage.multiRemove(supabaseKeys);
        }
      } catch {}
    };
    cleanup();
  }, []);

  const [fontsLoaded] = useFonts({
    Inter_300Light,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
    Inter_900Black,
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      try { await SplashScreen.hideAsync(); } catch {}
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return <View style={styles.loading} />;
  }

  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }} onLayout={onLayoutRootView}>
        <StatusBar style="light" />
        <RootNavigator />
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
