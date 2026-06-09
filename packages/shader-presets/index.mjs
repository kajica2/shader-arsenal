export const audioCosmicSupernova = `// Audio Cosmic Supernova
// Generative cosmic starburst and swirling gaseous nebula powered by multi-band audio streams

precision highp float;
uniform float u_time;
uniform vec2  u_resolution;
uniform vec2  u_mouse;
uniform float u_bass;
uniform float u_mid;
uniform float u_treble;
uniform float u_level;

// 2D Rotation
mat2 rot(float a) {
    float c = cos(a), s = sin(a);
    return mat2(c, -s, s, c);
}

// Cheap fractional Brownian motion (fBM) noise
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
    mat2 m = rot(0.5);
    for (int i = 0; i < 5; i++) {
        v += a * noise(p);
        p = m * p * 2.0 + vec2(100.0);
        a *= 0.5;
    }
    return v;
}

// Cosine based color palette generators
vec3 palette(float t, vec3 a, vec3 b, vec3 c, vec3 d) {
    return a + b * cos(6.28318 * (c * t + d));
}

void main() {
    vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution) / min(u_resolution.x, u_resolution.y);
    float dist = length(uv);
    
    // Polar coordinates for warping spirals
    float angle = atan(uv.y, uv.x);
    
    // Twisting effect driven by mid frequencies
    float twist = angle + 3.0 * dist * (1.0 + u_mid);
    vec2 twistedUv = vec2(cos(twist), sin(twist)) * dist;
    
    // Gaseous motion based on time and level
    float speed = u_time * 0.4 + u_level * 0.5;
    vec2 motionVec = twistedUv * 4.0 - vec2(speed);
    
    // Multi-layered noise
    float f1 = fbm(motionVec);
    float f2 = fbm(motionVec + f1 + vec2(u_time * 0.1));
    
    // Nebula Cloud Shaping
    float cloudDensity = smoothstep(0.2, 0.8, f2);
    
    // Define dynamic color scheme sweeping through space
    // Base palette cycles slightly with time and mid levels
    vec3 colorA = vec3(0.5, 0.5, 0.5);
    vec3 colorB = vec3(0.5, 0.5, 0.5);
    vec3 colorC = vec3(1.0, 1.0, 1.0);
    vec3 colorD = vec3(0.0, 0.33, 0.67) + vec3(u_mid * 0.3, 0.0, -u_mid * 0.2);
    
    float colCycle = dist * 0.5 - speed * 0.1 + f2 * 0.3;
    vec3 nebulaColor = palette(colCycle, colorA, colorB, colorC, colorD);
    
    vec3 finalColor = nebulaColor * cloudDensity;
    
    // Central Supernova Star core glowing aggressively with bass
    float coreSize = 0.02 + u_bass * 0.05;
    float coreGlow = coreSize / (dist + 0.015);
    vec3 coreColor = vec3(1.0, 0.9, 0.7) * coreGlow;
    
    finalColor += coreColor;
    
    // Radiant solar flare rays
    float rays = sin(angle * 8.0 - u_time * 2.0) * sin(angle * 3.0 + u_time) * 0.5 + 0.5;
    float rayStrength = smoothstep(0.5, 0.0, dist) * rays * 0.2 * (u_bass + 0.2);
    finalColor += vec3(0.9, 0.45, 0.15) * rayStrength;
    
    // Ambient Starfield flashing to treble peaks
    vec2 starGrid = uv * 35.0;
    vec2 starIp = floor(starGrid);
    vec2 starFp = fract(starGrid) - 0.5;
    float starHash = hash21(starIp);
    if (starHash > 0.985) {
        float starIntensity = smoothstep(0.08, 0.0, length(starFp)) * starHash;
        // Sparkle animation
        starIntensity *= 0.5 + 0.5 * sin(u_time * 15.0 * starHash);
        finalColor += vec3(1.0, 1.0, 1.0) * starIntensity * (u_treble * 2.0 + 0.2) * (1.0 - dist * 1.5);
    }
    
    // Cosmic dust vignetting at screen edges
    finalColor *= smoothstep(1.2, 0.5, dist);
    
    outColor = vec4(finalColor, 1.0);
}
`;

