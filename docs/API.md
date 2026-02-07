# Binance Public API Reference (Spot + USDT-M Futures)

This skill is **public-only** and does **not** use API keys. It supports a focused subset of Binance public endpoints for market data.

## Base URLs

- Spot: `https://api.binance.com`
- USDT-M Futures: `https://fapi.binance.com`

## Supported Spot Endpoints

| Purpose | Endpoint | Function |
|---------|----------|----------|
| Ping | `GET /api/v3/ping` | `pingSpot()` |
| Server Time | `GET /api/v3/time` | `getSpotServerTime()` |
| Exchange Info | `GET /api/v3/exchangeInfo` | `getSpotExchangeInfo({ symbol?, symbols? })` |
| Ticker Price | `GET /api/v3/ticker/price` | `getSpotTickerPrice(symbolOrParams?)` (string or `{ symbol }`) |
| Order Book | `GET /api/v3/depth` | `getSpotOrderbook(symbol, limit?)` |
| Recent Trades | `GET /api/v3/trades` | `getSpotTrades(symbol, limit?)` |
| Klines | `GET /api/v3/klines` | `getSpotKlines({ symbol, interval, startTime?, endTime?, limit? })` |

## Supported USDT-M Futures Endpoints

| Purpose | Endpoint | Function |
|---------|----------|----------|
| Exchange Info | `GET /fapi/v1/exchangeInfo` | `getFuturesExchangeInfo()` |
| Funding Rate | `GET /fapi/v1/fundingRate` | `getFuturesFundingRate({ symbol?, startTime?, endTime?, limit? })` |
| Mark Price / Premium Index | `GET /fapi/v1/premiumIndex` | `getFuturesMarkPrice(symbol?)`, `getFuturesPremiumIndex(symbol?)` |
| 24hr Ticker | `GET /fapi/v1/ticker/24hr` | `getFuturesTicker24hr(symbol?)` |
| Order Book | `GET /fapi/v1/depth` | `getFuturesOrderbook(symbol, limit?)` |
| Recent Trades | `GET /fapi/v1/trades` | `getFuturesRecentTrades(symbol, limit?)` |
| Klines | `GET /fapi/v1/klines` | `getFuturesKlines({ symbol, interval, startTime?, endTime?, limit? })` |

## Rate Limit Handling

The client implements a simple backoff for HTTP `429` and `418` responses. It retries a few times with exponential delay and a small jitter.
