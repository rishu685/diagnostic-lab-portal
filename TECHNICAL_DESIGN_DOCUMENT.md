# Technical Design Document (TDD)
## Diagnostic Lab Report-Delivery Portal
**GitHub Repository**: `https://github.com/[YOUR-USERNAME]/diagnostic-lab-portal`  
**Live Demo App**: `https://diagnostic-lab-portal.vercel.app` (or `http://localhost:3000`)  
**Client**: Company A, Vijayawada, Coastal Andhra Pradesh  
**Prepared by**: Rishabh  
**Target Roles**: Patients, Front-Desk Staff, Referring Physicians, and Lab Technicians  

---

## 1. Problem Overview & Requirements

Company A operates 6 diagnostic reference laboratories and 38 collection centres across coastal Andhra Pradesh, handling ~2,000 patients daily.

### Current Operational Bottlenecks:
1. **High Call Overhead**: ~30% of patients call or visit in person just to ask if their test results are ready, tying up staff time.
2. **Physical Printing Costs**: 40% of reports are printed on paper, incurring avoidable printing and logistics expenses.
3. **Misdelivery & Privacy Risk**: Front-desk staff manually dispatch PDFs over shared WhatsApp phones, occasionally leading to misdeliveries. Under India's **DPDP Act 2023**, medical reports require verified consent, secure transmission, and access logging.
4. **Accessibility & Language Barriers**: Many patients are elderly and read Telugu. Standard lab printouts contain dense technical jargon that causes unnecessary confusion and anxiety.

### Delivered Solution:
An end-to-end, lightweight web portal providing:
- **72-hour expiring links** dispatched automatically after pathologist sign-off.
- **Two-Factor Mobile OTP Authentication** to ensure only the intended patient accesses the report.
- **Plain-language summaries in Telugu, English, and Hindi** alongside standard clinical values.
- **Deterministic clinical range checks with a Critical Value Killswitch**: when life-threatening values are detected, automated AI interpretations are suppressed, and an urgent phone callback task is assigned to duty staff.
- **Dedicated operational dashboards**: Front-Desk console (link status & 1-tap resend), Referring Doctors portal (90-day archive), and Emergency Callback queue.

---

## 2. System Architecture & Tech Stack

