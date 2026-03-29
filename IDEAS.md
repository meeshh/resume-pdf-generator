# ResuMint: Feature Roadmap & Ideas

## 🎨 Visual Form Editor (Priority)
- **Goal:** Provide a user-friendly interface for non-technical users to edit their resume without touching JSON.
- **Tech:** TanStack Form (`@tanstack/react-form`).
- **Features:** 
    - Real-time sync between Form and JSON Editor.
    - Field validation (email, phone, etc.).
    - Dynamic arrays for adding/removing experiences and skills.

## 🤖 AI Job-Tailoring
- **Goal:** Automatically optimize the resume for a specific job.
- **Features:**
    - Input field for Job Descriptions.
    - AI-driven summary rewriting.
    - Keyword highlighting and gap analysis.

## 💾 Local Persistence
- **Goal:** Prevent data loss during browser sessions.
- **Features:**
    - Auto-save to `localStorage`.
    - "Last saved" timestamp indicator.
    - Clear data / Reset to default option.

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
