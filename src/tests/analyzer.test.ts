import { describe, it, expect } from 'vitest';
import {
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
  analyzeSnapshot
} from '../analyzer';

/**
 * ANALYZER Test Suite
 * Tests for advanced market analysis features
 * 
 * Waiting for implementation:
 * - @hojin: Data pipeline + indicator calculations
 * - @muhee: Composite scores + output schema
 */

describe('Analyzer', () => {
  describe('Order Book Microstructure', () => {
    describe('Order Book Imbalance (OBI)', () => {
      const bids = [{ price: 100, qty: 3 }, { price: 99, qty: 2 }, { price: 98, qty: 1 }];
      const asks = [{ price: 101, qty: 1 }, { price: 102, qty: 1 }, { price: 103, qty: 1 }];

      it('should calculate OBI at top1 depth', async () => {
        const obi = calculateOBI(bids, asks, 1);
        expect(obi).toBeCloseTo((3 - 1) / (3 + 1), 4);
      });

      it('should calculate OBI at top5 depth', async () => {
        const obi = calculateOBI(bids, asks, 5);
        expect(obi).toBeCloseTo((6 - 3) / 9, 4);
      });

      it('should calculate OBI at top10 depth', async () => {
        const obi = calculateOBI(bids, asks, 10);
        expect(obi).toBeCloseTo((6 - 3) / 9, 4);
      });

      it('should return value in range [-1, 1]', async () => {
        const obi = calculateOBI(bids, asks, 5);
        expect(obi).toBeGreaterThanOrEqual(-1);
        expect(obi).toBeLessThanOrEqual(1);
      });
    });

    describe('Weighted OBI (WOBI)', () => {
      const bids = [{ price: 100, qty: 3 }, { price: 99, qty: 2 }];
      const asks = [{ price: 101, qty: 1 }, { price: 102, qty: 1 }];

      it('should apply exponential decay weighting', async () => {
        const wobi = calculateWOBI(bids, asks, 2, 0.5);
        expect(wobi).toBeGreaterThan(0);
      });

      it('should emphasize near-top liquidity', async () => {
        const obi = calculateOBI(bids, asks, 2);
        const wobi = calculateWOBI(bids, asks, 2, 0.5);
        expect(Math.abs(wobi)).toBeGreaterThanOrEqual(Math.abs(obi));
      });
    });

    describe('Spread', () => {
      it('should calculate absolute spread', async () => {
        const { spread } = calculateSpread(
          [{ price: 100, qty: 1 }],
          [{ price: 102, qty: 1 }]
        );
        expect(spread).toBe(2);
      });

      it('should calculate spread percentage', async () => {
        const { spreadPct } = calculateSpread(
          [{ price: 100, qty: 1 }],
          [{ price: 102, qty: 1 }]
        );
        expect(spreadPct).toBeCloseTo(2 / 101, 4);
      });
    });

    describe('Liquidity Slope', () => {
      it('should calculate regression slope of depth vs price', async () => {
        const slope = calculateLiquiditySlope({
          bids: [{ price: 100, qty: 1 }, { price: 99, qty: 2 }],
          asks: [{ price: 101, qty: 1 }, { price: 102, qty: 2 }]
        });
        expect(typeof slope).toBe('number');
      });
    });
  });

  describe('Trade Flow Signals', () => {
    const trades = [
      { timestamp: 1, price: 100, qty: 1, is_seller_maker: false },
      { timestamp: 2, price: 101, qty: 2, is_seller_maker: true },
      { timestamp: 3, price: 102, qty: 1, is_seller_maker: false }
    ];

    describe('Volume Imbalance (VI)', () => {
      it('should classify trades by aggressor side', async () => {
        const flow = classifyTradeFlow(trades);
        expect(flow.buyVolume).toBe(2);
        expect(flow.sellVolume).toBe(2);
      });

      it('should calculate buy/sell volume imbalance', async () => {
        // VI = (buy_volume − sell_volume) / total_volume
        const flow = classifyTradeFlow(trades);
        expect(flow.volumeImbalance).toBe(0);
      });
    });

    describe('VWAP Drift', () => {
      it('should calculate VWAP', async () => {
        const vwap = calculateVWAP(trades);
        expect(vwap).toBeGreaterThan(0);
      });

      it('should calculate drift from last price', async () => {
        const drift = calculateVWAPDrift(trades);
        expect(typeof drift).toBe('number');
      });
    });

    describe('Trade Burst Detection', () => {
      it('should detect high-frequency trade bursts', async () => {
        const burst = detectTradeBurst(trades, 1, 2);
        expect(burst.flag).toBe(true);
      });
    });
  });

  describe('Composite Scores', () => {
    describe('Market Pressure Index (MPI)', () => {
      it('should combine WOBI, VI, Spread%, VWAP drift', async () => {
        const mpi = computeMarketPressureIndex(0.5, 0.2, 0.01, 0.05);
        expect(mpi).toBeGreaterThan(0);
      });

      it('should return normalized value in [-1, 1]', async () => {
        const mpi = computeMarketPressureIndex(2, 2, 2, 2);
        expect(mpi).toBeGreaterThanOrEqual(-1);
        expect(mpi).toBeLessThanOrEqual(1);
      });
    });

    describe('Liquidity Score', () => {
      it('should combine depth, slope, spread stability', async () => {
        const score = computeLiquidityScore(10, 1, 0.01);
        expect(score).toBeGreaterThan(-1);
      });
    });
  });

  describe('Output Schema', () => {
    it('should return valid AnalysisResult structure', async () => {
      const result = analyzeSnapshot(
        'BTC/KRW',
        {
          bids: [{ price: 100, qty: 1 }],
          asks: [{ price: 101, qty: 1 }]
        },
        [{ timestamp: 1, price: 100, qty: 1, is_seller_maker: false }]
      );
      expect(result.orderbook).toBeDefined();
      expect(result.trades).toBeDefined();
      expect(result.scores).toBeDefined();
    });

    it('should include all required fields', async () => {
      const result = analyzeSnapshot(
        'BTC/KRW',
        {
          bids: [{ price: 100, qty: 1 }],
          asks: [{ price: 101, qty: 1 }]
        },
        [{ timestamp: 1, price: 100, qty: 1, is_seller_maker: false }]
      );
      expect(result.orderbook.obi).toBeDefined();
      expect(result.orderbook.spread).toBeDefined();
      expect(result.trades.vwap).toBeDefined();
    });

    it('should include timestamp and currency', async () => {
      const result = analyzeSnapshot(
        'BTC/KRW',
        {
          bids: [{ price: 100, qty: 1 }],
          asks: [{ price: 101, qty: 1 }]
        },
        [{ timestamp: 1, price: 100, qty: 1, is_seller_maker: false }]
      );
      expect(result.timestamp).toBeGreaterThan(0);
      expect(result.symbol).toBe('BTC/KRW');
    });
  });
});
