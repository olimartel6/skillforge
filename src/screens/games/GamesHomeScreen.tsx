import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { AmbientGlow } from '../../components/AmbientGlow';
import { GlassCard } from '../../components/GlassCard';
import { useGameStore } from '../../store/gameStore';
import { useUserStore } from '../../store/userStore';
import { useLeagueStore } from '../../store/leagueStore';
import { supabase } from '../../services/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, spacing, typography, borderRadius, glowShadow } from '../../utils/theme';
import * as Haptics from 'expo-haptics';
import { t } from '../../i18n';
import { AudioLessonCard } from '../../components/AudioLessonCard';
const SCREEN_WIDTH = Dimensions.get('window').width;
const BUBBLE_SIZE = 64;
const PATH_AMPLITUDE = 50;

export const SKILL_LESSONS: Record<string, { title: string; icon: string }[]> = {
  'Magic Tricks': [
    { title: 'Magic Basics', icon: '🪄' },
    { title: 'Card Fundamentals', icon: '🃏' },
    { title: 'Coin Tricks', icon: '🪙' },
    { title: 'Misdirection', icon: '👀' },
    { title: 'The Double Lift', icon: '🃏' },
    { title: 'Palming', icon: '✋' },
    { title: 'Forces', icon: '🎯' },
    { title: 'Rope Magic', icon: '🪢' },
    { title: 'Patter & Story', icon: '🎭' },
    { title: 'Card Controls', icon: '🃏' },
    { title: 'Sleight of Hand', icon: '🤲' },
    { title: 'Mind Reading', icon: '🧠' },
    { title: 'Stage Presence', icon: '🎪' },
    { title: 'False Shuffles', icon: '🔀' },
    { title: 'Vanishes', icon: '💨' },
    { title: 'Productions', icon: '✨' },
    { title: 'Levitation', icon: '🕊️' },
    { title: 'Escape Tricks', icon: '🔓' },
    { title: 'Close-Up Magic', icon: '🔍' },
    { title: 'Audience Work', icon: '👥' },
    { title: 'Combo Routines', icon: '🔗' },
    { title: 'Street Magic', icon: '🏙️' },
    { title: 'Full Routine', icon: '🎩' },
    { title: 'Master Performance', icon: '🎩' },
  ],
  'Drawing': [
    { title: 'Line Basics', icon: '✏️' },
    { title: 'Shapes & Forms', icon: '⬡' },
    { title: 'Light & Shadow', icon: '🌗' },
    { title: 'Proportions', icon: '📐' },
    { title: 'Texture', icon: '🪨' },
    { title: 'Perspective', icon: '🏗️' },
    { title: 'Faces', icon: '😊' },
    { title: 'Hands & Feet', icon: '✋' },
    { title: 'Body Anatomy', icon: '🦴' },
    { title: 'Gesture Drawing', icon: '💃' },
    { title: 'Composition', icon: '🖼️' },
    { title: 'Color Theory', icon: '🎨' },
    { title: 'Ink & Pen', icon: '🖊️' },
    { title: 'Digital Lines', icon: '💻' },
    { title: 'Environments', icon: '🏞️' },
    { title: 'Animals', icon: '🐾' },
    { title: 'Clothing', icon: '👕' },
    { title: 'Expressions', icon: '😤' },
    { title: 'Character Design', icon: '🧑‍🎨' },
    { title: 'Action Poses', icon: '🏃' },
    { title: 'Backgrounds', icon: '🌄' },
    { title: 'Storyboarding', icon: '🎬' },
    { title: 'Style Dev', icon: '⭐' },
    { title: 'Portfolio Piece', icon: '🏆' },
  ],
  'Guitar': [
    { title: 'Holding Guitar', icon: '🎸' },
    { title: 'Open Chords', icon: '🎵' },
    { title: 'Strumming', icon: '🤚' },
    { title: 'Finger Exercises', icon: '🖐️' },
    { title: 'Power Chords', icon: '⚡' },
    { title: 'Reading Tabs', icon: '📋' },
    { title: 'Barre Chords', icon: '💪' },
    { title: 'Minor Scale', icon: '🎼' },
    { title: 'Major Scale', icon: '🎶' },
    { title: 'Pentatonic', icon: '✨' },
    { title: 'Fingerpicking', icon: '🤌' },
    { title: 'Hammer-Ons', icon: '🔨' },
    { title: 'Pull-Offs', icon: '🪝' },
    { title: 'Bends & Slides', icon: '〰️' },
    { title: 'Blues Licks', icon: '🎷' },
    { title: 'Rhythm Patterns', icon: '🥁' },
    { title: 'Song Structure', icon: '📝' },
    { title: 'Improvisation', icon: '🎤' },
    { title: 'Chord Melody', icon: '🎹' },
    { title: 'Acoustic Style', icon: '🪵' },
    { title: 'Electric Tone', icon: '🔊' },
    { title: 'Song Writing', icon: '✍️' },
    { title: 'Performance', icon: '🎪' },
    { title: 'Master Jam', icon: '🎸' },
  ],
  'Piano': [
    { title: 'Keyboard Layout', icon: '🎹' },
    { title: 'Basic Scales', icon: '🎵' },
    { title: 'Simple Chords', icon: '🎶' },
    { title: 'Hand Position', icon: '✋' },
    { title: 'Right Hand', icon: '👉' },
    { title: 'Left Hand', icon: '👈' },
    { title: 'Both Hands', icon: '🙌' },
    { title: 'Chord Inversions', icon: '🔄' },
    { title: 'Arpeggios', icon: '✨' },
    { title: 'Sight Reading', icon: '📖' },
    { title: 'Dynamics', icon: '📢' },
    { title: 'Pedal Technique', icon: '🦶' },
    { title: 'Major Keys', icon: '☀️' },
    { title: 'Minor Keys', icon: '🌙' },
    { title: 'Blues Piano', icon: '🎷' },
    { title: 'Pop Patterns', icon: '🎤' },
    { title: 'Classical Intro', icon: '🎻' },
    { title: 'Jazz Voicings', icon: '🎺' },
    { title: 'Improvisation', icon: '💫' },
    { title: 'Accompaniment', icon: '🤝' },
    { title: 'Song Learning', icon: '📝' },
    { title: 'Composition', icon: '✍️' },
    { title: 'Performance', icon: '🎪' },
    { title: 'Master Recital', icon: '🎹' },
  ],
  'Singing': [
    { title: 'Breathing', icon: '🌬️' }, { title: 'Pitch Basics', icon: '🎵' }, { title: 'Vocal Range', icon: '📊' }, { title: 'Warm-Ups', icon: '🔥' }, { title: 'Vowel Shapes', icon: '👄' }, { title: 'Head Voice', icon: '☁️' }, { title: 'Chest Voice', icon: '💪' }, { title: 'Mix Voice', icon: '🔄' }, { title: 'Vibrato', icon: '〰️' }, { title: 'Dynamics', icon: '📢' }, { title: 'Runs & Riffs', icon: '✨' }, { title: 'Harmonizing', icon: '🎶' }, { title: 'Ear Training', icon: '👂' }, { title: 'Pop Style', icon: '🎤' }, { title: 'R&B Style', icon: '💜' }, { title: 'Rock Style', icon: '🤘' }, { title: 'Stage Movement', icon: '💃' }, { title: 'Mic Technique', icon: '🎙️' }, { title: 'Song Interp.', icon: '📖' }, { title: 'Emotion', icon: '😭' }, { title: 'Recording', icon: '🎧' }, { title: 'Duets', icon: '🤝' }, { title: 'Performance', icon: '🎪' }, { title: 'Master Show', icon: '🌟' },
  ],
  'Public Speaking': [
    { title: 'Confidence', icon: '💪' }, { title: 'Eye Contact', icon: '👁️' }, { title: 'Voice Power', icon: '📢' }, { title: 'Body Language', icon: '🧍' }, { title: 'Storytelling', icon: '📖' }, { title: 'Opening Hooks', icon: '🪝' }, { title: 'Structure', icon: '🏗️' }, { title: 'Pausing', icon: '⏸️' }, { title: 'Audience Read', icon: '👥' }, { title: 'Improvisation', icon: '💡' }, { title: 'Humor', icon: '😂' }, { title: 'Persuasion', icon: '🎯' }, { title: 'Data Storytelling', icon: '📊' }, { title: 'Q&A Handling', icon: '❓' }, { title: 'Debate', icon: '⚔️' }, { title: 'Pitch Perfect', icon: '💰' }, { title: 'TED-Style', icon: '🎤' }, { title: 'Panel Talks', icon: '🪑' }, { title: 'Keynote Build', icon: '🖥️' }, { title: 'Crisis Comms', icon: '🚨' }, { title: 'Virtual Talks', icon: '💻' }, { title: 'Workshops', icon: '🧑‍🏫' }, { title: 'Full Speech', icon: '🎪' }, { title: 'Master Orator', icon: '🗣️' },
  ],
  'Photography': [
    { title: 'Camera Basics', icon: '📷' }, { title: 'Composition', icon: '🖼️' }, { title: 'Rule of Thirds', icon: '📐' }, { title: 'Natural Light', icon: '☀️' }, { title: 'Focus', icon: '🔍' }, { title: 'Exposure', icon: '💡' }, { title: 'Aperture', icon: '⭕' }, { title: 'Shutter Speed', icon: '⚡' }, { title: 'ISO', icon: '🌙' }, { title: 'Color Theory', icon: '🎨' }, { title: 'Portraits', icon: '🧑' }, { title: 'Landscapes', icon: '🏞️' }, { title: 'Street', icon: '🏙️' }, { title: 'Macro', icon: '🔬' }, { title: 'Golden Hour', icon: '🌅' }, { title: 'Night Photo', icon: '🌃' }, { title: 'Editing Basics', icon: '🖥️' }, { title: 'Color Grading', icon: '🎬' }, { title: 'Black & White', icon: '⬛' }, { title: 'Mobile Photo', icon: '📱' }, { title: 'Storytelling', icon: '📖' }, { title: 'Series Work', icon: '📸' }, { title: 'Portfolio', icon: '🗂️' }, { title: 'Master Shot', icon: '📸' },
  ],
  'Dance': [
    { title: 'Rhythm Feel', icon: '🎵' }, { title: 'Basic Steps', icon: '👟' }, { title: 'Body Isolation', icon: '🧍' }, { title: 'Footwork', icon: '🦶' }, { title: 'Arm Movement', icon: '💪' }, { title: 'Hip-Hop Basics', icon: '🕺' }, { title: 'Pop & Lock', icon: '🤖' }, { title: 'Wave Motion', icon: '🌊' }, { title: 'Floor Work', icon: '🤸' }, { title: 'Turns & Spins', icon: '🔄' }, { title: 'Partner Basics', icon: '🤝' }, { title: 'Choreography', icon: '📋' }, { title: 'Musicality', icon: '🎶' }, { title: 'Freestyle', icon: '🔥' }, { title: 'Battle Moves', icon: '⚔️' }, { title: 'Latin Basics', icon: '💃' }, { title: 'Contemporary', icon: '🩰' }, { title: 'Street Style', icon: '🏙️' }, { title: 'Stage Presence', icon: '✨' }, { title: 'Transitions', icon: '🔗' }, { title: 'Group Sync', icon: '👥' }, { title: 'Video Dance', icon: '📹' }, { title: 'Full Routine', icon: '🎪' }, { title: 'Master Perf.', icon: '💃' },
  ],
  'Stand-up Comedy': [
    { title: 'What\'s Funny', icon: '😂' }, { title: 'Joke Structure', icon: '🏗️' }, { title: 'Setup/Punch', icon: '🥊' }, { title: 'Timing', icon: '⏱️' }, { title: 'Personal Stories', icon: '📖' }, { title: 'Crowd Reading', icon: '👥' }, { title: 'Callbacks', icon: '🔄' }, { title: 'Physical Comedy', icon: '🤡' }, { title: 'Misdirection', icon: '👀' }, { title: 'Tags', icon: '🏷️' }, { title: 'Act-Outs', icon: '🎭' }, { title: 'Dark Humor', icon: '🌑' }, { title: 'Wordplay', icon: '📝' }, { title: 'Improv Skills', icon: '💡' }, { title: 'Hecklers', icon: '🗣️' }, { title: '5-Min Set', icon: '⏱️' }, { title: 'Transitions', icon: '🔗' }, { title: 'Opening Strong', icon: '💥' }, { title: 'Closing Strong', icon: '🎆' }, { title: 'Recording Sets', icon: '📹' }, { title: 'Open Mics', icon: '🎤' }, { title: 'Writing Daily', icon: '✍️' }, { title: 'Full 15 Min', icon: '🎪' }, { title: 'Master Comic', icon: '🎭' },
  ],
};

