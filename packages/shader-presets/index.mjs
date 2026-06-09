export const audioKaleidoscope = `// Audio Kaleidoscope
// Creates a kaleidoscopic pattern that reacts to audio

precision highp float;
uniform float u_time;
uniform vec2  u_resolution;
uniform vec2  u_mouse;
uniform float u_bass;
uniform float u_mid;
uniform float u_treble;
uniform float u_level;

vec2 rotate2d(vec2 v, float a) {
    float s = sin(a);
    float c = cos(a);
    return vec2(c * v.x - s * v.y, s * v.x + c * v.y);
}

void main() {
    vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution) / min(u_resolution.x, u_resolution.y);
    float angle = atan(uv.y, uv.x);
    float radius = length(uv);
    
    // Create kaleidoscope by repeating the angle
    float slice = 2.0 * 3.14159 / 6.0; // 6 slices
    float modAngle = mod(angle, slice);
    if (modAngle > slice * 0.5) {
        modAngle = slice - modAngle;
    }
    vec2 uv2 = vec2(cos(modAngle), sin(modAngle)) * radius;
    
    float t = u_time * 0.5;
    float wave = sin(uv2.x * 20.0 + t) * sin(uv2.y * 20.0 + t);
    wave += sin(uv2.x * 30.0 - t) * sin(uv2.y * 30.0 - t) * 0.5;
    
    // Audio modulation
    float scale = 1.0 + u_bass * 0.5;
    uv2 *= scale;
    wave = sin(uv2.x * 10.0 + t) * sin(uv2.y * 10.0 - t);
    
    vec3 color = vec3(wave * 0.5 + 0.5);
    color = mix(color, vec3(0.2, 0.8, 0.2), u_mid * 0.5);
    color = mix(color, vec3(0.8, 0.2, 0.2), u_treble * 0.5);
    
    outColor = vec4(color, 1.0);
}
`;

export const audioNeonCyberpunk = `// Audio Neon Cyberpunk
// Neon grid perspective with glowing lines reacting to bass and mids

precision highp float;
uniform float u_time;
uniform vec2  u_resolution;
uniform vec2  u_mouse;
uniform float u_bass;
uniform float u_mid;
uniform float u_treble;
uniform float u_level;

void main() {
    vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution) / min(u_resolution.x, u_resolution.y);
    
    // Warp UV based on mid-range audio
    float warp = u_mid * 0.15;
    uv.x += sin(uv.y * 4.0 + u_time) * warp;
    
    // Perspective grid math
    float perspective = 1.0 / (abs(uv.y) + 0.08);
    float gridX = sin(uv.x * 12.0 * perspective + u_time * 0.5);
    float gridY = sin(perspective * 8.0 - u_time * 1.5);
    
    // Line thickness influenced by bass
    float thickness = 0.94 - (u_bass * 0.04);
    float lines = smoothstep(thickness, 1.0, gridX) + smoothstep(thickness, 1.0, gridY);
    
    // Cyberpunk color palette: Cyan and Magenta
    vec3 colorCyan = vec3(0.0, 0.9, 1.0);
    vec3 colorMagenta = vec3(1.0, 0.0, 0.7);
    
    // Interpolate color based on position and treble
    float colorMix = 0.5 + 0.5 * sin(uv.y * 2.0 + u_time + u_treble);
    vec3 neonColor = mix(colorCyan, colorMagenta, colorMix);
    
    // Base glow
    vec3 finalColor = lines * neonColor * (1.2 + u_bass * 0.8);
    
    // Add audio-reactive grid vignette/horizon glow
    float glow = exp(-abs(uv.y) * 4.0) * (u_bass * 0.5 + 0.5);
    finalColor += colorMagenta * glow * 0.6;
    
    outColor = vec4(finalColor, 1.0);
}
`;

