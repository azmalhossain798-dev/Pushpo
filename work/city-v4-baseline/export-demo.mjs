import fs from 'node:fs';
import path from 'node:path';
const out=path.resolve('outputs');
const source=path.join(out,'pushpo-demo','dist');
let html=fs.readFileSync(path.join(source,'index.html'),'utf8');
const css=fs.readFileSync(path.join(source,'style-v2.css'),'utf8');
const flatten=name=>fs.readFileSync(path.join(source,name),'utf8').replace(/^import .*;\r?\n/gm,'').replace(/^export /gm,'');
const scene=flatten('scene-v3.mjs'),engine=flatten('engine-v3.mjs'),game=flatten('game-v3.mjs');
let art=flatten('art-v3.mjs');
const pixiDraw=flatten('pixi-draw.mjs'),pixiRenderer=flatten('pixi-renderer.mjs');
const vendor=fs.readFileSync(path.join(source,'vendor/pixi-8.22.0.min.js'),'utf8').replace(/\/\/# sourceMappingURL=.*$/m,'');
const license=fs.readFileSync(path.join(source,'vendor/PIXI-LICENSE.txt'),'utf8');
const assets={};
for(const [name,file] of Object.entries({characters:'characters',buildings:'buildings',portrait:'portrait',bosses:'bosses-v3',props:'props-v3',backs:'backs-v3',decor:'decor-v3'})){
 assets[name]='data:image/png;base64,'+fs.readFileSync(path.join(source,'assets',file+'.png')).toString('base64');
 art=art.replaceAll(`'assets/${file}.png'`,`ASSET_URLS.${name}`);
 html=html.replaceAll(`src="assets/${file}.png"`,`data-asset="${name}"`);
}
const setup=`const ASSET_URLS=${JSON.stringify(assets)};\ndocument.querySelectorAll('img[data-asset]').forEach(img=>img.src=ASSET_URLS[img.dataset.asset]);`;
html=html.replace('<link rel="stylesheet" href="style-v2.css">',()=>`<style>${css}</style>`);
html=html.replace('<script src="vendor/pixi-8.22.0.min.js"></script>',()=>`<script>/* ${license} */\n${vendor.replace(/<\/script/gi,'<\\/script')}</script>`);
html=html.replace('<script type="module" src="game-v3.mjs"></script>',()=>`<script type="module">\n${setup}\n${scene}\n${engine}\n${art}\n${pixiDraw}\n${pixiRenderer}\n${game}\n</script>`);
const target=path.join(out,'pushpo-play.html');
fs.writeFileSync(target,html);
fs.writeFileSync(path.join(source,'offline.html'),html);
console.log(`Created ${target} (${(Buffer.byteLength(html)/1048576).toFixed(1)} MB)`);
