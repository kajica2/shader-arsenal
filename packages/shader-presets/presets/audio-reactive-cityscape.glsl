// Audio Reactive Cityscape
// Buildings that pulse with the audio beat

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
    uv.y = -uv.y; // Flip y so city grows up
    
    // Create building grid
    float grid = 0.2;
    vec2 cell = floor(uv / grid);
    vec2 pos = uv - cell * grid;
    
    // Building height based on audio and position
    float height = 0.1 + sin(cell.x * 0.5 + u_time * 0.2) * 0.2;
    height += sin(cell.y * 0.5 + u_time * 0.3) * 0.2;
    height += u_bass * 0.5; // Bass makes buildings taller
    
    // Windows
    float windowY = mod(pos.y * 20.0, 1.0);
    float windowX = mod(pos.x * 20.0, 1.0);
    float windows = step(0.85, windowY) * step(0.85, windowX);
    windows *= step(0.0, pos.y) * step(pos.y, height);
    
    // Building color
    vec3 color = vec3(0.1, 0.1, 0.15);
    color = mix(color, vec3(0.0, 0.3, 0.6), windows * 0.5);
    color = mix(color, vec3(0.2, 0.2, 0.2), 1.0 - smoothstep(0.0, height, pos.y));
    
    // Audio treble makes windows blink
    float blink = sin(u_time * 10.0 + cell.x * 10.0 + cell.y * 10.0);
    blink = step(0.0, blink) * u_treble;
    color += blink * 0.3;
    
    outColor = vec4(color, 1.0);
}
