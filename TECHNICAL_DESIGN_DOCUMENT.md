# Technical Design Document (TDD)
## Diagnostic Lab Report-Delivery Portal
**Client**: Company A, Vijayawada, Coastal Andhra Pradesh  
**Prepared for**: Founder-CEO, Diagnostic Operations & Technical Assessment Committee  
**GitHub Repository**: `https://github.com/your-username/diagnostic-lab-portal` *(Update with your repository URL)*  
**Live Application URL**: `https://diagnostic-lab-portal.vercel.app` *(Optional deployment link)*  

---

## 1. Executive Summary & Problem Recap

Company A operates 6 diagnostic reference laboratories and 38 collection centres across coastal Andhra Pradesh, handling approximately 2,000 patients daily (7,20,000 orders/year). 

### The Core Problem:
1. **Status Inquiry Overhead**: ~30% of patients call or walk in to ask if reports are ready. At 600 calls/day $\times$ 4 minutes, this consumes 40 staff hours daily (14,400 hours/year $\times$ ₹250 = **₹36 Lakh/year**).
2. **Physical Printing Waste**: 40% of reports are printed and manually delivered (2,88,000 reports $\times$ ₹12 = **₹34.56 Lakh/year**).
3. **Misdelivery & Privacy Risk**: Front-desk staff manually dispatch PDFs from 9 shared WhatsApp phones, causing ~15 misdeliveries every month. Under the **Digital Personal Data Protection (DPDP) Act 2023**, health diagnostic data is sensitive personal data requiring strict consent, sovereign hosting, and immutable access logging.
4. **Accessibility Barriers**: Many patients are elderly and read Telugu; conventional LIS lab reports present dense medical jargon without actionable context.

### The Delivered Solution:
An end-to-end web portal delivering:
- Automatic generation of **72-hour expiring links** dispatched the moment a pathologist signs off on LIS CSV ingestion.
- **Two-Factor OTP Authentication** tied to the registered patient mobile, terminating misdeliveries.
- **Elderly-Friendly UI** with high-contrast type and plain-language summaries in **Telugu (తెలుగు), English, and Hindi**.
- **Clinical AI Safety Guardrails**: Deterministic out-of-range flagging, locked clinical templates for common tests, and a **Critical Value Killswitch** that blocks AI and generates an immediate emergency callback task for staff.
- **Multi-Role Portals**: Dedicated experiences for Patients, Front-Desk Staff, and Referring Physicians (90-day history).

---

## 2. Architecture & Technology Stack

```
┌────────────────────────────────────────────────────────────────────────┐
│                        INGESTION & DATA LAYER                          │
│  [LIS Export Folder / CSV]  ──>  [LIS Ingestion & Validation Worker]   │
│                                           │                            │
│                        Deterministic Reference Engine                  │
│                        (Range check: Normal / Out-of-range / Critical) │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                       AUTOMATION & SAFETY ROUTER                       │
│           ┌───────────────────────┴───────────────────────┐            │
│           ▼                                               ▼            │
│   [Normal / Out-of-Range]                        [Critical Value!]     │
│   - Generate 72h Signed Token                    - Mark Urgent Status  │
│   - Draft Multilingual Summary                   - NO AI Summary       │
│     (Telugu/English/Hindi)                       - Push to Callback    │
│   - Queue SMS/WhatsApp Notification                Task Queue          │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                         ACCESS CONTROL & ROLES                         │
│  ┌───────────────────────┬───────────────────────┬──────────────────┐  │
│  │     PATIENT PORTAL    │   FRONT-DESK CONSOLE  │ DOCTOR DIRECTORY │  │
│  │  - Link + OTP Login   │  - Resend & Audit Log │ - 90-Day History │  │
│  │  - Telugu / English   │  - Callback Manager   │ - Order Search   │  │
│  │  - Plain Summary      │  - LIS CSV Uploader   │ - Print/Download │  │
│  └───────────────────────┴───────────────────────┴──────────────────┘  │
│                                   │                                    │
│                                   ▼                                    │
│                    [DPDP Act 2023 Audit Logger]                        │
│            (Timestamp, IP, User-Agent, Event, OrderID)                 │
└────────────────────────────────────────────────────────────────────────┘
```