const MORE_SKILL_LESSONS: Record<string, { title: string; icon: string }[]> = {
  'Trading': [
    { title: 'What Are Stocks', icon: '📈' },
    { title: 'How Exchanges Work', icon: '🏛️' },
    { title: 'Orders & Execution', icon: '📋' },
    { title: 'Bull Markets', icon: '🐂' },
    { title: 'Bear Markets', icon: '🐻' },
    { title: 'Market Cycles', icon: '🔄' },
    { title: 'Chart Types', icon: '📊' },
    { title: 'Timeframes', icon: '⏰' },
    { title: 'Price Action Basics', icon: '📉' },
    { title: 'Candle Anatomy', icon: '🕯️' },
    { title: 'Bullish Candles', icon: '🟢' },
    { title: 'Bearish Candles', icon: '🔴' },
    { title: 'Support Levels', icon: '📏' },
    { title: 'Resistance Levels', icon: '🧱' },
    { title: 'Breakout Signals', icon: '💥' },
    { title: 'Volume Basics', icon: '📶' },
    { title: 'Volume Signals', icon: '🔔' },
    { title: 'SMA Explained', icon: '〰️' },
    { title: 'EMA & Crossovers', icon: '✖️' },
    { title: 'MA Strategies', icon: '🎯' },
    { title: 'Stop-Loss Orders', icon: '🛑' },
    { title: 'Position Sizing', icon: '⚖️' },
    { title: 'Risk-Reward Ratio', icon: '🛡️' },
    { title: 'Day Trading', icon: '⏱️' },
    { title: 'Swing Trading', icon: '🔄' },
    { title: 'Trend Following', icon: '📈' },
    { title: 'Breakout Trading', icon: '💥' },
    { title: 'Trading Psychology', icon: '🧠' },
    { title: 'FOMO & Greed', icon: '😰' },
    { title: 'Options Basics', icon: '📋' },
    { title: 'Calls & Puts', icon: '📞' },
    { title: 'Crypto Intro', icon: '₿' },
    { title: 'Portfolio Balance', icon: '⚖️' },
    { title: 'Backtesting', icon: '🔬' },
    { title: 'Trading Plan', icon: '📝' },
    { title: 'Live Trading', icon: '🖥️' },
    { title: 'Master Trader', icon: '🐺' },
  ],
  'Business': [
    { title: 'Entrepreneur Mind', icon: '🧠' }, { title: 'Finding Ideas', icon: '💡' }, { title: 'Validation', icon: '✅' }, { title: 'Business Model', icon: '📋' }, { title: 'Target Market', icon: '🎯' }, { title: 'MVP Building', icon: '🏗️' }, { title: 'Sales 101', icon: '🤝' }, { title: 'Pitching', icon: '🎤' }, { title: 'Pricing Strategy', icon: '💰' }, { title: 'Branding', icon: '🏷️' }, { title: 'Social Media', icon: '📱' }, { title: 'Customer Service', icon: '💬' }, { title: 'Financial Basics', icon: '📊' }, { title: 'Cash Flow', icon: '💸' }, { title: 'Hiring', icon: '👥' }, { title: 'Leadership', icon: '👑' }, { title: 'Operations', icon: '⚙️' }, { title: 'Partnerships', icon: '🤝' }, { title: 'Funding', icon: '🏦' }, { title: 'Legal Basics', icon: '⚖️' }, { title: 'Scaling Up', icon: '🚀' }, { title: 'Automation', icon: '🤖' }, { title: 'Exit Strategy', icon: '🚪' }, { title: 'Master CEO', icon: '👔' },
  ],
  'Cooking': [
    { title: 'Kitchen Setup', icon: '🏠' }, { title: 'Knife Skills', icon: '🔪' }, { title: 'Heat Control', icon: '🔥' }, { title: 'Basic Cuts', icon: '🥕' }, { title: 'Seasoning', icon: '🧂' }, { title: 'Sautéing', icon: '🍳' }, { title: 'Boiling & Steam', icon: '♨️' }, { title: 'Roasting', icon: '🍖' }, { title: 'Sauces', icon: '🥫' }, { title: 'Pasta Mastery', icon: '🍝' }, { title: 'Rice & Grains', icon: '🍚' }, { title: 'Salads', icon: '🥗' }, { title: 'Soups', icon: '🍲' }, { title: 'Baking Basics', icon: '🍞' }, { title: 'Desserts', icon: '🍰' }, { title: 'Asian Cuisine', icon: '🥢' }, { title: 'Italian Cuisine', icon: '🇮🇹' }, { title: 'Mexican Cuisine', icon: '🌮' }, { title: 'Plating Art', icon: '🎨' }, { title: 'Meal Prep', icon: '📦' }, { title: 'Menu Planning', icon: '📋' }, { title: 'Food Photo', icon: '📸' }, { title: 'Dinner Party', icon: '🎉' }, { title: 'Master Chef', icon: '👨‍🍳' },
  ],
  'Fitness': [
    { title: 'Body Basics', icon: '🏋️' }, { title: 'Warm-Up', icon: '🔥' }, { title: 'Push-Ups', icon: '💪' }, { title: 'Squats', icon: '🦵' }, { title: 'Core Work', icon: '🎯' }, { title: 'Flexibility', icon: '🧘' }, { title: 'Cardio Intro', icon: '❤️' }, { title: 'HIIT Basics', icon: '⚡' }, { title: 'Weight Training', icon: '🏋️' }, { title: 'Deadlifts', icon: '🔨' }, { title: 'Bench Press', icon: '🪑' }, { title: 'Pull-Ups', icon: '🔝' }, { title: 'Nutrition 101', icon: '🥗' }, { title: 'Protein & Macros', icon: '🥩' }, { title: 'Recovery', icon: '😴' }, { title: 'Stretching', icon: '🤸' }, { title: 'Program Design', icon: '📋' }, { title: 'Progressive Load', icon: '📈' }, { title: 'Mobility', icon: '🔄' }, { title: 'Calisthenics', icon: '🤸' }, { title: 'Sport Training', icon: '⚽' }, { title: 'Mental Toughness', icon: '🧠' }, { title: 'Competition', icon: '🥇' }, { title: 'Peak Athlete', icon: '🦁' },
  ],
  'Chess': [
    { title: 'The Board', icon: '♟️' }, { title: 'Piece Moves', icon: '♞' }, { title: 'Check & Mate', icon: '♚' }, { title: 'Piece Values', icon: '⚖️' }, { title: 'Opening Basics', icon: '🚪' }, { title: 'Center Control', icon: '🎯' }, { title: 'Pins & Forks', icon: '📌' }, { title: 'Skewers', icon: '🍢' }, { title: 'Discovered Attacks', icon: '💥' }, { title: 'Castling', icon: '🏰' }, { title: 'Pawn Structure', icon: '🧱' }, { title: 'King Safety', icon: '🛡️' }, { title: 'Middlegame Plans', icon: '📋' }, { title: 'Endgame Basics', icon: '🏁' }, { title: 'King & Pawn', icon: '♔' }, { title: 'Rook Endgames', icon: '♖' }, { title: 'Sacrifices', icon: '⚔️' }, { title: 'Combinations', icon: '💎' }, { title: 'Positional Play', icon: '🧠' }, { title: 'Time Management', icon: '⏱️' }, { title: 'Famous Games', icon: '📖' }, { title: 'Puzzle Solving', icon: '🧩' }, { title: 'Tournament Play', icon: '🏟️' }, { title: 'Grandmaster', icon: '🏆' },
  ],
  'Coding': [
    { title: 'What is Code?', icon: '💻' }, { title: 'Variables', icon: '📦' }, { title: 'Data Types', icon: '🔤' }, { title: 'If/Else', icon: '🔀' }, { title: 'Loops', icon: '🔄' }, { title: 'Functions', icon: '⚙️' }, { title: 'Arrays', icon: '📋' }, { title: 'Objects', icon: '🧊' }, { title: 'String Methods', icon: '✂️' }, { title: 'Error Handling', icon: '🐛' }, { title: 'DOM Basics', icon: '🌐' }, { title: 'Events', icon: '🖱️' }, { title: 'APIs', icon: '🔌' }, { title: 'Async/Await', icon: '⏳' }, { title: 'Git Basics', icon: '🌿' }, { title: 'CSS Layout', icon: '📐' }, { title: 'React Intro', icon: '⚛️' }, { title: 'State', icon: '💾' }, { title: 'Components', icon: '🧩' }, { title: 'Databases', icon: '🗄️' }, { title: 'Auth', icon: '🔐' }, { title: 'Deployment', icon: '🚀' }, { title: 'Full Project', icon: '🏗️' }, { title: 'Master Dev', icon: '🧑‍💻' },
  ],
  'Marketing': [
    { title: 'Marketing 101', icon: '📣' }, { title: 'Target Audience', icon: '🎯' }, { title: 'Brand Identity', icon: '🏷️' }, { title: 'Content Types', icon: '📝' }, { title: 'Social Media', icon: '📱' }, { title: 'Instagram', icon: '📸' }, { title: 'TikTok', icon: '🎵' }, { title: 'YouTube', icon: '▶️' }, { title: 'Copywriting', icon: '✍️' }, { title: 'Email Marketing', icon: '📧' }, { title: 'SEO Basics', icon: '🔍' }, { title: 'Keywords', icon: '🔑' }, { title: 'Google Ads', icon: '💰' }, { title: 'Facebook Ads', icon: '📘' }, { title: 'Analytics', icon: '📊' }, { title: 'A/B Testing', icon: '🔬' }, { title: 'Funnels', icon: '🔻' }, { title: 'Landing Pages', icon: '📄' }, { title: 'Influencer Mkt', icon: '⭐' }, { title: 'PR & Media', icon: '📰' }, { title: 'Growth Hacking', icon: '🚀' }, { title: 'Automation', icon: '🤖' }, { title: 'Campaign Launch', icon: '🎯' }, { title: 'CMO Level', icon: '🏆' },
  ],
  'Meditation': [
    { title: 'Why Meditate?', icon: '🧘' }, { title: 'Posture', icon: '🪑' }, { title: 'Breath Focus', icon: '🌬️' }, { title: '5-Min Sit', icon: '⏱️' }, { title: 'Body Scan', icon: '🫧' }, { title: 'Monkey Mind', icon: '🐒' }, { title: 'Counting Breath', icon: '🔢' }, { title: 'Noting', icon: '📝' }, { title: 'Loving Kindness', icon: '❤️' }, { title: 'Walking', icon: '🚶' }, { title: 'Visualization', icon: '🌈' }, { title: 'Mantra', icon: '🕉️' }, { title: 'Stress Relief', icon: '😌' }, { title: 'Sleep', icon: '😴' }, { title: 'Focus', icon: '🎯' }, { title: 'Gratitude', icon: '🙏' }, { title: 'Emotions', icon: '💭' }, { title: 'Pain & Discomfort', icon: '🫂' }, { title: 'Open Awareness', icon: '🌊' }, { title: 'Silent Practice', icon: '🤫' }, { title: 'Daily Habit', icon: '📅' }, { title: 'Retreat Prep', icon: '🏕️' }, { title: 'Deep Practice', icon: '🧘' }, { title: 'Zen Master', icon: '☯️' },
  ],
  'Fashion Design': [
    { title: 'Fashion History', icon: '📜' }, { title: 'Sketching', icon: '✏️' }, { title: 'Color Theory', icon: '🎨' }, { title: 'Fabric Types', icon: '🧵' }, { title: 'Body Proportions', icon: '📐' }, { title: 'Silhouettes', icon: '👗' }, { title: 'Pattern Making', icon: '📋' }, { title: 'Draping', icon: '🪡' }, { title: 'Hand Sewing', icon: '🧵' }, { title: 'Machine Sewing', icon: '🪡' }, { title: 'Zippers & Buttons', icon: '🔘' }, { title: 'Menswear', icon: '👔' }, { title: 'Womenswear', icon: '👗' }, { title: 'Streetwear', icon: '🧢' }, { title: 'Accessories', icon: '👜' }, { title: 'Trend Research', icon: '🔍' }, { title: 'Moodboards', icon: '📌' }, { title: 'Tech Packs', icon: '📦' }, { title: 'Collection Theme', icon: '🎭' }, { title: 'Lookbook', icon: '📸' }, { title: 'Fashion Show', icon: '🎪' }, { title: 'Branding', icon: '🏷️' }, { title: 'Portfolio', icon: '🗂️' }, { title: 'Fashion Icon', icon: '🏆' },
  ],
  'Podcasting': [
    { title: 'Podcast Concept', icon: '💡' }, { title: 'Format Choice', icon: '📋' }, { title: 'Your Niche', icon: '🎯' }, { title: 'Mic Setup', icon: '🎙️' }, { title: 'Recording Space', icon: '🏠' }, { title: 'Software', icon: '💻' }, { title: 'Voice Training', icon: '🗣️' }, { title: 'Interview Skills', icon: '🤝' }, { title: 'Storytelling', icon: '📖' }, { title: 'Audio Editing', icon: '✂️' }, { title: 'Sound Quality', icon: '🔊' }, { title: 'Intro & Outro', icon: '🎵' }, { title: 'Show Notes', icon: '📝' }, { title: 'Cover Art', icon: '🎨' }, { title: 'Distribution', icon: '📡' }, { title: 'Apple & Spotify', icon: '🍎' }, { title: 'Social Clips', icon: '📱' }, { title: 'Guest Booking', icon: '📞' }, { title: 'Audience Build', icon: '📈' }, { title: 'Community', icon: '👥' }, { title: 'Sponsorships', icon: '💰' }, { title: 'Monetization', icon: '💸' }, { title: 'Network', icon: '🌐' }, { title: 'Top Podcaster', icon: '🏆' },
  ],
  'AI Tools': [
    { title: 'Prompt Basics', icon: '✍️' },
    { title: 'Prompt Structure', icon: '🏗️' },
    { title: 'Prompt Clarity', icon: '💡' },
    { title: 'Chain of Thought', icon: '🔗' },
    { title: 'Few-Shot Prompting', icon: '🎯' },
    { title: 'System Prompts', icon: '⚙️' },
    { title: 'Image Gen Basics', icon: '🖼️' },
    { title: 'Art Style Prompts', icon: '🎨' },
    { title: 'Image Parameters', icon: '📐' },
    { title: 'AI Video Basics', icon: '🎬' },
    { title: 'Video Gen Tools', icon: '📹' },
    { title: 'Video Workflows', icon: '🔄' },
    { title: 'AI Music Basics', icon: '🎵' },
    { title: 'Music Gen Tools', icon: '🎹' },
    { title: 'AI Composition', icon: '🎼' },
    { title: 'Code Assistants', icon: '💻' },
    { title: 'AI Debugging', icon: '🐛' },
    { title: 'Code Generation', icon: '⚡' },
    { title: 'Automation Basics', icon: '🤖' },
    { title: 'No-Code AI', icon: '🧱' },
    { title: 'AI Pipelines', icon: '🔗' },
    { title: 'RAG Fundamentals', icon: '🔍' },
    { title: 'Embeddings Intro', icon: '📊' },
    { title: 'Vector Databases', icon: '🗃️' },
    { title: 'Fine-Tune Basics', icon: '🔧' },
    { title: 'Training Data Prep', icon: '📋' },
    { title: 'Model Selection', icon: '🎯' },
    { title: 'AI Bias', icon: '⚖️' },
    { title: 'AI Safety', icon: '🛡️' },
    { title: 'Responsible AI', icon: '🤝' },
    { title: 'Agent Basics', icon: '🕵️' },
    { title: 'Agent Tools', icon: '🧰' },
    { title: 'Multi-Agent Systems', icon: '👥' },
    { title: 'ChatGPT Basics', icon: '💬' },
    { title: 'Power User Tips', icon: '⚡' },
    { title: 'Custom GPTs', icon: '🛠️' },
    { title: 'Business AI Strategy', icon: '💼' },
    { title: 'AI Customer Service', icon: '🎧' },
    { title: 'AI Marketing', icon: '📣' },
    { title: 'LLM Comparison', icon: '📊' },
    { title: 'Image AI Compared', icon: '🖼️' },
    { title: 'Choosing the Right AI', icon: '✅' },
    { title: 'AI Trends', icon: '🔮' },
    { title: 'AGI & Beyond', icon: '🧠' },
    { title: 'AI Jobs Impact', icon: '👔' },
    { title: 'AI Workflows', icon: '⚙️' },
    { title: 'Prompt Libraries', icon: '📚' },
    { title: 'AI & Creativity', icon: '🎭' },
    { title: 'Local AI Models', icon: '🖥️' },
    { title: 'AI Security', icon: '🔒' },
    { title: 'Multimodal AI', icon: '👁️' },
    { title: 'AI Monetization', icon: '💰' },
    { title: 'AI Projects', icon: '🏗️' },
    { title: 'AI Master', icon: '🤖' },
  ],
  'Sales': [
    { title: 'Buyer Psychology', icon: '🧠' },
    { title: 'Emotional Triggers', icon: '❤️' },
    { title: 'Trust Building', icon: '🤝' },
    { title: 'Close Fundamentals', icon: '🔑' },
    { title: 'Assumptive Close', icon: '✅' },
    { title: 'Advanced Closes', icon: '🏆' },
    { title: 'SPIN Overview', icon: '🔄' },
    { title: 'Situation Questions', icon: '📋' },
    { title: 'Implication & Need', icon: '💡' },
    { title: 'Cold Call Prep', icon: '📞' },
    { title: 'Opening Lines', icon: '💬' },
    { title: 'Handling Rejection', icon: '🛡️' },
    { title: 'Email Prospecting', icon: '📧' },
    { title: 'Subject Lines', icon: '✉️' },
    { title: 'Email Body Copy', icon: '✍️' },
    { title: 'Common Objections', icon: '🛡️' },
    { title: 'Price Objections', icon: '💰' },
    { title: 'Reframing Techniques', icon: '🔄' },
    { title: 'Funnel Stages', icon: '🔻' },
    { title: 'Top of Funnel', icon: '📣' },
    { title: 'Bottom of Funnel', icon: '💰' },
    { title: 'B2B Fundamentals', icon: '🏢' },
    { title: 'B2C Strategies', icon: '🛍️' },
    { title: 'Key Differences B2B B2C', icon: '⚖️' },
    { title: 'Negotiation Basics', icon: '🤝' },
    { title: 'Win-Win Deals', icon: '🎯' },
    { title: 'Deal Structuring', icon: '📋' },
    { title: 'LinkedIn Profile', icon: '💼' },
    { title: 'LinkedIn Outreach', icon: '📨' },
    { title: 'Content Selling', icon: '📝' },
    { title: 'CRM Basics', icon: '📊' },
    { title: 'Pipeline Management', icon: '🔧' },
    { title: 'Sales Dashboards', icon: '📈' },
    { title: 'Revenue Metrics', icon: '💰' },
    { title: 'Activity Metrics', icon: '📊' },
    { title: 'Forecasting', icon: '🔮' },
    { title: 'Discovery Prep', icon: '🔍' },
    { title: 'Asking Questions', icon: '❓' },
    { title: 'Qualifying Leads', icon: '✅' },
    { title: 'Value Proposition', icon: '💎' },
    { title: 'ROI Selling', icon: '📊' },
    { title: 'Value Framing', icon: '🖼️' },
    { title: 'Follow-Up Timing', icon: '⏰' },
    { title: 'Follow-Up Methods', icon: '📱' },
    { title: 'Re-engagement', icon: '🔄' },
    { title: 'Presentations', icon: '🎤' },
    { title: 'Territory Mgmt', icon: '🗺️' },
    { title: 'Account Strategy', icon: '🎯' },
    { title: 'Team Selling', icon: '👥' },
    { title: 'Channel Sales', icon: '🔗' },
    { title: 'SaaS Sales', icon: '☁️' },
    { title: 'Consultative Sell', icon: '🧑‍💼' },
    { title: 'Deal Review', icon: '📋' },
    { title: 'Sales Master', icon: '💎' },
  ],
  'Discipline': [
    { title: 'Habit Science', icon: '🔬' },
    { title: 'Habit Loops', icon: '🔁' },
    { title: 'Tracking Progress', icon: '📊' },
    { title: '1% Better Daily', icon: '⚛️' },
    { title: 'Identity Habits', icon: '🪪' },
    { title: 'Environment Design', icon: '🏠' },
    { title: 'Focus Foundations', icon: '🎯' },
    { title: 'Eliminating Distraction', icon: '🚫' },
    { title: 'Deep Work Rituals', icon: '📖' },
    { title: 'Pomodoro Basics', icon: '🍅' },
    { title: 'Break Optimization', icon: '☕' },
    { title: 'Task Batching', icon: '📦' },
    { title: 'Block Scheduling', icon: '📅' },
    { title: 'Priority Blocks', icon: '🥇' },
    { title: 'Weekly Planning', icon: '🗓️' },
    { title: 'Urgent vs Important', icon: '📊' },
    { title: 'Quadrant Strategy', icon: '🎯' },
    { title: 'Delegation Skills', icon: '🤝' },
    { title: 'Instant vs Delayed', icon: '🍬' },
    { title: 'Long-Term Thinking', icon: '🔭' },
    { title: 'Reward Systems', icon: '🏆' },
    { title: 'Dopamine Science', icon: '🧪' },
    { title: 'Digital Detox', icon: '📵' },
    { title: 'Resetting Baseline', icon: '🔄' },
    { title: 'Wake-Up Habits', icon: '🌅' },
    { title: 'Morning Movement', icon: '🏃' },
    { title: 'Routine Design', icon: '📋' },
    { title: 'Goal Setting Basics', icon: '🎯' },
    { title: 'Specific & Measurable', icon: '📏' },
    { title: 'Time-Bound Goals', icon: '⏰' },
    { title: 'Why We Procrastinate', icon: '⏰' },
    { title: '2-Minute Rule', icon: '⚡' },
    { title: 'Anti-Procrastination', icon: '🚀' },
    { title: 'What Is Flow', icon: '🌊' },
    { title: 'Flow Triggers', icon: '⚡' },
    { title: 'Sustaining Flow', icon: '🔄' },
    { title: 'Sleep Science', icon: '😴' },
    { title: 'Sleep Environment', icon: '🛏️' },
    { title: 'Sleep Optimization', icon: '⭐' },
    { title: 'Stoic Philosophy', icon: '🏛️' },
    { title: 'Dichotomy of Control', icon: '⚖️' },
    { title: 'Modern Stoicism', icon: '🌍' },
    { title: 'Cold Therapy Basics', icon: '🧊' },
    { title: 'Cold Shower Method', icon: '🚿' },
    { title: 'Mental Toughness', icon: '💪' },
    { title: 'Accountability', icon: '🤝' },
    { title: 'Digital Minimalism', icon: '📵' },
    { title: 'Journaling', icon: '📓' },
    { title: 'Energy Management', icon: '🔋' },
    { title: 'Willpower Science', icon: '💪' },
    { title: 'Mindfulness', icon: '🧘' },
    { title: 'Systems Thinking', icon: '⚙️' },
    { title: 'Life Audit', icon: '📋' },
    { title: 'Discipline Master', icon: '⚔️' },
  ],
  'Brain Training': [
    { title: 'Loci Method', icon: '🏰' },
    { title: 'Building Palaces', icon: '🏗️' },
    { title: 'Encoding Memories', icon: '🔐' },
    { title: 'Spacing Effect', icon: '🔁' },
    { title: 'Flashcard Systems', icon: '🃏' },
    { title: 'Review Schedules', icon: '📅' },
    { title: 'Recall Basics', icon: '🧠' },
    { title: 'Testing Effect', icon: '📝' },
    { title: 'Self-Quizzing', icon: '❓' },
    { title: 'Chunking Info', icon: '🧩' },
    { title: 'Acronym Tricks', icon: '🔤' },
    { title: 'Visual Mnemonics', icon: '🎨' },
    { title: 'Common Biases', icon: '🪞' },
    { title: 'Decision Biases', icon: '⚖️' },
    { title: 'Debiasing Methods', icon: '🛡️' },
    { title: 'Flow Neuroscience', icon: '🌊' },
    { title: 'Flow Chemistry', icon: '🧪' },
    { title: 'Flow Training', icon: '🎯' },
    { title: 'Logic Foundations', icon: '🔬' },
    { title: 'Argument Analysis', icon: '📊' },
    { title: 'Fallacy Detection', icon: '🚨' },
    { title: 'Brain Rewiring', icon: '🧬' },
    { title: 'Learning New Skills', icon: '📚' },
    { title: 'Neural Pathways', icon: '🛤️' },
    { title: 'Brain Foods', icon: '🥗' },
    { title: 'Nootropics Intro', icon: '💊' },
    { title: 'Diet & Cognition', icon: '🍎' },
    { title: 'Quick Addition', icon: '➕' },
    { title: 'Fast Multiplication', icon: '✖️' },
    { title: 'Math Shortcuts', icon: '⚡' },
    { title: 'Self-Awareness', icon: '🪞' },
    { title: 'Emotion Regulation', icon: '🎚️' },
    { title: 'Empathy Skills', icon: '❤️' },
    { title: 'Thinking About Thinking', icon: '🤔' },
    { title: 'Learning Strategies', icon: '📖' },
    { title: 'Cognitive Flexibility', icon: '🔄' },
    { title: 'Working Memory', icon: '🧠' },
    { title: 'N-Back Training', icon: '🎮' },
    { title: 'Transfer Effects', icon: '🔗' },
    { title: 'Decision Frameworks', icon: '🗺️' },
    { title: 'Risk Assessment', icon: '⚖️' },
    { title: 'Intuition vs Analysis', icon: '🎯' },
    { title: 'Speed Reading', icon: '📖' },
    { title: 'Logic Puzzles', icon: '🧩' },
    { title: 'Pattern Recognition', icon: '👁️' },
    { title: 'Focus Training', icon: '🎯' },
    { title: 'Mind Mapping', icon: '🗺️' },
    { title: 'Lateral Thinking', icon: '💡' },
    { title: 'Memory Systems', icon: '💾' },
    { title: 'Brain Games', icon: '🎲' },
    { title: 'Cognitive Fitness', icon: '🏋️' },
    { title: 'Brain Master', icon: '🧬' },
  ],
  'Online Business': [
    { title: 'Dropship Model', icon: '📦' },
    { title: 'Finding Dropship Products', icon: '🔎' },
    { title: 'Dropship Marketing', icon: '📣' },
    { title: 'FBA Basics', icon: '🏭' },
    { title: 'FBA Product Research', icon: '🔬' },
    { title: 'FBA Logistics', icon: '🚚' },
    { title: 'POD Model', icon: '👕' },
    { title: 'POD Design & Platforms', icon: '🎨' },
    { title: 'POD Scaling', icon: '📈' },
    { title: 'Affiliate Basics', icon: '🔗' },
    { title: 'Affiliate Niche', icon: '🎯' },
    { title: 'Affiliate Content', icon: '📝' },
    { title: 'Freelance Start', icon: '💻' },
    { title: 'Finding Freelance Clients', icon: '🔍' },
    { title: 'Freelance Pricing', icon: '💲' },
    { title: 'Creator Economy', icon: '🎥' },
    { title: 'Content Strategy', icon: '📋' },
    { title: 'Building Audience', icon: '👥' },
    { title: 'SaaS Model', icon: '☁️' },
    { title: 'SaaS Metrics', icon: '📊' },
    { title: 'SaaS Growth', icon: '📈' },
    { title: 'Store Setup', icon: '🛒' },
    { title: 'Product Pages', icon: '📄' },
    { title: 'E-com Optimization', icon: '📈' },
    { title: 'Platform Strategy', icon: '📱' },
    { title: 'Content Calendar', icon: '📅' },
    { title: 'Social Engagement', icon: '💬' },
    { title: 'SEO Fundamentals', icon: '🔍' },
    { title: 'Keyword Research', icon: '🔑' },
    { title: 'On-Page & Links', icon: '🔗' },
    { title: 'List Building', icon: '📧' },
    { title: 'Email Sequences', icon: '📨' },
    { title: 'Email Performance', icon: '📊' },
    { title: 'Revenue Basics', icon: '💰' },
    { title: 'Cash Flow & Planning', icon: '💸' },
    { title: 'Profit Margins', icon: '📊' },
    { title: 'Business Structure', icon: '🏛️' },
    { title: 'Tax & Legal Basics', icon: '🧾' },
    { title: 'Contracts & IP', icon: '📜' },
    { title: 'When to Scale', icon: '🚀' },
    { title: 'Hiring & Teams', icon: '👥' },
    { title: 'Systems & Growth', icon: '⚙️' },
    { title: 'Blockchain Basics', icon: '⛓️' },
    { title: 'Crypto Trading', icon: '₿' },
    { title: 'DeFi & Web3', icon: '🌐' },
    { title: 'Sales Funnels Online', icon: '🔻' },
    { title: 'Copywriting Basics', icon: '✍️' },
    { title: 'Analytics & Data', icon: '📊' },
    { title: 'Automation Tools', icon: '🤖' },
    { title: 'Brand Building', icon: '🏷️' },
    { title: 'Outsourcing', icon: '🌐' },
    { title: 'Customer Retention', icon: '🤝' },
    { title: 'Launch Strategy', icon: '🎯' },
    { title: 'Online Mogul', icon: '🏆' },
  ],
  'Marketing Agency': [
    { title: 'What Is an Agency', icon: '🏢' },
    { title: 'Agency Types', icon: '📋' },
    { title: 'Agency Business Model', icon: '💼' },
    { title: 'Choosing Your Niche', icon: '🎯' },
    { title: 'SMMA Model', icon: '📱' },
    { title: 'SEO Agency Model', icon: '🔍' },
    { title: 'Paid Ads Agency', icon: '💰' },
    { title: 'Content Agency', icon: '✍️' },
    { title: 'Web Design Agency', icon: '🌐' },
    { title: 'Finding First Clients', icon: '🤝' },
    { title: 'Cold Outreach Basics', icon: '📧' },
    { title: 'LinkedIn Prospecting', icon: '💼' },
    { title: 'Referral Systems', icon: '🔗' },
    { title: 'Free Work Strategy', icon: '🎁' },
    { title: 'Cold Email Scripts', icon: '📝' },
    { title: 'Email Follow-Ups', icon: '📨' },
    { title: 'Email Personalization', icon: '🎯' },
    { title: 'Cold Calling Basics', icon: '📞' },
    { title: 'Objection Handling', icon: '🛡️' },
    { title: 'Service Packaging', icon: '📦' },
    { title: 'Bundling Services', icon: '🔗' },
    { title: 'Retainer vs Project', icon: '💲' },
    { title: 'Value-Based Pricing', icon: '💎' },
    { title: 'Proposals & SOW', icon: '📄' },
    { title: 'Contracts & MSA', icon: '📜' },
    { title: 'Client Onboarding', icon: '🚀' },
    { title: 'Kickoff Calls', icon: '📞' },
    { title: 'Setting Expectations', icon: '📏' },
    { title: 'Monthly Reporting', icon: '📊' },
    { title: 'Client Retention', icon: '🤝' },
    { title: 'Upselling Clients', icon: '📈' },
    { title: 'Delivering FB Ads', icon: '📘' },
    { title: 'Delivering Google Ads', icon: '🔎' },
    { title: 'Delivering SEO', icon: '🔍' },
    { title: 'Content Delivery', icon: '📝' },
    { title: 'Hiring VAs', icon: '👤' },
    { title: 'Hiring Contractors', icon: '🧑‍💻' },
    { title: 'When to Hire', icon: '👥' },
    { title: 'SOPs & Systems', icon: '⚙️' },
    { title: 'Project Management', icon: '📋' },
    { title: 'Agency Templates', icon: '📑' },
    { title: 'Financial Management', icon: '💰' },
    { title: 'Profit Margins', icon: '📊' },
    { title: 'Taxes & Expenses', icon: '🧾' },
    { title: 'Zero to 10K/Month', icon: '🚀' },
    { title: '10K to 100K', icon: '📈' },
    { title: 'Agency Automation', icon: '🤖' },
    { title: 'AI for Agencies', icon: '🧠' },
    { title: 'Personal Brand', icon: '⭐' },
    { title: 'Authority Building', icon: '👑' },
    { title: 'Agency Mogul', icon: '🏆' },
  ],
  'Real Estate': [
    { title: 'Property Types', icon: '🏠' },
    { title: 'Market Analysis', icon: '📊' },
    { title: 'Financing Basics', icon: '💰' },
    { title: 'Mortgage Types', icon: '🏦' },
    { title: 'Down Payments', icon: '💵' },
    { title: 'House Hacking', icon: '🏘️' },
    { title: 'Rental Income', icon: '🔑' },
    { title: 'Cash Flow Analysis', icon: '💸' },
    { title: 'Cap Rate', icon: '📈' },
    { title: 'ROI Calculation', icon: '🧮' },
    { title: 'Finding Deals', icon: '🔍' },
    { title: 'Negotiation', icon: '🤝' },
    { title: 'Due Diligence', icon: '📋' },
    { title: 'Home Inspection', icon: '🔎' },
    { title: 'Closing Process', icon: '✍️' },
    { title: 'Landlord Basics', icon: '🏗️' },
    { title: 'Tenant Screening', icon: '👥' },
    { title: 'Property Management', icon: '⚙️' },
    { title: 'REITs', icon: '📊' },
    { title: 'Wholesaling', icon: '🔄' },
    { title: 'Fix & Flip', icon: '🔨' },
    { title: 'Tax Benefits', icon: '🧾' },
    { title: '1031 Exchange', icon: '🔁' },
    { title: 'Master Investor', icon: '🏠' },
  ],
  'Side Hustles': [
    { title: 'Finding Your Hustle', icon: '💡' },
    { title: 'Freelancing 101', icon: '🛠️' },
    { title: 'Gig Economy', icon: '🚗' },
    { title: 'Etsy & Crafts', icon: '🎨' },
    { title: 'Print on Demand', icon: '👕' },
    { title: 'Dropshipping Basics', icon: '📦' },
    { title: 'Amazon FBA', icon: '📬' },
    { title: 'Content Creation', icon: '🎬' },
    { title: 'YouTube Monetize', icon: '▶️' },
    { title: 'TikTok Income', icon: '📱' },
    { title: 'Affiliate Marketing', icon: '🔗' },
    { title: 'Online Tutoring', icon: '📚' },
    { title: 'Virtual Assistant', icon: '💻' },
    { title: 'Social Media Mgmt', icon: '📲' },
    { title: 'Graphic Design', icon: '🖌️' },
    { title: 'Web Development', icon: '🌐' },
    { title: 'App Ideas', icon: '📱' },
    { title: 'Flipping Items', icon: '♻️' },
    { title: 'Rental Business', icon: '🏠' },
    { title: 'Passive Income', icon: '💰' },
    { title: 'Scaling Up', icon: '🚀' },
    { title: 'Tax & Legal', icon: '⚖️' },
    { title: 'Multiple Streams', icon: '🌊' },
    { title: 'Master Hustler', icon: '💰' },
  ],
  'Negotiation': [
    { title: 'Negotiation 101', icon: '🤝' },
    { title: 'BATNA', icon: '🎯' },
    { title: 'Anchoring', icon: '⚓' },
    { title: 'Win-Win', icon: '🏆' },
    { title: 'Power Dynamics', icon: '⚡' },
    { title: 'Active Listening', icon: '👂' },
    { title: 'Reading the Room', icon: '👀' },
    { title: 'Making Offers', icon: '📝' },
    { title: 'Counter Offers', icon: '🔄' },
    { title: 'Concessions', icon: '🤲' },
    { title: 'Deadlocks', icon: '🔒' },
    { title: 'Salary Negotiation', icon: '💰' },
    { title: 'Car Buying', icon: '🚗' },
    { title: 'Real Estate Deals', icon: '🏠' },
    { title: 'Vendor Contracts', icon: '📋' },
    { title: 'Hostage Tactics', icon: '🎭' },
    { title: 'Emotional Control', icon: '🧘' },
    { title: 'Cultural Styles', icon: '🌍' },
    { title: 'Team Negotiation', icon: '👥' },
    { title: 'Phone vs Email', icon: '📱' },
    { title: 'Written Agreements', icon: '✍️' },
    { title: 'Follow-Up', icon: '📬' },
    { title: 'Advanced Tactics', icon: '♟️' },
    { title: 'Master Negotiator', icon: '🤝' },
  ],
  'Body Language': [
    { title: 'Body Language 101', icon: '🧍' },
    { title: 'First Impressions', icon: '👋' },
    { title: 'Eye Contact', icon: '👁️' },
    { title: 'Facial Expressions', icon: '😊' },
    { title: 'Hand Gestures', icon: '🤌' },
    { title: 'Posture', icon: '🧎' },
    { title: 'Personal Space', icon: '📏' },
    { title: 'Mirroring', icon: '🪞' },
    { title: 'Confidence Signals', icon: '💪' },
    { title: 'Deception Clues', icon: '🕵️' },
    { title: 'Micro Expressions', icon: '⚡' },
    { title: 'Interview Signals', icon: '💼' },
    { title: 'Date Signals', icon: '❤️' },
    { title: 'Business Meetings', icon: '🏢' },
    { title: 'Power Poses', icon: '🦸' },
    { title: 'Handshake Types', icon: '🤝' },
    { title: 'Walking Styles', icon: '🚶' },
    { title: 'Voice Tone', icon: '🎙️' },
    { title: 'Cluster Reading', icon: '🔍' },
    { title: 'Cultural Differences', icon: '🌐' },
    { title: 'Online Body Language', icon: '💻' },
    { title: 'Emotional Reading', icon: '🧠' },
    { title: 'Lie Detection', icon: '🔎' },
    { title: 'Master Reader', icon: '👁️' },
  ],
  'Persuasion': [
    { title: 'Influence 101', icon: '🧲' },
    { title: 'Reciprocity', icon: '🎁' },
    { title: 'Scarcity', icon: '⏳' },
    { title: 'Authority', icon: '👔' },
    { title: 'Social Proof', icon: '👥' },
    { title: 'Liking', icon: '😄' },
    { title: 'Commitment', icon: '🔗' },
    { title: 'Framing Effects', icon: '🖼️' },
    { title: 'Anchoring Bias', icon: '⚓' },
    { title: 'Loss Aversion', icon: '😰' },
    { title: 'Dark Patterns', icon: '🕳️' },
    { title: 'Gaslighting Defense', icon: '🛡️' },
    { title: 'Emotional Triggers', icon: '💥' },
    { title: 'NLP Basics', icon: '🗣️' },
    { title: 'Storytelling Power', icon: '📖' },
    { title: 'Priming', icon: '🌱' },
    { title: 'Foot in Door', icon: '🚪' },
    { title: 'Door in Face', icon: '🚫' },
    { title: 'Contrast Principle', icon: '⚖️' },
    { title: 'Cognitive Biases', icon: '🧩' },
    { title: 'Ethical Persuasion', icon: '✅' },
    { title: 'Advertising Tricks', icon: '📺' },
    { title: 'Propaganda Awareness', icon: '📰' },
    { title: 'Master Persuader', icon: '🧲' },
  ],
};

