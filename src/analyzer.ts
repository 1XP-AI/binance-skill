export type OrderbookLevel = { price: string | number; qty: string | number };

export type OrderbookSnapshot = {
  bids: OrderbookLevel[];
  asks: OrderbookLevel[];
};

export type Trade = {
  timestamp: number;
  price: string | number;
  qty: string | number;
  is_seller_maker: boolean;
};

const toNumber = (v: string | number): number => (typeof v === 'string' ? parseFloat(v) : v);

export function calculateOBI(bids: OrderbookLevel[], asks: OrderbookLevel[], depth = 10): number {
  const bidSum = bids.slice(0, depth).reduce((sum, b) => sum + toNumber(b.qty), 0);
  const askSum = asks.slice(0, depth).reduce((sum, a) => sum + toNumber(a.qty), 0);
  const denom = bidSum + askSum;
  if (denom === 0) return 0;
  return (bidSum - askSum) / denom;
}

export function calculateWOBI(
  bids: OrderbookLevel[],
  asks: OrderbookLevel[],
  depth = 10,
  decay = 0.8
): number {
  const bidWeighted = bids.slice(0, depth).reduce((sum, b, i) => sum + Math.pow(decay, i) * toNumber(b.qty), 0);
  const askWeighted = asks.slice(0, depth).reduce((sum, a, i) => sum + Math.pow(decay, i) * toNumber(a.qty), 0);
  const denom = bidWeighted + askWeighted;
  if (denom === 0) return 0;
  return (bidWeighted - askWeighted) / denom;
}

export function calculateSpread(bids: OrderbookLevel[], asks: OrderbookLevel[]) {
  const bestBid = bids[0] ? toNumber(bids[0].price) : 0;
  const bestAsk = asks[0] ? toNumber(asks[0].price) : 0;
  const spread = bestAsk - bestBid;
  const mid = (bestAsk + bestBid) / 2 || 0;
  const spreadPct = mid > 0 ? spread / mid : 0;
  return { bestBid, bestAsk, spread, spreadPct, mid };
}

export function calculateLiquiditySlope(orderbook: OrderbookSnapshot, depth = 10): number {
  const { bids, asks } = orderbook;
  const { mid } = calculateSpread(bids, asks);
  const levels = [...bids.slice(0, depth), ...asks.slice(0, depth)];
  if (levels.length < 2 || mid === 0) return 0;

  const points = levels.map((lvl, idx) => {
    const price = toNumber(lvl.price);
    const dist = Math.abs(price - mid);
    const qty = toNumber(lvl.qty);
    return { x: dist || idx + 1, y: qty };
  });

  const n = points.length;
  const sumX = points.reduce((s, p) => s + p.x, 0);
  const sumY = points.reduce((s, p) => s + p.y, 0);
  const sumXY = points.reduce((s, p) => s + p.x * p.y, 0);
  const sumX2 = points.reduce((s, p) => s + p.x * p.x, 0);

  const denom = n * sumX2 - sumX * sumX;
  if (denom === 0) return 0;
  return (n * sumXY - sumX * sumY) / denom;
}

export function classifyTradeFlow(trades: Trade[]) {
  const buyVolume = trades
    .filter((t) => !t.is_seller_maker)
    .reduce((s, t) => s + toNumber(t.qty), 0);
  const sellVolume = trades
    .filter((t) => t.is_seller_maker)
    .reduce((s, t) => s + toNumber(t.qty), 0);
  const total = buyVolume + sellVolume;
  const volumeImbalance = total === 0 ? 0 : (buyVolume - sellVolume) / total;
  return { buyVolume, sellVolume, volumeImbalance };
}

export function calculateVWAP(trades: Trade[]) {
  const totalVolume = trades.reduce((s, t) => s + toNumber(t.qty), 0);
  if (totalVolume === 0) return 0;
  const vwap = trades.reduce((s, t) => s + toNumber(t.price) * toNumber(t.qty), 0) / totalVolume;
  return vwap;
}

export function calculateVWAPDrift(trades: Trade[]) {
  if (trades.length === 0) return 0;
  const lastPrice = toNumber(trades[trades.length - 1].price);
  const vwap = calculateVWAP(trades);
  return lastPrice - vwap;
}

