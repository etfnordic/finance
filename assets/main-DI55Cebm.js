const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/ui-D0XLm06S.js","assets/ui-DxYj9V9p.css"])))=>i.map(i=>d[i]);
import{m as b,a as $,b as E,f as S,c as k,d as u,e as _,u as C,S as v,h as P,g as T,p as I,t as f}from"./ui-D0XLm06S.js";import{s as B,g as A}from"./charts-KMvg-zGG.js";const N="modulepreload",z=function(o){return"/"+o},h={},F=function(e,n,c){let t=Promise.resolve();if(n&&n.length>0){let a=function(i){return Promise.all(i.map(l=>Promise.resolve(l).then(p=>({status:"fulfilled",value:p}),p=>({status:"rejected",reason:p}))))};document.getElementsByTagName("link");const r=document.querySelector("meta[property=csp-nonce]"),s=r?.nonce||r?.getAttribute("nonce");t=a(n.map(i=>{if(i=z(i),i in h)return;h[i]=!0;const l=i.endsWith(".css"),p=l?'[rel="stylesheet"]':"";if(document.querySelector(`link[href="${i}"]${p}`))return;const d=document.createElement("link");if(d.rel=l?"stylesheet":N,l||(d.as="script"),d.crossOrigin="",d.href=i,s&&d.setAttribute("nonce",s),document.head.appendChild(d),l)return new Promise((w,x)=>{d.addEventListener("load",w),d.addEventListener("error",()=>x(new Error(`Unable to preload CSS for ${i}`)))})}))}function m(r){const s=new Event("vite:preloadError",{cancelable:!0});if(s.payload=r,window.dispatchEvent(s),!s.defaultPrevented)throw r}return t.then(r=>{for(const s of r||[])s.status==="rejected"&&m(s.reason);return e().catch(m)})};b("home");const y=document.getElementById("ticker-track");$(y);E();async function g(){try{const[o,e]=await Promise.all([S(),k()]),n=o.find(c=>c.id==="bitcoin");if(n){document.getElementById("h-btc").textContent=n.current_price.toLocaleString("en-US",{maximumFractionDigits:0});const c=n.price_change_percentage_24h||0,t=document.getElementById("h-btc-c");t.textContent=u(c),t.className="snap-chg "+(c>=0?"text-green":"text-red")}if(e?.data){const c=e.data.total_market_cap?.usd,t=e.data.market_cap_percentage?.btc;c&&(document.getElementById("h-mcap").textContent=_(c).replace("$","")+"USD"),t&&(document.getElementById("h-dom").textContent=t.toFixed(1)+"%")}C(y,o)}catch{}}g();setInterval(g,6e4);function L(){const o=document.getElementById("preview-tbody");o.innerHTML=v.slice(0,6).map(e=>`<tr>
      <td>
        <div class="asset-cell">
          <div class="asset-logo" style="background:${P(e.col)};color:${e.col}">${e.sym.slice(0,4)}</div>
          <div><div style="font-weight:600">${e.sym}</div><div style="font-size:12px;color:var(--ink-3)">${e.name}</div></div>
        </div>
      </td>
      <td style="font-family:var(--mono);font-weight:500">${T(e.price,2)}</td>
      <td><span class="pill ${I(e.chgPct)}">${u(e.chgPct)}</span></td>
      <td style="color:var(--ink-3);font-size:13px">${e.vol}</td>
      <td><canvas data-sym="${e.sym}" width="80" height="28" style="display:inline-block"></canvas></td>
    </tr>`).join(""),v.slice(0,6).forEach(e=>{const n=o.querySelector(`canvas[data-sym="${e.sym}"]`);n&&B(n,A(16,e.chgPct>0?1:-1),e.chgPct>=0?"#0a7c4f":"#b91c1c")})}L();async function M(){const{fetchFinanceNews:o,STATIC_NEWS:e}=await F(async()=>{const{fetchFinanceNews:a,STATIC_NEWS:i}=await import("./ui-D0XLm06S.js").then(l=>l.r);return{fetchFinanceNews:a,STATIC_NEWS:i}},__vite__mapDeps([0,1]));let n=await o();n||(n=e);const c=document.getElementById("news-preview"),[t,...m]=n.slice(0,5),r=a=>a.category||"MARKETS",s=a=>a.source?.name||"FinanceBase";c.innerHTML=`
    <div class="news-feature">
      <div class="news-img-placeholder">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--blue)" stroke-width="1.2">
          <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/>
          <path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/>
        </svg>
      </div>
      <div class="card-pad">
        <div class="news-cat">${r(t)}</div>
        <h3 class="news-title">${t.title}</h3>
        <p class="news-excerpt">${t.description||t.excerpt||""}</p>
        <div style="display:flex;gap:8px;font-size:12px;color:var(--ink-3)">
          <span class="news-src">${s(t)}</span><span>·</span><span>${f(t.publishedAt)}</span>
        </div>
      </div>
    </div>
    <div class="news-list-card">
      <div style="padding:14px 20px;border-bottom:1px solid var(--rule)">
        <span class="eyebrow" style="font-size:10px">Latest Stories</span>
      </div>
      ${m.map(a=>`
        <div class="news-list-item">
          <div class="news-cat">${r(a)}</div>
          <div style="font-size:15px;font-weight:600;line-height:1.4;color:var(--ink);margin-bottom:4px">${a.title}</div>
          <div style="font-size:12px;color:var(--ink-3)">${s(a)} · ${f(a.publishedAt)}</div>
        </div>`).join("")}
      <div style="padding:12px 20px;text-align:center">
        <a href="/news/" style="font-size:13px;font-weight:600;color:var(--blue)">View all news</a>
      </div>
    </div>`}M();
