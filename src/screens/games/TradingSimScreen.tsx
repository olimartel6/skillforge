import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
let Svg: any, Rect: any, Line: any, SvgText: any, G: any, Path: any, Circle: any;
try {
  const svg = require('react-native-svg');
  Svg = svg.default || svg.Svg; Rect = svg.Rect; Line = svg.Line; SvgText = svg.Text; G = svg.G; Path = svg.Path; Circle = svg.Circle;
} catch {
  Svg = Rect = Line = SvgText = G = Path = Circle = ({ children, ...p }: any) => null;
}
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, spacing, typography, borderRadius } from '../../utils/theme';
import { useStreakStore } from '../../store/streakStore';
import { t } from '../../i18n';

const SIM_STATE_KEY = 'skilly_trading_sim_state';
const SIM_COOLDOWN_KEY = 'skilly_trading_sim_cooldown';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CHART_WIDTH = SCREEN_WIDTH - 24;
const CHART_HEIGHT = 320;
const INDICATOR_HEIGHT = 80;
const MACD_HEIGHT = 80;
const COMMISSION_PER_SHARE = 0.005; // $0.005 per share like IBKR
const PAD = { top: 15, right: 55, bottom: 20, left: 10 };

const STARTING_BALANCE = 50000;
const TARGET_PROFIT = 10000;
const TICK_MS = 60000; // New candle every 60 seconds (1 real minute = 1 trading minute)
const MAX_VISIBLE_CANDLES = 40;
const SIM_DAY_CANDLES = 390; // ~6.5 hours of trading = 390 1-min candles

