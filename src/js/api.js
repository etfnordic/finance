/**
 * api.js — all external data fetching
 * Keys are loaded from .env (never committed to git)
 */

const AV_KEY   = import.meta.env.VITE_ALPHA_VANTAGE_KEY;
const NEWS_KEY = import.meta.env.VITE_NEWS_API_KEY;
const AV_BASE  = 'https://www.alphavantage.co/query';
const CG_BASE  = 'https://api.coingecko.com/api/v3';

/* ─── simple in-memory cache ─── */
const _cache = new Map();
async function get(url, ttl = 60_000) {
  const now = Date.now();
  if (_cache.has(url)) {
    const { data, ts } = _cache.get(url);
    if (now - ts < ttl) return data;
  }
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  const data = await res.json();
  _cache.set(url, { data, ts: now });
  return data;
}

/* ════════════════════════════════
   ALPHA VANTAGE
   Free tier: 25 req/day, 5 req/min
════════════════════════════════ */

/** Fetch a real-time global quote for one symbol */
export async function fetchQuote(symbol) {
  const data = await get(
    `${AV_BASE}?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${AV_KEY}`,
    300_000 // 5-min cache
  );
  return data['Global Quote'] ?? null;
}

/** Batch-fetch quotes. Returns Map<symbol, quoteObj> */
export async function fetchQuotes(symbols) {
  const results = await Promise.allSettled(symbols.map(s => fetchQuote(s)));
  const map = new Map();
  symbols.forEach((s, i) => {
    if (results[i].status === 'fulfilled' && results[i].value) {
      map.set(s, results[i].value);
    }
  });
  return map;
}

/** Parse an Alpha Vantage quote object into a clean shape */
export function parseQuote(q) {
  if (!q) return null;
  const price = parseFloat(q['05. price']);
  const prev  = parseFloat(q['08. previous close']);
  const chgAbs = parseFloat(q['09. change']);
  const chgPct = parseFloat(q['10. change percent']?.replace('%', ''));
  const vol    = parseInt(q['06. volume']);
  return {
    sym:    q['01. symbol'],
    price,
    prev,
    chgAbs,
    chgPct: isNaN(chgPct) ? ((price - prev) / prev) * 100 : chgPct,
    vol:    isNaN(vol) ? null : vol,
    high:   parseFloat(q['03. high']),
    low:    parseFloat(q['04. low']),
    open:   parseFloat(q['02. open']),
  };
}

/* ════════════════════════════════
   COINGECKO  (no key required)
════════════════════════════════ */

export const COIN_IDS = [
  'bitcoin','ethereum','solana','binancecoin',
  'ripple','cardano','avalanche-2','dogecoin',
];

export const COIN_META = {
  bitcoin:       { sym:'BTC',  color:'#f7931a' },
  ethereum:      { sym:'ETH',  color:'#627eea' },
  solana:        { sym:'SOL',  color:'#9945ff' },
  binancecoin:   { sym:'BNB',  color:'#f3ba2f' },
  ripple:        { sym:'XRP',  color:'#346aa9' },
  cardano:       { sym:'ADA',  color:'#0033ad' },
  'avalanche-2': { sym:'AVAX', color:'#e84142' },
  dogecoin:      { sym:'DOGE', color:'#c2a633' },
};

export async function fetchCryptoPrices() {
  return get(
    `${CG_BASE}/coins/markets?vs_currency=usd&ids=${COIN_IDS.join(',')}&sparkline=false&price_change_percentage=24h`,
    60_000
  );
}

export async function fetchCryptoGlobal() {
  return get(`${CG_BASE}/global`, 120_000);
}

/* ════════════════════════════════
   NEWSAPI
   Free tier: 100 req/day
   CORS: works on localhost. For
   production deploy a small proxy
   (see README for Cloudflare Worker
   snippet).
════════════════════════════════ */

export async function fetchFinanceNews() {
  // newsapi.org blocks browser requests in production (CORS).
  // Use the proxy path /api/news when deployed (see README).
  const url = `https://newsapi.org/v2/everything?q=stock+market+OR+investing+OR+%22federal+reserve%22+OR+cryptocurrency&language=en&sortBy=publishedAt&pageSize=20&apiKey=${NEWS_KEY}`;
  try {
    const data = await get(url, 600_000);
    return (data.articles || []).filter(a => a.title && a.title !== '[Removed]');
  } catch (_) {
    return null; // fall back to static content
  }
}

