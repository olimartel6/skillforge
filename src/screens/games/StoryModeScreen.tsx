import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ScrollView,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, spacing, typography, borderRadius, glowShadow } from '../../utils/theme';
import { useGameStore } from '../../store/gameStore';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ─── Types ────────────────────────────────────────────────────

interface StoryChoice {
  text: string;
  reputationChange: number;
  feedback: string;
  nextPath?: string;
  stateChanges?: Record<string, boolean>;
  condition?: (state: Record<string, boolean>) => boolean;
  isBossDecision?: boolean;
}

interface QuizQuestion {
  prompt: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

interface StoryBeat {
  type: 'narrative' | 'choice' | 'quiz' | 'plotTwist';
  narrator?: string;
  character?: string;
  characterEmoji?: string;
  characterColor?: string;
  text?: string;
  choices?: StoryChoice[];
  quiz?: QuizQuestion;
  isBossDecision?: boolean;
  isPlayerResponse?: boolean;
  condition?: (state: Record<string, boolean>) => boolean;
  plotTwistTitle?: string;
  timerEnabled?: boolean;
}

interface StoryDay {
  day: number;
  title: string;
  beats: StoryBeat[];
}

interface StoryEnding {
  minReputation: number;
  title: string;
  emoji: string;
  text: string;
  badge: string;
}

interface StoryCharacter {
  name: string;
  emoji: string;
  role: string;
  color: string;
}

interface StoryConfig {
  title: string;
  subtitle: string;
  icon: string;
  characters: StoryCharacter[];
  days: StoryDay[];
  endings: StoryEnding[];
}

interface SavedProgress {
  dayIndex: number;
  beatIndex: number;
  reputation: number;
  decisionsLog: { day: number; choice: string; impact: number }[];
  quizCorrect: number;
  quizTotal: number;
  storyState: Record<string, boolean>;
  starRatings: Record<number, number>;
  xpAwarded: Record<number, boolean>;
}

// ─── Character Colors ─────────────────────────────────────────

const CHAR_COLORS = {
  blue: '#4A90D9',
  teal: '#2DD4BF',
  pink: '#F472B6',
  orange: '#FB923C',
  purple: '#A78BFA',
  green: '#4ADE80',
  red: '#F87171',
  gold: '#FBBF24',
  cyan: '#22D3EE',
  lime: '#A3E635',
};

// ─── DECISION TIMER ────────────────────────────────────────────
const DECISION_TIMER_SECONDS = 15;

// ─── Story Data ───────────────────────────────────────────────

const TRADING_STORY: StoryConfig = {
  title: 'Your First Week on Wall Street',
  subtitle: 'Survive 7 days as a junior trader',
  icon: '\uD83D\uDCC8',
  characters: [
    { name: 'Marcus', emoji: '\uD83D\uDC54', role: 'Strict Senior Analyst', color: CHAR_COLORS.blue },
    { name: 'Yuki', emoji: '\uD83D\uDC69\u200D\uD83D\uDCBB', role: 'Helpful Mentor', color: CHAR_COLORS.teal },
    { name: 'Chad', emoji: '\uD83D\uDE0F', role: 'Rival Trader', color: CHAR_COLORS.red },
  ],
  endings: [
    { minReputation: 80, title: 'Wall Street Legend', emoji: '\uD83C\uDFC6', text: 'Marcus shakes your hand. "You remind me of myself at your age. Welcome to the A-team." Yuki smiles. Even Chad nods in respect. You just earned a permanent desk on the trading floor.', badge: 'Wall Street Survivor' },
    { minReputation: 50, title: 'Survived the Week', emoji: '\uD83D\uDCC8', text: 'Marcus gives you a measured look. "Not bad, not great. You\'ve got potential but you need to sharpen up." You get to stay, but you\'re on probation. The learning continues.', badge: 'Trading Rookie' },
    { minReputation: 0, title: 'Cleared Out Your Desk', emoji: '\uD83D\uDCE6', text: 'Marcus doesn\'t even look at you. "Security will escort you out." Chad takes your desk before it\'s even cold. Wall Street chewed you up and spit you out.', badge: '' },
  ],
  days: [
    {
      day: 1,
      title: 'First Day at the Desk',
      beats: [
        { type: 'narrative', character: 'Marcus', characterEmoji: '\uD83D\uDC54', characterColor: CHAR_COLORS.blue, text: '"Welcome to the trading floor. I\'m Marcus, your senior analyst. I don\'t babysit, so pay attention."' },
        { type: 'narrative', text: 'The screens glow with red and green candles. Numbers flash everywhere. Your heart is pounding.' },
        { type: 'narrative', character: 'Yuki', characterEmoji: '\uD83D\uDC69\u200D\uD83D\uDCBB', characterColor: CHAR_COLORS.teal, text: '"Hey, I\'m Yuki. Don\'t let Marcus scare you. Here, I set up your terminal. First things first \u2014 order types."' },
        { type: 'quiz', quiz: { prompt: 'Which order type guarantees execution but NOT price?', options: ['Limit order', 'Market order', 'Stop order', 'Trailing stop'], correctAnswer: 'Market order', explanation: 'A market order executes immediately at the current best price, but you can\'t control the exact price you get.' } },
        { type: 'narrative', character: 'Chad', characterEmoji: '\uD83D\uDE0F', characterColor: CHAR_COLORS.red, text: '"Oh look, fresh meat. How long do you think this one lasts, Yuki? I give it three days."' },
        { type: 'narrative', character: 'Marcus', characterEmoji: '\uD83D\uDC54', characterColor: CHAR_COLORS.blue, text: '"Ignore Chad. Focus. You see that stock dropping? The bid-ask spread is widening. What does that tell you?"' },
        { type: 'choice', text: 'The bid-ask spread is widening on a falling stock. What do you tell Marcus?', timerEnabled: true, choices: [
          { text: '"It means low liquidity \u2014 fewer buyers right now."', reputationChange: 15, feedback: 'Marcus nods approvingly. "This kid knows something." Chad rolls his eyes.', stateChanges: { impressedMarcus: true } },
          { text: '"The stock is about to crash even more!"', reputationChange: -5, feedback: 'Marcus sighs. "That\'s not what spread tells you. Study up tonight." Chad snickers.', stateChanges: { impressedMarcus: false } },
          { text: '"I\'m not sure, can you explain?"', reputationChange: 5, feedback: '"At least you\'re honest. The spread reflects liquidity, remember that." Yuki whispers, "Good call being honest."' },
        ]},
        { type: 'quiz', quiz: { prompt: 'What does a widening bid-ask spread indicate?', options: ['High volume', 'Low liquidity', 'Bullish trend', 'Stock split incoming'], correctAnswer: 'Low liquidity', explanation: 'A wider bid-ask spread means fewer market participants, making it harder to execute trades at desired prices.' } },
      ],
    },
    {
      day: 2,
      title: 'Your First Trade',
      beats: [
        { type: 'narrative', text: 'Morning bell rings. You check your watchlist. One stock catches your eye \u2014 $APEX is down 12% this week.' },
        { type: 'narrative', character: 'Yuki', characterEmoji: '\uD83D\uDC69\u200D\uD83D\uDCBB', characterColor: CHAR_COLORS.teal, text: '"Pull up the RSI on $APEX. See anything interesting?"' },
        { type: 'narrative', text: 'The RSI reads 28. The stock has been beaten down hard.' },
        { type: 'quiz', quiz: { prompt: 'An RSI of 28 indicates the stock is:', options: ['Overbought', 'Oversold', 'Fairly valued', 'In a breakout'], correctAnswer: 'Oversold', explanation: 'RSI below 30 is considered oversold, suggesting the selling may be overdone and a bounce could be near.' } },
        { type: 'narrative', character: 'Marcus', characterEmoji: '\uD83D\uDC54', characterColor: CHAR_COLORS.blue, text: '"Alright, time for your first trade. Make it count."',
          condition: (s) => s.impressedMarcus === true },
        { type: 'narrative', character: 'Marcus', characterEmoji: '\uD83D\uDC54', characterColor: CHAR_COLORS.blue, text: '"Let\'s see if you can actually trade, not just talk."',
          condition: (s) => s.impressedMarcus !== true },
        { type: 'choice', text: 'RSI is 28 on $APEX. Marcus says you can make your first trade. What do you do?', timerEnabled: true, choices: [
          { text: 'Buy $APEX \u2014 oversold means potential bounce', reputationChange: 10, feedback: 'You place the order. Marcus watches. "Bold move, rookie. Let\'s see if it pays off."', stateChanges: { tookRisk: true, boughtApex: true } },
          { text: 'Wait for RSI to cross back above 30 for confirmation', reputationChange: 15, feedback: 'Yuki whispers, "Smart. Patience is the mark of a good trader." Marcus is impressed.', stateChanges: { tookRisk: false, waitedForConfirmation: true } },
          { text: 'Short $APEX \u2014 the trend is down', reputationChange: -10, feedback: '"Shorting at oversold levels? That\'s how you blow up an account." Chad laughs out loud.', stateChanges: { tookRisk: true, shortedApex: true } },
        ]},
        { type: 'narrative', text: 'The rest of the day passes in a blur of charts and numbers. You\'re starting to feel the rhythm of the market.' },
      ],
    },
    {
      day: 3,
      title: 'The Crash',
      beats: [
        { type: 'plotTwist', plotTwistTitle: 'MARKET CRASH', text: 'Futures are deep red. Breaking news: major bank under investigation. The market opens down 3% and keeps falling. Alarms are going off everywhere.' },
        { type: 'narrative', character: 'Chad', characterEmoji: '\uD83D\uDE0F', characterColor: CHAR_COLORS.red, text: '"This is BEAUTIFUL! I shorted everything yesterday. While you were playing it safe, I was getting rich!"' },
        { type: 'narrative', character: 'Marcus', characterEmoji: '\uD83D\uDC54', characterColor: CHAR_COLORS.blue, text: '"This is where traders are made or broken. Your position is down. What\'s the play?"' },
        { type: 'choice', text: 'Your position is down 5% in a market crash. What do you do?', timerEnabled: true, isBossDecision: true, choices: [
          { text: 'Panic sell everything \u2014 cut losses now', reputationChange: -10, feedback: '"Selling at the bottom. Classic rookie mistake." The trading floor laughs. Chad smirks.', stateChanges: { panicSold: true } },
          { text: 'Hold and check your thesis \u2014 nothing has changed fundamentally', reputationChange: 15, feedback: '"Discipline under fire. That\'s what separates pros from amateurs." Marcus gives you a rare smile.', stateChanges: { heldDuringCrash: true } },
          { text: 'Double down \u2014 buy more at the lower price', reputationChange: 5, feedback: '"Averaging down can work, but make sure you have conviction. Risky but brave."', stateChanges: { doubledDown: true } },
        ]},
        { type: 'quiz', quiz: { prompt: 'What is the term for buying more of a losing position?', options: ['Dollar-cost averaging', 'Averaging down', 'Pyramiding', 'Scaling in'], correctAnswer: 'Averaging down', explanation: 'Averaging down means buying more shares at a lower price to reduce your average cost basis. It\'s risky if the stock keeps falling.' } },
        { type: 'narrative', character: 'Yuki', characterEmoji: '\uD83D\uDC69\u200D\uD83D\uDCBB', characterColor: CHAR_COLORS.teal, text: '"Hey, you okay? Days like these are why half the floor is on blood pressure meds. You did fine."',
          condition: (s) => s.heldDuringCrash === true || s.doubledDown === true },
        { type: 'narrative', text: 'By close, the market recovers 2%. Your stomach starts to unclench. Day 3 is in the books.',
          condition: (s) => s.panicSold !== true },
        { type: 'narrative', text: 'By close, the market recovers 2%. You watch from the sidelines, having already sold. A painful lesson.',
          condition: (s) => s.panicSold === true },
      ],
    },
    {
      day: 4,
      title: 'The MACD Test',
      beats: [
        { type: 'narrative', character: 'Marcus', characterEmoji: '\uD83D\uDC54', characterColor: CHAR_COLORS.blue, text: '"Pop quiz, rookie. Pull up the MACD on any stock and explain what you see. The VP is watching."' },
        { type: 'narrative', text: 'You pull up $APEX. The MACD line just crossed above the signal line. The histogram bars are turning green.' },
        { type: 'quiz', quiz: { prompt: 'When the MACD line crosses ABOVE the signal line, it\'s called a:', options: ['Death cross', 'Bullish crossover', 'Bearish divergence', 'Golden ratio'], correctAnswer: 'Bullish crossover', explanation: 'A bullish MACD crossover occurs when the MACD line crosses above the signal line, suggesting upward momentum.' } },
        { type: 'narrative', character: 'Yuki', characterEmoji: '\uD83D\uDC69\u200D\uD83D\uDCBB', characterColor: CHAR_COLORS.teal, text: '"The VP is right behind you. Don\'t panic, just explain what you see clearly."',
          condition: (s) => s.heldDuringCrash === true },
        { type: 'choice', text: 'The VP asks: "Based on this MACD crossover, what would you recommend?"', timerEnabled: true, choices: [
          { text: '"It\'s a buy signal, but I\'d confirm with volume and RSI first."', reputationChange: 20, feedback: 'The VP raises an eyebrow. "Marcus, this kid has potential." Best moment of your career so far.', stateChanges: { impressedVP: true } },
          { text: '"Buy everything immediately!"', reputationChange: -10, feedback: '"One indicator alone is never enough." The VP walks away unimpressed.' },
          { text: '"I need more time to analyze."', reputationChange: 0, feedback: '"Fair enough, but in this business, hesitation costs money."' },
        ]},
        { type: 'narrative', character: 'Chad', characterEmoji: '\uD83D\uDE0F', characterColor: CHAR_COLORS.red, text: '"Don\'t get cocky. One good answer doesn\'t make you a trader."',
          condition: (s) => s.impressedVP === true },
        { type: 'quiz', quiz: { prompt: 'Which indicator measures momentum using two moving averages?', options: ['RSI', 'Bollinger Bands', 'MACD', 'Stochastic'], correctAnswer: 'MACD', explanation: 'MACD (Moving Average Convergence Divergence) uses the difference between 12-period and 26-period EMAs to measure momentum.' } },
      ],
    },
    {
      day: 5,
      title: 'Earnings Season',
      beats: [
        { type: 'narrative', text: '$APEX reports earnings after the bell today. The whole floor is buzzing. This is your chance to prove yourself.' },
        { type: 'narrative', character: 'Yuki', characterEmoji: '\uD83D\uDC69\u200D\uD83D\uDCBB', characterColor: CHAR_COLORS.teal, text: '"Earnings can be brutal. I lost $50K on my first earnings play. Whatever you do, manage your risk."' },
        { type: 'narrative', character: 'Chad', characterEmoji: '\uD83D\uDE0F', characterColor: CHAR_COLORS.red, text: '"I\'m going all in long. Whisper on the Street says they crushed it. You in?"',
          condition: (s) => s.tookRisk === true },
        { type: 'choice', text: 'Big earnings report coming for $APEX. How do you position?', timerEnabled: true, isBossDecision: true, choices: [
          { text: 'Reduce position size \u2014 manage risk before the unknown', reputationChange: 15, feedback: 'Yuki nods. "Risk management first. You\'re learning." Marcus approves quietly.', stateChanges: { managedRisk: true } },
          { text: 'Go all in \u2014 the technicals look bullish', reputationChange: -5, feedback: '"Technicals don\'t predict earnings surprises. You\'re gambling, not trading." Chad high-fives you though.', stateChanges: { wentAllIn: true } },
          { text: 'Hedge with a put option to protect the downside', reputationChange: 20, feedback: '"Now you\'re thinking like a pro. Protect your capital first, always." Marcus is genuinely impressed.', stateChanges: { hedgedPosition: true } },
        ]},
        { type: 'quiz', quiz: { prompt: 'What is implied volatility likely to do before an earnings announcement?', options: ['Decrease', 'Stay the same', 'Increase', 'Become zero'], correctAnswer: 'Increase', explanation: 'Implied volatility rises before earnings due to uncertainty about the outcome, making options more expensive.' } },
        { type: 'narrative', text: 'The earnings come in \u2014 beat by 15%. $APEX jumps 8% after hours. Your positioning paid off.',
          condition: (s) => s.managedRisk === true || s.hedgedPosition === true },
        { type: 'narrative', text: 'The earnings come in \u2014 beat by 15%. $APEX jumps 8% after hours. You got lucky being all in, but Marcus isn\'t happy with the process.',
          condition: (s) => s.wentAllIn === true },
      ],
    },
    {
      day: 6,
      title: 'Take Profit or Let It Ride',
      beats: [
        { type: 'narrative', text: 'Your $APEX position is now up 15%. The P&L screen shows your best week ever. Other traders are starting to notice.' },
        { type: 'narrative', character: 'Chad', characterEmoji: '\uD83D\uDE0F', characterColor: CHAR_COLORS.red, text: '"Nice run, rookie. But I\'m still up 40% this month. Don\'t get cocky."' },
        { type: 'narrative', character: 'Marcus', characterEmoji: '\uD83D\uDC54', characterColor: CHAR_COLORS.blue, text: '"Nice run. But here\'s where most rookies blow it. What\'s your exit strategy?"' },
        { type: 'choice', text: 'Your trade is up 15%. What do you do?', timerEnabled: true, choices: [
          { text: 'Take profit on half, trail a stop on the rest', reputationChange: 20, feedback: '"That\'s the answer I was looking for. Lock in gains but let winners run. You might survive this business."', stateChanges: { smartExit: true } },
          { text: 'Sell everything \u2014 a win is a win', reputationChange: 5, feedback: '"Can\'t go broke taking profits, but you left money on the table. Classic."' },
          { text: 'Hold everything \u2014 it could go higher', reputationChange: -5, feedback: '"Greed kills more traders than bad analysis. Always have an exit plan."', stateChanges: { greedyHold: true } },
        ]},
        { type: 'quiz', quiz: { prompt: 'What is a trailing stop?', options: ['A fixed stop loss', 'A stop that moves up with the price', 'An order to buy at a higher price', 'A market order with delay'], correctAnswer: 'A stop that moves up with the price', explanation: 'A trailing stop automatically adjusts upward as the price rises, locking in profits while giving room for the trade to continue.' } },
        { type: 'narrative', character: 'Yuki', characterEmoji: '\uD83D\uDC69\u200D\uD83D\uDCBB', characterColor: CHAR_COLORS.teal, text: '"Beautiful execution. Marcus doesn\'t compliment often \u2014 you earned that."',
          condition: (s) => s.smartExit === true },
        { type: 'narrative', text: 'You execute your strategy. Half sold at profit. The trailing stop is set. You feel like a real trader.',
          condition: (s) => s.smartExit === true },
        { type: 'narrative', text: 'End of day 6. Tomorrow is the final review. Whatever happens, you learned a lot this week.' },
      ],
    },
    {
      day: 7,
      title: 'Final Review',
      beats: [
        { type: 'narrative', character: 'Marcus', characterEmoji: '\uD83D\uDC54', characterColor: CHAR_COLORS.blue, text: '"Alright rookie, it\'s been a week. Let\'s see what you\'ve actually learned. Final review time."' },
        { type: 'quiz', quiz: { prompt: 'What does RSI measure?', options: ['Volume', 'Price momentum', 'Market cap', 'Dividend yield'], correctAnswer: 'Price momentum', explanation: 'RSI (Relative Strength Index) measures the speed and magnitude of price movements to identify overbought or oversold conditions.' } },
        { type: 'quiz', quiz: { prompt: 'A stop-loss order is used to:', options: ['Guarantee profits', 'Limit potential losses', 'Increase position size', 'Predict market direction'], correctAnswer: 'Limit potential losses', explanation: 'A stop-loss automatically sells your position at a specified price to prevent further losses.' } },
        { type: 'quiz', quiz: { prompt: 'Which candlestick pattern suggests a bullish reversal?', options: ['Shooting star', 'Hammer', 'Doji', 'Hanging man'], correctAnswer: 'Hammer', explanation: 'A hammer has a small body at the top and a long lower wick, suggesting buyers stepped in after a decline.' } },
        { type: 'narrative', character: 'Yuki', characterEmoji: '\uD83D\uDC69\u200D\uD83D\uDCBB', characterColor: CHAR_COLORS.teal, text: '"You\'ve come a long way this week. Whatever Marcus says, know that I\'m impressed."',
          condition: (s) => s.heldDuringCrash === true && s.smartExit === true },
        { type: 'choice', text: 'Marcus asks: "What\'s the most important lesson from this week?"', timerEnabled: true, isBossDecision: true, choices: [
          { text: '"Risk management above everything else."', reputationChange: 20, feedback: '"That\'s the answer that keeps you employed. Welcome to the team \u2014 for real this time." Even Chad gives a slow clap.' },
          { text: '"Trust the technicals."', reputationChange: 5, feedback: '"Technicals are tools, not gospel. But you\'re on the right track."' },
          { text: '"Always go with your gut."', reputationChange: -15, feedback: '"Your gut will bankrupt you. Data and discipline \u2014 that\'s what works."' },
        ]},
        { type: 'narrative', character: 'Marcus', characterEmoji: '\uD83D\uDC54', characterColor: CHAR_COLORS.blue, text: '"Not bad for a rookie. See you Monday."' },
        { type: 'narrative', character: 'Chad', characterEmoji: '\uD83D\uDE0F', characterColor: CHAR_COLORS.red, text: '"See you around... if you survive next week."',
          condition: (s) => s.impressedVP !== true },
        { type: 'narrative', character: 'Chad', characterEmoji: '\uD83D\uDE0F', characterColor: CHAR_COLORS.red, text: '"Alright, I\'ll admit it. Not bad. But next week, the gloves come off."',
          condition: (s) => s.impressedVP === true },
      ],
    },
  ],
};

const SALES_STORY: StoryConfig = {
  title: 'Closing Your First Deal',
  subtitle: 'From cold call to signed contract',
  icon: '\uD83E\uDD1D',
  characters: [
    { name: 'Diana', emoji: '\uD83D\uDC69\u200D\uD83D\uDCBC', role: 'VP of Sales', color: CHAR_COLORS.purple },
    { name: 'Jake', emoji: '\uD83D\uDCDE', role: 'Key Prospect', color: CHAR_COLORS.orange },
    { name: 'Lisa', emoji: '\uD83E\uDDD1\u200D\uD83D\uDCBB', role: 'Sales Support', color: CHAR_COLORS.green },
  ],
  endings: [
    { minReputation: 80, title: 'Deal Closer Extraordinaire', emoji: '\uD83C\uDFC6', text: 'Diana stands up and rings the bell. "Biggest rookie close in company history!" Jake sends a thank-you gift. Lisa whispers, "You\'re getting promoted." This is just the beginning.', badge: 'Deal Closer' },
    { minReputation: 50, title: 'Got the Deal, Barely', emoji: '\uD83E\uDD1D', text: 'The deal closes, but it took longer than it should have. Diana says, "You got there, but clean up the process." A win is a win, but there\'s room for growth.', badge: 'Sales Survivor' },
    { minReputation: 0, title: 'Lost the Deal', emoji: '\uD83D\uDCE9', text: 'Jake goes with the competitor. Diana calls you into her office. "This isn\'t working out." Your desk is cleared by Friday. Cold calls haunt your dreams.', badge: '' },
  ],
  days: [
    {
      day: 1,
      title: 'First Cold Call',
      beats: [
        { type: 'narrative', text: 'New job. New desk. A phone and a list of 200 names. Diana, the VP of Sales, drops by.' },
        { type: 'narrative', character: 'Diana', characterEmoji: '\uD83D\uDC69\u200D\uD83D\uDCBC', characterColor: CHAR_COLORS.purple, text: '"Your target is 50 dials today. Quality over quantity, but you still need volume. Good luck."' },
        { type: 'narrative', character: 'Lisa', characterEmoji: '\uD83E\uDDD1\u200D\uD83D\uDCBB', characterColor: CHAR_COLORS.green, text: '"Hey, I\'m Lisa from sales support. I pulled some intel on your top 10 prospects. Check your email."' },
        { type: 'choice', text: 'Your first cold call. The prospect picks up. What\'s your opener?', timerEnabled: true, choices: [
          { text: '"Hi, I\'m calling from XCorp. We sell marketing automation\u2014"', reputationChange: -10, feedback: '"I\'m not interested." Click. That\'s what happens when you lead with your product.', stateChanges: { badOpener: true } },
          { text: '"Hi [Name], I noticed your company just raised Series A. Congrats! Quick question about your growth plans\u2014"', reputationChange: 20, feedback: 'The prospect pauses. "How do you know about that?" You\'ve got their attention.', stateChanges: { greatOpener: true } },
          { text: '"Do you have 5 minutes to discuss how we can save you money?"', reputationChange: -5, feedback: '"No." Nobody has 5 minutes for a stranger. Reframe next time.' },
        ]},
        { type: 'quiz', quiz: { prompt: 'The most effective cold call openers focus on:', options: ['Your product features', 'The prospect\'s situation', 'Discounts and offers', 'Company history'], correctAnswer: 'The prospect\'s situation', explanation: 'Personalized openers that reference the prospect\'s context get 2-3x more engagement than generic pitches.' } },
        { type: 'narrative', text: 'By end of day, you made 47 dials, had 8 conversations, and booked 2 discovery meetings. Not bad for day one.' },
      ],
    },
    {
      day: 2,
      title: 'Discovery Meeting',
      beats: [
        { type: 'narrative', text: 'Your first real meeting. Jake, VP of Marketing at a mid-size SaaS company. He gave you 30 minutes.' },
        { type: 'narrative', character: 'Jake', characterEmoji: '\uD83D\uDCDE', characterColor: CHAR_COLORS.orange, text: '"So, tell me what you guys do."' },
        { type: 'choice', text: 'Jake asks what you do. How do you handle the discovery meeting?', timerEnabled: true, choices: [
          { text: 'Launch into a 10-minute product demo', reputationChange: -10, feedback: 'Jake checks his phone. You lost him in 2 minutes. Discovery is about ASKING, not telling.', stateChanges: { badDiscovery: true } },
          { text: '"Before I answer that \u2014 what\'s your biggest challenge with lead generation right now?"', reputationChange: 20, feedback: 'Jake opens up about his pain points. Gold. This is what discovery is about.', stateChanges: { greatDiscovery: true, builtTrustWithJake: true } },
          { text: '"We\'re the #1 rated solution on G2. Here\'s our case studies..."', reputationChange: 0, feedback: 'He\'s polite but not engaged. Social proof works, but timing matters.' },
        ]},
        { type: 'quiz', quiz: { prompt: 'In sales, "BANT" stands for:', options: ['Budget, Authority, Need, Timeline', 'Business, Account, Negotiation, Target', 'Buy, Assess, Negotiate, Trade', 'Brand, Audience, Niche, Tactic'], correctAnswer: 'Budget, Authority, Need, Timeline', explanation: 'BANT is a sales qualification framework to determine if a prospect has the Budget, Authority, Need, and Timeline to buy.' } },
        { type: 'narrative', character: 'Lisa', characterEmoji: '\uD83E\uDDD1\u200D\uD83D\uDCBB', characterColor: CHAR_COLORS.green, text: '"Great meeting notes! I found some mutual connections with Jake. Want me to set up a warm intro to his CEO?"',
          condition: (s) => s.builtTrustWithJake === true },
        { type: 'narrative', text: 'Great discovery call. Jake has budget, authority, clear need, and wants to implement Q2. He agrees to a demo next week.' },
      ],
    },
    {
      day: 3,
      title: 'The Objection',
      beats: [
        { type: 'narrative', text: 'Demo went great. Jake loved it. Then he drops the bomb over email.' },
        { type: 'narrative', character: 'Jake', characterEmoji: '\uD83D\uDCDE', characterColor: CHAR_COLORS.orange, text: '"Hi, thanks for the demo. It looks great but honestly, it\'s outside our budget right now. Maybe next quarter?"' },
        { type: 'choice', text: 'Jake says "too expensive." How do you handle it?', timerEnabled: true, isBossDecision: true, choices: [
          { text: '"I understand. What if I offer 20% off?"', reputationChange: -10, feedback: 'Discounting immediately devalues your product and your credibility. Jake will always expect discounts.', stateChanges: { discounted: true } },
          { text: '"Help me understand \u2014 is it the total cost, or the cost relative to what you\'d expect to gain?"', reputationChange: 20, feedback: 'Perfect reframe. Jake admits the ROI math actually works. The issue was sticker shock, not real budget constraints.', stateChanges: { handledObjection: true } },
          { text: '"No worries, let me know when budget opens up."', reputationChange: -5, feedback: 'You just gave up. "Next quarter" means never. Always dig deeper.' },
        ]},
        { type: 'quiz', quiz: { prompt: 'When a prospect says "too expensive," the best first response is:', options: ['Offer a discount', 'Ask what they\'re comparing it to', 'Send more case studies', 'Call back next quarter'], correctAnswer: 'Ask what they\'re comparing it to', explanation: 'Understanding the frame of reference helps you position value correctly. Price is relative.' } },
      ],
    },
    {
      day: 4,
      title: 'Competitive Threat',
      beats: [
        { type: 'plotTwist', plotTwistTitle: 'COMPETITOR ALERT', text: 'CompetitorX just swooped in and gave Jake a full demo. They\'re 30% cheaper and promising the moon. Your deal is in danger.' },
        { type: 'narrative', character: 'Diana', characterEmoji: '\uD83D\uDC69\u200D\uD83D\uDCBC', characterColor: CHAR_COLORS.purple, text: '"Bad news. CompetitorX just gave Jake a demo. They\'re cheaper. What\'s your move?"' },
        { type: 'choice', text: 'A competitor is now in the deal. How do you differentiate?', timerEnabled: true, choices: [
          { text: 'Trash-talk the competitor \u2014 point out their flaws', reputationChange: -15, feedback: '"Never badmouth competition. It makes YOU look bad." Diana shakes her head.' },
          { text: 'Focus on unique value \u2014 what you do that they literally can\'t', reputationChange: 20, feedback: 'You send Jake a custom comparison showing your unique integrations. He forwards it to his CEO.', stateChanges: { wonCompetition: true } },
          { text: 'Match their price to take price off the table', reputationChange: -5, feedback: '"If you compete on price, you\'ll always lose to someone cheaper." Differentiate on value.' },
        ]},
        { type: 'quiz', quiz: { prompt: 'The best way to handle competition in a deal is to:', options: ['Lower your price', 'Badmouth them', 'Highlight your unique differentiators', 'Ignore them'], correctAnswer: 'Highlight your unique differentiators', explanation: 'Competing on value and unique capabilities is more sustainable than price wars or negative selling.' } },
        { type: 'narrative', character: 'Jake', characterEmoji: '\uD83D\uDCDE', characterColor: CHAR_COLORS.orange, text: '"Your integration with our CRM is a game changer. The other vendor can\'t do that."',
          condition: (s) => s.wonCompetition === true },
        { type: 'narrative', character: 'Lisa', characterEmoji: '\uD83E\uDDD1\u200D\uD83D\uDCBB', characterColor: CHAR_COLORS.green, text: '"I found a case study from a company just like Jake\'s. Sending it to you now."' },
      ],
    },
    {
      day: 5,
      title: 'Demo Day',
      beats: [
        { type: 'narrative', text: 'Jake brings his CEO, CFO, and Head of Ops to the final demo. This is the big stage.' },
        { type: 'narrative', character: 'Diana', characterEmoji: '\uD83D\uDC69\u200D\uD83D\uDCBC', characterColor: CHAR_COLORS.purple, text: '"The CEO is in the room. Don\'t blow this. Focus on business outcomes, not features."' },
        { type: 'choice', text: 'The CEO is in the room. What do you highlight in the demo?', timerEnabled: true, isBossDecision: true, choices: [
          { text: 'Every single feature \u2014 show them everything', reputationChange: -10, feedback: 'Death by demo. The CEO checked out after 10 minutes. Less is more.' },
          { text: 'Only the 3 features that solve their specific pain points', reputationChange: 20, feedback: 'The CEO leans forward. "This is exactly what we need." Boom.', stateChanges: { nailedDemo: true } },
          { text: 'Focus on the technical architecture and security', reputationChange: 0, feedback: 'The ops person loved it, but the CEO wanted business outcomes, not tech specs.' },
        ]},
        { type: 'quiz', quiz: { prompt: 'An effective demo should primarily focus on:', options: ['All product features', 'Technical specifications', 'Solving the prospect\'s specific problems', 'Competitor comparisons'], correctAnswer: 'Solving the prospect\'s specific problems', explanation: 'The best demos are tailored to the prospect\'s pain points, showing exactly how your solution fixes their problems.' } },
        { type: 'narrative', text: 'The CEO shakes your hand. "Send over the contract." Your heart skips a beat.',
          condition: (s) => s.nailedDemo === true },
        { type: 'narrative', text: 'The CEO nods. "Let me think about it." Not a yes, not a no. You need to follow up.',
          condition: (s) => s.nailedDemo !== true },
      ],
    },
    {
      day: 6,
      title: 'Contract Negotiation',
      beats: [
        { type: 'narrative', text: 'The contract is out. Jake\'s legal team has "a few changes." Your phone rings.' },
        { type: 'narrative', character: 'Jake', characterEmoji: '\uD83D\uDCDE', characterColor: CHAR_COLORS.orange, text: '"We need the payment terms changed to Net 90, and we want the ability to cancel with 30 days notice."' },
        { type: 'choice', text: 'Tough contract terms requested. How do you negotiate?', timerEnabled: true, choices: [
          { text: 'Accept everything \u2014 just get the deal closed', reputationChange: -10, feedback: '"You just gave away all our leverage for every future deal with this client." Diana is frustrated.' },
          { text: '"I can do Net 60 if we lock in an annual commitment instead of 30-day cancel."', reputationChange: 20, feedback: 'Win-win negotiation. Jake agrees. Diana is impressed by the creative solution.', stateChanges: { goodNegotiation: true } },
          { text: '"Our terms are non-negotiable."', reputationChange: -5, feedback: 'Jake goes quiet. You almost lost the deal with rigidity. Always find middle ground.' },
        ]},
        { type: 'quiz', quiz: { prompt: 'The best negotiation strategy is:', options: ['Win at all costs', 'Give in to everything', 'Find win-win solutions', 'Avoid negotiation entirely'], correctAnswer: 'Find win-win solutions', explanation: 'Win-win negotiations build long-term relationships and lead to better outcomes for both parties.' } },
      ],
    },
    {
      day: 7,
      title: 'The Close',
      beats: [
        { type: 'narrative', text: 'Final day. The contract has been revised. Jake is on the phone.' },
        { type: 'narrative', character: 'Jake', characterEmoji: '\uD83D\uDCDE', characterColor: CHAR_COLORS.orange, text: '"Everything looks good. I just need to run it by the CEO one more time. I\'ll call you back."' },
        { type: 'quiz', quiz: { prompt: 'When a prospect says "I need to think about it," you should:', options: ['Say "take your time"', 'Ask what specific concerns they have', 'Offer a bigger discount', 'Send more marketing materials'], correctAnswer: 'Ask what specific concerns they have', explanation: '"I need to think about it" often means there\'s an unresolved concern. Asking directly helps surface and address it.' } },
        { type: 'choice', text: 'Jake needs "one more approval." How do you move this forward?', timerEnabled: true, isBossDecision: true, choices: [
          { text: '"Take your time, no rush."', reputationChange: -10, feedback: 'Two weeks later, the deal goes cold. Urgency matters.' },
          { text: '"Would it help if I joined a quick call with the CEO to answer any questions?"', reputationChange: 20, feedback: 'You\'re on a call with the CEO 30 minutes later. Deal signed by end of day.', stateChanges: { closedDeal: true } },
          { text: '"Our pricing goes up next month, just FYI."', reputationChange: 0, feedback: 'Artificial urgency is transparent. It works sometimes but damages trust.' },
        ]},
        { type: 'narrative', text: 'Your phone buzzes. Email from Jake: "Contract signed! Welcome aboard." You just closed your first deal.',
          condition: (s) => s.closedDeal === true },
        { type: 'narrative', text: 'After a nerve-wracking wait, Jake finally emails: "We\'re in." It wasn\'t pretty, but you got there.',
          condition: (s) => s.closedDeal !== true },
        { type: 'narrative', character: 'Diana', characterEmoji: '\uD83D\uDC69\u200D\uD83D\uDCBC', characterColor: CHAR_COLORS.purple, text: '"Ring the bell! We got a closer!"' },
      ],
    },
  ],
};

const AGENCY_STORY: StoryConfig = {
  title: 'Building Your Agency',
  subtitle: 'From zero to your first client',
  icon: '\uD83C\uDFE2',
  characters: [
    { name: 'Victor', emoji: '\uD83D\uDC68\u200D\uD83C\uDF73', role: 'First Client', color: CHAR_COLORS.orange },
    { name: 'Mia', emoji: '\uD83D\uDC69\u200D\uD83D\uDCBC', role: 'Business Partner', color: CHAR_COLORS.pink },
    { name: 'Alex', emoji: '\uD83D\uDE08', role: 'Competitor', color: CHAR_COLORS.red },
  ],
  endings: [
    { minReputation: 80, title: 'Agency Empire', emoji: '\uD83C\uDFC6', text: 'Mia high-fives you. "We did it." Victor refers 5 more businesses. Alex is watching nervously. Your agency is booked for the next 3 months. This is just the beginning of something massive.', badge: 'Agency Founder' },
    { minReputation: 50, title: 'Scrappy Startup', emoji: '\uD83C\uDFE2', text: 'You\'ve got 2 clients and a lot of lessons learned. Mia says, "We\'re not there yet, but we\'re on the right track." The grind continues, but you\'re surviving.', badge: 'Agency Hustler' },
    { minReputation: 0, title: 'Back to the 9-to-5', emoji: '\uD83D\uDCBC', text: 'Victor fires you. Mia ghosts you. Alex poaches your leads. You\'re back on LinkedIn updating your resume. The agency dream dies... for now.', badge: '' },
  ],
  days: [
    {
      day: 1,
      title: 'The Leap',
      beats: [
        { type: 'narrative', text: 'You just quit your 9-to-5. No more boss. No more salary. Just you, your laptop, and a dream.' },
        { type: 'narrative', character: 'Mia', characterEmoji: '\uD83D\uDC69\u200D\uD83D\uDCBC', characterColor: CHAR_COLORS.pink, text: '"Hey! I heard you\'re starting an agency. I\'ve been thinking about the same thing. Want to team up?"' },
        { type: 'narrative', text: 'First decision: what kind of agency are you building?' },
        { type: 'choice', text: 'Pick your agency niche:', timerEnabled: true, choices: [
          { text: 'Full-service digital marketing \u2014 do everything for everyone', reputationChange: -10, feedback: 'Jack of all trades, master of none. Clients don\'t trust generalists with their budget. Mia looks concerned.', stateChanges: { noNiche: true } },
          { text: 'Facebook Ads for local businesses \u2014 specific and proven', reputationChange: 20, feedback: 'Smart. Specific niche, clear deliverable, easy to pitch. Mia is excited. "This is how agencies scale."', stateChanges: { fbAdsNiche: true } },
          { text: 'SEO and content \u2014 long-term play', reputationChange: 10, feedback: 'Solid choice. Longer sales cycle but recurring revenue. Mia nods. "You\'ll need patience."', stateChanges: { seoNiche: true } },
        ]},
        { type: 'quiz', quiz: { prompt: 'Why is niching down important for a new agency?', options: ['Less work to do', 'Easier to become the expert', 'Cheaper to start', 'You can charge less'], correctAnswer: 'Easier to become the expert', explanation: 'Specializing lets you develop deep expertise, create better case studies, and command higher prices in your niche.' } },
        { type: 'narrative', text: 'Day 1 is done. You\'ve got a niche, a Notion workspace, and a fire in your belly. Tomorrow, you hunt.' },
      ],
    },
    {
      day: 2,
      title: 'Cold Email Blast',
      beats: [
        { type: 'narrative', text: 'Time to find clients. You build a list of 100 local businesses. Now you need to write the cold email.' },
        { type: 'narrative', character: 'Mia', characterEmoji: '\uD83D\uDC69\u200D\uD83D\uDCBC', characterColor: CHAR_COLORS.pink, text: '"I\'ve been testing email templates. Personalization is everything. Let me help with the outreach."' },
        { type: 'choice', text: 'What\'s your cold email approach?', timerEnabled: true, isBossDecision: true, choices: [
          { text: 'Long email explaining all your services and pricing', reputationChange: -10, feedback: 'Nobody reads long emails from strangers. 3 lines max. You get zero replies.' },
          { text: '"I noticed [specific issue]. Here\'s a free 2-min video audit of your ads."', reputationChange: 20, feedback: '12 replies in 24 hours. Mia cheers. Personalization + free value = meetings booked.', stateChanges: { greatOutreach: true } },
          { text: '"We help businesses grow. Want to chat?"', reputationChange: -5, feedback: 'Too vague. Nobody knows what you actually do. 1 reply: "No thanks."' },
        ]},
        { type: 'quiz', quiz: { prompt: 'The ideal cold email length is:', options: ['500+ words', '50-125 words', 'One word: "Interested?"', '250-400 words'], correctAnswer: '50-125 words', explanation: 'Short, personalized emails with a clear value prop and CTA get the highest response rates.' } },
        { type: 'narrative', character: 'Alex', characterEmoji: '\uD83D\uDE08', characterColor: CHAR_COLORS.red, text: '"Interesting... I see you\'re targeting the same businesses I am. May the best agency win."',
          condition: (s) => s.greatOutreach === true },
        { type: 'narrative', text: 'You sent 30 personalized emails with video audits. It took all day but the responses are rolling in.' },
      ],
    },
    {
      day: 3,
      title: 'First Prospect Call',
      beats: [
        { type: 'narrative', text: 'A restaurant owner named Victor is on the line. He watched your video audit and wants to talk.' },
        { type: 'narrative', character: 'Victor', characterEmoji: '\uD83D\uDC68\u200D\uD83C\uDF73', characterColor: CHAR_COLORS.orange, text: '"I liked the video. But I\'ve been burned by marketing agencies before. Why should I trust you?"' },
        { type: 'choice', text: 'Victor is skeptical about agencies. How do you pitch?', timerEnabled: true, choices: [
          { text: '"I guarantee results or your money back!"', reputationChange: -10, feedback: 'Guarantees you can\'t keep will destroy your reputation. Victor smells the BS.' },
          { text: '"I understand. Let me do a 2-week pilot at half price. If you don\'t see results, walk away."', reputationChange: 20, feedback: 'Low risk for Victor, foot in the door for you. "Deal," he says. You\'re in business.', stateChanges: { wonVictor: true, pilotDeal: true } },
          { text: '"I\'m the best in the game, trust me."', reputationChange: -5, feedback: 'All talk, no proof. Victor thanks you for your time and hangs up.' },
        ]},
        { type: 'quiz', quiz: { prompt: 'The best way to overcome trust objections with a new agency is:', options: ['Guarantees', 'Low-risk trial offers', 'Name-dropping', 'Lowering prices'], correctAnswer: 'Low-risk trial offers', explanation: 'Pilot projects reduce perceived risk, let you prove your value, and naturally lead to full engagements.' } },
      ],
    },
    {
      day: 4,
      title: 'First Client Onboarding',
      beats: [
        { type: 'narrative', text: 'Victor signed! $1,500/month pilot for Facebook Ads. Time to onboard him properly.' },
        { type: 'narrative', character: 'Victor', characterEmoji: '\uD83D\uDC68\u200D\uD83C\uDF73', characterColor: CHAR_COLORS.orange, text: '"So what do you need from me to get started?"' },
        { type: 'narrative', character: 'Mia', characterEmoji: '\uD83D\uDC69\u200D\uD83D\uDCBC', characterColor: CHAR_COLORS.pink, text: '"I built an onboarding template. Want to use it?"',
          condition: (s) => s.fbAdsNiche === true },
        { type: 'choice', text: 'How do you onboard your first client?', timerEnabled: true, choices: [
          { text: 'Just ask for their Facebook login and start running ads', reputationChange: -10, feedback: 'No strategy, no goals, no tracking. You\'re flying blind and Victor will notice.' },
          { text: 'Send a professional onboarding form: goals, budget, target audience, brand assets, access credentials', reputationChange: 20, feedback: 'Victor is impressed. "This is more organized than the last 2 agencies I worked with." Great start.', stateChanges: { proOnboarding: true } },
          { text: '"I\'ll figure it out as we go. Don\'t worry about anything."', reputationChange: -5, feedback: 'No process = no results. Clients need to see structure and professionalism.' },
        ]},
        { type: 'quiz', quiz: { prompt: 'What should you set up BEFORE running any ads for a client?', options: ['Social media posts', 'Conversion tracking (Pixel/API)', 'A fancy logo', 'More ad accounts'], correctAnswer: 'Conversion tracking (Pixel/API)', explanation: 'Without proper conversion tracking, you can\'t measure results, optimize campaigns, or prove ROI to your client.' } },
        { type: 'narrative', text: 'Pixel installed. Audiences built. Creative brief done. Tomorrow you launch the first campaign.' },
      ],
    },
    {
      day: 5,
      title: 'Launching the Campaign',
      beats: [
        { type: 'narrative', text: 'Campaign day. You have $500 to spend this month on Victor\'s ads. Every dollar counts.' },
        { type: 'plotTwist', plotTwistTitle: 'COMPETITOR SABOTAGE', text: 'Alex just posted a public review trashing your agency. "Amateurs who don\'t know what they\'re doing." Victor sees it and calls you panicking.',
          condition: (s) => s.greatOutreach === true },
        { type: 'choice', text: 'How do you structure Victor\'s first Facebook Ads campaign?', timerEnabled: true, isBossDecision: true, choices: [
          { text: 'One ad, one audience, full budget \u2014 keep it simple', reputationChange: -5, feedback: 'You\'re betting everything on one horse. When it doesn\'t work, there\'s no Plan B.' },
          { text: '3 audiences, 3 ad variations each \u2014 test and iterate', reputationChange: 20, feedback: 'Smart testing structure. By day 3, you\'ve found a winning combo. CPA is dropping fast.', stateChanges: { smartCampaign: true } },
          { text: 'Boost Victor\'s existing posts \u2014 easy and fast', reputationChange: -10, feedback: 'Boosting is wasting money. No targeting, no optimization, no results. Victor will be disappointed.' },
        ]},
        { type: 'quiz', quiz: { prompt: 'In Facebook Ads, CPA stands for:', options: ['Clicks Per Ad', 'Cost Per Acquisition', 'Customer Profile Analysis', 'Campaign Performance Average'], correctAnswer: 'Cost Per Acquisition', explanation: 'CPA measures how much it costs to acquire one customer or conversion, a key metric for ad performance.' } },
        { type: 'narrative', character: 'Victor', characterEmoji: '\uD83D\uDC68\u200D\uD83C\uDF73', characterColor: CHAR_COLORS.orange, text: '"I just got 3 reservations from the ad! This is working!"',
          condition: (s) => s.smartCampaign === true },
      ],
    },
    {
      day: 6,
      title: 'The Unhappy Client',
      beats: [
        { type: 'narrative', text: 'Week 2. The initial excitement has worn off. Victor calls sounding frustrated.' },
        { type: 'narrative', character: 'Victor', characterEmoji: '\uD83D\uDC68\u200D\uD83C\uDF73', characterColor: CHAR_COLORS.orange, text: '"I\'m not seeing enough results. I expected more bookings by now. What\'s going on?"' },
        { type: 'narrative', character: 'Mia', characterEmoji: '\uD83D\uDC69\u200D\uD83D\uDCBC', characterColor: CHAR_COLORS.pink, text: '"I pulled the dashboard. We actually have good numbers \u2014 show him the data."',
          condition: (s) => s.smartCampaign === true },
        { type: 'choice', text: 'Client is unhappy with early results. How do you handle it?', timerEnabled: true, choices: [
          { text: '"It\'s only been 2 weeks, you need to be patient."', reputationChange: -10, feedback: '"Patient? I\'m paying you $1,500!" Never dismiss a client\'s concerns.' },
          { text: 'Show him the data: impressions, clicks, leads, cost per lead \u2014 and the optimization plan for next week', reputationChange: 20, feedback: 'Victor calms down when he sees the data. "Ok, I see the progress. Keep going."', stateChanges: { savedClient: true } },
          { text: '"I\'ll double the ad spend to get more results."', reputationChange: -5, feedback: 'Throwing money at the problem without optimization is a losing strategy.' },
        ]},
        { type: 'quiz', quiz: { prompt: 'When a client is unhappy with ad performance, the FIRST thing to do is:', options: ['Increase budget', 'Show data and explain the optimization process', 'Offer a refund', 'Blame the algorithm'], correctAnswer: 'Show data and explain the optimization process', explanation: 'Transparency and education build trust. Show clients the metrics, explain what\'s working, and outline the optimization plan.' } },
      ],
    },
    {
      day: 7,
      title: 'Report Day',
      beats: [
        { type: 'narrative', text: 'End of the pilot. Time to present results to Victor and pitch the full engagement.' },
        { type: 'narrative', text: 'Your numbers: 47 leads, 12 reservations, $31 cost per lead. Not bad for a $500 ad spend.' },
        { type: 'quiz', quiz: { prompt: 'What\'s the most important metric to show a local business client?', options: ['Impressions', 'Click-through rate', 'Cost per lead/acquisition', 'Reach'], correctAnswer: 'Cost per lead/acquisition', explanation: 'Local businesses care about one thing: how much it costs to get a customer. CPA is the metric that matters.' } },
        { type: 'choice', text: 'Results are solid. How do you pitch the full engagement to Victor?', timerEnabled: true, isBossDecision: true, choices: [
          { text: '"Same thing but for $3,000/month."', reputationChange: -5, feedback: 'Doubling the price with no new value? Victor hesitates.' },
          { text: '"Here\'s what we learned. At full budget, I project 100+ leads/month. Plus, I\'ll add Google Ads and retargeting."', reputationChange: 20, feedback: 'Victor sees the growth potential. "Let\'s do it. And my friend owns a gym \u2014 can you help him too?"', stateChanges: { grewAgency: true } },
          { text: '"I hope you\'ll continue. Let me know!"', reputationChange: -10, feedback: 'Hope is not a strategy. You left without asking for the business. Victor goes quiet.' },
        ]},
        { type: 'narrative', text: 'Victor signs the full contract. And his friend calls you that afternoon. Day 7 ends with 2 clients.',
          condition: (s) => s.grewAgency === true },
        { type: 'narrative', text: 'Victor says he\'ll think about it. You leave feeling uncertain. The agency dream hangs in the balance.',
          condition: (s) => s.grewAgency !== true },
        { type: 'narrative', character: 'Mia', characterEmoji: '\uD83D\uDC69\u200D\uD83D\uDCBC', characterColor: CHAR_COLORS.pink, text: '"We did it! Our agency is officially real. The grind continues \u2014 but now, with momentum."',
          condition: (s) => s.grewAgency === true },
      ],
    },
  ],
};

// ─── NEW STORIES ──────────────────────────────────────────────

const NEGOTIATION_STORY: StoryConfig = {
  title: 'The Art of the Deal',
  subtitle: 'Master the art of negotiation in 7 days',
  icon: '\uD83E\uDD1C',
  characters: [
    { name: 'Helen', emoji: '\uD83D\uDC69\u200D\u2696\uFE0F', role: 'Negotiation Coach', color: CHAR_COLORS.purple },
    { name: 'Raj', emoji: '\uD83D\uDC68\u200D\uD83D\uDCBC', role: 'Vendor / Counterpart', color: CHAR_COLORS.orange },
    { name: 'Sgt. Cole', emoji: '\uD83D\uDE93', role: 'Crisis Negotiator', color: CHAR_COLORS.blue },
  ],
  endings: [
    { minReputation: 80, title: 'Master Negotiator', emoji: '\uD83C\uDFC6', text: 'Helen shakes your hand. "I\'ve trained hundreds of people. You\'re in the top 1%." Raj calls you for advice now. Even Sgt. Cole says, "You\'d make a great field negotiator."', badge: 'Master Negotiator' },
    { minReputation: 50, title: 'Decent Dealmaker', emoji: '\uD83E\uDD1D', text: 'You won some, you lost some. Helen says, "You\'ve got the basics down, but you need more practice under pressure." The journey continues.', badge: 'Dealmaker' },
    { minReputation: 0, title: 'Walked Away Empty', emoji: '\uD83D\uDEAA', text: 'Every deal fell apart. Helen sighs, "Some people just aren\'t cut out for this." Raj won\'t return your calls. You need to go back to basics.', badge: '' },
  ],
  days: [
    {
      day: 1,
      title: 'Salary Negotiation',
      beats: [
        { type: 'narrative', text: 'You just got a job offer. The salary is $75,000 but you know the market rate is $90,000. Time to negotiate.' },
        { type: 'narrative', character: 'Helen', characterEmoji: '\uD83D\uDC69\u200D\u2696\uFE0F', characterColor: CHAR_COLORS.purple, text: '"Rule #1 of negotiation: never accept the first offer. They expect you to counter."' },
        { type: 'quiz', quiz: { prompt: 'In salary negotiation, who should state the first number?', options: ['Always the employer', 'Always the candidate', 'Whoever has more information', 'It doesn\'t matter'], correctAnswer: 'Whoever has more information', explanation: 'The party with better market data should anchor the negotiation. If you know the range, anchor high.' } },
        { type: 'choice', text: 'The HR manager asks, "What salary are you looking for?"', timerEnabled: true, choices: [
          { text: '"I was thinking around $95,000 based on my research of market rates."', reputationChange: 20, feedback: 'Helen nods. "Strong anchor with data backing. They\'ll counter at $85K and you\'ll land at $90K."', stateChanges: { strongAnchor: true } },
          { text: '"$75,000 is fine, I\'m just happy to have the job."', reputationChange: -10, feedback: 'Helen winces. "You just left $15,000 on the table. NEVER accept the first offer."', stateChanges: { acceptedFirst: true } },
          { text: '"What\'s the budget for this role?"', reputationChange: 10, feedback: '"Deflecting is safe but you lost the chance to anchor. They say $75-85K. You could\'ve aimed higher."' },
        ]},
        { type: 'narrative', character: 'Helen', characterEmoji: '\uD83D\uDC69\u200D\u2696\uFE0F', characterColor: CHAR_COLORS.purple, text: '"Remember: negotiation is not about winning. It\'s about finding the zone where both sides say yes."' },
      ],
    },
    {
      day: 2,
      title: 'Vendor Showdown',
      beats: [
        { type: 'narrative', text: 'Your company needs a new software vendor. Raj from TechCorp wants $200K/year. Your budget is $120K.' },
        { type: 'narrative', character: 'Raj', characterEmoji: '\uD83D\uDC68\u200D\uD83D\uDCBC', characterColor: CHAR_COLORS.orange, text: '"Our solution is enterprise-grade. $200K is actually below market for what we offer."' },
        { type: 'quiz', quiz: { prompt: 'What is BATNA in negotiation?', options: ['Best Alternative To a Negotiated Agreement', 'Business Agreement Terms and Negotiations Act', 'Basic Alternative Trading Negotiation Approach', 'Bilateral Agreement on Trade Negotiations'], correctAnswer: 'Best Alternative To a Negotiated Agreement', explanation: 'BATNA is your best fallback option if the negotiation fails. Knowing your BATNA gives you leverage and a walk-away point.' } },
        { type: 'choice', text: 'Raj won\'t budge on $200K. How do you negotiate?', timerEnabled: true, isBossDecision: true, choices: [
          { text: '"We have 3 other vendors quoting $100K. You need to come down significantly."', reputationChange: 15, feedback: 'Raj pauses. "Let me talk to my manager." Leverage works. He comes back at $150K.', stateChanges: { usedLeverage: true } },
          { text: '"$200K works. Where do I sign?"', reputationChange: -15, feedback: 'You just wasted $80K of company money. Your CFO is not happy.', stateChanges: { overpaid: true } },
          { text: '"What if we do a 3-year deal at $130K/year? Volume commitment for a better rate."', reputationChange: 20, feedback: 'Raj lights up. "That\'s $390K guaranteed. Deal." Win-win. Helen would be proud.', stateChanges: { creativeNegotiation: true } },
        ]},
        { type: 'narrative', character: 'Helen', characterEmoji: '\uD83D\uDC69\u200D\u2696\uFE0F', characterColor: CHAR_COLORS.purple, text: '"Creating value where none existed \u2014 that\'s advanced negotiation. Well done."',
          condition: (s) => s.creativeNegotiation === true },
      ],
    },
    {
      day: 3,
      title: 'The Real Estate Deal',
      beats: [
        { type: 'narrative', text: 'You\'re buying your first investment property. Listed at $350K. The seller is motivated but playing hardball.' },
        { type: 'quiz', quiz: { prompt: 'In negotiation, "anchoring" means:', options: ['Holding firm on your position', 'Setting the first reference point', 'Agreeing to the other side\'s terms', 'Walking away from the deal'], correctAnswer: 'Setting the first reference point', explanation: 'Anchoring is the cognitive bias where the first number mentioned heavily influences the final outcome.' } },
        { type: 'choice', text: 'The seller lists at $350K. You know it\'s worth $300-320K. Your opening offer?', timerEnabled: true, choices: [
          { text: 'Offer $280K \u2014 aggressive anchor below your target', reputationChange: 15, feedback: 'The seller is offended but counters at $330K. You\'re in the negotiation zone. Classic anchoring.', stateChanges: { aggressiveOffer: true } },
          { text: 'Offer $340K \u2014 don\'t want to insult them', reputationChange: -10, feedback: 'You barely left room to negotiate. The seller accepts at $345K. You overpaid.', stateChanges: { weakOffer: true } },
          { text: 'Offer $300K with a letter explaining comparable sales data', reputationChange: 20, feedback: 'Data-backed offer. The seller sees reason and counters at $315K. You close at $310K.', stateChanges: { dataOffer: true } },
        ]},
        { type: 'narrative', text: 'The property deal is moving forward. You\'re learning that preparation wins negotiations.' },
      ],
    },
    {
      day: 4,
      title: 'Office Politics',
      beats: [
        { type: 'plotTwist', plotTwistTitle: 'INTERNAL CONFLICT', text: 'Your coworker takes credit for your project in front of the CEO. This is a negotiation too \u2014 for your reputation.' },
        { type: 'narrative', character: 'Helen', characterEmoji: '\uD83D\uDC69\u200D\u2696\uFE0F', characterColor: CHAR_COLORS.purple, text: '"Internal negotiations are the hardest. You can\'t burn bridges, but you can\'t be a doormat either."' },
        { type: 'choice', text: 'Your coworker stole your credit. How do you handle it?', timerEnabled: true, choices: [
          { text: 'Call them out publicly in the next meeting', reputationChange: -10, feedback: 'You look petty. Nobody wins a public fight at work. Helen sighs.' },
          { text: 'Have a private 1-on-1 conversation: "I noticed you presented my work. Going forward, let\'s present together."', reputationChange: 20, feedback: 'Direct but diplomatic. Your coworker respects the approach and agrees to co-present.', stateChanges: { diplomaticApproach: true } },
          { text: 'Let it go and hope it doesn\'t happen again', reputationChange: -5, feedback: 'It happens again. And again. Silence is not a negotiation strategy.' },
        ]},
        { type: 'quiz', quiz: { prompt: 'The best negotiation outcomes are:', options: ['Win-Lose', 'Win-Win', 'Lose-Lose', 'Compromise'], correctAnswer: 'Win-Win', explanation: 'Win-win negotiations create the most value and build lasting relationships. Both parties walk away satisfied.' } },
      ],
    },
    {
      day: 5,
      title: 'High-Stakes Contract',
      beats: [
        { type: 'narrative', text: 'A $2M contract is on the line. Both sides have lawyers. Every word matters.' },
        { type: 'narrative', character: 'Raj', characterEmoji: '\uD83D\uDC68\u200D\uD83D\uDCBC', characterColor: CHAR_COLORS.orange, text: '"We need exclusivity, non-compete, and penalty clauses. Non-negotiable."' },
        { type: 'choice', text: 'Raj demands harsh contract terms. Your move?', timerEnabled: true, isBossDecision: true, choices: [
          { text: 'Accept all terms \u2014 the deal is too important to lose', reputationChange: -10, feedback: 'You\'re locked into terrible terms for 5 years. Short-term win, long-term disaster.' },
          { text: '"Exclusivity for 2 years instead of 5, and we remove the non-compete. The penalty clause stays at 50%."', reputationChange: 20, feedback: 'Raj thinks. "I can work with that." You protected your interests while keeping the deal alive.', stateChanges: { protectedTerms: true } },
          { text: 'Walk away from the table', reputationChange: 5, feedback: 'Bold move. Raj calls back 2 days later with better terms. Sometimes walking away IS the strategy.' },
        ]},
        { type: 'quiz', quiz: { prompt: 'What is the "zone of possible agreement" (ZOPA)?', options: ['The legal framework for contracts', 'The range where both sides can agree', 'The maximum price a buyer will pay', 'The minimum price a seller will accept'], correctAnswer: 'The range where both sides can agree', explanation: 'ZOPA is the overlap between the buyer\'s maximum and seller\'s minimum. If no ZOPA exists, no deal is possible.' } },
      ],
    },
    {
      day: 6,
      title: 'Hostage Scenario',
      beats: [
        { type: 'narrative', text: 'Training exercise with Sgt. Cole. A simulated hostage scenario. The "hostage-taker" wants $1M and a helicopter.' },
        { type: 'narrative', character: 'Sgt. Cole', characterEmoji: '\uD83D\uDE93', characterColor: CHAR_COLORS.blue, text: '"In crisis negotiation, the first rule is: slow everything down. Time is your friend. Emotions are your enemy."' },
        { type: 'quiz', quiz: { prompt: 'In crisis negotiation, the first thing you should do is:', options: ['Make an offer', 'Establish rapport', 'Call for backup', 'Set a deadline'], correctAnswer: 'Establish rapport', explanation: 'Building rapport and trust is the foundation of all crisis negotiation. People cooperate with people they trust.' } },
        { type: 'choice', text: 'The hostage-taker is screaming. What do you say first?', timerEnabled: true, choices: [
          { text: '"I hear you. I want to help. Tell me what happened."', reputationChange: 20, feedback: 'Sgt. Cole nods. "Active listening. You just de-escalated the situation by 50%."', stateChanges: { goodNegotiator: true } },
          { text: '"Put the weapon down NOW or we\'re coming in!"', reputationChange: -15, feedback: '"You just escalated the situation. In real life, someone could be dead." Sgt. Cole is not impressed.' },
          { text: '"What if we give you half the money?"', reputationChange: -5, feedback: '"Never negotiate on demands immediately. First, build rapport. Then problem-solve."' },
        ]},
        { type: 'narrative', character: 'Sgt. Cole', characterEmoji: '\uD83D\uDE93', characterColor: CHAR_COLORS.blue, text: '"Most negotiations \u2014 business or crisis \u2014 come down to one thing: does the other person feel heard?"' },
      ],
    },
    {
      day: 7,
      title: 'The Final Deal',
      beats: [
        { type: 'narrative', text: 'Everything you\'ve learned comes together. A massive partnership deal that could change your career.' },
        { type: 'narrative', character: 'Helen', characterEmoji: '\uD83D\uDC69\u200D\u2696\uFE0F', characterColor: CHAR_COLORS.purple, text: '"This is it. Show me everything you\'ve learned. I\'ll be watching."' },
        { type: 'quiz', quiz: { prompt: 'The most powerful tool in negotiation is:', options: ['Aggression', 'Preparation', 'Deception', 'Speed'], correctAnswer: 'Preparation', explanation: 'Thorough preparation \u2014 knowing your BATNA, ZOPA, and the other side\'s interests \u2014 is the #1 predictor of negotiation success.' } },
        { type: 'quiz', quiz: { prompt: 'When the other side says "final offer," you should:', options: ['Always accept', 'Always reject', 'Test whether it\'s truly final', 'Walk away immediately'], correctAnswer: 'Test whether it\'s truly final', explanation: '"Final offer" is often a tactic. Skilled negotiators test it by proposing creative alternatives that add value.' } },
        { type: 'choice', text: 'The final deal is on the table. Both sides are at an impasse. Helen is watching. What do you do?', timerEnabled: true, isBossDecision: true, choices: [
          { text: 'Find a creative trade \u2014 give something cheap to you but valuable to them', reputationChange: 20, feedback: 'Helen stands up and applauds. "That\'s what separates good negotiators from great ones. Value creation."', stateChanges: { masterNegotiator: true } },
          { text: 'Split the difference \u2014 meet in the middle', reputationChange: 5, feedback: '"Splitting the difference is lazy but safe. You left value on the table."' },
          { text: 'Bluff and threaten to walk away', reputationChange: -10, feedback: 'They call your bluff. You have to crawl back. Never bluff unless you\'re willing to follow through.' },
        ]},
        { type: 'narrative', character: 'Helen', characterEmoji: '\uD83D\uDC69\u200D\u2696\uFE0F', characterColor: CHAR_COLORS.purple, text: '"You\'ve come a long way in 7 days. The world is one big negotiation \u2014 now you\'re equipped for it."' },
      ],
    },
  ],
};

const REAL_ESTATE_STORY: StoryConfig = {
  title: 'Flipping Your First House',
  subtitle: '7 days from purchase to profit',
  icon: '\uD83C\uDFE0',
  characters: [
    { name: 'Carmen', emoji: '\uD83D\uDC69\u200D\uD83D\uDD27', role: 'Contractor', color: CHAR_COLORS.orange },
    { name: 'Doug', emoji: '\uD83E\uDDD4', role: 'Real Estate Mentor', color: CHAR_COLORS.blue },
    { name: 'Priya', emoji: '\uD83D\uDC69\u200D\uD83D\uDCBC', role: 'Real Estate Agent', color: CHAR_COLORS.pink },
  ],
  endings: [
    { minReputation: 80, title: 'Real Estate Mogul', emoji: '\uD83C\uDFC6', text: 'The flip profits $85K. Doug says, "You\'re a natural." Carmen wants to partner on the next one. Priya brings you 3 more deals. Your real estate empire begins.', badge: 'House Flipper' },
    { minReputation: 50, title: 'Broke Even', emoji: '\uD83C\uDFE0', text: 'You made a small profit after all expenses. Doug says, "You survived your first flip. Most people lose money." Lessons learned for next time.', badge: 'Property Rookie' },
    { minReputation: 0, title: 'Money Pit', emoji: '\uD83D\uDCA8', text: 'The flip lost $30K. Carmen\'s overcharges ate your profit. Priya stops returning calls. Doug says, "Not everyone is cut out for this." Expensive lesson.', badge: '' },
  ],
  days: [
    {
      day: 1,
      title: 'Finding the Deal',
      beats: [
        { type: 'narrative', text: 'You have $200K and a dream. Time to find a property to flip. Doug, your mentor, takes you house hunting.' },
        { type: 'narrative', character: 'Doug', characterEmoji: '\uD83E\uDDD4', characterColor: CHAR_COLORS.blue, text: '"In real estate, you make money when you BUY, not when you sell. Find a deal below market value."' },
        { type: 'quiz', quiz: { prompt: 'The "70% Rule" in house flipping means:', options: ['Flip 70% of houses you see', 'Pay no more than 70% of ARV minus repairs', 'Expect 70% profit margin', 'Renovate 70% of the house'], correctAnswer: 'Pay no more than 70% of ARV minus repairs', explanation: 'The 70% Rule: Max purchase = (ARV x 0.70) - repair costs. This ensures enough margin for profit after expenses.' } },
        { type: 'choice', text: 'Three properties on your list. Which do you pursue?', timerEnabled: true, choices: [
          { text: 'A foreclosure in a great neighborhood \u2014 needs $40K in repairs, listed at $150K, ARV $250K', reputationChange: 20, feedback: 'Doug grins. "That\'s the one. 70% rule checks out. Great neighborhood means easy resale."', stateChanges: { goodDeal: true } },
          { text: 'A beautiful house in a bad neighborhood \u2014 cheap at $100K', reputationChange: -10, feedback: '"Location, location, location. You can\'t fix a bad neighborhood." Doug shakes his head.', stateChanges: { badLocation: true } },
          { text: 'A turnkey condo downtown \u2014 listed at market value', reputationChange: -5, feedback: '"No room for profit at market price. You need to find distressed properties." Doug is disappointed.' },
        ]},
        { type: 'narrative', text: 'You make your choice. The real estate journey has begun.' },
      ],
    },
    {
      day: 2,
      title: 'The Inspection',
      beats: [
        { type: 'narrative', text: 'Inspection day. Carmen, a licensed contractor, walks through the property with you.' },
        { type: 'narrative', character: 'Carmen', characterEmoji: '\uD83D\uDC69\u200D\uD83D\uDD27', characterColor: CHAR_COLORS.orange, text: '"I see water damage in the basement, old electrical, and the roof needs replacement. This is a $50K job minimum."' },
        { type: 'plotTwist', plotTwistTitle: 'HIDDEN DAMAGE', text: 'The inspector finds foundation cracks. The repair estimate jumps from $40K to $65K. Your profit margin is shrinking fast.',
          condition: (s) => s.goodDeal === true },
        { type: 'choice', text: 'The inspection reveals more damage than expected. What do you do?', timerEnabled: true, isBossDecision: true, choices: [
          { text: 'Renegotiate the price down by $25K based on the inspection report', reputationChange: 20, feedback: 'The seller agrees to $125K. Your margins are saved. Doug says, "That\'s how you protect yourself."', stateChanges: { renegotiated: true } },
          { text: 'Walk away \u2014 too risky', reputationChange: 5, feedback: '"Smart to walk away from a bad deal. But make sure you\'re not just scared." Doug gives a balanced take.' },
          { text: 'Buy anyway at the original price \u2014 you\'ll make it work', reputationChange: -15, feedback: '"You just ate $25K in unexpected costs. That comes out of YOUR profit." Carmen cringes.' },
        ]},
        { type: 'quiz', quiz: { prompt: 'What is "ARV" in house flipping?', options: ['Average Renovation Value', 'After Repair Value', 'Annual Real Value', 'Assessed Revenue Value'], correctAnswer: 'After Repair Value', explanation: 'ARV (After Repair Value) is what the property will be worth after all renovations are complete.' } },
      ],
    },
    {
      day: 3,
      title: 'Negotiating the Purchase',
      beats: [
        { type: 'narrative', text: 'Time to close on the property. The seller\'s agent is playing hardball.' },
        { type: 'narrative', character: 'Priya', characterEmoji: '\uD83D\uDC69\u200D\uD83D\uDCBC', characterColor: CHAR_COLORS.pink, text: '"The seller got another offer. We need to move fast but don\'t overpay."' },
        { type: 'choice', text: 'Competing offer on the property. How do you win the deal?', timerEnabled: true, choices: [
          { text: 'Offer $10K above asking \u2014 outbid them', reputationChange: -10, feedback: 'You won the bid but destroyed your profit margin. Carmen says, "You\'re already underwater."' },
          { text: 'Offer fast closing (2 weeks instead of 30 days) at your price', reputationChange: 20, feedback: 'The seller loves the speed. Your offer wins without paying more. Priya is impressed.', stateChanges: { fastClose: true } },
          { text: 'Drop out and look for another property', reputationChange: 0, feedback: 'Doug says, "There\'s always another deal. But you need to learn to compete eventually."' },
        ]},
        { type: 'quiz', quiz: { prompt: 'What are "closing costs" in real estate?', options: ['The final sale price', 'Fees for finalizing the transaction (title, escrow, etc.)', 'Renovation costs', 'Moving expenses'], correctAnswer: 'Fees for finalizing the transaction (title, escrow, etc.)', explanation: 'Closing costs include title insurance, escrow fees, appraisal, inspection, and legal fees \u2014 typically 2-5% of the purchase price.' } },
      ],
    },
    {
      day: 4,
      title: 'The Renovation',
      beats: [
        { type: 'narrative', text: 'You own the house. Carmen starts the renovation. Budget: $50K. Timeline: 6 weeks.' },
        { type: 'narrative', character: 'Carmen', characterEmoji: '\uD83D\uDC69\u200D\uD83D\uDD27', characterColor: CHAR_COLORS.orange, text: '"Kitchen and bathrooms sell houses. That\'s where we put the money. Forget the fancy landscaping for now."' },
        { type: 'choice', text: 'How do you allocate your $50K renovation budget?', timerEnabled: true, choices: [
          { text: 'Kitchen: $20K, Bathrooms: $15K, Foundation: $10K, Paint/floors: $5K', reputationChange: 20, feedback: 'Carmen says, "Now you\'re thinking like a flipper." Focus on what buyers see first.', stateChanges: { smartReno: true } },
          { text: 'Pool: $25K, Landscaping: $15K, Cosmetic: $10K', reputationChange: -10, feedback: '"A pool? On a flip? That\'s a $25K mistake. Pools REDUCE value in most markets." Doug facepalms.' },
          { text: 'All cosmetic \u2014 paint, staging, curb appeal', reputationChange: 5, feedback: '"Looks nice on the surface, but the inspector will find all the issues you skipped."' },
        ]},
        { type: 'quiz', quiz: { prompt: 'Which renovation has the highest ROI on a flip?', options: ['Swimming pool', 'Kitchen remodel', 'Home theater', 'Wine cellar'], correctAnswer: 'Kitchen remodel', explanation: 'Kitchen remodels return 75-100% of their cost. Kitchens and bathrooms are the two highest-ROI renovations.' } },
        { type: 'narrative', text: 'The renovation is underway. Every day, you check in on progress and keep Carmen on budget.' },
      ],
    },
    {
      day: 5,
      title: 'The Budget Crisis',
      beats: [
        { type: 'plotTwist', plotTwistTitle: 'BUDGET BLOWN', text: 'Carmen calls. They hit a load-bearing wall that needs structural reinforcement. Extra cost: $15K. You\'re already at budget.' },
        { type: 'narrative', character: 'Carmen', characterEmoji: '\uD83D\uDC69\u200D\uD83D\uDD27', characterColor: CHAR_COLORS.orange, text: '"Sorry, this wasn\'t in the plans. But we can\'t sell a house with structural issues. It\'s gotta be fixed."' },
        { type: 'choice', text: 'You\'re $15K over budget. What do you do?', timerEnabled: true, isBossDecision: true, choices: [
          { text: 'Cut $15K from other areas \u2014 downgrade finishes, skip staging', reputationChange: 15, feedback: 'Carmen finds cheaper materials that still look great. "Resourceful. I like it." Budget saved.', stateChanges: { cutCosts: true } },
          { text: 'Take out a personal loan to cover it', reputationChange: -10, feedback: '"Now you\'re paying interest on your flip. That eats into profit." Doug warns you.' },
          { text: 'Ask Carmen to do the work at cost \u2014 promise her the next project', reputationChange: 10, feedback: 'Carmen agrees. "But you better keep that promise." Relationships are currency in this business.', stateChanges: { owesCarmen: true } },
        ]},
        { type: 'quiz', quiz: { prompt: 'What percentage should you add as a contingency budget on a flip?', options: ['0% \u2014 stick to the budget', '5-10%', '10-20%', '50%'], correctAnswer: '10-20%', explanation: 'Always budget 10-20% for unexpected expenses. In rehab projects, surprises are the rule, not the exception.' } },
      ],
    },
    {
      day: 6,
      title: 'Staging and Listing',
      beats: [
        { type: 'narrative', text: 'Renovation complete. The house looks incredible. Time to list it for sale.' },
        { type: 'narrative', character: 'Priya', characterEmoji: '\uD83D\uDC69\u200D\uD83D\uDCBC', characterColor: CHAR_COLORS.pink, text: '"I got a photographer and stager. Professional photos sell houses 32% faster."' },
        { type: 'choice', text: 'Your ARV estimate is $250K. What do you list at?', timerEnabled: true, choices: [
          { text: '$249,900 \u2014 just under the psychological threshold', reputationChange: 20, feedback: 'Priya smiles. "That\'s the right play. Just under $250K catches more buyers in search filters."', stateChanges: { smartPricing: true } },
          { text: '$275,000 \u2014 aim high and negotiate down', reputationChange: -10, feedback: '"Overpricing kills deals. The house sits for 30 days with no offers. Now it looks stale."' },
          { text: '$230,000 \u2014 price it low to create a bidding war', reputationChange: 10, feedback: '"Aggressive pricing can work in hot markets. You get 5 offers." Risky but effective.' },
        ]},
        { type: 'quiz', quiz: { prompt: 'What is "days on market" and why does it matter?', options: ['How long since you bought it', 'How many days the listing has been active', 'The closing timeline', 'The renovation duration'], correctAnswer: 'How many days the listing has been active', explanation: 'Days on market (DOM) measures how long a property has been listed. Higher DOM means the market perceives it as overpriced.' } },
        { type: 'narrative', text: 'The listing goes live. Professional photos. Virtual tour. Open house scheduled for Saturday.' },
      ],
    },
    {
      day: 7,
      title: 'The Sale',
      beats: [
        { type: 'narrative', text: 'Open house day. 30 people walk through. 3 make offers. The highest is $248K.' },
        { type: 'narrative', character: 'Doug', characterEmoji: '\uD83E\uDDD4', characterColor: CHAR_COLORS.blue, text: '"This is the moment of truth. Every decision you made this week leads here."' },
        { type: 'quiz', quiz: { prompt: 'What is "equity" in real estate?', options: ['The property\'s total value', 'The difference between value and what you owe', 'Your monthly mortgage payment', 'The down payment amount'], correctAnswer: 'The difference between value and what you owe', explanation: 'Equity = Property Value - Outstanding Debt. It\'s the portion of the property you actually own.' } },
        { type: 'choice', text: 'Three offers on the table. The highest is $248K but wants a 45-day close. The second is $240K but can close in 2 weeks.', timerEnabled: true, isBossDecision: true, choices: [
          { text: 'Take the $248K offer \u2014 maximize profit', reputationChange: 10, feedback: 'You wait 45 days. Carrying costs eat some profit, but you net $8K more.' },
          { text: 'Take the $240K fast close \u2014 time is money', reputationChange: 15, feedback: 'Close in 2 weeks. Less carrying costs, faster reinvestment. Doug approves.', stateChanges: { quickSale: true } },
          { text: 'Counter the $248K buyer at $252K and fast close', reputationChange: 20, feedback: 'They come back at $250K, 30-day close. Best of both worlds. Priya high-fives you.', stateChanges: { bestDeal: true } },
        ]},
        { type: 'narrative', character: 'Doug', characterEmoji: '\uD83E\uDDD4', characterColor: CHAR_COLORS.blue, text: '"Your first flip is in the books. Total it up, learn from it, and do it again. That\'s how wealth is built."' },
        { type: 'narrative', character: 'Carmen', characterEmoji: '\uD83D\uDC69\u200D\uD83D\uDD27', characterColor: CHAR_COLORS.orange, text: '"Same time next month? I\'ve got another property in mind."',
          condition: (s) => s.smartReno === true },
      ],
    },
  ],
};

const CODING_STORY: StoryConfig = {
  title: 'Startup in 7 Days',
  subtitle: 'Build and launch your first product',
  icon: '\uD83D\uDCBB',
  characters: [
    { name: 'Nova', emoji: '\uD83D\uDC69\u200D\uD83D\uDCBB', role: 'Tech Co-founder', color: CHAR_COLORS.cyan },
    { name: 'Sam', emoji: '\uD83E\uDDD1\u200D\uD83D\uDE80', role: 'Early User / Beta Tester', color: CHAR_COLORS.green },
    { name: 'Kai', emoji: '\uD83E\uDD13', role: 'VC Investor', color: CHAR_COLORS.gold },
  ],
  endings: [
    { minReputation: 80, title: 'Funded & Launched', emoji: '\uD83D\uDE80', text: 'Kai writes you a $500K check. Nova hugs you. Sam is your first paid customer. 10,000 users in month one. The startup dream is real.', badge: 'Startup Founder' },
    { minReputation: 50, title: 'Ramen Profitable', emoji: '\uD83D\uDCBB', text: 'No VC funding, but you have 200 users and $2K MRR. Nova says, "We\'re bootstrapping. It\'s harder but it\'s ours." The grind continues.', badge: 'Code Warrior' },
    { minReputation: 0, title: 'Failed to Launch', emoji: '\uD83D\uDCA5', text: 'The app is buggy, users bounce, and Kai passes. Nova goes back to her day job. "Maybe next time." The idea dies in a GitHub repo nobody visits.', badge: '' },
  ],
  days: [
    {
      day: 1,
      title: 'The Idea',
      beats: [
        { type: 'narrative', text: 'You have 7 days to go from idea to launched product. No excuses. No "next week." Let\'s build.' },
        { type: 'narrative', character: 'Nova', characterEmoji: '\uD83D\uDC69\u200D\uD83D\uDCBB', characterColor: CHAR_COLORS.cyan, text: '"I\'m in. But we need to pick ONE idea and commit. What are we building?"' },
        { type: 'choice', text: 'What product do you build?', timerEnabled: true, choices: [
          { text: 'An AI-powered tool that solves a specific pain point for freelancers', reputationChange: 20, feedback: 'Nova loves it. "Specific niche, clear problem, easy to market. Let\'s go."', stateChanges: { smartIdea: true, aiTool: true } },
          { text: 'A social media app to compete with Instagram', reputationChange: -15, feedback: '"Competing with a billion-dollar company in 7 days? That\'s not ambitious, it\'s delusional." Nova looks worried.', stateChanges: { badIdea: true } },
          { text: 'A simple Chrome extension that saves time on email', reputationChange: 10, feedback: '"Small but shippable. I like it. We can actually finish this in 7 days."', stateChanges: { chromeExt: true } },
        ]},
        { type: 'quiz', quiz: { prompt: 'An MVP (Minimum Viable Product) should have:', options: ['Every feature you can imagine', 'Just enough features to solve the core problem', 'A beautiful design but no functionality', 'At least 100 features'], correctAnswer: 'Just enough features to solve the core problem', explanation: 'An MVP is the smallest version of your product that delivers value. Ship fast, learn fast, iterate.' } },
        { type: 'narrative', text: 'The idea is locked. Tomorrow, you code.' },
      ],
    },
    {
      day: 2,
      title: 'Building the MVP',
      beats: [
        { type: 'narrative', text: '6am. Coffee. IDE open. The blank screen stares back. Time to build.' },
        { type: 'narrative', character: 'Nova', characterEmoji: '\uD83D\uDC69\u200D\uD83D\uDCBB', characterColor: CHAR_COLORS.cyan, text: '"I\'ll handle the backend. You take the frontend. We meet at midnight to integrate."' },
        { type: 'choice', text: 'How do you approach the build?', timerEnabled: true, isBossDecision: true, choices: [
          { text: 'Use a boilerplate/starter kit \u2014 speed over perfection', reputationChange: 20, feedback: 'Nova approves. "Ship first, refactor later. We have 5 days left." Smart move.', stateChanges: { fastBuild: true } },
          { text: 'Build everything from scratch \u2014 no dependencies', reputationChange: -10, feedback: '"We don\'t have time for NIH syndrome. Use existing tools!" Nova is frustrated.', stateChanges: { slowBuild: true } },
          { text: 'Spend the day on architecture and planning documents', reputationChange: -5, feedback: '"Planning is good but we\'re overplanning. We need working code by tonight."' },
        ]},
        { type: 'quiz', quiz: { prompt: 'What does "shipping" mean in startup culture?', options: ['Delivering packages', 'Releasing product to users', 'Moving to a new office', 'Sending emails'], correctAnswer: 'Releasing product to users', explanation: 'Shipping means getting your product into users\' hands. In startups, speed of shipping is critical.' } },
        { type: 'narrative', text: 'By midnight, you have a working prototype. It\'s ugly, but it works. That\'s all that matters right now.' },
      ],
    },
    {
      day: 3,
      title: 'Soft Launch',
      beats: [
        { type: 'narrative', text: 'Day 3. The MVP is functional. Time to get it in front of real users.' },
        { type: 'narrative', character: 'Sam', characterEmoji: '\uD83E\uDDD1\u200D\uD83D\uDE80', characterColor: CHAR_COLORS.green, text: '"I saw your tweet about this. Can I try it? I\'ve been looking for exactly this kind of tool."' },
        { type: 'choice', text: 'How do you launch the MVP?', timerEnabled: true, choices: [
          { text: 'Share on Twitter/X, Reddit, and Indie Hackers \u2014 get feedback immediately', reputationChange: 20, feedback: 'Sam signs up immediately. 47 users by end of day. The feedback starts flooding in.', stateChanges: { publicLaunch: true } },
          { text: 'Wait until it\'s perfect \u2014 you only get one first impression', reputationChange: -10, feedback: '"If you\'re not embarrassed by your first version, you launched too late." \u2014 Reid Hoffman. Nova looks frustrated.' },
          { text: 'Send it to 10 friends and family for private testing', reputationChange: 10, feedback: 'Good feedback from trusted circle. But friends are too nice \u2014 you need harsh, honest users.' },
        ]},
        { type: 'quiz', quiz: { prompt: 'What is "Product-Market Fit"?', options: ['When your product is finished', 'When users love your product enough to recommend it', 'When you reach 1 million users', 'When you get VC funding'], correctAnswer: 'When users love your product enough to recommend it', explanation: 'Product-market fit means your product satisfies a strong market demand. Users stick around and tell others.' } },
        { type: 'narrative', character: 'Sam', characterEmoji: '\uD83E\uDDD1\u200D\uD83D\uDE80', characterColor: CHAR_COLORS.green, text: '"I love this! But the onboarding is confusing. I almost gave up on step 2."' },
      ],
    },
    {
      day: 4,
      title: 'The Bug Crisis',
      beats: [
        { type: 'plotTwist', plotTwistTitle: 'PRODUCTION DOWN', text: 'Your database crashes at 3am. All user data is gone. 200 users wake up to a broken app. Twitter is NOT happy.' },
        { type: 'narrative', character: 'Nova', characterEmoji: '\uD83D\uDC69\u200D\uD83D\uDCBB', characterColor: CHAR_COLORS.cyan, text: '"We forgot to set up backups. This is bad. Really bad. We need to fix this NOW."' },
        { type: 'choice', text: 'Production is down. Users are angry. What do you do FIRST?', timerEnabled: true, choices: [
          { text: 'Post a transparent status update: "We messed up. Here\'s what happened and here\'s our plan."', reputationChange: 20, feedback: 'Users appreciate the honesty. Sam tweets, "This is how founders should handle crises." Respect earned.', stateChanges: { transparentCrisis: true } },
          { text: 'Fix it silently and hope nobody notices', reputationChange: -10, feedback: 'Everyone noticed. And now they think you\'re hiding things. Trust destroyed.' },
          { text: 'Blame the hosting provider publicly', reputationChange: -15, feedback: '"Never blame your tools. You chose them. You\'re responsible." Nova is ashamed.' },
        ]},
        { type: 'quiz', quiz: { prompt: 'What is a "postmortem" in software engineering?', options: ['Shutting down a project', 'An analysis of what went wrong after an incident', 'A code review', 'A product launch'], correctAnswer: 'An analysis of what went wrong after an incident', explanation: 'A postmortem documents what happened, why, and how to prevent it. Blameless postmortems are a sign of healthy engineering culture.' } },
        { type: 'narrative', text: 'By 8am, the app is back. Backups are now automated. Lesson learned the hard way.' },
      ],
    },
    {
      day: 5,
      title: 'User Growth',
      beats: [
        { type: 'narrative', text: 'Day 5. 500 users. Some love it, some hate it. The feedback is overwhelming.' },
        { type: 'narrative', character: 'Sam', characterEmoji: '\uD83E\uDDD1\u200D\uD83D\uDE80', characterColor: CHAR_COLORS.green, text: '"I\'ve been telling everyone about this. My freelancer group wants to know: will there be a pro version?"' },
        { type: 'choice', text: 'Users want more features. How do you prioritize?', timerEnabled: true, choices: [
          { text: 'Build the top 3 features that paying users are asking for', reputationChange: 20, feedback: 'Revenue starts flowing. $500 in the first week. Nova cries happy tears.', stateChanges: { monetized: true } },
          { text: 'Build every feature everyone asks for', reputationChange: -10, feedback: 'Feature bloat. The app becomes slow and confusing. Users start leaving.' },
          { text: 'Focus on growth hacking \u2014 referral system, viral loops', reputationChange: 10, feedback: 'Growth without product quality is a leaky bucket. But the referral system does bring in 200 more users.' },
        ]},
        { type: 'quiz', quiz: { prompt: 'What is MRR in SaaS?', options: ['Maximum Revenue Rate', 'Monthly Recurring Revenue', 'Market Research Report', 'Multi-Region Replication'], correctAnswer: 'Monthly Recurring Revenue', explanation: 'MRR is the predictable recurring revenue a business earns each month from subscriptions.' } },
        { type: 'narrative', text: 'Day 5 ends with 700 users and $500 in revenue. The product is alive.' },
      ],
    },
    {
      day: 6,
      title: 'Scaling Pains',
      beats: [
        { type: 'narrative', text: '1,000 users. The app is slowing down. Your $20/month server can\'t handle the load.' },
        { type: 'narrative', character: 'Nova', characterEmoji: '\uD83D\uDC69\u200D\uD83D\uDCBB', characterColor: CHAR_COLORS.cyan, text: '"We need to scale the infrastructure. But we also need to optimize the code. Both are urgent."' },
        { type: 'choice', text: 'App is slow and users are complaining. What do you prioritize?', timerEnabled: true, isBossDecision: true, choices: [
          { text: 'Upgrade server + add caching \u2014 quick fix now, optimize later', reputationChange: 15, feedback: 'App is fast again in 2 hours. Nova optimizes the code overnight. Problem solved.', stateChanges: { scaledQuick: true } },
          { text: 'Rewrite the codebase for performance \u2014 do it right', reputationChange: -10, feedback: '"We don\'t have time for a rewrite! Users are leaving RIGHT NOW." Nova is panicking.' },
          { text: 'Put up a "we\'re experiencing high demand" page and slow down signups', reputationChange: 10, feedback: '"The waitlist actually creates FOMO. Signups increase." Accidental genius.', stateChanges: { waitlist: true } },
        ]},
        { type: 'quiz', quiz: { prompt: 'What does "technical debt" mean?', options: ['Money owed to developers', 'Shortcuts in code that need to be fixed later', 'Server hosting costs', 'Open source license fees'], correctAnswer: 'Shortcuts in code that need to be fixed later', explanation: 'Technical debt is the accumulated cost of quick fixes and shortcuts. It must eventually be paid back through refactoring.' } },
        { type: 'narrative', text: 'The app stabilizes. 1,500 users by end of day. Tomorrow, the big pitch.' },
      ],
    },
    {
      day: 7,
      title: 'The Pitch',
      beats: [
        { type: 'narrative', text: 'Day 7. Kai, a VC investor, wants to hear your pitch. This could change everything.' },
        { type: 'narrative', character: 'Kai', characterEmoji: '\uD83E\uDD13', characterColor: CHAR_COLORS.gold, text: '"You built this in 7 days? Impressive. Walk me through the traction and unit economics."' },
        { type: 'quiz', quiz: { prompt: 'What is "burn rate" in startups?', options: ['How fast code is written', 'How fast the company spends money', 'The rate of user growth', 'The speed of product development'], correctAnswer: 'How fast the company spends money', explanation: 'Burn rate is the rate at which a startup spends its cash reserves. It determines how many months of runway you have.' } },
        { type: 'quiz', quiz: { prompt: 'CAC stands for:', options: ['Customer Acquisition Cost', 'Content and Commerce', 'Capital Asset Calculation', 'Customer Account Credit'], correctAnswer: 'Customer Acquisition Cost', explanation: 'CAC is the total cost to acquire one customer, including marketing, sales, and advertising expenses.' } },
        { type: 'choice', text: 'Kai asks: "Why should I invest $500K in you and not the 99 other startups in my inbox?"', timerEnabled: true, isBossDecision: true, choices: [
          { text: '"1,500 users in 5 days. $2K MRR. 40% week-over-week growth. We have product-market fit."', reputationChange: 20, feedback: 'Kai leans forward. "Those are real numbers. Send me the term sheet." Nova squeezes your hand under the table.', stateChanges: { gotFunding: true } },
          { text: '"We\'re going to be the next Uber/Airbnb of our space."', reputationChange: -10, feedback: '"Every founder says that. Show me data, not analogies." Kai checks his phone.' },
          { text: '"We\'re passionate and hardworking."', reputationChange: -5, feedback: '"Passion doesn\'t pay salaries. I need metrics." Kai is polite but moves on to the next pitch.' },
        ]},
        { type: 'narrative', character: 'Nova', characterEmoji: '\uD83D\uDC69\u200D\uD83D\uDCBB', characterColor: CHAR_COLORS.cyan, text: '"Seven days. We actually did it. Whatever happens, we built something real."' },
        { type: 'narrative', character: 'Sam', characterEmoji: '\uD83E\uDDD1\u200D\uD83D\uDE80', characterColor: CHAR_COLORS.green, text: '"I\'m telling everyone. This tool changed how I work. Thank you for building it."',
          condition: (s) => s.monetized === true },
      ],
    },
  ],
};

const PERSUASION_STORY: StoryConfig = {
  title: 'The Influence Game',
  subtitle: 'Master the art of persuasion',
  icon: '\uD83C\uDFAF',
  characters: [
    { name: 'Dr. Ellis', emoji: '\uD83E\uDDD1\u200D\uD83C\uDF93', role: 'Psychology Professor', color: CHAR_COLORS.purple },
    { name: 'Ava', emoji: '\uD83D\uDC69\u200D\uD83D\uDE80', role: 'Skeptical Executive', color: CHAR_COLORS.pink },
    { name: 'Tomeo', emoji: '\uD83D\uDE04', role: 'Team Lead', color: CHAR_COLORS.green },
  ],
  endings: [
    { minReputation: 80, title: 'Master Influencer', emoji: '\uD83C\uDFC6', text: 'Dr. Ellis offers you a guest lecture spot. Ava becomes your champion. Tomeo\'s team delivers record results. You\'ve mastered ethical persuasion \u2014 the ultimate superpower.', badge: 'Master Influencer' },
    { minReputation: 50, title: 'Getting There', emoji: '\uD83C\uDFAF', text: 'You won some people over, lost others. Dr. Ellis says, "You understand the principles. Now you need 10,000 hours of practice." The foundation is set.', badge: 'Persuasion Apprentice' },
    { minReputation: 0, title: 'Manipulator Exposed', emoji: '\uD83D\uDE45', text: 'People saw through your tactics. Ava calls you out publicly. Tomeo\'s team loses trust. Dr. Ellis says, "Persuasion without ethics is manipulation. Start over."', badge: '' },
  ],
  days: [
    {
      day: 1,
      title: 'Convince the Skeptic',
      beats: [
        { type: 'narrative', text: 'You\'re proposing a new initiative at work. Ava, the VP of Operations, is your biggest skeptic.' },
        { type: 'narrative', character: 'Dr. Ellis', characterEmoji: '\uD83E\uDDD1\u200D\uD83C\uDF93', characterColor: CHAR_COLORS.purple, text: '"Before you try to convince anyone, understand their worldview. What does Ava care about?"' },
        { type: 'quiz', quiz: { prompt: 'Cialdini\'s 6 principles of influence include all EXCEPT:', options: ['Reciprocity', 'Social proof', 'Intimidation', 'Scarcity'], correctAnswer: 'Intimidation', explanation: 'Cialdini\'s 6 principles are: Reciprocity, Commitment, Social Proof, Authority, Liking, and Scarcity. Intimidation is not one.' } },
        { type: 'choice', text: 'Ava says "I don\'t see the ROI." How do you persuade her?', timerEnabled: true, choices: [
          { text: 'Show her data from 3 competitors who already implemented this successfully', reputationChange: 20, feedback: 'Social proof hits hard. Ava reads the data twice. "Why aren\'t we doing this already?"', stateChanges: { usedSocialProof: true, convincedAva: true } },
          { text: '"Trust me, this will work. I have a gut feeling."', reputationChange: -15, feedback: 'Ava doesn\'t do gut feelings. She does spreadsheets. You lost her.' },
          { text: 'Pressure her: "Everyone else on the board supports this."', reputationChange: -5, feedback: '"Peer pressure doesn\'t work on me." Ava sees through the tactic. Trust decreased.' },
        ]},
        { type: 'narrative', character: 'Dr. Ellis', characterEmoji: '\uD83E\uDDD1\u200D\uD83C\uDF93', characterColor: CHAR_COLORS.purple, text: '"Social proof is powerful because humans are wired to follow the herd. But only use it ethically."' },
      ],
    },
    {
      day: 2,
      title: 'Pitch to the Board',
      beats: [
        { type: 'narrative', text: 'The board meeting. 8 people around the table. You have 10 minutes to pitch your idea.' },
        { type: 'narrative', character: 'Ava', characterEmoji: '\uD83D\uDC69\u200D\uD83D\uDE80', characterColor: CHAR_COLORS.pink, text: '"I\'m still not fully convinced. But I\'ll give you a fair hearing."',
          condition: (s) => s.convincedAva === true },
        { type: 'choice', text: 'How do you open your board presentation?', timerEnabled: true, isBossDecision: true, choices: [
          { text: 'Start with a story \u2014 a real customer who suffered from the problem you\'re solving', reputationChange: 20, feedback: 'The room goes quiet. Stories bypass analytical resistance and go straight to emotions. Ava leans in.', stateChanges: { strongPitch: true } },
          { text: 'Start with a 15-slide deck full of charts and graphs', reputationChange: -5, feedback: 'Death by PowerPoint. Half the board is on their phones by slide 5.' },
          { text: 'Start by listing your credentials and experience', reputationChange: 0, feedback: 'Authority helps, but leading with ego turns people off. Mixed reaction.' },
        ]},
        { type: 'quiz', quiz: { prompt: 'The "rule of three" in persuasion means:', options: ['Always ask three times', 'Group arguments in sets of three', 'Three people are needed to persuade', 'Repeat your message three days later'], correctAnswer: 'Group arguments in sets of three', explanation: 'The human brain finds patterns of three satisfying and memorable. Three key points > five key points in persuasion.' } },
        { type: 'narrative', text: 'The board votes. With Ava\'s support, your initiative is approved. Phase 1 begins.',
          condition: (s) => s.strongPitch === true && s.convincedAva === true },
        { type: 'narrative', text: 'The board wants more data before committing. You get a 30-day trial period.',
          condition: (s) => s.strongPitch !== true || s.convincedAva !== true },
      ],
    },
    {
      day: 3,
      title: 'Lead the Team',
      beats: [
        { type: 'narrative', text: 'You need to motivate a team of 5 who didn\'t choose this project. Tomeo is the informal leader.' },
        { type: 'narrative', character: 'Tomeo', characterEmoji: '\uD83D\uDE04', characterColor: CHAR_COLORS.green, text: '"Look, we\'re already stretched thin. Why should we care about YOUR initiative?"' },
        { type: 'choice', text: 'The team is resistant. How do you get them on board?', timerEnabled: true, choices: [
          { text: '"I know you\'re busy. What if I handle the extra meetings and you focus on execution?"', reputationChange: 20, feedback: 'Reciprocity. You gave first. Tomeo says, "That\'s fair. We\'re in." The team respects you.', stateChanges: { wonTeam: true } },
          { text: '"This comes from the board. We don\'t have a choice."', reputationChange: -10, feedback: 'Compliance without buy-in. They\'ll do the minimum. Quality suffers.' },
          { text: '"If this succeeds, everyone gets a bonus."', reputationChange: 5, feedback: 'Incentives work but you just set an expensive precedent. And what if you can\'t deliver the bonus?' },
        ]},
        { type: 'quiz', quiz: { prompt: 'Which is more motivating long-term?', options: ['Monetary rewards', 'Autonomy and purpose', 'Threats and deadlines', 'Competition between team members'], correctAnswer: 'Autonomy and purpose', explanation: 'Dan Pink\'s research shows that intrinsic motivation (autonomy, mastery, purpose) outperforms extrinsic rewards for creative work.' } },
        { type: 'narrative', character: 'Dr. Ellis', characterEmoji: '\uD83E\uDDD1\u200D\uD83C\uDF93', characterColor: CHAR_COLORS.purple, text: '"Leadership IS persuasion. The best leaders make people WANT to follow them."' },
      ],
    },
    {
      day: 4,
      title: 'Crisis Communication',
      beats: [
        { type: 'plotTwist', plotTwistTitle: 'PR DISASTER', text: 'A leaked email makes your company look terrible. Social media is exploding. The CEO asks YOU to write the public response.' },
        { type: 'narrative', character: 'Ava', characterEmoji: '\uD83D\uDC69\u200D\uD83D\uDE80', characterColor: CHAR_COLORS.pink, text: '"This is a test of everything you claim to know about persuasion. Don\'t mess it up."' },
        { type: 'choice', text: 'The public is angry. What\'s your response strategy?', timerEnabled: true, isBossDecision: true, choices: [
          { text: 'Immediate acknowledgment + specific action plan + personal accountability', reputationChange: 20, feedback: 'The response goes viral for the RIGHT reasons. "This is how companies should handle mistakes." Trust restored.', stateChanges: { crisisWin: true } },
          { text: 'Delete the tweet, say nothing, wait for it to blow over', reputationChange: -15, feedback: 'The Streisand effect. Trying to hide it makes it 10x worse. CEO is furious.' },
          { text: 'Blame the employee who leaked it', reputationChange: -10, feedback: '"Shooting the messenger is the fastest way to destroy internal trust." Tomeo\'s team is watching.' },
        ]},
        { type: 'quiz', quiz: { prompt: 'In crisis communication, the first thing to express is:', options: ['Blame', 'Empathy', 'Legal disclaimers', 'Statistics'], correctAnswer: 'Empathy', explanation: 'Leading with empathy shows you understand the impact. "We hear you, we understand why you\'re upset, and here\'s what we\'re doing about it."' } },
      ],
    },
    {
      day: 5,
      title: 'Negotiation Under Pressure',
      beats: [
        { type: 'narrative', text: 'A major client is threatening to leave. They want a 40% discount or they walk. This is a $500K account.' },
        { type: 'narrative', character: 'Tomeo', characterEmoji: '\uD83D\uDE04', characterColor: CHAR_COLORS.green, text: '"The team worked so hard on this account. We can\'t lose them now."' },
        { type: 'choice', text: 'Client wants 40% off or they walk. How do you persuade them to stay?', timerEnabled: true, choices: [
          { text: '"Here\'s what 3 months without us looks like \u2014 let me walk you through the cost of switching."', reputationChange: 20, feedback: 'Loss aversion kicks in. The client realizes switching costs more than staying. Discount reduced to 10%.', stateChanges: { savedClient: true } },
          { text: 'Give the 40% discount', reputationChange: -10, feedback: 'You just set a precedent. Every client will demand the same. Revenue tanks.' },
          { text: '"Take it or leave it. Our price is our price."', reputationChange: -5, feedback: 'They leave. You were right on principle but wrong on strategy. Half a million gone.' },
        ]},
        { type: 'quiz', quiz: { prompt: 'Loss aversion means people are more motivated by:', options: ['Gaining $100', 'Losing $100', 'They\'re equally motivated', 'Depends on the person'], correctAnswer: 'Losing $100', explanation: 'Kahneman & Tversky showed that losses hurt ~2x more than equivalent gains feel good. Loss framing is more persuasive.' } },
      ],
    },
    {
      day: 6,
      title: 'Building Consensus',
      beats: [
        { type: 'narrative', text: 'Three departments disagree on the project direction. You need to align them all.' },
        { type: 'narrative', character: 'Dr. Ellis', characterEmoji: '\uD83E\uDDD1\u200D\uD83C\uDF93', characterColor: CHAR_COLORS.purple, text: '"Consensus isn\'t about getting everyone to agree. It\'s about making everyone feel heard."' },
        { type: 'choice', text: 'Three departments, three different visions. How do you build consensus?', timerEnabled: true, choices: [
          { text: 'Meet each department separately first, then bring everyone together with their concerns already addressed', reputationChange: 20, feedback: 'Pre-selling is the secret weapon of persuasion. When you walk into the group meeting, most concerns are already handled.', stateChanges: { builtConsensus: true } },
          { text: 'Force a vote and let majority rule', reputationChange: -10, feedback: 'The losing side is resentful. They\'ll undermine the project passively. Democracy isn\'t always the answer.' },
          { text: 'Let the CEO decide', reputationChange: -5, feedback: '"Delegating up is a sign of weak leadership." Ava takes note.' },
        ]},
        { type: 'quiz', quiz: { prompt: 'The "foot-in-the-door" technique works by:', options: ['Being aggressive', 'Starting with a small request before a bigger one', 'Offering discounts', 'Using authority'], correctAnswer: 'Starting with a small request before a bigger one', explanation: 'Once someone agrees to a small request, they\'re more likely to agree to a larger related one due to commitment consistency.' } },
      ],
    },
    {
      day: 7,
      title: 'The Final Pitch',
      beats: [
        { type: 'narrative', text: 'Results day. Your initiative succeeded. Now you need to persuade the company to expand it company-wide.' },
        { type: 'narrative', character: 'Ava', characterEmoji: '\uD83D\uDC69\u200D\uD83D\uDE80', characterColor: CHAR_COLORS.pink, text: '"I was wrong about you. Show me the results and I\'ll back the expansion."',
          condition: (s) => s.convincedAva === true && s.strongPitch === true },
        { type: 'quiz', quiz: { prompt: 'Ethos, Pathos, Logos are:', options: ['Greek gods', 'Modes of persuasion: credibility, emotion, logic', 'Types of logical fallacies', 'Marketing frameworks'], correctAnswer: 'Modes of persuasion: credibility, emotion, logic', explanation: 'Aristotle\'s three pillars of persuasion: Ethos (credibility), Pathos (emotional appeal), and Logos (logical reasoning).' } },
        { type: 'choice', text: 'Final presentation to the entire company. How do you close?', timerEnabled: true, isBossDecision: true, choices: [
          { text: 'Combine all three: data (logos), team stories (pathos), and your track record (ethos)', reputationChange: 20, feedback: 'Standing ovation. The trifecta of persuasion. Dr. Ellis would be proud. The expansion is approved unanimously.' },
          { text: 'Just show the numbers \u2014 let data speak for itself', reputationChange: 5, feedback: 'Good data, but no emotional connection. The expansion is approved, but without enthusiasm.' },
          { text: 'Give an emotional speech about your vision', reputationChange: 0, feedback: 'Inspiring, but the analytical types want proof. Mixed reviews.' },
        ]},
        { type: 'narrative', character: 'Dr. Ellis', characterEmoji: '\uD83E\uDDD1\u200D\uD83C\uDF93', characterColor: CHAR_COLORS.purple, text: '"Persuasion is the most important skill in business, relationships, and life. Use it wisely."' },
        { type: 'narrative', character: 'Tomeo', characterEmoji: '\uD83D\uDE04', characterColor: CHAR_COLORS.green, text: '"You know what? I\'d follow you into the next project. And that\'s saying something."',
          condition: (s) => s.wonTeam === true },
      ],
    },
  ],
};

const BUSINESS_STORY: StoryConfig = {
  title: 'From Zero to CEO',
  subtitle: 'Build your company from nothing',
  icon: '\uD83D\uDCBC',
  characters: [
    { name: 'Lena', emoji: '\uD83D\uDC69\u200D\uD83D\uDE80', role: 'Advisor / Mentor', color: CHAR_COLORS.teal },
    { name: 'Omar', emoji: '\uD83E\uDDD4', role: 'First Employee', color: CHAR_COLORS.orange },
    { name: 'Vivian', emoji: '\uD83D\uDC69\u200D\u2696\uFE0F', role: 'Acquirer / Investor', color: CHAR_COLORS.gold },
  ],
  endings: [
    { minReputation: 80, title: 'CEO & Visionary', emoji: '\uD83C\uDFC6', text: 'Vivian offers $10M to acquire your company. Omar toasts you. Lena says, "I knew it from day one." You\'re living the entrepreneurial dream \u2014 and it\'s just getting started.', badge: 'CEO Material' },
    { minReputation: 50, title: 'Surviving Founder', emoji: '\uD83D\uDCBC', text: 'The company is alive but barely profitable. Lena says, "Most businesses fail. You didn\'t. That\'s success." Omar is loyal but tired. The grind continues.', badge: 'Entrepreneur' },
    { minReputation: 0, title: 'Bankrupt', emoji: '\uD83D\uDCB8', text: 'The company runs out of money. Omar finds another job. Lena stops returning calls. Vivian passes. You\'re back at square one with a pile of debt and hard lessons.', badge: '' },
  ],
  days: [
    {
      day: 1,
      title: 'Quit the Day Job',
      beats: [
        { type: 'narrative', text: 'Your savings: $30,000. Your idea: a SaaS tool for small businesses. Your fear: everything.' },
        { type: 'narrative', character: 'Lena', characterEmoji: '\uD83D\uDC69\u200D\uD83D\uDE80', characterColor: CHAR_COLORS.teal, text: '"Most people talk about starting a business. You\'re actually doing it. First question: who is your customer?"' },
        { type: 'choice', text: 'Who do you build for?', timerEnabled: true, choices: [
          { text: 'Small business owners who need simple invoicing \u2014 specific and underserved', reputationChange: 20, feedback: 'Lena smiles. "Narrow focus, clear pain point. You can own this niche."', stateChanges: { clearTarget: true } },
          { text: 'Everyone \u2014 the bigger the market, the bigger the opportunity', reputationChange: -10, feedback: '"If you\'re selling to everyone, you\'re selling to no one." Lena sighs.', stateChanges: { noFocus: true } },
          { text: 'Enterprise companies \u2014 bigger contracts', reputationChange: -5, feedback: '"Enterprise sales cycles are 6-12 months. Your $30K won\'t last." Lena warns you.' },
        ]},
        { type: 'quiz', quiz: { prompt: 'What is "product-market fit"?', options: ['A product that looks good', 'When the market pulls the product out of your hands', 'Getting to 1 million users', 'Having a nice website'], correctAnswer: 'When the market pulls the product out of your hands', explanation: 'Product-market fit (coined by Marc Andreessen) means your product satisfies strong market demand. Users actively seek it out.' } },
      ],
    },
    {
      day: 2,
      title: 'First Customer',
      beats: [
        { type: 'narrative', text: 'You have a working product. Now you need your first paying customer. The hardest sale you\'ll ever make.' },
        { type: 'narrative', character: 'Lena', characterEmoji: '\uD83D\uDC69\u200D\uD83D\uDE80', characterColor: CHAR_COLORS.teal, text: '"Your first customer validates everything. Get ONE person to pay you real money."' },
        { type: 'choice', text: 'How do you find your first customer?', timerEnabled: true, isBossDecision: true, choices: [
          { text: 'Join online communities where small business owners hang out and offer to solve their specific problems', reputationChange: 20, feedback: 'You find a plumber who hates his current invoicing. He pays $29/month. "This is exactly what I needed!" Revenue: $1.', stateChanges: { firstCustomer: true, communityApproach: true } },
          { text: 'Run Facebook Ads to your landing page', reputationChange: -5, feedback: 'Ads cost money you don\'t have. $500 spent, 0 customers. "Paid acquisition before PMF is burning cash." \u2014 Lena' },
          { text: 'Ask friends and family to sign up', reputationChange: 0, feedback: 'Your mom signs up. She doesn\'t even have a business. "Family support is nice but it\'s not validation."' },
        ]},
        { type: 'quiz', quiz: { prompt: 'The "1000 True Fans" theory by Kevin Kelly states:', options: ['You need 1M users to succeed', 'You need 1000 fans who each pay you $100/year', 'You need 1000 employees', 'You need 1000 products'], correctAnswer: 'You need 1000 fans who each pay you $100/year', explanation: 'Kevin Kelly\'s theory: 1000 true fans each paying you $100/year = $100K/year. You don\'t need millions of users to build a sustainable business.' } },
      ],
    },
    {
      day: 3,
      title: 'Hiring',
      beats: [
        { type: 'narrative', text: 'You can\'t do everything alone. You need help. Omar, a developer, responds to your job post.' },
        { type: 'narrative', character: 'Omar', characterEmoji: '\uD83E\uDDD4', characterColor: CHAR_COLORS.orange, text: '"I love the product. I believe in what you\'re building. But I have a family \u2014 I need stability."' },
        { type: 'choice', text: 'Omar wants to join but needs $5K/month. Your runway is $25K. How do you structure it?', timerEnabled: true, choices: [
          { text: '$3K salary + equity \u2014 he shares the upside and the risk', reputationChange: 20, feedback: 'Omar accepts. "I\'m betting on us." He becomes your most loyal teammate.', stateChanges: { hiredOmar: true, equityDeal: true } },
          { text: '$5K salary, no equity \u2014 keep full ownership', reputationChange: -5, feedback: 'You can only afford Omar for 5 months. And he has no skin in the game.' },
          { text: 'Equity only, no salary \u2014 save cash', reputationChange: -10, feedback: '"I can\'t pay rent with equity." Omar passes. You\'re alone again.' },
        ]},
        { type: 'quiz', quiz: { prompt: 'What is "runway" in startup terms?', options: ['The office hallway', 'How many months until you run out of cash', 'The time to build an MVP', 'The length of your pitch deck'], correctAnswer: 'How many months until you run out of cash', explanation: 'Runway = Total Cash / Monthly Burn Rate. It tells you how many months you can survive before needing more money or revenue.' } },
      ],
    },
    {
      day: 4,
      title: 'The Crisis',
      beats: [
        { type: 'plotTwist', plotTwistTitle: 'SERVER HACKED', text: 'Your database was compromised. Customer data leaked. It\'s just 50 customers, but this could destroy trust and your business.' },
        { type: 'narrative', character: 'Omar', characterEmoji: '\uD83E\uDDD4', characterColor: CHAR_COLORS.orange, text: '"I found the vulnerability. It\'s patched. But we need to tell customers."',
          condition: (s) => s.hiredOmar === true },
        { type: 'choice', text: 'Customer data was leaked. What do you do?', timerEnabled: true, choices: [
          { text: 'Email every customer immediately: explain what happened, what you\'re doing, and offer 3 months free', reputationChange: 20, feedback: 'Customers appreciate the transparency. Only 2 cancel. "This is how you build trust \u2014 even through mistakes." \u2014 Lena', stateChanges: { handledCrisis: true } },
          { text: 'Stay quiet and fix it. Nobody needs to know.', reputationChange: -15, feedback: 'A customer finds out from a third party. It hits Twitter. Now it\'s 10x worse.' },
          { text: 'Blame Omar for the security flaw', reputationChange: -10, feedback: '"Leaders take responsibility. Blaming your team destroys culture." Omar considers quitting.' },
        ]},
        { type: 'quiz', quiz: { prompt: 'In most jurisdictions, data breaches require:', options: ['No action', 'Notification to affected users within a specific timeframe', 'Shutting down the business', 'Paying a flat fine'], correctAnswer: 'Notification to affected users within a specific timeframe', explanation: 'GDPR, CCPA, and most data protection laws require timely notification to affected users after a data breach.' } },
      ],
    },
    {
      day: 5,
      title: 'The Pivot',
      beats: [
        { type: 'narrative', text: 'Month 3. Revenue is growing but slowly. $2K MRR. You need to decide: stay the course or pivot?' },
        { type: 'narrative', character: 'Lena', characterEmoji: '\uD83D\uDC69\u200D\uD83D\uDE80', characterColor: CHAR_COLORS.teal, text: '"Data doesn\'t lie. Your invoicing tool is fine, but users keep asking for the payment processing feature. That\'s where the real demand is."' },
        { type: 'choice', text: 'Users love one feature more than your core product. Do you pivot?', timerEnabled: true, isBossDecision: true, choices: [
          { text: 'Pivot \u2014 double down on what users actually want', reputationChange: 20, feedback: 'MRR triples in 2 months. "The best founders listen to the market, not their ego." \u2014 Lena', stateChanges: { pivoted: true } },
          { text: 'Stay the course \u2014 you believe in your original vision', reputationChange: -5, feedback: 'Stubbornness looks like persistence until you run out of money.' },
          { text: 'Build both \u2014 original product AND the new feature', reputationChange: 0, feedback: 'Spread too thin. Neither product is great. Omar is exhausted. "Pick a lane." \u2014 Lena' },
        ]},
        { type: 'quiz', quiz: { prompt: 'A "pivot" in startup terms means:', options: ['Giving up', 'A fundamental change in strategy based on learning', 'Rebranding', 'Raising prices'], correctAnswer: 'A fundamental change in strategy based on learning', explanation: 'A pivot is a strategic shift based on what you\'ve learned from the market. Many successful companies (Instagram, Slack) pivoted from their original idea.' } },
      ],
    },
    {
      day: 6,
      title: 'Scale',
      beats: [
        { type: 'narrative', text: 'Month 6. $15K MRR. 500 customers. You\'re officially ramen profitable. But to grow, you need capital.' },
        { type: 'narrative', character: 'Vivian', characterEmoji: '\uD83D\uDC69\u200D\u2696\uFE0F', characterColor: CHAR_COLORS.gold, text: '"I\'ve been watching your company. Your growth rate is impressive. Let\'s talk about investment."' },
        { type: 'choice', text: 'Vivian offers $500K for 20% of your company. What do you do?', timerEnabled: true, choices: [
          { text: 'Negotiate: "20% is too much. I\'ll do 12% at a $4M valuation."', reputationChange: 20, feedback: 'Vivian respects the pushback. "15% at $3.3M." You shake hands. Omar cheers.', stateChanges: { smartFundraising: true } },
          { text: 'Accept immediately \u2014 you need the money', reputationChange: 5, feedback: 'You got the money but gave up too much equity. Lena says, "Always negotiate the first offer."' },
          { text: 'Reject it \u2014 stay bootstrapped', reputationChange: 10, feedback: 'Principled but risky. Growth will be slower. "Not every company needs VC money." \u2014 Lena', stateChanges: { bootstrapped: true } },
        ]},
        { type: 'quiz', quiz: { prompt: 'What is "dilution" in startup equity?', options: ['Mixing products', 'When founders\' ownership percentage decreases from new investors', 'Reducing product features', 'Customer churn'], correctAnswer: 'When founders\' ownership percentage decreases from new investors', explanation: 'Dilution occurs when new shares are issued to investors, reducing existing shareholders\' percentage ownership.' } },
      ],
    },
    {
      day: 7,
      title: 'The Exit',
      beats: [
        { type: 'narrative', text: 'Year 2. $100K MRR. 5,000 customers. A large company wants to acquire you.' },
        { type: 'narrative', character: 'Vivian', characterEmoji: '\uD83D\uDC69\u200D\u2696\uFE0F', characterColor: CHAR_COLORS.gold, text: '"TechGiant Corp offers $10M for your company. This is a life-changing number. But there are trade-offs."' },
        { type: 'narrative', character: 'Omar', characterEmoji: '\uD83E\uDDD4', characterColor: CHAR_COLORS.orange, text: '"Whatever you decide, I\'m with you. But the team is nervous about what acquisition means for their jobs."',
          condition: (s) => s.hiredOmar === true },
        { type: 'quiz', quiz: { prompt: 'What is an "earnout" in an acquisition?', options: ['Immediate full payment', 'Additional payment based on hitting future targets', 'A signing bonus', 'Stock options'], correctAnswer: 'Additional payment based on hitting future targets', explanation: 'Earnouts tie part of the acquisition price to future performance milestones. They can be tricky \u2014 make sure the terms are clear.' } },
        { type: 'choice', text: '$10M acquisition offer. What do you do?', timerEnabled: true, isBossDecision: true, choices: [
          { text: 'Counter at $15M with guaranteed employee retention \u2014 protect the team and maximize value', reputationChange: 20, feedback: 'They settle at $12M with 2-year retention guarantees. Omar is safe. Lena says, "That\'s leadership." You just changed your life.', stateChanges: { greatExit: true } },
          { text: 'Accept $10M immediately', reputationChange: 10, feedback: 'Life-changing money. But Lena says, "You left $2-5M on the table. Always negotiate."' },
          { text: 'Reject and keep building \u2014 you believe it\'s worth $50M someday', reputationChange: 5, feedback: 'Bold. Very bold. Lena says, "That\'s either visionary or foolish. Time will tell."', stateChanges: { keptCompany: true } },
        ]},
        { type: 'narrative', character: 'Lena', characterEmoji: '\uD83D\uDC69\u200D\uD83D\uDE80', characterColor: CHAR_COLORS.teal, text: '"From zero to here in 7 days of lessons. Most people only dream about this. You lived it."' },
      ],
    },
  ],
};

// ─── Story Map & Resolver ─────────────────────────────────────

const STORY_MAP: Record<string, StoryConfig> = {
  'Trading': TRADING_STORY,
  'Sales': SALES_STORY,
  'Marketing Agency': AGENCY_STORY,
  'Negotiation': NEGOTIATION_STORY,
  'Real Estate': REAL_ESTATE_STORY,
  'Coding': CODING_STORY,
  'Persuasion': PERSUASION_STORY,
  'Business': BUSINESS_STORY,
};

function getStoryForSkill(skillName: string): StoryConfig | null {
  const lower = skillName.toLowerCase();
  if (lower.includes('trad') || lower.includes('invest') || lower.includes('stock') || lower.includes('forex') || lower.includes('crypto'))
    return TRADING_STORY;
  if (lower.includes('sales') || lower.includes('closing'))
    return SALES_STORY;
  if (lower.includes('market') || lower.includes('agency') || lower.includes('smma') || lower.includes('freelan'))
    return AGENCY_STORY;
  if (lower.includes('negot') || lower.includes('deal'))
    return NEGOTIATION_STORY;
  if (lower.includes('real estate') || lower.includes('property') || lower.includes('flip'))
    return REAL_ESTATE_STORY;
  if (lower.includes('cod') || lower.includes('program') || lower.includes('dev') || lower.includes('startup') || lower.includes('tech'))
    return CODING_STORY;
  if (lower.includes('persua') || lower.includes('influence') || lower.includes('convince') || lower.includes('psychol'))
    return PERSUASION_STORY;
  if (lower.includes('business') || lower.includes('entrepren') || lower.includes('ceo') || lower.includes('company'))
    return BUSINESS_STORY;
  return TRADING_STORY;
}

// ─── Typewriter Hook ──────────────────────────────────────────

function useTypewriter(text: string, speed = 22) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);
  const indexRef = useRef(0);

  useEffect(() => {
    setDisplayed('');
    setDone(false);
    indexRef.current = 0;

    if (!text) { setDone(true); return; }

    const interval = setInterval(() => {
      indexRef.current++;
      setDisplayed(text.slice(0, indexRef.current));
      if (indexRef.current >= text.length) {
        clearInterval(interval);
        setDone(true);
      }
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed]);

  const skip = useCallback(() => {
    setDisplayed(text);
    setDone(true);
  }, [text]);

  return { displayed, done, skip };
}

// ─── AsyncStorage helpers ─────────────────────────────────────

const SAVE_KEY_PREFIX = '@storymode_';
const STAR_KEY_PREFIX = '@storymode_stars_';

async function loadProgress(skillName: string): Promise<SavedProgress | null> {
  try {
    const raw = await AsyncStorage.getItem(SAVE_KEY_PREFIX + skillName);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

async function saveProgress(skillName: string, progress: SavedProgress): Promise<void> {
  try {
    await AsyncStorage.setItem(SAVE_KEY_PREFIX + skillName, JSON.stringify(progress));
  } catch {}
}

async function clearProgress(skillName: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(SAVE_KEY_PREFIX + skillName);
  } catch {}
}

async function loadStarRatings(skillName: string): Promise<Record<number, number>> {
  try {
    const raw = await AsyncStorage.getItem(STAR_KEY_PREFIX + skillName);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

async function saveStarRatings(skillName: string, ratings: Record<number, number>): Promise<void> {
  try {
    await AsyncStorage.setItem(STAR_KEY_PREFIX + skillName, JSON.stringify(ratings));
  } catch {}
}

// ─── Decision Timer Component ─────────────────────────────────

function DecisionTimer({ seconds, onExpire, isPaused }: { seconds: number; onExpire: () => void; isPaused: boolean }) {
  const [timeLeft, setTimeLeft] = useState(seconds);
  const widthAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onExpire();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    Animated.timing(widthAnim, {
      toValue: 0,
      duration: seconds * 1000,
      useNativeDriver: false,
    }).start();

    return () => clearInterval(timer);
  }, [isPaused]);

  useEffect(() => {
    if (timeLeft <= 5 && timeLeft > 0) {
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.1, duration: 200, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, [timeLeft]);

  const timerColor = timeLeft <= 5 ? colors.error : timeLeft <= 10 ? '#FBBF24' : colors.primary;

  return (
    <Animated.View style={[styles.timerContainer, { transform: [{ scale: pulseAnim }] }]}>
      <View style={styles.timerBarBg}>
        <Animated.View
          style={[
            styles.timerBarFill,
            {
              backgroundColor: timerColor,
              width: widthAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%'],
              }),
            },
          ]}
        />
      </View>
      <Text style={[styles.timerText, { color: timerColor }]}>{timeLeft}s</Text>
    </Animated.View>
  );
}

// ─── Plot Twist Animation Component ──────────────────────────

function PlotTwistBeat({ beat, onContinue }: { beat: StoryBeat; onContinue: () => void }) {
  const scaleAnim = useRef(new Animated.Value(0.3)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const text = beat.text || '';
  const { displayed, done, skip } = useTypewriter(text, 18);

  useEffect(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);

    Animated.sequence([
      Animated.parallel([
        Animated.spring(scaleAnim, { toValue: 1, friction: 4, tension: 80, useNativeDriver: true }),
        Animated.timing(opacityAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      ]),
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 8, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -8, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
      ]),
    ]).start();
  }, []);

  return (
    <View style={styles.beatBox}>
      <Animated.View style={[
        styles.plotTwistBanner,
        {
          opacity: opacityAnim,
          transform: [{ scale: scaleAnim }, { translateX: shakeAnim }],
        },
      ]}>
        <LinearGradient
          colors={['#FF0040', '#FF6B00']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.plotTwistGradient}
        >
          <Text style={styles.plotTwistIcon}>
            {beat.plotTwistTitle?.includes('NEWS') ? '\uD83D\uDCF0' : '\u26A1'}
          </Text>
          <Text style={styles.plotTwistTitle}>{beat.plotTwistTitle || 'PLOT TWIST'}</Text>
        </LinearGradient>
      </Animated.View>

      <TouchableOpacity activeOpacity={1} onPress={done ? undefined : skip}>
        <Text style={styles.plotTwistText}>
          {displayed}
          {!done && <Text style={styles.cursor}>|</Text>}
        </Text>
      </TouchableOpacity>

      {done && (
        <TouchableOpacity onPress={onContinue} style={styles.continueBtn}>
          <Text style={styles.continueBtnText}>Continue</Text>
          <Ionicons name="arrow-forward" size={16} color={colors.primary} />
        </TouchableOpacity>
      )}
    </View>
  );
}

