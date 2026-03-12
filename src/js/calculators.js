import '../css/main.css';
import { mountNav, mountTicker, mountFooter } from './ui.js';
import { fmtUSD, fmtPct } from './api.js';
import { areaChart } from './charts.js';

mountNav('calculators');
mountTicker(document.getElementById('ticker-track'));
mountFooter();

const $ = id => document.getElementById(id);

/* ════════════════════════════════
   COMPOUND INTEREST
════════════════════════════════ */
window.calcCI = function () {
  const init = +$('ci-init').value;
  const mon  = +$('ci-mon').value;
  const rate = +$('ci-rate').value / 100;
  const yrs  = +$('ci-yrs').value;

  $('ci-init-lbl').textContent = fmtUSD(init);
  $('ci-mon-lbl').textContent  = fmtUSD(mon);
  $('ci-rate-lbl').textContent = (+$('ci-rate').value).toFixed(1) + '%';
  $('ci-yrs-lbl').textContent  = yrs + ' years';

  const mr = rate / 12;
  let bal = init;
  const balVals = [init], invVals = [init];
  for (let y = 1; y <= yrs; y++) {
    for (let m = 0; m < 12; m++) bal = bal * (1 + mr) + mon;
    balVals.push(Math.round(bal));
    invVals.push(Math.round(init + mon * 12 * y));
  }
  const totalInv = init + mon * 12 * yrs;
  const interest = Math.round(bal) - totalInv;

  $('ci-total').textContent = fmtUSD(Math.round(bal));
  $('ci-sub').textContent   = `Total gain: ${fmtUSD(interest)} (${totalInv > 0 ? ((interest / totalInv) * 100).toFixed(0) : 0}% return)`;
  $('ci-inv').textContent   = fmtUSD(totalInv);
  $('ci-int').textContent   = fmtUSD(Math.max(0, interest));

  // milestone banner
  const reached = [100_000,250_000,500_000,1_000_000,2_000_000].filter(m => bal >= m);
  const ms = $('ci-milestone');
  if (reached.length) {
    ms.className = 'milestone';
    ms.textContent = `Reaches ${fmtUSD(reached[reached.length-1])} within ${yrs} years`;
  } else {
    ms.className = '';
    ms.textContent = '';
  }

  // milestones list
  const targets = [50_000, 100_000, 250_000, 500_000, 1_000_000];
  $('ci-milestones').innerHTML = targets.map(t => {
    let b2 = init, yr = 0;
    while (b2 < t && yr < 60) { for (let m2=0;m2<12;m2++) b2 = b2*(1+mr)+mon; yr++; }
    return `<div class="result-row">
      <span class="result-row-lbl">${fmtUSD(t)}</span>
      <span class="result-row-val" style="color:${b2>=t?'var(--green)':'var(--ink-3)'}">${b2>=t?'Year '+yr:'Not reached'}</span>
    </div>`;
  }).join('');

  const labels = Array.from({length: yrs + 1}, (_, i) => 'Yr' + i);
  areaChart($('ci-chart'), labels, [
    { data: invVals,  color: '#e3e8f0', fill: true  },
    { data: balVals,  color: '#1246e6', fill: false },
  ], { zeroBase: true });
};
calcCI();

/* ════════════════════════════════
   TAX CALCULATOR 2025
════════════════════════════════ */
const BRACKETS = {
  single:  [[11600,.10],[44725,.12],[95375,.22],[201050,.24],[383900,.32],[487450,.35],[Infinity,.37]],
  married: [[23200,.10],[89450,.12],[190750,.22],[364200,.24],[462500,.32],[693750,.35],[Infinity,.37]],
  hoh:     [[16550,.10],[59850,.12],[95350,.22],[182050,.24],[231250,.32],[578100,.35],[Infinity,.37]],
};
const STD = { single:14600, married:29200, hoh:21900 };
const BAR_COLORS = ['#bfdbfe','#93c5fd','#60a5fa','#3b82f6','#2563eb','#1d4ed8','#1e3a8a'];

window.calcTax = function () {
  const gross  = +$('tax-inc').value;
  const status = $('tax-status').value;
  $('tax-inc-lbl').textContent = fmtUSD(gross);

  const taxable = Math.max(0, gross - STD[status]);
  let tax = 0, prev = 0, bkdn = [], marg = 0;
  BRACKETS[status].forEach(([lim, rate]) => {
    if (taxable > prev) {
      const slice = Math.min(taxable, lim) - prev;
      tax += slice * rate; marg = rate;
      bkdn.push({ from: prev, to: lim, rate, tax: slice * rate, slice });
      prev = lim;
    }
  });
  const eff = (tax / gross) * 100;
  $('tax-total').textContent = fmtUSD(Math.round(tax));
  $('tax-eff').textContent   = `Effective rate: ${eff.toFixed(1)}%  ·  Taxable income: ${fmtUSD(taxable)}`;
  $('tax-home').textContent  = fmtUSD(Math.round(gross - tax));
  $('tax-marg').textContent  = (marg * 100).toFixed(0) + '%';

  $('tax-brackets').innerHTML = bkdn.map((b, i) => `
    <div class="bracket-row">
      <div class="bracket-meta">
        <span>${(b.rate*100).toFixed(0)}% bracket (${fmtUSD(b.from)} – ${b.to===Infinity?'∞':fmtUSD(b.to)})</span>
        <strong>${fmtUSD(Math.round(b.tax))}</strong>
      </div>
      <div class="bracket-bar" style="background:${BAR_COLORS[i]};width:${Math.max(4,(b.slice/gross*100))}%">
        ${b.slice > gross*.06 ? (b.rate*100).toFixed(0)+'%' : ''}
      </div>
    </div>`).join('');
};
calcTax();

