import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { OnboardingNavigator } from './OnboardingNavigator';
import { TabNavigator } from './TabNavigator';
import { useUserStore } from '../store/userStore';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { colors } from '../utils/theme';

const Stack = createNativeStackNavigator();

export function RootNavigator() {
  const { isOnboarded, isLoading, initialize } = useUserStore();

  useEffect(() => {
    initialize();
  }, []);

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isOnboarded ? (
          <Stack.Screen name="Onboarding" component={OnboardingNavigator} />
        ) : (
          <Stack.Screen name="Main" component={TabNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' },
});
