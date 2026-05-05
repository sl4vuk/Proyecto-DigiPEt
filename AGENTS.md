# AGENTS.md

## Product Vision

DigiPET is a desktop security application built with Tauri 2, Rust, React and TypeScript.

The product must feel:
- Premium
- Minimal
- Fast
- Enterprise-grade
- Demo-friendly
- Inspired by Chrome / VS Code

Focus on clarity, trust, speed and usability. Avoid visual noise.

---

## Current Project Structure

Agents must respect the current repository structure:

```text
Proyecto DigiPEt
├── .agent/                  # Local agent configuration
├── .agents/                 # Additional agent/tool configuration
├── .codex/                  # Codex-related configuration
├── dist/                    # Generated frontend build
├── logs/                    # Local project logs
├── public/                  # Public static assets
├── scripts/                 # Auxiliary automation scripts
├── src/                     # React + TypeScript frontend
├── src-tauri/               # Tauri/Rust backend
├── digipet.py               # Main project control script
├── package.json             # Node/Tauri scripts and dependencies
├── vite.config.ts           # Vite configuration
├── Dockerfile               # Optional Docker image
└── docker-compose.yml       # Optional Docker orchestration
```

### Important rules

- Keep the root clean.
- `digipet.py` is the main project script.
- New helper scripts must go in `scripts/`.
- Frontend changes go in `src/`.
- Sensitive or security-related logic goes in `src-tauri/`.
- Do not move generated folders such as `dist/`, `logs/` or `node_modules/` into documentation examples as source code.

---

## UI Direction

Design style:

- Clean, compact and highly readable
- More visual than textual
- Minimal surfaces and fewer containers
- Subtle depth, with light shadows only
- Moderate border radius
- Strong contrast between layers
- Dark mode first, with support for light and system

Accent color:
- Dark cyan, VS Code style
- No neon
- No gradients
- No glow effects

---

## Layout Rules

### Sidebar

- Fixed to the left, not floating.
- Collapsible:
  - Expanded: icon + label
  - Collapsed: icons only
- Compact and dense.
- Remove completely:
  - `Controles activos`

### Topbar

- Keep it minimal.
- Search starts as icon only and expands into an input on click.
- Theme selector must not be in the topbar; move it to Settings.

---

## Design Principles

- Reduce unnecessary containers.
- Prefer large layout sections instead of many nested cards.
- Avoid card-inside-card patterns.
- Replace long text with icons, tooltips and badges.
- Use a consistent spacing system.
- Keep typography hierarchy clear.
- Empty states must be useful, visual and actionable.

---

## Interaction Rules

- Interactions must feel fast, subtle and responsive.
- Avoid heavy animations.
- Use transform and opacity only for motion.
- Respect reduced motion preferences.

---

## Forms & Settings

- Use compact inputs.
- Use inline validation.
- Maintain accessible labels and focus states.

### Critical rule

All settings are auto-saved.

- No Save button.
- No Changes saved toast.
- No confirmation message for normal setting changes.
- Every change persists immediately.

Includes:
- Theme
- Language
- Security settings
- Preferences

---

## Internationalization

- Add language selector in Settings.
- Persist selection automatically.
- Prepare integration with Google Translate API or another backend-proxied translation provider.

Rules:
- Do not expose API keys in the frontend.
- Use the Tauri/Rust backend as proxy.
- Cache translations when possible.
- Avoid translating on every render.

---

## Security Architecture (Strict)

The frontend must not implement real security logic.

All sensitive operations must live in Rust/Tauri:

- Encryption and decryption
- Vault management
- PIN/password verification
- Key derivation with Argon2id
- File integrity
- Audit logs
- Emergency lock behavior
- Export of security events

Frontend responsibilities:

- Display state
- Trigger secure backend commands
- Render feedback and errors
- Never fake security state in UI

---

## Security Features

DigiPET should behave as a real file protection system:

- Encrypt files and folders
- Lock, unlock, hide and restore protected assets
- Verify integrity
- Show activity history per asset
- Support bulk operations
- Provide clear and actionable empty states

Encryption standards:

- Argon2id for key derivation
- AES-256-GCM or XChaCha20-Poly1305
- Minimal plaintext metadata
- Optional path/name obfuscation

---

## Authentication / 2FA

Design modular support for:

- Password
- PIN
- Passkeys, if feasible
- Local OS biometrics
- Face module, future-ready
- Telegram 2FA, optional

Rules:

- No hardcoded secrets.
- Telegram setup must be handled securely in Settings.
- Backend handles verification.

---

## Audit & Device Info

Display real session activity:

- IP, local/public when available
- Hostname
- OS
- Device type icon
- Timestamp
- Method used, such as PIN/password/biometric
- Status, such as success/fail/locked
- Optional approximate location, privacy-safe

---

## Script & Automation Rules

- Use `python digipet.py` as the main entry point when documenting project workflows.
- Keep auxiliary scripts inside `scripts/`.
- Do not add new root-level `.bat`, `.ps1`, `.sh` or `.py` files unless they are intentionally top-level entry points.
- If a script creates logs, write them to `logs/`.
- If a script creates a distributable build, write generated output to `dist/` or the standard Tauri target directory.

---

## Additional Features

### Terminal

Add a sidebar section for Terminal:

- Integrated terminal view.
- Safe execution model.
- If not fully implemented, create UI plus secure backend stub.

---

## Visual Fixes Required

- Reduce excessive nesting.
- Improve contrast between cards and background.
- Simplify dashboard.
- Remove placeholder-looking sections.
- Make empty states useful and visual.
- Improve asset management UX.

---

## Skills Usage

Always apply, when available:

- baseline-ui
- fixing-accessibility
- fixing-metadata

If available:

- interface-design
- interaction-design
- fixing-motion-performance

---

## Before Finishing

Review:

- UI consistency
- Accessibility
- Metadata
- Script references
- File paths
- Root cleanliness

Run when available:

```bash
npm run lint
npm run typecheck
npm run build
npm run tauri build
```

If a command does not exist in `package.json`, do not invent it. Use the available scripts or the `digipet.py` workflow.

---

## Golden Rules

- Keep it simple.
- Keep it fast.
- Keep it clean.
- Keep it secure.
- Do not fake security in UI.
- Do not add unnecessary features.
- Everything should feel intentional.
