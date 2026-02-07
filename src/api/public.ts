/**
 * Binance Public API (Spot + USDT-M Futures)
 * Public market data endpoints only.
 */

const SPOT_BASE_URL = 'https://api.binance.com';
const FUTURES_BASE_URL = 'https://fapi.binance.com';
const USER_AGENT = 'binance-skill';

const DEFAULT_RETRIES = 3;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function buildQuery(params: Record<string, string | number | undefined>): string {
  const entries = Object.entries(params).filter(([, value]) => value !== undefined);
  if (entries.length === 0) return '';
  const search = new URLSearchParams();
  for (const [key, value] of entries) {
    search.set(key, String(value));
  }
  return `?${search.toString()}`;
}

function fetchWithUA(url: string, init?: RequestInit): Promise<Response> {
  return globalThis.fetch(url, {
    ...init,
    headers: {
      'User-Agent': USER_AGENT,
      ...(init?.headers ?? {})
    }
  });
}

async function parseError(response: Response): Promise<string> {
  try {
    const data = (await response.json()) as { msg?: string; message?: string; code?: number };
    if (data?.msg) return `API Error: ${data.msg}`;
    if (data?.message) return `API Error: ${data.message}`;
    if (data?.code !== undefined) return `API Error: code ${data.code}`;
  } catch {
    // ignore
  }
  return `HTTP Error: ${response.status}`;
}

async function fetchJsonWithBackoff(url: string, init?: RequestInit, retries = DEFAULT_RETRIES) {
  let attempt = 0;

  while (true) {
    const response = await fetchWithUA(url, init);

    if (response.status === 429 || response.status === 418) {
      if (attempt >= retries) {
        throw new Error(`Rate limited (${response.status}) after ${attempt + 1} attempts`);
      }

      const retryAfter = response.headers.get('Retry-After');
      const retryMs = retryAfter ? Number(retryAfter) * 1000 : Math.min(500 * 2 ** attempt, 8000);
      const jitter = Math.floor(Math.random() * 100);
      await sleep(retryMs + jitter);
      attempt += 1;
      continue;
    }

    if (!response.ok) {
      throw new Error(await parseError(response));
    }

    return response.json();
  }
}

// -----------------------------
// Spot public endpoints
// -----------------------------

export async function pingSpot(): Promise<void> {
  await fetchJsonWithBackoff(`${SPOT_BASE_URL}/api/v3/ping`);
}

export async function getSpotServerTime(): Promise<{ serverTime: number }> {
  return (await fetchJsonWithBackoff(`${SPOT_BASE_URL}/api/v3/time`)) as { serverTime: number };
}

export type SpotExchangeInfo = Record<string, unknown>;

export async function getSpotExchangeInfo(params?: {
  symbol?: string;
  symbols?: string[];
}): Promise<SpotExchangeInfo> {
  const query = buildQuery({
    symbol: params?.symbol,
    symbols: params?.symbols ? JSON.stringify(params.symbols) : undefined
  });
  return (await fetchJsonWithBackoff(`${SPOT_BASE_URL}/api/v3/exchangeInfo${query}`)) as SpotExchangeInfo;
}

export type SpotTickerPrice = { symbol: string; price: string };

export async function getSpotTickerPrice(symbol?: string): Promise<SpotTickerPrice | SpotTickerPrice[]> {
  const query = buildQuery({ symbol });
  return (await fetchJsonWithBackoff(`${SPOT_BASE_URL}/api/v3/ticker/price${query}`)) as
    | SpotTickerPrice
    | SpotTickerPrice[];
}

export type SpotOrderbook = {
  lastUpdateId: number;
  bids: [string, string][];
  asks: [string, string][];
};

export async function getSpotOrderbook(symbol: string, limit = 100): Promise<SpotOrderbook> {
  const query = buildQuery({ symbol, limit });
  return (await fetchJsonWithBackoff(`${SPOT_BASE_URL}/api/v3/depth${query}`)) as SpotOrderbook;
}

export type SpotTrade = {
  id: number;
  price: string;
  qty: string;
  quoteQty: string;
  time: number;
  isBuyerMaker: boolean;
  isBestMatch: boolean;
};