// --- Price Generation ---
interface Candle {
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

function generateInitialCandles(count: number, startPrice: number): Candle[] {
  const candles: Candle[] = [];
  let price = startPrice;
  let trend = Math.random() > 0.5 ? 1 : -1;
  let trendStrength = 0.3 + Math.random() * 0.5;
  let trendDuration = 5 + Math.floor(Math.random() * 15);
  let prevVolatility = 0.003; // volatility clustering state

  for (let i = 0; i < count; i++) {
    if (trendDuration <= 0) {
      trend = Math.random() > 0.45 ? 1 : -1;
      trendStrength = 0.2 + Math.random() * 0.6;
      trendDuration = 5 + Math.floor(Math.random() * 15);
    }

    // Volatility clustering: high vol follows high vol
    const volTarget = 0.003 + (Math.random() - 0.5) * 0.002;
    prevVolatility = prevVolatility * 0.7 + volTarget * 0.3;
    const volatility = price * Math.max(0.001, prevVolatility);

    // Negative skew: crashes faster than rallies
    const skew = trend < 0 ? 1.3 : 1.0;
    const drift = trend * trendStrength * volatility * skew;
    const noise = (Math.random() - 0.5) * volatility * 1.5;
    const change = drift + noise;

    // Occasional gap opens (2% chance)
    const hasGap = i > 0 && Math.random() < 0.02;
    const gapSize = hasGap ? (Math.random() - 0.45) * price * 0.005 : 0;

    const open = price + gapSize;
    const close = open + change;
    const wickUp = Math.random() * volatility * 0.5;
    const wickDown = Math.random() * volatility * 0.5;
    const high = Math.max(open, close) + wickUp;
    const low = Math.min(open, close) - wickDown;

    // Volume spikes on reversals
    const isReversal = i > 0 && candles.length > 0 && Math.sign(change) !== Math.sign(candles[candles.length - 1].close - candles[candles.length - 1].open);
    const volumeMultiplier = isReversal ? 1.5 + Math.random() * 2 : 1;
    const volume = (1000 + Math.random() * 5000) * volumeMultiplier;

    candles.push({ open, high, low, close, volume });
    price = close;
    trendDuration--;

    // Support/resistance bounce
    if (price < startPrice * 0.85) { trend = 1; trendStrength = 0.5; trendDuration = 8; prevVolatility = 0.005; }
    if (price > startPrice * 1.25) { trend = -1; trendStrength = 0.5; trendDuration = 8; prevVolatility = 0.005; }
  }
  return candles;
}

// Track volatility state across candles for clustering
let _prevVol = 0.003;

function generateNextCandle(candles: Candle[]): Candle {
  const last = candles[candles.length - 1];
  const price = last.close;

  // Calculate recent trend
  const recent = candles.slice(-10);
  const avgChange = recent.reduce((s, c) => s + (c.close - c.open), 0) / recent.length;
  const trendBias = Math.sign(avgChange) * 0.15;

  // Mean reversion
  const avg20 = candles.slice(-20).reduce((s, c) => s + c.close, 0) / Math.min(20, candles.length);
  const reversion = (avg20 - price) / price * 0.3;

  // Volatility clustering
  const volTarget = 0.003 + (Math.random() - 0.5) * 0.002;
  _prevVol = _prevVol * 0.7 + volTarget * 0.3;
  const volatility = price * Math.max(0.001, _prevVol);

  // Negative skew: down moves are sharper
  const direction = trendBias + reversion + (Math.random() - 0.48) * 0.4;
  const skew = direction < 0 ? 1.3 : 1.0;
  const drift = direction * volatility * skew;
  const noise = (Math.random() - 0.5) * volatility * 1.2;
  const change = drift + noise;

  // Occasional gap opens (1.5% chance per candle)
  const hasGap = Math.random() < 0.015;
  const gapSize = hasGap ? (Math.random() - 0.45) * price * 0.004 : 0;

  const open = price + gapSize;
  const close = open + change;
  const wickUp = Math.random() * volatility * 0.5;
  const wickDown = Math.random() * volatility * 0.5;

  // Volume spikes during trend reversals
  const prevChange = last.close - last.open;
  const isReversal = Math.sign(change) !== Math.sign(prevChange) && Math.abs(prevChange) > volatility * 0.3;
  const volumeMultiplier = isReversal ? 1.5 + Math.random() * 2.5 : 1;
  const volume = (1000 + Math.random() * 5000) * volumeMultiplier;

  return {
    open,
    high: Math.max(open, close) + wickUp,
    low: Math.min(open, close) - wickDown,
    close,
    volume,
  };
}

// --- Indicators ---
function calcSMA(candles: Candle[], period: number): (number | null)[] {
  return candles.map((_, i) => {
    if (i < period - 1) return null;
    const slice = candles.slice(i - period + 1, i + 1);
    return slice.reduce((s, c) => s + c.close, 0) / period;
  });
}

function calcRSI(candles: Candle[], period: number = 14): (number | null)[] {
  const rsi: (number | null)[] = [];
  let gains = 0, losses = 0;

  for (let i = 0; i < candles.length; i++) {
    if (i === 0) { rsi.push(null); continue; }
    const change = candles[i].close - candles[i - 1].close;
    if (i <= period) {
      if (change > 0) gains += change; else losses -= change;
      if (i === period) {
        const avgGain = gains / period;
        const avgLoss = losses / period;
        rsi.push(avgLoss === 0 ? 100 : 100 - 100 / (1 + avgGain / avgLoss));
      } else {
        rsi.push(null);
      }
    } else {
      const prevAvgGain = gains / period;
      const prevAvgLoss = losses / period;
      const currentGain = change > 0 ? change : 0;
      const currentLoss = change < 0 ? -change : 0;
      gains = prevAvgGain * (period - 1) + currentGain;
      losses = prevAvgLoss * (period - 1) + currentLoss;
      const avgGain = gains / period;
      const avgLoss = losses / period;
      rsi.push(avgLoss === 0 ? 100 : 100 - 100 / (1 + avgGain / avgLoss));
    }
  }
  return rsi;
}

// --- Position ---
interface Position {
  type: 'long' | 'short';
  entryPrice: number;
  size: number;
  entryIndex: number;
  stopLoss: number | null;
  takeProfit: number | null;
  trailingStop: boolean;
  trailingPct: number;
  trailingPrice: number | null; // current trailing stop price
  commission: number; // commission paid on entry
}

// --- Bid/Ask Spread ---
function calcSpread(price: number): { bid: number; ask: number; spreadPct: number } {
  const spreadPct = 0.0002 + Math.random() * 0.0003; // 0.02-0.05%
  const halfSpread = price * spreadPct / 2;
  return { bid: price - halfSpread, ask: price + halfSpread, spreadPct };
}

// --- Slippage ---
function calcSlippage(price: number, volatility: number): number {
  const baseSlip = Math.random() * 0.001; // 0-0.1%
  const volMultiplier = Math.min(2, volatility); // higher vol = more slippage
  return price * baseSlip * volMultiplier;
}

// --- Bollinger Bands ---
function calcBollingerBands(candles: Candle[], period: number = 20, stdDevMult: number = 2): { upper: (number | null)[]; middle: (number | null)[]; lower: (number | null)[] } {
  const upper: (number | null)[] = [];
  const middle: (number | null)[] = [];
  const lower: (number | null)[] = [];
  for (let i = 0; i < candles.length; i++) {
    if (i < period - 1) { upper.push(null); middle.push(null); lower.push(null); continue; }
    const slice = candles.slice(i - period + 1, i + 1);
    const mean = slice.reduce((s, c) => s + c.close, 0) / period;
    const variance = slice.reduce((s, c) => s + Math.pow(c.close - mean, 2), 0) / period;
    const stdDev = Math.sqrt(variance);
    middle.push(mean);
    upper.push(mean + stdDevMult * stdDev);
    lower.push(mean - stdDevMult * stdDev);
  }
  return { upper, middle, lower };
}

// --- VWAP ---
function calcVWAP(candles: Candle[]): (number | null)[] {
  let cumVolPrice = 0;
  let cumVol = 0;
  return candles.map((c) => {
    const typical = (c.high + c.low + c.close) / 3;
    cumVolPrice += typical * c.volume;
    cumVol += c.volume;
    return cumVol > 0 ? cumVolPrice / cumVol : null;
  });
}

// --- MACD ---
function calcEMA(values: number[], period: number): number[] {
  const k = 2 / (period + 1);
  const ema: number[] = [values[0]];
  for (let i = 1; i < values.length; i++) {
    ema.push(values[i] * k + ema[i - 1] * (1 - k));
  }
  return ema;
}

function calcMACD(candles: Candle[]): { macd: (number | null)[]; signal: (number | null)[]; histogram: (number | null)[] } {
  if (candles.length < 26) {
    const empty = candles.map(() => null);
    return { macd: empty, signal: empty, histogram: empty };
  }
  const closes = candles.map(c => c.close);
  const ema12 = calcEMA(closes, 12);
  const ema26 = calcEMA(closes, 26);
  const macdLine = ema12.map((v, i) => i < 25 ? null : v - ema26[i]);
  // Signal line: EMA(9) of MACD values starting from index 25
  const macdValues = macdLine.filter(v => v !== null) as number[];
  const signalValues = calcEMA(macdValues, 9);
  const signal: (number | null)[] = candles.map(() => null);
  const histogram: (number | null)[] = candles.map(() => null);
  for (let i = 0; i < signalValues.length; i++) {
    const idx = 25 + i;
    if (idx < candles.length) {
      signal[idx] = signalValues[i];
      const m = macdLine[idx];
      histogram[idx] = m !== null ? m - signalValues[i] : null;
    }
  }
  return { macd: macdLine, signal, histogram };
}

export function TradingSimScreen({ navigation, route }: { navigation: any; route: any }) {
  const insets = useSafeAreaInsets();
  const { skillName } = route.params;
  const updateAchievementStats = useStreakStore((s) => s.updateAchievementStats);
  const startPrice = skillName === 'Trading' ? 150 : 100;

  const [candles, setCandles] = useState<Candle[]>(() => generateInitialCandles(50, startPrice));
  const [balance, setBalance] = useState(STARTING_BALANCE);
  const [position, setPosition] = useState<Position | null>(null);
  const [pnl, setPnl] = useState(0);
  const [totalPnl, setTotalPnl] = useState(0);
  const [tradeCount, setTradeCount] = useState(0);
  const [winCount, setWinCount] = useState(0);
  const [isRunning, setIsRunning] = useState(false); // Start paused until state loaded
  const [showResult, setShowResult] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [failed, setFailed] = useState(false);
  const [stateLoaded, setStateLoaded] = useState(false);
  const [cooldownEnd, setCooldownEnd] = useState<number | null>(null);
  const [cooldownLeft, setCooldownLeft] = useState('');
  const [tradeAmountStr, setTradeAmountStr] = useState('');
  const [showOrderPanel, setShowOrderPanel] = useState(false);
  const [orderType, setOrderType] = useState<'long' | 'short'>('long');
  const [totalCommissions, setTotalCommissions] = useState(0);
  const [slPctStr, setSlPctStr] = useState('2');
  const [tpPctStr, setTpPctStr] = useState('4');
  const [useTrailingStop, setUseTrailingStop] = useState(false);
  const [trailingPctStr, setTrailingPctStr] = useState('1.5');
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const flashAnim = useRef(new Animated.Value(0)).current;
  const candlesGenerated = candles.length - 50;
  const timeRemaining = Math.max(0, SIM_DAY_CANDLES - candlesGenerated);
  const timeHours = Math.floor(timeRemaining / 60);
  const timeMinutes = timeRemaining % 60;

  // Save state to AsyncStorage
  const saveState = useCallback(async () => {
    const state = {
      candles: candles.slice(-60), // Keep last 60 candles to save space
      balance, totalPnl, tradeCount, winCount,
      position, candlesGenerated, totalCommissions,
    };
    await AsyncStorage.setItem(SIM_STATE_KEY, JSON.stringify(state));
  }, [candles, balance, totalPnl, tradeCount, winCount, position, candlesGenerated, totalCommissions]);

  // Load saved state on mount
  useEffect(() => {
    (async () => {
      // Check cooldown first
      const cooldownStr = await AsyncStorage.getItem(SIM_COOLDOWN_KEY);
      if (cooldownStr) {
        const endTime = parseInt(cooldownStr, 10);
        if (Date.now() < endTime) {
          setCooldownEnd(endTime);
          setStateLoaded(true);
          return;
        } else {
          await AsyncStorage.removeItem(SIM_COOLDOWN_KEY);
        }
      }

      // Try to restore saved session
      const saved = await AsyncStorage.getItem(SIM_STATE_KEY);
      if (saved) {
        try {
          const state = JSON.parse(saved);
          if (state.candles && state.candles.length > 0) {
            setCandles(state.candles);
            setBalance(state.balance || STARTING_BALANCE);
            setTotalPnl(state.totalPnl || 0);
            setTradeCount(state.tradeCount || 0);
            setWinCount(state.winCount || 0);
            setTotalCommissions(state.totalCommissions || 0);
            if (state.position) setPosition(state.position);
          }
        } catch (e) { console.warn('Parse saved trading state failed:', e); }
      }
      setStateLoaded(true);
      setIsRunning(true);
    })();
  }, []);

  // Cooldown timer
  useEffect(() => {
    if (!cooldownEnd) return;
    const interval = setInterval(() => {
      const remaining = cooldownEnd - Date.now();
      if (remaining <= 0) {
        setCooldownEnd(null);
        AsyncStorage.removeItem(SIM_COOLDOWN_KEY);
        AsyncStorage.removeItem(SIM_STATE_KEY);
        // Reset everything
        setCandles(generateInitialCandles(50, startPrice));
        setBalance(STARTING_BALANCE);
        setPosition(null);
        setPnl(0);
        setTotalPnl(0);
        setTradeCount(0);
        setWinCount(0);
        setTotalCommissions(0);
        setFailed(false);
        setIsRunning(true);
        clearInterval(interval);
      } else {
        const mins = Math.floor(remaining / 60000);
        const secs = Math.floor((remaining % 60000) / 1000);
        setCooldownLeft(`${mins}:${secs.toString().padStart(2, '0')}`);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldownEnd]);

  // Auto-save on navigation away
  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', () => {
      if (isRunning && !showResult && !failed) {
        saveState();
      }
    });
    return unsubscribe;
  }, [navigation, isRunning, showResult, failed, saveState]);

