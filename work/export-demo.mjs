import fs from 'node:fs';
import path from 'node:path';
const out=path.resolve('outputs');
const source=path.join(out,'pushpo-demo','dist');
let html=fs.readFileSync(path.join(source,'index.html'),'utf8');
const css=fs.readFileSync(path.join(source,'style-v2.css'),'utf8');
const flatten=name=>fs.readFileSync(path.join(source,name),'utf8').replace(/^import .*;\r?\n/gm,'').replace(/^export /gm,'');
const scene=flatten('scene-v3.mjs'),citySystems=flatten('city-systems.mjs'),environment=flatten('environment-v5.mjs'),traffic=flatten('traffic-v5.mjs'),pedestrian=flatten('pedestrian-v5.mjs'),story=flatten('story-v6.mjs'),homes=flatten('homes-v6.mjs'),combat=flatten('combat-v7.mjs'),story8=flatten('story-v8.mjs'),hercules=flatten('hercules-v8.mjs'),engine=flatten('engine-v3.mjs'),cityArt=flatten('city-art.mjs'),game=flatten('game-v3.mjs');
let art=flatten('art-v3.mjs');
const pixiDraw=flatten('pixi-draw.mjs'),pixiRenderer=flatten('pixi-renderer.mjs');
const storyUi=flatten('story-ui-v8.mjs');
const finale=flatten('final-v9.mjs'),boulevards=flatten('boulevards-v11.mjs');
const worldSystems=flatten('world-v10.mjs'),worldUi=flatten('world-ui-v10.mjs');
const vendor=fs.readFileSync(path.join(source,'vendor/pixi-8.22.0.min.js'),'utf8').replace(/\/\/# sourceMappingURL=.*$/m,'');
const license=fs.readFileSync(path.join(source,'vendor/PIXI-LICENSE.txt'),'utf8');
const assets={};
for(const [name,file] of Object.entries({characters:'characters',buildings:'buildings',portrait:'portrait',bosses:'bosses-v3',props:'props-v3',backs:'backs-v3',decor:'decor-v3',people:'people-v4',city:'city-v12',street:'street-v4',rickshaw:'rickshaw-v5',hercules:'hercules-v8',companions:'companions-v12'})){
 assets[name]='data:image/png;base64,'+fs.readFileSync(path.join(source,'assets',file+'.png')).toString('base64');
 art=art.replaceAll(`'assets/${file}.png'`,`ASSET_URLS.${name}`);
 html=html.replaceAll(`src="assets/${file}.png"`,`data-asset="${name}"`);
}
const setup=`const ASSET_URLS=${JSON.stringify(assets)};\ndocument.querySelectorAll('img[data-asset]').forEach(img=>img.src=ASSET_URLS[img.dataset.asset]);`;
html=html.replace('<link rel="stylesheet" href="style-v2.css">',()=>`<style>${css}</style>`);
html=html.replace('<script src="vendor/pixi-8.22.0.min.js"></script>',()=>`<script>/* ${license} */\n${vendor.replace(/<\/script/gi,'<\\/script')}</script>`);
html=html.replace('<script type="module" src="game-v3.mjs"></script>',()=>`<script type="module">\n${setup}\n${scene}\n${citySystems}\n${environment}\n${traffic}\n${pedestrian}\n${story}\n${homes}\n${combat}\n${story8}\n${finale}\n${worldSystems}\n${hercules}\n${engine}\n${cityArt}\n${boulevards}\n${art}\n${pixiDraw}\n${pixiRenderer}\n${storyUi}\n${worldUi}\n${game}\n</script>`);
const target=path.join(out,'pushpo-play.html');
fs.writeFileSync(target,html);
fs.writeFileSync(path.join(source,'offline.html'),html);
console.log(`Created ${target} (${(Buffer.byteLength(html)/1048576).toFixed(1)} MB)`);