/* ════════════════════════════════
   STATIC FALLBACKS
   (shown when APIs are rate-limited
   or user hasn't deployed proxy yet)
════════════════════════════════ */

export const STATIC_STOCKS = [
  { sym:'AAPL',  name:'Apple Inc.',           price:227.48,  chgPct: 1.23,  vol:'58.2M', cap:'$3.52T', col:'#1d1d1f' },
  { sym:'MSFT',  name:'Microsoft Corp.',       price:415.32,  chgPct: 0.87,  vol:'22.1M', cap:'$3.08T', col:'#0078d4' },
  { sym:'NVDA',  name:'NVIDIA Corp.',           price:138.85,  chgPct: 3.14,  vol:'201M',  cap:'$3.41T', col:'#76b900' },
  { sym:'GOOGL', name:'Alphabet Inc.',          price:197.40,  chgPct:-0.52,  vol:'24.8M', cap:'$2.44T', col:'#4285f4' },
  { sym:'AMZN',  name:'Amazon.com Inc.',        price:218.74,  chgPct: 1.75,  vol:'38.6M', cap:'$2.31T', col:'#ff9900' },
  { sym:'META',  name:'Meta Platforms Inc.',    price:612.13,  chgPct: 2.04,  vol:'16.2M', cap:'$1.56T', col:'#0866ff' },
  { sym:'TSLA',  name:'Tesla Inc.',             price:352.56,  chgPct:-1.87,  vol:'112M',  cap:'$1.13T', col:'#cc0000' },
  { sym:'BRK.B', name:'Berkshire Hathaway B',  price:475.20,  chgPct: 0.31,  vol:'3.2M',  cap:'$693B',  col:'#7c5c4a' },
];

export const STATIC_ETFS = [
  { sym:'SPY',  name:'SPDR S&P 500 ETF',       price:568.42, chgPct: 0.64, vol:'62M',  cap:'$563B' },
  { sym:'QQQ',  name:'Invesco QQQ Trust',        price:490.17, chgPct: 0.91, vol:'34M',  cap:'$290B' },
  { sym:'VTI',  name:'Vanguard Total Market',    price:278.53, chgPct: 0.57, vol:'5.1M', cap:'$458B' },
  { sym:'VOO',  name:'Vanguard S&P 500',         price:522.38, chgPct: 0.62, vol:'5.8M', cap:'$530B' },
  { sym:'IWM',  name:'iShares Russell 2000',     price:215.44, chgPct:-0.34, vol:'22M',  cap:'$58B'  },
  { sym:'ARKK', name:'ARK Innovation ETF',       price:68.14,  chgPct: 2.31, vol:'9.4M', cap:'$8.1B' },
];

export const STATIC_COMMODITIES = [
  { sym:'GOLD',   name:'Gold Spot (USD/oz)',       price:2642.30, chgPct: 0.18 },
  { sym:'SILVER', name:'Silver Spot (USD/oz)',      price:29.84,   chgPct: 0.62 },
  { sym:'WTI',    name:'Crude Oil WTI (USD/bbl)',   price:71.22,   chgPct:-0.94 },
  { sym:'NATGAS', name:'Natural Gas (USD/MMBtu)',   price:3.48,    chgPct: 1.85 },
];

export const STATIC_SIGNALS = [
  { sym:'AAPL',  name:'Apple',     price:227.48, rsi:61.2, macd:'Bullish',  ma:'Above', sig:'BUY',  str:4 },
  { sym:'NVDA',  name:'NVIDIA',    price:138.85, rsi:71.4, macd:'Bullish',  ma:'Above', sig:'BUY',  str:5 },
  { sym:'META',  name:'Meta',      price:612.13, rsi:58.7, macd:'Bullish',  ma:'Above', sig:'BUY',  str:3 },
  { sym:'TSLA',  name:'Tesla',     price:352.56, rsi:42.3, macd:'Bearish',  ma:'Below', sig:'SELL', str:4 },
  { sym:'GOOGL', name:'Alphabet',  price:197.40, rsi:49.8, macd:'Neutral',  ma:'Above', sig:'HOLD', str:2 },
  { sym:'MSFT',  name:'Microsoft', price:415.32, rsi:64.1, macd:'Bullish',  ma:'Above', sig:'BUY',  str:4 },
  { sym:'AMZN',  name:'Amazon',    price:218.74, rsi:55.6, macd:'Bullish',  ma:'Above', sig:'BUY',  str:3 },
];

