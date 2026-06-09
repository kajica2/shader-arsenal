// Audio Cosmic Supernova
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
