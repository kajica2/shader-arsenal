// Audio Neon Cyberpunk
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