// Merge all lesson maps
Object.assign(SKILL_LESSONS, MORE_SKILL_LESSONS);

const DEFAULT_LESSONS = Array.from({ length: 24 }, (_, i) => ({
  title: `Lesson ${i + 1}`,
  icon: '📚',
}));

const TOTAL_LESSONS = 24;

export function GamesHomeScreen({ navigation }: { navigation: any }) {
  const { xp, dailyXp, dailyXpGoal, level, completedLessons, currentLesson, initialize, missedQuestions } =
    useGameStore();
  const profile = useUserStore((s) => s.profile);
  const [skillName, setSkillName] = useState('');
  const [skillLoaded, setSkillLoaded] = useState(false);

  const isPremium = profile?.premium_expires_at
    ? new Date(profile.premium_expires_at) > new Date()
    : false;

  const [showPaywall, setShowPaywall] = useState(false);
  const [dailyLessonUsed, setDailyLessonUsed] = useState(false);
  const [devMode, setDevMode] = useState(false);
  const devTapCount = useRef(0);
  const devTapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleDevTap = () => {
    devTapCount.current += 1;
    if (devTapTimer.current) clearTimeout(devTapTimer.current);
    if (devTapCount.current >= 5) {
      setDevMode((prev) => !prev);
      devTapCount.current = 0;
      try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch {}
    } else {
      devTapTimer.current = setTimeout(() => { devTapCount.current = 0; }, 1500);
    }
  };

  const checkDailyLesson = useCallback(async () => {
    if (isPremium) return false;
    try {
      const today = new Date().toISOString().split('T')[0];
      const storedDate = await AsyncStorage.getItem('skilly_daily_lesson_date');
      const storedCount = await AsyncStorage.getItem('skilly_daily_lesson_count');
      if (storedDate !== today) {
        await AsyncStorage.setItem('skilly_daily_lesson_date', today);
        await AsyncStorage.setItem('skilly_daily_lesson_count', '0');
        setDailyLessonUsed(false);
        return false;
      }
      const count = storedCount ? parseInt(storedCount, 10) : 0;
      if (count >= 1) {
        setDailyLessonUsed(true);
        return true;
      }
      setDailyLessonUsed(false);
      return false;
    } catch { return false; }
  }, [isPremium]);

  useEffect(() => { checkDailyLesson(); }, [checkDailyLesson]);

  // Re-check daily limit when screen comes back into focus (after completing a lesson)
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      checkDailyLesson();
    });
    return unsubscribe;
  }, [navigation, checkDailyLesson]);

  // Paywall is now rendered as a modal overlay (not early return) to avoid hooks violation
  // See paywallOverlay below in the main return

  // This block is intentionally removed - free users can now access mini-games with 1 lesson/day limit
  // The paywall check happens in handleLessonPress instead
  void(0); // placeholder to keep code structure clean
  if (false) {
    return (
      <SafeAreaView style={styles.screen} edges={['top']}>
        <AmbientGlow color={colors.secondary} size={300} opacity={0.08} top="30%" left="50%" />
        <View style={styles.paywallContainer}>
          <LinearGradient
            colors={[colors.secondary, colors.secondaryDark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.paywallIcon}
          >
            <Text style={{ fontSize: 40 }}>🎮</Text>
          </LinearGradient>
          <Text style={styles.paywallTitle}>Unlock Mini-Games</Text>
          <Text style={styles.paywallSubtitle}>
            12 types of interactive games to master your skill faster.{'\n'}Quiz, memory, sorting, swiping and more.
          </Text>
          <View style={styles.paywallFeatures}>
            {['12 game types', 'XP & leveling system', 'Combo bonuses', '24 lessons per skill'].map((f) => (
              <View key={f} style={styles.paywallFeatureRow}>
                <Ionicons name="checkmark-circle" size={18} color={colors.success} />
                <Text style={styles.paywallFeatureText}>{f}</Text>
              </View>
            ))}
          </View>
          <TouchableOpacity
            style={styles.paywallButton}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('ProfileTab', { screen: 'Subscription' })}
          >
            <LinearGradient
              colors={[colors.primary, colors.primaryDark]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.paywallButtonGradient}
            >
              <Text style={styles.paywallButtonText}>Go Premium — $6.99/mo</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const completedPulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    initialize();
    useLeagueStore.getState().initialize();
    // Load cached skill name first, then refresh from Supabase
    AsyncStorage.getItem('skilly_current_skill_name').then(cached => {
      if (cached) { setSkillName(cached); setSkillLoaded(true); }
    });
    if (profile?.selected_skill_id) {
      supabase.from('skills').select('name').eq('id', profile.selected_skill_id).single()
        .then(({ data }) => {
          if (data) {
            setSkillName(data.name);
            setSkillLoaded(true);
            AsyncStorage.setItem('skilly_current_skill_name', data.name);
          }
        });
    }
  }, [profile?.selected_skill_id]);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.08, duration: 1200, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1200, useNativeDriver: true }),
      ]),
    ).start();
  }, [pulseAnim]);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(completedPulseAnim, { toValue: 1.05, duration: 2000, useNativeDriver: true }),
        Animated.timing(completedPulseAnim, { toValue: 1, duration: 2000, useNativeDriver: true }),
      ]),
    ).start();
  }, [completedPulseAnim]);

  const dailyProgress = Math.min(dailyXp / dailyXpGoal, 1);

  const skillLessons = (skillLoaded && SKILL_LESSONS[skillName]) ? SKILL_LESSONS[skillName] : DEFAULT_LESSONS;
  const lessons = skillLessons.map((lesson, i) => {
    const num = i + 1;
    const completed = completedLessons.includes(num);
    const isCurrent = num === currentLesson;
    const locked = devMode ? false : num > currentLesson;
    const isMaster = !!(lesson.title && lesson.title.includes('Master'));
    return { num, completed, isCurrent, locked, title: lesson.title, icon: lesson.icon, isMaster };
  });

  const handleLessonPress = async (lessonNum: number) => {
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); } catch {}

    // Check daily lesson limit for free users
    if (!isPremium && !devMode) {
      // Quick check from state first
      if (dailyLessonUsed) {
        setShowPaywall(true);
        return;
      }
      // Double-check from AsyncStorage
      const blocked = await checkDailyLesson();
      if (blocked) {
        setShowPaywall(true);
        return;
      }
      // Increment count NOW (when starting), not when finishing
      // This prevents bypass by force-closing the app mid-lesson
      try {
        const today = new Date().toISOString().split('T')[0];
        await AsyncStorage.setItem('skilly_daily_lesson_date', today);
        const stored = await AsyncStorage.getItem('skilly_daily_lesson_count');
        const count = stored ? parseInt(stored, 10) : 0;
        await AsyncStorage.setItem('skilly_daily_lesson_count', String(count + 1));
        setDailyLessonUsed(true); // Update state immediately
      } catch (e) { console.warn('Increment daily lesson count failed:', e); }
    }

    // Check if this is a Master module → launch simulation
    const skillLessonsList = SKILL_LESSONS[skillName] || DEFAULT_LESSONS;
    const lesson = skillLessonsList[lessonNum - 1];
    if (lesson && lesson.title && lesson.title.includes('Master')) {
      if (skillName === 'Trading') {
        (navigation as any).navigate('TradingSim', { lessonNumber: lessonNum, skillName });
      } else {
        (navigation as any).navigate('MasterSim', { lessonNumber: lessonNum, skillName });
      }
      return;
    }

    (navigation as any).navigate('GameSession', { lessonNumber: lessonNum, skillName });
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <AmbientGlow color={colors.primary} size={300} opacity={0.06} top={-50} left="50%" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleDevTap} activeOpacity={1}>
          <Text style={styles.title}>Games</Text>
          <Text style={styles.subtitle}>{skillName}{devMode ? ' [DEV]' : ''}</Text>
        </TouchableOpacity>

        <View style={styles.headerRight}>
          <GlassCard style={styles.xpBadge}>
            <Text style={styles.xpText}>{xp} XP</Text>
          </GlassCard>
          <View style={styles.levelBadge}>
            <LinearGradient
              colors={[colors.secondary, colors.secondaryDark]}
              style={styles.levelGradient}
            >
              <Text style={styles.levelText}>Lv.{level}</Text>
            </LinearGradient>
          </View>
        </View>
      </View>

      {/* Daily Progress */}
      <View style={styles.dailyContainer}>
        <View style={styles.dailyHeader}>
          <Text style={styles.dailyLabel}>DAILY GOAL</Text>
          <Text style={styles.dailyValue}>
            {dailyXp}/{dailyXpGoal} XP
          </Text>
        </View>
        <View style={styles.progressBar}>
          <LinearGradient
            colors={[colors.primary, colors.primaryDark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.progressFill, { width: `${dailyProgress * 100}%` }]}
          />
        </View>
      </View>

      {/* Review Mode */}
      {missedQuestions.length > 0 && (
        <TouchableOpacity
          onPress={() => (navigation as any).navigate('ReviewMode')}
          activeOpacity={0.7}
          style={styles.liveCard}
        >
          <LinearGradient
            colors={[colors.error + '20', '#F59E0B' + '15']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.liveGradient}
          >
            <View style={[styles.liveIconCircle, { backgroundColor: colors.error + '20' }]}>
              <Ionicons name="refresh" size={24} color={colors.error} />
            </View>
            <View style={styles.liveTextContainer}>
              <Text style={styles.liveTitle}>{t('review.title')}</Text>
              <Text style={styles.liveSub}>{t('review.reviewXQuestions', { count: missedQuestions.length })}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </LinearGradient>
        </TouchableOpacity>
      )}

      {/* Lesson Path */}
      <ScrollView
        style={styles.pathScroll}
        contentContainerStyle={styles.pathContent}
        showsVerticalScrollIndicator={false}
      >
        {lessons.map((lesson, idx) => {
          const xOffset =
            Math.sin((idx / 3) * Math.PI) * PATH_AMPLITUDE;
          const isLast = idx === lessons.length - 1;

          return (
            <View key={lesson.num} style={styles.lessonRow}>
              {/* Connecting line */}
              {!isLast && (
                <View
                  style={[
                    styles.connector,
                    {
                      left: SCREEN_WIDTH / 2 + xOffset - 1,
                    },
                    lesson.locked && styles.connectorLocked,
                  ]}
                />
              )}

              {/* Bubble */}
              <TouchableOpacity
                onPress={() => handleLessonPress(lesson.num)}
                disabled={lesson.locked}
                activeOpacity={0.7}
                style={[styles.bubbleWrapper, { marginLeft: xOffset }]}
              >
                {lesson.isMaster && !lesson.locked ? (
                  <Animated.View style={{ transform: [{ scale: lesson.isCurrent ? pulseAnim : completedPulseAnim }] }}>
                    <LinearGradient
                      colors={lesson.completed ? ['#34D399', '#059669'] : ['#F59E0B', '#D97706']}
                      style={[styles.bubble, styles.masterBubble, glowShadow(lesson.completed ? '#34D399' : '#F59E0B')]}
                    >
                      <Text style={styles.masterIcon}>{lesson.icon}</Text>
                    </LinearGradient>
                  </Animated.View>
                ) : lesson.isMaster && lesson.locked ? (
                  <View style={[styles.bubble, styles.masterBubble, styles.masterLockedBubble]}>
                    <Text style={[styles.masterIcon, { opacity: 0.4 }]}>{lesson.icon}</Text>
                  </View>
                ) : lesson.isCurrent ? (
                  <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                    <LinearGradient
                      colors={[colors.primary, colors.primaryDark]}
                      style={[styles.bubble, styles.currentBubble, glowShadow(colors.primary)]}
                    >
                      <Text style={styles.bubbleIcon}>{lesson.icon}</Text>
                    </LinearGradient>
                  </Animated.View>
                ) : lesson.completed ? (
                  <Animated.View style={{ transform: [{ scale: completedPulseAnim }] }}>
                    <LinearGradient
                      colors={[colors.success, colors.successDark]}
                      style={[styles.bubble, glowShadow(colors.success)]}
                    >
                      <Text style={styles.bubbleIcon}>{lesson.icon}</Text>
                    </LinearGradient>
                  </Animated.View>
                ) : (
                  <View style={[styles.bubble, styles.lockedBubble]}>
                    <Text style={[styles.bubbleIcon, { opacity: 0.3 }]}>{lesson.icon}</Text>
                  </View>
                )}

                {/* Lesson title */}
                <Text
                  style={[
                    styles.lessonLabel,
                    lesson.isCurrent && styles.currentLabel,
                    lesson.locked && { color: colors.textMuted },
                    lesson.isMaster && styles.masterLabel,
                    lesson.isMaster && lesson.locked && { color: 'rgba(245, 158, 11, 0.4)' },
                  ]}
                  numberOfLines={1}
                >
                  {lesson.isMaster ? '⭐ ' : ''}{lesson.title}
                </Text>
              </TouchableOpacity>
            </View>
          );
        })}

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Paywall Overlay */}
      {showPaywall && (
        <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.95)', zIndex: 100, justifyContent: 'center', alignItems: 'center' }]}>
          <AmbientGlow color={colors.primary} size={300} opacity={0.08} top="30%" left="50%" />
          <View style={styles.paywallContainer}>
            <Text style={{ fontSize: 60, marginBottom: 20 }}>🔒</Text>
            <Text style={styles.paywallTitle}>{t('paywall.title')}</Text>
            <Text style={styles.paywallSubtitle}>{t('paywall.body')}</Text>
            <TouchableOpacity
              style={styles.paywallButton}
              activeOpacity={0.8}
              onPress={() => navigation.navigate('ProfileTab', { screen: 'Subscription' })}
            >
              <LinearGradient
                colors={[colors.primary, colors.primaryDark]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.paywallButtonGradient}
              >
                <Text style={styles.paywallButtonText}>{t('paywall.upgrade')}</Text>
              </LinearGradient>
            </TouchableOpacity>
            <Text style={{ color: colors.textSecondary, fontSize: 14, marginTop: 16, textAlign: 'center' }}>{t('paywall.tomorrow')}</Text>
            <TouchableOpacity onPress={() => setShowPaywall(false)} style={{ marginTop: 20 }}>
              <Text style={{ color: colors.textMuted, fontSize: 13 }}>← Back</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
  title: { ...typography.h1, color: colors.textPrimary },
  subtitle: { ...typography.bodySmall, color: colors.textSecondary, marginTop: 2 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  xpBadge: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  xpText: { ...typography.bodySmall, color: colors.primary, fontWeight: '700' },
  levelBadge: { borderRadius: borderRadius.full, overflow: 'hidden' },
  levelGradient: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  levelText: { color: '#fff', fontWeight: '800', fontSize: 12 },

  dailyContainer: { paddingHorizontal: spacing.xl, marginBottom: spacing.lg },
  dailyHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm },
  dailyLabel: { ...typography.label, color: colors.textSecondary },
  dailyValue: { ...typography.bodySmall, color: colors.textSecondary },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: 3 },

  pathScroll: { flex: 1 },
  pathContent: { alignItems: 'center', paddingTop: spacing.lg, paddingBottom: 120 },
  lessonRow: {
    alignItems: 'center',
    marginBottom: spacing.sm,
    position: 'relative',
    width: '100%',
  },
  connector: {
    position: 'absolute',
    top: BUBBLE_SIZE - 4,
    width: 2,
    height: 36,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  connectorLocked: { borderStyle: 'dashed', backgroundColor: 'rgba(255,255,255,0.04)' },
  bubbleWrapper: { alignItems: 'center' },
  bubble: {
    width: BUBBLE_SIZE,
    height: BUBBLE_SIZE,
    borderRadius: BUBBLE_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  currentBubble: {},
  lockedBubble: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.08)',
    borderStyle: 'dashed',
  },
  masterBubble: {
    width: BUBBLE_SIZE + 12,
    height: BUBBLE_SIZE + 12,
    borderRadius: (BUBBLE_SIZE + 12) / 2,
    borderWidth: 2,
    borderColor: '#F59E0B',
  },
  masterLockedBubble: {
    backgroundColor: 'rgba(245, 158, 11, 0.08)',
    borderColor: 'rgba(245, 158, 11, 0.25)',
    borderStyle: 'dashed',
  },
  masterIcon: { fontSize: 32 },
  masterLabel: {
    color: '#F59E0B',
    fontWeight: '800',
    fontSize: 12,
  },
  bubbleIcon: { fontSize: 26 },
  bubbleNumber: { color: '#fff', fontWeight: '800', fontSize: 18 },
  checkmark: { color: '#fff', fontSize: 24, fontWeight: '700' },
  lockedNumber: { color: colors.textMuted, fontWeight: '700', fontSize: 16 },
  lessonLabel: { ...typography.caption, color: colors.textSecondary, marginTop: spacing.xs },
  currentLabel: { color: colors.primary, fontWeight: '700' },
  bottomSpacer: { height: 100 },

  // Live with Friends
  liveCard: {
    marginHorizontal: spacing.xl,
    marginBottom: spacing.lg,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.primary + '20',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  liveGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
  },
  liveIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  liveTextContainer: {
    flex: 1,
    marginLeft: spacing.md,
  },
  liveTitle: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '800',
  },
  liveSub: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },

  // Paywall
  paywallContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing['4xl'],
  },
  paywallIcon: {
    width: 88,
    height: 88,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing['2xl'],
    shadowColor: colors.secondary,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  paywallTitle: {
    ...typography.h1,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  paywallSubtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing['3xl'],
  },
  paywallFeatures: {
    alignSelf: 'stretch',
    gap: spacing.md,
    marginBottom: spacing['4xl'],
  },
  paywallFeatureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  paywallFeatureText: {
    ...typography.body,
    color: colors.textPrimary,
  },
  paywallButton: {
    alignSelf: 'stretch',
  },
  paywallButtonGradient: {
    padding: 16,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  paywallButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
