import '../css/main.css';
import { mountNav, mountTicker, mountFooter, updateTickerCrypto } from './ui.js';
import { fetchCryptoPrices, fetchQuotes, parseQuote, COIN_META, STATIC_STOCKS, STATIC_ETFS, STATIC_COMMODITIES, STATIC_SIGNALS, fmtUSD, fmtBig, fmtPct, pillCls, sigCls, hexTint } from './api.js';
import { sparkline, genSpark } from './charts.js';

mountNav('markets');
const tt = document.getElementById('ticker-track');
mountTicker(tt);
mountFooter();

/* ── stock table ── */
const ALL = { stocks: STATIC_STOCKS, etfs: STATIC_ETFS, commodities: STATIC_COMMODITIES };
let activeTab = 'stocks';

function renderStocks(key) {
  const data = ALL[key];
  const tbody = document.getElementById('stocks-tbody');
  tbody.innerHTML = data.map(s => `<tr>
    <td><div class="asset-cell">
      <div class="asset-logo" style="background:${hexTint(s.col||'#1246e6')};color:${s.col||'#1246e6'}">${(s.sym||'').slice(0,4)}</div>
      <div><div style="font-weight:600;font-size:14px">${s.sym}</div><div style="font-size:12px;color:var(--ink-3)">${s.name}</div></div>
    </div></td>
    <td class="r" style="font-family:var(--mono);font-weight:500">${fmtUSD(s.price,2)}</td>
    <td class="r"><span class="pill ${pillCls(s.chgPct)}">${fmtPct(s.chgPct)}</span></td>
    <td class="r" style="font-size:13px;color:var(--ink-3)">${s.vol||'—'}</td>
    <td class="r"><canvas data-sym="${s.sym}" width="80" height="28" style="display:inline-block"></canvas></td>
    <td class="r" style="font-size:13px;color:var(--ink-3)">${s.cap||'—'}</td>
  </tr>`).join('');
  data.forEach(s => {
    const c = tbody.querySelector(`canvas[data-sym="${s.sym}"]`);
    if (c) sparkline(c, genSpark(16, s.chgPct > 0 ? 1 : -1), s.chgPct >= 0 ? '#0a7c4f' : '#b91c1c');
  });
}
window.switchTab = (key, btn) => {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active'); activeTab = key; renderStocks(key);
};
renderStocks('stocks');

/* ── try live AV quotes for top stocks ── */
(async () => {
  try {
    const syms = ['AAPL','MSFT','NVDA','GOOGL','AMZN'];
    const quotes = await fetchQuotes(syms);
    const tbody = document.getElementById('stocks-tbody');
    quotes.forEach((raw, sym) => {
      const q = parseQuote(raw);
      if (!q) return;
      const row = [...tbody.querySelectorAll('tr')].find(r => r.querySelector('.asset-logo')?.textContent === sym.slice(0,4));
      if (!row) return;
      const cells = row.querySelectorAll('td');
      cells[1].textContent = fmtUSD(q.price, 2);
      cells[2].innerHTML = `<span class="pill ${pillCls(q.chgPct)}">${fmtPct(q.chgPct)}</span>`;
    });
  } catch (_) { /* silent — static data remains */ }
})();

/* ── crypto ── */
const COIN_COLORS = { bitcoin:'#f7931a', ethereum:'#627eea', solana:'#9945ff', binancecoin:'#f3ba2f', ripple:'#346aa9', cardano:'#0033ad', 'avalanche-2':'#e84142', dogecoin:'#c2a633' };
async function loadCrypto() {
  try {
    const coins = await fetchCryptoPrices();
    document.getElementById('crypto-grid').innerHTML = coins.map(c => {
      const meta = COIN_META[c.id] || { sym: c.symbol.toUpperCase() };
      const chg  = c.price_change_percentage_24h || 0;
      const col  = COIN_COLORS[c.id] || '#1246e6';
      const price = c.current_price > 100 ? fmtUSD(c.current_price, 0) : '$' + c.current_price.toFixed(4);
      return `<div class="crypto-card">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px">
          <div style="width:36px;height:36px;border-radius:50%;background:${col}18;display:flex;align-items:center;justify-content:center;font-family:var(--mono);font-size:10px;font-weight:700;color:${col}">${meta.sym.slice(0,3)}</div>
          <div><div style="font-weight:600;font-size:14px">${c.name}</div><div style="font-size:11px;color:var(--ink-3);font-family:var(--mono)">${meta.sym}</div></div>
        </div>
        <div style="font-family:var(--mono);font-size:19px;font-weight:500;margin-bottom:8px">${price}</div>
        <div style="display:flex;justify-content:space-between;align-items:center">
          <span class="pill ${pillCls(chg)}">${fmtPct(chg)}</span>
          <span class="caption">${fmtBig(c.market_cap)}</span>
        </div>
      </div>`;
    }).join('');
    updateTickerCrypto(tt, coins);
  } catch (_) {
    document.getElementById('crypto-grid').innerHTML = '<p class="caption" style="grid-column:1/-1;text-align:center;padding:40px">Live crypto data temporarily unavailable.</p>';
  }
}
loadCrypto();
setInterval(loadCrypto, 60_000);

/* ── signals ── */
document.getElementById('signals-tbody').innerHTML = STATIC_SIGNALS.map(s => {
  const rC = s.rsi > 70 ? 'var(--red)' : s.rsi < 30 ? 'var(--green)' : 'var(--ink)';
  const bars = Array.from({length:5}, (_,i) =>
    `<span style="display:inline-block;width:6px;height:16px;border-radius:2px;margin-right:2px;background:${i < s.str ? (s.sig==='BUY'?'var(--green)':'var(--red)') : 'var(--rule)'}"></span>`
  ).join('');
  return `<tr>
    <td><strong>${s.sym}</strong> <span style="font-size:12px;color:var(--ink-3)">${s.name}</span></td>
    <td class="r" style="font-family:var(--mono)">${fmtUSD(s.price,2)}</td>
    <td class="r" style="font-family:var(--mono);color:${rC};font-weight:500">${s.rsi}</td>
    <td class="r" style="font-size:13px">${s.macd}</td>
    <td class="r" style="font-size:13px">${s.ma} 200MA</td>
    <td><span class="sig ${sigCls(s.sig)}">${s.sig}</span></td>
    <td>${bars}</td>
  </tr>`;
}).join('');

/* ── yield curve ── */
const YIELDS = [{m:'1M',y:5.32},{m:'3M',y:5.28},{m:'6M',y:5.18},{m:'1Y',y:4.88},{m:'2Y',y:4.26},{m:'5Y',y:4.51},{m:'10Y',y:4.48},{m:'20Y',y:4.71},{m:'30Y',y:4.67}];
const maxY = Math.max(...YIELDS.map(d=>d.y));
document.getElementById('yield-bars').innerHTML = YIELDS.map(d => `
  <div class="yield-col">
    <div style="font-size:10px;font-weight:500;font-family:var(--mono);color:var(--ink-2)">${d.y}%</div>
    <div class="yield-bar" style="height:${(d.y/maxY)*70}px"></div>
    <div style="font-size:10px;font-family:var(--mono);color:var(--ink-3)">${d.m}</div>
  </div>`).join('');
