# AUSA Video Hub — Project Reference

> This file is the memory of the entire project. Any new AI conversation should read this file first to understand the full context.

---

## Overview

**AUSA Video Hub** (formerly "Athletes USA Highlights" / "AUSA Highlights") is a soccer highlight video editing web app built as a **single self-contained HTML file** (`index.html`). It serves two user types: **athletes** who upload clips and manage their profiles, and **editors** who assemble highlight reels in a full timeline-based video editor (NLE).

**Live URL:** `https://caiomazzocm-dotcom.github.io/Athletes-USA-Highlights-app/`
**Athlete page:** `https://caiomazzocm-dotcom.github.io/Athletes-USA-Highlights-app/#/athlete`
**Studio/Editor page:** `https://caiomazzocm-dotcom.github.io/Athletes-USA-Highlights-app/#/studio`
**Studio password:** `admin`

**Owner:** Caio (caiomazzo.cm@gmail.com)
**Domain owned:** `athletesusa.org` (WordPress/Elementor — custom domain not yet connected to the app)
**GitHub repo:** `caiomazzocm-dotcom/Athletes-USA-Highlights-app`

---

## Tech Stack

- **Frontend:** React 18 (CDN) + ReactDOM + Babel standalone (all in-browser, no build step)
- **Database:** Firebase Firestore (collection: `players`, `feedback`)
- **Storage:** Firebase Storage (bucket: `athletes-usa.firebasestorage.app`) — videos, profile pics, feedback screenshots
- **Local cache:** IndexedDB (`aua_videodb`) for offline video blobs, localStorage for session/player identity
- **ZIP downloads:** JSZip 3.10.1 (CDN)
- **PWA:** manifest.json + Apple meta tags for home screen install
- **Hosting:** GitHub Pages
- **Font:** Inter (Google Fonts)

### Firebase Config
```
projectId: "athletes-usa"
storageBucket: "athletes-usa.firebasestorage.app"
appId: "1:599507645774:web:8aa8c5f518b0dda6d45a1f"
```

---

## File Structure

```
Athletes-USA-Highlights-app/
  index.html          — The entire app (~2574 lines)
  manifest.json       — PWA manifest
  icon-192.png        — PWA icon 192x192
  icon-512.png        — PWA icon 512x512
  apple-touch-icon.png — iOS home screen icon
  PROJECT.md          — This file (project memory)
```

---

## Architecture & Key Components

### Hash Routing
- `#/athlete` → Athlete-only entry (no studio access)
- `#/studio` → Studio entry (password-gated, editors can also access athlete pages)
- Default (no hash) → Combined landing with both tiles

### React Components (in order of appearance in file)

1. **Icon components** (~25 SVG icons as React components)
2. **Constants** — `C` (color palette), `CAT_COLORS`, `PLAYER_COLORS`, `STUDIO_PASSWORD`, `DEFAULT_CATS`
3. **Helpers** — `getMediaDur`, `getAudioDur`, `fmtTime`, `uid`, `sanitizeName`
4. **IndexedDB** — `openVDB`, `storeBlob`, `getBlob`, `deleteBlob`, `hydratePlayerVideos`
5. **Firebase Cloud** — `uploadVideoToCloud`, `deleteVideoFromCloud`, `savePlayerToCloud`, `loadPlayersFromCloud`, feedback CRUD functions
6. **Waveform** — SVG audio waveform visualization
7. **Download helpers** — `downloadImage`, `downloadPlayerZip` (JSZip-based)
8. **LandingBg** — Shared landing page background with animated grid
9. **PasswordModal** — Studio password gate
10. **LandingPage** — Combined landing (both tiles)
11. **AthleteLandingPage** — Dedicated athlete entry
12. **StudioLandingPage** — Dedicated studio entry with athlete review access
13. **AthleteSelect** — Player selection grid (shows ALL players with search)
14. **AthleteProfileForm** — New profile creation form (all fields mandatory)
15. **FeedbackModal** — Submit feedback with screenshots
16. **FeedbackFAB** — Floating feedback button on athlete pages
17. **FeedbackAdmin** — Full admin panel for managing feedback (in Studio)
18. **EditProfileModal** — Edit existing profile info (name, height, positions, photos, etc.)
19. **AthletePortal** — Main athlete view: category cards, upload, drag-reorder, zip download
20. **StudioApp** — Full NLE editor with:
    - Video pool (one `<video>` per clip for instant switching)
    - Multi-track timeline (V1, V2, V3 + audio tracks + tag track)
    - Spotlight tags (source-anchored to video frames)
    - Real-time preview with canvas rendering
    - Export to MP4 (MediaRecorder + canvas at 1920x1080)
    - Player sidebar with expandable categories
    - Clip feedback system (tags + notes per clip)
    - Keyboard shortcuts (Space, S, N, M, Del, etc.)
21. **App** — Root component: routing, cloud loading, auto-login, player CRUD

### Key Design Patterns

- **Video Pool:** One pre-loaded `<video>` per timeline clip (opacity-based visibility, not display:none) for instant switching during playback
- **Source-anchored tags:** Spotlight tags store `sourceTime` relative to the original video, not timeline position. Timeline positions are computed dynamically via `resolvedTags` memo.
- **Dual-element export:** Separate video elements for preview vs export to avoid conflicts
- **Cloud-first loading:** Firestore → fallback to localStorage → empty state
- **Auto-login:** `#/athlete` route checks localStorage `aua_my_player_id`, auto-navigates to portal after cloud load

