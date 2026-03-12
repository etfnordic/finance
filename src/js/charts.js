/** charts.js — lightweight canvas charting, no deps */

export function sparkline(canvas, values, color = '#1246e6') {
  if (!canvas || !values?.length) return;
  const dpr = window.devicePixelRatio || 1;
  const W = canvas.clientWidth  || 80;
  const H = canvas.clientHeight || 32;
  canvas.width  = W * dpr;
  canvas.height = H * dpr;
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
  const min = Math.min(...values), max = Math.max(...values), range = max - min || 1;
  const pad = 2;
  const pts = values.map((v, i) => ({
    x: pad + (i / (values.length - 1)) * (W - pad * 2),
    y: pad + (1 - (v - min) / range) * (H - pad * 2),
  }));
  // Fill
  ctx.beginPath();
  pts.forEach((p, i) => i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y));
  ctx.lineTo(pts[pts.length-1].x, H); ctx.lineTo(pts[0].x, H); ctx.closePath();
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, color + '22'); g.addColorStop(1, color + '00');
  ctx.fillStyle = g; ctx.fill();
  // Line
  ctx.beginPath();
  pts.forEach((p, i) => i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y));
  ctx.strokeStyle = color; ctx.lineWidth = 1.5;
  ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.stroke();
}

export function areaChart(canvas, labels, datasets, opts = {}) {
  if (!canvas) return;
  const dpr = window.devicePixelRatio || 1;
  const W = canvas.clientWidth  || 480;
  const H = canvas.clientHeight || 240;
  canvas.width  = W * dpr;
  canvas.height = H * dpr;
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
  const pad = { t: 14, r: 12, b: 30, l: 58 };
  const cW = W - pad.l - pad.r;
  const cH = H - pad.t - pad.b;
  const all = datasets.flatMap(d => d.data).filter(v => v != null);
  const minV = opts.zeroBase ? 0 : Math.min(...all) * 0.97;
  const maxV = Math.max(...all) * 1.03;
  const rng  = maxV - minV || 1;

  // bg
  ctx.fillStyle = opts.bg || '#fff'; ctx.fillRect(0, 0, W, H);

  // grid
  ctx.strokeStyle = '#e3e8f0'; ctx.lineWidth = 1;
  [0, 0.25, 0.5, 0.75, 1].forEach(p => {
    const y = pad.t + p * cH;
    ctx.beginPath(); ctx.moveTo(pad.l, y); ctx.lineTo(W - pad.r, y); ctx.stroke();
    const v = maxV - p * rng;
    ctx.fillStyle = '#8596a5';
    ctx.font = `10px 'DM Mono', monospace`; ctx.textAlign = 'right';
    ctx.fillText(axLabel(v), pad.l - 6, y + 4);
  });

  // datasets: fills first, then lines
  datasets.filter(d => d.fill).forEach(d => drawDS(ctx, d, labels, pad, cW, cH, minV, rng, true));
  datasets.filter(d => !d.fill).forEach(d => drawDS(ctx, d, labels, pad, cW, cH, minV, rng, false));

  // x labels
  ctx.fillStyle = '#8596a5'; ctx.font = `10px 'DM Mono', monospace`; ctx.textAlign = 'center';
  const step = Math.max(1, Math.ceil(labels.length / 6));
  labels.forEach((l, i) => {
    if (i % step === 0 || i === labels.length - 1) {
      const x = pad.l + (i / (labels.length - 1)) * cW;
      ctx.fillText(l, x, H - 8);
    }
  });
}

function drawDS(ctx, ds, labels, pad, cW, cH, minV, rng, fillOnly) {
  const pts = labels.map((_, i) => ({
    x: pad.l + (i / (labels.length - 1)) * cW,
    y: pad.t + (1 - (ds.data[i] - minV) / rng) * cH,
  }));
  if (fillOnly) {
    ctx.beginPath();
    pts.forEach((p, i) => i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y));
    ctx.lineTo(pts[pts.length-1].x, pad.t + cH); ctx.lineTo(pts[0].x, pad.t + cH);
    ctx.closePath();
    const g = ctx.createLinearGradient(0, pad.t, 0, pad.t + cH);
    g.addColorStop(0, ds.color + '20'); g.addColorStop(1, ds.color + '00');
    ctx.fillStyle = g; ctx.fill();
  } else {
    ctx.beginPath();
    pts.forEach((p, i) => i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y));
    ctx.strokeStyle = ds.color; ctx.lineWidth = 2;
    ctx.lineJoin = 'round'; ctx.stroke();
  }
}

function axLabel(v) {
  if (Math.abs(v) >= 1e9)  return '$' + (v/1e9).toFixed(1) + 'B';
  if (Math.abs(v) >= 1e6)  return '$' + (v/1e6).toFixed(1) + 'M';
  if (Math.abs(v) >= 1000) return '$' + (v/1000).toFixed(0) + 'K';
  if (Math.abs(v) < 10)    return v.toFixed(1);
  return '$' + v.toFixed(0);
}

export function genSpark(n = 18, trend = 0) {
  const d = [50];
  for (let i = 1; i < n; i++)
    d.push(Math.max(5, Math.min(95, d[i-1] + (Math.random() - 0.48 + trend * 0.05) * 11)));
  return d;
}