```
┌────────────────────────────────────────────────────────────────────────┐
│                        INGESTION & DATA LAYER                          │
│  [LIS CSV Export]  ──>  [Ingestion Parser & Validation Engine]         │
│                                           │                            │
│                        Deterministic Reference Engine                  │
│                        (Normal / Out-of-Range / Critical)              │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                       AUTOMATION & SAFETY ROUTER                       │
│           ┌───────────────────────┴───────────────────────┐            │
│           ▼                                               ▼            │
│   [Normal / Out-of-Range]                        [Critical Value!]     │
│   - Generate 72h Signed Token                    - Mark URGENT Status  │
│   - Plain-Language Summary                       - Suppress AI Summary │
│     (Telugu / English / Hindi)                   - Queue Emergency     │
│   - Draft SMS / WhatsApp Link                      Staff Callback Task │
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

### Technology Choices & Rationale:
* **Next.js (App Router, React, TypeScript)**: Single unified codebase for both backend APIs and front-end UI. Server-side rendering ensures fast page loads on 4G mobile connections.
* **Tailwind CSS**: Utility-first styling with high visual contrast and print stylesheets (`@media print`) for clean physical copies.
* **Prisma ORM & SQLite**: Zero-configuration, file-based database for simple local evaluation that maintains strict relational integrity.
* **HMAC-SHA256 Token Signing**: Stateless 72-hour tokens that cannot be forged or tampered with.
* **Dual-Mode Clinical Explanations**:
  - **Locked Medical Templates**: Pre-curated explanations for 30 common tests across Telugu, English, and Hindi. Fast, deterministic, and free of hallucination risks.
  - **Optional Gemini API**: Dynamically synthesizes explanations if an API key is provided, bound by safety rules (no prescribing medications, no direct diagnoses).
* **Vitest**: Automated test suite for clinical range evaluation, token expiration, and safety killswitch logic.

---

## 3. Database Schema

The database model is built around patient privacy and clinical governance:

* **Patient**: Medical Record Number (MRN), full name, masked phone, age, gender, preferred language (`te`, `en`, `hi`), and statutory DPDP consent flag.
* **Doctor**: Doctor code (e.g. `DOC-RAM-01`), full name, specialty, and contact phone.
* **Order**: Unique order ID (e.g. `ORD-71204`), patient/doctor relations, lab centre, status (`PROCESSING`, `READY`, `READY_CRITICAL`, `DELIVERED`), pathologist sign-off timestamp, HMAC secure token, and 72h expiration timestamp.
* **TestResult**: Parameter name, numerical result, unit, reference range (min/max), and calculated flag (`NORMAL`, `OUT_OF_RANGE`, `CRITICAL`).
* **AiSummary**: Multilingual explanations (English, Telugu, Hindi), template indicator, patient flag status, and pathologist approval status.
* **CallbackTask**: High-priority tasks automatically generated for critical values, tracking assignment, clinical reason, call notes, and resolution status (`PENDING`, `IN_PROGRESS`, `RESOLVED`).
* **AccessLog**: Immutable audit records tracking IP address, user agent, actor role, timestamp, and action (link open, OTP request, report view, resend).

---

## 4. Key Workflows & Clinical Safety Rules

### 4.1 LIS CSV Ingestion & Sign-Off
1. Lab operators upload or paste the daily LIS CSV export (`/lis-import`).
2. The ingestion parser matches test results against reference ranges, associates the record with the patient and referring doctor, and computes flags.
3. If all parameters are within safe ranges, the order status is set to `READY`, a signed 72h token is generated, and a notification link is drafted.

### 4.2 Critical Value Killswitch (Safety Guardrail)
* When an analyzer detects a life-threatening abnormal value (e.g. Potassium $\ge 6.2$ mmol/L, Fasting Glucose $\ge 400$ mg/dL, Platelets $\le 30,000$ /µL):
  1. The report status is marked **`READY_CRITICAL`**.
  2. **Automated AI interpretation is strictly suppressed** to prevent misleading or falsely reassuring the patient.
  3. A high-priority **`CallbackTask`** is automatically queued in the staff dashboard (`/callbacks`).
  4. The front-desk duty coordinator must call both the patient and the referring doctor directly.

### 4.3 Multilingual Plain-Language Summaries
* For standard out-of-range values (e.g. Haemoglobin 10.2 g/dL):
  - Pre-vetted clinical templates provide clear, empathetic context:
    > **Telugu**: *"మీ హిమోగ్లోబిన్ సాధారణం కంటే కొద్దిగా తక్కువగా ఉంది (స్వల్ప రక్తహీనత). ఆహారంలో మార్పులు లేదా ఐరన్ సప్లిమెంట్ల కొరకు మీ వైద్యుడిని సంప్రదించండి."*
  - Patients can click *"Flag for Pathologist"* if any summary is confusing, routing it to the weekly audit queue.

### 4.4 72-Hour Expiring Links & Two-Factor OTP
1. The secure link (`/r/[token]`) contains a base64url-encoded payload signed with HMAC-SHA256: `orderId:phone:expiresAt:signature`.
2. When the link is opened, the system checks whether `Date.now() < expiresAt`.
3. If expired, access is blocked, and the patient is prompted to request a fresh OTP link.
4. If valid, the patient enters their registered phone number and a 6-digit OTP (universal demo code: `123456`).
5. Upon successful verification, an HTTP-only session cookie is issued for authorized report viewing.

---

## 5. UI/UX Design Decisions

The design focuses strictly on **clarity, accessibility, and speed**, especially for elderly patients using budget Android devices on 4G networks:

1. **Elderly-Friendly Accessibility**:
   - **Large Touch Targets**: Minimum 48px tap targets on all buttons and inputs to prevent missed taps.
   - **High-Contrast Visual Cues**: Clear badges for test results—Green (Normal), Amber (Out of Range), and Red (Critical Alert)—so status is immediately obvious without reading dense tables.
   - **One Main Action per Screen**: Clean step-by-step flow (Phone entry $\to$ OTP verification $\to$ Report view) to minimize cognitive load.
2. **First-Class Telugu Localization**:
   - Natural phrasing in Telugu vernacular (`మీ ల్యాబ్ రిపోర్ట్ / సులభమైన వివరణ`), with 1-tap switching between Telugu, English, and Hindi.
3. **Operational Dashboards for Staff**:
   - **Front-Desk Console (`/front-desk`)**: Search by patient name or phone, view live 72-hour countdowns, and resend links with a single click.
   - **Critical Callback Manager (`/callbacks`)**: Urgent alert banner, direct `tel:` phone call buttons, and status updating.
   - **Referring Doctor Archive (`/doctor`)**: 90-day chronological history grouped by referring doctor code.
4. **Print Optimization**:
   - Clean `@media print` CSS so clicking "Print Report" produces a clean, accredited diagnostic sheet without navigation bars or buttons.
5. **In-App Notification Simulator**:
   - A discreet floating simulator drawer allows evaluators to view mock SMS and WhatsApp link dispatches and test codes without requiring paid telecom credentials.

---

## 6. Assumptions Made

1. **[Assumption: Telecom Gateways]**: Per brief instructions, external SMS and WhatsApp gateways are mocked in-app. Evaluators can use the simulated drawer or enter `123456` as the demo OTP.
2. **[Assumption: LIS Data Feed]**: The laboratory information system exports tabular CSV data with standard headers (Order ID, Patient Name, Parameter, Result, Reference Range, Status, Doctor).
3. **[Assumption: Link Validity]**: 72 hours was chosen as the default TTL for active token links to balance patient convenience with DPDP privacy guidelines. Patients can re-verify after expiration.
4. **[Assumption: Critical Ranges]**: Critical alert thresholds follow standard clinical pathology guidelines (e.g. Potassium $< 2.8$ or $\ge 6.2$ mmol/L, Platelets $< 30,000$ /µL).

---

## 7. Scope Boundaries & Next Steps

### Deliberate Scope Exclusions:
1. **Direct LIS Database Modification**: The existing desktop LIS remains untouched as specified in the brief. Integration is handled non-invasively via CSV exports.
2. **Billing & Online Payments**: Kept out of scope to focus entirely on report delivery speed, patient safety, and DPDP compliance.

### Recommended Next Steps:
1. **WhatsApp Business API**: Connect official WhatsApp Cloud API for automated dispatch of approved templates.
2. **ABDM / ABHA Integration**: Link reports to Ayushman Bharat Health Accounts for national health record interoperability.
3. **Voice Explanations**: Add audio playback of Telugu summaries for illiterate or visually impaired patients.
