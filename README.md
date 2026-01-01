
# MMIS - Multi-Vendor Management Information System

MMIS is a next-generation Enterprise Resource Planning (ERP) and Logistics platform designed for regional multi-vendor commerce hubs. It bridges the gap between digital e-commerce and physical market infrastructure.

## 🚀 Key Modules

### 1. Hub Intelligence (Dashboard)
- **AI Market Trends**: Real-time insights powered by Google Gemini-3.
- **BI Visualizations**: Dynamic charts for revenue, vendor growth, and market concentration using Recharts.

### 2. Trade Registry (Vendors & Suppliers)
- **Vendor Management**: Comprehensive directory with status toggles, digital tokens (QR), and spatial allocation tracking.
- **Supplier Network**: Credentialed partner registry with Trust Index ratings and RFQ sync.
- **KYC Engine**: Multi-step Zod-validated identity verification for administrative roles and vendors.

### 3. Supply Chain & Logistics
- **The Weekly Bridge**: Aggregated demand logistics service for vendors to leverage bulk supplier pricing.
- **Inventory Control**: Real-time stock ledger with health monitoring and low-stock triggers.
- **Gate Management**: High-tactile security terminal for vehicle check-in/out and capacity visualization.
- **Stock Counter**: Manifest verification node with optical triangulation simulation.

### 4. Financial & Order Hub
- **Settlement Ledger**: Integrated payment gateway with multi-mode authorization.
- **Orders Management**: Advanced incoming/outgoing order tracking with status filtering and date-range logic.
- **Registry Billing**: Real-time rent and VAT tracking for hub operators.

### 5. Support & Incident Triage
- **Ticketing System**: Field incident reporting with visual evidence capture.
- **AI Diagnostic**: Gemini-powered automated triage for maintenance requests.
- **AI Assistant**: Conversational agent with Google Maps grounding for spatial queries.

## 🛠 Technical Stack

- **Framework**: React 19 (High Performance SPA Architecture)
- **Styling**: Tailwind CSS (Tactile & Responsive UI)
- **Icons**: Lucide React
- **Analytics**: Recharts
- **Validation**: Zod (High Integrity Schema Enforcement)
- **AI Engine**: Google GenAI SDK (Gemini-3-Flash, Gemini-3-Pro, Gemini-2.5-Flash with Maps Grounding)
- **Type Safety**: TypeScript Strict Mode

## 📂 Project Structure

```bash
├── App.tsx             # Main Routing & Application Controller
├── index.tsx           # Entry Point & Global Provider Context
├── types.ts            # High Integrity Interface Definitions
├── constants.ts        # Regional Registry Data & Configurations
├── components/
│   ├── auth/           # Operator Authentication & MFA
│   ├── onboarding/     # Guided Entry Sequences
│   ├── dashboard/      # Core Functional Modules (Inventory, Orders, etc.)
│   ├── ui/             # Atomic Design Reusable Components
│   └── payments/       # Integrated Settlement Gateway
```

## 🔐 Role-Based Access Control (RBAC)

1.  **SUPER_ADMIN**: Full system orchestration and global audit capability.
2.  **MARKET_ADMIN**: City-level hub management and KYC approval.
3.  **VENDOR**: Private store console, inventory control, and sales tracking.
4.  **SUPPLIER**: Bulk distribution and network showcase management.
5.  **COUNTER_STAFF**: Operational terminals (Gate & Stock Counter).
6.  **USER**: Platform discovery and standard purchase capabilities.

## 📦 Getting Started

1.  Clone the repository.
2.  Install dependencies: `npm install`.
3.  Configure Environment: Ensure `process.env.API_KEY` is set for Gemini AI integration.
4.  Launch Terminal: `npm run dev`.

---
© MMIS v2.5 Pre-Release • Optimized for TEVAS UG Logistics Infrastructure.
