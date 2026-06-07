// Audio Reactive Glitch
// Creates glitch effects that pulse with the audio

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
    vec2 p = uv;
    
    // Audio-driven glitch offset
    float glitchAmount = u_bass * 0.1;
    if (glitchAmount > 0.02) {
        float glitch = sin(u_time * 20.0 + uv.y * 100.0) * glitchAmount;
        p.x += glitch;
    }
    
    // Base pattern: moving gradient
    float t = u_time * 0.5;
    float gradient = sin(p.x * 10.0 + t) * sin(p.y * 10.0 - t);
    gradient = (gradient + 1.0) * 0.5;
    
    // Color channels
    vec3 color = vec3(gradient);
    color.r += sin(p.x * 50.0 + t * 2.0) * u_treble * 0.2;
    color.g += sin(p.y * 50.0 + t * 2.0 + 1.0) * u_mid * 0.2;
    color.b += sin(p.x * 50.0 + t * 2.0 + 2.0) * u_bass * 0.2;
    
    // Treble-induced noise
    float noise = sin(p.x * 200.0 + t * 10.0) * sin(p.y * 200.0 - t * 10.0);
    noise = step(0.95, abs(noise)) * u_treble;
    color += noise * 0.3;
    
    gl_FragColor = vec4(color, 1.0);
}