/* ════════════════════════════════
   DCA
════════════════════════════════ */
window.calcDCA = function () {
  const amt  = +$('dca-amt').value;
  const yrs  = +$('dca-yrs').value;
  const rate = +$('dca-rt').value / 100;
  $('dca-amt-lbl').textContent = fmtUSD(amt);
  $('dca-yrs-lbl').textContent = yrs + ' years';
  $('dca-rt-lbl').textContent  = (+$('dca-rt').value) + '%';

  const mr = rate / 12;
  let bal = 0;
  const balVals = [0], invVals = [0];
  for (let y = 1; y <= yrs; y++) {
    for (let m = 0; m < 12; m++) bal = (bal + amt) * (1 + mr);
    balVals.push(Math.round(bal));
    invVals.push(amt * 12 * y);
  }
  const totalInv = amt * 12 * yrs;
  const retPct   = totalInv > 0 ? ((bal - totalInv) / totalInv * 100).toFixed(0) : 0;

  $('dca-total').textContent = fmtUSD(Math.round(bal));
  $('dca-sub').textContent   = `Invested ${fmtUSD(totalInv)} over ${yrs} years`;
  $('dca-inv').textContent   = fmtUSD(totalInv);
  $('dca-ret').textContent   = retPct + '%';

  const labels = Array.from({length: yrs + 1}, (_, i) => 'Yr' + i);
  areaChart($('dca-chart'), labels, [
    { data: invVals, color: '#e3e8f0', fill: true  },
    { data: balVals, color: '#1246e6', fill: false },
  ], { zeroBase: true });
};
calcDCA();

/* ════════════════════════════════
   FIRE
════════════════════════════════ */
window.calcFIRE = function () {
  const expenses = +$('fire-exp').value;
  const savings  = +$('fire-sav').value;
  const annSave  = +$('fire-save').value;
  const rate     = +$('fire-rt').value / 100;

  $('fire-exp-lbl').textContent  = fmtUSD(expenses);
  $('fire-sav-lbl').textContent  = fmtUSD(savings);
  $('fire-save-lbl').textContent = fmtUSD(annSave);
  $('fire-rt-lbl').textContent   = (+$('fire-rt').value) + '%';

  const fireNum = expenses * 25;
  let bal = savings, yrs = 0;
  const balVals = [savings], fireLine = [fireNum];
  while (bal < fireNum && yrs < 100) {
    bal = bal * (1 + rate) + annSave;
    yrs++;
    balVals.push(Math.round(Math.min(bal, fireNum * 1.1)));
    fireLine.push(fireNum);
  }
  const reached  = bal >= fireNum;
  const progress = Math.min(100, (savings / fireNum) * 100);

  $('fire-num').textContent = fmtUSD(fireNum);
  $('fire-sub').textContent = reached
    ? `Reached in ${yrs} year${yrs===1?'':'s'}`
    : 'Not reached within 100 years — increase savings or reduce expenses';

  $('fire-results').innerHTML = `
    <div class="result-row"><span class="result-row-lbl">FIRE number (25x rule)</span><span class="result-row-val">${fmtUSD(fireNum)}</span></div>
    <div class="result-row"><span class="result-row-lbl">Current savings</span><span class="result-row-val">${fmtUSD(savings)}</span></div>
    <div class="result-row"><span class="result-row-lbl">Still needed</span><span class="result-row-val text-red">${fmtUSD(Math.max(0, fireNum - savings))}</span></div>
    <div class="result-row"><span class="result-row-lbl">Years to FIRE</span><span class="result-row-val ${reached?'text-green':'text-red'}">${reached ? yrs : '>100'}</span></div>
    <div style="margin-top:14px">
      <div style="display:flex;justify-content:space-between;font-size:12px;color:var(--ink-3);margin-bottom:5px">
        <span>Progress toward FIRE</span><span>${progress.toFixed(1)}%</span>
      </div>
      <div style="height:7px;background:var(--rule);border-radius:4px;overflow:hidden">
        <div style="height:100%;width:${progress}%;background:linear-gradient(90deg,var(--blue),#6b9fff);transition:width .6s ease"></div>
      </div>
    </div>`;

  const chartYrs = Math.min(reached ? yrs + 2 : 40, 50);
  const labels   = Array.from({length: chartYrs + 1}, (_, i) => 'Yr' + i);
  const bVals    = [savings];
  let b2 = savings;
  for (let y = 1; y <= chartYrs; y++) {
    b2 = b2 * (1 + rate) + annSave;
    bVals.push(Math.round(b2));
  }
  const fVals = Array(chartYrs + 1).fill(fireNum);
  areaChart($('fire-chart'), labels, [
    { data: fVals, color: '#e3e8f0', fill: true  },
    { data: bVals, color: '#1246e6', fill: false },
  ], { zeroBase: true });
};
calcFIRE();
