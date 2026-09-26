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
    - **AUSA Music** (`BRAND_MUSIC`, shown in Editor Media when non-empty): double-click places a song on A1 from the end of the intro to the start of the outro (`addBrandSong`); drag works too. Files go in `brand/music/`. **Empty until Caio sends songs** — each should be loudness-matched with ffmpeg `loudnorm` when added. Tested with a generated 440 Hz tone that only existed in the test copy.

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
