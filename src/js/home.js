import '../css/main.css';
import { mountNav, mountTicker, mountFooter, updateTickerCrypto } from './ui.js';
import { fetchCryptoPrices, fetchCryptoGlobal, STATIC_STOCKS, STATIC_NEWS, fmtUSD, fmtBig, fmtPct, pillCls, hexTint, timeAgo } from './api.js';
import { sparkline, genSpark } from './charts.js';

mountNav('home');
const tt = document.getElementById('ticker-track');
mountTicker(tt);
mountFooter();

/* ── live crypto ── */
async function loadCrypto() {
  try {
    const [coins, global] = await Promise.all([fetchCryptoPrices(), fetchCryptoGlobal()]);
    const btc = coins.find(c => c.id === 'bitcoin');
    if (btc) {
      document.getElementById('h-btc').textContent = btc.current_price.toLocaleString('en-US', { maximumFractionDigits: 0 });
      const chg = btc.price_change_percentage_24h || 0;
      const el = document.getElementById('h-btc-c');
      el.textContent = fmtPct(chg);
      el.className = 'snap-chg ' + (chg >= 0 ? 'text-green' : 'text-red');
    }
    if (global?.data) {
      const cap = global.data.total_market_cap?.usd;
      const dom = global.data.market_cap_percentage?.btc;
      if (cap) document.getElementById('h-mcap').textContent = fmtBig(cap).replace('$','') + 'USD';
      if (dom) document.getElementById('h-dom').textContent = dom.toFixed(1) + '%';
    }
    updateTickerCrypto(tt, coins);
  } catch (_) {}
}
loadCrypto();
setInterval(loadCrypto, 60_000);

/* ── market preview ── */
function renderPreview() {
  const tbody = document.getElementById('preview-tbody');
  tbody.innerHTML = STATIC_STOCKS.slice(0, 6).map(s =>
    `<tr>
      <td>
        <div class="asset-cell">
          <div class="asset-logo" style="background:${hexTint(s.col)};color:${s.col}">${s.sym.slice(0,4)}</div>
          <div><div style="font-weight:600">${s.sym}</div><div style="font-size:12px;color:var(--ink-3)">${s.name}</div></div>
        </div>
      </td>
      <td style="font-family:var(--mono);font-weight:500">${fmtUSD(s.price,2)}</td>
      <td><span class="pill ${pillCls(s.chgPct)}">${fmtPct(s.chgPct)}</span></td>
      <td style="color:var(--ink-3);font-size:13px">${s.vol}</td>
      <td><canvas data-sym="${s.sym}" width="80" height="28" style="display:inline-block"></canvas></td>
    </tr>`
  ).join('');
  STATIC_STOCKS.slice(0, 6).forEach(s => {
    const c = tbody.querySelector(`canvas[data-sym="${s.sym}"]`);
    if (c) sparkline(c, genSpark(16, s.chgPct > 0 ? 1 : -1), s.chgPct >= 0 ? '#0a7c4f' : '#b91c1c');
  });
}
renderPreview();

/* ── news preview ── */
async function renderNews() {
  const { fetchFinanceNews, STATIC_NEWS } = await import('./api.js');
  let articles = await fetchFinanceNews();
  if (!articles) articles = STATIC_NEWS;
  const container = document.getElementById('news-preview');
  const [feat, ...rest] = articles.slice(0, 5);
  const catFor = a => a.category || 'MARKETS';
  const srcFor = a => a.source?.name || 'FinanceBase';
  container.innerHTML = `
    <div class="news-feature">
      <div class="news-img-placeholder">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--blue)" stroke-width="1.2">
          <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/>
          <path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/>
        </svg>
      </div>
      <div class="card-pad">
        <div class="news-cat">${catFor(feat)}</div>
        <h3 class="news-title">${feat.title}</h3>
        <p class="news-excerpt">${feat.description || feat.excerpt || ''}</p>
        <div style="display:flex;gap:8px;font-size:12px;color:var(--ink-3)">
          <span class="news-src">${srcFor(feat)}</span><span>·</span><span>${timeAgo(feat.publishedAt)}</span>
        </div>
      </div>
    </div>
    <div class="news-list-card">
      <div style="padding:14px 20px;border-bottom:1px solid var(--rule)">
        <span class="eyebrow" style="font-size:10px">Latest Stories</span>
      </div>
      ${rest.map(n => `
        <div class="news-list-item">
          <div class="news-cat">${catFor(n)}</div>
          <div style="font-size:15px;font-weight:600;line-height:1.4;color:var(--ink);margin-bottom:4px">${n.title}</div>
          <div style="font-size:12px;color:var(--ink-3)">${srcFor(n)} · ${timeAgo(n.publishedAt)}</div>
        </div>`).join('')}
      <div style="padding:12px 20px;text-align:center">
        <a href="/news/" style="font-size:13px;font-weight:600;color:var(--blue)">View all news</a>
      </div>
    </div>`;
}
renderNews();
