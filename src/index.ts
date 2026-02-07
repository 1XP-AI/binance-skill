/**
 * Binance Public Market Data Skill
 * Spot + USDT-M Futures (public endpoints only)
 */

// Spot + Futures Public API
export {
  pingSpot,
  getSpotServerTime,
  getSpotExchangeInfo,
  getSpotTickerPrice,
  getSpotOrderbook,
  getSpotTrades,
  getSpotKlines,
  getFuturesExchangeInfo,
  getFuturesFundingRate,
  getFuturesPremiumIndex,
  getFuturesMarkPrice,
  getFuturesTicker24hr,
  getFuturesOrderbook,
  getFuturesRecentTrades,
  getFuturesKlines,
  type SpotExchangeInfo,
  type SpotTickerPrice,
  type SpotOrderbook,
  type SpotTrade,
  type SpotKline,
  type FuturesExchangeInfo,
  type FuturesFundingRate,
  type FuturesPremiumIndex,
  type FuturesTicker24hr,
  type FuturesOrderbook,
  type FuturesTrade,
  type FuturesKline
} from './api/public.js';

// Trading Logic (generic analysis helpers)
export {
  analyzeMarket,
  calculateSlippage,
  recommendOrderType,
  splitOrder,
  checkRisk,
  maxBuyableQty,
  type OrderbookLevel,
  type Orderbook as TradingOrderbook,
  type MarketAnalysis,
  type SlippageResult,
  type OrderType,
  type RiskCheckInput
} from './trading.js';

// Analyzer
export {
  calculateOBI,
  calculateWOBI,
  calculateSpread,
  calculateLiquiditySlope,
  classifyTradeFlow,
  calculateVWAP,
  calculateVWAPDrift,
  detectTradeBurst,
  computeMarketPressureIndex,
  computeLiquidityScore,
  analyzeSnapshot,
  type OrderbookSnapshot,
  type Trade,
  type AnalysisResult
} from './analyzer.js';
