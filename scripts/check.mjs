import { readFile, access } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const html=await readFile(path.join(root,'index.html'),'utf8');
const app=await readFile(path.join(root,'app.js'),'utf8');
const errors=[];
const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
if(new Set(ids).size!==ids.length) errors.push('Duplicate HTML ids.');
for(const match of html.matchAll(/\b(?:src|href)="([^"]+)"/g)){
  const target=match[1];
  if(target.startsWith('#')){if(!ids.includes(target.slice(1)))errors.push(`Missing anchor ${target}`);continue;}
  if(/^(https?:|data:|mailto:)/.test(target))continue;
  if(target.startsWith('/'))errors.push(`Root-relative URL breaks project hosting: ${target}`);
  try{await access(path.join(root,target.split(/[?#]/)[0]));}catch{errors.push(`Missing local file: ${target}`);}
}
for(const match of app.matchAll(/image:\s*'([^']+)'/g)){
  try{await access(path.join(root,'assets/screens',match[1]));}catch{errors.push(`Missing walkthrough screen ${match[1]}`);}
}
for(const match of html.matchAll(/<img\b[^>]*>/g)) if(!/\balt="[^"]*"/.test(match[0]))errors.push('Image missing alt text.');
for(const match of html.matchAll(/<a\b[^>]*target="_blank"[^>]*>/g))if(!/\brel="[^"]*noopener/.test(match[0]))errors.push('External tab link missing noopener.');
for(const match of app.matchAll(/\$\('([^']+)'\)/g))if(!ids.includes(match[1]))errors.push(`Script references missing id ${match[1]}`);
if(!html.includes('https://michaeljc2605.github.io/teduh-site/'))errors.push('Missing original demo URL.');
if(!html.includes('Design personas'))errors.push('Persona evidence label is missing.');
for(const file of ['app.js','background.js','scripts/build.mjs'])execFileSync(process.execPath,['--check',path.join(root,file)]);
if(errors.length){console.error(errors.join('\n'));process.exit(1);}
console.log(`Passed: ${ids.length} unique IDs, local assets, anchors, walkthrough screens, image alternatives, links, persona evidence and JavaScript syntax.`);
