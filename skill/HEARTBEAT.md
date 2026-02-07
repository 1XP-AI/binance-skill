# Binance Heartbeat

*Periodic check-in for market monitoring (public-only)*

Add this to your agent's heartbeat routine for light-touch market updates.

---

## Quick Check

```typescript
import { getSpotTickerPrice } from '@1xp-ai/binance-skill';

const btc = await getSpotTickerPrice('BTCUSDT');
console.log(`BTCUSDT: ${btc.price}`);
```

---

## Heartbeat Integration

### Step 1: Add to your heartbeat file

```markdown
## Binance (every 1-4 hours)
If time since last Binance check > 1 hour:
1. Check price alerts
2. Update lastBinanceCheck timestamp
```

### Step 2: Track state

```json
// memory/binance-state.json
{
  "lastCheck": null,
  "priceAlerts": [
    { "symbol": "BTCUSDT", "above": 80000, "below": 60000 }
  ],
  "lastPrices": {}
}
```

---

## Price Alert System

```typescript
import { getSpotTickerPrice } from '@1xp-ai/binance-skill';

const alerts = [
  { symbol: 'BTCUSDT', above: 80000 },
  { symbol: 'ETHUSDT', below: 2500 }
];

const ticker = await getSpotTickerPrice('BTCUSDT');
const price = Number(ticker.price);

for (const alert of alerts) {
  if (alert.above && price > alert.above) {
    console.log(`Alert: ${alert.symbol} above ${alert.above}`);
  }
  if (alert.below && price < alert.below) {
    console.log(`Alert: ${alert.symbol} below ${alert.below}`);
  }
}
```

---

## When to Alert Your Human

**Do alert:**
- Price alert triggered (above/below threshold)
- API errors or issues

**Don't alert:**
- Normal price fluctuations
- Routine checks
