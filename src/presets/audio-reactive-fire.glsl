// Audio Reactive Fire
// Fire that dances with the audio

precision highp float;
uniform float u_time;
uniform vec2  u_resolution;
uniform vec2  u_mouse;
uniform float u_bass;
uniform float u_mid;
uniform float u_treble;
uniform float u_level;

float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
}

float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(dot(u, vec2(-1.0, 1.0)), dot(u + vec2(1.0, 0.0), vec2(-1.0, 1.0)), u.x),
               mix(dot(u + vec2(0.0, 1.0), vec2(-1.0, 1.0)), dot(u + vec2(1.0, 1.0), vec2(-1.0, 1.0)), u.x),
               u.y);
}

void main() {
    vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution) / u_resolution.y;
    uv.x = (gl_FragCoord.xy - 0.5 * u_resolution) / u_resolution.x;
    vec2 uv0 = uv;
    uv0.y = uv0.y * 2.0 - 1.0; // Center vertically
    
    float t = u_time * 0.5;
    float n = noise(uv0 * 5.0 + t * 0.5);
    n += noise(uv0 * 10.0 - t) * 0.5;
    n = pow(n, 2.0);
    
    // Audio-driven fire intensity
    float fire = n * (0.5 + u_bass * 0.5);
    fire += u_mid * 0.3;
    fire += u_treble * 0.2;
    fire = clamp(fire, 0.0, 1.0);
    
    // Fire color gradient
    vec3 color = vec3(0.0);
    color.r = fire;
    color.g = fire * 0.5;
    color.b = fire * 0.1;
    
    // Add treble-based sparks
    float spark = sin(uv0.x * 100.0 + t * 10.0) * sin(uv0.y * 100.0 - t * 10.0);
    spark = step(0.9, abs(spark)) * u_treble * 0.5;
    color += spark * vec3(1.0, 0.8, 0.2);
    
    // Background
    vec3 bg = vec3(0.0, 0.0, 0.0);
    float bgGradient = smoothstep(0.0, 0.2, uv0.y);
    bg = mix(bg, vec3(0.1, 0.0, 0.0), bgGradient);
    
    gl_FragColor = vec4(mix(bg, color, fire), 1.0);
}
