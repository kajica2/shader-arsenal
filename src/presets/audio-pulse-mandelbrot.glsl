// Audio Pulse Mandelbrot
// Mandelbrot set with audio-driven zoom and offset

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
    float zoom = 1.0 / (0.5 + u_bass * 2.0); // Bass zooms in
    vec2 offset = vec2(sin(u_time * 0.2) * u_mid, cos(u_time * 0.3) * u_mid) * 0.5;
    uv = uv * zoom + offset;
    
    vec2 c = uv;
    vec2 z = vec2(0.0);
    int maxIter = int(20.0 + u_treble * 30.0);
    int iter = 0;
    for (int i = 0; i < maxIter; i++) {
        if (dot(z, z) > 4.0) break;
        z = vec2(z.x * z.x - z.y * z.y, 2.0 * z.x * z.y) + c;
        iter++;
    }
    
    float t = float(iter) / float(maxIter);
    t = smoothstep(0.0, 1.0, t);
    vec3 color = vec3(t);
    color = mix(color, vec3(0.2, 0.0, 0.5), t * 0.5);
    color = mix(color, vec3(0.0, 0.5, 0.2), t * 0.5);
    
    gl_FragColor = vec4(color, 1.0);
}
