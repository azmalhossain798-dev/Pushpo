export const RAPIST_APPROACH_LINE='আমি নষ্ট মনে নষ্ট চোখে দেখি তোমাকে';
export const BOSS_STORY=Object.freeze([
 {id:'sumon-note',kind:'verdict',title:'সুমন মিয়া',text:'সঠিক আইন ও বিচারের অভাবে নিজের উপর হওয়া অন্যায়ের বিচার আমি নিজে নিজেই করবো!\n\nআমাকে CNG করে তুলে নিয়ে যাওয়ার অপরাধে সুমন মিয়ার মৃত্যুদণ্ড কার্যকর হলো'},
 {id:'sumon-reflection',kind:'reflection',title:'পুষ্পোর ভাবনা',text:'সুমন মিয়া কি যেন বললো? .... উম... ও সব দোষ ঐ হাফিজুর রহমানের?? তার মানে আমাকে ১ সপ্তাহ ধরে চোখে কাপড় বেঁধে যে এত কিছু করেছে, সেই হাফিজুর রহমান!'},
 {id:'hafizur-note',kind:'verdict',title:'হাফিজুর রহমান',text:'CNG চালক আমাকে তোর হাতে তুলে দিলো আর তুই আমার সাথে এক সপ্তাহ ধরে যে অন্যায় অত্যাচার করেছিস, সেই অন্যায়ের জন্য তোর মৃত্যুদণ্ড কার্যকর হলো।'}
]);
export function beginBossStory(g,stage){
 g.storySeen??=[];if(stage>1||g.storySeen.includes(stage))return false;g.storySeen.push(stage);
 g.story={beats:stage===0?[BOSS_STORY[0],BOSS_STORY[1]]:[BOSS_STORY[2]],index:0};return true;
}
export function currentStoryBeat(g){return g.story?.beats[g.story.index]??null;}
export function advanceBossStory(g){if(!g.story)return false;g.story.index++;if(g.story.index<g.story.beats.length)return false;g.story=null;return true;}