export const audioPulseMandelbrot = `// Audio Pulse Mandelbrot
// Mandelbrot set with audio-driven zoom and offset

precision highp float;
uniform float u_time;
uniform vec2  u_resolution;
uniform vec2  u_mouse;
uniform float u_bass;
uniform float u_mid;
uniform float u_treble;
uniform float u_level;

void main() {
    vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution) / min(u_resolution.x, u_resolution.y);
    float zoom = 1.0 / (0.5 + u_bass * 2.0); // Bass zooms in
    vec2 offset = vec2(sin(u_time * 0.2) * u_mid, cos(u_time * 0.3) * u_mid) * 0.5;
    uv = uv * zoom + offset;
    
    vec2 c = uv;
    vec2 z = vec2(0.0);
    int maxIter = int(20.0 + u_treble * 30.0);
    int iter = 0;
    for (int i = 0; i < maxIter; i++) {
        if (dot(z, z) > 4.0) break;
        z = vec2(z.x * z.x - z.y * z.y, 2.0 * z.x * z.y) + c;
        iter++;
    }
    
    float t = float(iter) / float(maxIter);
    t = smoothstep(0.0, 1.0, t);
    vec3 color = vec3(t);
    color = mix(color, vec3(0.2, 0.0, 0.5), t * 0.5);
    color = mix(color, vec3(0.0, 0.5, 0.2), t * 0.5);
    
    outColor = vec4(color, 1.0);
}
`;

export const audioQuantumTunnel = `// Audio Quantum Tunnel
// Deep space quantum wormhole reacting to bass and levels

precision highp float;
uniform float u_time;
uniform vec2  u_resolution;
uniform vec2  u_mouse;
uniform float u_bass;
uniform float u_mid;
uniform float u_treble;
uniform float u_level;

void main() {
    vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution) / min(u_resolution.x, u_resolution.y);
    
    // Polar conversion
    float r = length(uv);
    float angle = atan(uv.y, uv.x);
    
    // Warp space
    float depth = 1.0 / (r + 0.01);
    float swirl = angle + depth * 0.5 + u_time * 0.4;
    
    // Ring patterns that shift with sound level
    float rings = sin(depth * 5.0 - u_time * 4.0 - u_bass * 5.0);
    rings = smoothstep(0.4, 0.9, rings);
    
    // Rays/streaks along the tunnel
    float streaks = sin(swirl * 12.0) * cos(swirl * 3.0);
    streaks = smoothstep(0.2, 0.8, streaks) * u_mid;
    
    // Color scheme: Deep purple to neon green
    vec3 spacePurple = vec3(0.4, 0.0, 0.8);
    vec3 quantumGreen = vec3(0.0, 1.0, 0.5);
    
    vec3 color = mix(spacePurple, quantumGreen, sin(depth * 0.2 + u_time) * 0.5 + 0.5);
    
    // Glow and lighting
    float intensity = (rings * 0.6 + streaks * 0.4) * (0.8 + u_bass * 0.7);
    vec3 finalColor = color * intensity;
    
    // Add central bright glow
    finalColor += vec3(0.8, 0.9, 1.0) * 0.05 / (r + 0.005) * (u_level + 0.5);
    
    outColor = vec4(finalColor, 1.0);
}
`;

export const audioReactiveDna = `// Audio Reactive DNA
// Double helix that pulses with audio

precision highp float;
uniform float u_time;
uniform vec2  u_resolution;
uniform vec2  u_mouse;
uniform float u_bass;
uniform float u_mid;
uniform float u_treble;
uniform float u_level;

void main() {
    vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution) / min(u_resolution.x, u_resolution.y);
    vec2 uv0 = uv * 2.0 - 1.0;
    uv0.y *= u_resolution.y / u_resolution.x;
    
    float t = u_time * 0.5;
    float helix1 = sin(uv0.x * 10.0 + t) * cos(uv0.y * 10.0 + t);
    float helix2 = sin(uv0.x * 10.0 - t) * cos(uv0.y * 10.0 - t);
    float dna = abs(helix1) + abs(helix2);
    
    // Audio-driven thickness and glow
    float thickness = 0.02 + u_bass * 0.03;
    float glow = smoothstep(thickness, thickness + 0.02, dna);
    glow = pow(glow, 0.5);
    
    // Color based on audio
    vec3 color = vec3(0.0);
    color.r = 0.5 + 0.5 * sin(t * 2.0 + u_mid * 2.0);
    color.g = 0.5 + 0.5 * sin(t * 2.0 + u_treble * 2.0);
    color.b = 0.5 + 0.5 * sin(t * 2.0 + u_bass * 2.0);
    color *= glow;
    
    // Background gradient
    vec3 bg = vec3(0.05, 0.0, 0.1);
    bg = mix(bg, vec3(0.1, 0.0, 0.2), uv0.y * 0.5 + 0.5);
    
    outColor = vec4(mix(bg, color, glow), 1.0);
}
`;

