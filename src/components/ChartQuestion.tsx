import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
let Svg: any, Rect: any, Line: any, Circle: any, SvgText: any, G: any, Path: any;
try {
  const svg = require('react-native-svg');
  Svg = svg.default || svg.Svg; Rect = svg.Rect; Line = svg.Line; Circle = svg.Circle; SvgText = svg.Text; G = svg.G; Path = svg.Path;
} catch {
  Svg = Rect = Line = Circle = SvgText = G = Path = ({ children, ...p }: any) => null;
}

const SCREEN_WIDTH = Dimensions.get('window').width;
const CHART_WIDTH = SCREEN_WIDTH - 40;
const CHART_HEIGHT = 200;
const PADDING = { top: 10, right: 45, bottom: 20, left: 10 };
const PLOT_W = CHART_WIDTH - PADDING.left - PADDING.right;
const PLOT_H = CHART_HEIGHT - PADDING.top - PADDING.bottom;

export interface CandleData {
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

export interface IndicatorData {
  type: 'rsi' | 'macd' | 'sma' | 'ema' | 'bollinger';
  label: string;
  values: number[];
  color?: string;
}

export interface AnnotationData {
  type: 'circle' | 'label' | 'arrow' | 'hline';
  x?: number; // candle index
  y?: number; // price level
  text?: string;
  color?: string;
}

export interface ChartConfig {
  ticker: string;
  timeframe: string;
  candles: CandleData[];
  indicators?: IndicatorData[];
  annotations?: AnnotationData[];
  chartType?: 'candlestick' | 'line_with_indicator' | 'pattern';
}

interface ChartQuestionProps {
  chart: ChartConfig;
}

const COLORS = {
  bg: '#111',
  border: '#222',
  green: '#34D399',
  red: '#EF4444',
  rsi: '#6C63FF',
  macd: '#34D399',
  grid: 'rgba(255,255,255,0.06)',
  text: 'rgba(255,255,255,0.4)',
  annotation: '#FF6B35',
  sma: '#FBBF24',
  ema: '#60A5FA',
  bollinger: 'rgba(108,99,255,0.25)',
};

function getMinMax(candles: CandleData[]): { min: number; max: number } {
  let min = Infinity;
  let max = -Infinity;
  for (const c of candles) {
    if (c.low < min) min = c.low;
    if (c.high > max) max = c.high;
  }
  const padding = (max - min) * 0.08;
  return { min: min - padding, max: max + padding };
}

function priceToY(price: number, min: number, max: number): number {
  return PADDING.top + PLOT_H - ((price - min) / (max - min)) * PLOT_H;
}

function indexToX(i: number, total: number): number {
  const candleWidth = PLOT_W / total;
  return PADDING.left + candleWidth * i + candleWidth / 2;
}

function renderGridLines(min: number, max: number): React.ReactNode[] {
  const lines: React.ReactNode[] = [];
  const range = max - min;
  const step = range / 4;
  for (let i = 0; i <= 4; i++) {
    const price = min + step * i;
    const y = priceToY(price, min, max);
    lines.push(
      <Line
        key={`grid-${i}`}
        x1={PADDING.left}
        y1={y}
        x2={CHART_WIDTH - PADDING.right}
        y2={y}
        stroke={COLORS.grid}
        strokeWidth={1}
      />,
    );
    lines.push(
      <SvgText
        key={`label-${i}`}
        x={CHART_WIDTH - PADDING.right + 4}
        y={y + 3}
        fill={COLORS.text}
        fontSize={8}
        fontWeight="500"
      >
        {price.toFixed(price > 100 ? 0 : 2)}
      </SvgText>,
    );
  }
  return lines;
}

function renderCandles(candles: CandleData[], min: number, max: number): React.ReactNode[] {
  const elements: React.ReactNode[] = [];
  const total = candles.length;
  const candleWidth = Math.max(2, Math.min(8, (PLOT_W / total) * 0.6));
  const wickWidth = 1;

  for (let i = 0; i < total; i++) {
    const c = candles[i];
    const x = indexToX(i, total);
    const isGreen = c.close >= c.open;
    const color = isGreen ? COLORS.green : COLORS.red;

    const bodyTop = priceToY(Math.max(c.open, c.close), min, max);
    const bodyBottom = priceToY(Math.min(c.open, c.close), min, max);
    const bodyHeight = Math.max(1, bodyBottom - bodyTop);

    // Wick
    elements.push(
      <Line
        key={`wick-${i}`}
        x1={x}
        y1={priceToY(c.high, min, max)}
        x2={x}
        y2={priceToY(c.low, min, max)}
        stroke={color}
        strokeWidth={wickWidth}
      />,
    );

    // Body
    elements.push(
      <Rect
        key={`body-${i}`}
        x={x - candleWidth / 2}
        y={bodyTop}
        width={candleWidth}
        height={bodyHeight}
        fill={isGreen ? color : color}
        stroke={color}
        strokeWidth={0.5}
        rx={0.5}
      />,
    );
  }
  return elements;
}

function renderLineChart(candles: CandleData[], min: number, max: number): React.ReactNode {
  const total = candles.length;
  const points = candles.map((c, i) => {
    const x = indexToX(i, total);
    const y = priceToY(c.close, min, max);
    return `${i === 0 ? 'M' : 'L'}${x},${y}`;
  });
  return (
    <Path
      d={points.join(' ')}
      stroke={COLORS.ema}
      strokeWidth={1.5}
      fill="none"
    />
  );
}

function renderIndicator(
  indicator: IndicatorData,
  candles: CandleData[],
  indicatorAreaY: number,
  indicatorAreaH: number,
): React.ReactNode[] {
  const elements: React.ReactNode[] = [];
  const total = candles.length;
  const values = indicator.values;

  if (indicator.type === 'rsi') {
    const rsiMin = 0;
    const rsiMax = 100;
    const toY = (v: number) =>
      indicatorAreaY + indicatorAreaH - ((v - rsiMin) / (rsiMax - rsiMin)) * indicatorAreaH;

    // Overbought/oversold lines
    elements.push(
      <Line
        key="rsi-70"
        x1={PADDING.left}
        y1={toY(70)}
        x2={CHART_WIDTH - PADDING.right}
        y2={toY(70)}
        stroke="rgba(239,68,68,0.3)"
        strokeWidth={0.8}
        strokeDasharray="3,3"
      />,
    );
    elements.push(
      <Line
        key="rsi-30"
        x1={PADDING.left}
        y1={toY(30)}
        x2={CHART_WIDTH - PADDING.right}
        y2={toY(30)}
        stroke="rgba(52,211,153,0.3)"
        strokeWidth={0.8}
        strokeDasharray="3,3"
      />,
    );
    elements.push(
      <SvgText key="rsi-70-l" x={CHART_WIDTH - PADDING.right + 4} y={toY(70) + 3} fill={COLORS.text} fontSize={7}>70</SvgText>,
    );
    elements.push(
      <SvgText key="rsi-30-l" x={CHART_WIDTH - PADDING.right + 4} y={toY(30) + 3} fill={COLORS.text} fontSize={7}>30</SvgText>,
    );

    // RSI line
    const points = values.map((v, i) => {
      const x = indexToX(i, total);
      const y = toY(v);
      return `${i === 0 ? 'M' : 'L'}${x},${y}`;
    });
    elements.push(
      <Path
        key="rsi-line"
        d={points.join(' ')}
        stroke={indicator.color || COLORS.rsi}
        strokeWidth={1.5}
        fill="none"
      />,
    );

    elements.push(
      <SvgText key="rsi-label" x={PADDING.left + 2} y={indicatorAreaY + 9} fill={COLORS.rsi} fontSize={8} fontWeight="600">
        {indicator.label}
      </SvgText>,
    );
  }

  if (indicator.type === 'macd') {
    const vMin = Math.min(...values);
    const vMax = Math.max(...values);
    const range = Math.max(vMax - vMin, 0.01);
    const toY = (v: number) =>
      indicatorAreaY + indicatorAreaH - ((v - vMin) / range) * indicatorAreaH;

    // Zero line
    if (vMin < 0 && vMax > 0) {
      elements.push(
        <Line
          key="macd-zero"
          x1={PADDING.left}
          y1={toY(0)}
          x2={CHART_WIDTH - PADDING.right}
          y2={toY(0)}
          stroke="rgba(255,255,255,0.15)"
          strokeWidth={0.5}
        />,
      );
    }

    const barW = Math.max(2, (PLOT_W / total) * 0.5);
    values.forEach((v, i) => {
      const x = indexToX(i, total);
      const zeroY = vMin < 0 && vMax > 0 ? toY(0) : indicatorAreaY + indicatorAreaH;
      const barY = toY(v);
      const color = v >= 0 ? COLORS.macd : COLORS.red;
      elements.push(
        <Rect
          key={`macd-bar-${i}`}
          x={x - barW / 2}
          y={Math.min(barY, zeroY)}
          width={barW}
          height={Math.abs(barY - zeroY) || 1}
          fill={color}
          opacity={0.7}
        />,
      );
    });

    elements.push(
      <SvgText key="macd-label" x={PADDING.left + 2} y={indicatorAreaY + 9} fill={COLORS.macd} fontSize={8} fontWeight="600">
        {indicator.label}
      </SvgText>,
    );
  }

  if (indicator.type === 'sma' || indicator.type === 'ema') {
    const { min, max } = getMinMax(candles);
    const points = values.map((v, i) => {
      const x = indexToX(i, total);
      const y = priceToY(v, min, max);
      return `${i === 0 ? 'M' : 'L'}${x},${y}`;
    });
    const color = indicator.color || (indicator.type === 'sma' ? COLORS.sma : COLORS.ema);
    elements.push(
      <Path
        key={`${indicator.type}-line`}
        d={points.join(' ')}
        stroke={color}
        strokeWidth={1.2}
        fill="none"
        strokeDasharray={indicator.type === 'sma' ? '4,2' : undefined}
      />,
    );
  }

  if (indicator.type === 'bollinger') {
    // Values = [upper, middle, lower] flattened as [u0,m0,l0,u1,m1,l1,...]
    const { min, max } = getMinMax(candles);
    const count = Math.floor(values.length / 3);
    const upper: string[] = [];
    const middle: string[] = [];
    const lower: string[] = [];
    for (let i = 0; i < count; i++) {
      const x = indexToX(i, total);
      const uY = priceToY(values[i * 3], min, max);
      const mY = priceToY(values[i * 3 + 1], min, max);
      const lY = priceToY(values[i * 3 + 2], min, max);
      upper.push(`${i === 0 ? 'M' : 'L'}${x},${uY}`);
      middle.push(`${i === 0 ? 'M' : 'L'}${x},${mY}`);
      lower.push(`${i === 0 ? 'M' : 'L'}${x},${lY}`);
    }
    elements.push(<Path key="bb-upper" d={upper.join(' ')} stroke={COLORS.rsi} strokeWidth={0.8} fill="none" opacity={0.5} />);
    elements.push(<Path key="bb-middle" d={middle.join(' ')} stroke={COLORS.rsi} strokeWidth={1} fill="none" opacity={0.7} />);
    elements.push(<Path key="bb-lower" d={lower.join(' ')} stroke={COLORS.rsi} strokeWidth={0.8} fill="none" opacity={0.5} />);
  }

  return elements;
}

function renderAnnotations(
  annotations: AnnotationData[],
  candles: CandleData[],
  min: number,
  max: number,
): React.ReactNode[] {
  const elements: React.ReactNode[] = [];
  const total = candles.length;

  annotations.forEach((a, i) => {
    if (a.type === 'circle' && a.x != null && a.y != null) {
      const cx = indexToX(a.x, total);
      const cy = priceToY(a.y, min, max);
      elements.push(
        <Circle
          key={`ann-c-${i}`}
          cx={cx}
          cy={cy}
          r={6}
          stroke={a.color || COLORS.annotation}
          strokeWidth={1.5}
          fill="none"
        />,
      );
      if (a.text) {
        elements.push(
          <SvgText
            key={`ann-ct-${i}`}
            x={cx}
            y={cy - 10}
            fill={a.color || COLORS.annotation}
            fontSize={7}
            fontWeight="600"
            textAnchor="middle"
          >
            {a.text}
          </SvgText>,
        );
      }
    }

    if (a.type === 'label' && a.x != null && a.y != null) {
      const x = indexToX(a.x, total);
      const y = priceToY(a.y, min, max);
      elements.push(
        <SvgText
          key={`ann-l-${i}`}
          x={x}
          y={y - 6}
          fill={a.color || COLORS.annotation}
          fontSize={8}
          fontWeight="700"
          textAnchor="middle"
        >
          {a.text || ''}
        </SvgText>,
      );
    }

    if (a.type === 'hline' && a.y != null) {
      const y = priceToY(a.y, min, max);
      elements.push(
        <Line
          key={`ann-h-${i}`}
          x1={PADDING.left}
          y1={y}
          x2={CHART_WIDTH - PADDING.right}
          y2={y}
          stroke={a.color || COLORS.annotation}
          strokeWidth={1}
          strokeDasharray="4,3"
        />,
      );
      if (a.text) {
        elements.push(
          <SvgText
            key={`ann-ht-${i}`}
            x={PADDING.left + 4}
            y={y - 4}
            fill={a.color || COLORS.annotation}
            fontSize={7}
            fontWeight="600"
          >
            {a.text}
          </SvgText>,
        );
      }
    }
  });

  return elements;
}

export function ChartQuestion({ chart }: ChartQuestionProps) {
  const { candles, indicators, annotations, chartType } = chart;
  const { min, max } = getMinMax(candles);

  const hasSubIndicator = indicators?.some((ind) => ind.type === 'rsi' || ind.type === 'macd');
  const overlayIndicators = indicators?.filter((ind) => ind.type === 'sma' || ind.type === 'ema' || ind.type === 'bollinger') || [];
  const subIndicators = indicators?.filter((ind) => ind.type === 'rsi' || ind.type === 'macd') || [];

  const totalHeight = hasSubIndicator ? CHART_HEIGHT + 60 : CHART_HEIGHT;
  const indicatorAreaY = CHART_HEIGHT;
  const indicatorAreaH = 50;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.ticker}>{chart.ticker}</Text>
        <Text style={styles.timeframe}>{chart.timeframe}</Text>
      </View>
      <View style={styles.chartWrap}>
        <Svg width={CHART_WIDTH} height={totalHeight} viewBox={`0 0 ${CHART_WIDTH} ${totalHeight}`}>
          {/* Chart background */}
          <Rect x={0} y={0} width={CHART_WIDTH} height={totalHeight} fill={COLORS.bg} rx={8} />

