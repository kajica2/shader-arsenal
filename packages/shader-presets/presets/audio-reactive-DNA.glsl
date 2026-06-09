// Audio Reactive DNA
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
