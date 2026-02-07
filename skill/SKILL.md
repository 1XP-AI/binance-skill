---
name: binance-market-data
version: 1.4.0
description: Public-only Binance market data skill for Spot and USDT-M Futures.
homepage: https://1xp-ai.github.io/binance-skill/
repository: https://github.com/1XP-AI/binance-skill
npm: https://www.npmjs.com/package/@1xp-ai/binance-skill
metadata: {"openclaw":{"emoji":"📊","category":"finance","api_base":"https://api.binance.com"}}
---

# Binance Market Data Skill

Public-only access to Binance **Spot** and **USDT-M Futures** market data. No API keys required. Includes lightweight analysis utilities for orderbook and trade flow.

## Skill Files

| File | Description |
|------|-------------|
| **SKILL.md** | Main instructions and API reference |
| **SECURITY.md** | Security guidelines |
| **HEARTBEAT.md** | Periodic monitoring setup |
| **package.json** | npm package metadata |

## 📦 Installation

### Library
```bash
npm install @1xp-ai/binance-skill
```

### CLI
```bash
npm install -g @1xp-ai/binance-skill
binance-skill help
```

## ✅ Public-Only Guarantee

This skill only calls **public** endpoints. No authentication, no private data, no order placement, and no WebSocket features.

## 📖 API Summary

### Spot (Public)

| Function | Description |
|----------|-------------|
| `pingSpot()` | Ping spot API |
| `getSpotServerTime()` | Spot server time |
| `getSpotExchangeInfo({ symbol?, symbols? })` | Exchange info |
| `getSpotTickerPrice(symbol?)` | Ticker price (symbol/all) |
| `getSpotOrderbook(symbol, limit?)` | Order book depth |
| `getSpotTrades(symbol, limit?)` | Recent trades |
| `getSpotKlines({ symbol, interval, startTime?, endTime?, limit? })` | Klines |

### USDT-M Futures (Public)

| Function | Description |
|----------|-------------|
| `getFuturesExchangeInfo()` | Futures exchange info |
| `getFuturesFundingRate({ symbol?, startTime?, endTime?, limit? })` | Funding rate |
| `getFuturesMarkPrice(symbol?)` | Mark price (premium index) |
| `getFuturesPremiumIndex(symbol?)` | Premium index |
| `getFuturesTicker24hr(symbol?)` | 24hr ticker |
| `getFuturesOrderbook(symbol, limit?)` | Order book depth |
| `getFuturesRecentTrades(symbol, limit?)` | Recent trades |
| `getFuturesKlines({ symbol, interval, startTime?, endTime?, limit? })` | Klines |

## 🧠 Analyzer Utilities

The following utilities are included and generic:

- Orderbook imbalance (OBI/WOBI)
- Spread and liquidity slope
- Trade flow classification
- VWAP and drift
- Market pressure and liquidity scoring

## 🧪 Testing

```bash
npm test
```

## 🔗 Links

- [Documentation](https://1xp-ai.github.io/binance-skill/)
- [npm Package](https://www.npmjs.com/package/@1xp-ai/binance-skill)
- [Repository](https://github.com/1XP-AI/binance-skill)
