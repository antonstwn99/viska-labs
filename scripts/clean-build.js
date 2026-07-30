const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const buildDir = path.join(projectRoot, 'build');
const strayAssetsDir = path.join(projectRoot, 'assets');

for (const dir of [buildDir, strayAssetsDir]) {
  fs.rmSync(dir, { recursive: true, force: true });
}
