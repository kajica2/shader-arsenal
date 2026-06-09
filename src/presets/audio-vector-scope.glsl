// Audio Vector Scope
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
