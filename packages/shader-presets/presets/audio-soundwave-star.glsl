// Audio Soundwave Star
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
