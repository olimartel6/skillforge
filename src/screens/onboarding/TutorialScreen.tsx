import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Animated,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '../../navigation/OnboardingNavigator';
import { colors, spacing, typography, borderRadius } from '../../utils/theme';
import { AmbientGlow } from '../../components/AmbientGlow';
import { t } from '../../i18n';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type Nav = NativeStackNavigationProp<OnboardingStackParamList, 'Tutorial'>;

const SLIDES = [
  {
    emoji: '\uD83C\uDFAE',
    titleKey: 'tutorial.slide1Title',
    subKey: 'tutorial.slide1Sub',
  },
  {
    emoji: '\uD83D\uDCCA',
    titleKey: 'tutorial.slide2Title',
    subKey: 'tutorial.slide2Sub',
  },
  {
    emoji: '\u23F1\uFE0F',
    titleKey: 'tutorial.slide3Title',
    subKey: 'tutorial.slide3Sub',
  },
];

export function TutorialScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<any>();
  const { skillId, level, goal } = route.params;
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const handleNext = () => {
    if (activeIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: activeIndex + 1, animated: true });
    } else {
      navigation.navigate('RoadmapPreview', { skillId, level, goal });
    }
  };

  const handleDotPress = (index: number) => {
    flatListRef.current?.scrollToIndex({ index, animated: true });
  };

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setActiveIndex(viewableItems[0].index ?? 0);
    }
  }).current;

  const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const renderSlide = ({ item, index }: { item: typeof SLIDES[0]; index: number }) => (
    <View style={styles.slide}>
      <Text style={styles.emoji}>{item.emoji}</Text>
      <Text style={styles.slideTitle}>{t(item.titleKey)}</Text>
      <Text style={styles.slideSub}>{t(item.subKey)}</Text>
    </View>
  );

  const isLastSlide = activeIndex === SLIDES.length - 1;

  return (
    <SafeAreaView style={styles.safe}>
      <AmbientGlow color={colors.primary} size={300} opacity={0.06} top="20%" left="50%" />

      <View style={styles.content}>
        <FlatList
          ref={flatListRef}
          data={SLIDES}
          renderItem={renderSlide}
          keyExtractor={(_, i) => String(i)}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          bounces={false}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
            { useNativeDriver: false }
          )}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          getItemLayout={(_, index) => ({
            length: SCREEN_WIDTH,
            offset: SCREEN_WIDTH * index,
            index,
          })}
        />

        {/* Dot indicators */}
        <View style={styles.dots}>
          {SLIDES.map((_, i) => (
            <TouchableOpacity key={i} onPress={() => handleDotPress(i)}>
              <View
                style={[
                  styles.dot,
                  i === activeIndex && styles.dotActive,
                ]}
              />
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.button, isLastSlide && styles.buttonPrimary]}
          activeOpacity={0.85}
          onPress={handleNext}
        >
          <Text style={[styles.buttonText, isLastSlide && styles.buttonTextPrimary]}>
            {isLastSlide ? t('tutorial.getStarted') : t('tutorial.next')}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  slide: {
    width: SCREEN_WIDTH,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing['3xl'],
  },
  emoji: {
    fontSize: 80,
    marginBottom: spacing['3xl'],
  },
  slideTitle: {
    ...typography.h1,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.lg,
    fontSize: 28,
  },
  slideSub: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: spacing.xl,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    marginTop: spacing['3xl'],
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  dotActive: {
    width: 24,
    backgroundColor: colors.primary,
  },
  footer: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing['4xl'],
  },
  button: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  buttonPrimary: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  buttonText: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  buttonTextPrimary: {
    color: '#fff',
  },
});
