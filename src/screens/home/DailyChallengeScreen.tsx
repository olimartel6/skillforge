import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../utils/theme';

export function DailyChallengeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Daily Challenge</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' },
  text: { color: colors.textPrimary, fontSize: 18 },
});
