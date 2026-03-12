/** ui.js — shared nav / ticker / footer */
import { STATIC_STOCKS, fmtPct } from './api.js';

const PAGES = [
  { href: '/',              label: 'Home'        },
  { href: '/markets/',      label: 'Markets'     },
  { href: '/calculators/',  label: 'Calculators' },
  { href: '/news/',         label: 'News'        },
];

export function mountNav(active = '') {
  const el = document.getElementById('nav');
  if (!el) return;
  const links = PAGES.map(p => {
    const isCurrent = p.label.toLowerCase() === active.toLowerCase();
    return `<li><a href="${p.href}"${isCurrent ? ' class="active"' : ''}>${p.label}</a></li>`;
  }).join('');
  el.innerHTML = `
    <div class="wrap" style="display:flex;align-items:center;justify-content:space-between;width:100%;max-width:1240px">
      <a href="/" class="nav-logo"><strong>Finance</strong>Base</a>
      <ul class="nav-links">${links}</ul>
      <div class="nav-live"><span class="nav-live-dot"></span>Live</div>
    </div>`;
}

export function mountTicker(el) {
  if (!el) return;
  const items = [
    ...STATIC_STOCKS.map(s => ({
      sym: s.sym,
      price: '$' + s.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      chg: fmtPct(s.chgPct),
      up: s.chgPct >= 0,
    })),
    { sym:'BTC/USD', price: 'Live', chg: '—', up: true },
    { sym:'ETH/USD', price: 'Live', chg: '—', up: true },
    { sym:'GOLD',    price: '$2,642', chg: '+0.18%', up: true },
  ];
  const html = items.map(t =>
    `<span class="ticker-item">
      <span class="t-sym">${t.sym}</span>
      <span class="t-price">${t.price}</span>
      <span class="${t.up ? 't-up' : 't-dn'}">${t.chg}</span>
    </span>`
  ).join('');
  el.innerHTML = html + html;
}

export function updateTickerCrypto(el, coins) {
  if (!el || !coins) return;
  el.querySelectorAll('.ticker-item').forEach(item => {
    const sym = item.querySelector('.t-sym')?.textContent;
    const btc = coins.find(c => c.id === 'bitcoin');
    const eth = coins.find(c => c.id === 'ethereum');
    if (sym === 'BTC/USD' && btc) {
      item.querySelector('.t-price').textContent = '$' + btc.current_price.toLocaleString('en-US', { maximumFractionDigits: 0 });
      const c = btc.price_change_percentage_24h || 0;
      const ce = item.querySelector('.t-up, .t-dn');
      if (ce) { ce.textContent = fmtPct(c); ce.className = c >= 0 ? 't-up' : 't-dn'; }
    }
    if (sym === 'ETH/USD' && eth) {
      item.querySelector('.t-price').textContent = '$' + eth.current_price.toLocaleString('en-US', { maximumFractionDigits: 0 });
      const c = eth.price_change_percentage_24h || 0;
      const ce = item.querySelector('.t-up, .t-dn');
      if (ce) { ce.textContent = fmtPct(c); ce.className = c >= 0 ? 't-up' : 't-dn'; }
    }
  });
}

export function mountFooter() {
  const el = document.getElementById('footer');
  if (!el) return;
  el.innerHTML = `
    <div class="wrap">
      <div class="footer-grid">
        <div class="footer-brand">
          <a href="/" class="footer-logo"><strong>Finance</strong>Base</a>
          <p>Free financial tools and live market data for US and global investors. Professional-grade insights — no paywall, no account required.</p>
        </div>
        <div class="footer-col">
          <h5>Calculators</h5>
          <ul>
            <li><a href="/calculators/#compound">Compound Interest</a></li>
            <li><a href="/calculators/#tax">Income Tax 2025</a></li>
            <li><a href="/calculators/#dca">DCA Calculator</a></li>
            <li><a href="/calculators/#fire">FIRE Calculator</a></li>
          </ul>
        </div>
        <div class="footer-col">
          <h5>Markets</h5>
          <ul>
            <li><a href="/markets/#stocks">Stocks</a></li>
            <li><a href="/markets/#crypto">Crypto Prices</a></li>
            <li><a href="/markets/#signals">Signal Screener</a></li>
            <li><a href="/markets/#macro">Macro Dashboard</a></li>
          </ul>
        </div>
        <div class="footer-col">
          <h5>Site</h5>
          <ul>
            <li><a href="/news/">Finance News</a></li>
            <li><a href="/">About</a></li>
            <li><a href="/">Privacy Policy</a></li>
            <li><a href="/">Contact</a></li>
          </ul>
        </div>
      </div>
      <div class="footer-bottom">
        <div class="footer-legal">
          <div style="margin-bottom:4px">© 2025 FinanceBase.org — All rights reserved.</div>
          <div>Data provided for informational purposes only. Not financial advice. Market data may be delayed. Always consult a licensed financial advisor before making investment decisions.</div>
        </div>
        <div style="font-size:11px;color:rgba(255,255,255,.2);flex-shrink:0">financebase.org</div>
      </div>
    </div>`;
}
