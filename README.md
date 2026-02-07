# @1xp-ai/binance-skill

[![npm version](https://img.shields.io/npm/v/@1xp-ai/binance-skill.svg)](https://www.npmjs.com/package/@1xp-ai/binance-skill)
[![npm downloads](https://img.shields.io/npm/dm/@1xp-ai/binance-skill.svg)](https://www.npmjs.com/package/@1xp-ai/binance-skill)
[![Coverage](https://img.shields.io/badge/Coverage-90%25-brightgreen.svg)](https://github.com/1XP-AI/binance-skill)
[![Tests](https://github.com/1XP-AI/binance-skill/actions/workflows/ci.yml/badge.svg)](https://github.com/1XP-AI/binance-skill/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)

> 🤖 Public-only Binance market data skill (Spot + USDT-M Futures)

A lightweight, public-only wrapper for Binance market data with built-in backoff handling for rate limits. No API keys required.

## 📦 Installation

```bash
npm install @1xp-ai/binance-skill
```

## 🚀 Quick Start

```typescript
import {
  pingSpot,
  getSpotTickerPrice,
  getSpotOrderbook,
  getFuturesTicker24hr
} from '@1xp-ai/binance-skill';

await pingSpot();

const ticker = await getSpotTickerPrice('BTCUSDT');
console.log(`BTCUSDT price: ${ticker.price}`);

const orderbook = await getSpotOrderbook('BTCUSDT', 100);
console.log(`Top bid: ${orderbook.bids[0][0]}`);

const futuresTicker = await getFuturesTicker24hr('BTCUSDT');
console.log(`Futures 24h last: ${(futuresTicker as { lastPrice: string }).lastPrice}`);
```

## ✨ Features

### 📊 Spot Public Data
- Ping and server time
- Exchange info
- Ticker price (single/all)
- Order book, recent trades, klines

### 📈 USDT-M Futures Public Data
- Exchange info
- Funding rate, mark price, premium index
- 24hr ticker, order book, recent trades, klines

### 🧠 Analysis Utilities
- Generic orderbook analysis helpers
- Microstructure analytics (OBI/WOBI, VWAP, liquidity slope)

## 📖 API Reference (Summary)

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

## 🧪 Testing

```bash
npm test
```

## 📁 Project Structure

```
binance-skill/
├── src/
│   ├── api/
│   │   └── public.ts    # Spot + Futures public endpoints
│   ├── analyzer.ts      # Microstructure analysis utilities
│   ├── trading.ts       # Generic analysis helpers
│   └── index.ts         # Main exports
├── skill/               # Skill documentation (GitHub Pages)
│   ├── SKILL.md
│   ├── SECURITY.md
│   └── HEARTBEAT.md
└── docs/                # Internal documentation
    ├── API.md
    └── VERSIONING.md
```

## 📄 License

MIT © [1XP-AI](https://github.com/1XP-AI)

## 🔗 Links

- [📘 Skill Documentation](https://1xp-ai.github.io/binance-skill/)
- [📦 npm Package](https://www.npmjs.com/package/@1xp-ai/binance-skill)
- [🐛 Issues](https://github.com/1XP-AI/binance-skill/issues)