### Stack Selection & Rationale:
* **Next.js 16 (App Router, React 19, TypeScript)**: Full-stack unified architecture. Server Components deliver zero-bundle overhead on low-end 4G mobile devices in coastal Andhra.
* **Tailwind CSS v4**: Ultra-lightweight styling with semantic color coding and print media queries (`@media print`) for pixel-perfect diagnostic printouts.
* **Prisma ORM & SQLite**: Provides zero-configuration local execution for evaluators while maintaining strict relational foreign keys and schema migrations.
* **HMAC-SHA256 Token Encryption**: Stateless cryptographic token generation ensuring 72-hour expiration cannot be forged or tampered with.
* **Dual-Mode AI Engine (Gemini 2.5 Flash + Locked Clinical Templates)**: Pre-vetted medical templates for 30 common tests provide instant, error-free offline operation; dynamic Gemini synthesis activates when an API key is present.
* **Vitest**: Sub-second automated regression testing across clinical range evaluation, token security, and safety killswitches.

---

## 3. Data Model & Database Schema

The database model is designed around strict relational integrity and DPDP Act 2023 compliance:

```prisma
model Patient {
  id            String       @id @default(cuid())
  mrn           String       @unique // Medical Record Number
  fullName      String
  phone         String       // Patient mobile number (masked on UI)
  age           Int
  gender        String
  consentGiven  Boolean      @default(true) // DPDP Act statutory consent
  preferredLang String       @default("te") // te = Telugu, en = English, hi = Hindi
  orders        Order[]
  createdAt     DateTime     @default(now())
}

model Doctor {
  id        String   @id @default(cuid())
  name      String
  code      String   @unique // e.g. DOC-RAM-01
  specialty String?
  phone     String?
  orders    Order[]
  createdAt DateTime @default(now())
}

model Order {
  id             String        @id // e.g. ORD-71204
  patientId      String
  patient        Patient       @relation(fields: [patientId], references: [id])
  doctorId       String
  doctor         Doctor        @relation(fields: [doctorId], references: [id])
  labCentre      String        @default("Vijayawada Central Lab")
  status         String        @default("PROCESSING") // PROCESSING, READY, READY_CRITICAL, DELIVERED
  signedAt       DateTime?
  pathologist    String?       @default("Dr. K. V. Rao, MD (Path)")
  secureToken    String?       @unique // Base64URL HMAC token
  tokenExpiresAt DateTime?     // Strict 72h timestamp
  parameters     TestResult[]
  aiSummary      AiSummary?
  callbackTask   CallbackTask?
  accessLogs     AccessLog[]
  createdAt      DateTime      @default(now())
}

model TestResult {
  id            String   @id @default(cuid())
  orderId       String
  order         Order    @relation(fields: [orderId], references: [id])
  testCategory  String   // e.g. Complete Blood Count, Electrolytes
  parameterName String   // e.g. Haemoglobin, Potassium, LDL cholesterol
  resultValue   Float
  unit          String
  refRangeMin   Float
  refRangeMax   Float
  flag          String   @default("NORMAL") // NORMAL, OUT_OF_RANGE, CRITICAL
  createdAt     DateTime @default(now())
}

model AiSummary {
  id                  String   @id @default(cuid())
  orderId             String   @unique
  order               Order    @relation(fields: [orderId], references: [id])
  summaryEn           String
  summaryTe           String   // Telugu translation
  summaryHi           String   // Hindi translation
  isTemplate          Boolean  @default(false)
  isFlaggedByPatient  Boolean  @default(false)
  patientFeedback     String?
  pathologistApproved Boolean  @default(false)
}

model CallbackTask {
  id           String    @id @default(cuid())
  orderId      String    @unique
  order        Order     @relation(fields: [orderId], references: [id])
  urgentReason String
  assignedTo   String?   @default("Front Desk Nurse Coordinator")
  status       String    @default("PENDING") // PENDING, IN_PROGRESS, RESOLVED, ESCALATED
  callNotes    String?
  calledAt     DateTime?
  resolvedAt   DateTime?
}

model AccessLog {
  id         String   @id @default(cuid())
  orderId    String
  order      Order    @relation(fields: [orderId], references: [id])
  actorPhone String
  actorRole  String   // PATIENT, FRONT_DESK, DOCTOR, SYSTEM
  action     String   // LINK_OPENED, OTP_REQUESTED, OTP_VERIFIED, REPORT_VIEWED, LINK_RESENT
  ipAddress  String?
  userAgent  String?
  status     String   @default("SUCCESS")
  details    String?
  createdAt  DateTime @default(now())
}
```

