# AGENTS.md

## Product Vision

DigiPET is a desktop security application built with Tauri (Rust backend + React UI).

The UI must feel:
- Premium
- Minimal
- Fast
- Enterprise-grade
- Demo-friendly
- Inspired by Chrome / VS Code

Focus on clarity, trust, and usability. Avoid visual noise.

---

## UI Direction

Design style:

- Clean, compact, and highly readable
- More visual than textual
- Minimal surfaces, fewer containers
- Subtle depth (light shadows, not heavy)
- Moderate border radius (not too rounded, not square)
- Strong contrast between layers
- Dark mode first, with support for light and system

Accent color:
- Dark cyan (VS Code style)
- No neon, no gradients, no glow effects

---

## Layout Rules

### Sidebar

- Fixed to the left (no floating card look)
- Collapsible:
  - Expanded → icon + label
  - Collapsed → icons only
- Compact and dense
- Remove completely:

  "Controles activos"

### Topbar

- Keep minimal
- Search:
  - Initially icon only
  - Expands into input on click
- Theme selector must NOT be here → move to Settings

---

## Design Principles

- Reduce unnecessary containers
- Prefer large layout sections instead of many nested cards
- Avoid "card inside card" patterns
- Replace long text with:
  - icons
  - tooltips
  - badges
- Use consistent spacing system
- Keep typography hierarchy clear

---

## Interaction Rules

- Fast, subtle, responsive UI
- No heavy animations
- Use transform/opacity only for motion
- Respect reduced motion

---

## Forms & Settings

- Compact inputs
- Inline validation
- Accessible labels and focus states

### Critical rule:

ALL SETTINGS ARE AUTO-SAVED

- No "Save" button
- No "Changes saved" toast
- No confirmation messages
- Every change persists immediately

Includes:
- Theme
- Language
- Security settings
- Preferences

---

## Internationalization

- Add language selector in Settings
- Persist selection automatically
- Prepare integration with Google Translate API

Rules:
- Do NOT expose API keys in frontend
- Use backend (Tauri/Rust) as proxy
- Cache translations when possible
- Avoid translating on every render

---

## Security Architecture (STRICT)

Frontend MUST NOT implement real security logic.

All sensitive operations must live in Rust/Tauri:

- Encryption / decryption
- Vault management
- PIN / password verification
- Key derivation (Argon2id)
- File integrity
- Audit logs

Frontend responsibilities:
- Display state
- Trigger secure backend commands

---

## Security Features (Product Behavior)

DigiPET should behave as a real file protection system:

- Encrypt files and folders
- Lock / unlock / hide / restore
- Integrity verification
- Activity history per asset
- Bulk operations
- Clear and actionable empty states

Encryption standards:
- Argon2id (key derivation)
- AES-256-GCM or XChaCha20-Poly1305
- Minimal plaintext metadata
- Optional obfuscation

---

## Authentication / 2FA

Design modular support for:

- Password
- PIN
- Passkeys (if feasible)
- Local biometrics (OS-supported)
- Face (future-ready)
- Telegram 2FA (optional)

Rules:
- No hardcoded secrets
- Telegram must require secure setup via Settings
- Backend handles verification

---

## Audit & Device Info

Display real session activity:

- IP (local/public when available)
- Hostname
- OS
- Device type icon (PC/laptop)
- Timestamp
- Method used (PIN, password, biometric, etc.)
- Status (success, fail, locked)
- Optional approximate location (privacy-safe)

---

## Additional Features

### Terminal

Add a sidebar section:

- Terminal view (integrated)
- Safe execution model
- If not fully implemented → create UI + secure stub

---

## Visual Fixes Required

- Reduce excessive nesting
- Improve contrast between cards and background
- Simplify dashboard
- Remove placeholder-looking sections
- Make empty states useful and visual
- Improve asset management UX

---

## Skills Usage

Always apply:

- baseline-ui
- fixing-accessibility
- fixing-metadata

If available:

- interface-design
- interaction-design
- fixing-motion-performance

---

## Before Finishing

- Review UI consistency
- Fix accessibility issues
- Validate metadata (if applicable)
- Run:
  - lint
  - typecheck
  - build/tests (if available)

---

## Golden Rules

- Keep it simple
- Keep it fast
- Keep it clean
- Keep it secure
- Do not fake security in UI
- Do not add unnecessary features
- Everything should feel intentional