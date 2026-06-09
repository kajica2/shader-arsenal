// Audio Waveform Tunnel
// Creates a tunnel that pulses with the audio

precision highp float;
uniform float u_time;
uniform vec2  u_resolution;
uniform vec2  u_mouse;
uniform float u_bass;
uniform float u_mid;
uniform float u_treble;
uniform float u_level;

void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution;
    uv = uv * 2.0 - 1.0;
    uv.x *= u_resolution.x / u_resolution.y;
    
    float angle = atan(uv.y, uv.x);
    float radius = length(uv);
    
    float wave = sin(angle * 20.0 - u_time * 5.0 + radius * 10.0);
    wave += sin(angle * 40.0 - u_time * 10.0 + radius * 20.0) * 0.5;
    
    float pulse = 1.0 + u_bass * 0.5;
    radius = radius * pulse;
    
    float dist = abs(fract(wave * 0.5) - 0.5) * 2.0;
    float intensity = smoothstep(0.02, 0.0, dist);
    
    vec3 color = vec3(intensity);
    color = mix(color, vec3(0.2, 0.0, 0.5), u_treble);
    color = mix(color, vec3(0.0, 0.5, 0.2), u_mid);
    
    outColor = vec4(color, 1.0);
}
