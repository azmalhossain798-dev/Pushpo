import fs from 'node:fs';
const d='outputs/pushpo-demo/dist/';
for(const [p,old,next] of [['art-v3.mjs',"hercules:'assets/hercules-v8.png'","hercules:'assets/hercules-v8.png',companions:'assets/companions-v12.png'"],['art-v3.mjs',"city:'assets/city-v4.png'","city:'assets/city-v12.png'"],['art-v3.mjs',"['city',2,2]","['city',2,2],['companions',2,2]"]]){const name=d+p;fs.writeFileSync(name,fs.readFileSync(name,'utf8').replace(old,next));}
const exp='work/export-demo.mjs';let s=fs.readFileSync(exp,'utf8').replace("city:'city-v4'","city:'city-v12'").replace("hercules:'hercules-v8'","hercules:'hercules-v8',companions:'companions-v12'");fs.writeFileSync(exp,s);
