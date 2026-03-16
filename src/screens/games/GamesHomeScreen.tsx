import React, { useEffect, useRef, useState } from 'react';
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
import { supabase } from '../../services/supabase';
import { colors, spacing, typography, borderRadius, glowShadow } from '../../utils/theme';
const SCREEN_WIDTH = Dimensions.get('window').width;
const BUBBLE_SIZE = 64;
const PATH_AMPLITUDE = 50;

const SKILL_LESSONS: Record<string, { title: string; icon: string }[]> = {
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
    { title: 'Master Performance', icon: '🏆' },
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
    { title: 'Master Jam', icon: '🏆' },
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
    { title: 'Master Recital', icon: '🏆' },
  ],
  'Singing': [
    { title: 'Breathing', icon: '🌬️' }, { title: 'Pitch Basics', icon: '🎵' }, { title: 'Vocal Range', icon: '📊' }, { title: 'Warm-Ups', icon: '🔥' }, { title: 'Vowel Shapes', icon: '👄' }, { title: 'Head Voice', icon: '☁️' }, { title: 'Chest Voice', icon: '💪' }, { title: 'Mix Voice', icon: '🔄' }, { title: 'Vibrato', icon: '〰️' }, { title: 'Dynamics', icon: '📢' }, { title: 'Runs & Riffs', icon: '✨' }, { title: 'Harmonizing', icon: '🎶' }, { title: 'Ear Training', icon: '👂' }, { title: 'Pop Style', icon: '🎤' }, { title: 'R&B Style', icon: '💜' }, { title: 'Rock Style', icon: '🤘' }, { title: 'Stage Movement', icon: '💃' }, { title: 'Mic Technique', icon: '🎙️' }, { title: 'Song Interp.', icon: '📖' }, { title: 'Emotion', icon: '😭' }, { title: 'Recording', icon: '🎧' }, { title: 'Duets', icon: '🤝' }, { title: 'Performance', icon: '🎪' }, { title: 'Master Show', icon: '🏆' },
  ],
  'Public Speaking': [
    { title: 'Confidence', icon: '💪' }, { title: 'Eye Contact', icon: '👁️' }, { title: 'Voice Power', icon: '📢' }, { title: 'Body Language', icon: '🧍' }, { title: 'Storytelling', icon: '📖' }, { title: 'Opening Hooks', icon: '🪝' }, { title: 'Structure', icon: '🏗️' }, { title: 'Pausing', icon: '⏸️' }, { title: 'Audience Read', icon: '👥' }, { title: 'Improvisation', icon: '💡' }, { title: 'Humor', icon: '😂' }, { title: 'Persuasion', icon: '🎯' }, { title: 'Data Storytelling', icon: '📊' }, { title: 'Q&A Handling', icon: '❓' }, { title: 'Debate', icon: '⚔️' }, { title: 'Pitch Perfect', icon: '💰' }, { title: 'TED-Style', icon: '🎤' }, { title: 'Panel Talks', icon: '🪑' }, { title: 'Keynote Build', icon: '🖥️' }, { title: 'Crisis Comms', icon: '🚨' }, { title: 'Virtual Talks', icon: '💻' }, { title: 'Workshops', icon: '🧑‍🏫' }, { title: 'Full Speech', icon: '🎪' }, { title: 'Master Orator', icon: '🏆' },
  ],
  'Photography': [
    { title: 'Camera Basics', icon: '📷' }, { title: 'Composition', icon: '🖼️' }, { title: 'Rule of Thirds', icon: '📐' }, { title: 'Natural Light', icon: '☀️' }, { title: 'Focus', icon: '🔍' }, { title: 'Exposure', icon: '💡' }, { title: 'Aperture', icon: '⭕' }, { title: 'Shutter Speed', icon: '⚡' }, { title: 'ISO', icon: '🌙' }, { title: 'Color Theory', icon: '🎨' }, { title: 'Portraits', icon: '🧑' }, { title: 'Landscapes', icon: '🏞️' }, { title: 'Street', icon: '🏙️' }, { title: 'Macro', icon: '🔬' }, { title: 'Golden Hour', icon: '🌅' }, { title: 'Night Photo', icon: '🌃' }, { title: 'Editing Basics', icon: '🖥️' }, { title: 'Color Grading', icon: '🎬' }, { title: 'Black & White', icon: '⬛' }, { title: 'Mobile Photo', icon: '📱' }, { title: 'Storytelling', icon: '📖' }, { title: 'Series Work', icon: '📸' }, { title: 'Portfolio', icon: '🗂️' }, { title: 'Master Shot', icon: '🏆' },
  ],
  'Dance': [
    { title: 'Rhythm Feel', icon: '🎵' }, { title: 'Basic Steps', icon: '👟' }, { title: 'Body Isolation', icon: '🧍' }, { title: 'Footwork', icon: '🦶' }, { title: 'Arm Movement', icon: '💪' }, { title: 'Hip-Hop Basics', icon: '🕺' }, { title: 'Pop & Lock', icon: '🤖' }, { title: 'Wave Motion', icon: '🌊' }, { title: 'Floor Work', icon: '🤸' }, { title: 'Turns & Spins', icon: '🔄' }, { title: 'Partner Basics', icon: '🤝' }, { title: 'Choreography', icon: '📋' }, { title: 'Musicality', icon: '🎶' }, { title: 'Freestyle', icon: '🔥' }, { title: 'Battle Moves', icon: '⚔️' }, { title: 'Latin Basics', icon: '💃' }, { title: 'Contemporary', icon: '🩰' }, { title: 'Street Style', icon: '🏙️' }, { title: 'Stage Presence', icon: '✨' }, { title: 'Transitions', icon: '🔗' }, { title: 'Group Sync', icon: '👥' }, { title: 'Video Dance', icon: '📹' }, { title: 'Full Routine', icon: '🎪' }, { title: 'Master Perf.', icon: '🏆' },
  ],
  'Stand-up Comedy': [
    { title: 'What\'s Funny', icon: '😂' }, { title: 'Joke Structure', icon: '🏗️' }, { title: 'Setup/Punch', icon: '🥊' }, { title: 'Timing', icon: '⏱️' }, { title: 'Personal Stories', icon: '📖' }, { title: 'Crowd Reading', icon: '👥' }, { title: 'Callbacks', icon: '🔄' }, { title: 'Physical Comedy', icon: '🤡' }, { title: 'Misdirection', icon: '👀' }, { title: 'Tags', icon: '🏷️' }, { title: 'Act-Outs', icon: '🎭' }, { title: 'Dark Humor', icon: '🌑' }, { title: 'Wordplay', icon: '📝' }, { title: 'Improv Skills', icon: '💡' }, { title: 'Hecklers', icon: '🗣️' }, { title: '5-Min Set', icon: '⏱️' }, { title: 'Transitions', icon: '🔗' }, { title: 'Opening Strong', icon: '💥' }, { title: 'Closing Strong', icon: '🎆' }, { title: 'Recording Sets', icon: '📹' }, { title: 'Open Mics', icon: '🎤' }, { title: 'Writing Daily', icon: '✍️' }, { title: 'Full 15 Min', icon: '🎪' }, { title: 'Master Comic', icon: '🏆' },
  ],
};

