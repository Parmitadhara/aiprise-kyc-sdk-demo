# Config-Driven KYC Onboarding Flow Demo

A mobile-first, embeddable KYC (Know Your Customer) onboarding prototype built with **React**, **TypeScript**, **Vite**, and **Tailwind CSS**. Designed to model real-world identity verification SDK constraints: dynamic configuration, iOS Safari WebRTC compatibility, graceful hardware permission recovery, and low-bandwidth 3G resilience.

---

## Key Engineering Highlights

### 1. Configuration-Driven Architecture
* **Dynamic Step Orchestration:** Verification steps (Consent, Document Selection, Front/Back ID Capture, Selfie Liveness, Review) are driven by declarative configuration rather than hardcoded routes.
* **White-Label Theming & `i18n`:** Supports runtime theme customization and localized copy dictionaries to simulate multi-tenant SDK embedding.

### 2. Resilient Browser Camera Lifecycle (`getUserMedia`)
* **iOS Safari Compatibility:** Handles `playsInline` and `muted` video attributes alongside clean track teardown (`track.stop()`) to prevent camera hardware locks between steps.
* **Lens Switching:** Seamlessly toggles between rear (`environment`) capture for government IDs and mirrored front (`user`) capture for selfie checks.
* **Permission & Hardware State Machine:** Explicitly handles `NotAllowedError` (denied permissions), `NotFoundError` (missing camera), and desktop environments with an automatic native file-upload fallback.

### 3. Throttled 3G & Low-Bandwidth Optimization
* **Client-Side Canvas Downscaling:** Resizes and compresses multi-megabyte raw mobile camera captures via offscreen HTML5 `<canvas>` before transmission, reducing payload sizes by up to 90% without degrading OCR clarity.
* **Lightweight Bundle:** Built with zero heavy UI component frameworks to ensure fast First Contentful Paint (FCP) on slow mobile connections.

### 4. Funnel & Drop-Off Analytics Drawer
* Tracks per-step completion, retry counts, capture method (`WEBRTC_STREAM` vs. `NATIVE_FALLBACK`), and payload compression metrics in real time.

---

## Tech Stack
* **Framework:** React 18 + TypeScript
* **Build Tool:** Vite
* **Styling:** Tailwind CSS
* **APIs:** MediaDevices (`getUserMedia`), HTML5 Canvas API, Network Information API
* **Deployment:** Vercel

---

## Running Locally

```bash
# Clone the repository
git clone [https://github.com/Parmitadhara/kyc-onboarding-demo.git](https://github.com/Parmitadhara/kyc-onboarding-demo.git)
cd kyc-onboarding-demo

# Install dependencies
npm install

# Start development server
npm run dev

```
# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend enabling type-aware lint rules by installing `oxlint-tsgolint` and editing `.oxlintrc.json`:
```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["react", "typescript", "oxc"],
  "options": {
    "typeAware": true
  },
  "rules": {
    "react/rules-of-hooks": "error",
    "react/only-export-components": ["warn", { "allowConstantExport": true }]
  }
}
```See the [Oxlint rules documentation](https://oxc.rs/docs/guide/usage/linter/rules) for the full list of rules and categories.