// ─── Chat Bubble Component ────────────────────────────────────

function ChatBubble({ character, characterEmoji, characterColor, text, isPlayer }: {
  character?: string;
  characterEmoji?: string;
  characterColor?: string;
  text: string;
  isPlayer?: boolean;
}) {
  if (isPlayer) {
    return (
      <View style={styles.chatBubblePlayerRow}>
        <View style={[styles.chatBubble, styles.chatBubblePlayer]}>
          <Text style={styles.chatBubblePlayerText}>{text}</Text>
        </View>
        <Text style={styles.chatBubbleAvatar}>{'\uD83D\uDE4B'}</Text>
      </View>
    );
  }

  return (
    <View style={styles.chatBubbleRow}>
      <Text style={styles.chatBubbleAvatar}>{characterEmoji || '\uD83D\uDDE3\uFE0F'}</Text>
      <View style={styles.chatBubbleContent}>
        {character && (
          <Text style={[styles.chatBubbleName, { color: characterColor || colors.textSecondary }]}>{character}</Text>
        )}
        <View style={[styles.chatBubble, styles.chatBubbleCharacter, characterColor ? { borderLeftColor: characterColor } : null]}>
          <Text style={styles.chatBubbleText}>{text}</Text>
        </View>
      </View>
    </View>
  );
}