export const audioReactiveCityscape = `// Audio Reactive Cityscape
// Buildings that pulse with the audio beat

precision highp float;
uniform float u_time;
uniform vec2  u_resolution;
uniform vec2  u_mouse;
uniform float u_bass;
uniform float u_mid;
uniform float u_treble;
uniform float u_level;

void main() {
    vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution) / min(u_resolution.x, u_resolution.y);
    uv.y = -uv.y; // Flip y so city grows up
    
    // Create building grid
    float grid = 0.2;
    vec2 cell = floor(uv / grid);
    vec2 pos = uv - cell * grid;
    
    // Building height based on audio and position
    float height = 0.1 + sin(cell.x * 0.5 + u_time * 0.2) * 0.2;
    height += sin(cell.y * 0.5 + u_time * 0.3) * 0.2;
    height += u_bass * 0.5; // Bass makes buildings taller
    
    // Windows
    float windowY = mod(pos.y * 20.0, 1.0);
    float windowX = mod(pos.x * 20.0, 1.0);
    float windows = step(0.85, windowY) * step(0.85, windowX);
    windows *= step(0.0, pos.y) * step(pos.y, height);
    
    // Building color
    vec3 color = vec3(0.1, 0.1, 0.15);
    color = mix(color, vec3(0.0, 0.3, 0.6), windows * 0.5);
    color = mix(color, vec3(0.2, 0.2, 0.2), 1.0 - smoothstep(0.0, height, pos.y));
    
    // Audio treble makes windows blink
    float blink = sin(u_time * 10.0 + cell.x * 10.0 + cell.y * 10.0);
    blink = step(0.0, blink) * u_treble;
    color += blink * 0.3;
    
    outColor = vec4(color, 1.0);
}
`;

export const audioReactiveFire = `// Audio Reactive Fire
// Fire that dances with the audio

precision highp float;
uniform float u_time;
uniform vec2  u_resolution;
uniform vec2  u_mouse;
uniform float u_bass;
uniform float u_mid;
uniform float u_treble;
uniform float u_level;

float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
}

float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(dot(u, vec2(-1.0, 1.0)), dot(u + vec2(1.0, 0.0), vec2(-1.0, 1.0)), u.x),
               mix(dot(u + vec2(0.0, 1.0), vec2(-1.0, 1.0)), dot(u + vec2(1.0, 1.0), vec2(-1.0, 1.0)), u.x),
               u.y);
}

void main() {
    vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution) / u_resolution.y;
    uv.x = (gl_FragCoord.xy - 0.5 * u_resolution) / u_resolution.x;
    vec2 uv0 = uv;
    uv0.y = uv0.y * 2.0 - 1.0; // Center vertically
    
    float t = u_time * 0.5;
    float n = noise(uv0 * 5.0 + t * 0.5);
    n += noise(uv0 * 10.0 - t) * 0.5;
    n = pow(n, 2.0);
    
    // Audio-driven fire intensity
    float fire = n * (0.5 + u_bass * 0.5);
    fire += u_mid * 0.3;
    fire += u_treble * 0.2;
    fire = clamp(fire, 0.0, 1.0);
    
    // Fire color gradient
    vec3 color = vec3(0.0);
    color.r = fire;
    color.g = fire * 0.5;
    color.b = fire * 0.1;
    
    // Add treble-based sparks
    float spark = sin(uv0.x * 100.0 + t * 10.0) * sin(uv0.y * 100.0 - t * 10.0);
    spark = step(0.9, abs(spark)) * u_treble * 0.5;
    color += spark * vec3(1.0, 0.8, 0.2);
    
    // Background
    vec3 bg = vec3(0.0, 0.0, 0.0);
    float bgGradient = smoothstep(0.0, 0.2, uv0.y);
    bg = mix(bg, vec3(0.1, 0.0, 0.0), bgGradient);
    
    outColor = vec4(mix(bg, color, fire), 1.0);
}
`;