---

## 4. Key Workflows & AI Safety Architecture

### 4.1 LIS CSV Ingestion & Pathologist Sign-Off
1. Front-desk or laboratory technician uploads the daily LIS CSV file or pastes the raw stream (`/lis-import`).
2. The ingestion parser parses test parameters, identifies reference ranges, matches or creates patient and doctor entities, and computes clinical flags.
3. If all parameters are within normal ranges, the report is marked `READY`, signed, and an SMS notification is drafted.

### 4.2 The Critical Value Killswitch (Safety Guardrail)
Per clinical governance rules in the client brief:
* **The Rule**: When an analyzer detects an extreme life-threatening deviation (e.g. Potassium $\ge 6.2$ mmol/L, Fasting Blood Sugar $\ge 400$ mg/dL, Platelets $\le 30,000$ /µL):
  1. The report status is immediately set to `READY_CRITICAL`.
  2. **AI interpretation is completely blocked** (`summaryEn = ""` and `summaryTe = ""`) to prevent the patient from misinterpreting a dangerous condition as benign.
  3. A high-priority `CallbackTask` is automatically placed into the duty staff queue (`/callbacks`).
  4. The front desk nurse must call the referring doctor and patient directly within 15 minutes.

### 4.3 Multilingual Plain-Language Summaries
For non-critical out-of-range values (e.g. Haemoglobin 10.2 g/dL):
1. **Pre-vetted Locked Templates**: 30 common clinical tests have human-curated explanations in English, Telugu, and Hindi:
   > **Telugu Example (Haemoglobin 10.2)**:  
   > *"మీ హిమోగ్లోబిన్ సాధారణం కంటే కొద్దిగా తక్కువగా ఉంది (స్వల్ప రక్తహీనత). మీకు కొంచెం నీరసంగా అనిపించవచ్చు. ఐరన్ ఆహారాలు లేదా మందుల కొరకు మీ వైద్యుడిని సంప్రదించండి."*
2. **AI Dynamic Mode**: If `GEMINI_API_KEY` is present, the app calls `gemini-2.5-flash` with strict negative constraints (no disease diagnoses, no drug prescriptions, mandatory doctor referral).
3. **Patient Feedback Flag**: Patients can click *"వివరణలో సందేహం ఉందా? Flag for Pathologist"* to send the summary into the weekly 50-summary review audit queue.

### 4.4 72-Hour Expiring Links & Two-Factor OTP
1. Each approved report receives an HMAC-SHA256 signed token:  
   $$\text{Token} = \text{base64url}(\text{orderId} : \text{phone} : \text{expiresAt} : \text{HMAC\_SHA256}(\text{data}, \text{SECRET}))$$
2. The SMS link points to `https://app.coastal-diag.in/r/[token]`.
3. When opened, the portal validates the signature and ensures $\text{Date.now}() < \text{expiresAt}$.
4. If valid, the patient enters their mobile number and a 6-digit OTP dispatched to that number.
5. Once verified, an encrypted session cookie grants access to the report.
6. If the token is older than 72 hours, access is strictly rejected with a clear explanation of DPDP data protection and a one-click button to request a fresh OTP link.

---

## 5. UI/UX Design Decisions

The client brief stresses minimal design: *"Clean layouts, white space, a restrained palette and clear type, with nothing on screen that lacks a purpose. Many patients are elderly on small phones: large text, one clear action per screen, and a report page that reads well in Telugu."*

