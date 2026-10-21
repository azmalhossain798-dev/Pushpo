// Mutations run in an isolated scratch copy; production sources are never edited.
import fs from 'node:fs/promises';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
const scratch=path.resolve('work/pixi-mutation-check'),project=path.resolve('outputs/pushpo-demo');
await fs.mkdir(path.join(scratch,'dist'),{recursive:true});await fs.mkdir(path.join(scratch,'tests'),{recursive:true});
for(const file of ['scene-v3.mjs','pixi-draw.mjs'])await fs.copyFile(path.join(project,'dist',file),path.join(scratch,'dist',file));
for(const file of ['engine-v3.test.mjs','pixi-migration.test.mjs'])await fs.copyFile(path.join(project,'tests',file),path.join(scratch,'tests',file));
const original=await fs.readFile(path.join(project,'dist/engine-v3.mjs'),'utf8');
const mutations=[
 ['civilian protection',"a.kind!=='civilian'&&(a.known||a.aggro)",'true&&(a.known||a.aggro)','engine-v3.test.mjs','sight identifies nearby targets'],
 ['countdown expiry','g.remaining-elapsed','g.remaining+elapsed','engine-v3.test.mjs','timer begins at 15 minutes'],
 ['solid obstruction','&&clearPath(a,p)','&&true','pixi-migration.test.mjs','attacks cannot pass through']
];
let caught=0;
try{
 for(const [name,from,to,file,expected]of mutations){
  if(!original.includes(from))throw Error(`Mutation no longer matches: ${name}`);
  await fs.writeFile(path.join(scratch,'dist/engine-v3.mjs'),original.replace(from,to));
  const result=spawnSync(process.execPath,['--test','--test-reporter=spec',path.join(scratch,'tests',file)],{encoding:'utf8'});
  const output=result.stdout+result.stderr;
  if(result.status===0||!output.includes(expected)||!output.includes('AssertionError'))throw Error(`Mutation was not caught by an assertion: ${name}\n${output}`);
  caught++;console.log(`CAUGHT: ${name}`);
 }
}finally{await fs.writeFile(path.join(scratch,'dist/engine-v3.mjs'),original);}
console.log(`${caught}/${mutations.length} intentional faults detected; scratch source restored.`);