export const audioReactiveGlitch = `// Audio Reactive Glitch
// Creates glitch effects that pulse with the audio

precision highp float;
uniform float u_time;
uniform vec2  u_resolution;
uniform vec2  u_mouse;
uniform float u_bass;
uniform float u_mid;
uniform float u_treble;
uniform float u_level;

void main() {
    vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution) / min(u_resolution.x, u_resolution.y);
    vec2 p = uv;
    
    // Audio-driven glitch offset
    float glitchAmount = u_bass * 0.1;
    if (glitchAmount > 0.02) {
        float glitch = sin(u_time * 20.0 + uv.y * 100.0) * glitchAmount;
        p.x += glitch;
    }
    
    // Base pattern: moving gradient
    float t = u_time * 0.5;
    float gradient = sin(p.x * 10.0 + t) * sin(p.y * 10.0 - t);
    gradient = (gradient + 1.0) * 0.5;
    
    // Color channels
    vec3 color = vec3(gradient);
    color.r += sin(p.x * 50.0 + t * 2.0) * u_treble * 0.2;
    color.g += sin(p.y * 50.0 + t * 2.0 + 1.0) * u_mid * 0.2;
    color.b += sin(p.x * 50.0 + t * 2.0 + 2.0) * u_bass * 0.2;
    
    // Treble-induced noise
    float noise = sin(p.x * 200.0 + t * 10.0) * sin(p.y * 200.0 - t * 10.0);
    noise = step(0.95, abs(noise)) * u_treble;
    color += noise * 0.3;
    
    outColor = vec4(color, 1.0);
}
`;

export const audioReactiveNoiseField = `// Audio Reactive Noise Field
// Uses audio to drive noise parameters

precision highp float;
uniform float u_time;
uniform vec2  u_resolution;
uniform vec2  u_mouse;
uniform float u_bass;
uniform float u_mid;
uniform float u_treble;
uniform float u_level;

float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(
        mix(dot(u, vec2(-1.0, 1.0)), dot(u + vec2(1.0, 0.0), vec2(-1.0, 1.0)), u.x),
        mix(dot(u + vec2(0.0, 1.0), vec2(-1.0, 1.0)), dot(u + vec2(1.0, 1.0), vec2(-1.0, 1.0)), u.x),
        u.y
    );
}

void main() {
    vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution) / min(u_resolution.x, u_resolution.y);
    uv *= 1.0 + u_mid * 0.5;
    
    float t = u_time * 0.5;
    float n = noise(uv * 5.0 + t * 0.5);
    n += noise(uv * 10.0 - t) * 0.5;
    n += noise(uv * 20.0 + t * 2.0) * 0.25;
    
    // Audio-driven color shift
    vec3 color = vec3(n);
    color.r += u_bass * 0.3;
    color.g += u_mid * 0.3;
    color.b += u_treble * 0.3;
    color = mod(color * 2.0, 1.0);
    
    // Add treble-based detail
    float detail = sin(uv.x * 100.0 + t * 10.0) * sin(uv.y * 100.0 - t * 10.0);
    detail = step(0.9, abs(detail)) * u_treble;
    color += detail * 0.5;
    
    outColor = vec4(color, 1.0);
}
`;

