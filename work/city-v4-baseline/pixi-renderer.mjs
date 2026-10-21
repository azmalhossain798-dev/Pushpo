import {Painter} from './art-v3.mjs';
import {PixiDraw,rendererSize} from './pixi-draw.mjs';
export class PixiPainter extends Painter{
 constructor(canvas){
  const draw=new PixiDraw(globalThis.PIXI);
  super(canvas,draw);this.draw=draw;this.disposed=false;this.initialized=false;
  this.app=new globalThis.PIXI.Application();
  const artwork=this.ready;
  this.ready=(async()=>{
   await this.app.init({canvas,preference:'webgl',autoStart:false,sharedTicker:false,
    width:1,height:1,resolution:1,autoDensity:false,antialias:true,background:'#ad9574',
    eventFeatures:{move:false,globalMove:false,click:false,wheel:false}});
   this.initialized=true;
   this.app.stage.eventMode='none';draw.attach(this.app.stage);
   await artwork;
   if(this.disposed){this.release();return;}
   this.resize();canvas.dataset.renderer=`PixiJS ${globalThis.PIXI.VERSION} / WebGL`;
  })();
 }
 resize(){
  if(!this.initialized||this.disposed)return;
  const r=this.canvas.getBoundingClientRect(),size=rendererSize(r.width,r.height,devicePixelRatio||1);
  Object.assign(this.view,size);this.app.renderer.resize(size.width,size.height,size.dpr);
 }
 render(g,t,started){
  if(!this.initialized||!this.loaded||this.disposed)return;
  if(this.view.dpr!==Math.min(devicePixelRatio||1,2))this.resize();
  this.draw.beginFrame(this.view.dpr);super.render(g,t,started);this.draw.endFrame();this.app.render();
 }
 release(){
  if(this.released||!this.initialized)return;this.released=true;
  this.draw.destroy();this.app.destroy(false,{children:true});
  this.floor=null;this.images={};this.cells={};
 }
 destroy(){
  if(this.disposed)return;this.disposed=true;
  // Initialization may still be waiting for images or a WebGL device.
  this.ready.then(()=>this.release(),()=>this.release());
 }
}
