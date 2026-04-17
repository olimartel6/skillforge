import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { WelcomeScreen } from '../screens/onboarding/WelcomeScreen';
import { ProfileSetupScreen } from '../screens/onboarding/ProfileSetupScreen';
import { SkillSelectionScreen } from '../screens/onboarding/SkillSelectionScreen';
import { LevelSelectionScreen } from '../screens/onboarding/LevelSelectionScreen';
import { GoalSelectionScreen } from '../screens/onboarding/GoalSelectionScreen';
import { TutorialScreen } from '../screens/onboarding/TutorialScreen';
import { RoadmapPreviewScreen } from '../screens/onboarding/RoadmapPreviewScreen';
import { OnboardingPaywallScreen } from '../screens/onboarding/OnboardingPaywallScreen';

export type OnboardingStackParamList = {
  Welcome: undefined;
  ProfileSetup: undefined;
  SkillSelection: undefined;
  LevelSelection: { skillId: string };
  GoalSelection: { skillId: string; level: string };
  Tutorial: { skillId: string; level: string; goal: string };
  RoadmapPreview: { skillId: string; level: string; goal: string };
  OnboardingPaywall: undefined;
};

const Stack = createNativeStackNavigator<OnboardingStackParamList>();

export function OnboardingNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false, animation: 'slide_from_right' }}
    >
      <Stack.Screen name="Welcome" component={WelcomeScreen} options={{ animation: 'fade' }} />
      <Stack.Screen name="ProfileSetup" component={ProfileSetupScreen} />
      <Stack.Screen name="SkillSelection" component={SkillSelectionScreen} />
      <Stack.Screen name="LevelSelection" component={LevelSelectionScreen} />
      <Stack.Screen name="GoalSelection" component={GoalSelectionScreen} />
      <Stack.Screen name="Tutorial" component={TutorialScreen} options={{ animation: 'fade' }} />
      <Stack.Screen name="RoadmapPreview" component={RoadmapPreviewScreen} />
      <Stack.Screen name="OnboardingPaywall" component={OnboardingPaywallScreen} options={{ animation: 'slide_from_bottom' }} />
    </Stack.Navigator>
  );
}
