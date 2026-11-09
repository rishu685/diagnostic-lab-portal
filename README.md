# Diagnostic Lab Report-Delivery Portal
> **Client**: Company A, Vijayawada, Coastal Andhra Pradesh (6 Reference Labs, 38 Collection Centres, 2,000 patients/day)  
> **Repository**: [https://github.com/rishu685/diagnostic-lab-portal](https://github.com/rishu685/diagnostic-lab-portal)  
> **Design Philosophy**: Minimalist Kanso Aesthetic (`Newsreader` serif, warm monochrome tokens, high-density clinical clarity).

---

## Overview

A secure, high-throughput report delivery platform designed to resolve operational overhead, reduce printing costs, and deliver multilingual diagnostic clarity to patients across coastal Andhra Pradesh while adhering to the **Digital Personal Data Protection (DPDP) Act 2023**.

### Core Capabilities
- **72-Hour Expiring Links**: Pathologist sign-off automatically generates an expiring token with HMAC signature.
- **Two-Factor Authentication**: Patient enters mobile OTP (`123456` in mock mode) before accessing medical records.
- **Plain-Language Multilingual Summaries**: English, Telugu (తెలుగు), and Hindi (हिंदी) interpretations of clinical findings.
- **Critical Value Killswitch**: Immediate suppression of AI interpretations for life-threatening values with automated escalation to the Front-Desk Critical Callback Queue.
- **Referring Doctor 90-Day Archive**: Physician portal to review all historical patient cases.
- **Front-Desk Resend & Audit**: Real-time link status monitoring and single-tap SMS resends.
- **LIS Batch Ingestion**: Upload lab result CSV files with instant auto-validation and dispatch.

---

## Quick Start (Local Setup)

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher

### Installation

```bash
# 1. Clone repository
git clone https://github.com/rishu685/diagnostic-lab-portal.git
cd diagnostic-lab-portal

# 2. Install dependencies
npm install

# 3. Initialize & seed SQLite database
npx prisma db push
npm run seed

# 4. Start local development server
npm run dev
```

Visit **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## Automated Test Suite

Run unit and integration tests covering clinical rule ranges, safety killswitches, and token verification:

```bash
npm test
```

---

## System Roles & Demo Walkthrough

| Role | Route | Access Method | Key Features |
| :--- | :--- | :--- | :--- |
| **Patient (Expiring Link)** | `/r/mock-tok-71204` | Click *Send OTP*, enter `123456` | Complete Blood Count (Hb: 10.2 g/dL) |
| **Patient (Critical Killswitch)**| `/r/mock-tok-71219` | Click *Send OTP*, enter `123456` | Potassium 2.4 mEq/L (AI suppressed, critical alert) |
| **Patient Phone Login** | `/patient/login` | Phone: `9848011223`, OTP: `123456` | Unified history across all lab orders |
| **Front-Desk Console** | `/front-desk` | Direct access | Delivery status tracking & instant SMS resend |
| **Referring Physician** | `/doctor` | Select Dr. K. Venkatesh, MD | 90-day archive of referred patient cases |
| **Emergency Callbacks** | `/callbacks` | Direct access | Critical value escalation & duty log trail |
| **DPDP Compliance Audit** | `/audit-logs` | Direct access | Immutable audit log under DPDP Act 2023 |
| **LIS Batch Ingestion** | `/lis-import` | Click *Load Sample Data* | Laboratory information system CSV importer |

---

## Technical Documentation

- **[TECHNICAL_DESIGN_DOCUMENT.md](./TECHNICAL_DESIGN_DOCUMENT.md)**: Architectural specifications, clinical safety protocols, UI system design, and DPDP compliance framework.
- **[deployment.md](./deployment.md)**: System deployment instructions and environment configuration reference.
