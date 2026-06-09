// Audio Vortex Nebula
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
