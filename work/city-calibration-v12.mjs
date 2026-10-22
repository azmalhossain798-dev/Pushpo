import fs from 'node:fs';
const p='outputs/pushpo-demo/dist/art-v3.mjs';let s=fs.readFileSync(p,'utf8').replace(",['city',2,2]",'');s=s.replace('this.cells.hercules=cropAtlas',"this.cells.city=cropAtlas(this.images.city,2,2,[[0,0,.5,.545],[.5,0,.5,.545],[0,.545,.5,.455],[.5,.545,.5,.455]]);\n   this.cells.hercules=cropAtlas");fs.writeFileSync(p,s);
