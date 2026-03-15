import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../utils/theme';

export function RoadmapPreviewScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Roadmap Preview</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' },
  text: { color: colors.textPrimary, fontSize: 18 },
});
