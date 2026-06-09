// Audio Sacred Geometry
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