  // Current price & bid/ask spread
  const currentPrice = candles.length > 0 ? candles[candles.length - 1].close : startPrice;
  const { bid: bidPrice, ask: askPrice } = calcSpread(currentPrice);

  // Recent volatility for slippage calc
  const recentVol = candles.length >= 5
    ? candles.slice(-5).reduce((s, c) => s + Math.abs(c.close - c.open) / c.open, 0) / 5 * 100
    : 1;

  // Update unrealized PnL + trailing stop + SL/TP auto-close
  useEffect(() => {
    if (!position) { setPnl(0); return; }
    const unrealized = position.type === 'long'
      ? (currentPrice - position.entryPrice) * position.size
      : (position.entryPrice - currentPrice) * position.size;
    setPnl(unrealized);

    // Update trailing stop
    if (position.trailingStop && position.trailingPrice !== null) {
      const trailDist = position.entryPrice * position.trailingPct / 100;
      let newTrail = position.trailingPrice;
      if (position.type === 'long') {
        const candidate = currentPrice - trailDist;
        if (candidate > newTrail) newTrail = candidate;
      } else {
        const candidate = currentPrice + trailDist;
        if (candidate < newTrail) newTrail = candidate;
      }
      if (newTrail !== position.trailingPrice) {
        setPosition(prev => prev ? { ...prev, trailingPrice: newTrail } : null);
      }
    }

    // Check SL/TP/Trailing Stop hits
    let shouldClose = false;
    if (position.stopLoss !== null) {
      if (position.type === 'long' && currentPrice <= position.stopLoss) shouldClose = true;
      if (position.type === 'short' && currentPrice >= position.stopLoss) shouldClose = true;
    }
    if (position.takeProfit !== null) {
      if (position.type === 'long' && currentPrice >= position.takeProfit) shouldClose = true;
      if (position.type === 'short' && currentPrice <= position.takeProfit) shouldClose = true;
    }
    if (position.trailingStop && position.trailingPrice !== null) {
      if (position.type === 'long' && currentPrice <= position.trailingPrice) shouldClose = true;
      if (position.type === 'short' && currentPrice >= position.trailingPrice) shouldClose = true;
    }

    if (shouldClose) {
      // Auto-close with exit commission
      const exitCommission = position.size * COMMISSION_PER_SHARE;
      const realized = position.type === 'long'
        ? (currentPrice - position.entryPrice) * position.size - exitCommission
        : (position.entryPrice - currentPrice) * position.size - exitCommission;
      setBalance(prev => prev + realized);
      setTotalPnl(prev => prev + realized);
      setTotalCommissions(prev => prev + exitCommission);
      setTradeCount(prev => prev + 1);
      if (realized > 0) setWinCount(prev => prev + 1);
      setPosition(null);
      setPnl(0);
      updateAchievementStats({ tradeCount: tradeCount + 1 });
      try {
        Haptics.notificationAsync(
          realized >= 0
            ? Haptics.NotificationFeedbackType.Success
            : Haptics.NotificationFeedbackType.Error
        );
      } catch {}
    }
  }, [currentPrice, position]);

  // Track when app goes to background to catch up on missed candles
  const lastTickTime = useRef(Date.now());

  useEffect(() => {
    if (!isRunning) return;
    const sub = require('react-native').AppState.addEventListener('change', (state: string) => {
      if (state === 'active' && isRunning) {
        // Calculate how many candles were missed while in background
        const elapsed = Date.now() - lastTickTime.current;
        const missedCandles = Math.floor(elapsed / (TICK_MS / speed));
        if (missedCandles > 1) {
          setCandles(prev => {
            let updated = [...prev];
            const toGenerate = missedCandles - 1;
            for (let i = 0; i < toGenerate; i++) {
              updated = [...updated, generateNextCandle(updated)];
            }
            return updated;
          });
        }
        lastTickTime.current = Date.now();
      }
    });
    return () => sub.remove();
  }, [isRunning, speed]);

