import JSZip from 'jszip';

// List of extensions to include in the analysis
const ALLOWED_EXTENSIONS = new Set([
  'js', 'jsx', 'ts', 'tsx', 'py', 'java', 'c', 'cpp', 'h', 'hpp', 
  'cs', 'go', 'rs', 'php', 'rb', 'swift', 'kt', 'scala', 'html', 
  'css', 'scss', 'json', 'md', 'sql', 'sh', 'yaml', 'yml', 'toml'
]);

// Directories to ignore
const IGNORED_DIRS = ['node_modules', '.git', 'dist', 'build', 'coverage', '__pycache__', 'venv', 'bin', 'obj'];

export const processZipFile = async (file: File): Promise<{ content: string; name: string }> => {
  const zip = new JSZip();
  let loadedZip;
  
  try {
    loadedZip = await zip.loadAsync(file);
  } catch (e) {
    throw new Error("Failed to load zip file. Please ensure it is a valid zip archive.");
  }

  let combinedCode = "";
  const filePromises: Promise<void>[] = [];
  const projectName = file.name.replace(/\.zip$/i, '');

  loadedZip.forEach((relativePath, zipEntry) => {
    if (zipEntry.dir) return;

    // Check for ignored directories
    if (IGNORED_DIRS.some(dir => relativePath.includes(`${dir}/`))) return;

    // Check extension
    const ext = relativePath.split('.').pop()?.toLowerCase();
    if (!ext || !ALLOWED_EXTENSIONS.has(ext)) return;

    // Check file size (skip very large files > 1MB to avoid token waste on generated assets)
    // zipEntry is strictly not the file object so checking size requires reading metadata or assumption.
    // JSZip entries usually have _data.uncompressedSize but it's internal.
    // We'll filter strictly by extension and hope for the best.

    const promise = zipEntry.async('string').then(content => {
      // Basic heuristic to avoid minified code
      if (content.length > 500 && content.split('\n').length < 5) return;
      
      combinedCode += `\n--- FILE: ${relativePath} ---\n${content}\n`;
    });

    filePromises.push(promise);
  });

  await Promise.all(filePromises);

  if (combinedCode.length === 0) {
    throw new Error("No valid code files found in the zip. Supported extensions: .js, .ts, .py, etc.");
  }

  return { content: combinedCode, name: projectName };
};