export const audioReactiveOcean = `// Audio Reactive Ocean
// Ocean waves that respond to audio

precision highp float;
uniform float u_time;
uniform vec2  u_resolution;
uniform vec2  u_mouse;
uniform float u_bass;
uniform float u_mid;
uniform float u_treble;
uniform float u_level;

void main() {
    vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution) / min(u_resolution.x, u_resolution.y);
    vec2 uv0 = uv * 2.0 - 1.0;
    uv0.y *= u_resolution.y / u_resolution.x;
    
    float t = u_time * 0.5;
    float wave1 = sin(uv0.x * 5.0 - t * 2.0) * 0.5;
    wave1 += sin(uv0.x * 10.0 - t * 3.0 + uv0.y * 2.0) * 0.3;
    float wave2 = sin(uv0.x * 3.0 + t * 1.5) * 0.4;
    wave2 += sin(uv0.x * 7.0 + t * 2.0 + uv0.y * 1.5) * 0.2;
    
    // Audio-driven wave height and speed
    float height = 0.2 + u_bass * 0.3;
    float speed = 0.5 + u_mid * 0.5;
    float chop = u_treble * 0.2;
    
    float wave = (wave1 + wave2) * height;
    wave += sin(uv0.x * 50.0 + t * speed) * chop * 0.1;
    
    // Ocean color
    vec3 shallow = vec3(0.0, 0.3, 0.6);
    vec3 deep = vec3(0.0, 0.1, 0.3);
    float depth = smoothstep(-0.5, 0.5, uv0.y);
    vec3 color = mix(deep, shallow, depth);
    
    // Wave foam
    float foam = smoothstep(0.0, 0.05, wave) * smoothstep(0.95, 1.0, wave);
    foam *= 1.0 - depth; // More foam near shore
    color = mix(color, vec3(1.0, 1.0, 1.0), foam * 0.5);
    
    // Add treble-based spray
    float spray = sin(uv0.x * 200.0 + t * 10.0) * sin(uv0.y * 200.0 - t * 10.0);
    spray = step(0.9, abs(spray)) * u_treble * 0.3;
    color += spray * vec3(1.0, 1.0, 1.0);
    
    outColor = vec4(color, 1.0);
}
`;

export const audioReactivePlasma = `// Audio Reactive Plasma
// Uses bass to drive color shift, mid for scale, treble for detail

precision highp float;
uniform float u_time;
uniform vec2  u_resolution;
uniform vec2  u_mouse;
uniform float u_bass;
uniform float u_mid;
uniform float u_treble;
uniform float u_level;

void main() {
    vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution) / min(u_resolution.x, u_resolution.y);
    uv *= 1.0 + u_mid * 0.5;
    
    float t = u_time * 0.5;
    float c = sin(uv.x * 10.0 + t) * sin(uv.y * 10.0 + t);
    c += sin(uv.x * 20.0 - t) * sin(uv.y * 20.0 - t);
    c += sin(uv.x * 30.0 + t*2.0) * sin(uv.y * 30.0 - t*2.0);
    
    vec3 color = vec3(0.0);
    color.r = 0.5 + 0.5 * sin(c * 10.0 + u_bass * 2.0 + t);
    color.g = 0.5 + 0.5 * sin(c * 10.0 + u_bass * 2.0 + t + 2.0);
    color.b = 0.5 + 0.5 * sin(c * 10.0 + u_bass * 2.0 + t + 4.0);
    
    // Add treble-based sparkle
    float spark = sin(uv.x * 100.0 + t * 10.0) * sin(uv.y * 100.0 - t * 10.0);
    spark = step(0.9, abs(spark)) * u_treble;
    color += spark * 0.5;
    
    outColor = vec4(color, 1.0);
}
`;

