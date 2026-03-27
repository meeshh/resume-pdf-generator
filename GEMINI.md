# Resume JSON-to-PDF Engine: Agent Context

This is a standalone Vite + React application for generating professional resumes in multiple formats (Visual PDF, ATS-Friendly PDF, and MS Word) from a single JSON source.

## 🛠 Tech Stack
- **Framework:** Vite + React 19 (TypeScript)
- **Styling:** Tailwind CSS v4 (Zero-config, `@import "tailwindcss"` in `index.css`)
- **PDF Engine:** `@react-pdf/renderer` + `react-pdf-html`
- **Word Engine:** `docx` + `file-saver`
- **Icons:** `lucide-react`
- **Editor:** `@monaco-editor/react` for JSON syntax highlighting
- **Tooling:** Biome (Linting & Formatting), Yarn 4 (node-modules linker)

## 🏗 Key Architecture
- **Schema:** `src/types/ResumeData.ts` defines the source of truth. Always use `import type { ResumeData }` to avoid bundler issues.
- **Rendering Engines:**
  - `src/components/PDF/PDF.tsx`: The high-fidelity visual layout.
  - `src/components/PDF/ATSPDF.tsx`: Single-column, text-heavy layout for AI screening.
  - `src/utils/wordGenerator.ts`: Generates `.docx` files mirroring the ATS layout.
- **State:** `src/App.tsx` manages the JSON editor and live preview using `useDeferredValue` to prevent PDF engine lag.

## 📋 Engineering Standards & Quirks
- **Header Spacing:** Ensure a minimum gap of `10pt` (via `marginTop` or `marginBottom`) between the candidate's name and their professional title to prevent visual overlap.
- **Numeric Radius:** In PDF components, `borderRadius` MUST be a number (e.g., `25`), not a percentage string (`50%`), or the engine will crash.
- **Defensive Rendering:** Components should gracefully handle missing data arrays (e.g., `certifications || []`) to prevent blank pages during JSON editing.
- **Localisation:** Use the `labels` object in `ResumeData` for all section titles to support multi-language resumes.
- **HTML in JSON:** Summary and Experience body fields support basic HTML tags (via `react-pdf-html`).
- **Tooling:** Use `yarn lint` for Biome checks and `yarn format` for formatting.

## 🚀 Development
- Start: `yarn dev`
- Target: `http://localhost:5173`
