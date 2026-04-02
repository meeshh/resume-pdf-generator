# ResuMint: Feature Roadmap & Ideas

## ✅ Visual Form Editor (Completed)
- **Goal:** Provide a user-friendly interface for non-technical users to edit their resume without touching JSON.
- **Tech:** TanStack Form (`@tanstack/react-form`).

## ✅ AI Job-Tailoring (Completed)
- **Goal:** Automatically optimize the resume for a specific job or from raw text.
- **Features:**
    - Optional direct API integration (OpenAI/Gemini).
    - Prompt generator for manual use.

## ✅ Local Persistence & Versions (Completed)
- **Goal:** Prevent data loss and manage multiple resumes.
- **Features:**
    - Multi-version storage in IndexedDB.
    - Save/Load/Rename/Delete resume versions.

## ✅ Undo/Redo System (Completed)
- **Goal:** Safety net for edits.
- **Features:**
    - Full state history with 50-step limit.
    - Keyboard shortcuts (Ctrl+Z / Ctrl+Y).

## 📏 Layout & Typography Controls
- **Goal:** Fine-tune the visual output without editing code.
- **Features:**
    - Sliders for margins and line heights.
    - Font family selectors (Serif vs Sans-Serif).
    - Page break markers to prevent awkward section splitting.

## 🔄 Dynamic Section Reordering
- **Goal:** Flexible layout organization.
- **Features:**
    - Drag-and-drop UI to swap sections (e.g., Education above Experience).
    - Toggle visibility for specific sections (e.g., hide Certifications if empty).

## 📄 Multi-Page Management
- **Goal:** Better handling of longer resumes.
- **Features:**
    - Page number indicators.
    - Header/Footer repetition on subsequent pages.
