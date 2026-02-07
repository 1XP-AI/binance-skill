# Integration Tests (Binance Skill)

This document outlines public-only integration checks for the Binance market data skill.

## Spot

- `pingSpot()` returns success
- `getSpotServerTime()` returns a numeric `serverTime`
- `getSpotExchangeInfo()` returns symbols list
- `getSpotTickerPrice('BTCUSDT')` returns a price
- `getSpotOrderbook('BTCUSDT')` returns bids/asks arrays
- `getSpotTrades('BTCUSDT')` returns recent trades
- `getSpotKlines({ symbol: 'BTCUSDT', interval: '1h' })` returns OHLCV arrays

## USDT-M Futures

- `getFuturesExchangeInfo()` returns symbol info
- `getFuturesFundingRate({ symbol: 'BTCUSDT' })` returns funding rate entries
- `getFuturesMarkPrice('BTCUSDT')` returns mark price
- `getFuturesTicker24hr('BTCUSDT')` returns 24h stats
- `getFuturesOrderbook('BTCUSDT')` returns depth data
- `getFuturesRecentTrades('BTCUSDT')` returns recent trades
- `getFuturesKlines({ symbol: 'BTCUSDT', interval: '1h' })` returns OHLCV arrays
