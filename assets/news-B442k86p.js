import{m as p,a as u,b as f,f as m,d as v,t as o,o as g,q as h}from"./ui-D0XLm06S.js";p("news");u(document.getElementById("ticker-track"));f();m().then(e=>{const n=e.find(r=>r.id==="bitcoin");if(!n)return;document.getElementById("sb-btc").textContent="$"+n.current_price.toLocaleString("en-US",{maximumFractionDigits:0});const t=n.price_change_percentage_24h||0,s=document.getElementById("sb-btc-c");s.textContent=v(t),s.style.color=t>=0?"var(--green)":"var(--red)"}).catch(()=>{});let i=[];function c(e){if(e.category)return e.category.toLowerCase();const n=(e.title+" "+(e.description||"")).toLowerCase();return/bitcoin|ethereum|crypto|blockchain|defi|nft|solana|binance/.test(n)?"crypto":/bond|treasury|yield|fixed.income/.test(n)?"bonds":/gdp|unemployment|inflation|cpi|fed|rate|macro|imf/.test(n)?"economy":/stock|earnings|ipo|nasdaq|s&p|equit/.test(n)?"stocks":"markets"}function l(e){return e.toUpperCase()}function d(e){const n=document.getElementById("news-feed");if(!e.length){n.innerHTML='<p class="caption" style="padding:40px 0">No stories found for this category.</p>';return}const[t,...s]=e,r=t.source?.name||"FinanceBase";n.innerHTML=`
    <article class="news-feature">
      <div class="news-img">
        <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="var(--blue)" stroke-width="1.2">
          <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/>
          <path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/>
        </svg>
      </div>
      <div class="card-pad">
        <div class="news-cat">${l(c(t))}</div>
        <h2 class="news-title-lg">${t.title}</h2>
        <p class="news-excerpt">${t.description||""}</p>
        <div class="news-meta-row">
          <span class="news-src">${r}</span>
          <span>·</span>
          <span>${o(t.publishedAt)}</span>
          ${t.url&&t.url!=="#"?`<span>·</span><a href="${t.url}" target="_blank" rel="noopener" style="color:var(--blue);font-weight:500">Read full story</a>`:""}
        </div>
      </div>
    </article>
    <div class="news-list">
      ${s.map(a=>`
        <div class="news-item" ${a.url&&a.url!=="#"?`onclick="window.open('${a.url}','_blank')"`:""}>
          <div class="news-cat">${l(c(a))}</div>
          <div class="news-item-title">${a.title}</div>
          <div class="caption">${a.source?.name||"FinanceBase"} · ${o(a.publishedAt)}</div>
        </div>`).join("")}
      <div style="padding:12px 20px;text-align:center">
        <span class="caption">Powered by <a href="https://newsapi.org" target="_blank" rel="noopener" style="color:var(--blue)">NewsAPI</a></span>
      </div>
    </div>`}window.filter=function(e,n){document.querySelectorAll(".ftag").forEach(s=>s.classList.remove("active")),n.classList.add("active");const t=e==="all"?i:i.filter(s=>c(s)===e);d(t.length?t:i.slice(0,10))};async function w(){let e=await g();(!e||e.length===0)&&(e=h),i=e,d(i)}w();
