import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { GlassCard } from '../../components/GlassCard';
import { Button } from '../../components/Button';
import { AmbientGlow } from '../../components/AmbientGlow';
import { colors, spacing, typography, borderRadius } from '../../utils/theme';
import { UserRoadmap } from '../../utils/types';
import { supabase } from '../../services/supabase';
import { useUserStore } from '../../store/userStore';

export function RoadmapPreviewScreen() {
  const navigation = useNavigation();
  const { profile } = useUserStore();
  const [roadmap, setRoadmap] = useState<UserRoadmap[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;
    (async () => {
      const { data, error } = await supabase
        .from('user_roadmap')
        .select('*')
        .eq('user_id', profile.id)
        .order('day_number', { ascending: true });
      if (!error && data) setRoadmap(data as UserRoadmap[]);
      setLoading(false);
    })();
  }, [profile]);

  const handleStart = () => {
    // RootNavigator will auto-redirect since onboarding is complete
    (navigation as any).reset({
      index: 0,
      routes: [{ name: 'Main' }],
    });
  };

  const renderDay = ({ item }: { item: UserRoadmap }) => (
    <GlassCard style={styles.dayCard}>
      <View style={styles.dayRow}>
        <Text style={styles.dayNumber}>Day {item.day_number}</Text>
        <View style={styles.dayContent}>
          <Text style={styles.challengeTitle}>{item.challenge_title}</Text>
          {item.node_id && (
            <View style={styles.nodeTag}>
              <Text style={styles.nodeTagText}>{item.node_id}</Text>
            </View>
          )}
        </View>
      </View>
    </GlassCard>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <AmbientGlow color={colors.primary} size={250} top="3%" left="50%" opacity={0.08} />

      <View style={styles.header}>
        <Text style={styles.heading}>Your 30-Day Roadmap</Text>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      ) : (
        <FlatList
          data={roadmap}
          keyExtractor={(item) => item.id}
          renderItem={renderDay}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}

      <View style={styles.footer}>
        <Button title="Start Day 1" onPress={handleStart} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing['3xl'],
    paddingBottom: spacing.lg,
  },
  heading: {
    ...typography.h2,
    color: colors.textPrimary,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    paddingHorizontal: spacing.xl,
    paddingBottom: 100,
    gap: spacing.sm,
  },
  dayCard: {
    padding: spacing.lg,
  },
  dayRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  dayNumber: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '700',
    width: 56,
  },
  dayContent: {
    flex: 1,
  },
  challengeTitle: {
    ...typography.body,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  nodeTag: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.06)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  nodeTagText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing['4xl'],
    paddingTop: spacing.lg,
    backgroundColor: colors.background,
  },
});
