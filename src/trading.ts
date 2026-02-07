export type OrderbookLevel = { price: string | number; qty: string | number };

export type Orderbook = {
	bids?: OrderbookLevel[];
	asks?: OrderbookLevel[];
};

export type MarketAnalysis = {
	bestBid: number | null;
	bestAsk: number | null;
	spread: number | null;
	spreadPercent: number | null;
	bidDepth: number;
	askDepth: number;
	imbalance: number | null;
};

function toNumber(value: string | number): number {
	return typeof value === 'string' ? parseFloat(value) : value;
}

export function analyzeMarket(orderbook: Orderbook): MarketAnalysis {
	const bids = orderbook.bids ?? [];
	const asks = orderbook.asks ?? [];

	const bestBid = bids.length > 0 ? toNumber(bids[0].price) : null;
	const bestAsk = asks.length > 0 ? toNumber(asks[0].price) : null;

	const spread = bestBid !== null && bestAsk !== null ? bestAsk - bestBid : null;
	const spreadPercent =
		spread !== null && bestBid !== null && bestBid !== 0 ? (spread / bestBid) * 100 : null;

	const bidDepth = bids.reduce((sum, b) => sum + toNumber(b.qty), 0);
	const askDepth = asks.reduce((sum, a) => sum + toNumber(a.qty), 0);

	const imbalance =
		bidDepth + askDepth > 0 ? (bidDepth - askDepth) / (bidDepth + askDepth) : null;

	return { bestBid, bestAsk, spread, spreadPercent, bidDepth, askDepth, imbalance };
}

export type SlippageResult = {
	averagePrice: number;
	slippagePercent: number;
	filledQty: number;
};

export function calculateSlippage(
	levels: OrderbookLevel[],
	qty: number,
	basePrice?: number
): SlippageResult {
	let filledQty = 0;
	let totalCost = 0;

	for (const level of levels) {
		const available = toNumber(level.qty);
		const price = toNumber(level.price);
		const fillAmount = Math.min(available, qty - filledQty);

		totalCost += fillAmount * price;
		filledQty += fillAmount;

		if (filledQty >= qty) break;
	}

	const averagePrice = filledQty > 0 ? totalCost / filledQty : 0;
	const base = basePrice ?? (levels[0] ? toNumber(levels[0].price) : averagePrice);
	const slippagePercent = base > 0 ? ((averagePrice - base) / base) * 100 : 0;

	return { averagePrice, slippagePercent, filledQty };
}

export type OrderType = 'LIMIT' | 'MARKET';

export function recommendOrderType(spreadPercent: number, threshold: number): OrderType {
	return spreadPercent > threshold ? 'LIMIT' : 'MARKET';
}

export function splitOrder(totalQty: number, maxSingleOrder: number): number[] {
	if (maxSingleOrder <= 0) return [totalQty];
	const numOrders = Math.ceil(totalQty / maxSingleOrder);
	const orderSizes = Array(numOrders).fill(maxSingleOrder);
	const remainder = totalQty % maxSingleOrder;
	orderSizes[orderSizes.length - 1] = remainder || maxSingleOrder;
	return orderSizes;
}

export type RiskCheckInput = {
	availableKRW: number;
	orderAmount: number;
	minOrderKRW?: number;
};

export function checkRisk({ availableKRW, orderAmount, minOrderKRW = 0 }: RiskCheckInput): {
	isValid: boolean;
	reasons: string[];
} {
	const reasons: string[] = [];
	if (orderAmount > availableKRW) reasons.push('INSUFFICIENT_BALANCE');
	if (orderAmount < minOrderKRW) reasons.push('BELOW_MIN_ORDER');
	return { isValid: reasons.length === 0, reasons };
}

export function maxBuyableQty(availableKRW: number, currentPrice: number): number {
	if (currentPrice <= 0) return 0;
	return availableKRW / currentPrice;
}
