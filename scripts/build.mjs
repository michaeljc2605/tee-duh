import { cp, mkdir, rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = path.join(root, 'dist');
await rm(out, { recursive: true, force: true });
await mkdir(out, { recursive: true });
for (const item of ['index.html','styles.css','app.js','background.css','background.js','assets','docs','.nojekyll']) {
  await cp(path.join(root,item), path.join(out,item), {recursive:true});
}
console.log('Built portable static site in dist/. All local URLs are relative for /tee-duh/.');
