import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
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
  getFuturesTicker24hr,
  getFuturesOrderbook,
  getFuturesRecentTrades,
  getFuturesKlines
} from '../api/public';

const mockFetch = vi.fn();
(globalThis as { fetch: typeof fetch }).fetch = mockFetch;

describe('Binance Public API', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it('should ping spot API', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, status: 200, json: () => Promise.resolve({}) });
    await pingSpot();
    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.binance.com/api/v3/ping',
      expect.objectContaining({ headers: expect.objectContaining({ 'User-Agent': 'binance-skill' }) })
    );
  });

  it('should fetch spot server time', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, status: 200, json: () => Promise.resolve({ serverTime: 123 }) });
    const result = await getSpotServerTime();
    expect(result.serverTime).toBe(123);
  });

  it('should fetch spot exchange info', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, status: 200, json: () => Promise.resolve({ timezone: 'UTC' }) });
    const result = await getSpotExchangeInfo({ symbol: 'BTCUSDT' });
    expect(result).toHaveProperty('timezone');
  });

  it('should fetch spot ticker price (symbol)', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, status: 200, json: () => Promise.resolve({ symbol: 'BTCUSDT', price: '1' }) });
    const result = await getSpotTickerPrice('BTCUSDT');
    expect(result).toEqual({ symbol: 'BTCUSDT', price: '1' });
  });

  it('should fetch spot ticker price (all)', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, status: 200, json: () => Promise.resolve([{ symbol: 'BTCUSDT', price: '1' }]) });
    const result = await getSpotTickerPrice();
    expect(Array.isArray(result)).toBe(true);
  });

  it('should fetch spot orderbook', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, status: 200, json: () => Promise.resolve({ lastUpdateId: 1, bids: [['1', '2']], asks: [['3', '4']] }) });
    const result = await getSpotOrderbook('BTCUSDT');
    expect(result.bids).toHaveLength(1);
  });

  it('should fetch spot trades', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, status: 200, json: () => Promise.resolve([{ id: 1, price: '1', qty: '2', quoteQty: '2', time: 1, isBuyerMaker: false, isBestMatch: true }]) });
    const result = await getSpotTrades('BTCUSDT');
    expect(result).toHaveLength(1);
  });

  it('should fetch spot klines', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, status: 200, json: () => Promise.resolve([[1, '1', '2', '3', '4', '5', 1, '6', 1, '7', '8', '9']]) });
    const result = await getSpotKlines({ symbol: 'BTCUSDT', interval: '1m', limit: 1 });
    expect(result).toHaveLength(1);
  });

  it('should fetch futures exchange info', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, status: 200, json: () => Promise.resolve({ futuresType: 'USDT' }) });
    const result = await getFuturesExchangeInfo();
    expect(result).toHaveProperty('futuresType');
  });

  it('should fetch futures funding rate', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, status: 200, json: () => Promise.resolve([{ symbol: 'BTCUSDT', fundingRate: '0.01', fundingTime: 1 }]) });
    const result = await getFuturesFundingRate({ symbol: 'BTCUSDT', limit: 1 });
    expect(result[0].symbol).toBe('BTCUSDT');
  });

  it('should fetch futures premium index', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, status: 200, json: () => Promise.resolve({ symbol: 'BTCUSDT', markPrice: '1', indexPrice: '1', lastFundingRate: '0.01', nextFundingTime: 1, time: 1 }) });
    const result = await getFuturesPremiumIndex('BTCUSDT');
    expect((result as { symbol: string }).symbol).toBe('BTCUSDT');
  });

  it('should fetch futures 24hr ticker', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, status: 200, json: () => Promise.resolve({ symbol: 'BTCUSDT', lastPrice: '1' }) });
    const result = await getFuturesTicker24hr('BTCUSDT');
    expect((result as { symbol: string }).symbol).toBe('BTCUSDT');
  });

  it('should fetch futures orderbook', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, status: 200, json: () => Promise.resolve({ lastUpdateId: 1, bids: [['1', '2']], asks: [['3', '4']] }) });
    const result = await getFuturesOrderbook('BTCUSDT');
    expect(result.asks).toHaveLength(1);
  });

  it('should fetch futures recent trades', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, status: 200, json: () => Promise.resolve([{ id: 1, price: '1', qty: '1', quoteQty: '1', time: 1, isBuyerMaker: true }]) });
    const result = await getFuturesRecentTrades('BTCUSDT');
    expect(result).toHaveLength(1);
  });

  it('should fetch futures klines', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, status: 200, json: () => Promise.resolve([[1, '1', '2', '3', '4', '5', 1, '6', 1, '7', '8', '9']]) });
    const result = await getFuturesKlines({ symbol: 'BTCUSDT', interval: '1m', limit: 1 });
    expect(result).toHaveLength(1);
  });

  it('should retry on rate limit', async () => {
    vi.useFakeTimers();

    mockFetch
      .mockResolvedValueOnce({
        ok: false,
        status: 429,
        headers: { get: () => '0' },
        json: () => Promise.resolve({})
      })
      .mockResolvedValueOnce({ ok: true, status: 200, json: () => Promise.resolve({}) });

    const promise = pingSpot();
    await vi.runAllTimersAsync();
    await promise;

    expect(mockFetch).toHaveBeenCalledTimes(2);
    vi.useRealTimers();
  });
});