const MORE_SKILL_LESSONS: Record<string, { title: string; icon: string }[]> = {
  'Trading': [
    { title: 'Market Basics', icon: '📊' }, { title: 'Bull vs Bear', icon: '🐂' }, { title: 'Chart Reading', icon: '📈' }, { title: 'Candlesticks', icon: '🕯️' }, { title: 'Support & Resist.', icon: '📏' }, { title: 'Volume Analysis', icon: '📶' }, { title: 'Moving Averages', icon: '〰️' }, { title: 'Risk Management', icon: '🛡️' }, { title: 'Position Sizing', icon: '⚖️' }, { title: 'Stop Losses', icon: '🛑' }, { title: 'Day Trading', icon: '⏱️' }, { title: 'Swing Trading', icon: '🔄' }, { title: 'Trend Following', icon: '📈' }, { title: 'Breakout Trading', icon: '💥' }, { title: 'Trading Psychology', icon: '🧠' }, { title: 'FOMO & Greed', icon: '😰' }, { title: 'Options Basics', icon: '📋' }, { title: 'Calls & Puts', icon: '📞' }, { title: 'Crypto Intro', icon: '₿' }, { title: 'Portfolio Balance', icon: '⚖️' }, { title: 'Backtesting', icon: '🔬' }, { title: 'Trading Plan', icon: '📝' }, { title: 'Live Trading', icon: '🖥️' }, { title: 'Master Trader', icon: '🏆' },
  ],
  'Business': [
    { title: 'Entrepreneur Mind', icon: '🧠' }, { title: 'Finding Ideas', icon: '💡' }, { title: 'Validation', icon: '✅' }, { title: 'Business Model', icon: '📋' }, { title: 'Target Market', icon: '🎯' }, { title: 'MVP Building', icon: '🏗️' }, { title: 'Sales 101', icon: '🤝' }, { title: 'Pitching', icon: '🎤' }, { title: 'Pricing Strategy', icon: '💰' }, { title: 'Branding', icon: '🏷️' }, { title: 'Social Media', icon: '📱' }, { title: 'Customer Service', icon: '💬' }, { title: 'Financial Basics', icon: '📊' }, { title: 'Cash Flow', icon: '💸' }, { title: 'Hiring', icon: '👥' }, { title: 'Leadership', icon: '👑' }, { title: 'Operations', icon: '⚙️' }, { title: 'Partnerships', icon: '🤝' }, { title: 'Funding', icon: '🏦' }, { title: 'Legal Basics', icon: '⚖️' }, { title: 'Scaling Up', icon: '🚀' }, { title: 'Automation', icon: '🤖' }, { title: 'Exit Strategy', icon: '🚪' }, { title: 'Master CEO', icon: '🏆' },
  ],
  'Cooking': [
    { title: 'Kitchen Setup', icon: '🏠' }, { title: 'Knife Skills', icon: '🔪' }, { title: 'Heat Control', icon: '🔥' }, { title: 'Basic Cuts', icon: '🥕' }, { title: 'Seasoning', icon: '🧂' }, { title: 'Sautéing', icon: '🍳' }, { title: 'Boiling & Steam', icon: '♨️' }, { title: 'Roasting', icon: '🍖' }, { title: 'Sauces', icon: '🥫' }, { title: 'Pasta Mastery', icon: '🍝' }, { title: 'Rice & Grains', icon: '🍚' }, { title: 'Salads', icon: '🥗' }, { title: 'Soups', icon: '🍲' }, { title: 'Baking Basics', icon: '🍞' }, { title: 'Desserts', icon: '🍰' }, { title: 'Asian Cuisine', icon: '🥢' }, { title: 'Italian Cuisine', icon: '🇮🇹' }, { title: 'Mexican Cuisine', icon: '🌮' }, { title: 'Plating Art', icon: '🎨' }, { title: 'Meal Prep', icon: '📦' }, { title: 'Menu Planning', icon: '📋' }, { title: 'Food Photo', icon: '📸' }, { title: 'Dinner Party', icon: '🎉' }, { title: 'Master Chef', icon: '🏆' },
  ],
  'Fitness': [
    { title: 'Body Basics', icon: '🏋️' }, { title: 'Warm-Up', icon: '🔥' }, { title: 'Push-Ups', icon: '💪' }, { title: 'Squats', icon: '🦵' }, { title: 'Core Work', icon: '🎯' }, { title: 'Flexibility', icon: '🧘' }, { title: 'Cardio Intro', icon: '❤️' }, { title: 'HIIT Basics', icon: '⚡' }, { title: 'Weight Training', icon: '🏋️' }, { title: 'Deadlifts', icon: '🔨' }, { title: 'Bench Press', icon: '🪑' }, { title: 'Pull-Ups', icon: '🔝' }, { title: 'Nutrition 101', icon: '🥗' }, { title: 'Protein & Macros', icon: '🥩' }, { title: 'Recovery', icon: '😴' }, { title: 'Stretching', icon: '🤸' }, { title: 'Program Design', icon: '📋' }, { title: 'Progressive Load', icon: '📈' }, { title: 'Mobility', icon: '🔄' }, { title: 'Calisthenics', icon: '🤸' }, { title: 'Sport Training', icon: '⚽' }, { title: 'Mental Toughness', icon: '🧠' }, { title: 'Competition', icon: '🥇' }, { title: 'Peak Athlete', icon: '🏆' },
  ],
  'Chess': [
    { title: 'The Board', icon: '♟️' }, { title: 'Piece Moves', icon: '♞' }, { title: 'Check & Mate', icon: '♚' }, { title: 'Piece Values', icon: '⚖️' }, { title: 'Opening Basics', icon: '🚪' }, { title: 'Center Control', icon: '🎯' }, { title: 'Pins & Forks', icon: '📌' }, { title: 'Skewers', icon: '🍢' }, { title: 'Discovered Attacks', icon: '💥' }, { title: 'Castling', icon: '🏰' }, { title: 'Pawn Structure', icon: '🧱' }, { title: 'King Safety', icon: '🛡️' }, { title: 'Middlegame Plans', icon: '📋' }, { title: 'Endgame Basics', icon: '🏁' }, { title: 'King & Pawn', icon: '♔' }, { title: 'Rook Endgames', icon: '♖' }, { title: 'Sacrifices', icon: '⚔️' }, { title: 'Combinations', icon: '💎' }, { title: 'Positional Play', icon: '🧠' }, { title: 'Time Management', icon: '⏱️' }, { title: 'Famous Games', icon: '📖' }, { title: 'Puzzle Solving', icon: '🧩' }, { title: 'Tournament Play', icon: '🏟️' }, { title: 'Grandmaster', icon: '🏆' },
  ],
  'Coding': [
    { title: 'What is Code?', icon: '💻' }, { title: 'Variables', icon: '📦' }, { title: 'Data Types', icon: '🔤' }, { title: 'If/Else', icon: '🔀' }, { title: 'Loops', icon: '🔄' }, { title: 'Functions', icon: '⚙️' }, { title: 'Arrays', icon: '📋' }, { title: 'Objects', icon: '🧊' }, { title: 'String Methods', icon: '✂️' }, { title: 'Error Handling', icon: '🐛' }, { title: 'DOM Basics', icon: '🌐' }, { title: 'Events', icon: '🖱️' }, { title: 'APIs', icon: '🔌' }, { title: 'Async/Await', icon: '⏳' }, { title: 'Git Basics', icon: '🌿' }, { title: 'CSS Layout', icon: '📐' }, { title: 'React Intro', icon: '⚛️' }, { title: 'State', icon: '💾' }, { title: 'Components', icon: '🧩' }, { title: 'Databases', icon: '🗄️' }, { title: 'Auth', icon: '🔐' }, { title: 'Deployment', icon: '🚀' }, { title: 'Full Project', icon: '🏗️' }, { title: 'Master Dev', icon: '🏆' },
  ],
  'Marketing': [
    { title: 'Marketing 101', icon: '📣' }, { title: 'Target Audience', icon: '🎯' }, { title: 'Brand Identity', icon: '🏷️' }, { title: 'Content Types', icon: '📝' }, { title: 'Social Media', icon: '📱' }, { title: 'Instagram', icon: '📸' }, { title: 'TikTok', icon: '🎵' }, { title: 'YouTube', icon: '▶️' }, { title: 'Copywriting', icon: '✍️' }, { title: 'Email Marketing', icon: '📧' }, { title: 'SEO Basics', icon: '🔍' }, { title: 'Keywords', icon: '🔑' }, { title: 'Google Ads', icon: '💰' }, { title: 'Facebook Ads', icon: '📘' }, { title: 'Analytics', icon: '📊' }, { title: 'A/B Testing', icon: '🔬' }, { title: 'Funnels', icon: '🔻' }, { title: 'Landing Pages', icon: '📄' }, { title: 'Influencer Mkt', icon: '⭐' }, { title: 'PR & Media', icon: '📰' }, { title: 'Growth Hacking', icon: '🚀' }, { title: 'Automation', icon: '🤖' }, { title: 'Campaign Launch', icon: '🎯' }, { title: 'CMO Level', icon: '🏆' },
  ],
  'Meditation': [
    { title: 'Why Meditate?', icon: '🧘' }, { title: 'Posture', icon: '🪑' }, { title: 'Breath Focus', icon: '🌬️' }, { title: '5-Min Sit', icon: '⏱️' }, { title: 'Body Scan', icon: '🫧' }, { title: 'Monkey Mind', icon: '🐒' }, { title: 'Counting Breath', icon: '🔢' }, { title: 'Noting', icon: '📝' }, { title: 'Loving Kindness', icon: '❤️' }, { title: 'Walking', icon: '🚶' }, { title: 'Visualization', icon: '🌈' }, { title: 'Mantra', icon: '🕉️' }, { title: 'Stress Relief', icon: '😌' }, { title: 'Sleep', icon: '😴' }, { title: 'Focus', icon: '🎯' }, { title: 'Gratitude', icon: '🙏' }, { title: 'Emotions', icon: '💭' }, { title: 'Pain & Discomfort', icon: '🫂' }, { title: 'Open Awareness', icon: '🌊' }, { title: 'Silent Practice', icon: '🤫' }, { title: 'Daily Habit', icon: '📅' }, { title: 'Retreat Prep', icon: '🏕️' }, { title: 'Deep Practice', icon: '🧘' }, { title: 'Zen Master', icon: '🏆' },
  ],
  'Fashion Design': [
    { title: 'Fashion History', icon: '📜' }, { title: 'Sketching', icon: '✏️' }, { title: 'Color Theory', icon: '🎨' }, { title: 'Fabric Types', icon: '🧵' }, { title: 'Body Proportions', icon: '📐' }, { title: 'Silhouettes', icon: '👗' }, { title: 'Pattern Making', icon: '📋' }, { title: 'Draping', icon: '🪡' }, { title: 'Hand Sewing', icon: '🧵' }, { title: 'Machine Sewing', icon: '🪡' }, { title: 'Zippers & Buttons', icon: '🔘' }, { title: 'Menswear', icon: '👔' }, { title: 'Womenswear', icon: '👗' }, { title: 'Streetwear', icon: '🧢' }, { title: 'Accessories', icon: '👜' }, { title: 'Trend Research', icon: '🔍' }, { title: 'Moodboards', icon: '📌' }, { title: 'Tech Packs', icon: '📦' }, { title: 'Collection Theme', icon: '🎭' }, { title: 'Lookbook', icon: '📸' }, { title: 'Fashion Show', icon: '🎪' }, { title: 'Branding', icon: '🏷️' }, { title: 'Portfolio', icon: '🗂️' }, { title: 'Fashion Icon', icon: '🏆' },
  ],
  'Podcasting': [
    { title: 'Podcast Concept', icon: '💡' }, { title: 'Format Choice', icon: '📋' }, { title: 'Your Niche', icon: '🎯' }, { title: 'Mic Setup', icon: '🎙️' }, { title: 'Recording Space', icon: '🏠' }, { title: 'Software', icon: '💻' }, { title: 'Voice Training', icon: '🗣️' }, { title: 'Interview Skills', icon: '🤝' }, { title: 'Storytelling', icon: '📖' }, { title: 'Audio Editing', icon: '✂️' }, { title: 'Sound Quality', icon: '🔊' }, { title: 'Intro & Outro', icon: '🎵' }, { title: 'Show Notes', icon: '📝' }, { title: 'Cover Art', icon: '🎨' }, { title: 'Distribution', icon: '📡' }, { title: 'Apple & Spotify', icon: '🍎' }, { title: 'Social Clips', icon: '📱' }, { title: 'Guest Booking', icon: '📞' }, { title: 'Audience Build', icon: '📈' }, { title: 'Community', icon: '👥' }, { title: 'Sponsorships', icon: '💰' }, { title: 'Monetization', icon: '💸' }, { title: 'Network', icon: '🌐' }, { title: 'Top Podcaster', icon: '🏆' },
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
  const { xp, dailyXp, dailyXpGoal, level, completedLessons, currentLesson, initialize } =
    useGameStore();
  const profile = useUserStore((s) => s.profile);
  const [skillName, setSkillName] = useState('General');

  const isPremium = profile?.premium_expires_at
    ? new Date(profile.premium_expires_at) > new Date()
    : false;

  if (!isPremium) {
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

  useEffect(() => {
    initialize();
    // Load actual skill name from Supabase
    if (profile?.selected_skill_id) {
      supabase.from('skills').select('name').eq('id', profile.selected_skill_id).single()
        .then(({ data }) => {
          if (data) setSkillName(data.name);
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

  const dailyProgress = Math.min(dailyXp / dailyXpGoal, 1);

  const skillLessons = SKILL_LESSONS[skillName] || DEFAULT_LESSONS;
  const lessons = skillLessons.map((lesson, i) => {
    const num = i + 1;
    const completed = completedLessons.includes(num);
    const isCurrent = num === currentLesson;
    const locked = num > currentLesson;
    return { num, completed, isCurrent, locked, title: lesson.title, icon: lesson.icon };
  });

  const handleLessonPress = (lessonNum: number) => {
    (navigation as any).navigate('GameSession', { lessonNumber: lessonNum, skillName });
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <AmbientGlow color={colors.primary} size={300} opacity={0.06} top={-50} left="50%" />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Games</Text>
          <Text style={styles.subtitle}>{skillName}</Text>
        </View>

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
                {lesson.isCurrent ? (
                  <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                    <LinearGradient
                      colors={[colors.primary, colors.primaryDark]}
                      style={[styles.bubble, styles.currentBubble, glowShadow(colors.primary)]}
                    >
                      <Text style={styles.bubbleIcon}>{lesson.icon}</Text>
                    </LinearGradient>
                  </Animated.View>
                ) : lesson.completed ? (
                  <LinearGradient
                    colors={[colors.success, colors.successDark]}
                    style={[styles.bubble, glowShadow(colors.success)]}
                  >
                    <Text style={styles.bubbleIcon}>{lesson.icon}</Text>
                  </LinearGradient>
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
                  ]}
                  numberOfLines={1}
                >
                  {lesson.title}
                </Text>
              </TouchableOpacity>
            </View>
          );
        })}

        <View style={styles.bottomSpacer} />
      </ScrollView>
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
  pathContent: { alignItems: 'center', paddingTop: spacing.lg },
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
  bubbleIcon: { fontSize: 26 },
  bubbleNumber: { color: '#fff', fontWeight: '800', fontSize: 18 },
  checkmark: { color: '#fff', fontSize: 24, fontWeight: '700' },
  lockedNumber: { color: colors.textMuted, fontWeight: '700', fontSize: 16 },
  lessonLabel: { ...typography.caption, color: colors.textSecondary, marginTop: spacing.xs },
  currentLabel: { color: colors.primary, fontWeight: '700' },
  bottomSpacer: { height: 100 },

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
