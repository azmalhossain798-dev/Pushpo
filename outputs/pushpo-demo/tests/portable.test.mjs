import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';
import {spawnSync} from 'node:child_process';
const base=new URL('../dist/',import.meta.url),read=name=>fs.readFileSync(new URL(name,base),'utf8');
test('portable edition is self-contained, mirrors the download, and includes the pinned renderer',()=>{
 const html=read('offline.html');
 assert.equal(html,fs.readFileSync(new URL('../../pushpo-play.html',import.meta.url),'utf8'));
 assert.equal(read('index.html'),read('index-v3.html'));
 assert(!/<script[^>]*\bsrc\s*=|<link[^>]*\bhref\s*=/i.test(html));
 assert(!/\b(?:src|href)="(?:assets\/|https?:\/\/)/i.test(html));
 assert(html.includes('class PixiPainter'));assert(html.includes('MIT License'));
 assert(html.includes('Unknown'));assert(!/^import .* from /m.test(html));
 const scripts=[...html.matchAll(/<script(?: type="module")?>([\s\S]*?)<\/script>/g)].map(m=>m[1]);
 assert.equal(scripts.length,2);
 const scratch=fs.mkdtempSync(path.join(os.tmpdir(),'pushpo-syntax-'));
 try{
  for(const [i,code]of scripts.entries()){
   const file=path.join(scratch,`${i}.mjs`);fs.writeFileSync(file,code);
   const result=spawnSync(process.execPath,['--check',file],{encoding:'utf8'});assert.equal(result.status,0,result.stderr);
  }
 }finally{
  // Only the two files created above; no recursive deletion or computed parent removal.
  for(const i of scripts.keys())fs.unlinkSync(path.join(scratch,`${i}.mjs`));fs.rmdirSync(scratch);
 }
});
test('vendored PixiJS artifact matches the reviewed upstream release',()=>{
 const bytes=fs.readFileSync(new URL('vendor/pixi-8.22.0.min.js',base));
 assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),'06d9ef9823e743518793083c296d801e752db128cb1f519fbabe37e1259567ea');
});