export const audioCyberHorizon = `// Audio Cyber Horizon
// Retro-futuristic synthwave perspective grid and pulsing neon sun reacting to sound bands

precision highp float;
uniform float u_time;
uniform vec2  u_resolution;
uniform vec2  u_mouse;
uniform float u_bass;
uniform float u_mid;
uniform float u_treble;
uniform float u_level;

void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    vec2 p = (gl_FragCoord.xy - 0.5 * u_resolution) / min(u_resolution.x, u_resolution.y);
    
    // Create sky-to-ground partition
    float horizon = -0.1 + sin(p.x * 2.0 + u_time) * 0.01 * u_mid;
    
    vec3 col = vec3(0.01, 0.005, 0.02); // Sky background
    
    // --- 1. THE GROUND GRID ---
    if (p.y < horizon) {
        // Perspective mapping
        float d = horizon - p.y;
        float depth = 1.0 / d;
        
        // Perspective coordinates
        float x_grid = p.x * depth * 0.5;
        float y_grid = depth * 0.4 + u_time * (0.8 + u_mid * 1.5);
        
        // Grid pattern with smooth anti-aliased lines
        float line_width = 0.05 + 0.1 * smoothstep(1.5, 0.0, depth * 0.05);
        
        float cell_x = abs(fract(x_grid) - 0.5) / fwidth(x_grid);
        float cell_y = abs(fract(y_grid) - 0.5) / fwidth(y_grid);
        
        float grid_lines = min(cell_x, cell_y);
        float grid_mask = 1.0 - smoothstep(0.0, 1.2, grid_lines * line_width);
        
        // Grid line glowing color (cyan pulsing to pink on beats)
        vec3 grid_color = mix(vec3(0.0, 0.9, 1.0), vec3(1.0, 0.0, 0.8), u_bass);
        
        // Add electronic surge wave traveling down the grid lines
        float surge = sin(y_grid * 0.5 - u_time * 8.0) * 0.5 + 0.5;
        grid_color += vec3(1.0) * pow(surge, 8.0) * (u_treble * 1.5 + 0.2);
        
        col = grid_color * grid_mask * smoothstep(0.0, 1.0, d * 4.0);
        
        // Add deep background fog at the horizon
        float fog = exp(-d * 6.0);
        col = mix(col, vec3(0.1, 0.01, 0.12), fog);
    } 
    // --- 2. THE SKY ---
    else {
        // Sunset gradient
        float skyGrad = (p.y - horizon) * 1.5;
        col = mix(vec3(0.4, 0.0, 0.35), vec3(0.05, 0.0, 0.12), clamp(skyGrad, 0.0, 1.0));
        
        // Synthwave horizon mountain silhouettes
        float mountHeight = 0.0;
        for (float i = 1.0; i < 4.0; i++) {
            float speed = i * 0.08;
            float scale = i * 8.0;
            float m = sin(p.x * scale + u_time * speed) * 0.04 / i;
            m += cos(p.x * (scale * 1.5) - i) * 0.02 / i;
            if (p.y - horizon < m + 0.04) {
                col = mix(col, vec3(0.02, 0.0, 0.05) * i, 0.9);
            }
        }
        
        // Pulse neon Sun
        vec2 sun_pos = vec2(0.0, horizon + 0.05);
        float sun_dist = length(p - sun_pos);
        float sun_radius = 0.32 + u_bass * 0.08;
        
        if (sun_dist < sun_radius) {
            // Sun grid slice cutouts
            float slice = fract((p.y - horizon) * 22.0);
            float opacity = smoothstep(0.15, 0.25, p.y - horizon);
            
            if (slice > 0.25 || p.y - horizon < 0.08) {
                // Color gradient for the sun (yellow at bottom, pink at top)
                float sunGrad = (p.y - sun_pos.y) / sun_radius;
                vec3 sun_color = mix(vec3(1.0, 0.8, 0.0), vec3(1.0, 0.0, 0.5), sunGrad);
                
                // Neon core glow beat reactive
                sun_color += vec3(1.0, 0.5, 0.0) * u_bass * 0.3;
                col = sun_color;
            }
        }
        
        // Sun glow bleeding into sky
        float sun_glow = sun_radius / (sun_dist + 0.12);
        col += vec3(1.0, 0.0, 0.6) * pow(sun_glow, 2.5) * 0.35 * (u_bass + 0.5);
        
        // Subtle sky stars twinkling
        float star_hash = fract(sin(dot(floor(p * 45.0), vec2(45.1, 91.7))) * 53456.23);
        if (star_hash > 0.992) {
            float tw = 0.5 + 0.5 * sin(u_time * 8.0 * star_hash);
            col += vec3(0.9, 0.8, 1.0) * tw * u_treble * smoothstep(0.4, 0.9, p.y);
        }
    }
    
    // Contrast and chromatic boost
    col = pow(col, vec3(0.92));
    outColor = vec4(col, 1.0);
}
`;

