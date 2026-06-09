// Audio Hypercube Folding
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