export const audioReactiveVoronoi = `// Audio Reactive Voronoi
// Uses audio to distort the voronoi cells

precision highp float;
uniform float u_time;
uniform vec2  u_resolution;
uniform vec2  u_mouse;
uniform float u_bass;
uniform float u_mid;
uniform float u_treble;
uniform float u_level;

float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
}

void main() {
    vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution) / min(u_resolution.x, u_resolution.y);
    uv *= 1.0 + u_mid * 0.3;
    
    float t = u_time * 0.5;
    int points = int(10.0 + u_bass * 20.0);
    float mindist = 1.0;
    vec2 point;
    
    for (int i = 0; i < points; i++) {
        for (int j = 0; j < points; j++) {
            vec2 offset = vec2(float(i), float(j));
            vec2 p = offset + vec2(sin(t + offset.x * 0.1), cos(t + offset.y * 0.1)) * (u_treble * 0.2);
            float h = hash(p);
            p += vec2(h, h * 0.5) * 0.5;
            vec2 diff = uv - p;
            float dist = dot(diff, diff);
            if (dist < mindist) {
                mindist = dist;
                point = p;
            }
        }
    }
    
    float dist = sqrt(mindist);
    float edge = smoothstep(0.0, 0.02, dist);
    float center = smoothstep(0.02, 0.03, dist);
    float line = edge - center;
    
    vec3 color = vec3(0.1);
    color = mix(color, vec3(0.8, 0.2, 0.6), line * 0.5);
    color = mix(color, vec3(0.2, 0.6, 0.8), u_level * 0.5);
    
    outColor = vec4(color, 1.0);
}
`;

export const audioSoundwaveStar = `// Audio Soundwave Star
// Radial soundwave starburst reacting to audio frequencies

precision highp float;
uniform float u_time;
uniform vec2  u_resolution;
uniform vec2  u_mouse;
uniform float u_bass;
uniform float u_mid;
uniform float u_treble;
uniform float u_level;

#define PI 3.14159265359

void main() {
    vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution) / min(u_resolution.x, u_resolution.y);
    
    // Polar coordinates
    float r = length(uv);
    float angle = atan(uv.y, uv.x);
    
    // Radial waves driven by mid and treble frequencies
    float numRays = 8.0 + floor(u_bass * 8.0);
    float wave = sin(angle * numRays + u_time * 2.0) * (0.05 + u_mid * 0.1);
    
    // Circle outline reacting to levels
    float radius = 0.3 + u_bass * 0.15;
    float dist = abs(r - radius - wave);
    
    // Glow effect
    float thickness = 0.005 + u_treble * 0.01;
    float starGlow = thickness / (dist + 0.01);
    
    // Add central energy core
    float core = 0.04 * (1.0 + u_bass * 2.0) / (r + 0.01);
    
    // Golden and cyan sparks/star field
    vec3 coreColor = vec3(1.0, 0.7, 0.2); // Golden
    vec3 waveColor = vec3(0.1, 0.8, 0.9); // Cyan
    
    // Frequency mix for colors
    vec3 finalColor = starGlow * mix(waveColor, coreColor, sin(angle + u_time) * 0.5 + 0.5);
    finalColor += core * coreColor;
    
    // High-frequency rays
    float rays = max(0.0, cos(angle * 32.0 - u_time * 5.0));
    finalColor += rays * u_treble * 0.3 * vec3(0.8, 0.3, 1.0) / (r + 0.1);
    
    outColor = vec4(finalColor, 1.0);
}
`;

