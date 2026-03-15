import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { WelcomeScreen } from '../screens/onboarding/WelcomeScreen';
import { SkillSelectionScreen } from '../screens/onboarding/SkillSelectionScreen';
import { LevelSelectionScreen } from '../screens/onboarding/LevelSelectionScreen';
import { GoalSelectionScreen } from '../screens/onboarding/GoalSelectionScreen';
import { RoadmapPreviewScreen } from '../screens/onboarding/RoadmapPreviewScreen';

export type OnboardingStackParamList = {
  Welcome: undefined;
  SkillSelection: undefined;
  LevelSelection: { skillId: string };
  GoalSelection: { skillId: string; level: string };
  RoadmapPreview: { skillId: string; level: string; goal: string };
};

const Stack = createNativeStackNavigator<OnboardingStackParamList>();

export function OnboardingNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false, animation: 'slide_from_right' }}
    >
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="SkillSelection" component={SkillSelectionScreen} />
      <Stack.Screen name="LevelSelection" component={LevelSelectionScreen} />
      <Stack.Screen name="GoalSelection" component={GoalSelectionScreen} />
      <Stack.Screen name="RoadmapPreview" component={RoadmapPreviewScreen} />
    </Stack.Navigator>
  );
}