export const audioHypercubeFolding = `// Audio Hypercube Folding
// Raymarched geometric construct folding, morphing, and glowing with multi-band audio reactivity

precision highp float;
uniform float u_time;
uniform vec2  u_resolution;
uniform vec2  u_mouse;
uniform float u_bass;
uniform float u_mid;
uniform float u_treble;
uniform float u_level;

// 2D Rotation matrix
mat2 rot2d(float a) {
    float c = cos(a), s = sin(a);
    return mat2(c, -s, s, c);
}

// Signed Distance Function for a Box
float sdBox(vec3 p, vec3 b) {
    vec3 q = abs(p) - b;
    return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0);
}

// Map function returning the scene density
float map(vec3 p, out float matId) {
    // Dynamic coordinate replication based on mid frequencies
    float scale = 3.5 + u_mid * 1.5;
    vec3 p_fold = p;
    
    // Rotate entire space over time
    p_fold.xz *= rot2d(u_time * 0.15 + u_bass * 0.1);
    p_fold.yz *= rot2d(u_time * 0.08);
    
    // Symmetric folding
    p_fold = abs(p_fold) - vec3(1.2 + u_bass * 0.4);
    p_fold.xy *= rot2d(u_time * 0.2 + u_mid * 0.3);
    
    // Infinite grid repetition on fold
    float size = 0.6 + u_treble * 0.2;
    float box = sdBox(p_fold, vec3(size));
    
    // Core sphere
    float sphere = length(p) - (0.4 + u_bass * 0.5);
    
    if (box < sphere) {
        matId = 1.0; // Box structure
        return box;
    } else {
        matId = 2.0; // Glowing Core
        return sphere;
    }
}

void main() {
    vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution) / min(u_resolution.x, u_resolution.y);
    
    // Ray setup
    vec3 ro = vec3(0.0, 0.0, -5.0); // Ray Origin
    vec3 rd = normalize(vec3(uv, 1.2)); // Ray Direction
    
    // Raymarching Loop
    float t = 0.0;
    float maxDist = 15.0;
    float matId = 0.0;
    int steps = 60;
    
    float d = 0.0;
    for (int i = 0; i < steps; i++) {
        vec3 p = ro + rd * t;
        d = map(p, matId);
        if (d < 0.001 || t > maxDist) break;
        t += d;
    }
    
    vec3 col = vec3(0.0);
    
    if (t < maxDist) {
        // We hit an object
        vec3 p = ro + rd * t;
        
        // Calculate normal
        vec2 eps = vec2(0.002, 0.0);
        float dummy;
        vec3 n = normalize(vec3(
            map(p + eps.xyy, dummy) - map(p - eps.xyy, dummy),
            map(p + eps.yxy, dummy) - map(p - eps.yxy, dummy),
            map(p + eps.yyx, dummy) - map(p - eps.yyx, dummy)
        ));
        
        // Lighting
        vec3 lightPos = vec3(3.0, 5.0, -4.0);
        vec3 l = normalize(lightPos - p);
        float diff = max(0.0, dot(n, l));
        
        // Material Coloring
        if (matId == 1.0) {
            // Hypercube wireframe/structure
            vec3 edgeColor = mix(vec3(0.05, 0.8, 0.9), vec3(0.8, 0.1, 0.9), sin(u_time + p.z * 0.5) * 0.5 + 0.5);
            col = edgeColor * diff;
            // Add grid line overlay using u_treble
            float grid = sin(p.x * 20.0) * sin(p.y * 20.0) * sin(p.z * 20.0);
            if (grid > 0.4 - u_treble * 0.3) {
                col += vec3(0.9, 0.9, 1.0) * u_treble * 1.5;
            }
        } else {
            // Glowing core
            col = vec3(1.0, 0.3, 0.1) * (1.5 + u_bass * 2.0);
        }
        
        // Fog/Depth fade
        col = mix(col, vec3(0.01, 0.01, 0.03), 1.0 - exp(-0.08 * t * t));
    } else {
        // Background Glow
        float bgGlow = 0.25 / (length(uv) + 0.5);
        col = vec3(0.03, 0.0, 0.08) * bgGlow;
        col += vec3(0.05, 0.4, 0.6) * pow(max(0.0, dot(rd, vec3(0.0, 0.0, 1.0))), 8.0) * u_bass;
    }
    
    // Ambient Occlusion estimate for more depth
    float ao = 1.0 / (1.0 + float(steps) * 0.01);
    col *= ao;
    
    // Contrast & Color Correction
    col = pow(col, vec3(0.95));
    col = clamp(col, 0.0, 1.0);
    
    outColor = vec4(col, 1.0);
}
`;

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

