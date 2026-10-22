import fs from 'node:fs';
const p='outputs/pushpo-demo/dist/art-v3.mjs';let s=fs.readFileSync(p,'utf8');const start=s.indexOf(' buildFuchkaArt(){'),end=s.indexOf(' buildCity(){',start);
s=s.slice(0,start)+` buildFuchkaArt(){
  const canvas=document.createElement('canvas');canvas.width=220;canvas.height=240;const c=canvas.getContext('2d');
  // A complete street counter, rather than a small overlay on a tea cart.
  segment(c,[31,190],[31,46],5,'#65472d');segment(c,[190,180],[190,46],5,'#65472d');
  poly(c,[{x:22,y:150},{x:153,y:137},{x:195,y:159},{x:64,y:178}],'#d2b17b','#67492f',2);
  poly(c,[{x:23,y:153},{x:64,y:178},{x:64,y:223},{x:23,y:197}],'#744731','#503624',2);
  poly(c,[{x:64,y:178},{x:195,y:159},{x:195,y:207},{x:64,y:223}],'#27685b','#503624',2);
  rr(c,81,184,98,22,2,'#efe3bb','#ba883f',1);text(c,'ফুচকা',130,201,18,'#723321');
  // Glass display case, golden shells and filling bowls.
  poly(c,[{x:38,y:100},{x:125,y:92},{x:144,y:108},{x:56,y:119}],'#b6d7cc60','#e6dfbc',1.5);
  poly(c,[{x:56,y:119},{x:144,y:108},{x:144,y:150},{x:56,y:161}],'#cae6d530','#e6dfbc',1.5);
  poly(c,[{x:38,y:100},{x:56,y:119},{x:56,y:161},{x:38,y:143}],'#a6d1c030','#e6dfbc',1.5);
  for(let j=0;j<19;j++){const x=62+(j%6)*12,y=145-Math.floor(j/6)*9;oval(c,x,y,6,4.5,'#dca34a','#86582f',.8);oval(c,x,y-1,1.3,1,'#755b2d');}
  for(const [x,y,col]of [[159,147,'#7b583a'],[179,143,'#a19a50']]){oval(c,x,y,11,5,'#c4cbbb','#f0e7c7',1);oval(c,x,y-1,8,3,col);}
  segment(c,[160,143],[170,123],2,'#e0d9be');rr(c,181,121,9,16,2,'#a6b8ac','#ecdfb5',1);
  segment(c,[69,219],[69,233],4,'#4c3c30');segment(c,[185,209],[185,223],4,'#4c3c30');
  poly(c,[{x:13,y:38},{x:167,y:26},{x:207,y:52},{x:50,y:67}],'#b53e36','#e7bb6b',2);
  for(let i=0;i<8;i++)poly(c,[{x:15+i*19,y:38-i*1.5},{x:25+i*19,y:37-i*1.5},{x:61+i*19,y:66-i*1.8},{x:50+i*19,y:67-i*1.8}],i%2?'#f1d19c':'#db6847');
  rr(c,53,67,143,26,3,'#74322f','#e9bf74',1.5);text(c,'ফুচকা • FUCHKA',124,85,14,'#fff0bd');
  this.fuchkaArt=canvas;
 }
`+s.slice(end);
s=s.replace('y-o.width*1.1,o.width,o.width*1.1','y-o.width*240/220+12,o.width,o.width*240/220');fs.writeFileSync(p,s);
const gp='outputs/pushpo-demo/dist/game-v3.mjs';s=fs.readFileSync(gp,'utf8').replace("['mirror-cd',p.mirrorCooldown??0]","['mirror-cd',p.mirrorTime>0?0:p.mirrorCooldown??0]");fs.writeFileSync(gp,s);
