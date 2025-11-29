# Agentic Document Verifier

AI-assisted passport and travel document verification workflow built with Next.js, Tailwind CSS, and TypeScript. Upload scanned images of passports, visas, national ID cards, or driving licences and receive:

- OCR + MRZ extraction for structured fields (names, dates, document numbers, issuing country, etc.)
- Automated validation checks (format compliance, MRZ checksum, expiry/age rules, policy alignment)
- Visa eligibility assessment based on configurable policy inputs
- Human-friendly summary plus machine-consumable JSON output

## Getting Started

```bash
cd app
npm install
npm run dev
```

Open `http://localhost:3000` in your browser and upload sample document images to see the verifier in action.

## Key Commands

- `npm run dev` – start the local development server
- `npm run lint` – run ESLint with the project configuration
- `npm run build` – create an optimized production build
- `npm run start` – serve the production build

## Architecture

- **Frontend** (`app/src/app/page.tsx`): Applicant & policy forms, drag-and-drop document uploader, live status panels, and JSON response viewer.
- **API Route** (`app/src/app/api/verify/route.ts`): Handles multipart uploads, normalizes payloads, and invokes the verification pipeline.
- **Verification Engine** (`app/src/lib/document.ts`): Tesseract OCR, MRZ parsing (`mrz` package), heuristics for field extraction, validation rules, and eligibility decisioning.
- **Shared Types** (`app/src/types/index.ts`): Strongly typed contract for UI ↔ API responses.

## Eligibility Policy

Adjust the live policy from the UI to control:

- Minimum passport validity window after travel
- Minimum applicant age
- Supported visa types
- Blacklisted nationalities
- Strict/relaxed matching for names and passport numbers

## Deployment

The project is ready for Vercel deployment:

```bash
cd app
npm run build
vercel deploy --prod --yes --token $VERCEL_TOKEN --name agentic-eed78bce
```

## Notes

- OCR accuracy depends on image quality; ensure MRZ lines are sharp and well-lit.
- Barcode parsing is stubbed with placeholder data (extendable if 1D/2D decoding is required).
- Adjust `FALLBACK_POLICY` in `route.ts` for safe defaults in the absence of UI-provided policies.

Happy verifying!
