# ANALYZER SPEC (ANALYZE FEATURE)

## 1) Overview
The **analyze** feature produces short-term market insight by combining **order book microstructure** and **recent trade flow** into interpretable indicators and composite scores. The goal is to help users understand **pressure, liquidity, and near-term momentum** with transparent metrics.

**Data sources**
- Order book snapshots (top N levels)
- Recent trades stream or recent trades REST

---

## 2) Inputs & Windows
- **Order book depth**: N levels (default 10; also compute for top 1 / top 5)
- **Trade window**: rolling time window (default 30s) and trade-count window (e.g., last 100 trades)
- **Interval**: 1s/5s/30s aggregation for stability

---

## 3) Indicators (Definitions)

### A. Order Book Microstructure
1) **Order Book Imbalance (OBI)**
```
OBI = (Σ bid_size − Σ ask_size) / (Σ bid_size + Σ ask_size)
```
- Compute at depths: top1, top5, top10
- Range: [-1, 1]; >0 means bid-heavy

2) **Weighted OBI (WOBI)**
```
WOBI = (Σ w_i * bid_i − Σ w_i * ask_i) / (Σ w_i * bid_i + Σ w_i * ask_i)
```
- `w_i` decays by distance from mid (e.g., exp/linear)
- Emphasizes near-top liquidity

3) **Spread**
```
Spread = best_ask − best_bid
Spread% = Spread / mid_price
```
- Track widening/narrowing (risk signal)

4) **Liquidity Slope / Pressure**
- Linear regression of cumulative depth vs price distance
- **Steeper slope** = thicker liquidity; **flat** = thin book

5) **Liquidity Wall / Void**
- Identify unusually large orders (e.g., >95th percentile size)
- Detect gaps in depth (voids)

### B. Trade Flow Signals
1) **Aggressor Side (Buy/Sell)**
- Use **tick rule** or quote rule to classify

2) **Volume Imbalance (VI)**
```
VI = (buy_volume − sell_volume) / total_volume
```

3) **Trade Burst**
- Trades/sec or volume/sec exceeds threshold

4) **VWAP Drift**
```
VWAP = Σ(price * volume) / Σ(volume)
Drift = last_price − VWAP
```

5) **Whale Prints**
- Trades exceeding percentile threshold (e.g., 95%)

### C. Combined / Impact
1) **Price Impact**
- Mid-price change after large trades (1–3s horizon)

2) **Resilience**
- Time to refill top levels after depletion

---

## 4) Composite Scores

### A. Market Pressure Index (MPI)
- Combines order book + trade imbalance + spread dynamics
- Example (weights adjustable):
```
MPI = 0.4*WOBI + 0.3*VI − 0.2*Spread% + 0.1*VWAP_Drift_z
```
- Range: normalized to [-1, 1]

### B. Liquidity Score
- Combines depth, slope, spread stability
```
Liquidity = normalize(Depth10) + normalize(Slope) − normalize(Spread%)
```

---

## 5) Output Schema (JSON)
```json
{
  "timestamp": 1700000000,
  "symbol": "BTC/KRW",
  "orderbook": {
    "obi": {"top1": 0.12, "top5": 0.08, "top10": 0.05},
    "wobi": 0.10,
    "spread": {"value": 2000, "pct": 0.0004},
    "liquiditySlope": 1.7,
    "walls": [{"side":"bid","price": 49800000,"size": 12.5}],
    "voids": [{"side":"ask","price": 50100000,"gap": 0.004}]
  },
  "trades": {
    "buyVolume": 12.3,
    "sellVolume": 8.1,
    "volumeImbalance": 0.21,
    "vwap": 49950000,
    "vwapDrift": 35000,
    "burst": {"tradesPerSec": 8.5, "flag": true},
    "whales": [{"price": 50000000, "size": 3.2}]
  },
  "scores": {
    "marketPressure": 0.32,
    "liquidityScore": 0.58
  },
  "flags": [
    "aggressive_buy_wave",
    "thin_book_risk"
  ]
}
```

---

## 6) Interpretation Guide
- **MarketPressure > 0.3** → buy-side pressure
- **MarketPressure < -0.3** → sell-side pressure
- **LiquidityScore < 0.2** → thin book risk
- **Spread widening** + **negative MPI** → caution / potential drop

---

## 7) Limitations
- Order book spoofing can distort signals
- Trade classification is heuristic
- Low-liquidity pairs may be noisy

---

## 8) Implementation Tasks (Derived)
1) Normalize order book snapshot (depth N, mid-price, spread)
2) Compute OBI/WOBI + slope
3) Trade classification + VI/VWAP/whale detection
4) Composite score functions (MPI, Liquidity)
5) Flags + thresholds (configurable)
6) Output schema + docs update
