// Audio Liquid Chroma
// Liquid metallic mercury or organic glass flowing with chromatic aberration and iridescent pearl shading

precision highp float;
uniform float u_time;
uniform vec2  u_resolution;
uniform vec2  u_mouse;
uniform float u_bass;
uniform float u_mid;
uniform float u_treble;
uniform float u_level;

// 2D Rotation
mat2 rot(float a) {
    float c = cos(a), s = sin(a);
    return mat2(c, -s, s, c);
}

// Seamless sine-based noise for metallic warping
float sineNoise(vec2 p) {
    float v = 0.0;
    v += sin(p.x * 2.0 + u_time * 0.4) * 0.5;
    v += sin(p.y * 3.0 - u_time * 0.3) * 0.3;
    p *= rot(0.5);
    v += sin(p.x * 5.0 + u_time * 0.8) * 0.15;
    v += sin(p.y * 8.0 - u_time * 1.2) * 0.05;
    return v;
}

// Complex distortion field (domain warping)
vec2 warp(vec2 p, out float d) {
    vec2 q = vec2(
        sineNoise(p + vec2(0.0, 0.0)),
        sineNoise(p + vec2(5.2, 1.3))
    );
    vec2 r = vec2(
        sineNoise(p + 4.0 * q + vec2(1.7, 9.2) + u_time * 0.15),
        sineNoise(p + 4.0 * q + vec2(8.3, 2.8) + u_time * 0.08)
    );
    d = sineNoise(p + 4.0 * r);
    return r;
}

void main() {
    vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution) / min(u_resolution.x, u_resolution.y);
    vec2 p = uv * (3.0 - u_bass * 0.5); // Zoom into the fluid depending on bass
    
    // Domain warp field
    float density = 0.0;
    vec2 w = warp(p, density);
    
    // Iridescent refraction coloring based on density and coordinate distortion
    vec3 col = vec3(0.0);
    
    // Chromatic aberration setup: Split RGB sampling across warped space
    // Chromatic splitting distance driven by treble levels
    float split = 0.01 + u_treble * 0.06;
    
    // Red Channel
    float dR = 0.0;
    warp(p + vec2(split, 0.0), dR);
    col.r = sin(dR * 4.0 + 0.0) * 0.5 + 0.5;
    
    // Green Channel
    float dG = 0.0;
    warp(p + vec2(0.0, split), dG);
    col.g = sin(dG * 4.0 + 2.094) * 0.5 + 0.5;
    
    // Blue Channel
    float dB = 0.0;
    warp(p - vec2(split, split), dB);
    col.b = sin(dB * 4.0 + 4.188) * 0.5 + 0.5;
    
    // Specular Highlight / Viscous shine based on gradient normals
    float eps = 0.01;
    float d1 = 0.0, d2 = 0.0, d3 = 0.0;
    warp(p + vec2(eps, 0.0), d1);
    warp(p + vec2(0.0, eps), d2);
    warp(p, d3);
    
    vec2 normal = vec2(d1 - d3, d2 - d3) / eps;
    float spec = max(0.0, 1.0 - length(normal) * 0.5);
    spec = pow(spec, 12.0) * (1.2 + u_bass * 0.8);
    
    // Combine base chromatic fluid with high-gloss specular shine
    col = mix(col, vec3(1.0, 1.0, 0.95), spec * 0.7);
    
    // Fluid self-shadowing/depth crevices
    float shadow = smoothstep(0.4, -0.4, density);
    col = mix(col, vec3(0.02, 0.01, 0.05), shadow * 0.4);
    
    // Dark vignetting to frame the movement
    float vign = smoothstep(1.3, 0.4, length(uv));
    col *= vign;
    
    // Boost contrast
    col = smoothstep(0.0, 1.0, col);
    col = pow(col, vec3(0.9));
    
    outColor = vec4(col, 1.0);
}
