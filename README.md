# FinanceBase.org

> Free financial tools and live market data for investors worldwide.

**Stack:** Vite · Vanilla JS (ES modules) · Canvas charts · No UI framework

---

## Quick Start

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # outputs to /dist
npm run preview    # preview the production build locally
```

---

## API Keys

Keys are stored in `.env` at the project root (already created, never committed to git).

```
VITE_ALPHA_VANTAGE_KEY=your_key_here
VITE_NEWS_API_KEY=your_key_here
```

`.env` is in `.gitignore` — it will **never** appear in your GitHub repository.

When you deploy, add the environment variables in your hosting platform:
- **GitHub Pages** — use the `gh-pages` Action and set secrets (see Deploy section)
- **Netlify / Vercel** — add vars in the dashboard under Environment Variables

### APIs used

| API | Key needed | Free tier | Used for |
|-----|-----------|-----------|----------|
| [CoinGecko](https://www.coingecko.com/api) | No | Unlimited (rate limited) | Live crypto prices |
| [Alpha Vantage](https://www.alphavantage.co/support/#api-key) | Yes | 25 req/day | Live stock quotes |
| [NewsAPI](https://newsapi.org/register) | Yes | 100 req/day | Finance news feed |

### NewsAPI and CORS in production

NewsAPI blocks browser requests from non-localhost origins (free plan CORS restriction). Two options:

**Option A — Cloudflare Worker proxy (free, recommended)**

```js
// worker.js — deploy at https://news-proxy.YOUR_USERNAME.workers.dev
export default {
  async fetch(req) {
    const url = new URL(req.url);
    const target = 'https://newsapi.org' + url.pathname + url.search;
    const res = await fetch(target, { headers: { 'X-Api-Key': 'YOUR_NEWS_API_KEY' } });
    const data = await res.json();
    return new Response(JSON.stringify(data), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  },
};
```

Then update `src/js/api.js` — replace the NewsAPI fetch URL with your Worker URL.

**Option B — Upgrade to NewsAPI Developer plan** ($449/mo) which removes CORS restriction.

Until then, the site automatically falls back to curated static news stories when the API is blocked.

---

## Deploy to GitHub Pages

### 1. Push the repo (without .env)

```bash
git init
git add .
git commit -m "Initial commit — FinanceBase.org"
git remote add origin https://github.com/YOUR_USERNAME/financebase.git
git push -u origin main
```

### 2. Add GitHub Actions workflow

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm install
      - run: npm run build
        env:
          VITE_ALPHA_VANTAGE_KEY: ${{ secrets.VITE_ALPHA_VANTAGE_KEY }}
          VITE_NEWS_API_KEY: ${{ secrets.VITE_NEWS_API_KEY }}
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

### 3. Add secrets in GitHub

Repo → Settings → Secrets and variables → Actions → New repository secret:
- `VITE_ALPHA_VANTAGE_KEY`
- `VITE_NEWS_API_KEY`

### 4. Enable GitHub Pages

Repo → Settings → Pages → Source: **Deploy from a branch** → Branch: `gh-pages`

### 5. Custom domain

In Settings → Pages, add `financebase.org`. Then at your DNS registrar:

```
Type    Host    Value
A       @       185.199.108.153
A       @       185.199.109.153
A       @       185.199.110.153
A       @       185.199.111.153
CNAME   www     YOUR_USERNAME.github.io
```

Add a `public/CNAME` file containing:
```
financebase.org
```

---

## Project Structure

```
financebase-vite/
├── index.html                        ← Homepage entry
├── src/
│   ├── css/
│   │   └── main.css                  ← Shared design system
│   ├── js/
│   │   ├── api.js                    ← All API calls + static fallbacks
│   │   ├── charts.js                 ← Canvas sparkline + area chart
│   │   ├── ui.js                     ← Nav, ticker, footer injection
│   │   ├── home.js                   ← Homepage logic
│   │   ├── markets.js                ← Markets page logic
│   │   ├── calculators.js            ← All calculator logic
│   │   └── news.js                   ← News feed logic
│   └── pages/
│       ├── markets/index.html
│       ├── calculators/index.html
│       └── news/index.html
├── public/                           ← Static assets (favicon, CNAME, robots.txt)
├── .env                              ← API keys — NEVER committed
├── .gitignore                        ← Ignores .env and node_modules
├── vite.config.js
└── package.json
```

---

## SEO Checklist

- [x] Unique `<title>` and `<meta description>` on every page
- [x] `<link rel="canonical">` on every page
- [x] Semantic HTML (`<h1>`, `<h2>`, `<article>`, `<nav>`, `<footer>`)
- [x] Mobile-responsive design
- [ ] Add `public/sitemap.xml`
- [ ] Add `public/robots.txt`
- [ ] Submit to Google Search Console
- [ ] Submit to Bing Webmaster Tools

### public/sitemap.xml

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://financebase.org/</loc><changefreq>daily</changefreq><priority>1.0</priority></url>
  <url><loc>https://financebase.org/markets/</loc><changefreq>daily</changefreq><priority>0.9</priority></url>
  <url><loc>https://financebase.org/calculators/</loc><changefreq>weekly</changefreq><priority>0.9</priority></url>
  <url><loc>https://financebase.org/news/</loc><changefreq>daily</changefreq><priority>0.8</priority></url>
</urlset>
```

### public/robots.txt

```
User-agent: *
Allow: /
Sitemap: https://financebase.org/sitemap.xml
```

---

## License

MIT
