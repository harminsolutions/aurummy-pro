# AurumMY — Malaysia Gold Intelligence v3

A responsive, Vercel-ready website for Malaysian gold retail and buyback quotations, purities, MYR spot reference, and experimental next-day forecasts.

## Run locally

Requirements: Node.js 20+

```bash
npm test
npm start
```

Open `http://localhost:3000`.

## Deploy on Vercel

1. Create a new GitHub repository and commit the **contents of this folder** to the repository root.
2. In Vercel, choose **Add New → Project → Import Git Repository**.
3. Framework preset: **Other**. Root Directory: `./`.
4. No build command or environment variables are required. Deploy.
5. Open the generated Vercel URL. Visit `/api/market` and confirm `retailers`, `spot`, and `model` status.
6. Add your custom domain in **Vercel → Project → Settings → Domains** after testing.

You can alternatively use the Vercel CLI (`vercel` for preview; `vercel --prod` for production) from this folder after verifying the Vercel account/project.

## What the dashboard uses

- Malaysian retailer quotes: publicly available TAUKEMAS and One Gold website rate panels. These are publicly accessed pages, **not contractually guaranteed stable APIs**. Website redesigns, blocks, or licensing changes can interrupt collection.
- Global gold: Gold API free `XAU` spot endpoint.
- USD/MYR: open ExchangeRate-API free feed (daily update).
- Historical model proxy: Yahoo Finance `GC=F` gold futures and `MYR=X` USD/MYR market history.
- Caching: market API has a five-minute HTTP and in-memory cache; sources are **not** guaranteed to update every five minutes. Quote timestamps represent when the app checked the source unless it has a supplier-published timestamp.

No purchase prices are fabricated. Missing quotations and missing forecasts are displayed as unavailable. Conversion to 916, 999 etc. from spot is **only** available under the visibly separated `Malaysia metal spot` mode; it is not presented as jewellery shop retail value.

## Accuracy and limitations

**99% next-day prediction accuracy cannot be guaranteed.** The current forecasting model is a basic, experimental momentum estimator with rolling historical backtest. It is **not calibrated to historical Malaysian jewellery retail prices**. Backtested directional success and MAE refer to a *market proxy*, not to tomorrow's jeweller selling price. The next-day forecast is intentionally omitted when fewer than 20 historical matched daily moves are available.

Mathematical computations (ounce to gram, fineness, USD/MYR and compounding) are independently covered by automated unit tests. This does not mean that the market inputs are perfectly fresh, nor that retailer quotes/forecasts are 99% accurate.

**For commercial-grade forecasts**, add a licensed rate feed for the specific Malaysian jewellers being followed and collect several months of timestamped retailer history. Independently backtest tomorrow's shop quote predictions on chronologically withheld historical days, track mean absolute RM/g error and directional accuracy, and publish the observed metrics. Add monitoring for provider latency, parser failures, and price outliers before advertising real-time coverage.

## Public-release checklist

- Test retailer feeds from a deployed Vercel region. Check `providers` in `/api/market`.
- Obtain permission / confirm terms for systematic re-use and public display of retailer rate data.
- Test desktop and physical phone layouts, including source switching and buyback.
- Confirm local shop quote conventions and whether advertised rates include labour/workmanship.
- Confirm a reliable historical data service, otherwise experimental forecast is unavailable.
- Configure uptime monitoring, rate freshness warnings, privacy / disclaimer pages if appropriate.

## Tests

`npm run check` performs JavaScript syntax validation and automated core tests. Browser-based visual tests and live external feed smoke tests must be completed in a network-enabled environment before public release.
