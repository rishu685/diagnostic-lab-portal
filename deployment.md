# Deployment & Reviewer Guide
## Diagnostic Lab Report-Delivery Portal (Company A, Vijayawada)

This guide provides step-by-step instructions for running the project locally, details on deployment, required environment variables, and pre-configured demo credentials for the reviewer.

---

## 1. Quick Local Setup (Step-by-Step)

The project uses Next.js 16 with SQLite via Prisma. It requires **Node.js 18+ or 20+** and zero external database configuration.

### Step 1: Navigate to Project Directory
```bash
cd /Users/apple/Desktop/diagnostic-lab-portal
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Initialize & Seed Database
```bash
# Pushes the Prisma schema to local SQLite (dev.db)
npx prisma db push

# Seeds realistic diagnostic data (including brief sample orders: ORD-71204, ORD-71219, ORD-71233)
npm run seed
```

### Step 4: Run the Development Server
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

### Step 5: Run Automated Tests
```bash
npm test
```
All 11 automated clinical range, HMAC token expiration, and safety killswitch tests will execute with Vitest.

---

## 2. Reviewer Demo Credentials & Walkthrough Guide

The application comes pre-loaded with the exact sample data specified in the brief. You can test each role immediately:

### A. Patient Role (OTP Authentication & Multilingual View)
* **Access URL**: `http://localhost:3000/patient/login`
* **Test Phone Numbers**:
  1. `9848011111` — **Lakshmi Prasanna K** (`ORD-71204`): Haemoglobin 10.2 g/dL (Mild anaemia). Includes plain-language Telugu explanation.
  2. `9848033333` — **Farzana Begum** (`ORD-71233`): Critical Potassium 6.8 mmol/L. Emergency alert displayed; AI summary blocked.
  3. `9848022222` — **Venkata Rao M** (`ORD-71219`): LDL cholesterol 142 mg/dL. Status: In Analyzer / Processing.
  4. `9848044444` — **Subba Rao Chowdary** (`ORD-71240`): All parameters normal.
* **Universal Demo OTP**: `123456` *(Works for all accounts in demo mode, or click the "Auto-fill" button on screen)*.
* **Direct 72-Hour Link Test**: Click on the floating **"SMS / WhatsApp Simulator"** button at the bottom-right of any screen to test what the patient receives on WhatsApp!

### B. Front-Desk Staff Role
* **Access URL**: `http://localhost:3000/front-desk`
* **Capabilities**:
  * Search patients by name, phone, or order reference.
  * Real-time 72-hour link countdown display.
  * 1-Click "Resend Link" button to regenerate a fresh 72-hour token and simulate WhatsApp/SMS delivery.
  * Direct link to inspection view.

### C. Critical Clinical Callback Queue
* **Access URL**: `http://localhost:3000/callbacks`
* **Capabilities**:
  * Review emergency clinical escalations (e.g., Farzana Begum's Potassium 6.8 mmol/L).
  * Direct 1-click telephone call links for patient and referring doctor.
  * Duty staff resolution notes & status updates (`PENDING` $\to$ `IN_PROGRESS` $\to$ `RESOLVED`).

### D. Referring Doctor Role (90-Day Portal)
* **Access URL**: `http://localhost:3000/doctor`
* **Doctors Available in Dropdown**:
  * **Dr. S. Ramanaiah** (General Medicine) — Doctor for Lakshmi Prasanna & Subba Rao.
  * **Dr. P. Anitha** (Cardiology) — Doctor for Venkata Rao M.
  * **Dr. K. Suresh** (Nephrology & Critical Care) — Doctor for Farzana Begum.
  * **Dr. Ch. Madhavilatha** (Endocrinology).

### E. LIS CSV Import & Auto Sign-Off
* **Access URL**: `http://localhost:3000/lis-import`
* **Capabilities**:
  * Click "Reset to Brief Samples" or upload any CSV export.
  * Real-time clinical parameter parser & flag evaluator.
  * "Process & Sign-Off All" triggers instant 72-hour token generation, locked template summaries, and DPDP audit entries.

### F. DPDP Act 2023 Audit Log
* **Access URL**: `http://localhost:3000/audit-logs`
* **Capabilities**:
  * View immutable audit trail of every access event, OTP request, link open, and staff resend.

---

## 3. Environment Variables

The project works 100% out of the box using built-in locked medical templates without any external API keys.

To enable optional dynamic Gemini AI features, configure a `.env.local` file:

```env
# Optional: Google Gemini API Key for dynamic multi-parameter AI summaries
# If omitted or left empty, system automatically uses pre-vetted locked clinical templates.
GEMINI_API_KEY=""

# Cryptographic salt for 72-hour HMAC expiring tokens (has sensible fallback if omitted)
TOKEN_SECRET=""

# Database connection URL (defaults to SQLite dev.db)
DATABASE_URL="file:./dev.db"
```

---

## 4. Production Deployment

The project is built on Next.js 16 (App Router) and can be deployed in under 2 minutes to **Vercel**, **Railway**, **Render**, or any Node.js container platform.

### Vercel Deployment:
1. Push repository to GitHub.
2. Import project in Vercel.
3. Configure `DATABASE_URL` (e.g. Neon Serverless Postgres, Supabase, or Turso SQLite).
4. Run `npx prisma db push && npm run seed` in build command or via migration script.
5. Deploy.
