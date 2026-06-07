// Audio Reactive Plasma
// Uses bass to drive color shift, mid for scale, treble for detail

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
    uv *= 1.0 + u_mid * 0.5;
    
    float t = u_time * 0.5;
    float c = sin(uv.x * 10.0 + t) * sin(uv.y * 10.0 + t);
    c += sin(uv.x * 20.0 - t) * sin(uv.y * 20.0 - t);
    c += sin(uv.x * 30.0 + t*2.0) * sin(uv.y * 30.0 - t*2.0);
    
    vec3 color = vec3(0.0);
    color.r = 0.5 + 0.5 * sin(c * 10.0 + u_bass * 2.0 + t);
    color.g = 0.5 + 0.5 * sin(c * 10.0 + u_bass * 2.0 + t + 2.0);
    color.b = 0.5 + 0.5 * sin(c * 10.0 + u_bass * 2.0 + t + 4.0);
    
    // Add treble-based sparkle
    float spark = sin(uv.x * 100.0 + t * 10.0) * sin(uv.y * 100.0 - t * 10.0);
    spark = step(0.9, abs(spark)) * u_treble;
    color += spark * 0.5;
    
    gl_FragColor = vec4(color, 1.0);
}
