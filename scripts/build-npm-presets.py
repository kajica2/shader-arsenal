import os
import shutil
import re

def camel_case(s):
    # Convert kebab-case or snake_case to camelCase
    parts = re.split(r'[-_]', s)
    return parts[0].lower() + "".join(x.title() for x in parts[1:])

def main():
    base_dir = "/Users/kajicadjuric/shader-arsenal"
    presets_src_dir = os.path.join(base_dir, "src", "presets")
    pkg_dir = os.path.join(base_dir, "packages", "shader-presets")
    
    os.makedirs(pkg_dir, exist_ok=True)
    os.makedirs(os.path.join(pkg_dir, "presets"), exist_ok=True)
    
    # 1. Copy GLSL presets
    glsl_files = []
    for f in os.listdir(presets_src_dir):
        if f.endswith(".glsl"):
            src_file = os.path.join(presets_src_dir, f)
            dest_file = os.path.join(pkg_dir, "presets", f)
            shutil.copy2(src_file, dest_file)
            glsl_files.append(f)
            
    glsl_files.sort()
    
    # 2. Generate ESM, CommonJS and TypeScript code
    esm_exports = []
    cjs_exports = []
    ts_declarations = []
    
    index_esm_content = ""
    index_cjs_content = "var fs = require('fs');\nvar path = require('path');\n\n"
    index_ts_content = ""
    
    for f in glsl_files:
        name_without_ext = f.replace(".glsl", "")
        var_name = camel_case(name_without_ext)
        src_path = os.path.join(presets_src_dir, f)
        
        with open(src_path, "r", encoding="utf-8") as file:
            content = file.read()
            
        # Escape backticks and backslashes for JS Template Literals
        escaped_content = content.replace("\\", "\\\\").replace("`", "\\`").replace("${", "\\${")
        
        # ESM
        index_esm_content += f"export const {var_name} = `{escaped_content}`;\n\n"
        
        # CJS
        index_cjs_content += f"exports.{var_name} = `{escaped_content}`;\n\n"
        
        # TS
        index_ts_content += f"export const {var_name}: string;\n"
        
    # Write files
    with open(os.path.join(pkg_dir, "index.mjs"), "w", encoding="utf-8") as f_esm:
        f_esm.write(index_esm_content)
        
    with open(os.path.join(pkg_dir, "index.js"), "w", encoding="utf-8") as f_cjs:
        f_cjs.write(index_cjs_content)
        
    with open(os.path.join(pkg_dir, "index.d.ts"), "w", encoding="utf-8") as f_ts:
        f_ts.write(index_ts_content)
        
    # 3. Create package.json
    package_json_content = """{
  "name": "shader-arsenal-presets",
  "version": "1.0.0",
  "description": "Premium audio-reactive GLSL preset library bundled for modern JS/TS and raw GLSL pipelines.",
  "main": "index.js",
  "module": "index.mjs",
  "types": "index.d.ts",
  "files": [
    "index.js",
    "index.mjs",
    "index.d.ts",
    "presets"
  ],
  "keywords": [
    "glsl",
    "shaders",
    "audio-reactive",
    "webgl",
    "presets",
    "threejs",
    "lygia"
  ],
  "author": "Kai Djuric",
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "git+https://github.com/kajica2/shader-arsenal.git"
  }
}
"""
    with open(os.path.join(pkg_dir, "package.json"), "w", encoding="utf-8") as f_pkg:
        f_pkg.write(package_json_content)
        
    # 4. Create README.md
    readme_content = """# shader-arsenal-presets

A working arsenal of hand-crafted, high-fidelity, audio-reactive GLSL presets curated by **Kai Djuric**.

These presets are compatible with WebGL/WebGL2, Three.js, Synesthesia, and any standard shader pipeline. Each preset exposes unified uniforms:

- `u_time` (float): Elapsed time in seconds.
- `u_resolution` (vec2): Render target dimensions.
- `u_mouse` (vec2): Mouse coordinates.
- `u_bass`, `u_mid`, `u_treble`, `u_level` (float): Real-time audio frequency bands.

## Installation

```bash
npm install shader-arsenal-presets
```

## Usage

### In Modern JS/ESM (Vite, Next.js, Rollup, webpack)

You can import any preset directly as a JavaScript string:

```javascript
import { audioReactivePlasma, audioWaveformTunnel } from 'shader-arsenal-presets';

// Use it directly in your Three.js ShaderMaterial:
const material = new THREE.ShaderMaterial({
  fragmentShader: audioReactivePlasma,
  uniforms: {
    u_time: { value: 0 },
    u_resolution: { value: new THREE.Vector2() },
    u_bass: { value: 0 },
    u_mid: { value: 0 },
    u_treble: { value: 0 },
  }
});
```

### In CommonJS (Node.js)

```javascript
const { audioReactivePlasma } = require('shader-arsenal-presets');
```

### Accessing Raw GLSL Files

Raw `.glsl` source files are also bundled within the package under `/presets/`:

```javascript
// Webpack or Vite using raw-loader or similar:
import rawPlasmaShader from 'shader-arsenal-presets/presets/audio-reactive-plasma.glsl?raw';
```

## Available Presets

"""
    for f in glsl_files:
        name_without_ext = f.replace(".glsl", "")
        readme_content += f"- `{name_without_ext}` (imported as `{camel_case(name_without_ext)}`)\n"
        
    readme_content += "\n## License\n\nMIT\n"
    
    with open(os.path.join(pkg_dir, "README.md"), "w", encoding="utf-8") as f_readme:
        f_readme.write(readme_content)
        
    print(f"Successfully built npm package in: {pkg_dir}")
    print(f"Packed {len(glsl_files)} presets!")

if __name__ == "__main__":
    main()
