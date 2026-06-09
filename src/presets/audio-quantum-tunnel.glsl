// Audio Quantum Tunnel
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