export const STATIC_NEWS = [
  { category:'MARKETS', title:'Fed Signals Patience on Rate Cuts as Inflation Proves Sticky', description:'Federal Reserve officials indicated they are in no rush to cut interest rates further after inflation data came in above expectations, with several policymakers citing the need for more evidence of price stability.', source:{name:'Reuters'}, publishedAt: new Date(Date.now()-7200000).toISOString(), url:'#' },
  { category:'CRYPTO',  title:'Bitcoin Holds Above $94K as Institutional Demand Accelerates', description:'Spot Bitcoin ETFs recorded another week of strong inflows as institutional investors continued to allocate to digital assets amid easing macro uncertainty.', source:{name:'CoinDesk'}, publishedAt: new Date(Date.now()-14400000).toISOString(), url:'#' },
  { category:'STOCKS',  title:'NVIDIA Surpasses $3.4T Market Cap on Record AI Chip Demand', description:"NVIDIA's data center revenue hit a new record as demand for AI accelerators remained far ahead of supply, pushing the chipmaker's valuation past $3.4 trillion.", source:{name:'Bloomberg'}, publishedAt: new Date(Date.now()-18000000).toISOString(), url:'#' },
  { category:'ECONOMY', title:'US Economy Adds 256K Jobs in January, Beating Forecasts', description:'The US labor market added more jobs than expected in January, keeping the unemployment rate steady at 4.1% and reinforcing the Federal Reserve\'s cautious stance on rate cuts.', source:{name:'WSJ'}, publishedAt: new Date(Date.now()-28800000).toISOString(), url:'#' },
  { category:'MARKETS', title:"S&P 500 Posts Best Weekly Gain of 2025 as Technology Sector Rallies", description:'Strong earnings from mega-cap technology companies drove the S&P 500 to its best weekly performance of the year, with the index closing above 5,800 for the first time since December.', source:{name:'CNBC'}, publishedAt: new Date(Date.now()-43200000).toISOString(), url:'#' },
  { category:'BONDS',   title:'10-Year Treasury Yield Dips Below 4.5% on Weak Manufacturing Data', description:'Treasury yields fell across the curve after ISM manufacturing data disappointed, with the 10-year note briefly touching its lowest level since October.', source:{name:'FT'}, publishedAt: new Date(Date.now()-86400000).toISOString(), url:'#' },
  { category:'CRYPTO',  title:'Ethereum ETF Sees Record Inflows as Institutional Adoption Grows', description:'Spot Ethereum ETFs recorded their highest single-week inflows since launch, signaling growing institutional acceptance of the second-largest cryptocurrency by market cap.', source:{name:'CoinDesk'}, publishedAt: new Date(Date.now()-90000000).toISOString(), url:'#' },
  { category:'STOCKS',  title:'Apple Set to Report Quarterly Earnings Amid iPhone Upgrade Cycle', description:'Analysts expect Apple to post record services revenue as the AI-driven iPhone upgrade cycle gains momentum, with consensus EPS estimates rising ahead of the print.', source:{name:'Bloomberg'}, publishedAt: new Date(Date.now()-100000000).toISOString(), url:'#' },
];

/* ─── helpers ─── */
export const fmtUSD = (n, dp = 0) =>
  '$' + Number(n).toLocaleString('en-US', { minimumFractionDigits: dp, maximumFractionDigits: dp });

export const fmtBig = n =>
  n >= 1e12 ? '$' + (n/1e12).toFixed(2) + 'T'
  : n >= 1e9 ? '$' + (n/1e9).toFixed(2) + 'B'
  : n >= 1e6 ? '$' + (n/1e6).toFixed(1) + 'M'
  : fmtUSD(n);

export const fmtPct  = (v, dp = 2) => (v >= 0 ? '+' : '') + v.toFixed(dp) + '%';
export const pillCls = v => v > 0 ? 'pill-up' : v < 0 ? 'pill-dn' : 'pill-flat';
export const sigCls  = s => s === 'BUY' ? 'sig-buy' : s === 'SELL' ? 'sig-sell' : 'sig-hold';

export function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return m + 'm ago';
  const h = Math.floor(m / 60);
  if (h < 24) return h + 'h ago';
  return Math.floor(h / 24) + 'd ago';
}

export function hexTint(hex, a = 0.1) {
  try {
    const r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16);
    return `rgba(${r},${g},${b},${a})`;
  } catch(_) { return 'rgba(100,100,100,0.1)'; }
}
