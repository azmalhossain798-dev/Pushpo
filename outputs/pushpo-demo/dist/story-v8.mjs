export const BORROWED_LIFE_DAYS=60;
export const OPENING_STORY='The unknown golden fish transfers part of its own life force to Pushpo, resurrecting her and granting extraordinary abilities. This borrowed life will keep her alive for only 60 days.';
export const AWAKENING_STORY='Pushpo awakens alone in an apartment, remembering her conversation with the fish. With extraordinary powers and the freedom to choose her path, she steps into Mirpur to hunt rapists, murderers and snatchers who harm innocent people. Every choice matters: her borrowed time is running out.';
export const HERCULES_NOTE='Be careful Rapist Hercules is coming';
export const HERCULES_DIALOGUE=Object.freeze([
 {speaker:'Hercules',text:'এই যে পুষ্প, আমি হারকিউলিস।'},
 {speaker:'Pushpo',text:'ও হ্যাঁ, আমি আপনাকে চিনি। আপনার বিষয়ে পত্রিকায় পড়ছিলাম।'},
 {speaker:'Hercules',text:'আমি তো তোমার ভক্ত হয়ে গেলাম! একা একজন মেয়ে হয়ে যা করতেছো—insane!'},
 {speaker:'Pushpo',text:'আসছেন খুব ভালো সময়ে। আমাকে একটু সাহায্য করুন। আমার কাছে বেশি সময় নেই। আমি সোহেল রানাকে খুঁজতেছি। ওকে খুঁজে পেতে সাহায্য করুন।'},
 {speaker:'Hercules',text:'আমি সে জন্যই আপনার সাথে দেখা করতে আসছি।'},
 {speaker:'Pushpo',text:"রানা দেখতে গাঁজাখোরের মতো। হাফিজুরের দারোয়ান ছিল। আমাকে মুমূর্ষু অবস্থায় তার হাতে তুলে দিয়ে হাফিজুর বললো, 'মালটারে নদীতে ফেলে দিয়ে আয়, হাত-পা বেঁধে।'\n\nআমি মনে মনে খুশি হয়ে গেলাম—যাক, মরে হলেও মুক্তি পাবো। কিন্তু এই সোহেল রানা আমাকে ওই অবস্থায় ক্ষুধার্ত কুকুরের মতো ভোগ করে নদীতে ফেলে দেয়।"},
 {speaker:'Hercules',text:'আপনার শরীরই তাহলে পুলিশ খুঁজে পেয়েছিল! DNA টেস্ট করে তারা নাকি কিছু পায়নি!\n\nআপনার আসল নাম অনু? আমি জানি। আপনার সাথে যা হয়েছে, আপনার লাশ দেখে আমি অনুমান করে খোঁজ নিয়েছি।\n\nআর এদিকে খবরে শুনি, একটা মেয়ে রাস্তায় হেঁটে হেঁটে দাগী আসামিদের মৃত্যুদণ্ড কার্যকর করতেছে, যাদের মধ্যে অনেকেই আমার লিস্টে! তাই আপনাকে খুঁজেই আপনার কাছে আসা।\n\nআপনার সাথে যা হয়েছে, তার জন্য আমি দুঃখিত। আমি আপনাকে সাহায্য করবো।\n\nযাই, এখন খোঁজ নিয়ে আপনাকে জানাচ্ছি।'}
]);
export function herculesBeats(){
 return HERCULES_DIALOGUE.flatMap((turn,i)=>turn.text.split('\n\n').map((text,j)=>({id:`hercules-${i}-${j}`,kind:'conversation',speaker:turn.speaker,title:turn.speaker==='Hercules'?'হারকিউলিস':'পুষ্পো',text,turn:i,paragraph:j})));
}
export function beginHerculesConversation(g){
 if(g.story||g.chapter!==2||!g.hercules.introStarted||g.cinematic?.phase!=='dialogue'||g.hercules.introComplete||g.hercules.conversationStarted)return false;
 g.hercules.conversationStarted=true;g.story={beats:herculesBeats(),index:0};return true;
}
export function finalMissionReady(g){return g.finalMission?.enabled===true&&g.hercules?.introComplete===true;}
export function chapterClockActive(g){return g.chapter<2;}
