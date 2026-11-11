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
  sw.js               — Offline mode: saved copy of the app, libraries and brand files (Features #55)
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

### `sceneLibrary` (written by the Studio after each full export — see Features #43)
```json
{
  "playerId": "pl-xxx | editor", "playerName": "...", "positions": ["LCB"], "roles": ["CB"],
  "clipId": "clip-xxx", "sourceId": "vid-xxx", "sourceName": "...", "start": 52.429, "end": 62.939, "duration": 10.51,
  "fromSplit": true, "label": "goal|assist|top|defense|weak|null", "goodFor": ["CB"], "notes": ["spoken note"],
  "outcome": "kept|deleted", "order": 0, "keptCount": 5, "track": "V1|overlay|null",
  "thumb": "data:image/jpeg;base64,... (160×90)", "savedAt": 1761930000000
}
```
Doc id `{playerId}_{clipId}`. When Firestore rules are locked down, the Studio needs write access here.

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
28. Athlete profile isolation (v1): greyed-out view-only cards (REPLACED by phone login in #29)
29. Phone-based athlete identity: athletes log in with phone number, each profile locked to its phone. No more browsing other profiles. Phone stored in Firestore and localStorage for auto-login.
30. Timeline/export bug pass (Sept 2026):
    - Freeze and spotlight tags now default to **3 seconds** (`FREEZE_DUR`, `TAG_OVERLAY_DUR`). `TAG_MAX_DUR` (10s) is only a runaway guard on the resize handle.
    - Fixed V1 magnetic compaction running against a stale tag track (the cause of clips shifting/overlapping after adding a freeze). `compactV1` now reads `tagTrackRef.current` and accepts an explicit override.
    - One shared `clipFreezeDur()` helper replaces three inconsistent effective-duration calculations (`compactV1`, `recalcAll`, `findActiveClip`).
    - `delClip` and `cutClip` now compact against the *post-change* tag track. `cutClip` was rewritten to compute the split synchronously so tags are re-pointed at the new clip halves before compaction.
    - Resizing a tag now re-flows V1 (previously skipped, so clips overlapped a lengthened freeze).
    - Export: added a hold-frame buffer so seeks no longer render black; removed redundant seeks at cut and freeze boundaries; `findSeg` tolerates sub-frame float gaps between segments.
31. Studio usability pass (Sept 2026):
    - **Space/pause fix.** The shortcut handler bailed on every `<input>`, but zoom and volume are `<input type="range">` — once focused they swallowed every shortcut. Guard now covers text entry only; Space is global (and blurs the focused control, since a focused button fires its own click on space); other shortcuts defer to a focused slider so its arrow keys still work.
    - **Spotlight Scale fix.** The properties panel switched on `selClip.type!=="tag"`, but freeze tags are type `"freeze"`, so selecting a freeze showed the video-clip sliders and Scale wrote a property nothing reads. Panel now decides by tag-track membership (`selIsTag`).
    - **Clips render on their own track row.** The video clip style object declared `position` twice — `"absolute"` then `"relative"` — and the last key wins, so clips fell into normal document flow and the second clip on a track wrapped onto a line *below* the first. It looked exactly like the clip had landed on V2. `left` still applied as a relative offset, which is why horizontal placement looked right. **This was the real cause** of "my second video goes to V2".
    - **Clips land on V1.** Dropping a video anywhere in the video area appends to the end of the main storyline via `v1EndPos()`; hold **Alt/Option** while dropping to place it on the exact track and position for deliberate layering.
    - **Tag defaults:** `FREEZE_DUR` / `TAG_OVERLAY_DUR` = **1.5s** (standard since Sept 25), `SPOT_SCALE_DEFAULT` = **0.5** (50% on the Spotlight Scale slider). Both remain freely resizable; `TAG_MAX_DUR` (10s) is only a runaway guard. The render fallback for tags with no stored `spotScale` stays at `1.0` so pre-existing tags don't retroactively shrink.
    - **One project per player.** Storage key is `aua_studio_project:<playerId>` (`:editor` when no player is selected). Selecting a player in the sidebar saves the outgoing project and opens theirs; a player with no saved project gets an empty timeline rather than inheriting the previous athlete's clips. A pre-per-player save under the bare `aua_studio_project` key is adopted once by the first project opened, then removed.
    - **Timeline persistence.** The Studio autosaves the edit to `localStorage`, debounced 600ms, and restores it on entry. Header shows a "Saved HH:MM" indicator plus a **New** button; a banner after restore offers "Start fresh".
      - **Clip URLs are never saved** — a `blob:` URL is dead after reload. Each clip carries `videoId`, so on restore the URL is re-resolved from the player's media, then editor media, then IndexedDB, then a persisted `srcUrl` (https only). Clips whose media can't be found are dropped and reported in the banner rather than left broken.
      - The restore effect runs **once** on mount with `[]` deps and reads players/editor media through refs; earlier it depended on those values and a dep change mid-restore abandoned it. Autosave is armed by `saveArmed` so an empty initial timeline can never overwrite a saved project.
      - Payload is small (a 3-clip timeline is ~650 bytes) since only positions, trims, tags and settings are stored.
    - **Spotlight tags are AUSA blue** (`SPOT_COLOR` = `C.blue`, `SPOT_RGB` for canvas rgba), matching the athlete portal and Freeze control. Freeze clips carrying a spotlight use the lighter `#60a5fa` so they stay distinguishable on the timeline. The standalone Overlay tool has its own colour picker and was left alone.
32. Multi-player workflow (Sept 25 2026):
    - **Opening a project is deliberate.** Each player row has an **Edit** button (`openProject`); the open one shows an **EDITING** badge and the top bar reads "Editing: <name>". Clicking a folder only expands/collapses it — previously expanding a folder silently switched the whole timeline.
    - **Project status per player** in the sidebar: "N clips · N tags · saved <time>" or "No edit yet" (`projectSummary`).
    - **Adding a player's clip with no project open** opens that player's project first (`addClipForPlayer`), so work never lands in the unassigned slot.
    - **Tags follow the clip, not a list.** `tagOwnerAt(playhead)` returns the owner of the clip under the playhead (every clip stores `playerId`), so a teammate's clip in someone's reel tags the teammate. The player list only appears for editor-media clips with no project open.
    - **Freeze + Tag is one action** (button or **F**): creates the freeze, then the next click on the preview places that player's spotlight on it. **Esc** keeps a plain freeze. The spotlight targets the pending freeze by id (`pendingFreezeRef`), not by re-finding it under the playhead.
    - **Bug fixed:** choosing a player from the tag menu used to call `setActivePlayerId`, which switched projects mid-edit and swapped out the reel being worked on.
    - Verified in a running Studio: auto-open on first clip, Freeze + Tag producing a single 1.5s freeze with Joris's spotlight at 50%, switching to Leon and back with the edit restored, and a Leon clip inside Joris's reel tagging Leon.
33. AUSA brand template (Sept 25 2026):
    - **Source:** `Athletes USA Intro Video.mp4` (Caio's LaCie drive), 1280×720 25fps H.264/AAC, 14.96s. Only **0:07–0:13** is used: the photo mosaic → logo forming → "ATHLETES USA · Sport Scholarship Agency" card. Audio is naturally silent by 13.0s, so no fade-out; a 40ms fade-in at 7.0s only prevents a click.
    - **Files:** `brand/outro.mp4` (6.000s, 150 frames, re-encoded CRF 18 for a frame-accurate cut) and `brand/intro-audio.m4a` (the same 6s of sound). Served from the site itself — same origin, so the export can draw them with no CORS setup. Regenerate with `ffmpeg -ss 7 -i <src> -t 6 …` (see git log for exact flags).
    - **Every new/cleared project is the template** (`brandTemplate`, `emptyTimeline(pid)`): V1 = [intro slot 6s][outro 6s], A1 = intro sound 0–6s. Clips always land between them: `v1EndPos` returns just before the outro, and `brandRank` makes `compactV1`/`closeGaps` keep intro first and outro last even after drags.
    - **Intro slot** is an image clip (`kind:"image"`, `brand:"intro"`). Fill it by clicking the preview placeholder, dropping an image on the preview or timeline, double-clicking the clip, or "Choose thumbnail" in the properties panel. The image is stored in IndexedDB under its own id, so it survives reloads.
    - Image clips are skipped by the video pool, drawn as `<img>` in preview, and as an `Image` in export (`drawVideoFit` handles both). Export warns if the intro has no thumbnail.
    - Older projects show a **"+ Intro / Outro"** button that adds whichever pieces are missing.
    - Pool `<video>` elements only use `crossOrigin` for absolute http(s) URLs; with it set, a relative `brand/` file opened from disk failed to load.
    - **Verified end to end** on a running Studio with a real export, inspected with ffprobe/ffmpeg: file 29.19s for a 29.2s edit, no black frames, cuts at exactly 6.0s (thumbnail→clip) and 23.2s (clip→outro), and the intro sound in 0–6s matching the reference within ~1 dB.
    - **Measurement note:** Chrome's `<video>` misreports duration and seeks inaccurately on MediaRecorder MP4s (reported 30.16s and a ~1s offset that didn't exist). Verify exports with ffprobe/ffmpeg, not by seeking in the browser.
34. Template always present + Editor Media photos (Sept 25 2026):
    - **Every project has the template automatically**, including ones saved before it existed. `loadProject` runs `withBrand` on any save without `brand:1`: the intro is inserted at 0 and *everything else shifts back by its length* (V1 via `layoutV1`, and V2/V3 overlays and A1 music by +6s) so overlays stay in sync; freezes move with their clips because tags are source-anchored. `writeProject` then writes `brand:1`, so an intro/outro removed on purpose stays removed.
    - `layoutV1(clips,tagClips)` (module level) is now the single magnetic-layout routine, used by `compactV1` and `withBrand`.
    - **"+ Intro / Outro"** moved from the top bar to beside **Freeze + Tag**, solid AUSA red, and only appears when a piece is missing. It now uses `withBrand`, so it also shifts overlays and music correctly.
    - **Editor Media → Photo.** Photos are stored like videos/music (IndexedDB + `aua_editor_imgs`) and listed with a thumbnail. Uploading fills an empty intro automatically; double-click or drag a photo onto the preview/timeline to use it; the one in use shows an **INTRO** badge. A file dropped or picked for the intro is also added to Editor Media for reuse. `putThumbnail` restores a deleted intro first, so a thumbnail always has a slot.
    - Verified in a running Studio: an old-style Leon project (29.5s clip + 1.5s freeze) opened as intro 0–6 / clip 6–37 / outro 37–43 with the freeze moved to 8.0s; Photo upload filled the intro; a deleted outro stayed deleted across a reload (flag honoured) and the red button restored it at 37.0 without duplicating the intro sound.
35. 5-second intro + intro transition (Sept 25 2026):
    - **Intro is 5s** (`BRAND.introDur`), outro stays 6s (`BRAND.outroDur`). `brand/intro-audio.m4a` re-cut to 5.000s from 0:07 with a 40ms fade-in and an `hsin` fade-out from 4.0→5.0s. The source is already decaying there (−29 dB at 4.0s, −38 dB at 5.0s), so the fade follows it to silence instead of chopping the tail.
    - **Migration:** saves are now `brand:2`. `shortenIntro` brings `brand:1` projects' 6s intro (and its 6s sound) to 5s and moves overlays/music after it 1s earlier. Intros resized by the editor are left alone.
    - **Intro look** (`INTRO_FX`, `introFx`, `introInFx`, module level, one set of curves for preview *and* export): a slow Ken Burns push (+8%) and left→right drift across the thumbnail; in its last 0.7s a zoom (+22%) with blur building to 1.2% of frame width; the first clip then starts blurred and zoomed (+14%) and settles over 0.5s while its own audio fades in. Export uses `ctx.filter="blur()"`, preview uses CSS `filter`/`transform`. Only applies once the intro has a thumbnail.
    - Verified: an old 6s-intro project reopened as intro 0–5 / clip 5–13 / outro 13–19 with a 5s sound. Preview transform/blur values followed the curves. A real export (19.01s for a 19.0s edit) measured with ffmpeg `blurdetect`: ~4.0 sharp to 4.0s, 7.9 @4.5, 25 @4.8, peak 37 @5.05 (clip arriving blurred), 19 @5.2, back to ~4.6 by 5.35–5.6. Intro sound fades to silence by 5.0s. Clip audio in sync (export @6.0/6.5s = source @1.0/1.5s, −25.4/−23.7 dB). Leon's test clip is silent for its first second, so the 0.5s audio fade-in wasn't audible in this test.
36. Export for social + captions (Sept 25 2026):
    - **Social** button (top bar, next to Export) opens a side panel. Formats (`SOCIAL_FORMATS`): **9:16** 1080×1920 (Reels/TikTok/Shorts, also LinkedIn's vertical feed), **4:5** 1080×1350 (LinkedIn main feed / Instagram feed — LinkedIn's best-performing shape), **1:1** 1080×1080.
    - **Which part:** Start here / End here set a range from the playhead; default is 30s starting after the intro and stopping before the outro. Shown as a blue band on the ruler. Optional AUSA outro appended.
    - **Framing** (`socialFrame`): player clips are cropped to full height and centred on the average spotX of that clip's spotlight tags (so the tagged player stays in shot), else the middle. Brand clips (intro/outro) show the **full picture** over a blurred, darkened copy, so the logo is never cut. Per clip, with the panel open, the properties bar offers Crop / Full picture, a Left↔Right slider and Auto. The preview dims everything outside the social window.
    - **Engine** (`exportVideo(opts)`): `{W,H,range,appendOutro,bitrate,fileName}`. Output time maps to timeline time via `mapT` (range, then the outro). Every draw goes through a frame box (`boxFor`); in landscape the box is the whole canvas, so the widescreen export is byte-for-byte the same logic as before. Spotlights are placed and sized in the box. The name label is clamped to stay on the canvas. A range starting mid-clip pre-seeks so it doesn't open on black. Music re-seeks at the range→outro jump. File: `AthletesUSA_<Player>_<format>_<date>.mp4`, 12 Mbps.
    - **Caption** (`makeCaption`): name · position(s) · Class of; league line said more strongly when **Highlight the league** is on (auto for Oberliga and above incl. Regionalliga, 3. Liga, Bundesliga, DFB-Nachwuchsliga — `isHighLeague`; editor can untick); otherwise just the club; a neutral line about the clip; optional Athletes USA line; 2–3 hashtags (LinkedIn vs Instagram/TikTok). English/Deutsch (German positions name the role, not the person, so they fit any athlete). "Another version" rotates wording; the text is editable; Copy caption. League/club are remembered per athlete in `aua_social_meta:<playerId>` until the platform provides them.
    - Verified: a 9:16 export of a 9.5s part + outro came out 1080×1920, 15.5s, no black frames. The crop followed a spotlight at 72% (window at 56.2%, as computed). The freeze ring + name label sat centred. The outro was whole over its blurred backdrop, and its music arrived at full level exactly at the join. Regression: the widescreen export of the same project came out 1920×1080, 20.5s, no black frames, intro blur curve intact, spotlight in place.
37. Keyframes (Sept 25 2026):
    - **Animatable per clip:** Scale, X, Y (main framing) and the social crop position. Each control has a ◇/◆ button: press it to add a keyframe at the playhead. Once a property has keyframes, changing its value anywhere on the clip adds or updates the keyframe at the playhead (auto-key). Pressing ◆ on an existing keyframe removes it; removing the last one leaves that value in place, no longer animated. Keyframes show as blue diamonds on the clip (click to jump); the properties bar gets Keyframes ◀ ▶ to step between them. Reset (pan) and Auto (social) clear that property's keyframes.
    - **Model:** `clipProps[clipId].kf = {scale|panX|panY|socialX: [{t,v}]}` with `t` in the clip's SOURCE seconds, so trimming, moving and splitting keep keyframes on the same footage (a split copies clipProps, so each half evaluates its own range). During a freeze the source time stands still, so values hold. `kfEval` eases between keyframes (smoothstep) and holds before the first and after the last; `propsAt(props,t)` returns animated props; `upsertKf` replaces within `KF_EPS` (0.04s).
    - **Everywhere reads animated values:** the preview (`activeSrcT`, `actProps`), the social guide, drag-to-pan (writes through keyframes via `setClipParam`), and the export (each frame's `segSrcT` → `propsAt` + `boxFor(clipId,t)`).
    - **Ruler fix:** clicking the ruler now only moves the playhead (`handleTlClick(e,true)`). It used to deselect the clip, so the clip's controls vanished on every playhead move — unusable for keyframing. Clicking empty track space still deselects.
    - Verified: social X keyframes 20%@1.0s / 80%@5.0s on a clip with a freeze. The second keyframe was placed from playhead 11.5 → footage 5.0 (freeze subtracted). The preview crop window matched the calculation at 5 points, including holding still through the freeze. In a real 9:16 export, each tested frame matched the original footage best at exactly the keyframed crop position (e.g. 23.2 dB at 20% vs 13.5/11.8 elsewhere), and the two freeze frames were identical (70 dB). Scale keyframes 100%→150% gave 132.4% mid-freeze in the preview, held across the freeze.
    - **Note on the Overlay tile:** the landing page's "Overlay / Spotlight Tags" tool (`SpotlightTagGenerator`) predates this work (commit f4cc96b, 2026-03-05). It makes a spotlight PNG from a still image for use in another editor, and is reachable from the editor-only "Generate Tag" button in the athlete view. The Studio's Freeze + Tag now covers that inside the video.
38. Studio layout on smaller screens (Sept 25 2026):
    - **Bug:** on windows narrower than ~1300px the top bar overflowed, pushing Social / Export / Feedback / Exit off the right edge (at 1100px all four were gone). Separately, the preview box was sized by width only (`width:100%`, 16:9), so on short windows it grew taller than its space and **covered the editing toolbar** (Select, Blade, Spotlight only, Freeze + Tag), e.g. a 405px box in 286px at 1100×750.
    - **Fix:** the top bar is split into a left group that may shrink/clip (`minWidth:0`) and an action group that never shrinks. The shortcut reminders (`.studio-hints`) hide below 1600px and the resolution label (`.studio-res`) below 1250px (media queries in the main `<style>`). The "Editing:" chip ellipsizes. The preview wrapper is a size container (`containerType:"size"`) and the box width is `min(720px, 100cqw, calc(100cqh*16/9))`, so it fits both dimensions. The toolbar is `flexShrink:0` with its own stacking layer.
    - Verified at 1024×700, 1100×750, 1280×800, 1440×900 (also with the Social panel open) and 1920×1080: all action buttons and editing tools visible and clickable, the preview stays 16:9 and never overlaps the toolbar, and the hints show only on wide screens.
39. Keyframe buttons made findable (Sept 26 2026): Caio couldn't find keyframes. They were a faint, unlabelled grey ◇ after the Scale % and the social slider. They're now bordered **◇ Keyframe** buttons that turn blue/◆ when active. The clip bar wraps onto a second line instead of clipping, and the Social frame controls are one non-wrapping group, so its Keyframe button stays beside its Left–Right slider. Checked at 1280×800 with the Social panel open.
40. Outro transition, loudness standard, AUSA Music shelf (Sept 26 2026):
    - **Outro transition** (`OUTRO_FX`, `outroFx`): mirrors the intro. The last 0.7s before the outro zooms (+22%) and blurs; the outro arrives at +14% and blurred and settles over 0.6s. The clip's own sound fades out; the outro's sound fades in over the settle (`outroGain`). It works on a freeze right before the outro too. Export places the join in *output* time (`joinU`), so it also works for social clips with the outro appended. The preview uses the same curves (video container, pool volume, A1 volume).
    - **Background music** fades with a longer eased curve (`MUSIC_FADE` 1.5s, `musicFadeAt`) and is silent under the outro. The outro sound and the intro sound are exempt.
    - **Loudness standard** (`LOUDNESS`): every export source goes through one bus → DynamicsCompressor (threshold −24, knee 6, ratio 12, attack 3ms, release 250ms; Chromium adds automatic make-up gain) → output gain 0.5. Measured on a reel of intro sound + phone clip + a −1 dB test song + outro (sources peaking at −0.2 dB): peaks intro −9.0, clip+song −10.9, outro −9.1, whole −9.0 dB; average −20.3 dB. Target from coaches' feedback: peaks −8 to −12 dB. **Export only** — the in-editor preview plays sources at their own level.
    - Measured without the output trim first: peaks ≈ −3 dB, and a 0.7s music fade only dropped ~2 dB because the compressor pushes level back up as a source fades. Hence outGain 0.5 and the separate 1.5s music fade (now −18 → −22 → −36.5 dB across the last 1.5s).
    - **AUSA Music** (`BRAND_MUSIC`, shown in Editor Media when non-empty): double-click places a song on A1 from the end of the intro to the start of the outro (`addBrandSong`); drag works too. Files go in `brand/music/`. Filled Nov 7 2026 — see #49.
41. Editing-speed pack (Oct 12 2026) — Caio picked 5, 6, 7, 8, 12, 15 from the feature list:
    - **Q / W** (`trimToPlayhead`): ripple-trim the clip under the playhead to the playhead (Q removes everything before it, W everything after), Premiere-style. V1 closes the gap via compaction; V2/V3 keep the content in place. The selected clip wins if the playhead is over it; brand clips are skipped.
    - **J / K / L** (`shuttle`, `playRate`): L = forward, pressing again doubles (1×→2×→4×); J the same backwards; K stops; Space resets to 1×. Forward uses real `playbackRate` on the preview video and music, with drift correction; backwards scrubs (browsers can't play video in reverse). A speed badge sits next to the clock.
    - **, / .** step one frame (1/30s, which never skips a 25 or 30fps frame); with **Shift**, ten. Matched by `e.code`, so it works on German and US keyboards.
    - **Hover preview** (`skim`, `skimMove`): moving the mouse across a folder clip (player folders and editor videos) shows a floating 16:9 preview at that point, with time. The video element stays mounted and is seeked directly (no re-render per mouse move).
    - **Redo / copy / paste / duplicate**: ⌘⇧Z or ⌘Y redo (a `future` stack; new edits clear it); ⌘C/⌘V/⌘D copy the clip together with its props, keyframes and freezes/tags. Paste goes at the playhead; duplicate goes right after the original. Brand clips can't be copied. All ⌘-combos are now handled before plain keys, so ⌘S no longer adds a spotlight.
    - **Background export**: the full-screen block is now a corner card with progress and Cancel; shortcuts and editing stay live. `setExportProgress` fires only when the % changes. Hiding the tab pauses the MediaRecorder and all media, and resumes in place, so the file never gains dead time. Leaving the Studio or closing the tab mid-export asks first.
    - Verified in a running Studio: Q at 7.0 → clip 8s→6s; W at 9.0 → 4s (footage 2.0–6.0), outro following. ⌘Z ×2 / ⌘⇧Z round-tripped. ⌘D and ⌘C+⌘V inserted copies with the outro staying last. L moved 0.97s/s, LL 2.03s/s, J −1.00s/s, K 0. Frame keys ±1 and Shift ±10 frames. Hover preview seeked to 14.7s/26.5s at 50%/90% of a 29.5s clip. A background export with a simulated 3s tab-away came out exactly 17.0s for a 17.0s edit, with picture and sound switching together at the outro (11.0s) and no frozen stretches.
42. Split scenes (Oct 15 2026) — CapCut's feature, asked for by Caio: select a video clip → **Split scenes** in the clip bar → it is cut at every hard scene change, so a full highlight video becomes one piece per scene to reorder or delete.
    - **Detector** (`detectSceneCuts`, `SCENE`, `sceneThumb`, `sceneChange`): a hidden video plays the clip at 4× and every presented frame (`requestVideoFrameCallback`) becomes a 64×36 grey thumbnail; frames that differ by ≥ 0.18 (1 − normalised cross-correlation) are candidates. Each candidate is binary-searched by seeking down to the exact frame, then kept only if the jump is ≥ 0.22 **and** ≥ 8× the median of the frame steps around it. Spotlight dimming and pans change brightness/position gradually and fail that test; dissolves are not detected. Scenes shorter than 0.4s are ignored. Fallback without frame callbacks: seek every 0.08s.
    - **Thumbnails must be box-averaged** (draw at 256×144, average 4×4 blocks). Shrinking 720p straight to 64×36 with `drawImage` aliases: in-shot frame steps measured 0.29–0.35 instead of ~0.04, every cut was rejected as "motion". Box-averaged values match ffmpeg to ±0.005.
    - **Splitting** (`splitScenes`): one undo step; pieces keep the clip's props/keyframes; freezes and tags move to the piece that contains their source time, and later pieces are offset by those freezes; V1 re-compacts so the outro stays last. Progress card with Cancel; a toast reports "Split into N scenes — ⌘Z to undo."
    - Verified on the first 90s of a real 23.976fps recruiting reel (Luc Haller): the 7 hard cuts found by a numpy/ffmpeg ground truth (13.305, 22.773, 43.293, 52.427, 62.938, 68.527, 72.864) were all found on the exact frame, with 0 false cuts, in 27s. In the Studio: 8 pieces back to back with the outro last; deleting a scene closed the gap; ⌘Z ×2 restored the scene, then the whole clip; with a 1.5s freeze at source 14.83s the freeze moved to the 13.30–22.77 piece and later pieces shifted by 1.5s.
    - **Hidden tab fix (Oct 31 2026):** a hidden tab (or a busy computer) stops presenting frames while the 4× playback runs on — 2 frames in 9.6s were delivered and the 43.29 cut was silently missed. Every stretch with a frame gap > 0.25s (`SCENE.gap`) is now re-checked by seeking every 0.08s, and the pass ends on `timeupdate` at the clip's end even with no frame callbacks. Re-verified fully hidden: all 7 cuts on the exact frame, 31s for 90s.
43. Scene labels + scene library — learning step 1 (Oct 31 2026). Caio wants the app to learn which scenes are good from how he edits, and later pre-sort new videos.
    - **Labels** (`SCENE_LABELS`, stored on the clip as `clip.scene = {label, roles[], notes[{text,at}]}`): ⚽ Goal (key 1), 🎯 Assist (2), ⭐ Top scene (3), 🛡 Defensive (4 — replaced by 👍 Good in #48, Defensive became a type), 👎 Weak (5), 0 clears; pressing a label again removes it. Keys go to the selected clip, else the main-track clip under the playhead. The **scene row** under the clip bar has the same buttons, **Good for** positions (GK, CB, FB, DM, CM, AM, W, ST — `SCENE_ROLES`), the spoken notes (× removes one) and **Best first ↑**. Timeline clips show a coloured label badge and 🗣 when a scene has notes.
    - **Front of the reel** (`reorderV1`): Goal/Assist/Top move the scene into the leading block right after the intro — goals, then assists, then top scenes, keeping the editor's order inside each group. **Best first** stable-sorts the whole reel (goal, assist, top, rest, weak last). All one undo step each.
    - **Scene library** (`saveSceneLibrary`, runs after every full export — not social/range exports): writes one Firestore doc per scene to `sceneLibrary/{playerId}_{clipId}` (see Firestore Collections). Scenes deleted after Split scenes or after being labelled are recorded too (`outcome:"deleted"`) via the project's `sceneSeen` log, so the library learns what was thrown away as well as what was kept and where it ended up (`order`). A 160×90 JPEG still per scene (`sceneStills`), saved to IndexedDB (`sthumb:<clipId>`) at Split scenes or read at save time. Docs are overwritten on re-export, so they always reflect the final edit.
    - Step 3 (later): use the library to pre-sort new videos (browser image model comparing new scenes to past top scenes per position). Step 4 needs a server (Claude vision for goal/assist suggestions) — see the roadmap.
44. Voice (Oct 31 2026) — browser speech recognition (Chrome/Edge/Safari; in Chrome the audio goes to Google's speech service). Toolbar: **🎤 Voice**, **✎ Dictate**, language (EN / DE / PT, remembered). Or **hold ⌥ Option** (300ms, alone — Option+key stays a shortcut): in a text field it dictates, anywhere else it's a voice command. A red "Listening / Dictating" pill shows the live words; Done or releasing ⌥ finishes.
    - **Commands** (`parseVoice`, English/German/Portuguese): labels ("goal", "Tor", "assist", "very good / sehr gut / muito bom" → Top, "bad / weak" → Weak, "tackle / defensive" → Defensive), positions ("center back / Innenverteidiger / zagueiro" → CB, etc.), "move to the start / end", "delete / remove", "split scenes", "cut here", "freeze", "undo", "redo", "sort best first", and "play" / "pause" only when said alone ("great play" is praise). Whatever describes the scene is also saved word for word as a note → scene library. Applies to the selected scene, else the one under the playhead (decided when you start talking).
    - **Dictation** (`dictate`, `cleanDictation`): Wispr-style typing into the text field that had focus (caption, feedback, notes) with `execCommand("insertText")` so React state and ⌘Z work; drops um/uh/äh, turns "comma / period / new line" (and DE/PT) into punctuation, capitalises sentences, keeps mid-sentence inserts lowercase. With no text field it copies to the clipboard. Only inside the app — system-wide dictation needs Wispr Flow or macOS dictation.
    - Verified with a scripted recogniser in a test copy: "This is a very good scene for a center back" → Top · CB · moved to front · note; "bad scene, delete it" → Weak + deleted (kept in the library as deleted+weak); "remove this one" with only the playhead on a scene deleted it; ⌥ hold with ⌥+A pressed did not start; dictation produced "The first touch is really good, but he loses the ball after. Trim the end." in the feedback box and it was saved. Library save (Firestore stubbed) wrote 5 kept + 2 deleted docs with labels, positions, notes, order and 3–7 KB stills.

45. Frame-accurate editing (Nov 7 2026) — Caio: "video can be cut frame by frame".
    - Each video's real frame rate is measured once from presented-frame timestamps (`measureFps`, `fpsMap` by videoId, saved in localStorage `aua_fps`); 23.976 / 29.97 / 59.94 are used as the exact 24000/1001 etc. (`exactFps`).
    - **, / .** step exactly one frame of the clip under the playhead (Shift: 10), landing mid-frame (`frameStep`). Before, a step was 1/30s and the paused preview only re-seeked past 0.1s, so single-frame steps never showed; it now re-seeks past 0.01s.
    - Cuts (⌘B, blade, voice "cut here"), Q/W trims and dragged edges land on frame boundaries (`snapF`): a cut starts exactly on the frame the preview shows. Verified: shown frame 1768 → cut at frame 1768.00000.
    - Clock shows minutes:seconds:frame at the clip's rate plus an "fps" badge. Zoom goes to 1000 px/s (log slider, ×1.5 buttons); from ~5 px per frame the ruler shows a tick per frame and a band over the frame on screen. The fake waveform tiles as an SVG pattern past 400 bars so huge zooms stay light.
46. Detach audio + audio mixing (Nov 7 2026) — Caio: "extract music of videos" = pull the audio out (CapCut "Extract audio").
    - **Detach audio** in the clip bar (or voice "detach the audio / Ton trennen / separar o áudio"): the clip's sound becomes its own clip on the first audio track free over that span (a new track if none), same timing and volume; the video goes silent via `clip.audioDetached` (on the clip, so ⌘Z restores it). 🔇 marks it on the timeline; **Sound detached · Restore** gives the clip its sound back and removes the copy. Like CapCut the two are then independent — re-ordering the video doesn't move its sound, and the sound plays through freezes.
    - **Several audio clips now play at once** — before, preview and export each played only the first audio-track clip under the playhead, so music + detached sound couldn't mix. Preview: one `Audio` element per active clip (`audioPoolRef`). Export: one element + gain per audio-track clip into the master bus (`trackAud`, `mixTrackAudio`).
    - Audio-track clips (music, intro sound, detached sound) run on timeline time and keep playing through freezes in both preview and export. Before, the preview stopped the music at each freeze while the export didn't.
    - Verified in preview: video at volume 0, detached sound at source 55.49s in sync with the video at 55.49s, and a 440 Hz test tone on A2 playing at the same time. Verified in a real export (86s): 6–14s had the detached game sound (−20.8 dB) and the A2 tone (−36.3 dB) together; where no tone was on the timeline it measured −53/−55 dB (noise floor).
47. Split scenes v2 — same-field cuts (Nov 7 2026) — Caio: "identify when the scene changes but in the same game (field)" = cuts between two plays on similar-looking fields in an edited reel.
    - Second measure `sceneLocal`: 128×72 grey cut into 8×6 blocks, 1 − correlation per block, median over the blocks with detail (std > 4). A cut moves every player and line even on an identical field (≥ 0.21); a spotlight or overlay keeps the structure (≤ 0.14). A cut is accepted when either measure is ≥ its threshold and ≥ 8× the median of the 8 neighbouring frame steps (`SCENE.local`).
    - Thumbnails: the frame is halved on the GPU (exact 2×2 averages) to within 2× of 640×360, then block-averaged in JS — equal to ffmpeg area scaling for 720p/1080p/4K. A single bilinear shrink aliased enough to add 5 false cuts.
    - Neighbours are exact frames (clip fps from `fpsMap`, else estimated from the playback pass); sampling every 0.04s at 23.976 fps sometimes read the same frame twice, made the neighbours look calm and caused 6 false cuts. Cuts now land on frame boundaries.
    - Two cuts closer than 0.4s keep the clearer one (a hand swiping past the lens 3 frames before a real cut).
    - A hidden tab stops video decoding completely (even seeks return the old frame), so analysis pauses while hidden and the card says so; it continues when the tab is visible.
    - Tuned/verified by running the app's own detector code (extracted from index.html) in Node on every frame of two full reels: Luc Haller (319s, 33 hard cuts incl. 6 same-field, 14 spotlight/overlay effects) → 33/33, 0 false, all on the exact frame (before: 27/33). Adam Anaimi (311s, 30 fps, other editor) → 34 cuts, all checked by eye as real. Re-run in the browser on the full Luc reel (playback pass + refine, fps given): the same 33/33 on exact frames, 0 false, 147s including a pause while the window was hidden. Browser block values match the ffmpeg analysis within 0.001–0.026. Testing note: Python's http.server has no Range support, so a served file can't be seeked before it's fully loaded — test with a blob: URL.
48. Scene quality vs scene type (Nov 7 2026) — Caio wanted a middle tier ("good scenes, not the top ones, not weak") and tags like long balls, good pass, headers.
    - **Quality** (one per scene, `clip.scene.label`, keys 1–5): ⚽ Goal · 🎯 Assist · ⭐ Top scene · 👍 **Good** (new) · 👎 Weak. Goal/Assist/Top still jump to the front; Good stays where it is. Best first: goal, assist, top, good, untagged, weak.
    - **Type** (any number, `clip.scene.tags`, `SCENE_TAGS`): Header · Long ball · Good pass · Dribble · Shot · Defensive · Save — chips in the scene row, shown on the timeline clip, saved to the scene library as `tags`.
    - "Defensive" was a quality label (#43); it is a type now. `migrateScene` turns old `label:"defense"` into the Defensive tag when a project loads and when the library is written.
    - Voice: "great / very good / sehr gut / muito bom" → Top; plain "good / nice / solid / gut / bom" → Good; types by name in EN/DE/PT ("long ball / langer Ball / lançamento", "header / Kopfball / cabeçada", …). "Kopfballtor" splits into header + goal. Verified in the Studio: key 4 → Good without moving; "good long ball, header" → Good + Header + Long ball + note; Best first placed Good after Top and before untagged; an old Defensive label migrated to the tag.
49. AUSA Music library + set-piece types (Nov 7 2026).
    - Caio sent six songs (LaCie "Athletes USA Videos/Music For Videos"). Five are **Uppbeat** (Spring Air · Kidcut, Easy Start · RA, Juiciest · Mountaineer, Street Knowledge · Bosnow, New Life · Moire). Uppbeat's free plan is for solo creators and needs a per-video credit with a licence code, so they are **not** in the repo until AUSA has a paid Uppbeat plan. Only **Afro Beat · Kiravale** (Pixabay: commercial use, no credit) went in: `brand/music/afro-beat.m4a`, listed in `BRAND_MUSIC` (name, artist, file, dur, src).
    - Nov 7 2026, four more chosen by Caio from a Pixabay shortlist: Afro House x Afro Beat (Mastery) · 47643651, Afro House · ArtIssizm, Hip Hop – Upbeat · MusicForPeople, Happy Advertising Hip-Hop · BombinSound. The shortlist only had tracks **not** registered with YouTube Content ID (schema.org `additionalProperty` "Content ID Registered" on the Pixabay page) and skipped tracks named after real artists. Each `BRAND_MUSIC` entry keeps its Pixabay `page` as licence proof.
    - Afro Beat · Kiravale **is** Content ID registered (`contentId:true`): the shelf shows ⚠, and the tooltip says a YouTube/Instagram claim may come and should be disputed with the Pixabay licence.
    - Every song gets two-pass `loudnorm` to −16 LUFS integrated, true peak ≈ −1.5 dB, AAC 192k, with cover art and tags stripped (`-vn -map_metadata -1`). The sources were mastered at −7 to −11 LUFS.
    - `addBrandSong` places the song on the first audio track free from the end of the intro to the outro (a new track if none), since A1 can hold detached clip sound (#46).
    - New scene types: Free kick · Corner · Penalty (`SCENE_TAGS`), with voice words in EN/DE/PT ("free kick / Freistoß / cobrança de falta", "corner / Eckball / escanteio", "penalty / Elfmeter / pênalti"); "Freistoßtor" and "Elfmetertor" split into type + goal.
    - Verified: songs load and decode in the browser; double-click put a song on a new A3 (5.0 → 79.9s, the outro start) and it played 27.2s in at playhead 32.2s. Testing note: Python's plain http.server doesn't send Accept-Ranges, so audio isn't seekable there — use a Range-capable server.
50. Precise cutting like CapCut (Nov 10 2026) — Caio sent a screen recording of CapCut zooming into the timeline for precise cuts, plus two bugs.
    - **Bug: reopened projects were 2:00 long.** `loadProject` never called `recalcAll`, so `tlDur` kept its 120s default: the ruler stopped at 02:00 and clicks past it hit nothing. Now `loadProject` calls `recalcAll`, and an effect keeps `tlDur ≥ contentEnd + 30`. Verified: a 6:45 project reopens with the ruler to 7:10.
    - **Bug: pieces of a few frames couldn't be selected.** Each clip has two invisible 8px trim handles, so a clip under ~16px was all handle and a click always started an edge drag. Clips under 24px now get a 14px click area on top of their neighbours and no trim handles (handles are never wider than a quarter of the clip). Real leftovers (< `TINY_PIECE` 0.3s) are orange-striped with a tooltip ("7 frames (0.29s)"), and **Remove N tiny pieces** appears next to Close Gaps (one undo step, V1 closes up). Verified with a real click + Delete, and with the button.
    - **Filmstrip** (`FILM`, `filmGet`, `filmPump`, `filmTiles`): clips show pictures of their footage behind the label (player colour as a 3px top bar, white label on a dark gradient). Pictures are made by one hidden video per source (max 6), newest request first, cached as 164×92 JPEG object URLs (LRU 3000), only for the part of the timeline on screen (`tlView`). Zoomed out, tile times snap to a power-of-two grid so nearby zooms reuse pictures; at frame level each frame is one picture repeated across its width. Sources whose frames can't be read (no CORS) are skipped. It waits while the tab is hidden.
    - **Zoom**: `ZOOM_MAX` 4000 px/s (~130 px per frame at 30 fps). Zooming keeps the playhead at the same place on screen (centres it if it was off screen); a trackpad pinch (ctrl+wheel) zooms around the mouse. Verified: 3 → 4000 px/s in 20 steps with the playhead fixed at the same screen x. Ruler label spacing adapts (≥ 70px apart).
    - **Frame ruler**: from 5 px per frame, the ruler has a tick per frame of the V1 clips on screen, labelled "Nf" (spacing adapts: every 1/2/5/10… frames), a blue band over the frame on screen and a grey band following the mouse (direct DOM, no re-render). Clicking snaps the playhead to the start of that frame + 2 ms (`FRAME_IN`), and , / . land there too, so the red line sits on the frame's tick and ⌘B cuts exactly there. Verified: click → frame 2223 shown → cut at frame 2223.0000.
51. Blade cuts where you click (Nov 10 2026) — Caio: "the cutting feature is not working".
    - **Bug:** the Blade tool always cut at the playhead (`cutClip` read `playhead`), so clicking a clip the playhead wasn't on did nothing. ⌘B was fine. Now `cutClip(trackId,clipId,atT)` takes a time, and the blade cuts at the mouse (`timeAtMouse`: from ~4 px per frame, the start of the frame under the mouse). The playhead moves there, and an orange cut line follows the mouse while the blade is on (`bladeLineRef`, direct DOM).
    - **Bug found while testing:** after a cut, the preview could sit 3–4 frames off. A new pool video "warms up" on `loadeddata` by jumping to the clip start and playing 150ms, and when that clip was already on screen the warm-up overrode the requested frame. The pool sync now records the wanted time (`vel._want`); a video already on screen skips the warm-up and shows that frame. Paused, `showOnly` re-seeks past 0.01s (was 0.15s).
    - Verified at 4000 px/s: blade clicks cut at frames 5927 and 5930 exactly, and the preview showed 5927.048 / 5930.048 (start + 2 ms). Zoomed out: cut at the clicked spot (frame 4966). Playback after cuts: 1.92s in 2s.
52. "Why can't I cut in some places?" (Nov 10 2026) — Michael John's project (24 clips, 75 tags).
    - **Root cause: freeze time was counted two ways.** The layout counts only a clip's own freezes (`clipFreezeDur`); `freezeOffset(trackStart, t)` counted every resolved tag overlapping that stretch — freezes of clips on other tracks, old tags without a clip. Where they disagreed, the app put the playhead in another frame than the one shown, and a cut could land outside the piece and be refused silently. Reproduced with a 1.5s freeze on V2 over a V1 clip: the old maths would cut V1 1.5s (36 frames) from the click. `freezeOffset(clip, t)` now takes the clip and counts only its own freezes, and all 9 callers pass the clip (cut, Q/W, frame step, frame-at-time, preview, overlay/freeze placement, srcTimeAt). Verified: blade clicks after the V2 freeze cut at exactly the expected frames (2275, 2278, 2283).
    - ⌘B looked for the clip under the playhead using its length **without** freezes, so the last stretch of a clip with freezes (the freeze length) could never be cut with ⌘B. It now uses footage + freezes, and says "Put the red line on a clip to cut it" when there's nothing under it. Verified: ⌘B in a freeze tail cuts.
    - Cuts are never silently refused: "first frame of this piece", "last frame of this piece", and the AUSA intro/outro can't be cut ("part of the template"). The blade had cut the intro into slivers during testing.
    - Ruler frame ticks: one frame grid per stretch between a clip's freezes. A 1.5s freeze is rarely a whole number of frames, so one grid for the whole clip drifted after the first freeze.
    - Visible pieces: a 2px dark line at the start of every clip, and an orange flash (0.9s) where a cut lands.
    - Filmstrip black tiles (streamed Firebase videos): after "seeked" it now waits for `canplay` and the presented frame (`requestVideoFrameCallback`, 250ms cap), and never caches a picture taken with `readyState < 2`.
    - Sweep test: blade clicks every 9px across 1.6s at 790 px/s cut every frame (one per frame, the rest correctly no-ops on existing cuts).
53. ✨ Enhance + low-quality warning (Nov 11 2026) — Caio: athletes often send poor footage; "don't add anything that we need to pay for yet" (AI upscaling per minute of video is with his boss).
    - **Enhance** (clip bar, per source video: switching it on for one clip enhances every clip cut from that video; off removes it). `analyseEnhance` measures 6 frames (brightness, contrast, chroma) and stores `clipProps[id].enhance = {g, p, c, s, k}`: gamma toward 0.45 average (0.62–1.1), contrast around the new average (1–1.25), colour (chroma vs ~0.14 of good footage, 1–1.3), sharpening by resolution (≤480p 0.45, ≤720p 0.35, else 0.25).
    - Runs on the GPU (`createEnhancer`, a WebGL shader: unsharp → gamma → contrast → saturation). Canvas `filter: url(#svg)` sharpening measured ~400 ms per 1080p frame, unusable. Preview: an enhancer canvas over the visible video inside the zoom/pan box (`previewEnhRef`, rAF). Export: `drawVideoFit(…, enh)` draws the enhanced frame (`exportEnh`).
    - Tuning: a mid-grey contrast pivot cancelled the brightening on dark footage (+30% gain → +6% brightness), so it's a gamma curve with the pivot at the new average; 0.6 sharpening made 480p grass grainy, so it was lowered.
    - **Quality warning**: each video's size is probed (`resMap`, localStorage `aua_vres`); below 720p the clip shows "⚠ 480p" on the timeline and "⚠ Low quality (480p) — try Enhance" in the clip bar. ✨ marks enhanced clips.
    - Verified on a degraded test clip (480p, darker, desaturated, crf 33): preview brightness 0.226 → 0.365, contrast 0.172 → 0.212, sharpness ×4.5; a 36s export took 37s (no slowdown), no frozen stretches, 1080p at 29.3 fps; exported frame average luma 55 → 92 vs the source. It can't add detail a heavily compressed video doesn't have: real upscaling (Topaz Video AI, or a paid per-minute cloud service) is not built.
54. Why a scene is good + order by position (Nov 11 2026) — Caio: the setting matters (a full stadium catches recruiters even in a "Good" scene); order scenes by the player's position.
    - **Why** chips in the scene row (`SCENE_WHY`, `clip.scene.why`, any number, optional): 🏟 Big stadium, 📺 TV broadcast, 🔝 High level (Youth Bundesliga U17/U19, Regionalliga or higher), 🏆 Big game (derby, final, cup), 🎥 Great footage. **"→ all N scenes from this video"** gives the same reasons to every scene of that game (one undo step). Voice in EN/DE/PT ("full stadium", "TV game", "Youth Bundesliga", "Regionalliga", "derby", "volles Stadion", "jogo na TV"…). Shown as icons on the timeline; saved to the scene library as `why`.
    - **Best first** (`reorderV1(…,"best",…,role)`, role from the project player's first position): (1) opener: up to 2 (`OPENER_MAX`) scenes graded Good or better with 🏟/📺/🔝/🏆 (`ATTENTION`); (2) goals, assists, top, good — inside Top and Good by position (`ROLE_ORDER`): ST/W/AM shots & dribbles first, defensive last; CM passes & long balls first; FB/DM defensive, then dribble & shot (Caio: they assist and shoot going forward); CB defensive, header, long ball, then the rest; GK save first; then scenes with reasons first; (3) weak; (4) **untagged last** (Caio: after weak). The notice names the position and the number of openers.
    - Verified: order test on mixed scenes for ST/FB/CB matches the table; voice parse of 10 phrases; in the Studio "→ all 2 scenes" tagged the whole game, and a Good + 🏟 scene opened the reel while ungraded 🏟 scenes didn't.
55. Offline mode (Nov 11 2026) — Caio: "Can I work on a video when it is offline?" Before this the page couldn't even open without internet (React, Babel and Firebase load from CDNs).
    - **`sw.js`** (service worker, registered at the end of index.html on https/localhost): saves the app, icons, `brand/` files (outro, intro sound, all 5 songs) and the CDN libraries/fonts. index.html is internet-first (new pushes arrive immediately), the saved copy only without a connection. Brand files and songs are answered from the saved copy, including "Range" requests (cut from the whole file, so video/audio seek offline). Firebase Storage **pictures** fall back to the `ausa-media-v1` cache offline; videos are never routed through the worker. **Bump `VERSION` in sw.js when a brand file is replaced under the same name; add new songs to `APP_FILES`** (they're also saved the first time they play).
    - **Firestore offline copy**: `fbDb.enablePersistence({synchronizeTabs:true})`. Reads work offline (players load with `source:"cache"` when `navigator.onLine` is false), and changes made offline are sent when the internet is back, even after closing the tab.
    - **Save offline** (cloud-arrow button on each player row in the Studio sidebar): copies every video the player's project needs into the browser's video store (IndexedDB `aua_videodb`, where uploads from this computer already live — `hydratePlayerVideos` then uses them), plus their profile/action/extra photos and image clips into the offline picture cache. Streams with a live % and MB on the button; turns into a green ✓ when everything is on this computer. The open timeline switches to the saved copies immediately. Asks the browser for persistent storage (`navigator.storage.persist`).
    - **Offline badge** (bottom-left, every screen): amber "Offline — your work is saved on this computer"; green "Back online…" for 5s when the connection returns.
    - **Videos added offline**: an athlete upload with no internet skips the cloud (it used to retry for up to 10 min) and is kept on this computer; when the app is online again it uploads every player video that has no cloud link but is on this computer, then saves the player (`syncingRef` effect in App).
    - Verified in Chrome on a localhost test copy: the worker saved 13 app files + 8 libraries; with the server switched off a new tab opened the Studio from the saved copy, the AUSA outro played and seeked to 4s, a song loaded (132s); Save offline streamed Christian Frizzi's 27 videos with the % on the button. Not testable here: true airplane mode for Firestore (Firebase's documented offline behaviour) and the reconnect upload (would write to the real cloud).
56. Drag and drop from Finder (Nov 11 2026) — Caio: "if I have the video and the songs on my computer already… open the app offline, drag and drop the video and work on it?" Before, only pictures could be dropped (onto the intro); a dropped video made Chrome open the file in place of the app.
    - Drop anywhere on the Studio (`addFinderFiles`, window `dragover`/`drop` listeners; a dashed overlay explains where things go while dragging). Nothing is uploaded, so it works offline; files are kept in the browser's video store like Editor Media uploads.
    - **Videos** → Editor Media and the end of the reel (before the outro), sorted by file name ("1 …", "2 …"). On a video track with ⌥ held: at that exact spot, one after another.
    - **Songs** → Editor Media and under the reel like an AUSA song (`addBrandSong`, first free audio track); extra songs stay in Editor Media. Dropped on a music track: at that time, on that track, or the next free track (a new one if needed) when something already plays there.
    - **Pictures** → Editor Media; the first fills an empty intro. Other files are skipped and counted. The notice says what went where; errors show as a notice too.
    - `afterRender` waits for a frame **or** 40 ms: frames stop when the window is in the background, which stalled the first drop after a reload.
    - Verified in a test copy with simulated Finder drops: two videos + a song + a .txt in one drop → videos at 5.00 and 11.06 in name order before the outro, song 5.00–15.22 under the reel, 1 file skipped; a picture became the intro; a song dropped on A1 where music already plays went to a new A2 at the drop time.
---

## Roadmap agreed with Caio (Sept 25 2026)

- **Storage:** this app uses **Firebase** (project `athletes-usa`), not Supabase. Caio's boss's platform (which Caio does not have full access to) will provide storage, logins and player profiles — confirm which backend it is before building integrations.
- **Logins & profiles come from the platform.** Athletes see only their portal; editors see everything. Drop this app's own studio password and athlete profile form once connected.
- **Delivery with review.** Export → editor reviews internally → explicit **"Job done / Send to athlete"** step → reel saved onto the player's profile on the platform. Nothing reaches the athlete before that approval.
- **Brand library:** Caio will supply the outro. The intro is a designed thumbnail image + the outro's sound. Shared across editors, one-click intro + outro.
- **Future:** a short promo snippet generated from each finished reel for AUSA social media; vertical 9:16 export; notifications; separate coach/social cuts.

---

## Feedback Workflow (IMPORTANT)

When starting a new session, the AI assistant should:
1. **Read feedback from Firestore** — query the `feedback` collection to check for new submissions
2. **Present feedback to Caio** — summarize what users reported (bugs, feature requests, praise)
3. **Ask permission before making changes** — never auto-fix based on feedback; always get Caio's approval first
4. Learn from reported issues to avoid repeating the same mistakes

---

## Known Issues / Pending Tasks

1. **Export tag/freeze rendering** — Reworked Sept 2026 (see Features #30). Black frames at cuts/freezes traced to unguarded seeks; now covered by a hold-frame buffer. **Not yet verified against a real export** — needs a test render.
2. **Firebase Security Rules — URGENT, NOT just hardening.** Verified Sept 9 2026 against the live site:
   - The `players` collection is **world-readable, unauthenticated**. An anonymous `GET` to the Firestore REST endpoint returns every athlete document, including `name`, `dob`, and `phone`. These are minors. This is a live data-exposure problem, not a todo.
   - The app performs **no Firebase Auth at all** (no `signInAnonymously`, no `getAuth`), so any rule requiring `request.auth != null` will break the whole app until sign-in is added. Rules and anonymous auth must land together.
   - The `status` and `batches` collections are already denied by default (no matching rule), so the batch/progress features from commits `34fd3ea`/`6af5eab` are **silently broken in production** — console shows `permission-denied` on every load.
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
- **Never compact the timeline with a `tagTrack` read from a closure.** `setTagTrack` is async, so any function calling `compactV1()` right after changing tags sees the previous tag list and lays out V1 without the freeze time that was just added or removed. Pass the new tag track explicitly (`compactV1(nextTags)`); `tagTrackRef.current` covers callbacks created in an earlier render, like drag mouseup handlers.
- **Effective clip duration = raw duration + `clipFreezeDur(clip, tagClips)`.** Use that one helper everywhere. Three hand-rolled copies of this calculation had drifted apart and disagreed, which is how clips ended up overlapping.
- **Watch for a key declared twice in one inline style object.** React/JS keeps the *last* one silently — no warning, no error. A duplicated `position` (absolute then relative) made every timeline clip fall into normal flow and wrap onto a new line, which looked like a track-assignment bug for weeks. Worth a quick scan of a style literal before hunting logic when something is misplaced rather than misbehaving.
- **Never leave the export canvas cleared-but-undrawn.** Setting `currentTime` starts an async seek; the element has no frame to draw for several rAF ticks, and the cleared canvas records as black. Hold the previous frame (`paintHold()`) whenever `drawVideoFit` returns false.

---

## Git Info

- **Total commits:** 47+
- **Branch:** main
- **Remote:** `https://github.com/caiomazzocm-dotcom/Athletes-USA-Highlights-app.git`
- **Push from terminal:** `cd ~/Desktop/Athletes-USA-Highlights-app && git push`

---

*Last updated: September 9, 2026*
