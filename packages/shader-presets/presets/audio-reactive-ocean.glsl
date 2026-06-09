// Audio Reactive Ocean
// Ocean waves that respond to audio

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
    float wave1 = sin(uv0.x * 5.0 - t * 2.0) * 0.5;
    wave1 += sin(uv0.x * 10.0 - t * 3.0 + uv0.y * 2.0) * 0.3;
    float wave2 = sin(uv0.x * 3.0 + t * 1.5) * 0.4;
    wave2 += sin(uv0.x * 7.0 + t * 2.0 + uv0.y * 1.5) * 0.2;
    
    // Audio-driven wave height and speed
    float height = 0.2 + u_bass * 0.3;
    float speed = 0.5 + u_mid * 0.5;
    float chop = u_treble * 0.2;
    
    float wave = (wave1 + wave2) * height;
    wave += sin(uv0.x * 50.0 + t * speed) * chop * 0.1;
    
    // Ocean color
    vec3 shallow = vec3(0.0, 0.3, 0.6);
    vec3 deep = vec3(0.0, 0.1, 0.3);
    float depth = smoothstep(-0.5, 0.5, uv0.y);
    vec3 color = mix(deep, shallow, depth);
    
    // Wave foam
    float foam = smoothstep(0.0, 0.05, wave) * smoothstep(0.95, 1.0, wave);
    foam *= 1.0 - depth; // More foam near shore
    color = mix(color, vec3(1.0, 1.0, 1.0), foam * 0.5);
    
    // Add treble-based spray
    float spray = sin(uv0.x * 200.0 + t * 10.0) * sin(uv0.y * 200.0 - t * 10.0);
    spray = step(0.9, abs(spray)) * u_treble * 0.3;
    color += spray * vec3(1.0, 1.0, 1.0);
    
    outColor = vec4(color, 1.0);
}
