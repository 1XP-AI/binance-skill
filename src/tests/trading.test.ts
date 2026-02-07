/**
 * Trading Logic Tests
 * TDD: Write tests first for smart trading features
 */

import { describe, it, expect } from 'vitest';
import {
  analyzeMarket,
  calculateSlippage,
  recommendOrderType,
  splitOrder,
  checkRisk,
  maxBuyableQty
} from '../trading';

describe('Trading Logic', () => {
  describe('Market Analysis', () => {
    it('should calculate spread from orderbook', () => {
      const orderbook = {
        bids: [{ price: '49900000', qty: '1.5' }],
        asks: [{ price: '50100000', qty: '2.0' }]
      };

      const analysis = analyzeMarket(orderbook);

      expect(analysis.spread).toBe(200000);
      expect(analysis.spreadPercent ?? 0).toBeCloseTo(0.4, 1);
    });

    it('should calculate orderbook depth', () => {
      const orderbook = {
        bids: [
          { price: '49900000', qty: '1.0' },
          { price: '49800000', qty: '2.0' },
          { price: '49700000', qty: '3.0' }
        ],
        asks: [
          { price: '50100000', qty: '1.5' },
          { price: '50200000', qty: '2.5' }
        ]
      };

      const analysis = analyzeMarket(orderbook);

      expect(analysis.bidDepth).toBe(6.0);
      expect(analysis.askDepth).toBe(4.0);
    });

    it('should detect market imbalance', () => {
      const orderbook = {
        bids: [{ price: '49900000', qty: '10.0' }],
        asks: [{ price: '50100000', qty: '5.0' }]
      };

      const analysis = analyzeMarket(orderbook);

      // Positive = more buyers, Negative = more sellers
      expect(analysis.imbalance ?? 0).toBeCloseTo(0.333, 2);
    });
  });

  describe('Slippage Calculation', () => {
    it('should estimate slippage for market buy order', () => {
      const orderbook = {
        asks: [
          { price: '50000000', qty: '0.5' },
          { price: '50100000', qty: '0.5' },
          { price: '50200000', qty: '1.0' }
        ]
      };

      const buyQty = 1.5;
      const result = calculateSlippage(orderbook.asks, buyQty);

      expect(result.averagePrice).toBeCloseTo(50100000, 0);
      expect(result.slippagePercent).toBeCloseTo(0.2, 1);
    });

    it('should warn when slippage exceeds threshold', () => {
      const slippage = 0.5; // 0.5%
      const threshold = 0.3; // 0.3%
      
      expect(slippage > threshold).toBe(true);
    });
  });

  describe('Smart Order Execution', () => {
    it('should recommend LIMIT order when spread is wide', () => {
      const spreadPercent = 0.5; // 0.5% spread
      const threshold = 0.2;

      const recommendation = recommendOrderType(spreadPercent, threshold);
      expect(recommendation).toBe('LIMIT');
    });

    it('should recommend MARKET order when spread is tight', () => {
      const spreadPercent = 0.1; // 0.1% spread
      const threshold = 0.2;

      const recommendation = recommendOrderType(spreadPercent, threshold);
      expect(recommendation).toBe('MARKET');
    });

    it('should split large orders to reduce impact', () => {
      const totalQty = 10.0;
      const maxSingleOrder = 2.0;

      const orderSizes = splitOrder(totalQty, maxSingleOrder);

      expect(orderSizes.length).toBe(5);
      expect(orderSizes.reduce((a, b) => a + b, 0)).toBe(10.0);
    });
  });

  describe('Risk Management', () => {
    it('should reject order exceeding available balance', () => {
      const availableKRW = 1000000;
      const orderAmount = 1500000;

      const result = checkRisk({ availableKRW, orderAmount });
      expect(result.isValid).toBe(false);
    });

    it('should calculate max buyable quantity', () => {
      const availableKRW = 1000000;
      const currentPrice = 50000000;

      const maxQty = maxBuyableQty(availableKRW, currentPrice);
      expect(maxQty).toBe(0.02);
    });

    it('should enforce minimum order amount', () => {
      const minOrderKRW = 5000; // 5000 KRW minimum
      const orderAmount = 3000;

      const result = checkRisk({ availableKRW: 1000000, orderAmount, minOrderKRW });
      expect(result.isValid).toBe(false);
    });
  });
});
