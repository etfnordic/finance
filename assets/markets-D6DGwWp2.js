import{m as g,a as h,b as u,i as $,j as x,g as o,p as r,d as c,k as b,s as k,l as T,n as S,S as C,h as I,f as w,C as _,e as A,u as L}from"./ui-D0XLm06S.js";import{s as M,g as E}from"./charts-KMvg-zGG.js";g("markets");const y=document.getElementById("ticker-track");h(y);u();const z={stocks:C,etfs:S,commodities:T};function m(t){const s=z[t],a=document.getElementById("stocks-tbody");a.innerHTML=s.map(e=>`<tr>
    <td><div class="asset-cell">
      <div class="asset-logo" style="background:${I(e.col||"#1246e6")};color:${e.col||"#1246e6"}">${(e.sym||"").slice(0,4)}</div>
      <div><div style="font-weight:600;font-size:14px">${e.sym}</div><div style="font-size:12px;color:var(--ink-3)">${e.name}</div></div>
    </div></td>
    <td class="r" style="font-family:var(--mono);font-weight:500">${o(e.price,2)}</td>
    <td class="r"><span class="pill ${r(e.chgPct)}">${c(e.chgPct)}</span></td>
    <td class="r" style="font-size:13px;color:var(--ink-3)">${e.vol||"—"}</td>
    <td class="r"><canvas data-sym="${e.sym}" width="80" height="28" style="display:inline-block"></canvas></td>
    <td class="r" style="font-size:13px;color:var(--ink-3)">${e.cap||"—"}</td>
  </tr>`).join(""),s.forEach(e=>{const n=a.querySelector(`canvas[data-sym="${e.sym}"]`);n&&M(n,E(16,e.chgPct>0?1:-1),e.chgPct>=0?"#0a7c4f":"#b91c1c")})}window.switchTab=(t,s)=>{document.querySelectorAll(".tab-btn").forEach(a=>a.classList.remove("active")),s.classList.add("active"),m(t)};m("stocks");(async()=>{try{const s=await $(["AAPL","MSFT","NVDA","GOOGL","AMZN"]),a=document.getElementById("stocks-tbody");s.forEach((e,n)=>{const i=x(e);if(!i)return;const l=[...a.querySelectorAll("tr")].find(f=>f.querySelector(".asset-logo")?.textContent===n.slice(0,4));if(!l)return;const d=l.querySelectorAll("td");d[1].textContent=o(i.price,2),d[2].innerHTML=`<span class="pill ${r(i.chgPct)}">${c(i.chgPct)}</span>`})}catch{}})();const B={bitcoin:"#f7931a",ethereum:"#627eea",solana:"#9945ff",binancecoin:"#f3ba2f",ripple:"#346aa9",cardano:"#0033ad","avalanche-2":"#e84142",dogecoin:"#c2a633"};async function p(){try{const t=await w();document.getElementById("crypto-grid").innerHTML=t.map(s=>{const a=_[s.id]||{sym:s.symbol.toUpperCase()},e=s.price_change_percentage_24h||0,n=B[s.id]||"#1246e6",i=s.current_price>100?o(s.current_price,0):"$"+s.current_price.toFixed(4);return`<div class="crypto-card">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px">
          <div style="width:36px;height:36px;border-radius:50%;background:${n}18;display:flex;align-items:center;justify-content:center;font-family:var(--mono);font-size:10px;font-weight:700;color:${n}">${a.sym.slice(0,3)}</div>
          <div><div style="font-weight:600;font-size:14px">${s.name}</div><div style="font-size:11px;color:var(--ink-3);font-family:var(--mono)">${a.sym}</div></div>
        </div>
        <div style="font-family:var(--mono);font-size:19px;font-weight:500;margin-bottom:8px">${i}</div>
        <div style="display:flex;justify-content:space-between;align-items:center">
          <span class="pill ${r(e)}">${c(e)}</span>
          <span class="caption">${A(s.market_cap)}</span>
        </div>
      </div>`}).join(""),L(y,t)}catch{document.getElementById("crypto-grid").innerHTML='<p class="caption" style="grid-column:1/-1;text-align:center;padding:40px">Live crypto data temporarily unavailable.</p>'}}p();setInterval(p,6e4);document.getElementById("signals-tbody").innerHTML=b.map(t=>{const s=t.rsi>70?"var(--red)":t.rsi<30?"var(--green)":"var(--ink)",a=Array.from({length:5},(e,n)=>`<span style="display:inline-block;width:6px;height:16px;border-radius:2px;margin-right:2px;background:${n<t.str?t.sig==="BUY"?"var(--green)":"var(--red)":"var(--rule)"}"></span>`).join("");return`<tr>
    <td><strong>${t.sym}</strong> <span style="font-size:12px;color:var(--ink-3)">${t.name}</span></td>
    <td class="r" style="font-family:var(--mono)">${o(t.price,2)}</td>
    <td class="r" style="font-family:var(--mono);color:${s};font-weight:500">${t.rsi}</td>
    <td class="r" style="font-size:13px">${t.macd}</td>
    <td class="r" style="font-size:13px">${t.ma} 200MA</td>
    <td><span class="sig ${k(t.sig)}">${t.sig}</span></td>
    <td>${a}</td>
  </tr>`}).join("");const v=[{m:"1M",y:5.32},{m:"3M",y:5.28},{m:"6M",y:5.18},{m:"1Y",y:4.88},{m:"2Y",y:4.26},{m:"5Y",y:4.51},{m:"10Y",y:4.48},{m:"20Y",y:4.71},{m:"30Y",y:4.67}],O=Math.max(...v.map(t=>t.y));document.getElementById("yield-bars").innerHTML=v.map(t=>`
  <div class="yield-col">
    <div style="font-size:10px;font-weight:500;font-family:var(--mono);color:var(--ink-2)">${t.y}%</div>
    <div class="yield-bar" style="height:${t.y/O*70}px"></div>
    <div style="font-size:10px;font-family:var(--mono);color:var(--ink-3)">${t.m}</div>
  </div>`).join("");
