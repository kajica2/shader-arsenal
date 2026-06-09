import { readdir, readFile, stat } from 'fs/promises';
import { join } from 'path';

const SHADERS_DIR = join(process.cwd(), 'src', 'shaders');
const PRESETS_DIR = join(process.cwd(), 'src', 'presets');

export interface ShaderItem {
  path: string;
  size: number;
}

export async function listShaders(): Promise<ShaderItem[]> {
  const [lygiaFiles, presetFiles] = await Promise.all([
    getShaderFiles(SHADERS_DIR, 'lygia'),
    getShaderFiles(PRESETS_DIR, 'presets')
  ]);
  return [...lygiaFiles, ...presetFiles];
}

export async function getShaderFiles(dir: string, prefix: string): Promise<ShaderItem[]> {
  try {
    const files = await readdir(dir);
    const shaderFiles = await Promise.all(
      files
        .filter(file => file.endsWith('.glsl'))
        .map(async file => {
          const fullPath = join(dir, file);
          const stats = await stat(fullPath);
          return {
            path: `${prefix}/${file}`,
            size: stats.size
          };
        })
    );
    return shaderFiles;
  } catch (error: any) {
    // If directory doesn't exist, return empty array
    if (
      error != null &&
      typeof error === 'object' &&
      'code' in error &&
      error.code === 'ENOENT'
    ) {
      return [];
    }
    // Re-throw if it's not a "directory not found" error
    throw error;
  }
}

export async function readShader(path: string): Promise<string> {
  // Determine if it's a lygia shader or preset
  let fullPath: string;
  if (path.startsWith('lygia/')) {
    fullPath = join(SHADERS_DIR, path);
  } else if (path.startsWith('presets/')) {
    fullPath = join(PRESETS_DIR, path);
  } else {
    // Fallback to shaders directory for backward compatibility
    fullPath = join(SHADERS_DIR, path);
  }
  return readFile(fullPath, 'utf8');
}