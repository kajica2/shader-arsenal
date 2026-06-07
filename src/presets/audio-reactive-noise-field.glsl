// Audio Reactive Noise Field
// Uses audio to drive noise parameters

precision highp float;
uniform float u_time;
uniform vec2  u_resolution;
uniform vec2  u_mouse;
uniform float u_bass;
uniform float u_mid;
uniform float u_treble;
uniform float u_level;

float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(
        mix(dot(u, vec2(-1.0, 1.0)), dot(u + vec2(1.0, 0.0), vec2(-1.0, 1.0)), u.x),
        mix(dot(u + vec2(0.0, 1.0), vec2(-1.0, 1.0)), dot(u + vec2(1.0, 1.0), vec2(-1.0, 1.0)), u.x),
        u.y
    );
}

void main() {
    vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution) / min(u_resolution.x, u_resolution.y);
    uv *= 1.0 + u_mid * 0.5;
    
    float t = u_time * 0.5;
    float n = noise(uv * 5.0 + t * 0.5);
    n += noise(uv * 10.0 - t) * 0.5;
    n += noise(uv * 20.0 + t * 2.0) * 0.25;
    
    // Audio-driven color shift
    vec3 color = vec3(n);
    color.r += u_bass * 0.3;
    color.g += u_mid * 0.3;
    color.b += u_treble * 0.3;
    color = mod(color * 2.0, 1.0);
    
    // Add treble-based detail
    float detail = sin(uv.x * 100.0 + t * 10.0) * sin(uv.y * 100.0 - t * 10.0);
    detail = step(0.9, abs(detail)) * u_treble;
    color += detail * 0.5;
    
    gl_FragColor = vec4(color, 1.0);
}
