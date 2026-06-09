# shader-arsenal-presets

A working arsenal of hand-crafted, high-fidelity, audio-reactive GLSL presets curated by **Kai Djuric**.

These presets are compatible with WebGL/WebGL2, Three.js, Synesthesia, and any standard shader pipeline. Each preset exposes unified uniforms:

- `u_time` (float): Elapsed time in seconds.
- `u_resolution` (vec2): Render target dimensions.
- `u_mouse` (vec2): Mouse coordinates.
- `u_bass`, `u_mid`, `u_treble`, `u_level` (float): Real-time audio frequency bands.

## Installation

```bash
npm install shader-arsenal-presets
```

## Usage

### In Modern JS/ESM (Vite, Next.js, Rollup, webpack)

You can import any preset directly as a JavaScript string:

```javascript
import { audioReactivePlasma, audioWaveformTunnel } from 'shader-arsenal-presets';

// Use it directly in your Three.js ShaderMaterial:
const material = new THREE.ShaderMaterial({
  fragmentShader: audioReactivePlasma,
  uniforms: {
    u_time: { value: 0 },
    u_resolution: { value: new THREE.Vector2() },
    u_bass: { value: 0 },
    u_mid: { value: 0 },
    u_treble: { value: 0 },
  }
});
```

### In CommonJS (Node.js)

```javascript
const { audioReactivePlasma } = require('shader-arsenal-presets');
```

### Accessing Raw GLSL Files

Raw `.glsl` source files are also bundled within the package under `/presets/`:

```javascript
// Webpack or Vite using raw-loader or similar:
import rawPlasmaShader from 'shader-arsenal-presets/presets/audio-reactive-plasma.glsl?raw';
```

## Available Presets

- `audio-kaleidoscope` (imported as `audioKaleidoscope`)
- `audio-neon-cyberpunk` (imported as `audioNeonCyberpunk`)
- `audio-pulse-mandelbrot` (imported as `audioPulseMandelbrot`)
- `audio-quantum-tunnel` (imported as `audioQuantumTunnel`)
- `audio-reactive-DNA` (imported as `audioReactiveDna`)
- `audio-reactive-cityscape` (imported as `audioReactiveCityscape`)
- `audio-reactive-fire` (imported as `audioReactiveFire`)
- `audio-reactive-glitch` (imported as `audioReactiveGlitch`)
- `audio-reactive-noise-field` (imported as `audioReactiveNoiseField`)
- `audio-reactive-ocean` (imported as `audioReactiveOcean`)
- `audio-reactive-plasma` (imported as `audioReactivePlasma`)
- `audio-reactive-voronoi` (imported as `audioReactiveVoronoi`)
- `audio-soundwave-star` (imported as `audioSoundwaveStar`)
- `audio-vortex-nebula` (imported as `audioVortexNebula`)
- `audio-waveform-tunnel` (imported as `audioWaveformTunnel`)
- `audio-waveform-water` (imported as `audioWaveformWater`)

## License

MIT
