# ArchiveVJ

ArchiveVJ is a mobile-first browser VJ mixer using video from the Internet Archive.

## v0.1 MVP

- Two independent video decks
- Independent Internet Archive search for Deck A and Deck B
- Search results load directly into the selected deck
- A/B crossfader
- Play/pause, loop and playback-rate controls
- Floating, draggable search panels
- Responsive desktop and phone layout
- Fullscreen output control

## Run

Requires a current Node.js/npm installation.

```bash
npm install
npm run dev
```

Vite will print the local development address. To test from a phone on the same LAN, run:

```bash
npm run dev -- --host
```

Then open the LAN address printed by Vite on the phone.

## Build

```bash
npm run build
npm run preview
```

## GitHub

```bash
git init
git add .
git commit -m "ArchiveVJ v0.1 MVP"
git branch -M main
git remote add origin YOUR_GITHUB_REPOSITORY_URL
git push -u origin main
```

## Media behaviour

ArchiveVJ searches Internet Archive movie records, reads item metadata, and selects a browser-playable MP4 candidate. Archive items vary in encoding, file size and rights metadata, so individual results may not be suitable for live playback.

## Roadmap

Next releases: persistent crates/history, PWA installation, WebGL renderer, effects rack, audio-reactive controls, MIDI, performance mode and recording.