---

## Default Categories

`["Goals", "Assists", "Defensive Actions", "Attacking Actions", "Full Highlights"]`

("Full Highlights" is always last)

---

## Firestore Collections

### `players`
```json
{
  "id": "pl-xxx",
  "name": "Player Name",
  "recruitingClass": "2026",
  "size": "5'11\"",
  "dob": "2008-03-15",
  "shirtNumber": "10",
  "uniformDesc": "Red jersey #10",
  "positions": ["CAM", "RW"],
  "profilePicUrl": "https://...",
  "playingPicUrl": "https://...",
  "categories": [
    {
      "id": "cat-xxx",
      "name": "Goals",
      "videos": [
        { "id": "vid-xxx", "name": "Goal vs Miami", "duration": 12.5, "cloudUrl": "https://..." }
      ]
    }
  ]
}
```

### `feedback`
```json
{
  "id": "fb-xxx",
  "type": "bug|feature|general|praise",
  "message": "...",
  "rating": 0-5,
  "screenshots": ["https://..."],
  "playerName": "...",
  "status": "open|in_progress|resolved|closed",
  "adminNote": "...",
  "createdAt": 1709000000000,
  "updatedAt": 1709000000000
}
```

---

## Color Palette (C object)

```
base: #0a0a14    mantle: #0f0f1a   crust: #080810
s0: #1a1a2e      s1: #2a2a40       s2: #3a3a55
text: #e2e8f0    sub: #94a3b8      overlay: #64748b
blue: #3b82f6    red: #ef4444      green: #22c55e
yellow: #eab308  lavender: #a78bfa  peach: #fb923c   coral: #f43f5e
```

---

## Features Completed (chronological)

1. Full NLE timeline editor with multi-track support
2. Player profiles with positions, recruiting class, photos
3. Source-anchored spotlight tags with configurable duration
4. S key shortcut for instant tag creation
5. Clip feedback system (tags + notes per clip in editor)
6. Mobile responsive athlete pages
7. Photo download buttons on athlete portal
8. Player identity isolation (athletes see only their own profile)
9. Cloud sync (Firestore + Firebase Storage)
10. Video pool for instant clip switching (NLE approach)
11. Export to MP4 with canvas rendering at 1920x1080
12. Multiple export bug fixes (black screen, CORS, audio sync)
13. Separate athlete/editor URLs via hash routing
14. ZIP download of all clips by category (JSZip)
15. PWA home screen icon and manifest
16. AUSA logo as app icon (generated from SVG)
17. Horizontal scroll prevention on mobile
18. All profile fields mandatory with asterisks
19. Height auto-conversion (cm → feet/inches)
20. Height shown in player header
21. "Full Highlights" as last default category
22. App renamed to "AUSA Video Hub"
23. Export tag freeze with fade in/out spotlight (0.3s fade, 1.5s freeze)
24. Feedback system: submit with screenshots + admin panel
25. Profile persistence fix: all players visible on select screen
26. Auto-login for athletes on #/athlete route
27. Edit Profile modal (modify info after creation)
28. Athlete profile isolation: athletes only see/access their own profile; other athletes shown as greyed-out view-only cards; first-time visitors can pick from existing profiles to claim theirs

---

## Known Issues / Pending Tasks

1. **Export tag/freeze rendering** — The freeze with fade in/out was implemented but the user reported it still doesn't look right after a second test video. May need further investigation of the canvas render loop timing.
2. **Firebase Security Rules** — Currently using default/open rules. The user said "do not let me forget" about locking these down. Rules should restrict read/write to authenticated users or at least validate data structure.
3. **Custom domain** — User owns `athletesusa.org` (managed by their company via WordPress/Elementor). A CNAME for `app.athletesusa.org` was attempted but reverted because DNS wasn't configured. The user's IT team needs to add a CNAME record pointing `app.athletesusa.org` → `caiomazzocm-dotcom.github.io` before re-enabling.

---

## Important Technical Notes

- **Never use `width: 100vw`** — causes horizontal scrolling on mobile (includes scrollbar width). Always use `width: 100%` or `position: fixed; inset: 0`.
- **JSZip `generateAsync` callback** — must be an arrow function `meta => {...}`, NOT an object `{update(meta){...}}` (caused "o is not a function" error).
- **Video elements need `opacity: 0` not `display: none`** — display:none tells browser to stop buffering the video entirely.
- **Export uses its own video elements** — never share `<video>` elements between preview and export.
- **`overscroll-behavior-x: none`** on html, body, #root prevents iOS horizontal bounce.
- **Profile pics and playing pics** are uploaded to Firebase Storage under `profile_pics/` and `playing_pics/` paths.
- **Feedback screenshots** go to `feedback/{feedbackId}/screenshot_{idx}_{timestamp}`.

---

## Git Info

- **Total commits:** 47+
- **Branch:** main
- **Remote:** `https://github.com/caiomazzocm-dotcom/Athletes-USA-Highlights-app.git`
- **Push from terminal:** `cd ~/Desktop/Athletes-USA-Highlights-app && git push`

---

*Last updated: March 3, 2026*
