#!/usr/bin/env node

import { argv } from 'node:process';
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
  getFuturesMarkPrice,
  getFuturesPremiumIndex,
  getFuturesTicker24hr,
  getFuturesOrderbook,
  getFuturesRecentTrades,
  getFuturesKlines
} from './api/public.js';
import { analyzeMarket, calculateSlippage, recommendOrderType } from './trading.js';

function printHelp(): void {
  console.log(`binance-skill CLI

Usage:
  binance-skill <command> [options]

Spot (public):
  ping                          Spot API ping
  time                          Spot server time
  exchange-info [symbol]        Spot exchange info
  ticker [symbol]               Spot ticker price (symbol or all)
  orderbook <symbol> [limit]    Spot orderbook depth
  trades <symbol> [limit]       Spot recent trades
  klines <symbol> <interval> [limit]  Spot klines
  analyze <symbol>              Simple orderbook analysis

USDT-M Futures (public):
  futures-exchange-info         Futures exchange info
  futures-funding-rate [symbol] [limit]
  futures-mark-price [symbol]
  futures-premium-index [symbol]
  futures-ticker [symbol]       Futures 24hr ticker
  futures-orderbook <symbol> [limit]
  futures-trades <symbol> [limit]
  futures-klines <symbol> <interval> [limit]

Examples:
  binance-skill ping
  binance-skill time
  binance-skill ticker BTCUSDT
  binance-skill orderbook BTCUSDT 100
  binance-skill trades ETHUSDT 50
  binance-skill klines BTCUSDT 1h 100
  binance-skill futures-ticker BTCUSDT
`);
}

function parseLimit(arg?: string, fallback = 100): number {
  if (!arg) return fallback;
  const value = Number(arg);
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

async function main(): Promise<void> {
  const command = argv[2] ?? 'help';
  const arg1 = argv[3];
  const arg2 = argv[4];
  const arg3 = argv[5];

  try {
    switch (command) {
      case 'ping': {
        await pingSpot();
        console.log('Spot API: pong');
        break;
      }

      case 'time': {
        const time = await getSpotServerTime();
        console.log(`Spot server time: ${time.serverTime}`);
        break;
      }

      case 'exchange-info': {
        const data = await getSpotExchangeInfo(arg1 ? { symbol: arg1.toUpperCase() } : undefined);
        console.log(JSON.stringify(data, null, 2));
        break;
      }

      case 'ticker': {
        const data = await getSpotTickerPrice(arg1 ? arg1.toUpperCase() : undefined);
        console.log(JSON.stringify(data, null, 2));
        break;
      }

      case 'orderbook': {
        if (!arg1) {
          console.error('Error: Symbol required. Example: binance-skill orderbook BTCUSDT');
          process.exit(1);
        }
        const limit = parseLimit(arg2, 100);
        const ob = await getSpotOrderbook(arg1.toUpperCase(), limit);
        console.log(JSON.stringify(ob, null, 2));
        break;
      }

      case 'trades': {
        if (!arg1) {
          console.error('Error: Symbol required. Example: binance-skill trades BTCUSDT');
          process.exit(1);
        }
        const limit = parseLimit(arg2, 50);
        const trades = await getSpotTrades(arg1.toUpperCase(), limit);
        console.log(JSON.stringify(trades, null, 2));
        break;
      }

      case 'klines': {
        if (!arg1 || !arg2) {
          console.error('Error: Symbol and interval required. Example: binance-skill klines BTCUSDT 1h');
          process.exit(1);
        }
        const limit = parseLimit(arg3, 100);
        const klines = await getSpotKlines({ symbol: arg1.toUpperCase(), interval: arg2, limit });
        console.log(JSON.stringify(klines, null, 2));
        break;
      }

      case 'analyze': {
        if (!arg1) {
          console.error('Error: Symbol required. Example: binance-skill analyze BTCUSDT');
          process.exit(1);
        }
        const ob = await getSpotOrderbook(arg1.toUpperCase(), 100);
        const normalize = (side: [string, string][]) => side.map(([price, qty]) => ({ price, qty }));
        const analysis = analyzeMarket({ bids: normalize(ob.bids), asks: normalize(ob.asks) });

        console.log(`${arg1.toUpperCase()} Spot Market Analysis`);
        console.log('─'.repeat(40));
        console.log(`Best Bid:    ${analysis.bestBid ?? 0}`);
        console.log(`Best Ask:    ${analysis.bestAsk ?? 0}`);
        console.log(`Spread:      ${analysis.spread ?? 0} (${analysis.spreadPercent?.toFixed(4)}%)`);
        console.log(`Bid Depth:   ${analysis.bidDepth.toFixed(4)}`);
        console.log(`Ask Depth:   ${analysis.askDepth.toFixed(4)}`);
        console.log(`Imbalance:   ${analysis.imbalance?.toFixed(4)}`);

        const slippage = calculateSlippage(normalize(ob.asks), 1);
        console.log(`\nSlippage (1 ${arg1.toUpperCase()}):`);
        console.log(`  Avg Price: ${slippage.averagePrice.toFixed(4)}`);
        console.log(`  Slippage:  ${slippage.slippagePercent.toFixed(4)}%`);

        const orderType = recommendOrderType(analysis.spreadPercent ?? 0, 0.1);
        console.log(`\nRecommendation: ${orderType} order`);
        break;
      }

      case 'futures-exchange-info': {
        const data = await getFuturesExchangeInfo();
        console.log(JSON.stringify(data, null, 2));
        break;
      }

      case 'futures-funding-rate': {
        const limit = parseLimit(arg2, 100);
        const data = await getFuturesFundingRate({ symbol: arg1?.toUpperCase(), limit });
        console.log(JSON.stringify(data, null, 2));
        break;
      }

      case 'futures-mark-price': {
        const data = await getFuturesMarkPrice(arg1?.toUpperCase());
        console.log(JSON.stringify(data, null, 2));
        break;
      }

      case 'futures-premium-index': {
        const data = await getFuturesPremiumIndex(arg1?.toUpperCase());
        console.log(JSON.stringify(data, null, 2));
        break;
      }

      case 'futures-ticker': {
        const data = await getFuturesTicker24hr(arg1?.toUpperCase());
        console.log(JSON.stringify(data, null, 2));
        break;
      }

      case 'futures-orderbook': {
        if (!arg1) {
          console.error('Error: Symbol required. Example: binance-skill futures-orderbook BTCUSDT');
          process.exit(1);
        }
        const limit = parseLimit(arg2, 100);
        const data = await getFuturesOrderbook(arg1.toUpperCase(), limit);
        console.log(JSON.stringify(data, null, 2));
        break;
      }

      case 'futures-trades': {
        if (!arg1) {
          console.error('Error: Symbol required. Example: binance-skill futures-trades BTCUSDT');
          process.exit(1);
        }
        const limit = parseLimit(arg2, 50);
        const data = await getFuturesRecentTrades(arg1.toUpperCase(), limit);
        console.log(JSON.stringify(data, null, 2));
        break;
      }

      case 'futures-klines': {
        if (!arg1 || !arg2) {
          console.error('Error: Symbol and interval required. Example: binance-skill futures-klines BTCUSDT 1h');
          process.exit(1);
        }
        const limit = parseLimit(arg3, 100);
        const data = await getFuturesKlines({ symbol: arg1.toUpperCase(), interval: arg2, limit });
        console.log(JSON.stringify(data, null, 2));
        break;
      }

      case 'help':
      default:
        printHelp();
        break;
    }
  } catch (error) {
    console.error('Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

main();
