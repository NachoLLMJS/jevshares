# JevShares frontend

Live-ready static frontend for an AI-directed creator-fee distribution vault built around Flap vault infrastructure and Flap AI Oracle.

## Run locally

```bash
python -m http.server 4177 --bind 127.0.0.1
```

Open `http://127.0.0.1:4177`.

## Contract binding

Update only `config.js` after deployment:

- `vaultAddress`
- `tokenAddress`
- `factoryAddress`

The frontend intentionally leaves contract-derived balances, epochs, claimable amounts, and risk status as `—` / unavailable until verified addresses and ABI-backed reads are integrated. Wallet connection is a real click-initiated EIP-1193 flow targeting BNB Chain. Claim submission remains fail-closed.

## Product model

Creator fees enter a Flap-compatible vault. For each allocation epoch, Jev uses Flap AI Oracle to select one numeric choice from three published holder-first policies. The vault validates the choice, records the epoch, and exposes claims. The architecture keeps destinations bounded and makes the reasoning reference auditable.

## Visual assets

- The hero is a custom HTML/CSS/SVG lettering composition with vector distribution routes; it has no generated background image.
- `assets/jev-agent-master.png` — generated Jev core master artwork
- `assets/jev-agent.webp` — 900×900 web derivative

The remaining Jev-core artwork was generated specifically for JevShares with OpenAI image generation on 2026-09-21. It contains no third-party logos or copied brand assets.