export const audioLiquidChroma = `// Audio Liquid Chroma
// Liquid metallic mercury or organic glass flowing with chromatic aberration and iridescent pearl shading

precision highp float;
uniform float u_time;
uniform vec2  u_resolution;
uniform vec2  u_mouse;
uniform float u_bass;
uniform float u_mid;
uniform float u_treble;
uniform float u_level;

// 2D Rotation
mat2 rot(float a) {
    float c = cos(a), s = sin(a);
    return mat2(c, -s, s, c);
}

// Seamless sine-based noise for metallic warping
float sineNoise(vec2 p) {
    float v = 0.0;
    v += sin(p.x * 2.0 + u_time * 0.4) * 0.5;
    v += sin(p.y * 3.0 - u_time * 0.3) * 0.3;
    p *= rot(0.5);
    v += sin(p.x * 5.0 + u_time * 0.8) * 0.15;
    v += sin(p.y * 8.0 - u_time * 1.2) * 0.05;
    return v;
}

// Complex distortion field (domain warping)
vec2 warp(vec2 p, out float d) {
    vec2 q = vec2(
        sineNoise(p + vec2(0.0, 0.0)),
        sineNoise(p + vec2(5.2, 1.3))
    );
    vec2 r = vec2(
        sineNoise(p + 4.0 * q + vec2(1.7, 9.2) + u_time * 0.15),
        sineNoise(p + 4.0 * q + vec2(8.3, 2.8) + u_time * 0.08)
    );
    d = sineNoise(p + 4.0 * r);
    return r;
}

void main() {
    vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution) / min(u_resolution.x, u_resolution.y);
    vec2 p = uv * (3.0 - u_bass * 0.5); // Zoom into the fluid depending on bass
    
    // Domain warp field
    float density = 0.0;
    vec2 w = warp(p, density);
    
    // Iridescent refraction coloring based on density and coordinate distortion
    vec3 col = vec3(0.0);
    
    // Chromatic aberration setup: Split RGB sampling across warped space
    // Chromatic splitting distance driven by treble levels
    float split = 0.01 + u_treble * 0.06;
    
    // Red Channel
    float dR = 0.0;
    warp(p + vec2(split, 0.0), dR);
    col.r = sin(dR * 4.0 + 0.0) * 0.5 + 0.5;
    
    // Green Channel
    float dG = 0.0;
    warp(p + vec2(0.0, split), dG);
    col.g = sin(dG * 4.0 + 2.094) * 0.5 + 0.5;
    
    // Blue Channel
    float dB = 0.0;
    warp(p - vec2(split, split), dB);
    col.b = sin(dB * 4.0 + 4.188) * 0.5 + 0.5;
    
    // Specular Highlight / Viscous shine based on gradient normals
    float eps = 0.01;
    float d1 = 0.0, d2 = 0.0, d3 = 0.0;
    warp(p + vec2(eps, 0.0), d1);
    warp(p + vec2(0.0, eps), d2);
    warp(p, d3);
    
    vec2 normal = vec2(d1 - d3, d2 - d3) / eps;
    float spec = max(0.0, 1.0 - length(normal) * 0.5);
    spec = pow(spec, 12.0) * (1.2 + u_bass * 0.8);
    
    // Combine base chromatic fluid with high-gloss specular shine
    col = mix(col, vec3(1.0, 1.0, 0.95), spec * 0.7);
    
    // Fluid self-shadowing/depth crevices
    float shadow = smoothstep(0.4, -0.4, density);
    col = mix(col, vec3(0.02, 0.01, 0.05), shadow * 0.4);
    
    // Dark vignetting to frame the movement
    float vign = smoothstep(1.3, 0.4, length(uv));
    col *= vign;
    
    // Boost contrast
    col = smoothstep(0.0, 1.0, col);
    col = pow(col, vec3(0.9));
    
    outColor = vec4(col, 1.0);
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

export const audioSacredGeometry = `// Audio Sacred Geometry
// Shifting mathematical mandala morphing between polygon coordinates with fractal recursive symmetry

