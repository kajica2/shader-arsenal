// Audio Waveform Water
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
    
    gl_FragColor = vec4(color, 1.0);
}
