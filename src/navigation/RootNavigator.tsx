import React, { useEffect, useRef, useState, useCallback } from 'react';
import { NavigationContainer, NavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { OnboardingNavigator } from './OnboardingNavigator';
import { TabNavigator } from './TabNavigator';
import { useUserStore } from '../store/userStore';
import { View, Text, StyleSheet, Linking } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../utils/theme';
import { t } from '../i18n';
import { SocialToast } from '../components/SocialToast';
import { BadgeToast } from '../components/BadgeToast';
import { useStreakStore } from '../store/streakStore';
import * as Notifications from 'expo-notifications';

const Stack = createNativeStackNavigator();

const linking = {
  prefixes: ['skilly://'],
  config: {
    screens: {
      Main: {
        screens: {
          GamesTab: {
            screens: {
              LiveLobby: {
                path: 'live/:roomCode',
                parse: {
                  roomCode: (roomCode: string) => roomCode.toUpperCase(),
                  mode: () => 'join',
                },
              },
            },
          },
          ProfileTab: {
            screens: {
              PublicProfile: 'profile/:userId',
            },
          },
        },
      },
    },
  },
};

export function RootNavigator() {
  const { isOnboarded, isLoading, initialize } = useUserStore();
  const navigationRef = useRef<NavigationContainerRef<any>>(null);
  const [toastData, setToastData] = useState<{ friendName: string } | null>(null);
  const lastEarnedBadge = useStreakStore((s) => s.lastEarnedBadge);
  const dismissBadgeToast = useStreakStore((s) => s.dismissBadgeToast);

  useEffect(() => {
    initialize();
  }, []);

  // Listen for friend_passed_you notifications while app is foregrounded
  useEffect(() => {
    const subscription = Notifications.addNotificationReceivedListener((notification) => {
      const data = notification.request.content.data;
      if (data?.type === 'friend_passed_you') {
        // Extract friend name from the notification body (after the colon-less template)
        const body = notification.request.content.body ?? '';
        // The body format is "{friendName} just passed you..." — grab the name
        const friendName = body.split(' ')[0] || 'Someone';
        setToastData({ friendName });
      }
    });

    // Also handle tapping a notification when app is backgrounded
    const responseSubscription = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data;
      if (data?.type === 'friend_passed_you' && navigationRef.current) {
        navigationRef.current.navigate('Main', {
          screen: 'CommunityTab',
        });
      }
    });

    return () => {
      subscription.remove();
      responseSubscription.remove();
    };
  }, []);

  const handleToastPress = useCallback(() => {
    if (navigationRef.current) {
      navigationRef.current.navigate('Main', {
        screen: 'CommunityTab',
      });
    }
  }, []);

  const handleToastDismiss = useCallback(() => {
    setToastData(null);
  }, []);

  // Handle deep links that arrive when the app is already open
  useEffect(() => {
    const handleDeepLink = (event: { url: string }) => {
      const url = event.url;
      const match = url.match(/live\/([A-Z0-9]{6})/i);
      if (match && navigationRef.current) {
        const roomCode = match[1].toUpperCase();
        navigationRef.current.navigate('GamesTab', {
          screen: 'LiveLobby',
          params: { mode: 'join', roomCode },
        });
      }
    };

    const subscription = Linking.addEventListener('url', handleDeepLink);

    // Check if app was opened via a deep link
    Linking.getInitialURL().then((url) => {
      if (url) handleDeepLink({ url });
    });

    return () => subscription.remove();
  }, [isOnboarded]);

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <Text style={{ fontSize: 42, fontWeight: '900', color: colors.primary, letterSpacing: -1, textShadowColor: 'rgba(255,107,53,0.3)', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 20 }}>Skilly</Text>
        <Text style={{ fontSize: 14, color: colors.textSecondary, letterSpacing: 2, textTransform: 'uppercase', fontWeight: '500', marginTop: 8 }}>{t('app.tagline')}</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <NavigationContainer ref={navigationRef} linking={linking}>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {!isOnboarded ? (
            <Stack.Screen name="Onboarding" component={OnboardingNavigator} />
          ) : (
            <Stack.Screen name="Main" component={TabNavigator} />
          )}
        </Stack.Navigator>
      </NavigationContainer>
      <SocialToast
        visible={!!toastData}
        friendName={toastData?.friendName ?? ''}
        onPress={handleToastPress}
        onDismiss={handleToastDismiss}
      />
      <BadgeToast
        visible={!!lastEarnedBadge}
        badgeName={lastEarnedBadge?.name ?? ''}
        badgeIcon={lastEarnedBadge?.icon ?? ''}
        onPress={() => {
          dismissBadgeToast();
          if (navigationRef.current) {
            navigationRef.current.navigate('Main', { screen: 'StatsTab' });
          }
        }}
        onDismiss={dismissBadgeToast}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoBox: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  logoEmoji: {
    fontSize: 30,
  },
});