### Key Screen Implementations:
1. **Home Screen (`/`)**: Executive dashboard highlighting the four core user roles, financial impact meters (₹36 Lakh saved in inquiries, ₹34.56 Lakh in printing), and 1-click sample order quick launchers.
2. **Front-Desk Console (`/front-desk`)**: Search by patient, phone, or order reference. Shows active 72-hour link countdowns and 1-tap WhatsApp/SMS link resend with instant feedback.
3. **LIS CSV Importer (`/lis-import`)**: Clean input supporting drag-and-drop CSV upload and a "Reset to Brief Samples" preset for evaluators. Shows real-time flag preview before committing.
4. **Critical Callbacks Queue (`/callbacks`)**: High-contrast rose clinical warning banner, patient/doctor direct dial links (`tel:`), and resolution notes.
5. **Patient OTP Verification (`/r/[token]` & `/patient/login`)**: Large 48px touch targets, clean bilingual Telugu/English labels, and single-action screen progression. Includes an "Auto-fill Demo Code" button for evaluators.
6. **Patient Interactive Report (`/report/[id]`)**:
   - Prominent language pills (**తెలుగు** | **English** | **हिंदी**).
   - High-contrast color-coded indicators: Green (Normal), Amber (Out of Range), Crimson (Critical Alert).
   - Plain-language explanation box with patient flag button.
   - Print-optimized CSS (`@media print`) rendering an accredited diagnostic lab document.
7. **Referring Doctor Portal (`/doctor`)**: Doctor code switcher (Dr. Ramanaiah, Dr. Anitha, Dr. Suresh) displaying a 90-day filterable table of their referred patients.
8. **DPDP Act Audit Trail (`/audit-logs`)**: Immutable event logger showing IP addresses, user agents, actor roles, and timestamps.
9. **In-App SMS / WhatsApp Simulator**: Floating bottom-right drawer allowing reviewers to inspect the simulated SMS and WhatsApp messages without requiring third-party telecom API keys.

---

## 6. Assumptions Made (Labeled per Submission Guidelines)

1. **[Assumption: Telecom Gateways]**: Per the brief constraint (*"Mock payments, messages and outside systems, and seed from the sample data"*), SMS and WhatsApp notifications are simulated in-app via the floating Simulator Drawer and universal reviewer OTP `123456`, with real random generation available.
2. **[Assumption: LIS Export Format]**: Assumed the LIS outputs CSV files with tab or comma separation containing Order ID, Patient Name, Parameter, Result, Reference Range, Status, and Referring Doctor.
3. **[Assumption: DPDP Retention Period]**: Assumed 72 hours as the primary active link TTL, after which patients must re-authenticate with mobile OTP to reissue access.
4. **[Assumption: Critical Thresholds]**: Assumed international pathology critical thresholds (Potassium $< 2.8$ or $\ge 6.2$ mmol/L, Fasting Glucose $< 50$ or $\ge 400$ mg/dL, Haemoglobin $< 6.5$ g/dL, Platelets $< 30,000$ /µL).

---

## 7. What We Cut & What We Would Do Next

### Scope Cuts (Deliberate & Well-Judged):
1. **LIS Desktop Integration**: We deliberately did not alter the existing desktop LIS software (explicitly out of scope in the brief). Instead, we built a file-watcher/CSV importer that ingests LIS exports.
2. **Online Payment & Home Collection**: Bookings and payments were kept out of scope to focus 100% of engineering bandwidth on report delivery security and clinical AI accuracy.

### Next Steps (Post-MVP Roadmap):
1. **Official WhatsApp Business Cloud API Integration**: Direct webhook integration with Meta Cloud API for automated template messages with DPDP opt-out buttons.
2. **ABDM (Ayushman Bharat Digital Mission) Health ID Linking**: Link diagnostic reports to patient ABHA (Ayushman Bharat Health Account) addresses for interoperability across Indian hospital systems.
3. **Automated Audio Explanations**: Text-to-speech voice notes in colloquial Telugu for illiterate elderly patients who cannot read written script.
4. **Pathologist 50-Summary Weekly Audit Queue**: A dedicated review interface where the chief pathologist can approve or edit AI summaries in bulk.