          {/* Grid */}
          {renderGridLines(min, max)}

          {/* Main chart */}
          {chartType === 'line_with_indicator'
            ? renderLineChart(candles, min, max)
            : renderCandles(candles, min, max)}

          {/* Overlay indicators (SMA, EMA, Bollinger) */}
          {overlayIndicators.map((ind, idx) => (
            <G key={`overlay-${idx}`}>
              {renderIndicator(ind, candles, 0, 0)}
            </G>
          ))}

          {/* Annotations */}
          {annotations && renderAnnotations(annotations, candles, min, max)}

          {/* Sub-chart indicators (RSI, MACD) */}
          {hasSubIndicator && (
            <G>
              {/* Separator */}
              <Line
                x1={PADDING.left}
                y1={indicatorAreaY - 2}
                x2={CHART_WIDTH - PADDING.right}
                y2={indicatorAreaY - 2}
                stroke={COLORS.border}
                strokeWidth={0.8}
              />
              {subIndicators.map((ind, idx) =>
                renderIndicator(ind, candles, indicatorAreaY, indicatorAreaH),
              )}
            </G>
          )}
        </Svg>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: COLORS.bg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 4,
  },
  ticker: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  timeframe: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 11,
    fontWeight: '600',
  },
  chartWrap: {
    alignItems: 'center',
    paddingBottom: 4,
  },
});
