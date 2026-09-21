# Smart PC Builder and Budget-Based Component Recommendation System

A responsive PC recommendation website that builds a compatible configuration around a target budget and workload, then provides an AI assistant for explaining the recommendation.

## Project idea

Many users struggle to choose compatible PC components that maximize performance without exceeding their budget. The application simplifies this process by generating an optimized configuration from the user's budget and requirements, validating basic compatibility, and explaining the trade-offs.

## Features

- Budget slider and manual INR budget input
- Workload profiles: Gaming, Creator, Productivity, AI / ML
- 1080p, 1440p and 4K target selection
- AMD / Intel CPU preference
- RAM and storage target selection
- Budget-aware CPU + GPU recommendation engine
- CPU socket and memory compatibility checks
- GPU case-clearance validation
- PSU capacity / power-headroom validation
- Cooling-capacity validation
- Local browser persistence using localStorage
- Print / Save as PDF workflow
- Responsive desktop, tablet and mobile layout
- Cloud AI Recommendation Assistant
- AI inference through a Puter Serverless Worker
- Open/free model selection happens server-side
- No AI model download or inference on the visitor's device
- Puter authentication token is kept in GitHub Actions secrets
- Streaming AI responses
- Basic server-side rate limiting and input limits
- GitHub Pages deployment for the public website
- GitHub Actions deployment for the Puter AI Worker
- Interactive 3D build studio powered by Three.js r186 (three 0.186.0)
- 3D orbit, zoom, perspective/front/side/top views, auto-rotate, cutaway, explode, and component focus
- Budget presets and GPU-vendor preference
- Balanced / performance-first / upgrade-headroom optimization modes
- Alternative build comparison: balanced, GPU-first, CPU-first
- Shareable build URLs with configuration encoded in the query string
- Export build as JSON and copy a build summary
- Workload-fit, cost-allocation, system-balance, and upgrade-roadmap analysis

## 3D visualization

The public site includes a procedural Three.js build viewer. It does not download product CAD files; the scene is a conceptual representation of the selected CPU, GPU, motherboard, memory, storage, PSU, cooler, fans, and case. The viewer is intentionally lightweight so it can run as a static GitHub Pages site.

Controls include orbit/zoom, camera presets, auto-rotate, cutaway mode, exploded view, and component focus.

## Architecture

```text
Visitor browser
    |
    | question + current PC build context
    v
GitHub Pages website
    |
    | HTTPS POST
    v
Puter Serverless Worker
    |
    | server-side Puter context (me.puter)
    v
Free/open AI model available in Puter's catalog
```

The public JavaScript contains only the Worker URL. The Puter auth token is never placed in the frontend. Puter Workers expose an owner context (`me.puter`) whose AI calls run using the worker owner's resources.

## Puter setup

1. Create or log into your Puter account and make sure the account email is verified; Puter requires a verified email for creating a Worker.
2. In the Puter dashboard, create/copy your auth token. Keep it secret. Puter documents this token as the credential used for backend/CLI automation.
3. In this GitHub repository, open **Settings → Secrets and variables → Actions → New repository secret**.
4. Create a secret named `PUTER_TOKEN` and paste the Puter auth token there.
5. Push the repository to `main`, or manually run **Deploy Smart PC Builder AI Worker** from **Actions**.
6. The workflow creates/deploys the Worker at:
   `https://smart-pc-builder-ai.puter.work`
7. The website already points to that Worker URL in `puter-config.js`.

The worker dynamically selects an available open/free model from the Puter catalog, preferring Qwen when a free variant is available. Puter documents `:free` model variants as provider-controlled free tiers with rate limits/daily quotas, and availability can change.

## Important security note

Do **not** put your Puter auth token in:
- `index.html`
- `app.js`
- `puter-config.js`
- any client-side JavaScript
- GitHub repository files

The worker is the server-side boundary that keeps the token private.

Because this design intentionally lets visitors use AI without signing into Puter, the Worker endpoint is publicly callable. The included rate limiter reduces casual abuse, but it is not a replacement for full user authentication or an anti-bot service for a high-traffic public deployment.

## Cost / free-model note

Puter's normal browser-side model is User-Pays: users authenticate with Puter and their own usage is metered to their account. This project deliberately uses a different architecture: the Worker calls AI through the worker owner's `me.puter` context, so the AI requests use the owner's Puter resources instead.

The project asks the Worker to use an open/free model variant. "Free" does not mean unlimited: providers can impose rate limits or daily quotas, and Puter can change which `:free` variants are available.

## Run locally

Serve the folder with any static web server:

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000.

Local browser testing of the AI section requires the Puter Worker to already be deployed because the browser is calling the cloud endpoint.

## Deployment

The repository includes:
- a GitHub Pages workflow for the website
- a validation workflow
- a GitHub Actions workflow for the Puter AI Worker

## Data and pricing note

The component catalog uses illustrative INR prices and specifications for demonstration. It is not a live retailer-price feed and should be replaced with a maintained catalog or API before production use.

## Tech stack

HTML, CSS and vanilla JavaScript for the public site, plus a small serverless JavaScript Worker for cloud AI routing.

Validated with GitHub Actions on pushes to `main`.


## Live market data

The public site can retrieve current market offers through the Worker \`/market/build\` endpoint. The Worker keeps the PriceYuge/DataYuge API key in its private Puter KV store under \`DATAYUGE_API_KEY\`; no market credential is shipped to the browser.

Setup is documented in [MARKET-SETUP.md](MARKET-SETUP.md).

The DataYuge documentation states that its prices are generally updated once per day, so the application labels this as the latest available market feed rather than promising tick-by-tick real-time pricing.

## Account system

The website includes a browser login flow powered by Puter.js. Users can sign in with a Puter account, see their current account in the header, sign out, and save up to 20 generated builds to their own app-scoped Puter KV store. Saved builds can be loaded or deleted from the account menu.

The site itself does not collect or store passwords. Authentication is delegated to Puter's website authentication flow, and the frontend only uses Puter.js browser APIs.