// ─── Star Rating Component ────────────────────────────────────

function StarRating({ stars }: { stars: number }) {
  return (
    <View style={styles.starsRow}>
      {[1, 2, 3].map((i) => (
        <Ionicons
          key={i}
          name={i <= stars ? 'star' : 'star-outline'}
          size={28}
          color={i <= stars ? '#FBBF24' : colors.textMuted}
        />
      ))}
    </View>
  );
}

function getStarRating(reputation: number): number {
  if (reputation >= 80) return 3;
  if (reputation >= 50) return 2;
  return 1;
}

// ─── Main Screen ──────────────────────────────────────────────

export function StoryModeScreen({ route, navigation }: { route: any; navigation: any }) {
  const { skillName } = route.params;
  const story = getStoryForSkill(skillName);
  const addXp = useGameStore((s) => s.addXp);

  const [dayIndex, setDayIndex] = useState(0);
  const [beatIndex, setBeatIndex] = useState(0);
  const [reputation, setReputation] = useState(50);
  const [decisionsLog, setDecisionsLog] = useState<{ day: number; choice: string; impact: number }[]>([]);
  const [quizCorrect, setQuizCorrect] = useState(0);
  const [quizTotal, setQuizTotal] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null);
  const [selectedQuiz, setSelectedQuiz] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showDaySummary, setShowDaySummary] = useState(false);
  const [showFinalSummary, setShowFinalSummary] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [storyState, setStoryState] = useState<Record<string, boolean>>({});
  const [starRatings, setStarRatings] = useState<Record<number, number>>({});
  const [xpAwarded, setXpAwarded] = useState<Record<number, boolean>>({});
  const [timerExpired, setTimerExpired] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scrollRef = useRef<ScrollView>(null);

  // Load saved progress
  useEffect(() => {
    (async () => {
      const saved = await loadProgress(skillName);
      if (saved) {
        setDayIndex(saved.dayIndex);
        setBeatIndex(saved.beatIndex);
        setReputation(saved.reputation);
        setDecisionsLog(saved.decisionsLog);
        setQuizCorrect(saved.quizCorrect);
        setQuizTotal(saved.quizTotal);
        if (saved.storyState) setStoryState(saved.storyState);
        if (saved.starRatings) setStarRatings(saved.starRatings);
        if (saved.xpAwarded) setXpAwarded(saved.xpAwarded);
      }
      setLoaded(true);
    })();
  }, [skillName]);

  // Save progress on changes
  useEffect(() => {
    if (!loaded) return;
    saveProgress(skillName, { dayIndex, beatIndex, reputation, decisionsLog, quizCorrect, quizTotal, storyState, starRatings, xpAwarded });
  }, [dayIndex, beatIndex, reputation, decisionsLog, quizCorrect, quizTotal, loaded, storyState, starRatings, xpAwarded]);

  // Animate beat transitions
  useEffect(() => {
    fadeAnim.setValue(0);
    slideAnim.setValue(30);
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
    ]).start();
  }, [dayIndex, beatIndex, showDaySummary, showFinalSummary]);

  if (!story) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <Text style={styles.noStoryText}>No story available for {skillName} yet.</Text>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backBtnText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const currentDay = story.days[dayIndex];
  // Filter beats based on conditions
  const activeBeats = currentDay?.beats.filter((beat) => {
    if (beat.condition) return beat.condition(storyState);
    return true;
  }) || [];
  const currentBeat = activeBeats[beatIndex];
  const totalDays = story.days.length;
  const progress = (dayIndex / totalDays) * 100;

  // Check if current choice beat has conditional choices and filter them
  const getFilteredChoices = (beat: StoryBeat) => {
    if (!beat.choices) return [];
    return beat.choices.filter((choice) => {
      if (choice.condition) return choice.condition(storyState);
      return true;
    });
  };

  const advanceBeat = () => {
    setSelectedChoice(null);
    setSelectedQuiz(null);
    setShowFeedback(false);
    setTimerExpired(false);

    if (beatIndex < activeBeats.length - 1) {
      setBeatIndex(beatIndex + 1);
    } else {
      // End of day - award XP and calculate stars
      if (!xpAwarded[dayIndex]) {
        addXp(50); // 50 XP per chapter
        setXpAwarded((prev) => ({ ...prev, [dayIndex]: true }));
      }
      const dayStars = getStarRating(reputation);
      const newStarRatings = { ...starRatings, [dayIndex]: dayStars };
      setStarRatings(newStarRatings);
      saveStarRatings(skillName, newStarRatings);
      setShowDaySummary(true);
    }
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  };

  const advanceDay = () => {
    setShowDaySummary(false);
    if (dayIndex < totalDays - 1) {
      setDayIndex(dayIndex + 1);
      setBeatIndex(0);
    } else {
      // Award completion bonus XP
      addXp(200);
      setShowFinalSummary(true);
    }
  };

  const handleTimerExpire = () => {
    if (selectedChoice !== null) return;
    setTimerExpired(true);
    // Auto-select the worst option (lowest reputation change)
    const choices = getFilteredChoices(currentBeat);
    if (choices.length === 0) return;
    let worstIdx = 0;
    let worstRep = choices[0].reputationChange;
    choices.forEach((c, i) => {
      if (c.reputationChange < worstRep) {
        worstRep = c.reputationChange;
        worstIdx = i;
      }
    });
    handleChoice(worstIdx);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  };

  const handleChoice = (idx: number) => {
    if (selectedChoice !== null) return;
    const choices = getFilteredChoices(currentBeat);
    const choice = choices[idx];
    if (!choice) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedChoice(idx);
    const isBoss = currentBeat?.isBossDecision || choice.isBossDecision;
    const multiplier = isBoss ? 2 : 1;
    const repChange = choice.reputationChange * multiplier;
    setReputation(Math.max(0, Math.min(100, reputation + repChange)));
    setDecisionsLog([...decisionsLog, { day: currentDay.day, choice: choice.text, impact: repChange }]);
    if (choice.stateChanges) {
      setStoryState((prev) => ({ ...prev, ...choice.stateChanges }));
    }
    setShowFeedback(true);
  };

  const handleQuiz = (answer: string) => {
    if (selectedQuiz !== null) return;
    const quiz = currentBeat?.quiz;
    if (!quiz) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedQuiz(answer);
    setQuizTotal(quizTotal + 1);
    if (answer === quiz.correctAnswer) {
      setQuizCorrect(quizCorrect + 1);
      setReputation(Math.min(100, reputation + 5));
    } else {
      setReputation(Math.max(0, reputation - 3));
    }
    setShowFeedback(true);
  };

  const handleRestart = async () => {
    await clearProgress(skillName);
    setDayIndex(0);
    setBeatIndex(0);
    setReputation(50);
    setDecisionsLog([]);
    setQuizCorrect(0);
    setQuizTotal(0);
    setShowFinalSummary(false);
    setShowDaySummary(false);
    setSelectedChoice(null);
    setSelectedQuiz(null);
    setShowFeedback(false);
    setStoryState({});
    setStarRatings({});
    setXpAwarded({});
    setTimerExpired(false);
  };

  const getReputationLabel = () => {
    if (reputation >= 80) return 'Rockstar';
    if (reputation >= 60) return 'Rising Star';
    if (reputation >= 40) return 'Promising';
    if (reputation >= 20) return 'Struggling';
    return 'In Trouble';
  };

  const getReputationColor = () => {
    if (reputation >= 70) return colors.success;
    if (reputation >= 40) return colors.primary;
    return colors.error;
  };

  const getEnding = (): StoryEnding => {
    const endings = story.endings.sort((a, b) => b.minReputation - a.minReputation);
    for (const ending of endings) {
      if (reputation >= ending.minReputation) return ending;
    }
    return endings[endings.length - 1];
  };

  // ─── Final Summary ───────────────────────────────────────

  if (showFinalSummary) {
    const ending = getEnding();
    const finalStars = getStarRating(reputation);

    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.summaryScroll}>
          <Animated.View style={[styles.summaryContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <Text style={styles.summaryIcon}>{ending.emoji}</Text>
            <Text style={styles.summaryTitle}>{ending.title}</Text>
            <Text style={styles.summarySubtitle}>{story.title}</Text>

            <StarRating stars={finalStars} />

            <View style={styles.endingTextBox}>
              <Text style={styles.endingText}>{ending.text}</Text>
            </View>

            {ending.badge ? (
              <View style={styles.badgeBox}>
                <Ionicons name="ribbon" size={24} color="#FBBF24" />
                <Text style={styles.badgeText}>{ending.badge}</Text>
              </View>
            ) : null}

            <View style={styles.summaryStatsRow}>
              <View style={styles.summaryStat}>
                <Text style={styles.summaryStatValue}>{reputation}</Text>
                <Text style={styles.summaryStatLabel}>Reputation</Text>
              </View>
              <View style={styles.summaryStat}>
                <Text style={styles.summaryStatValue}>{quizCorrect}/{quizTotal}</Text>
                <Text style={styles.summaryStatLabel}>Quiz Score</Text>
              </View>
              <View style={styles.summaryStat}>
                <Text style={styles.summaryStatValue}>{getReputationLabel()}</Text>
                <Text style={styles.summaryStatLabel}>Rank</Text>
              </View>
            </View>

            <Text style={styles.xpBonusText}>+200 XP Story Completion Bonus!</Text>

            {/* Journal - all decisions */}
            <View style={styles.decisionsContainer}>
              <Text style={styles.decisionsTitle}>Story Journal</Text>
              {decisionsLog.map((d, i) => (
                <View key={i} style={styles.journalRow}>
                  <View style={styles.journalDayBadge}>
                    <Text style={styles.journalDayText}>D{d.day}</Text>
                  </View>
                  <View style={styles.journalContent}>
                    <Text style={styles.decisionText} numberOfLines={3}>{d.choice}</Text>
                    <Text style={[styles.journalImpact, { color: d.impact >= 0 ? colors.success : colors.error }]}>
                      {d.impact >= 0 ? '+' : ''}{d.impact} REP
                    </Text>
                  </View>
                </View>
              ))}
            </View>

            <TouchableOpacity onPress={handleRestart} style={styles.primaryButton}>
              <LinearGradient
                colors={[colors.primary, colors.primaryDark]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.primaryButtonGradient}
              >
                <Text style={styles.primaryButtonText}>Play Again</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.secondaryButton}>
              <Text style={styles.secondaryButtonText}>Back to Games</Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ─── Day Summary ─────────────────────────────────────────

  if (showDaySummary) {
    const dayDecisions = decisionsLog.filter(d => d.day === currentDay.day);
    const dayStars = starRatings[dayIndex] || getStarRating(reputation);

    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.daySummaryScroll}>
          <Animated.View style={[styles.daySummaryContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <Text style={styles.daySummaryDay}>Day {currentDay.day} Complete</Text>
            <Text style={styles.daySummaryTitle}>{currentDay.title}</Text>

            <StarRating stars={dayStars} />
            <Text style={styles.xpChapterText}>+50 XP</Text>

            <View style={styles.repMeter}>
              <Text style={styles.repLabel}>Reputation</Text>
              <View style={styles.repBarBg}>
                <LinearGradient
                  colors={[getReputationColor(), getReputationColor() + '80']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.repBarFill, { width: `${reputation}%` }]}
                />
              </View>
              <Text style={[styles.repValue, { color: getReputationColor() }]}>{reputation}/100 - {getReputationLabel()}</Text>
            </View>

            {dayDecisions.length > 0 && (
              <View style={styles.dayDecisions}>
                <Text style={styles.dayDecisionsLabel}>Decisions Made</Text>
                {dayDecisions.map((d, i) => (
                  <View key={i} style={styles.decisionRow}>
                    <Text style={[styles.decisionImpact, { color: d.impact >= 0 ? colors.success : colors.error }]}>
                      {d.impact >= 0 ? '+' : ''}{d.impact}
                    </Text>
                    <Text style={styles.decisionText} numberOfLines={2}>{d.choice}</Text>
                  </View>
                ))}
              </View>
            )}

            <TouchableOpacity onPress={advanceDay} style={styles.primaryButton}>
              <LinearGradient
                colors={[colors.primary, colors.primaryDark]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.primaryButtonGradient}
              >
                <Text style={styles.primaryButtonText}>
                  {dayIndex < totalDays - 1 ? `Continue to Day ${currentDay.day + 1}` : 'See Final Results'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ─── Main Beat Rendering ─────────────────────────────────

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBack}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerDay}>Day {currentDay.day} of {totalDays}</Text>
          <Text style={styles.headerTitle}>{currentDay.title}</Text>
        </View>
        <View style={styles.headerRight}>
          <Text style={styles.headerEmoji}>{story.icon}</Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBg}>
          <LinearGradient
            colors={[colors.primary, colors.secondary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.progressFill, { width: `${progress}%` }]}
          />
        </View>
        <View style={styles.progressDots}>
          {story.days.map((_, i) => (
            <View key={i} style={styles.progressDotContainer}>
              <View
                style={[
                  styles.progressDot,
                  i < dayIndex && styles.progressDotDone,
                  i === dayIndex && styles.progressDotCurrent,
                ]}
              />
              {starRatings[i] !== undefined && (
                <View style={styles.progressDotStars}>
                  {[1, 2, 3].map((s) => (
                    <Ionicons
                      key={s}
                      name={s <= (starRatings[i] || 0) ? 'star' : 'star-outline'}
                      size={6}
                      color={s <= (starRatings[i] || 0) ? '#FBBF24' : 'transparent'}
                    />
                  ))}
                </View>
              )}
            </View>
          ))}
        </View>
      </View>

      {/* Reputation Mini */}
      <View style={styles.repMini}>
        <Text style={styles.repMiniLabel}>REP</Text>
        <View style={styles.repMiniBarBg}>
          <View style={[styles.repMiniBarFill, { width: `${reputation}%`, backgroundColor: getReputationColor() }]} />
        </View>
        <Text style={[styles.repMiniValue, { color: getReputationColor() }]}>{reputation}</Text>
      </View>

      {/* Beat Content */}
      <ScrollView
        ref={scrollRef}
        style={styles.beatScroll}
        contentContainerStyle={styles.beatContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          {currentBeat?.type === 'narrative' && (
            <NarrativeBeat
              beat={currentBeat}
              onContinue={advanceBeat}
            />
          )}

          {currentBeat?.type === 'plotTwist' && (
            <PlotTwistBeat
              beat={currentBeat}
              onContinue={advanceBeat}
            />
          )}

          {currentBeat?.type === 'choice' && (
            <ChoiceBeat
              beat={currentBeat}
              selectedChoice={selectedChoice}
              showFeedback={showFeedback}
              onSelect={handleChoice}
              onContinue={advanceBeat}
              storyState={storyState}
              onTimerExpire={handleTimerExpire}
              timerExpired={timerExpired}
            />
          )}

          {currentBeat?.type === 'quiz' && (
            <QuizBeat
              beat={currentBeat}
              selectedQuiz={selectedQuiz}
              showFeedback={showFeedback}
              onSelect={handleQuiz}
              onContinue={advanceBeat}
            />
          )}
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Sub-components ───────────────────────────────────────────

function NarrativeBeat({ beat, onContinue }: { beat: StoryBeat; onContinue: () => void }) {
  const text = beat.text || '';
  const { displayed, done, skip } = useTypewriter(text);

  return (
    <View style={styles.beatBox}>
      {beat.character ? (
        <ChatBubble
          character={beat.character}
          characterEmoji={beat.characterEmoji}
          characterColor={beat.characterColor}
          text={displayed + (!done ? '|' : '')}
        />
      ) : (
        <TouchableOpacity activeOpacity={1} onPress={done ? undefined : skip}>
          <Text style={styles.narrativeText}>
            {displayed}
            {!done && <Text style={styles.cursor}>|</Text>}
          </Text>
        </TouchableOpacity>
      )}

      {!done && (
        <TouchableOpacity onPress={skip} style={styles.skipBtn}>
          <Text style={styles.skipBtnText}>Tap to skip</Text>
        </TouchableOpacity>
      )}

      {done && (
        <TouchableOpacity onPress={onContinue} style={styles.continueBtn}>
          <Text style={styles.continueBtnText}>Continue</Text>
          <Ionicons name="arrow-forward" size={16} color={colors.primary} />
        </TouchableOpacity>
      )}
    </View>
  );
}

function ChoiceBeat({ beat, selectedChoice, showFeedback, onSelect, onContinue, storyState, onTimerExpire, timerExpired }: {
  beat: StoryBeat;
  selectedChoice: number | null;
  showFeedback: boolean;
  onSelect: (idx: number) => void;
  onContinue: () => void;
  storyState: Record<string, boolean>;
  onTimerExpire: () => void;
  timerExpired: boolean;
}) {
  const text = beat.text || '';
  const { displayed, done, skip } = useTypewriter(text);
  const isBoss = beat.isBossDecision;

  const filteredChoices = (beat.choices || []).filter((choice) => {
    if (choice.condition) return choice.condition(storyState);
    return true;
  });

  return (
    <View style={styles.beatBox}>
      {isBoss && (
        <View style={styles.bossDecisionBanner}>
          <LinearGradient
            colors={['#FBBF24', '#F59E0B']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.bossDecisionGradient}
          >
            <Ionicons name="star" size={16} color="#000" />
            <Text style={styles.bossDecisionText}>BOSS DECISION (2x REP)</Text>
            <Ionicons name="star" size={16} color="#000" />
          </LinearGradient>
        </View>
      )}

      <TouchableOpacity activeOpacity={1} onPress={done ? undefined : skip}>
        <Text style={styles.narrativeText}>
          {displayed}
          {!done && <Text style={styles.cursor}>|</Text>}
        </Text>
      </TouchableOpacity>

      {done && selectedChoice === null && beat.timerEnabled && (
        <DecisionTimer
          seconds={DECISION_TIMER_SECONDS}
          onExpire={onTimerExpire}
          isPaused={selectedChoice !== null}
        />
      )}

      {timerExpired && selectedChoice !== null && (
        <View style={styles.timerExpiredBanner}>
          <Ionicons name="time" size={16} color={colors.error} />
          <Text style={styles.timerExpiredText}>Time ran out! Worst option selected.</Text>
        </View>
      )}

      {done && filteredChoices.map((choice, idx) => {
        const isSelected = selectedChoice === idx;
        const isPositive = choice.reputationChange > 0;
        const isNegative = choice.reputationChange < 0;
        const multiplier = isBoss ? 2 : 1;

        return (
          <TouchableOpacity
            key={idx}
            onPress={() => onSelect(idx)}
            disabled={selectedChoice !== null}
            style={[
              styles.choiceButton,
              isBoss && styles.choiceButtonBoss,
              isSelected && isPositive && styles.choiceButtonGood,
              isSelected && isNegative && styles.choiceButtonBad,
              isSelected && !isPositive && !isNegative && styles.choiceButtonNeutral,
              selectedChoice !== null && !isSelected && styles.choiceButtonDimmed,
            ]}
            activeOpacity={0.7}
          >
            <Text style={[
              styles.choiceText,
              isSelected && styles.choiceTextSelected,
              selectedChoice !== null && !isSelected && styles.choiceTextDimmed,
            ]}>
              {choice.text}
            </Text>
            {isSelected && (
              <Text style={[styles.choiceImpact, { color: isPositive ? colors.success : isNegative ? colors.error : colors.textSecondary }]}>
                {choice.reputationChange * multiplier >= 0 ? '+' : ''}{choice.reputationChange * multiplier} REP{isBoss ? ' (2x!)' : ''}
              </Text>
            )}
          </TouchableOpacity>
        );
      })}

      {showFeedback && selectedChoice !== null && filteredChoices[selectedChoice] && (
        <View style={styles.feedbackBox}>
          <Text style={styles.feedbackText}>{filteredChoices[selectedChoice].feedback}</Text>
        </View>
      )}

      {showFeedback && (
        <TouchableOpacity onPress={onContinue} style={styles.continueBtn}>
          <Text style={styles.continueBtnText}>Continue</Text>
          <Ionicons name="arrow-forward" size={16} color={colors.primary} />
        </TouchableOpacity>
      )}
    </View>
  );
}

function QuizBeat({ beat, selectedQuiz, showFeedback, onSelect, onContinue }: {
  beat: StoryBeat;
  selectedQuiz: string | null;
  showFeedback: boolean;
  onSelect: (answer: string) => void;
  onContinue: () => void;
}) {
  const quiz = beat.quiz;
  if (!quiz) return null;

  return (
    <View style={styles.beatBox}>
      <View style={styles.quizBadge}>
        <Ionicons name="help-circle" size={16} color={colors.secondary} />
        <Text style={styles.quizBadgeText}>Knowledge Check</Text>
      </View>

      <Text style={styles.quizPrompt}>{quiz.prompt}</Text>

      {quiz.options.map((opt, idx) => {
        const isSelected = selectedQuiz === opt;
        const isCorrect = opt === quiz.correctAnswer;
        const showResult = selectedQuiz !== null;

        return (
          <TouchableOpacity
            key={idx}
            onPress={() => onSelect(opt)}
            disabled={selectedQuiz !== null}
            style={[
              styles.quizOption,
              showResult && isCorrect && styles.quizOptionCorrect,
              showResult && isSelected && !isCorrect && styles.quizOptionWrong,
              showResult && !isSelected && !isCorrect && styles.quizOptionDimmed,
            ]}
            activeOpacity={0.7}
          >
            <Text style={[
              styles.quizOptionText,
              showResult && isCorrect && styles.quizOptionTextCorrect,
              showResult && isSelected && !isCorrect && styles.quizOptionTextWrong,
            ]}>
              {opt}
            </Text>
            {showResult && isCorrect && <Ionicons name="checkmark-circle" size={20} color={colors.success} />}
            {showResult && isSelected && !isCorrect && <Ionicons name="close-circle" size={20} color={colors.error} />}
          </TouchableOpacity>
        );
      })}

      {showFeedback && (
        <View style={[styles.feedbackBox, styles.quizFeedbackBox]}>
          <Text style={styles.quizFeedbackTitle}>
            {selectedQuiz === quiz.correctAnswer ? 'Correct! +5 REP' : 'Not quite. -3 REP'}
          </Text>
          <Text style={styles.feedbackText}>{quiz.explanation}</Text>
        </View>
      )}

      {showFeedback && (
        <TouchableOpacity onPress={onContinue} style={styles.continueBtn}>
          <Text style={styles.continueBtnText}>Continue</Text>
          <Ionicons name="arrow-forward" size={16} color={colors.primary} />
        </TouchableOpacity>
      )}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing['4xl'],
  },
  noStoryText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  backBtn: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.md,
    backgroundColor: colors.glassBg,
  },
  backBtnText: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '600',
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  headerBack: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.glassBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerDay: {
    ...typography.caption,
    color: colors.textSecondary,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  headerTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginTop: 2,
  },
  headerRight: {
    width: 40,
    alignItems: 'center',
  },
  headerEmoji: {
    fontSize: 24,
  },

  // Progress
  progressContainer: {
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.sm,
  },
  progressBg: {
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.glassBg,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressDots: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
    paddingHorizontal: spacing.xs,
  },
  progressDotContainer: {
    alignItems: 'center',
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.glassBg,
  },
  progressDotDone: {
    backgroundColor: colors.success,
  },
  progressDotCurrent: {
    backgroundColor: colors.primary,
  },
  progressDotStars: {
    flexDirection: 'row',
    marginTop: 2,
  },

  // Reputation Mini
  repMini: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  repMiniLabel: {
    ...typography.label,
    color: colors.textMuted,
    fontSize: 9,
  },
  repMiniBarBg: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.glassBg,
    overflow: 'hidden',
  },
  repMiniBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  repMiniValue: {
    ...typography.caption,
    fontWeight: '800',
    width: 28,
    textAlign: 'right',
  },

  // Beat
  beatScroll: {
    flex: 1,
  },
  beatContent: {
    padding: spacing.xl,
    paddingBottom: 120,
  },
  beatBox: {
    gap: spacing.lg,
  },

  // Character
  characterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  characterEmoji: {
    fontSize: 28,
  },
  characterName: {
    ...typography.body,
    color: colors.textSecondary,
    fontWeight: '700',
  },

  // Chat Bubbles
  chatBubbleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  chatBubblePlayerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'flex-end',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  chatBubbleAvatar: {
    fontSize: 28,
    marginTop: 4,
  },
  chatBubbleContent: {
    flex: 1,
    gap: 2,
  },
  chatBubbleName: {
    ...typography.caption,
    fontWeight: '800',
    marginLeft: spacing.sm,
  },
  chatBubble: {
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    paddingHorizontal: spacing.lg,
    maxWidth: SCREEN_WIDTH * 0.72,
  },
  chatBubbleCharacter: {
    backgroundColor: colors.glassBg,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  chatBubblePlayer: {
    backgroundColor: colors.primary + '20',
    borderRightWidth: 3,
    borderRightColor: colors.primary,
  },
  chatBubbleText: {
    ...typography.body,
    color: 'rgba(255,255,255,0.9)',
    fontStyle: 'italic',
    fontSize: 16,
    lineHeight: 24,
  },
  chatBubblePlayerText: {
    ...typography.body,
    color: colors.textPrimary,
    fontSize: 16,
    lineHeight: 24,
  },

  // Narrative
  narrativeText: {
    ...typography.body,
    color: colors.textPrimary,
    fontSize: 17,
    lineHeight: 28,
  },
  dialogueText: {
    fontStyle: 'italic',
    color: 'rgba(255,255,255,0.9)',
  },
  cursor: {
    color: colors.primary,
    fontWeight: '200',
  },

  // Skip
  skipBtn: {
    alignSelf: 'center',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.lg,
  },
  skipBtnText: {
    ...typography.caption,
    color: colors.textMuted,
  },

  // Continue
  continueBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary + '15',
    marginTop: spacing.sm,
  },
  continueBtnText: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '700',
  },

  // Timer
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  timerBarBg: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.glassBg,
    overflow: 'hidden',
  },
  timerBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  timerText: {
    ...typography.body,
    fontWeight: '900',
    fontSize: 16,
    width: 36,
    textAlign: 'right',
  },
  timerExpiredBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.error + '15',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: colors.error,
  },
  timerExpiredText: {
    ...typography.caption,
    color: colors.error,
    fontWeight: '700',
  },

  // Boss Decision
  bossDecisionBanner: {
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  bossDecisionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  bossDecisionText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#000',
    letterSpacing: 2,
  },

  // Plot Twist
  plotTwistBanner: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  plotTwistGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
  },
  plotTwistIcon: {
    fontSize: 24,
  },
  plotTwistTitle: {
    ...typography.h3,
    color: '#FFFFFF',
    fontWeight: '900',
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
  plotTwistText: {
    ...typography.body,
    color: colors.textPrimary,
    fontSize: 17,
    lineHeight: 28,
    fontWeight: '500',
  },

  // Choices
  choiceButton: {
    borderWidth: 1,
    borderColor: colors.glassBorder,
    backgroundColor: colors.glassBg,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
  },
  choiceButtonBoss: {
    borderColor: '#FBBF24' + '40',
    borderWidth: 2,
  },
  choiceButtonGood: {
    borderColor: colors.success + '60',
    backgroundColor: colors.success + '10',
  },
  choiceButtonBad: {
    borderColor: colors.error + '60',
    backgroundColor: colors.error + '10',
  },
  choiceButtonNeutral: {
    borderColor: colors.primary + '60',
    backgroundColor: colors.primary + '10',
  },
  choiceButtonDimmed: {
    opacity: 0.35,
  },
  choiceText: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  choiceTextSelected: {
    fontWeight: '700',
  },
  choiceTextDimmed: {
    color: colors.textSecondary,
  },
  choiceImpact: {
    ...typography.caption,
    fontWeight: '800',
    marginTop: spacing.xs,
  },

  // Feedback
  feedbackBox: {
    backgroundColor: colors.glassStrongBg,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  feedbackText: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 22,
  },

  // Quiz
  quizBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: spacing.xs,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    backgroundColor: colors.secondary + '15',
  },
  quizBadgeText: {
    ...typography.caption,
    color: colors.secondary,
    fontWeight: '700',
  },
  quizPrompt: {
    ...typography.h3,
    color: colors.textPrimary,
    lineHeight: 28,
  },
  quizOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.glassBorder,
    backgroundColor: colors.glassBg,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
  },
  quizOptionCorrect: {
    borderColor: colors.success + '60',
    backgroundColor: colors.success + '10',
  },
  quizOptionWrong: {
    borderColor: colors.error + '60',
    backgroundColor: colors.error + '10',
  },
  quizOptionDimmed: {
    opacity: 0.35,
  },
  quizOptionText: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '500',
    flex: 1,
    marginRight: spacing.sm,
  },
  quizOptionTextCorrect: {
    color: colors.success,
    fontWeight: '700',
  },
  quizOptionTextWrong: {
    color: colors.error,
    fontWeight: '700',
  },
  quizFeedbackBox: {
    borderLeftColor: colors.secondary,
  },
  quizFeedbackTitle: {
    ...typography.body,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },

  // Stars
  starsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
    marginVertical: spacing.sm,
  },

  // XP
  xpChapterText: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '800',
    textAlign: 'center',
    fontSize: 16,
  },
  xpBonusText: {
    ...typography.body,
    color: '#FBBF24',
    fontWeight: '900',
    textAlign: 'center',
    fontSize: 18,
    marginVertical: spacing.sm,
  },

  // Badge
  badgeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: '#FBBF24' + '15',
    borderRadius: borderRadius.full,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xl,
    borderWidth: 1,
    borderColor: '#FBBF24' + '30',
  },
  badgeText: {
    ...typography.body,
    color: '#FBBF24',
    fontWeight: '800',
  },

  // Ending
  endingTextBox: {
    backgroundColor: colors.glassBg,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
    width: '100%',
  },
  endingText: {
    ...typography.body,
    color: colors.textPrimary,
    lineHeight: 24,
    fontStyle: 'italic',
  },

  // Day Summary
  daySummaryScroll: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing['4xl'],
  },
  daySummaryContainer: {
    gap: spacing.xl,
  },
  daySummaryDay: {
    ...typography.label,
    color: colors.primary,
    textAlign: 'center',
  },
  daySummaryTitle: {
    ...typography.h1,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  repMeter: {
    gap: spacing.sm,
  },
  repLabel: {
    ...typography.label,
    color: colors.textMuted,
  },
  repBarBg: {
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.glassBg,
    overflow: 'hidden',
  },
  repBarFill: {
    height: '100%',
    borderRadius: 6,
  },
  repValue: {
    ...typography.body,
    fontWeight: '800',
  },
  dayDecisions: {
    gap: spacing.sm,
  },
  dayDecisionsLabel: {
    ...typography.label,
    color: colors.textMuted,
  },
  decisionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.xs,
  },
  decisionImpact: {
    ...typography.body,
    fontWeight: '900',
    width: 40,
    textAlign: 'center',
  },
  decisionText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    flex: 1,
  },

  // Journal
  journalRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.glassBorder,
  },
  journalDayBadge: {
    backgroundColor: colors.primary + '20',
    borderRadius: borderRadius.sm,
    paddingVertical: 2,
    paddingHorizontal: spacing.sm,
    minWidth: 32,
    alignItems: 'center',
  },
  journalDayText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '900',
  },
  journalContent: {
    flex: 1,
    gap: 2,
  },
  journalImpact: {
    ...typography.caption,
    fontWeight: '800',
  },

  // Primary button
  primaryButton: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    marginTop: spacing.lg,
  },
  primaryButtonGradient: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  primaryButtonText: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '800',
    fontSize: 16,
  },
  secondaryButton: {
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  secondaryButtonText: {
    ...typography.body,
    color: colors.textSecondary,
    fontWeight: '600',
  },

  // Final Summary
  summaryScroll: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing['4xl'],
  },
  summaryContainer: {
    gap: spacing.xl,
    alignItems: 'center',
  },
  summaryIcon: {
    fontSize: 48,
  },
  summaryTitle: {
    ...typography.h1,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  summarySubtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: -spacing.md,
  },
  summaryStatsRow: {
    flexDirection: 'row',
    gap: spacing.lg,
    justifyContent: 'center',
  },
  summaryStat: {
    alignItems: 'center',
    backgroundColor: colors.glassBg,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    minWidth: 90,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  summaryStatValue: {
    ...typography.h3,
    color: colors.textPrimary,
    fontWeight: '900',
  },
  summaryStatLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  decisionsContainer: {
    width: '100%',
    gap: spacing.sm,
  },
  decisionsTitle: {
    ...typography.label,
    color: colors.textMuted,
  },
});
