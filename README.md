# SHADER ARSENAL — Lygia Live Audio Demo

Interactive audio‑reactive shader playground built with WebGL and the LYGIA shader library.  
Speak, sing, or play music into your mic and watch the warps respond in real time. [page:11][web:13]

## Demo

Live demo: https://shader-arsenal.vercel.app/demo/audio [page:11]

Click **ENABLE MIC** in the canvas viewport to let the shaders listen to your microphone input.  
The audio analyser sends `u_bass`, `u_mid`, `u_treble`, and `u_level` uniforms into the shader so the visuals pulse with the sound. [page:11]

## Features

- 27 audio‑reactive presets (nebulae, plasma warps, synthwave grids, mandalas, tunnels, cityscapes, fire, ocean waves, etc.). [page:11]
- Smooth band‑mapped animation driven by bass/mid/treble levels.
- Real‑time uniform controls for `u_speed`, `u_zoom`, and `u_contrast`. [page:11]
- Mouse interaction to shift hotspots and warp focus. [page:11]
- Runs entirely in the browser — perfect for sharing clips on social or streaming overlays.

### Preset examples

- **Sovereign Signal** — band‑mapped FBM plasma warp. [page:11]  
- **Neon Cybergrid** — synthwave horizon grid. [page:11]  
- **Cosmic Nebula** — swirling plasma clouds. [page:11]  
- **Quantum Fractal** — Mandelbrot sound orbit. [page:11]  
- **Fire Dance** — procedural sound‑driven flames. [page:11]  
- **Ocean Waves** — wavy sea surface beats. [page:11]  

_(…and many more in the preset selector.)_ [page:11]

## Getting Started

### Prerequisites

- Modern browser with WebGL and microphone permissions enabled.
- Node.js and npm (or pnpm/yarn) if you want to run or hack the project locally. [web:13]

### Local development

```bash
# clone the repo
git clone <THIS_REPO_URL>
cd <THIS_REPO_FOLDER>

# install dependencies
npm install

# start dev server
npm run dev
# or: npm run start / npm run preview (depending on framework)
```

Then open the printed local URL (usually `http://localhost:3000` or similar) in your browser.  
Click **ENABLE MIC**, choose a preset, and play some audio. [page:11]

> Tip: drop `u_speed` to around `0.3` and play bass‑heavy music for slower cinematic warps. [page:11]  
> Tip: push `u_zoom` high to dive into geometric mandala modes. [page:11]

## Controls

### Audio

- **ENABLE MIC** — activates the microphone and analyser node.
- **Band uniforms**:
  - `u_bass` — low‑frequency energy.
  - `u_mid` — midrange.
  - `u_treble` — highs.
  - `u_level` — overall loudness. [page:11]

### Visual uniforms

- `u_speed` — global animation speed (slider range up to 4.0). [page:11]  
- `u_zoom` — zoom / depth into the scene (0.5–8.0). [page:11]  
- `u_contrast` — contrast / punch of the image (0.2–2.5). [page:11]

### Interaction

- Move the mouse over the canvas to shift hotspots and focus areas. [page:11]
- Combine slow `u_speed` with high `u_zoom` for deep mandala / tunnel modes. [page:11]

## Tech Stack

- WebGL / GLSL shaders.
- [LYGIA Shader Library](https://lygia.xyz/) for reusable shader functions and effects. [web:13]
- JavaScript/TypeScript frontend (framework: React/Vue/Svelte/etc. depending on repo).
- Audio processing via the Web Audio API (AnalyserNode). [page:11]

## How to Record and Post Clips

This repo is perfect for sharing trippy sound‑reactive visuals on social, streaming, or with your own music.

1. **Prepare audio**
   - Play your track from your DAW, music player, or instrument.
   - Make sure the mic picks up enough bass/mids/highs.

2. **Set up the shader**
   - Open the demo or local dev server.
   - Click **ENABLE MIC** and choose a preset.
   - Tune `u_speed`, `u_zoom`, `u_contrast` until it feels right. [page:11]

3. **Record**
   - Use screen recording:
     - macOS: QuickTime or Command+Shift+5.
     - Windows: OBS Studio or built‑in Game Bar.
   - Optional: capture mic audio along with system audio for live performance.

4. **Post**
   - Trim the clip and export (9:16 or 16:9).
   - Tag with something like `#ShaderArsenal` / `#Lygia` / `#AudioReactive`. [web:13]
   - If you’re posting music, add artist and track credits.

## Contributing

If you want to add presets or tweak shaders:

- Clone the repo and create a new branch.
- Add a new preset entry, shader file, or uniform.
- Test locally with different audio sources.
- Open a pull request with a short video/gif preview if possible.

Ideas:

- New Belgrade‑inspired city presets (bridges, skylines, club lights).
- Audio‑reactive typography, grids, or waveform‑based tunnels.
- Presets themed around specific genres (ambient, drum & bass, synthwave).

## Credits

- Built with the [LYGIA Shader Library](https://lygia.xyz/) by Patricio Gonzalez Vivo. [web:13]
- Audio demo preset copy inspired by the Lygia ecosystem and live shader performances. [page:11]
- Repo and demo by Kai and friends — feel free to fork, remix, and share.
