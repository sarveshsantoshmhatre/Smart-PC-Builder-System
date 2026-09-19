# Smart PC Builder and Budget-Based Component Recommendation System

A responsive front-end project that helps users generate a PC build around a target budget and workload.

## Project idea

Many users struggle to choose compatible PC components that maximize performance without exceeding their budget. Existing solutions often require extensive technical knowledge and manual comparison of hardware specifications.

This platform simplifies the process by automatically generating an optimized PC build based on the user's budget and requirements, checking basic compatibility and presenting the reasoning behind the selection.

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
- Fully responsive layout for desktop, tablet and mobile
- Local AI Recommendation Assistant powered by the open Qwen3-0.6B-Instruct ONNX model
- Runs entirely in the browser with Transformers.js; no API key, signup, or backend is required
- AI chat uses the current generated build as structured context
- WebGPU acceleration when available, with CPU/WASM fallback
- Model files are cached by the browser after first download
- No backend or build step required

## Run locally

Open `index.html` in a browser, or serve the folder with any static web server.

Example:

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000.

## Deployment

The repository includes a GitHub Actions workflow for GitHub Pages. The workflow configures Pages automatically and deploys the root of the repository after pushes to `main`.

## Important note

The component catalog uses illustrative INR prices and specifications for demonstration. It is not a live retailer-price feed and should be replaced with a maintained catalog or API before production use.

The local AI uses `onnx-community/Qwen3-0.6B-Instruct-ONNX` with Transformers.js. The first AI use requires downloading model files from Hugging Face; no account or API key is required. The model is licensed Apache-2.0.

## Tech stack

HTML, CSS and vanilla JavaScript.

Validated with GitHub Actions on pushes to `main`.
