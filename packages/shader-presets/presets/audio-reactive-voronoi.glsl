// Audio Reactive Voronoi
// Uses audio to distort the voronoi cells

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

void main() {
    vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution) / min(u_resolution.x, u_resolution.y);
    uv *= 1.0 + u_mid * 0.3;
    
    float t = u_time * 0.5;
    int points = int(10.0 + u_bass * 20.0);
    float mindist = 1.0;
    vec2 point;
    
    for (int i = 0; i < points; i++) {
        for (int j = 0; j < points; j++) {
            vec2 offset = vec2(float(i), float(j));
            vec2 p = offset + vec2(sin(t + offset.x * 0.1), cos(t + offset.y * 0.1)) * (u_treble * 0.2);
            float h = hash(p);
            p += vec2(h, h * 0.5) * 0.5;
            vec2 diff = uv - p;
            float dist = dot(diff, diff);
            if (dist < mindist) {
                mindist = dist;
                point = p;
            }
        }
    }
    
    float dist = sqrt(mindist);
    float edge = smoothstep(0.0, 0.02, dist);
    float center = smoothstep(0.02, 0.03, dist);
    float line = edge - center;
    
    vec3 color = vec3(0.1);
    color = mix(color, vec3(0.8, 0.2, 0.6), line * 0.5);
    color = mix(color, vec3(0.2, 0.6, 0.8), u_level * 0.5);
    
    outColor = vec4(color, 1.0);
}