export const audioVortexNebula = `// Audio Vortex Nebula
// Swirling colorful nebula clouds deforming and morphing with audio levels

precision highp float;
uniform float u_time;
uniform vec2  u_resolution;
uniform vec2  u_mouse;
uniform float u_bass;
uniform float u_mid;
uniform float u_treble;
uniform float u_level;

// Simple pseudo-noise function
float noise2d(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

void main() {
    vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution) / min(u_resolution.x, u_resolution.y);
    
    // Rotate UV over time
    float angle = u_time * 0.1 + u_bass * 0.2;
    mat2 rot = mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
    vec2 rotUv = rot * uv;
    
    // Create organic flowing layers
    float n1 = sin(rotUv.x * 3.0 + u_time * 0.5) * cos(rotUv.y * 3.0 - u_time * 0.3);
    float n2 = sin(rotUv.y * 6.0 - u_time) * cos(rotUv.x * 6.0 + u_time * 0.8) * u_mid;
    float combined = n1 + 0.5 * n2;
    
    // Generate colors
    vec3 colA = vec3(0.8, 0.1, 0.4); // Pink nebula
    vec3 colB = vec3(0.1, 0.2, 0.8); // Deep blue
    vec3 colC = vec3(0.9, 0.8, 0.1); // Warm stars/highlights
    
    vec3 nebula = mix(colB, colA, combined * 0.5 + 0.5);
    nebula += colC * max(0.0, combined * combined) * u_treble * 0.5;
    
    // Center glow
    float dist = length(uv);
    float center = 0.08 / (dist + 0.02) * (1.0 + u_bass * 0.5);
    vec3 centerColor = vec3(0.9, 0.6, 0.9);
    
    vec3 finalColor = nebula * (1.0 - dist) + center * centerColor;
    
    // Vignette
    finalColor *= smoothstep(1.2, 0.4, dist);
    
    outColor = vec4(finalColor, 1.0);
}
`;

export const audioWaveformTunnel = `// Audio Waveform Tunnel
// Creates a tunnel that pulses with the audio

precision highp float;
uniform float u_time;
uniform vec2  u_resolution;
uniform vec2  u_mouse;
uniform float u_bass;
uniform float u_mid;
uniform float u_treble;
uniform float u_level;

void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution;
    uv = uv * 2.0 - 1.0;
    uv.x *= u_resolution.x / u_resolution.y;
    
    float angle = atan(uv.y, uv.x);
    float radius = length(uv);
    
    float wave = sin(angle * 20.0 - u_time * 5.0 + radius * 10.0);
    wave += sin(angle * 40.0 - u_time * 10.0 + radius * 20.0) * 0.5;
    
    float pulse = 1.0 + u_bass * 0.5;
    radius = radius * pulse;
    
    float dist = abs(fract(wave * 0.5) - 0.5) * 2.0;
    float intensity = smoothstep(0.02, 0.0, dist);
    
    vec3 color = vec3(intensity);
    color = mix(color, vec3(0.2, 0.0, 0.5), u_treble);
    color = mix(color, vec3(0.0, 0.5, 0.2), u_mid);
    
    outColor = vec4(color, 1.0);
}
`;

export const audioWaveformWater = `// Audio Waveform Water
// Simulates water surface with audio-driven ripples

precision highp float;
uniform float u_time;
uniform vec2  u_resolution;
uniform vec2  u_mouse;
uniform float u_bass;
uniform float u_mid;
uniform float u_treble;
uniform float u_level;

void main() {
    vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution) / min(u_resolution.x, u_resolution.y);
    vec2 uv0 = uv;
    
    // Audio-driven ripple center
    vec2 rippleCenter = vec2(0.5) + vec2(sin(u_time * 0.5), cos(u_time * 0.3)) * u_bass * 0.3;
    vec2 rippleDir = uv0 - rippleCenter;
    float rippleDist = length(rippleDir);
    float ripple = sin(rippleDist * 20.0 - u_time * 10.0) * exp(-rippleDist * 5.0);
    ripple *= u_mid;
    
    uv += normalize(rippleDir) * ripple * 0.1;
    
    // Water color
    float depth = 0.2 + sin(uv.y * 10.0 + u_time * 0.5) * 0.1;
    vec3 color = vec3(0.1, 0.3, 0.5);
    color = mix(color, vec3(0.0, 0.6, 0.8), smoothstep(0.0, depth, uv.y));
    color = mix(color, vec3(0.8, 0.8, 0.9), uv.y * 0.5);
    
    // Add treble-based sparkle
    float spark = sin(uv0.x * 100.0 + u_time * 10.0) * sin(uv0.y * 100.0 - u_time * 10.0);
    spark = step(0.9, abs(spark)) * u_treble;
    color += spark * 0.4;
    
    outColor = vec4(color, 1.0);
}
`;