export function detectTradeBurst(trades: Trade[], windowSec = 30, threshold = 5) {
  const tradesPerSec = trades.length / windowSec;
  return { tradesPerSec, flag: tradesPerSec >= threshold };
}

export function computeMarketPressureIndex(
  wobi: number,
  volumeImbalance: number,
  spreadPct: number,
  vwapDriftPct: number
): number {
  const mpi = 0.4 * wobi + 0.3 * volumeImbalance - 0.2 * spreadPct + 0.1 * vwapDriftPct;
  return Math.max(-1, Math.min(1, mpi));
}

export function computeLiquidityScore(depth10: number, slope: number, spreadPct: number): number {
  const depthScore = Math.tanh(depth10 / 10);
  const slopeScore = Math.tanh(slope);
  const spreadScore = Math.tanh(spreadPct * 100);
  const score = depthScore + slopeScore - spreadScore;
  return Math.max(-1, Math.min(1, score));
}

export type AnalysisResult = {
  timestamp: number;
  symbol: string;
  orderbook: {
    obi: { top1: number; top5: number; top10: number };
    wobi: number;
    spread: { value: number; pct: number };
    liquiditySlope: number;
    walls: Array<{ side: 'bid' | 'ask'; price: number; size: number }>;
    voids: Array<{ side: 'bid' | 'ask'; price: number; gap: number }>;
  };
  trades: {
    buyVolume: number;
    sellVolume: number;
    volumeImbalance: number;
    vwap: number;
    vwapDrift: number;
    burst: { tradesPerSec: number; flag: boolean };
    whales: Array<{ price: number; size: number }>;
  };
  scores: {
    marketPressure: number;
    liquidityScore: number;
  };
  flags: string[];
};

export function analyzeSnapshot(symbol: string, orderbook: OrderbookSnapshot, trades: Trade[]): AnalysisResult {
  const obiTop1 = calculateOBI(orderbook.bids, orderbook.asks, 1);
  const obiTop5 = calculateOBI(orderbook.bids, orderbook.asks, 5);
  const obiTop10 = calculateOBI(orderbook.bids, orderbook.asks, 10);
  const wobi = calculateWOBI(orderbook.bids, orderbook.asks, 10);

  const spread = calculateSpread(orderbook.bids, orderbook.asks);
  const slope = calculateLiquiditySlope(orderbook, 10);

  const flow = classifyTradeFlow(trades);
  const vwap = calculateVWAP(trades);
  const vwapDrift = calculateVWAPDrift(trades);
  const vwapDriftPct = spread.mid > 0 ? vwapDrift / spread.mid : 0;

  const burst = detectTradeBurst(trades);

  const depth10 = orderbook.bids.slice(0, 10).reduce((s, b) => s + toNumber(b.qty), 0) +
    orderbook.asks.slice(0, 10).reduce((s, a) => s + toNumber(a.qty), 0);

  const marketPressure = computeMarketPressureIndex(wobi, flow.volumeImbalance, spread.spreadPct, vwapDriftPct);
  const liquidityScore = computeLiquidityScore(depth10, slope, spread.spreadPct);

  const flags: string[] = [];
  if (marketPressure > 0.3) flags.push('aggressive_buy_wave');
  if (marketPressure < -0.3) flags.push('aggressive_sell_wave');
  if (liquidityScore < 0.2) flags.push('thin_book_risk');

  return {
    timestamp: Math.floor(Date.now() / 1000),
    symbol,
    orderbook: {
      obi: { top1: obiTop1, top5: obiTop5, top10: obiTop10 },
      wobi,
      spread: { value: spread.spread, pct: spread.spreadPct },
      liquiditySlope: slope,
      walls: [],
      voids: []
    },
    trades: {
      buyVolume: flow.buyVolume,
      sellVolume: flow.sellVolume,
      volumeImbalance: flow.volumeImbalance,
      vwap,
      vwapDrift,
      burst,
      whales: []
    },
    scores: {
      marketPressure,
      liquidityScore
    },
    flags
  };
}
