# Pause — UPI Fraud Prevention

**An AI-powered intent verification layer for UPI payments.**  
NPCI Hackathon Demo · Built with Next.js + Claude Sonnet

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fmayurmittal%2Fnpci-demo&env=ANTHROPIC_API_KEY&envDescription=Your%20Anthropic%20API%20key%20from%20console.anthropic.com&envLink=https%3A%2F%2Fconsole.anthropic.com&project-name=pause-upi&repository-name=npci-demo)

---

## What it does

Pause intercepts incoming UPI collect requests, classifies fraud risk in real-time using Claude, and shows the user a plain-language explanation of what's actually about to happen — adding friction only when fraud signals are strong.

**Three severity tiers:**

| Tier | Score | Behaviour |
|------|-------|-----------|
| GREEN | 0–30 | Standard PIN entry. No interception. |
| AMBER | 31–70 | Soft warning banner above PIN keypad. User can proceed immediately. |
| RED | 71–100 | Full-screen block with 3-second countdown before "Proceed anyway" unlocks. |

---

## Live Demo

> Deployed at: _(add your Vercel URL here after deploy)_

Tap the **gear icon ⚙** (top-right of the phone frame) to switch between 5 pre-built scenarios:

| # | Scenario | Expected Result |
|---|----------|-----------------|
| 1 | Raju Kirana Store — ₹450, known merchant | GREEN |
| 2 | Priya Sharma — ₹500, first-time contact | AMBER |
| 3 | OLX cashback scam — ₹18,000 | RED |
| 4 | Digital arrest coercion — ₹2,50,000 | RED |
| 5 | Fake customer care + AnyDesk — ₹15,000 | RED |

---

## Stack

- **Next.js 16** (App Router, TypeScript)
- **Tailwind CSS v4**
- **Anthropic Claude Sonnet** — live fraud classification via `/api/evaluate`
- **Vercel** — hosting (Mumbai region `bom1`)

---

## Local Development

```bash
# 1. Clone
git clone https://github.com/mayurmittal/npci-demo.git
cd npci-demo

# 2. Install dependencies
npm install

# 3. Set up environment
cp .env.example .env.local
# Edit .env.local and add your ANTHROPIC_API_KEY

# 4. Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Deploy to Vercel (GitHub)

1. Push this repo to GitHub
2. Go to [vercel.com/new](https://vercel.com/new) → import the GitHub repo
3. Add environment variable:
   - **Key:** `ANTHROPIC_API_KEY`
   - **Value:** your key from [console.anthropic.com](https://console.anthropic.com)
4. Click **Deploy**

The `vercel.json` already sets the Mumbai region — no extra config needed.

---

## API Reference

`POST /api/evaluate`

**Request:**
```json
{
  "scenario": {
    "amount": 18000,
    "beneficiaryName": "Quick Pay Store",
    "beneficiaryVpa": "quickpay.store247@ybl",
    "description": "Approve to receive Rs 18,000",
    "isFirstTimeBeneficiary": true,
    "previousTransactionCount": 0,
    "averageTransactionAmount": 850,
    "deviceSignals": { "screenSharing": false, "accessibilityServicesActive": false, "sameCity": true, "unusualTime": false },
    "behavioralSignals": { "referralSource": "whatsapp_link", "recentSearches": [], "sessionAnomalies": [] }
  }
}
```

**Response:**
```json
{
  "risk_score": 92,
  "severity": "RED",
  "headline": "This is a payment, not a receipt. ₹18,000 will leave your account.",
  "primary_reason": "Transaction description claims you will receive money, but this is a collect request that debits your account.",
  "supporting_signals": ["Direction confusion language detected", "First-time beneficiary", "Amount 21x above average"],
  "category_scores": {
    "transaction": 75,
    "beneficiary": 80,
    "device": 10,
    "behavioral": 55,
    "content_intent": 95
  },
  "amplification_rule": "3 categories above 70 — weighted average amplified by 1.4x"
}
```

---

## Project Structure

```
app/
  page.tsx              # Main app shell + screen routing
  layout.tsx            # Root layout
  api/
    evaluate/
      route.ts          # Claude fraud classification endpoint
components/
  UpiHome.tsx           # Simulated UPI home screen
  LoadingScreen.tsx     # AI analysis loading state
  GreenPinEntry.tsx     # Standard PIN entry (low risk)
  GreenInterstitial.tsx # Demo explainer for GREEN tier
  AmberBanner.tsx       # Soft warning (medium risk)
  RedOverlay.tsx        # Hard block (high risk)
  ReasoningDrillDown.tsx# Category score breakdown
  ScenarioSelector.tsx  # Demo scenario switcher
lib/
  scenarios.ts          # 5 pre-built test scenarios
  types.ts              # Shared TypeScript types
```

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `ANTHROPIC_API_KEY` | Yes | API key from [console.anthropic.com](https://console.anthropic.com) |
