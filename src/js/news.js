import '../css/main.css';
import { mountNav, mountTicker, mountFooter } from './ui.js';
import { fetchFinanceNews, fetchCryptoPrices, STATIC_NEWS, fmtPct, timeAgo } from './api.js';

mountNav('news');
mountTicker(document.getElementById('ticker-track'));
mountFooter();

/* ── sidebar crypto ── */
fetchCryptoPrices().then(coins => {
  const btc = coins.find(c => c.id === 'bitcoin');
  if (!btc) return;
  document.getElementById('sb-btc').textContent = '$' + btc.current_price.toLocaleString('en-US', { maximumFractionDigits: 0 });
  const chg = btc.price_change_percentage_24h || 0;
  const el = document.getElementById('sb-btc-c');
  el.textContent = fmtPct(chg);
  el.style.color = chg >= 0 ? 'var(--green)' : 'var(--red)';
}).catch(() => {});

/* ── news ── */
let allArticles = [];
let activeFilter = 'all';

/** Assign a display category to an article */
function categorise(a) {
  if (a.category) return a.category.toLowerCase();
  const t = (a.title + ' ' + (a.description || '')).toLowerCase();
  if (/bitcoin|ethereum|crypto|blockchain|defi|nft|solana|binance/.test(t)) return 'crypto';
  if (/bond|treasury|yield|fixed.income/.test(t)) return 'bonds';
  if (/gdp|unemployment|inflation|cpi|fed|rate|macro|imf/.test(t)) return 'economy';
  if (/stock|earnings|ipo|nasdaq|s&p|equit/.test(t)) return 'stocks';
  return 'markets';
}

function catLabel(cat) {
  return cat.toUpperCase();
}

function renderFeed(articles) {
  const feed = document.getElementById('news-feed');
  if (!articles.length) {
    feed.innerHTML = '<p class="caption" style="padding:40px 0">No stories found for this category.</p>';
    return;
  }
  const [feat, ...rest] = articles;
  const srcName = feat.source?.name || 'FinanceBase';
  feed.innerHTML = `
    <article class="news-feature">
      <div class="news-img">
        <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="var(--blue)" stroke-width="1.2">
          <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/>
          <path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/>
        </svg>
      </div>
      <div class="card-pad">
        <div class="news-cat">${catLabel(categorise(feat))}</div>
        <h2 class="news-title-lg">${feat.title}</h2>
        <p class="news-excerpt">${feat.description || ''}</p>
        <div class="news-meta-row">
          <span class="news-src">${srcName}</span>
          <span>·</span>
          <span>${timeAgo(feat.publishedAt)}</span>
          ${feat.url && feat.url !== '#' ? `<span>·</span><a href="${feat.url}" target="_blank" rel="noopener" style="color:var(--blue);font-weight:500">Read full story</a>` : ''}
        </div>
      </div>
    </article>
    <div class="news-list">
      ${rest.map(n => `
        <div class="news-item" ${n.url && n.url !== '#' ? `onclick="window.open('${n.url}','_blank')"` : ''}>
          <div class="news-cat">${catLabel(categorise(n))}</div>
          <div class="news-item-title">${n.title}</div>
          <div class="caption">${n.source?.name || 'FinanceBase'} · ${timeAgo(n.publishedAt)}</div>
        </div>`).join('')}
      <div style="padding:12px 20px;text-align:center">
        <span class="caption">Powered by <a href="https://newsapi.org" target="_blank" rel="noopener" style="color:var(--blue)">NewsAPI</a></span>
      </div>
    </div>`;
}

window.filter = function (cat, el) {
  document.querySelectorAll('.ftag').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
  activeFilter = cat;
  const filtered = cat === 'all' ? allArticles : allArticles.filter(a => categorise(a) === cat);
  renderFeed(filtered.length ? filtered : allArticles.slice(0, 10));
};

async function loadNews() {
  let articles = await fetchFinanceNews();
  if (!articles || articles.length === 0) {
    articles = STATIC_NEWS;
  }
  allArticles = articles;
  renderFeed(allArticles);
}
loadNews();
