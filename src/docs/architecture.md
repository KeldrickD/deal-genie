# GenieOS – Architecture Overview

---

## 🏗️ Structure

- `/components` → Reusable UI components
- `/pages` → App routes (Next.js)
- `/api` → API routes for AI, deals, offers
- `/styles` → Global Tailwind styles
- `/utils` → Helper functions (e.g. AI formatters)
- `/lib` → OpenAI, Supabase, PDF, external APIs
- `/types` → TypeScript types
- `/docs` → Internal documentation

---

## 🌐 Frontend Flow

1. User logs in (Supabase Auth)
2. Inputs a property address or uploads a CSV
3. Triggers `/api/analyze` to run OpenAI + property API logic
4. Gets:
   - Decision summary
   - ROI breakdown
   - MAO + offer sheet
5. Can generate and send offer from Offer Generator
6. Smart Scout suggests other zips based on ROI & DOM trends

---

## 🧠 Backend Flow

- `/api/analyze`:  
  - Calls OpenAI GPT-4 with structured prompt  
  - Pulls property data via external API  
  - Calculates: ARV, repair, MAO, ROI  
  - Returns structured analysis JSON

- `/api/offer`:  
  - Uses AI to format property into offer email  
  - Converts analysis data into styled PDF  
  - Saves to Supabase if needed

---

## 🧠 AI Prompt Logic

- `analyze.ts` prompt:
  - Role: Real estate investment analyst  
  - Inputs: Address, comps, user strategy  
  - Outputs: Summary, risk, offer, ROI, flip vs rental

- `offer.ts` prompt:
  - Role: Investor writing an offer  
  - Output: Short offer paragraph + downloadable deal sheet

---

## 📦 Data Storage (Supabase)

- `users`  
- `leads` (input + result JSON)  
- `offers` (PDF links, email status)  
- `profile` (user preferences, Genie Profile)  
- `zip_stats` (Smart Scout insights)

---

## 🔐 Auth

- Supabase email auth (initially)
- Optional: OAuth (Google) for teams

---

## 🧩 Coming Soon

- GenieNet: Crowd-sourced deal radar
- Team dashboards
- Webhooks + API keys
- CRM integrations 