export async function getSpotTrades(symbol: string, limit = 500): Promise<SpotTrade[]> {
  const query = buildQuery({ symbol, limit });
  return (await fetchJsonWithBackoff(`${SPOT_BASE_URL}/api/v3/trades${query}`)) as SpotTrade[];
}

export type SpotKline = [
  number,
  string,
  string,
  string,
  string,
  string,
  number,
  string,
  number,
  string,
  string,
  string
];

export async function getSpotKlines(params: {
  symbol: string;
  interval: string;
  startTime?: number;
  endTime?: number;
  limit?: number;
}): Promise<SpotKline[]> {
  const query = buildQuery(params);
  return (await fetchJsonWithBackoff(`${SPOT_BASE_URL}/api/v3/klines${query}`)) as SpotKline[];
}

// -----------------------------
// USDT-M Futures public endpoints
// -----------------------------

export type FuturesExchangeInfo = Record<string, unknown>;

export async function getFuturesExchangeInfo(): Promise<FuturesExchangeInfo> {
  return (await fetchJsonWithBackoff(`${FUTURES_BASE_URL}/fapi/v1/exchangeInfo`)) as FuturesExchangeInfo;
}

export type FuturesFundingRate = {
  symbol: string;
  fundingRate: string;
  fundingTime: number;
  markPrice?: string;
};

export async function getFuturesFundingRate(params?: {
  symbol?: string;
  startTime?: number;
  endTime?: number;
  limit?: number;
}): Promise<FuturesFundingRate[]> {
  const query = buildQuery(params ?? {});
  return (await fetchJsonWithBackoff(`${FUTURES_BASE_URL}/fapi/v1/fundingRate${query}`)) as FuturesFundingRate[];
}

export type FuturesPremiumIndex = {
  symbol: string;
  markPrice: string;
  indexPrice: string;
  lastFundingRate: string;
  nextFundingTime: number;
  time: number;
};

export async function getFuturesPremiumIndex(symbol?: string): Promise<FuturesPremiumIndex | FuturesPremiumIndex[]> {
  const query = buildQuery({ symbol });
  return (await fetchJsonWithBackoff(`${FUTURES_BASE_URL}/fapi/v1/premiumIndex${query}`)) as
    | FuturesPremiumIndex
    | FuturesPremiumIndex[];
}

export async function getFuturesMarkPrice(symbol?: string): Promise<FuturesPremiumIndex | FuturesPremiumIndex[]> {
  return getFuturesPremiumIndex(symbol);
}

export type FuturesTicker24hr = Record<string, unknown>;

export async function getFuturesTicker24hr(symbol?: string): Promise<FuturesTicker24hr | FuturesTicker24hr[]> {
  const query = buildQuery({ symbol });
  return (await fetchJsonWithBackoff(`${FUTURES_BASE_URL}/fapi/v1/ticker/24hr${query}`)) as
    | FuturesTicker24hr
    | FuturesTicker24hr[];
}

export type FuturesOrderbook = {
  lastUpdateId: number;
  E?: number;
  T?: number;
  bids: [string, string][];
  asks: [string, string][];
};

export async function getFuturesOrderbook(symbol: string, limit = 100): Promise<FuturesOrderbook> {
  const query = buildQuery({ symbol, limit });
  return (await fetchJsonWithBackoff(`${FUTURES_BASE_URL}/fapi/v1/depth${query}`)) as FuturesOrderbook;
}

export type FuturesTrade = {
  id: number;
  price: string;
  qty: string;
  quoteQty: string;
  time: number;
  isBuyerMaker: boolean;
};

export async function getFuturesRecentTrades(symbol: string, limit = 500): Promise<FuturesTrade[]> {
  const query = buildQuery({ symbol, limit });
  return (await fetchJsonWithBackoff(`${FUTURES_BASE_URL}/fapi/v1/trades${query}`)) as FuturesTrade[];
}

export type FuturesKline = SpotKline;

export async function getFuturesKlines(params: {
  symbol: string;
  interval: string;
  startTime?: number;
  endTime?: number;
  limit?: number;
}): Promise<FuturesKline[]> {
  const query = buildQuery(params);
  return (await fetchJsonWithBackoff(`${FUTURES_BASE_URL}/fapi/v1/klines${query}`)) as FuturesKline[];
}
