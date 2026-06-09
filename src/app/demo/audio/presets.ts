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
  }
];