precision highp float;
uniform float u_time;
uniform vec2  u_resolution;
uniform vec2  u_mouse;
uniform float u_bass;
uniform float u_mid;
uniform float u_treble;
uniform float u_level;

#define PI 3.14159265359

// 2D Rotation
mat2 rot(float a) {
    float c = cos(a), s = sin(a);
    return mat2(c, -s, s, c);
}

// Helper module function avoiding negative inputs for floats
float idx_mod(float x, float y) {
    return x - y * floor(x/y);
}

// SDF of regular N-sided Polygon
float sdPolygon(vec2 p, int N, float r) {
    float a = atan(p.y, p.x) + PI/2.0;
    float b = 2.0 * PI / float(N);
    float f = idx_mod(a, b) - b/2.0;
    return length(p) * cos(f) - r;
}

void main() {
    vec2 p = (gl_FragCoord.xy - 0.5 * u_resolution) / min(u_resolution.x, u_resolution.y);
    float dist = length(p);
    float angle = atan(p.y, p.x);
    
    // Background deep purple atmosphere
    vec3 col = vec3(0.015, 0.005, 0.03) * (1.0 / (dist + 0.4));
    
    // --- 1. MORPHING CENTRAL POLYGON ---
    // Smooth transition over time to cycle polygon vertices between 3 (triangle), 4 (square), 6 (hexagon), and 12 (circle-like)
    float cycle = u_time * 0.4;
    float blend = fract(cycle);
    int N1 = 3 + int(idx_mod(floor(cycle), 4.0)) * 2;
    int N2 = 3 + int(idx_mod(floor(cycle) + 1.0, 4.0)) * 2;
    
    // Safety check for vertex limits
    if (N1 > 12) N1 = 12;
    if (N2 > 12) N2 = 12;
    
    // Rotate coordinates
    vec2 rotP = p * rot(u_time * 0.18 + u_bass * 0.15);
    
    // SDF calculations
    float radius = 0.22 + u_bass * 0.08;
    float sdf1 = sdPolygon(rotP, N1, radius);
    float sdf2 = sdPolygon(rotP, N2, radius);
    float mainSdf = mix(sdf1, sdf2, smoothstep(0.1, 0.9, blend));
    
    // Draw concentric ring echoes
    float glow = 0.0016 / (abs(mainSdf) + 0.0012);
    vec3 mainColor = mix(vec3(1.0, 0.0, 0.5), vec3(0.0, 0.8, 1.0), sin(u_time * 0.5) * 0.5 + 0.5);
    col += mainColor * glow * (1.0 + u_mid * 1.5);
    
    // --- 2. RECURSIVE MANDALA SYMMETRY ---
    // Kaleidoscope mirror reflections (6 sectors)
    float sectors = 6.0;
    float sAngle = mod(angle, 2.0 * PI / sectors) - PI / sectors;
    sAngle = abs(sAngle);
    vec2 kP = dist * vec2(cos(sAngle), sin(sAngle));
    
    // Duplicate sub-shapes along concentric distance levels
    float numRings = 3.0;
    for (float i = 1.0; i <= 3.0; i++) {
        // Rotated offset sub-structures pulsing to mid levels
        vec2 subP = kP - vec2(0.25 * i, 0.0);
        subP *= rot(u_time * (0.3 * i) + u_mid * 0.4);
        
        float subRadius = 0.04 * i * (1.0 + u_mid * 0.5);
        float subSdf = length(subP) - subRadius;
        
        float subGlow = 0.0008 / (abs(subSdf) + 0.001);
        vec3 subColor = mix(vec3(1.0, 0.5, 0.0), vec3(0.0, 0.9, 0.7), i / 3.0);
        col += subColor * subGlow * (0.5 + u_level);
        
        // Connecting laser spokes/lattice lines
        float spokeSdf = abs(subP.y);
        float spokeGlow = 0.0003 / (spokeSdf + 0.002);
        col += vec3(0.8, 0.8, 1.0) * spokeGlow * (u_treble * 0.5 + 0.1) * smoothstep(0.6, 0.0, length(subP));
    }
    
    // --- 3. RADIANT SUNBURST BEAMS ---
    float rayCount = 12.0;
    float rays = sin(angle * rayCount - u_time * 0.8) * cos(angle * 3.0) * 0.5 + 0.5;
    float rayFade = smoothstep(0.8, 0.0, dist);
    col += vec3(1.0, 0.7, 0.3) * rays * rayFade * 0.15 * (u_bass + u_mid);
    
    // Edge clean up vignetting
    col *= smoothstep(1.3, 0.4, dist);
    
    outColor = vec4(col, 1.0);
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

export const audioVectorScope = `// Audio Vector Scope
// Retro analog vector oscilloscope / laser display mimicking phosphor CRT beam glow and signal distortion

precision highp float;
uniform float u_time;
uniform vec2  u_resolution;
uniform vec2  u_mouse;
uniform float u_bass;
uniform float u_mid;
uniform float u_treble;
uniform float u_level;

#define PI 3.14159265359

// Draw glowing neon lines with thickness and falloff
float line(vec2 p, vec2 a, vec2 b, float width) {
    vec2 pa = p - a, ba = b - a;
    float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
    float dist = length(pa - ba * h);
    return width / (dist + 0.001);
}

// Simple hash for beam flickering
float hash(float n) {
    return fract(sin(n) * 43758.5453123);
}

void main() {
    // Normal screen coordinates
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    vec2 p = (gl_FragCoord.xy - 0.5 * u_resolution) / min(u_resolution.x, u_resolution.y);
    
    // 1. CRT Screen Barrel Distortion
    vec2 d_uv = uv - 0.5;
    float dist_sq = dot(d_uv, d_uv);
    p *= 1.0 + dist_sq * 0.15; // Warp coordinates towards center
    
    // Base dark phosphor background
    vec3 col = vec3(0.01, 0.02, 0.015);
    
    // 2. Main Vector Waveforms
    float r = length(p);
    float angle = atan(p.y, p.x);
    
    // Create a circular wave, adding a modular frequency grid
    // Bass drives diameter, mid drives waveform spikes, treble adds rapid glitching
    float baseRadius = 0.35 + u_bass * 0.12;
    
    // Synthesize oscilloscope frequency spikes using sine harmonics
    float wave = sin(angle * 6.0 - u_time * 4.0) * 0.05 * u_mid;
    wave += cos(angle * 24.0 + u_time * 12.0) * 0.025 * u_level;
    wave += sin(angle * 80.0) * 0.006 * u_treble; // High frequency static
    
    float targetDist = baseRadius + wave;
    float ringSdf = abs(r - targetDist);
    
    // Green Phosphor beam glow setup
    float beamIntensity = 0.0012 + u_level * 0.0008;
    // Rapid beam flickering
    beamIntensity *= 0.85 + 0.15 * hash(u_time * 45.0);
    
    float beamGlow = beamIntensity / (ringSdf + 0.001);
    
    // Core beam (super bright white center) + wide green phosphor trail
    vec3 phosphorColor = vec3(0.1, 0.95, 0.4);
    col += phosphorColor * beamGlow;
    col += vec3(0.9, 1.0, 0.95) * pow(beamGlow, 3.5) * 0.4;
    
    // 3. Central horizontal audio waveform trail (cross-bar scope)
    float horizWave = sin(p.x * 12.0 - u_time * 8.0) * 0.08 * u_bass;
    horizWave += cos(p.x * 48.0) * 0.02 * u_mid;
    
    float horizSdf = abs(p.y - horizWave);
    float horizGlow = (0.0006 + u_level * 0.0006) / (horizSdf + 0.0012);
    // Flickering
    horizGlow *= 0.8 + 0.2 * hash(u_time * 60.0 + 1.2);
    
    vec3 blueColor = vec3(0.0, 0.6, 1.0); // Blue grid crossbar
    col += blueColor * horizGlow;
    col += vec3(0.9, 0.95, 1.0) * pow(horizGlow, 3.0) * 0.3;
    
    // 4. CRT Raster lines and Scanline texture
    float scanline = 0.92 + 0.08 * sin(p.y * 350.0 + u_time * 15.0);
    col *= scanline;
    
    // Vignette / screen border shadowing
    vec2 edge_dist = abs(uv - 0.5);
    float vignette = smoothstep(0.5, 0.45, edge_dist.x) * smoothstep(0.5, 0.45, edge_dist.y);
    col *= vignette;
    
    // Boost contrast
    col = clamp(col, 0.0, 1.0);
    col = pow(col, vec3(0.85));
    
    outColor = vec4(col, 1.0);
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

