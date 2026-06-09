export interface DemoPreset {
  name: string;
  subtitle: string;
  code: string;
}

export const DEMO_PRESETS: DemoPreset[] = [
  {
    name: "Sovereign Signal",
    subtitle: "FBM Plasma Warp",
    code: `// Sovereign Signal — audio-reactive band-mapped FBM plasma
uniform float u_speed;     // master time multiplier
uniform float u_zoom;      // base scale
uniform float u_contrast;  // output gain

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 6; i++) {
    v += a * noise(p);
    p *= 2.02;
    a *= 0.5;
  }
  return v;
}

vec3 hsv2rgb(vec3 c) {
  vec4 K = vec4(1.0, 2.0/3.0, 1.0/3.0, 3.0);
  vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
  return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution) / min(u_resolution.x, u_resolution.y);
  float t = u_time * u_speed;

  vec2 q = vec2(fbm(uv * u_zoom + t * 0.15),
                fbm(uv * u_zoom + vec2(3.7, 1.2) + t * 0.12));
  vec2 r = vec2(fbm(uv * u_zoom + 2.0 * q + vec2(1.7, 9.2) + 0.15 * t),
                fbm(uv * u_zoom + 2.0 * q + vec2(8.3, 2.8) + 0.126 * t));
  float f = fbm(uv * u_zoom + 2.0 * r);

  float hue = fract(t * 0.05 + r.x * 0.6 + u_mid * 0.4);
  float sat = clamp(0.7 + u_bass * 0.6 + u_treble * 0.2, 0.0, 1.0);
  vec3 col = hsv2rgb(vec3(hue, sat, pow(f, 1.5)));

  col += vec3(0.0, 0.8, 1.0) * u_bass * 0.4 * smoothstep(0.0, 0.5, f);
  col += vec3(1.0, 0.3, 0.9) * u_treble * 0.3 * (1.0 - smoothstep(0.0, 0.5, f));

  float md = length(uv - (u_mouse * 2.0 - 1.0) * vec2(u_resolution.x / u_resolution.y, 1.0));
  col += vec3(1.0, 0.85, 0.5) * 0.25 * exp(-md * 6.0) * (0.5 + u_level * 1.5);

  float scan = 0.94 + 0.06 * sin(gl_FragCoord.y * 2.5 + t * 4.0);
  col *= scan;
  float grain = (hash(gl_FragCoord.xy + t) - 0.5) * 0.04;
  col += grain;

  col *= u_contrast;
  outColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}
`
  },
  {
    name: "Neon Cybergrid",
    subtitle: "Synthwave Horizon",
    code: `// Neon Cybergrid — perspective synthwave grid reacting to audio frequencies
uniform float u_speed;
uniform float u_zoom;
uniform float u_contrast;

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution) / min(u_resolution.x, u_resolution.y);
  float t = u_time * u_speed;
  
  // Warp space with mids
  uv.x += sin(uv.y * 5.0 + t) * u_mid * 0.1;
  
  // Grid perspective math
  float perspective = 1.0 / (abs(uv.y) + 0.05);
  
  // Apply zoom uniform to grid density
  float gridX = sin(uv.x * (5.0 + u_zoom * 2.0) * perspective + t * 0.4);
  float gridY = sin(perspective * (4.0 + u_zoom) - t * 2.0);
  
  // Grid line thickness modulated by bass frequency
  float thickness = 0.95 - (u_bass * 0.03);
  float lines = smoothstep(thickness, 1.0, gridX) + smoothstep(thickness, 1.0, gridY);
  
  // Cyberpunk colors: Pink and Cyan
  vec3 pink = vec3(1.0, 0.0, 0.65);
  vec3 cyan = vec3(0.0, 0.85, 1.0);
  
  // Blend colors based on coordinates and level
  vec3 neon = mix(pink, cyan, sin(uv.y * 3.0 + t) * 0.5 + 0.5);
  vec3 finalColor = lines * neon * (1.0 + u_bass * 1.0);
  
  // Central horizon glow driven by audio levels
  float glow = exp(-abs(uv.y) * 6.0) * (0.3 + u_level * 0.7);
  finalColor += pink * glow;
  
  finalColor *= u_contrast;
  outColor = vec4(clamp(finalColor, 0.0, 1.0), 1.0);
}
`
  },
  {
    name: "Cosmic Nebula",
    subtitle: "Swirling Plasma Clouds",
    code: `// Cosmic Nebula — fluid swirl nebula reacting to audio levels
uniform float u_speed;
uniform float u_zoom;
uniform float u_contrast;

float noise2(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution) / min(u_resolution.x, u_resolution.y);
  float t = u_time * u_speed;
  
  // Vortex rotation
  float r = length(uv);
  float theta = atan(uv.y, uv.x);
  float angle = theta + r * u_zoom - t * 0.2 - u_bass * 0.3;
  
  // Reconstruct UV coordinates based on vortex rotation
  vec2 rotUv = vec2(r * cos(angle), r * sin(angle));
  
  // Synthesize gas layers
  float f1 = sin(rotUv.x * 4.0 + t) * cos(rotUv.y * 4.0 - t * 0.8);
  float f2 = sin(rotUv.y * 8.0 - t * 1.5) * cos(rotUv.x * 8.0 + t) * u_mid;
  float gas = f1 + 0.5 * f2;
  
  // Color palette
  vec3 colA = vec3(0.9, 0.1, 0.5); // Warm pink
  vec3 colB = vec3(0.1, 0.2, 0.8); // Deep space blue
  vec3 colC = vec3(0.0, 0.9, 0.8); // Cyan highlights
  
  vec3 color = mix(colB, colA, gas * 0.5 + 0.5);
  color += colC * max(0.0, gas * gas) * u_treble * 0.6;
  
  // Core glow
  float core = 0.06 / (r + 0.01) * (1.0 + u_bass * 0.6);
  vec3 finalColor = color * (1.0 - r) + core * vec3(0.85, 0.8, 1.0);
  
  finalColor *= u_contrast;
  outColor = vec4(clamp(finalColor, 0.0, 1.0), 1.0);
}
`
  },
  {
    name: "Quantum Fractal",
    subtitle: "Mandelbrot Sound Orbit",
    code: `// Quantum Fractal — dynamic Julia/Mandelbrot orbits warped by audio frequencies
uniform float u_speed;
uniform float u_zoom;
uniform float u_contrast;

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution) / min(u_resolution.x, u_resolution.y);
  float t = u_time * u_speed;
  
  // Adjust zoom
  vec2 z = uv * (1.5 / u_zoom);
  
  // Constant complex parameter (Julia set) animated by audio
  vec2 c = vec2(-0.7 + 0.1 * sin(t * 0.1), 0.27015 + u_mid * 0.08);
  
  float n = 0.0;
  const float max_iter = 40.0;
  
  // Fractal iterator loop
  for (float i = 0.0; i < max_iter; i++) {
    // z = z^2 + c
    float x = (z.x * z.x - z.y * z.y) + c.x;
    float y = (2.0 * z.x * z.y) + c.y;
    z = vec2(x, y);
    if (dot(z, z) > 4.0) {
      n = i;
      break;
    }
  }
  
  // Colorize based on iterations and bass
  float factor = n / max_iter;
  vec3 col = vec3(0.0);
  if (n > 0.0) {
    col.r = 0.5 + 0.5 * sin(factor * 12.0 + t + u_bass * 2.0);
    col.g = 0.5 + 0.5 * sin(factor * 12.0 + t + u_bass * 2.0 + 2.0);
    col.b = 0.5 + 0.5 * sin(factor * 12.0 + t + u_bass * 2.0 + 4.0);
  }
  
  // Add inner core glow for audio level
  float innerGlow = exp(-length(z) * 0.2) * u_level * 0.8;
  col += vec3(0.1, 0.9, 1.0) * innerGlow;
  
  col *= u_contrast;
  outColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}
`
  },
  {
    name: "Helix Helix",
    subtitle: "3D DNA Spiral Waves",
    code: `// Helix Helix — 3D DNA-like rotating strands deforming to soundwaves
uniform float u_speed;
uniform float u_zoom;
uniform float u_contrast;

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution) / min(u_resolution.x, u_resolution.y);
  float t = u_time * u_speed;
  
  uv *= u_zoom;
  
  // Helix equation
  float helixSpeed = t * 2.0;
  float wave = sin(uv.x * 2.0 + helixSpeed) * (0.4 + u_bass * 0.2);
  float wave2 = -sin(uv.x * 2.0 + helixSpeed) * (0.4 + u_bass * 0.2);
  
  // Distances to helix strands
  float dist1 = abs(uv.y - wave);
  float dist2 = abs(uv.y - wave2);
  
  // Glow thickness driven by treble
  float thickness = 0.02 + u_treble * 0.03;
  float glow1 = thickness / (dist1 + 0.015);
  float glow2 = thickness / (dist2 + 0.015);
  
  // Color components
  vec3 color1 = vec3(0.0, 0.7, 1.0) * glow1; // Cyan strand
  vec3 color2 = vec3(1.0, 0.3, 0.2) * glow2; // Orange strand
  
  vec3 finalColor = color1 + color2;
  
  // Connecting bar grids
  float bars = sin(uv.x * 8.0 + helixSpeed);
  bars = step(0.96, abs(bars));
  float barRange = step(uv.y, max(wave, wave2)) * step(min(wave, wave2), uv.y);
  finalColor += vec3(1.0, 0.8, 0.1) * bars * barRange * (0.1 / (abs(uv.y) + 0.05)) * (0.5 + u_mid * 0.5);
  
  finalColor *= u_contrast;
  outColor = vec4(clamp(finalColor, 0.0, 1.0), 1.0);
}
`
  },
  {
    name: "Digital Glitch",
    subtitle: "Static Noise Bars",
    code: `// Digital Glitch — scanner lines with sound-driven horizontal pixel offsets
uniform float u_speed;
uniform float u_zoom;
uniform float u_contrast;

float noiseLine(float y) {
  return fract(sin(y * 12345.67) * 43758.54);
}

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution) / min(u_resolution.x, u_resolution.y);
  float t = u_time * u_speed;
  
  // Trigger glitches on heavy bass
  float glitchTrigger = step(0.65, u_bass) * u_level;
  
  // Horizontal distortion lines
  float lineOffset = noiseLine(floor(uv.y * (10.0 * u_zoom) + t * 5.0)) - 0.5;
  uv.x += lineOffset * glitchTrigger * 0.3;
  
  // Basic wave shape
  float wave = sin(uv.y * 3.0 + t) * 0.4;
  float lineDist = abs(uv.x - wave);
  float scanlineGlow = 0.015 / (lineDist + 0.02);
  
  // Main neon beam
  vec3 beamColor = mix(vec3(0.0, 1.0, 0.5), vec3(1.0, 0.0, 1.0), glitchTrigger);
  vec3 col = beamColor * scanlineGlow;
  
  // Add background grid static
  float gridLines = sin(uv.y * (40.0 * u_zoom)) * sin(uv.x * (40.0 * u_zoom));
  col += vec3(0.1, 0.2, 0.4) * step(0.95, gridLines) * (0.3 + u_mid * 0.5);
  
  // Random glitch color splitting
  if (glitchTrigger > 0.0) {
    col.r += 0.03 / abs(uv.x - wave - 0.05);
    col.b += 0.03 / abs(uv.x - wave + 0.05);
  }
  
  col *= u_contrast;
  outColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}
`
  },
  {
    name: "Mandala Kaleidoscope",
    subtitle: "Infinite Mirror Geometry",
    code: `// Mandala Kaleidoscope — mirror reflection symmetry mapped onto audio levels
uniform float u_speed;
uniform float u_zoom;
uniform float u_contrast;

#define PI 3.14159265

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution) / min(u_resolution.x, u_resolution.y);
  float t = u_time * u_speed;
  
  // Convert to polar
  float r = length(uv);
  float a = atan(uv.y, uv.x);
  
  // Kaleidoscope sections (zoom controls count)
  float segments = 4.0 + floor(u_zoom);
  a = mod(a, 2.0 * PI / segments) - PI / segments;
  a = abs(a);
  
  // Re-project back to Cartesian
  vec2 foldUv = r * vec2(cos(a), sin(a));
  
  // Concentric radial waves reacting to bass
  float ring = sin(foldUv.x * 20.0 - t * 4.0) * cos(foldUv.y * 20.0);
  ring = smoothstep(0.1 - u_bass * 0.1, 0.9 + u_bass * 0.1, abs(ring));
  
  // Rainbow spectrum mapping
  vec3 color = 0.5 + 0.5 * cos(foldUv.x * 4.0 + t + vec3(0.0, 2.0, 4.0));
  vec3 finalColor = color * ring * (0.8 + u_mid * 0.4);
  
  // Center pulse
  float center = 0.05 * (1.0 + u_bass * 1.5) / (r + 0.015);
  finalColor += vec3(1.0, 0.7, 0.3) * center;
  
  finalColor *= u_contrast;
  outColor = vec4(clamp(finalColor, 0.0, 1.0), 1.0);
}
`
  },
  {
    name: "Quantum Ripples",
    subtitle: "Soundwave Water Rings",
    code: `// Quantum Ripples — interactive fluid ripple concentric structures reacting to level
uniform float u_speed;
uniform float u_zoom;
uniform float u_contrast;

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution) / min(u_resolution.x, u_resolution.y);
  float t = u_time * u_speed;
  
  float dist = length(uv);
  
  // Concentric wave ripple equation
  float wave = sin(dist * (10.0 * u_zoom) - t * 5.0) * (0.1 + u_bass * 0.3);
  
  // Warp UV by the wave ripple
  uv += (uv / (dist + 0.01)) * wave;
  
  // Compute color based on distorted coordinates
  float f = sin(uv.x * 12.0) * cos(uv.y * 12.0);
  f = smoothstep(0.0, 0.7, abs(f));
  
  vec3 coldBlue = vec3(0.0, 0.4, 0.95);
  vec3 hotMagenta = vec3(0.95, 0.0, 0.6);
  
  vec3 finalColor = mix(coldBlue, hotMagenta, sin(dist * 5.0 + t) * 0.5 + 0.5);
  finalColor = finalColor * f * (0.8 + u_mid * 0.4);
  
  // High-frequency treble highlights on peaks
  finalColor += vec3(1.0, 1.0, 1.0) * max(0.0, wave * 1.5) * u_treble;
  
  finalColor *= u_contrast;
  outColor = vec4(clamp(finalColor, 0.0, 1.0), 1.0);
}
`
  },
  {
    name: "Soundwave Starburst",
    subtitle: "Explosive Audio Spike Rays",
    code: `// Soundwave Starburst — explosive audio ray spikes extending radially
uniform float u_speed;
uniform float u_zoom;
uniform float u_contrast;

#define PI 3.14159265

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution) / min(u_resolution.x, u_resolution.y);
  float t = u_time * u_speed;
  
  float r = length(uv);
  float a = atan(uv.y, uv.x);
  
  // Starburst spike density governed by zoom
  float numRays = 8.0 + floor(u_zoom * 2.0);
  
  // Ray thickness deforms with high treble
  float rayPattern = sin(a * numRays + t * 3.0) * (0.05 + u_mid * 0.1);
  
  // Distance field from ray circle boundaries
  float radius = 0.25 + u_bass * 0.2;
  float dist = abs(r - radius - rayPattern);
  
  float glow = (0.006 + u_treble * 0.012) / (dist + 0.008);
  
  vec3 colorOrange = vec3(1.0, 0.5, 0.0);
  vec3 colorCyan = vec3(0.0, 0.8, 1.0);
  vec3 col = mix(colorCyan, colorOrange, sin(a * 2.0 + t) * 0.5 + 0.5) * glow;
  
  // Inner core energy
  float core = 0.03 * (1.0 + u_bass * 3.0) / (r + 0.005);
  col += vec3(1.0, 0.9, 0.7) * core;
  
  col *= u_contrast;
  outColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}
`
  },
  {
    name: "Voronoi Grid Beats",
    subtitle: "Structural Energy Cells",
    code: `// Voronoi Grid Beats — organic cell grid boundaries deforming dynamically with music
uniform float u_speed;
uniform float u_zoom;
uniform float u_contrast;

vec2 hash2(vec2 p) {
  return fract(sin(vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)))) * 43758.5453);
}

float voronoi(vec2 x, float t) {
  vec2 n = floor(x);
  vec2 f = fract(x);
  
  float min_dist = 8.0;
  
  for (int j = -1; j <= 1; j++) {
    for (int i = -1; i <= 1; i++) {
      vec2 g = vec2(float(i), float(j));
      vec2 o = hash2(n + g);
      
      // Animate points with audio and time
      o = 0.5 + 0.5 * sin(t + 6.2831 * o + u_bass * 1.5);
      
      vec2 r = g + o - f;
      float d = dot(r, r);
      
      if (d < min_dist) {
        min_dist = d;
      }
    }
  }
  return sqrt(min_dist);
}

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution) / min(u_resolution.x, u_resolution.y);
  float t = u_time * u_speed;
  
  // Voronoi density governed by zoom
  float val = voronoi(uv * (2.0 + u_zoom), t);
  
  // Boundary outlines
  float outline = smoothstep(0.1, 0.02, abs(val - 0.5));
  
  // Color transitions driven by mids and levels
  vec3 neonGreen = vec3(0.0, 1.0, 0.6);
  vec3 deepViolet = vec3(0.3, 0.0, 0.7);
  
  vec3 col = mix(deepViolet, neonGreen, val);
  col += vec3(1.0, 1.0, 1.0) * outline * (u_mid + 0.2);
  
  // Spotlight effect
  col *= 1.2 - length(uv);
  
  col *= u_contrast;
  outColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}
`
  },
  {
    name: "Symmetric equalizer",
    subtitle: "Rise & Fall Sound Bars",
    code: `// Symmetric Equalizer — audio bars mimicking real-time mechanical spectrum visualizer
uniform float u_speed;
uniform float u_zoom;
uniform float u_contrast;

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution) / min(u_resolution.x, u_resolution.y);
  float t = u_time * u_speed;
  
  // Mirror x axis
  uv.x = abs(uv.x);
  
  // Discrete column index governed by zoom
  float cols = 5.0 + floor(u_zoom * 2.0);
  float colIdx = floor(uv.x * cols);
  float colFrac = fract(uv.x * cols);
  
  // Calculate height limit based on columns and frequencies
  float maxH = 0.0;
  if (colIdx == 0.0) maxH = u_bass * 0.8;
  else if (colIdx == 1.0) maxH = mix(u_bass, u_mid, 0.5) * 0.7;
  else if (colIdx == 2.0) maxH = u_mid * 0.6;
  else if (colIdx == 3.0) maxH = mix(u_mid, u_treble, 0.5) * 0.5;
  else if (colIdx == 4.0) maxH = u_treble * 0.4;
  else maxH = u_level * 0.3;
  
  maxH += 0.05; // Base height limit
  
  // Vertical column boundary limits
  float colMask = step(colFrac, 0.85) * step(uv.x * cols, cols);
  
  // Draw indicator cells (equalizer bars)
  float cellCount = 12.0;
  float cellFrac = fract(uv.y * cellCount);
  float cellIdx = floor(uv.y * cellCount);
  
  // Vertical height cutoff mask
  float heightMask = step(uv.y, maxH) * step(-maxH, uv.y);
  
  // Cell line separating margins
  float cellBorder = step(cellFrac, 0.8);
  
  // Neon gradient colors: Green -> Yellow -> Red
  vec3 col = vec3(0.0);
  if (uv.y > 0.3) {
    col = vec3(1.0, 0.1, 0.1); // Red peaks
  } else if (uv.y > 0.1) {
    col = vec3(1.0, 0.9, 0.1); // Yellow mids
  } else {
    col = vec3(0.0, 1.0, 0.5); // Green base
  }
  
  vec3 finalColor = col * colMask * heightMask * cellBorder;
  
  // Add background grid scan lines
  finalColor += vec3(0.05, 0.05, 0.1) * colMask * cellBorder * (1.0 - heightMask);
  
  finalColor *= u_contrast;
  outColor = vec4(clamp(finalColor, 0.0, 1.0), 1.0);
}
`
  },
  {
    name: "Cosmic Wormhole",
    subtitle: "Hyperspace Star Tunnel",
    code: `// Cosmic Wormhole — swirling hyperspace star tunnel responding to levels
uniform float u_speed;
uniform float u_zoom;
uniform float u_contrast;

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution) / min(u_resolution.x, u_resolution.y);
  float t = u_time * u_speed;
  
  float r = length(uv);
  float a = atan(uv.y, uv.x);
  
  // Hyperbolic space warping
  float depth = 1.0 / (r + 0.02);
  float swirl = a + depth * (0.2 * u_zoom) + t * 0.6;
  
  // Star particle rings
  float rings = sin(depth * 6.0 - t * 5.0 - u_bass * 4.0);
  rings = smoothstep(0.4, 0.95, rings);
  
  // Longitudinal rays
  float rays = sin(swirl * 10.0) * cos(swirl * 2.0);
  rays = smoothstep(0.3, 0.8, rays) * u_mid;
  
  // Cosmic purple to yellow-green gradient
  vec3 deepPurple = vec3(0.5, 0.0, 0.95);
  vec3 cyberGreen = vec3(0.0, 1.0, 0.5);
  vec3 col = mix(deepPurple, cyberGreen, sin(depth * 0.1 + t) * 0.5 + 0.5);
  
  // Glow and particle brightness
  float intensity = (rings * 0.7 + rays * 0.3) * (0.7 + u_bass * 0.8);
  vec3 finalColor = col * intensity;
  
  // Bright center portal
  finalColor += vec3(0.9, 0.95, 1.0) * 0.03 / (r + 0.005) * (u_level * 1.5 + 0.5);
  
  finalColor *= u_contrast;
  outColor = vec4(clamp(finalColor, 0.0, 1.0), 1.0);
}
`
  },
  {
    name: "Hypercube Fold",
    subtitle: "Raymarched 3D Geometric Matrix",
    code: `// Hypercube Fold — 3D Raymarched SDF box folding, morphing, and glowing with audio reactivity
uniform float u_speed;
uniform float u_zoom;
uniform float u_contrast;

mat2 rot2d(float a) {
  float c = cos(a), s = sin(a);
  return mat2(c, -s, s, c);
}

float sdBox(vec3 p, vec3 b) {
  vec3 q = abs(p) - b;
  return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0);
}

float map(vec3 p, out float matId) {
  float scale = 3.5 + u_mid * 1.5;
  vec3 p_fold = p;
  
  p_fold.xz *= rot2d(u_time * u_speed * 0.15 + u_bass * 0.1);
  p_fold.yz *= rot2d(u_time * u_speed * 0.08);
  
  p_fold = abs(p_fold) - vec3(1.2 + u_bass * 0.4);
  p_fold.xy *= rot2d(u_time * u_speed * 0.2 + u_mid * 0.3);
  
  float size = (0.6 + u_treble * 0.2) * u_zoom;
  float box = sdBox(p_fold, vec3(size));
  float sphere = length(p) - (0.4 + u_bass * 0.5);
  
  if (box < sphere) {
    matId = 1.0;
    return box;
  } else {
    matId = 2.0;
    return sphere;
  }
}

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution) / min(u_resolution.x, u_resolution.y);
  vec3 ro = vec3(0.0, 0.0, -5.0);
  vec3 rd = normalize(vec3(uv, 1.2));
  
  float t = 0.0;
  float maxDist = 15.0;
  float matId = 0.0;
  int steps = 50;
  
  float d = 0.0;
  for (int i = 0; i < 50; i++) {
    vec3 p = ro + rd * t;
    d = map(p, matId);
    if (d < 0.001 || t > maxDist) break;
    t += d;
  }
  
  vec3 col = vec3(0.0);
  if (t < maxDist) {
    vec3 p = ro + rd * t;
    
    vec2 eps = vec2(0.002, 0.0);
    float dummy;
    vec3 n = normalize(vec3(
      map(p + eps.xyy, dummy) - map(p - eps.xyy, dummy),
      map(p + eps.yxy, dummy) - map(p - eps.yxy, dummy),
      map(p + eps.yyx, dummy) - map(p - eps.yyx, dummy)
    ));
    
    vec3 lightPos = vec3(3.0, 5.0, -4.0);
    vec3 l = normalize(lightPos - p);
    float diff = max(0.0, dot(n, l));
    
    if (matId == 1.0) {
      vec3 edgeColor = mix(vec3(0.05, 0.8, 0.9), vec3(0.8, 0.1, 0.9), sin(u_time * u_speed + p.z * 0.5) * 0.5 + 0.5);
      col = edgeColor * diff;
      float grid = sin(p.x * 20.0) * sin(p.y * 20.0) * sin(p.z * 20.0);
      if (grid > 0.4 - u_treble * 0.3) {
        col += vec3(0.9, 0.9, 1.0) * u_treble * 1.5;
      }
    } else {
      col = vec3(1.0, 0.3, 0.1) * (1.5 + u_bass * 2.0);
    }
    
    col = mix(col, vec3(0.01, 0.01, 0.03), 1.0 - exp(-0.08 * t * t));
  } else {
    float bgGlow = 0.25 / (length(uv) + 0.5);
    col = vec3(0.03, 0.0, 0.08) * bgGlow;
    col += vec3(0.05, 0.4, 0.6) * pow(max(0.0, dot(rd, vec3(0.0, 0.0, 1.0))), 8.0) * u_bass;
  }
  
  float ao = 1.0 / (1.0 + float(steps) * 0.01);
  col *= ao;
  
  col = pow(col, vec3(0.95)) * u_contrast;
  outColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}
`
  },
  {
    name: "Supernova Star",
    subtitle: "Swirling Gaseous Cosmic Flares",
    code: `// Supernova Star — generative cosmic starburst and swirling nebula deforming to audio
uniform float u_speed;
uniform float u_zoom;
uniform float u_contrast;

mat2 rot2d(float a) {
  float c = cos(a), s = sin(a);
  return mat2(c, -s, s, c);
}

float hash21(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash21(i + vec2(0.0, 0.0)), hash21(i + vec2(1.0, 0.0)), u.x),
             mix(hash21(i + vec2(0.0, 1.0)), hash21(i + vec2(1.0, 1.0)), u.x), u.y);
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  mat2 m = rot2d(0.5);
  for (int i = 0; i < 5; i++) {
    v += a * noise(p);
    p = m * p * 2.0 + vec2(100.0);
    a *= 0.5;
  }
  return v;
}

vec3 palette(float t, vec3 a, vec3 b, vec3 c, vec3 d) {
  return a + b * cos(6.28318 * (c * t + d));
}

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution) / min(u_resolution.x, u_resolution.y);
  float dist = length(uv);
  
  float angle = atan(uv.y, uv.x);
  float twist = angle + 3.0 * dist * (1.0 + u_mid);
  vec2 twistedUv = vec2(cos(twist), sin(twist)) * dist;
  
  float speed = u_time * u_speed * 0.4 + u_level * 0.5;
  vec2 motionVec = twistedUv * (4.0 / u_zoom) - vec2(speed);
  
  float f1 = fbm(motionVec);
  float f2 = fbm(motionVec + f1 + vec2(u_time * 0.1));
  float cloudDensity = smoothstep(0.2, 0.8, f2);
  
  vec3 colorA = vec3(0.5, 0.5, 0.5);
  vec3 colorB = vec3(0.5, 0.5, 0.5);
  vec3 colorC = vec3(1.0, 1.0, 1.0);
  vec3 colorD = vec3(0.0, 0.33, 0.67) + vec3(u_mid * 0.3, 0.0, -u_mid * 0.2);
  
  float colCycle = dist * 0.5 - speed * 0.1 + f2 * 0.3;
  vec3 nebulaColor = palette(colCycle, colorA, colorB, colorC, colorD);
  vec3 finalColor = nebulaColor * cloudDensity;
  
  float coreSize = 0.02 + u_bass * 0.05;
  float coreGlow = coreSize / (dist + 0.015);
  vec3 coreColor = vec3(1.0, 0.9, 0.7) * coreGlow;
  finalColor += coreColor;
  
  float rays = sin(angle * 8.0 - u_time * u_speed * 2.0) * sin(angle * 3.0 + u_time * u_speed) * 0.5 + 0.5;
  float rayStrength = smoothstep(0.5, 0.0, dist) * rays * 0.2 * (u_bass + 0.2);
  finalColor += vec3(0.9, 0.45, 0.15) * rayStrength;
  
  vec2 starGrid = uv * 35.0;
  vec2 starIp = floor(starGrid);
  vec2 starFp = fract(starGrid) - 0.5;
  float starHash = hash21(starIp);
  if (starHash > 0.985) {
    float starIntensity = smoothstep(0.08, 0.0, length(starFp)) * starHash;
    starIntensity *= 0.5 + 0.5 * sin(u_time * 15.0 * starHash);
    finalColor += vec3(1.0, 1.0, 1.0) * starIntensity * (u_treble * 2.0 + 0.2) * (1.0 - dist * 1.5);
  }
  
  finalColor *= smoothstep(1.2, 0.5, dist) * u_contrast;
  outColor = vec4(clamp(finalColor, 0.0, 1.0), 1.0);
}
`
  },
  {
    name: "Cyber Horizon",
    subtitle: "Outrun Synthwave Neon Grid",
    code: `// Cyber Horizon — outrun grid horizon with perspective mapping and neon pulsing sun
uniform float u_speed;
uniform float u_zoom;
uniform float u_contrast;

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  vec2 p = (gl_FragCoord.xy - 0.5 * u_resolution) / min(u_resolution.x, u_resolution.y);
  
  float horizon = -0.1 + sin(p.x * 2.0 + u_time * u_speed) * 0.01 * u_mid;
  vec3 col = vec3(0.01, 0.005, 0.02);
  
  if (p.y < horizon) {
    float d = horizon - p.y;
    float depth = 1.0 / d;
    
    float x_grid = p.x * depth * 0.5;
    float y_grid = depth * 0.4 + u_time * u_speed * (0.8 + u_mid * 1.5);
    
    float line_width = (0.05 + 0.1 * smoothstep(1.5, 0.0, depth * 0.05)) * u_zoom;
    
    float cell_x = abs(fract(x_grid) - 0.5) / fwidth(x_grid);
    float cell_y = abs(fract(y_grid) - 0.5) / fwidth(y_grid);
    
    float grid_lines = min(cell_x, cell_y);
    float grid_mask = 1.0 - smoothstep(0.0, 1.2, grid_lines * line_width);
    
    vec3 grid_color = mix(vec3(0.0, 0.9, 1.0), vec3(1.0, 0.0, 0.8), u_bass);
    float surge = sin(y_grid * 0.5 - u_time * u_speed * 8.0) * 0.5 + 0.5;
    grid_color += vec3(1.0) * pow(surge, 8.0) * (u_treble * 1.5 + 0.2);
    
    col = grid_color * grid_mask * smoothstep(0.0, 1.0, d * 4.0);
    float fog = exp(-d * 6.0);
    col = mix(col, vec3(0.1, 0.01, 0.12), fog);
  } else {
    float skyGrad = (p.y - horizon) * 1.5;
    col = mix(vec3(0.4, 0.0, 0.35), vec3(0.05, 0.0, 0.12), clamp(skyGrad, 0.0, 1.0));
    
    float mountHeight = 0.0;
    for (float i = 1.0; i < 4.0; i++) {
      float speed = i * 0.08;
      float scale = i * 8.0;
      float m = sin(p.x * scale + u_time * u_speed * speed) * 0.04 / i;
      m += cos(p.x * (scale * 1.5) - i) * 0.02 / i;
      if (p.y - horizon < m + 0.04) {
        col = mix(col, vec3(0.02, 0.0, 0.05) * i, 0.9);
      }
    }
    
    vec2 sun_pos = vec2(0.0, horizon + 0.05);
    float sun_dist = length(p - sun_pos);
    float sun_radius = 0.32 + u_bass * 0.08;
    
    if (sun_dist < sun_radius) {
      float slice = fract((p.y - horizon) * 22.0);
      if (slice > 0.25 || p.y - horizon < 0.08) {
        float sunGrad = (p.y - sun_pos.y) / sun_radius;
        vec3 sun_color = mix(vec3(1.0, 0.8, 0.0), vec3(1.0, 0.0, 0.5), sunGrad);
        sun_color += vec3(1.0, 0.5, 0.0) * u_bass * 0.3;
        col = sun_color;
      }
    }
    
    float sun_glow = sun_radius / (sun_dist + 0.12);
    col += vec3(1.0, 0.0, 0.6) * pow(sun_glow, 2.5) * 0.35 * (u_bass + 0.5);
    
    float star_hash = fract(sin(dot(floor(p * 45.0), vec2(45.1, 91.7))) * 53456.23);
    if (star_hash > 0.992) {
      float tw = 0.5 + 0.5 * sin(u_time * u_speed * 8.0 * star_hash);
      col += vec3(0.9, 0.8, 1.0) * tw * u_treble * smoothstep(0.4, 0.9, p.y);
    }
  }
  
  col = pow(col, vec3(0.92)) * u_contrast;
  outColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}
`
  },
  {
    name: "Liquid Chroma",
    subtitle: "Warped Iridescent Metallic Fluid",
    code: `// Liquid Chroma — metallic fluid flow with chromatic aberration and iridescence
uniform float u_speed;
uniform float u_zoom;
uniform float u_contrast;

mat2 rot2d(float a) {
  float c = cos(a), s = sin(a);
  return mat2(c, -s, s, c);
}

float sineNoise(vec2 p) {
  float v = 0.0;
  v += sin(p.x * 2.0 + u_time * u_speed * 0.4) * 0.5;
  v += sin(p.y * 3.0 - u_time * u_speed * 0.3) * 0.3;
  p *= rot2d(0.5);
  v += sin(p.x * 5.0 + u_time * u_speed * 0.8) * 0.15;
  v += sin(p.y * 8.0 - u_time * u_speed * 1.2) * 0.05;
  return v;
}

vec2 warp(vec2 p, out float d) {
  vec2 q = vec2(sineNoise(p), sineNoise(p + vec2(5.2, 1.3)));
  vec2 r = vec2(
    sineNoise(p + 4.0 * q + vec2(1.7, 9.2) + u_time * u_speed * 0.15),
    sineNoise(p + 4.0 * q + vec2(8.3, 2.8) + u_time * u_speed * 0.08)
  );
  d = sineNoise(p + 4.0 * r);
  return r;
}

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution) / min(u_resolution.x, u_resolution.y);
  vec2 p = uv * (3.0 - u_bass * 0.5) * (1.5 / u_zoom);
  
  float density = 0.0;
  vec2 w = warp(p, density);
  
  vec3 col = vec3(0.0);
  float split = 0.01 + u_treble * 0.06;
  
  float dR = 0.0, dG = 0.0, dB = 0.0;
  warp(p + vec2(split, 0.0), dR);
  warp(p + vec2(0.0, split), dG);
  warp(p - vec2(split, split), dB);
  
  col.r = sin(dR * 4.0 + 0.0) * 0.5 + 0.5;
  col.g = sin(dG * 4.0 + 2.094) * 0.5 + 0.5;
  col.b = sin(dB * 4.0 + 4.188) * 0.5 + 0.5;
  
  float eps = 0.01;
  float d1 = 0.0, d2 = 0.0, d3 = 0.0;
  warp(p + vec2(eps, 0.0), d1);
  warp(p + vec2(0.0, eps), d2);
  warp(p, d3);
  
  vec2 normal = vec2(d1 - d3, d2 - d3) / eps;
  float spec = max(0.0, 1.0 - length(normal) * 0.5);
  spec = pow(spec, 12.0) * (1.2 + u_bass * 0.8);
  
  col = mix(col, vec3(1.0, 1.0, 0.95), spec * 0.7);
  float shadow = smoothstep(0.4, -0.4, density);
  col = mix(col, vec3(0.02, 0.01, 0.05), shadow * 0.4);
  
  col *= smoothstep(1.3, 0.4, length(uv)) * u_contrast;
  outColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}
`
  },
  {
    name: "Vector Scope",
    subtitle: "Analog CRT Oscilloscope Laser",
    code: `// Vector Scope — analog laser CRT oscilloscope with phosphor beam glow
uniform float u_speed;
uniform float u_zoom;
uniform float u_contrast;

float hash21(float n) {
  return fract(sin(n) * 43758.5453123);
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  vec2 p = (gl_FragCoord.xy - 0.5 * u_resolution) / min(u_resolution.x, u_resolution.y);
  
  vec2 d_uv = uv - 0.5;
  p *= 1.0 + dot(d_uv, d_uv) * 0.15;
  p *= (1.5 / u_zoom);
  
  vec3 col = vec3(0.01, 0.02, 0.015);
  
  float r = length(p);
  float angle = atan(p.y, p.x);
  
  float baseRadius = 0.35 + u_bass * 0.12;
  float wave = sin(angle * 6.0 - u_time * u_speed * 4.0) * 0.05 * u_mid;
  wave += cos(angle * 24.0 + u_time * u_speed * 12.0) * 0.025 * u_level;
  wave += sin(angle * 80.0) * 0.006 * u_treble;
  
  float targetDist = baseRadius + wave;
  float beamIntensity = (0.0012 + u_level * 0.0008);
  beamIntensity *= 0.85 + 0.15 * hash21(u_time * 45.0);
  
  float beamGlow = beamIntensity / (abs(r - targetDist) + 0.001);
  col += vec3(0.1, 0.95, 0.4) * beamGlow;
  col += vec3(0.9, 1.0, 0.95) * pow(beamGlow, 3.5) * 0.4;
  
  float horizWave = sin(p.x * 12.0 - u_time * u_speed * 8.0) * 0.08 * u_bass;
  horizWave += cos(p.x * 48.0) * 0.02 * u_mid;
  float horizGlow = (0.0006 + u_level * 0.0006) / (abs(p.y - horizWave) + 0.0012);
  horizGlow *= 0.8 + 0.2 * hash21(u_time * 60.0 + 1.2);
  
  col += vec3(0.0, 0.6, 1.0) * horizGlow;
  col += vec3(0.9, 0.95, 1.0) * pow(horizGlow, 3.0) * 0.3;
  
  col *= 0.92 + 0.08 * sin(p.y * 350.0 + u_time * u_speed * 15.0);
  
  vec2 edge_dist = abs(uv - 0.5);
  col *= smoothstep(0.5, 0.45, edge_dist.x) * smoothstep(0.5, 0.45, edge_dist.y) * u_contrast;
  outColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}
`
  },
  {
    name: "Sacred Geometry",
    subtitle: "Symmetric Morphing Polygon Mandala",
    code: `// Sacred Geometry — morphing rotating complex polygon mandalas
uniform float u_speed;
uniform float u_zoom;
uniform float u_contrast;

#define PI 3.14159265359

float idx_mod(float x, float y) {
  return x - y * floor(x/y);
}

float sdPolygon(vec2 p, int N, float r) {
  float a = atan(p.y, p.x) + PI/2.0;
  float b = 2.0 * PI / float(N);
  float f = idx_mod(a, b) - b/2.0;
  return length(p) * cos(f) - r;
}

mat2 rot2d(float a) {
  float c = cos(a), s = sin(a);
  return mat2(c, -s, s, c);
}

void main() {
  vec2 p = (gl_FragCoord.xy - 0.5 * u_resolution) / min(u_resolution.x, u_resolution.y);
  p *= (1.5 / u_zoom);
  
  float dist = length(p);
  float angle = atan(p.y, p.x);
  
  vec3 col = vec3(0.015, 0.005, 0.03) * (1.0 / (dist + 0.4));
  
  float cycle = u_time * u_speed * 0.4;
  float blend = fract(cycle);
  int N1 = 3 + int(idx_mod(floor(cycle), 4.0)) * 2;
  int N2 = 3 + int(idx_mod(floor(cycle) + 1.0, 4.0)) * 2;
  if (N1 > 12) N1 = 12;
  if (N2 > 12) N2 = 12;
  
  vec2 rotP = p * rot2d(u_time * u_speed * 0.18 + u_bass * 0.15);
  float radius = 0.22 + u_bass * 0.08;
  float mainSdf = mix(sdPolygon(rotP, N1, radius), sdPolygon(rotP, N2, radius), smoothstep(0.1, 0.9, blend));
  
  float glow = 0.0016 / (abs(mainSdf) + 0.0012);
  vec3 mainColor = mix(vec3(1.0, 0.0, 0.5), vec3(0.0, 0.8, 1.0), sin(u_time * u_speed * 0.5) * 0.5 + 0.5);
  col += mainColor * glow * (1.0 + u_mid * 1.5);
  
  float sectors = 6.0;
  float sAngle = mod(angle, 2.0 * PI / sectors) - PI / sectors;
  sAngle = abs(sAngle);
  vec2 kP = dist * vec2(cos(sAngle), sin(sAngle));
  
  for (float i = 1.0; i <= 3.0; i++) {
    vec2 subP = kP - vec2(0.25 * i, 0.0);
    subP *= rot2d(u_time * u_speed * (0.3 * i) + u_mid * 0.4);
    float subSdf = length(subP) - 0.04 * i * (1.0 + u_mid * 0.5);
    
    col += mix(vec3(1.0, 0.5, 0.0), vec3(0.0, 0.9, 0.7), i / 3.0) * (0.0008 / (abs(subSdf) + 0.001)) * (0.5 + u_level);
    col += vec3(0.8, 0.8, 1.0) * (0.0003 / (abs(subP.y) + 0.002)) * (u_treble * 0.5 + 0.1) * smoothstep(0.6, 0.0, length(subP));
  }
  
  float rayCount = 12.0;
  float rays = sin(angle * rayCount - u_time * u_speed * 0.8) * cos(angle * 3.0) * 0.5 + 0.5;
  col += vec3(1.0, 0.7, 0.3) * rays * smoothstep(0.8, 0.0, dist) * 0.15 * (u_bass + u_mid);
  
  col *= smoothstep(1.3, 0.4, dist) * u_contrast;
  outColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}
`
  }
];
