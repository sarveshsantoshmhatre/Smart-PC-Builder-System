# Live Market Data Setup

The Smart PC Builder now includes a server-side market-data layer backed by the PriceYuge / DataYuge Price Comparison API.

## 1. Create the API key

Create a developer key from the PriceYuge/DataYuge developer portal:

https://price-api.datayuge.com/register

The service documents a free tier with 100 API hits/day and describes the feed as daily updated. It is therefore "latest available market data", not guaranteed tick-by-tick real-time pricing.

## 2. Store the key privately in the Puter Worker

Do not put the key in `index.html`, `app.js`, `puter-config.js`, or any committed source file.

Install/login to the Puter CLI and connect to the worker KV store:

```bash
npm install -g @heyputer/cli
puter login
puter kv connect https://smart-pc-builder-ai.puter.work
```

Then, at the KV prompt:

```text
set("DATAYUGE_API_KEY", "YOUR_API_KEY")
```

The Worker reads this value server-side through its `me.puter.kv` namespace.

## 3. Test the feed

Open the website and use the **Refresh tools** button in the Decision Tools section.

The Live Market panel reports:
- matched components
- current provider offers returned by the feed
- lowest matched price
- retailer links
- retrieval timestamp

## 4. Important pricing behavior

The deterministic builder still uses its local hardware metadata for compatibility and recommendation scoring. The new market layer supplies the latest available market prices separately so stale demo prices are no longer presented as live retailer prices.

The upstream DataYuge documentation says product prices may be updated once per day, so the interface intentionally shows the provider and timestamp rather than claiming guaranteed real-time accuracy.

For a purchase, open the retailer offer and verify the final checkout price, stock, delivery and applicable offers.

## 5. Optional future upgrade

A provider with on-demand retailer fetching can be added behind the same `/market/build` endpoint without changing the frontend. This keeps the market provider replaceable.
