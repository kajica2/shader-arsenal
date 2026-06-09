// Audio Kaleidoscope
// Creates a kaleidoscopic pattern that reacts to audio

precision highp float;
uniform float u_time;
uniform vec2  u_resolution;
uniform vec2  u_mouse;
uniform float u_bass;
uniform float u_mid;
uniform float u_treble;
uniform float u_level;

vec2 rotate2d(vec2 v, float a) {
    float s = sin(a);
    float c = cos(a);
    return vec2(c * v.x - s * v.y, s * v.x + c * v.y);
}

void main() {
    vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution) / min(u_resolution.x, u_resolution.y);
    float angle = atan(uv.y, uv.x);
    float radius = length(uv);
    
    // Create kaleidoscope by repeating the angle
    float slice = 2.0 * 3.14159 / 6.0; // 6 slices
    float modAngle = mod(angle, slice);
    if (modAngle > slice * 0.5) {
        modAngle = slice - modAngle;
    }
    vec2 uv2 = vec2(cos(modAngle), sin(modAngle)) * radius;
    
    float t = u_time * 0.5;
    float wave = sin(uv2.x * 20.0 + t) * sin(uv2.y * 20.0 + t);
    wave += sin(uv2.x * 30.0 - t) * sin(uv2.y * 30.0 - t) * 0.5;
    
    // Audio modulation
    float scale = 1.0 + u_bass * 0.5;
    uv2 *= scale;
    wave = sin(uv2.x * 10.0 + t) * sin(uv2.y * 10.0 - t);
    
    vec3 color = vec3(wave * 0.5 + 0.5);
    color = mix(color, vec3(0.2, 0.8, 0.2), u_mid * 0.5);
    color = mix(color, vec3(0.8, 0.2, 0.2), u_treble * 0.5);
    
    outColor = vec4(color, 1.0);
}
