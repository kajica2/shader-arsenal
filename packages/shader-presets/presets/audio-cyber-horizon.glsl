// Audio Cyber Horizon
// Retro-futuristic synthwave perspective grid and pulsing neon sun reacting to sound bands

precision highp float;
uniform float u_time;
uniform vec2  u_resolution;
uniform vec2  u_mouse;
uniform float u_bass;
uniform float u_mid;
uniform float u_treble;
uniform float u_level;

void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    vec2 p = (gl_FragCoord.xy - 0.5 * u_resolution) / min(u_resolution.x, u_resolution.y);
    
    // Create sky-to-ground partition
    float horizon = -0.1 + sin(p.x * 2.0 + u_time) * 0.01 * u_mid;
    
    vec3 col = vec3(0.01, 0.005, 0.02); // Sky background
    
    // --- 1. THE GROUND GRID ---
    if (p.y < horizon) {
        // Perspective mapping
        float d = horizon - p.y;
        float depth = 1.0 / d;
        
        // Perspective coordinates
        float x_grid = p.x * depth * 0.5;
        float y_grid = depth * 0.4 + u_time * (0.8 + u_mid * 1.5);
        
        // Grid pattern with smooth anti-aliased lines
        float line_width = 0.05 + 0.1 * smoothstep(1.5, 0.0, depth * 0.05);
        
        float cell_x = abs(fract(x_grid) - 0.5) / fwidth(x_grid);
        float cell_y = abs(fract(y_grid) - 0.5) / fwidth(y_grid);
        
        float grid_lines = min(cell_x, cell_y);
        float grid_mask = 1.0 - smoothstep(0.0, 1.2, grid_lines * line_width);
        
        // Grid line glowing color (cyan pulsing to pink on beats)
        vec3 grid_color = mix(vec3(0.0, 0.9, 1.0), vec3(1.0, 0.0, 0.8), u_bass);
        
        // Add electronic surge wave traveling down the grid lines
        float surge = sin(y_grid * 0.5 - u_time * 8.0) * 0.5 + 0.5;
        grid_color += vec3(1.0) * pow(surge, 8.0) * (u_treble * 1.5 + 0.2);
        
        col = grid_color * grid_mask * smoothstep(0.0, 1.0, d * 4.0);
        
        // Add deep background fog at the horizon
        float fog = exp(-d * 6.0);
        col = mix(col, vec3(0.1, 0.01, 0.12), fog);
    } 
    // --- 2. THE SKY ---
    else {
        // Sunset gradient
        float skyGrad = (p.y - horizon) * 1.5;
        col = mix(vec3(0.4, 0.0, 0.35), vec3(0.05, 0.0, 0.12), clamp(skyGrad, 0.0, 1.0));
        
        // Synthwave horizon mountain silhouettes
        float mountHeight = 0.0;
        for (float i = 1.0; i < 4.0; i++) {
            float speed = i * 0.08;
            float scale = i * 8.0;
            float m = sin(p.x * scale + u_time * speed) * 0.04 / i;
            m += cos(p.x * (scale * 1.5) - i) * 0.02 / i;
            if (p.y - horizon < m + 0.04) {
                col = mix(col, vec3(0.02, 0.0, 0.05) * i, 0.9);
            }
        }
        
        // Pulse neon Sun
        vec2 sun_pos = vec2(0.0, horizon + 0.05);
        float sun_dist = length(p - sun_pos);
        float sun_radius = 0.32 + u_bass * 0.08;
        
        if (sun_dist < sun_radius) {
            // Sun grid slice cutouts
            float slice = fract((p.y - horizon) * 22.0);
            float opacity = smoothstep(0.15, 0.25, p.y - horizon);
            
            if (slice > 0.25 || p.y - horizon < 0.08) {
                // Color gradient for the sun (yellow at bottom, pink at top)
                float sunGrad = (p.y - sun_pos.y) / sun_radius;
                vec3 sun_color = mix(vec3(1.0, 0.8, 0.0), vec3(1.0, 0.0, 0.5), sunGrad);
                
                // Neon core glow beat reactive
                sun_color += vec3(1.0, 0.5, 0.0) * u_bass * 0.3;
                col = sun_color;
            }
        }
        
        // Sun glow bleeding into sky
        float sun_glow = sun_radius / (sun_dist + 0.12);
        col += vec3(1.0, 0.0, 0.6) * pow(sun_glow, 2.5) * 0.35 * (u_bass + 0.5);
        
        // Subtle sky stars twinkling
        float star_hash = fract(sin(dot(floor(p * 45.0), vec2(45.1, 91.7))) * 53456.23);
        if (star_hash > 0.992) {
            float tw = 0.5 + 0.5 * sin(u_time * 8.0 * star_hash);
            col += vec3(0.9, 0.8, 1.0) * tw * u_treble * smoothstep(0.4, 0.9, p.y);
        }
    }
    
    // Contrast and chromatic boost
    col = pow(col, vec3(0.92));
    outColor = vec4(col, 1.0);
}