  // Tick — add new candle
  useEffect(() => {
    if (!isRunning) return;
    tickRef.current = setInterval(() => {
      lastTickTime.current = Date.now();
      setCandles(prev => {
        const next = generateNextCandle(prev);
        return [...prev, next];
      });
    }, TICK_MS / speed);
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, [isRunning, speed]);

  // Check win/lose condition
  useEffect(() => {
    if (totalPnl + pnl >= TARGET_PROFIT && !showResult && !failed) {
      setIsRunning(false);
      setShowResult(true);
      AsyncStorage.removeItem(SIM_STATE_KEY);
      AsyncStorage.removeItem(SIM_COOLDOWN_KEY);
      try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch {}
      // Track trading achievement: profit target reached
      updateAchievementStats({ tradingProfitReached: true });
    }
    if (timeRemaining <= 0 && totalPnl + pnl < TARGET_PROFIT && !showResult && !failed) {
      // Auto-close position if open
      if (position) {
        const exitComm = position.size * COMMISSION_PER_SHARE;
        const realized = position.type === 'long'
          ? (currentPrice - position.entryPrice) * position.size - exitComm
          : (position.entryPrice - currentPrice) * position.size - exitComm;
        setBalance(prev => prev + realized);
        setTotalPnl(prev => prev + realized);
        setTotalCommissions(prev => prev + exitComm);
        setPosition(null);
      }
      setIsRunning(false);
      setFailed(true);
      // Set 10 minute cooldown
      const cooldown = Date.now() + 10 * 60 * 1000;
      setCooldownEnd(cooldown);
      AsyncStorage.setItem(SIM_COOLDOWN_KEY, String(cooldown));
      AsyncStorage.removeItem(SIM_STATE_KEY);
      try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error); } catch {}
    }
  }, [totalPnl, pnl, timeRemaining]);

  const parsedAmount = parseFloat(tradeAmountStr) || 0;
  const execPrice = orderType === 'long' ? askPrice : bidPrice;
  const shares = parsedAmount > 0 ? Math.floor(parsedAmount / execPrice) : 0;
  const estimatedCommission = shares * COMMISSION_PER_SHARE;

  const handleBuy = useCallback(() => {
    if (position) return;
    setOrderType('long');
    setTradeAmountStr(Math.floor(balance * 0.5).toString());
    setShowOrderPanel(true);
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch {}
  }, [position, balance]);

  const handleSell = useCallback(() => {
    if (position) return;
    setOrderType('short');
    setTradeAmountStr(Math.floor(balance * 0.5).toString());
    setShowOrderPanel(true);
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch {}
  }, [position, balance]);

  const handleConfirmOrder = useCallback(() => {
    const amount = parseFloat(tradeAmountStr) || 0;
    if (amount <= 0 || amount > balance) return;

    // Bid/ask: buy at ask, sell at bid
    const baseExecPrice = orderType === 'long' ? askPrice : bidPrice;

    // Slippage
    const slip = calcSlippage(baseExecPrice, recentVol);
    const fillPrice = orderType === 'long' ? baseExecPrice + slip : baseExecPrice - slip;

    const size = Math.floor(amount / fillPrice);
    if (size <= 0) return;

    // Commission on entry
    const commission = size * COMMISSION_PER_SHARE;
    setBalance(prev => prev - commission);
    setTotalCommissions(prev => prev + commission);

    // Calculate SL/TP
    const slPct = parseFloat(slPctStr) || 0;
    const tpPct = parseFloat(tpPctStr) || 0;
    let sl: number | null = null;
    let tp: number | null = null;
    if (slPct > 0) {
      sl = orderType === 'long' ? fillPrice * (1 - slPct / 100) : fillPrice * (1 + slPct / 100);
    }
    if (tpPct > 0) {
      tp = orderType === 'long' ? fillPrice * (1 + tpPct / 100) : fillPrice * (1 - tpPct / 100);
    }

    // Trailing stop
    const trailPct = parseFloat(trailingPctStr) || 1.5;
    const trailDist = fillPrice * trailPct / 100;
    let trailingPrice: number | null = null;
    if (useTrailingStop) {
      trailingPrice = orderType === 'long' ? fillPrice - trailDist : fillPrice + trailDist;
    }

    setPosition({
      type: orderType,
      entryPrice: fillPrice,
      size,
      entryIndex: candles.length - 1,
      stopLoss: sl,
      takeProfit: tp,
      trailingStop: useTrailingStop,
      trailingPct: trailPct,
      trailingPrice,
      commission,
    });
    setShowOrderPanel(false);
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); } catch {}
    if (orderType === 'long') flashGreen(); else flashRed();
  }, [tradeAmountStr, balance, askPrice, bidPrice, recentVol, orderType, candles.length, slPctStr, tpPctStr, useTrailingStop, trailingPctStr]);

  const handleClose = useCallback(() => {
    if (!position) return;
    // Close at bid (long) or ask (short) + slippage
    const baseClose = position.type === 'long' ? bidPrice : askPrice;
    const slip = calcSlippage(baseClose, recentVol);
    const closePrice = position.type === 'long' ? baseClose - slip : baseClose + slip;

    // Exit commission
    const exitCommission = position.size * COMMISSION_PER_SHARE;
    const realized = position.type === 'long'
      ? (closePrice - position.entryPrice) * position.size - exitCommission
      : (position.entryPrice - closePrice) * position.size - exitCommission;
    setBalance(prev => prev + realized);
    setTotalPnl(prev => prev + realized);
    setTotalCommissions(prev => prev + exitCommission);
    setTradeCount(prev => prev + 1);
    if (realized > 0) setWinCount(prev => prev + 1);
    setPosition(null);
    setPnl(0);
    updateAchievementStats({ tradeCount: tradeCount + 1 });
    try {
      Haptics.notificationAsync(
        realized >= 0
          ? Haptics.NotificationFeedbackType.Success
          : Haptics.NotificationFeedbackType.Error
      );
    } catch {}
  }, [position, bidPrice, askPrice, recentVol]);

  const flashGreen = () => {
    flashAnim.setValue(1);
    Animated.timing(flashAnim, { toValue: 0, duration: 300, useNativeDriver: true }).start();
  };

  const flashRed = () => {
    flashAnim.setValue(-1);
    Animated.timing(flashAnim, { toValue: 0, duration: 300, useNativeDriver: true }).start();
  };

  // --- Rendering ---
  const visibleCandles = candles.slice(-MAX_VISIBLE_CANDLES);
  const allPrices = visibleCandles.flatMap(c => [c.high, c.low]);
  const minPrice = Math.min(...allPrices);
  const maxPrice = Math.max(...allPrices);
  const priceRange = maxPrice - minPrice || 1;

  const chartInnerW = CHART_WIDTH - PAD.left - PAD.right;
  const chartInnerH = CHART_HEIGHT - PAD.top - PAD.bottom;
  const candleW = chartInnerW / MAX_VISIBLE_CANDLES;

  const priceToY = (p: number) => PAD.top + (1 - (p - minPrice) / priceRange) * chartInnerH;
  const indexToX = (i: number) => PAD.left + i * candleW + candleW / 2;

  // SMA
  const sma20All = calcSMA(candles, 20);
  const sma50All = calcSMA(candles, 50);
  const sma20 = sma20All.slice(-MAX_VISIBLE_CANDLES);
  const sma50 = sma50All.slice(-MAX_VISIBLE_CANDLES);

  // RSI
  const rsiAll = calcRSI(candles);
  const rsiVisible = rsiAll.slice(-MAX_VISIBLE_CANDLES);

  // Bollinger Bands
  const bbAll = calcBollingerBands(candles);
  const bbUpper = bbAll.upper.slice(-MAX_VISIBLE_CANDLES);
  const bbLower = bbAll.lower.slice(-MAX_VISIBLE_CANDLES);

  // VWAP
  const vwapAll = calcVWAP(candles);
  const vwapVisible = vwapAll.slice(-MAX_VISIBLE_CANDLES);

  // MACD
  const macdAll = calcMACD(candles);
  const macdVisible = macdAll.macd.slice(-MAX_VISIBLE_CANDLES);
  const signalVisible = macdAll.signal.slice(-MAX_VISIBLE_CANDLES);
  const histogramVisible = macdAll.histogram.slice(-MAX_VISIBLE_CANDLES);

  // SMA path helper
  const buildSMAPath = (sma: (number | null)[]) => {
    let d = '';
    sma.forEach((v, i) => {
      if (v === null) return;
      const x = indexToX(i);
      const y = priceToY(v);
      d += d === '' ? `M${x},${y}` : ` L${x},${y}`;
    });
    return d;
  };

  // RSI path
  const rsiToY = (v: number) => 5 + (1 - v / 100) * (INDICATOR_HEIGHT - 10);
  const buildRSIPath = () => {
    let d = '';
    rsiVisible.forEach((v, i) => {
      if (v === null) return;
      const x = indexToX(i);
      const y = rsiToY(v);
      d += d === '' ? `M${x},${y}` : ` L${x},${y}`;
    });
    return d;
  };

  // Bollinger Bands paths
  const buildBBPath = (band: (number | null)[]) => {
    let d = '';
    band.forEach((v, i) => {
      if (v === null) return;
      const x = indexToX(i);
      const y = priceToY(v);
      d += d === '' ? `M${x},${y}` : ` L${x},${y}`;
    });
    return d;
  };

  // BB fill area (upper -> lower reversed for fill)
  const buildBBFillPath = () => {
    const upperPoints: string[] = [];
    const lowerPoints: string[] = [];
    bbUpper.forEach((v, i) => {
      if (v === null || bbLower[i] === null) return;
      const x = indexToX(i);
      upperPoints.push(`${x},${priceToY(v)}`);
      lowerPoints.push(`${x},${priceToY(bbLower[i]!)}`);
    });
    if (upperPoints.length < 2) return '';
    return `M${upperPoints.join(' L')} L${lowerPoints.reverse().join(' L')} Z`;
  };

  // VWAP path
  const buildVWAPPath = () => {
    let d = '';
    vwapVisible.forEach((v, i) => {
      if (v === null) return;
      const x = indexToX(i);
      const y = priceToY(v);
      d += d === '' ? `M${x},${y}` : ` L${x},${y}`;
    });
    return d;
  };

  // MACD paths
  const macdValues = [...macdVisible, ...signalVisible, ...histogramVisible].filter(v => v !== null) as number[];
  const macdMin = macdValues.length > 0 ? Math.min(...macdValues) : -1;
  const macdMax = macdValues.length > 0 ? Math.max(...macdValues) : 1;
  const macdRange = Math.max(macdMax - macdMin, 0.01);
  const macdToY = (v: number) => 5 + (1 - (v - macdMin) / macdRange) * (MACD_HEIGHT - 10);
  const macdZeroY = macdToY(0);

  const buildMACDPath = (data: (number | null)[]) => {
    let d = '';
    data.forEach((v, i) => {
      if (v === null) return;
      const x = indexToX(i);
      const y = macdToY(v);
      d += d === '' ? `M${x},${y}` : ` L${x},${y}`;
    });
    return d;
  };

  const totalEquity = balance + pnl;
  const totalPnlDisplay = totalPnl + pnl;
  const progressPct = Math.min(100, Math.max(0, (totalPnlDisplay / TARGET_PROFIT) * 100));

  // Fail screen
  if (failed) {
    return (
      <SafeAreaView style={styles.screen} edges={['top']}>
        <View style={styles.resultContainer}>
          <Text style={{ fontSize: 60, marginBottom: 16 }}>💀</Text>
          <Text style={styles.resultTitle}>Market Closed</Text>
          <Text style={styles.resultSub}>
            You didn't reach ${TARGET_PROFIT.toLocaleString()} in time
          </Text>
          <View style={styles.resultStats}>
            <View style={styles.resultStatRow}>
              <Text style={styles.resultStatLabel}>Final P&L</Text>
              <Text style={[styles.resultStatValue, { color: totalPnlDisplay >= 0 ? colors.success : colors.error }]}>
                {totalPnlDisplay >= 0 ? '+' : ''}${totalPnlDisplay.toFixed(0)}
              </Text>
            </View>
            <View style={styles.resultStatRow}>
              <Text style={styles.resultStatLabel}>Target</Text>
              <Text style={styles.resultStatValue}>+${TARGET_PROFIT.toLocaleString()}</Text>
            </View>
            <View style={styles.resultStatRow}>
              <Text style={styles.resultStatLabel}>Trades</Text>
              <Text style={styles.resultStatValue}>{tradeCount}</Text>
            </View>
            <View style={styles.resultStatRow}>
              <Text style={styles.resultStatLabel}>Win Rate</Text>
              <Text style={styles.resultStatValue}>
                {tradeCount > 0 ? Math.round((winCount / tradeCount) * 100) : 0}%
              </Text>
            </View>
            <View style={styles.resultStatRow}>
              <Text style={styles.resultStatLabel}>Commissions Paid</Text>
              <Text style={[styles.resultStatValue, { color: colors.error }]}>
                -${totalCommissions.toFixed(2)}
              </Text>
            </View>
          </View>
          {cooldownEnd && Date.now() < cooldownEnd ? (
            <View style={styles.cooldownBox}>
              <Ionicons name="time-outline" size={24} color={colors.textSecondary} />
              <Text style={styles.cooldownText}>Try again in {cooldownLeft}</Text>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.resultBtn}
              onPress={() => {
                AsyncStorage.removeItem(SIM_COOLDOWN_KEY);
                AsyncStorage.removeItem(SIM_STATE_KEY);
                setCandles(generateInitialCandles(50, startPrice));
                setBalance(STARTING_BALANCE);
                setPosition(null);
                setPnl(0);
                setTotalPnl(0);
                setTradeCount(0);
                setWinCount(0);
                setTotalCommissions(0);
                setFailed(false);
                setCooldownEnd(null);
                setIsRunning(true);
              }}
            >
              <LinearGradient
                colors={[colors.primary, '#E55A2B']}
                style={styles.resultBtnGradient}
              >
                <Text style={styles.resultBtnText}>Try Again</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={{ marginTop: 16 }}
            onPress={() => navigation.goBack()}
          >
            <Text style={{ color: colors.textSecondary, fontSize: 14 }}>Back to lessons</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Cooldown screen (came back while on cooldown)
  if (cooldownEnd && Date.now() < cooldownEnd) {
    return (
      <SafeAreaView style={styles.screen} edges={['top']}>
        <View style={styles.resultContainer}>
          <Text style={{ fontSize: 60, marginBottom: 16 }}>⏰</Text>
          <Text style={styles.resultTitle}>Market Closed</Text>
          <Text style={styles.resultSub}>Wait for the market to reopen</Text>
          <View style={styles.cooldownBox}>
            <Ionicons name="time-outline" size={28} color={colors.primary} />
            <Text style={styles.cooldownTimer}>{cooldownLeft}</Text>
          </View>
          <TouchableOpacity
            style={{ marginTop: 24 }}
            onPress={() => navigation.goBack()}
          >
            <Text style={{ color: colors.textSecondary, fontSize: 14 }}>Back to lessons</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Win screen
  if (showResult) {
    return (
      <SafeAreaView style={styles.screen} edges={['top']}>
        <View style={styles.resultContainer}>
          <Text style={{ fontSize: 60, marginBottom: 16 }}>🏆</Text>
          <Text style={styles.resultTitle}>Master Trader!</Text>
          <Text style={styles.resultSub}>
            You made ${TARGET_PROFIT.toLocaleString()} profit!
          </Text>
          <View style={styles.resultStats}>
            <View style={styles.resultStatRow}>
              <Text style={styles.resultStatLabel}>Final Balance</Text>
              <Text style={styles.resultStatValue}>${totalEquity.toLocaleString(undefined, { maximumFractionDigits: 0 })}</Text>
            </View>
            <View style={styles.resultStatRow}>
              <Text style={styles.resultStatLabel}>Total P&L</Text>
              <Text style={[styles.resultStatValue, { color: colors.success }]}>
                +${totalPnlDisplay.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </Text>
            </View>
            <View style={styles.resultStatRow}>
              <Text style={styles.resultStatLabel}>Trades</Text>
              <Text style={styles.resultStatValue}>{tradeCount}</Text>
            </View>
            <View style={styles.resultStatRow}>
              <Text style={styles.resultStatLabel}>Win Rate</Text>
              <Text style={styles.resultStatValue}>
                {tradeCount > 0 ? Math.round((winCount / tradeCount) * 100) : 0}%
              </Text>
            </View>
            <View style={styles.resultStatRow}>
              <Text style={styles.resultStatLabel}>Commissions Paid</Text>
              <Text style={[styles.resultStatValue, { color: colors.error }]}>
                -${totalCommissions.toFixed(2)}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.resultBtn}
            onPress={() => navigation.goBack()}
          >
            <LinearGradient
              colors={[colors.primary, '#E55A2B']}
              style={styles.resultBtnGradient}
            >
              <Text style={styles.resultBtnText}>Complete</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      {/* Flash overlay */}
      <Animated.View
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFill,
          {
            backgroundColor: flashAnim.interpolate({
              inputRange: [-1, 0, 1],
              outputRange: ['rgba(239,68,68,0.15)', 'transparent', 'rgba(52,211,153,0.15)'],
            }),
            opacity: flashAnim.interpolate({
              inputRange: [-1, 0, 1],
              outputRange: [1, 0, 1],
            }),
            zIndex: 100,
          },
        ]}
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={26} color={colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.ticker}>SIM/USD</Text>
          <Text style={[styles.price, { color: visibleCandles.length > 1 && visibleCandles[visibleCandles.length - 1].close >= visibleCandles[visibleCandles.length - 2].close ? colors.success : colors.error }]}>
            ${currentPrice.toFixed(2)}
          </Text>
          <View style={styles.bidAskRow}>
            <Text style={styles.bidText}>B: {bidPrice.toFixed(2)}</Text>
            <Text style={styles.askText}>A: {askPrice.toFixed(2)}</Text>
          </View>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={[styles.timerText, timeRemaining < 60 ? { color: colors.error } : null]}>
            ⏰ {timeHours}h {timeMinutes.toString().padStart(2, '0')}m
          </Text>
          <Text style={styles.speedBtn}>1x</Text>
        </View>
      </View>

      {/* Progress bar to $10K */}
      <View style={styles.progressRow}>
        <Text style={styles.progressLabel}>Progress: ${Math.max(0, totalPnlDisplay).toFixed(0)} / ${TARGET_PROFIT.toLocaleString()}</Text>
        <View style={styles.progressBar}>
          <LinearGradient
            colors={[colors.primary, colors.success]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.progressFill, { width: `${progressPct}%` }]}
          />
        </View>
      </View>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {/* Candlestick Chart */}
        <View style={styles.chartContainer}>
          <Svg width={CHART_WIDTH} height={CHART_HEIGHT}>
            <Rect x={0} y={0} width={CHART_WIDTH} height={CHART_HEIGHT} fill="#0d0d12" rx={8} />

            {/* Grid lines */}
            {[0.25, 0.5, 0.75].map(pct => {
              const p = minPrice + priceRange * pct;
              const y = priceToY(p);
              return (
                <G key={pct}>
                  <Line x1={PAD.left} y1={y} x2={CHART_WIDTH - PAD.right} y2={y} stroke="rgba(255,255,255,0.05)" strokeWidth={0.5} />
                  <SvgText x={CHART_WIDTH - PAD.right + 4} y={y + 3} fill="rgba(255,255,255,0.35)" fontSize={9} fontWeight="500">
                    {p.toFixed(2)}
                  </SvgText>
                </G>
              );
            })}

            {/* Bollinger Bands fill */}
            {bbUpper.some(v => v !== null) && buildBBFillPath() !== '' && (
              <Path d={buildBBFillPath()} fill="rgba(100,130,255,0.06)" stroke="none" />
            )}
            {/* Bollinger Bands lines */}
            {bbUpper.some(v => v !== null) && (
              <Path d={buildBBPath(bbUpper)} stroke="rgba(100,130,255,0.35)" strokeWidth={0.8} fill="none" />
            )}
            {bbLower.some(v => v !== null) && (
              <Path d={buildBBPath(bbLower)} stroke="rgba(100,130,255,0.35)" strokeWidth={0.8} fill="none" />
            )}

            {/* SMA lines */}
            {sma50.some(v => v !== null) && (
              <Path d={buildSMAPath(sma50)} stroke="#6C63FF" strokeWidth={1} fill="none" opacity={0.6} />
            )}
            {sma20.some(v => v !== null) && (
              <Path d={buildSMAPath(sma20)} stroke="#F59E0B" strokeWidth={1} fill="none" opacity={0.7} />
            )}

            {/* VWAP line */}
            {vwapVisible.some(v => v !== null) && (
              <Path d={buildVWAPPath()} stroke="#A855F7" strokeWidth={1.2} fill="none" strokeDasharray="4,3" opacity={0.7} />
            )}

            {/* Candles */}
            {visibleCandles.map((c, i) => {
              const x = indexToX(i);
              const isGreen = c.close >= c.open;
              const color = isGreen ? '#34D399' : '#EF4444';
              const bodyTop = priceToY(Math.max(c.open, c.close));
              const bodyBottom = priceToY(Math.min(c.open, c.close));
              const bodyHeight = Math.max(1, bodyBottom - bodyTop);
              const wickTop = priceToY(c.high);
              const wickBottom = priceToY(c.low);

              return (
                <G key={i}>
                  <Line x1={x} y1={wickTop} x2={x} y2={wickBottom} stroke={color} strokeWidth={1} />
                  <Rect
                    x={x - candleW * 0.35}
                    y={bodyTop}
                    width={candleW * 0.7}
                    height={bodyHeight}
                    fill={color}
                    rx={1}
                  />
                </G>
              );
            })}

            {/* Position entry line */}
            {position && (
              <G>
                <Line
                  x1={PAD.left}
                  y1={priceToY(position.entryPrice)}
                  x2={CHART_WIDTH - PAD.right}
                  y2={priceToY(position.entryPrice)}
                  stroke={position.type === 'long' ? colors.success : colors.error}
                  strokeWidth={1}
                  strokeDasharray="4,4"
                  opacity={0.8}
                />
                <SvgText
                  x={PAD.left + 4}
                  y={priceToY(position.entryPrice) - 4}
                  fill={position.type === 'long' ? colors.success : colors.error}
                  fontSize={9}
                  fontWeight="700"
                >
                  {position.type === 'long' ? 'BUY' : 'SELL'} @ {position.entryPrice.toFixed(2)}
                </SvgText>

                {/* Stop Loss line */}
                {position.stopLoss !== null && (
                  <G>
                    <Line
                      x1={PAD.left}
                      y1={priceToY(position.stopLoss)}
                      x2={CHART_WIDTH - PAD.right}
                      y2={priceToY(position.stopLoss)}
                      stroke="#EF4444"
                      strokeWidth={1}
                      strokeDasharray="3,3"
                      opacity={0.7}
                    />
                    <SvgText x={PAD.left + 4} y={priceToY(position.stopLoss) - 3} fill="#EF4444" fontSize={8} fontWeight="600">
                      SL {position.stopLoss.toFixed(2)}
                    </SvgText>
                  </G>
                )}

                {/* Take Profit line */}
                {position.takeProfit !== null && (
                  <G>
                    <Line
                      x1={PAD.left}
                      y1={priceToY(position.takeProfit)}
                      x2={CHART_WIDTH - PAD.right}
                      y2={priceToY(position.takeProfit)}
                      stroke="#34D399"
                      strokeWidth={1}
                      strokeDasharray="3,3"
                      opacity={0.7}
                    />
                    <SvgText x={PAD.left + 4} y={priceToY(position.takeProfit) - 3} fill="#34D399" fontSize={8} fontWeight="600">
                      TP {position.takeProfit.toFixed(2)}
                    </SvgText>
                  </G>
                )}

                {/* Trailing Stop line */}
                {position.trailingStop && position.trailingPrice !== null && (
                  <G>
                    <Line
                      x1={PAD.left}
                      y1={priceToY(position.trailingPrice)}
                      x2={CHART_WIDTH - PAD.right}
                      y2={priceToY(position.trailingPrice)}
                      stroke="#F59E0B"
                      strokeWidth={1}
                      strokeDasharray="2,4"
                      opacity={0.6}
                    />
                    <SvgText x={PAD.left + 4} y={priceToY(position.trailingPrice) - 3} fill="#F59E0B" fontSize={8} fontWeight="600">
                      TRAIL {position.trailingPrice.toFixed(2)}
                    </SvgText>
                  </G>
                )}
              </G>
            )}

            {/* Current price line */}
            <Line
              x1={PAD.left}
              y1={priceToY(currentPrice)}
              x2={CHART_WIDTH - PAD.right}
              y2={priceToY(currentPrice)}
              stroke="rgba(255,255,255,0.3)"
              strokeWidth={0.5}
              strokeDasharray="2,2"
            />
          </Svg>

          {/* Legend */}
          <View style={styles.legend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#F59E0B' }]} />
              <Text style={styles.legendText}>SMA 20</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#6C63FF' }]} />
              <Text style={styles.legendText}>SMA 50</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: 'rgba(100,130,255,0.5)' }]} />
              <Text style={styles.legendText}>BB</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#A855F7' }]} />
              <Text style={styles.legendText}>VWAP</Text>
            </View>
          </View>
        </View>

        {/* RSI Indicator */}
        <View style={styles.indicatorContainer}>
          <Text style={styles.indicatorLabel}>RSI (14)</Text>
          <Svg width={CHART_WIDTH} height={INDICATOR_HEIGHT}>
            <Rect x={0} y={0} width={CHART_WIDTH} height={INDICATOR_HEIGHT} fill="#0d0d12" rx={6} />
            {/* Overbought/oversold lines */}
            <Line x1={PAD.left} y1={rsiToY(70)} x2={CHART_WIDTH - PAD.right} y2={rsiToY(70)} stroke="rgba(239,68,68,0.3)" strokeWidth={0.5} strokeDasharray="3,3" />
            <Line x1={PAD.left} y1={rsiToY(30)} x2={CHART_WIDTH - PAD.right} y2={rsiToY(30)} stroke="rgba(52,211,153,0.3)" strokeWidth={0.5} strokeDasharray="3,3" />
            <SvgText x={CHART_WIDTH - PAD.right + 4} y={rsiToY(70) + 3} fill="rgba(239,68,68,0.5)" fontSize={8}>70</SvgText>
            <SvgText x={CHART_WIDTH - PAD.right + 4} y={rsiToY(30) + 3} fill="rgba(52,211,153,0.5)" fontSize={8}>30</SvgText>
            {/* RSI line */}
            <Path d={buildRSIPath()} stroke="#EC4899" strokeWidth={1.5} fill="none" />
          </Svg>
        </View>

        {/* MACD Indicator */}
        <View style={styles.indicatorContainer}>
          <Text style={styles.indicatorLabel}>MACD (12,26,9)</Text>
          <Svg width={CHART_WIDTH} height={MACD_HEIGHT}>
            <Rect x={0} y={0} width={CHART_WIDTH} height={MACD_HEIGHT} fill="#0d0d12" rx={6} />
            {/* Zero line */}
            <Line x1={PAD.left} y1={macdZeroY} x2={CHART_WIDTH - PAD.right} y2={macdZeroY} stroke="rgba(255,255,255,0.1)" strokeWidth={0.5} />
            <SvgText x={CHART_WIDTH - PAD.right + 4} y={macdZeroY + 3} fill="rgba(255,255,255,0.3)" fontSize={8}>0</SvgText>
            {/* Histogram */}
            {histogramVisible.map((v, i) => {
              if (v === null) return null;
              const x = indexToX(i);
              const barH = Math.abs(macdToY(0) - macdToY(v));
              const barY = v >= 0 ? macdToY(v) : macdToY(0);
              return (
                <Rect
                  key={`h${i}`}
                  x={x - candleW * 0.3}
                  y={barY}
                  width={candleW * 0.6}
                  height={Math.max(0.5, barH)}
                  fill={v >= 0 ? 'rgba(52,211,153,0.5)' : 'rgba(239,68,68,0.5)'}
                  rx={1}
                />
              );
            })}
            {/* MACD line */}
            <Path d={buildMACDPath(macdVisible)} stroke="#3B82F6" strokeWidth={1.2} fill="none" />
            {/* Signal line */}
            <Path d={buildMACDPath(signalVisible)} stroke="#F97316" strokeWidth={1.2} fill="none" />
          </Svg>
        </View>

        {/* Portfolio Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Balance</Text>
            <Text style={styles.statValue}>${balance.toFixed(0)}</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Open P&L</Text>
            <Text style={[styles.statValue, { color: pnl >= 0 ? colors.success : colors.error }]}>
              {pnl >= 0 ? '+' : ''}{pnl.toFixed(0)}
            </Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Total P&L</Text>
            <Text style={[styles.statValue, { color: totalPnlDisplay >= 0 ? colors.success : colors.error }]}>
              {totalPnlDisplay >= 0 ? '+' : ''}{totalPnlDisplay.toFixed(0)}
            </Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Trades</Text>
            <Text style={styles.statValue}>{tradeCount}</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Fees</Text>
            <Text style={[styles.statValue, { color: totalCommissions > 0 ? colors.error : colors.textPrimary, fontSize: 11 }]}>
              ${totalCommissions.toFixed(2)}
            </Text>
          </View>
        </View>

        {/* Position info */}
        {position && (
          <View style={styles.positionBar}>
            <View style={styles.positionInfo}>
              <Text style={[styles.positionType, { color: position.type === 'long' ? colors.success : colors.error }]}>
                {position.type === 'long' ? '▲ LONG' : '▼ SHORT'}
              </Text>
              <Text style={styles.positionDetail}>
                {position.size} shares @ ${position.entryPrice.toFixed(2)}
              </Text>
              <View style={{ flexDirection: 'row', gap: 8, marginTop: 2 }}>
                {position.stopLoss !== null && (
                  <Text style={{ fontSize: 9, color: '#EF4444', fontWeight: '600' }}>SL: {position.stopLoss.toFixed(2)}</Text>
                )}
                {position.takeProfit !== null && (
                  <Text style={{ fontSize: 9, color: '#34D399', fontWeight: '600' }}>TP: {position.takeProfit.toFixed(2)}</Text>
                )}
                {position.trailingStop && position.trailingPrice !== null && (
                  <Text style={{ fontSize: 9, color: '#F59E0B', fontWeight: '600' }}>Trail: {position.trailingPrice.toFixed(2)}</Text>
                )}
              </View>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={handleClose}>
              <Text style={styles.closeBtnText}>CLOSE</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Order Panel */}
      {showOrderPanel && (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.orderPanel}>
            <View style={styles.orderHeader}>
              <Text style={[styles.orderTitle, { color: orderType === 'long' ? colors.success : colors.error }]}>
                {orderType === 'long' ? '▲ BUY / LONG' : '▼ SELL / SHORT'}
              </Text>
              <TouchableOpacity onPress={() => setShowOrderPanel(false)}>
                <Ionicons name="close" size={22} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <Text style={styles.orderLabel}>Amount ($)</Text>
            <View style={styles.inputRow}>
              <Text style={styles.inputPrefix}>$</Text>
              <TextInput
                style={styles.amountInput}
                value={tradeAmountStr}
                onChangeText={setTradeAmountStr}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor="rgba(255,255,255,0.2)"
                autoFocus
              />
            </View>

            <View style={styles.quickBtns}>
              {[0.1, 0.25, 0.5, 0.75, 1].map(pct => (
                <TouchableOpacity
                  key={pct}
                  style={styles.quickBtn}
                  onPress={() => setTradeAmountStr(Math.floor(balance * pct).toString())}
                >
                  <Text style={styles.quickBtnText}>{pct === 1 ? 'MAX' : `${pct * 100}%`}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* SL / TP inputs */}
            <View style={styles.slTpRow}>
              <View style={styles.slTpCol}>
                <Text style={styles.slTpLabel}>Stop Loss %</Text>
                <View style={styles.slTpInputWrap}>
                  <TextInput
                    style={styles.slTpInput}
                    value={slPctStr}
                    onChangeText={setSlPctStr}
                    keyboardType="numeric"
                    placeholder="2"
                    placeholderTextColor="rgba(255,255,255,0.2)"
                  />
                  <Text style={styles.slTpSuffix}>%</Text>
                </View>
              </View>
              <View style={styles.slTpCol}>
                <Text style={styles.slTpLabel}>Take Profit %</Text>
                <View style={styles.slTpInputWrap}>
                  <TextInput
                    style={styles.slTpInput}
                    value={tpPctStr}
                    onChangeText={setTpPctStr}
                    keyboardType="numeric"
                    placeholder="4"
                    placeholderTextColor="rgba(255,255,255,0.2)"
                  />
                  <Text style={styles.slTpSuffix}>%</Text>
                </View>
              </View>
            </View>

            {/* Trailing Stop */}
            <View style={styles.trailingRow}>
              <TouchableOpacity
                style={[styles.trailingCheckbox, useTrailingStop && styles.trailingCheckboxActive]}
                onPress={() => setUseTrailingStop(p => !p)}
              >
                {useTrailingStop && <Ionicons name="checkmark" size={14} color="#fff" />}
              </TouchableOpacity>
              <Text style={styles.trailingLabel}>Trailing Stop</Text>
              {useTrailingStop && (
                <View style={[styles.slTpInputWrap, { flex: 1, marginLeft: 8 }]}>
                  <TextInput
                    style={styles.slTpInput}
                    value={trailingPctStr}
                    onChangeText={setTrailingPctStr}
                    keyboardType="numeric"
                    placeholder="1.5"
                    placeholderTextColor="rgba(255,255,255,0.2)"
                  />
                  <Text style={styles.slTpSuffix}>%</Text>
                </View>
              )}
            </View>

            <View style={styles.orderInfo}>
              <View style={styles.orderInfoRow}>
                <Text style={styles.orderInfoLabel}>{orderType === 'long' ? 'Ask Price' : 'Bid Price'}</Text>
                <Text style={styles.orderInfoValue}>${execPrice.toFixed(2)}</Text>
              </View>
              <View style={styles.orderInfoRow}>
                <Text style={styles.orderInfoLabel}>Shares</Text>
                <Text style={styles.orderInfoValue}>{shares}</Text>
              </View>
              <View style={styles.orderInfoRow}>
                <Text style={styles.orderInfoLabel}>Commission</Text>
                <Text style={[styles.orderInfoValue, { color: colors.error }]}>${estimatedCommission.toFixed(2)}</Text>
              </View>
              <View style={styles.orderInfoRow}>
                <Text style={styles.orderInfoLabel}>Available</Text>
                <Text style={styles.orderInfoValue}>${balance.toLocaleString(undefined, { maximumFractionDigits: 0 })}</Text>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.confirmBtn, { backgroundColor: orderType === 'long' ? '#059669' : '#DC2626' }, (parsedAmount <= 0 || parsedAmount > balance || shares <= 0) && styles.disabledBtn]}
              onPress={handleConfirmOrder}
              disabled={parsedAmount <= 0 || parsedAmount > balance || shares <= 0}
              activeOpacity={0.7}
            >
              <Text style={styles.confirmBtnText}>
                {orderType === 'long' ? 'Confirm Buy' : 'Confirm Sell'} — {shares} shares
              </Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      )}

      {/* Buy/Sell Buttons */}
      {!showOrderPanel && (
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.actionBtn, styles.buyBtn, position ? styles.disabledBtn : null]}
            onPress={handleBuy}
            disabled={!!position}
            activeOpacity={0.7}
          >
            <Ionicons name="trending-up" size={20} color="#fff" />
            <Text style={styles.actionBtnText}>BUY</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, styles.sellBtn, position ? styles.disabledBtn : null]}
            onPress={handleSell}
            disabled={!!position}
            activeOpacity={0.7}
          >
            <Ionicons name="trending-down" size={20} color="#fff" />
            <Text style={styles.actionBtnText}>SELL</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#08080d' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  headerCenter: { alignItems: 'center' },
  ticker: { fontSize: 12, color: colors.textSecondary, fontWeight: '600', letterSpacing: 1 },
  price: { fontSize: 22, fontWeight: '800', marginTop: 2 },
  timerText: { fontSize: 12, fontWeight: '700', color: colors.textSecondary, marginBottom: 4 },
  speedBtn: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
    backgroundColor: colors.primary + '20',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  progressRow: { paddingHorizontal: spacing.md, marginBottom: 8 },
  progressLabel: { fontSize: 11, color: colors.textSecondary, marginBottom: 4, fontWeight: '600' },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: 3 },
  chartContainer: { paddingHorizontal: 12, marginBottom: 4 },
  legend: { flexDirection: 'row', gap: 12, marginTop: 4, marginLeft: 12 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendDot: { width: 8, height: 3, borderRadius: 1.5 },
  legendText: { fontSize: 9, color: 'rgba(255,255,255,0.4)', fontWeight: '500' },
  indicatorContainer: { paddingHorizontal: 12, marginBottom: 8 },
  indicatorLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.4)',
    fontWeight: '600',
    marginBottom: 2,
    marginLeft: 4,
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    gap: 6,
    marginBottom: 8,
  },
  statBox: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 8,
    padding: 8,
    alignItems: 'center',
  },
  statLabel: { fontSize: 9, color: colors.textSecondary, fontWeight: '500', marginBottom: 2 },
  statValue: { fontSize: 14, color: colors.textPrimary, fontWeight: '800' },
  positionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 12,
    marginBottom: 8,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 10,
    padding: 10,
  },
  positionInfo: { flex: 1 },
  positionType: { fontSize: 14, fontWeight: '800' },
  positionDetail: { fontSize: 11, color: colors.textSecondary, marginTop: 2 },
  closeBtn: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  closeBtnText: { fontSize: 13, fontWeight: '800', color: colors.textPrimary },
  buttonRow: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingBottom: 16,
    gap: 10,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
  },
  buyBtn: { backgroundColor: '#059669' },
  sellBtn: { backgroundColor: '#DC2626' },
  disabledBtn: { opacity: 0.3 },
  actionBtnText: { fontSize: 16, fontWeight: '900', color: '#fff', letterSpacing: 1 },
  // Result
  resultContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  resultTitle: { fontSize: 32, fontWeight: '900', color: colors.textPrimary, marginBottom: 8 },
  resultSub: { fontSize: 16, color: colors.textSecondary, marginBottom: 24 },
  resultStats: { width: '100%', gap: 12, marginBottom: 32 },
  resultStatRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.04)',
    padding: 14,
    borderRadius: 10,
  },
  resultStatLabel: { fontSize: 14, color: colors.textSecondary },
  resultStatValue: { fontSize: 16, fontWeight: '800', color: colors.textPrimary },
  resultBtn: { width: '100%' },
  resultBtnGradient: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  resultBtnText: { fontSize: 18, fontWeight: '900', color: '#fff' },
  cooldownBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 16,
    width: '100%',
  },
  cooldownText: { fontSize: 16, color: colors.textSecondary, fontWeight: '600' },
  cooldownTimer: { fontSize: 32, fontWeight: '900', color: colors.primary },
  orderPanel: {
    backgroundColor: '#111118',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 8,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  orderTitle: { fontSize: 15, fontWeight: '900', letterSpacing: 0.5 },
  orderLabel: { fontSize: 11, fontWeight: '600', color: colors.textSecondary, marginBottom: 4 },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  inputPrefix: { fontSize: 20, fontWeight: '800', color: colors.textSecondary, marginRight: 4 },
  amountInput: {
    flex: 1,
    fontSize: 24,
    fontWeight: '800',
    color: colors.textPrimary,
    paddingVertical: 10,
  },
  quickBtns: { flexDirection: 'row', gap: 6, marginBottom: 10 },
  quickBtn: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
  },
  quickBtnText: { fontSize: 11, fontWeight: '700', color: colors.textSecondary },
  orderInfo: { marginBottom: 10 },
  orderInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
  },
  orderInfoLabel: { fontSize: 12, color: colors.textSecondary },
  orderInfoValue: { fontSize: 12, fontWeight: '700', color: colors.textPrimary },
  confirmBtn: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 4,
  },
  confirmBtnText: { fontSize: 15, fontWeight: '900', color: '#fff' },
  bidAskRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 1,
  },
  bidText: { fontSize: 9, color: '#34D399', fontWeight: '600' },
  askText: { fontSize: 9, color: '#EF4444', fontWeight: '600' },
  slTpRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  slTpCol: {
    flex: 1,
  },
  slTpLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 3,
  },
  slTpInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 8,
  },
  slTpInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    paddingVertical: 6,
  },
  slTpSuffix: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  trailingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  trailingCheckbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  trailingCheckboxActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  trailingLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
});
