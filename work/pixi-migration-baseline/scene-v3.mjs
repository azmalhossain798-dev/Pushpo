// Every ground object uses the same 2:1 orthographic projection.
export const ISO={x:.72,y:.36};
export function project(x,y){return{x:(x-y)*ISO.x,y:(x+y)*ISO.y};}
export function unproject(x,y){return{x:x/(2*ISO.x)+y/(2*ISO.y),y:y/(2*ISO.y)-x/(2*ISO.x)};}
export function screenDirection(x,y){
 const p=unproject(x,y),d=Math.hypot(p.x,p.y)||1,s=Math.min(1,Math.hypot(x,y));
 return{x:p.x/d*s,y:p.y/d*s};
}
export const LANDMARKS=[
 {x:1250,y:1550,w:170,d:170,art:0,name:'Tea corner'},
 {x:2020,y:1545,w:190,d:185,art:1,name:'Pharmacy'},
 {x:2520,y:1630,w:185,d:185,art:3,name:'East bazaar'},
 {x:1360,y:2050,w:170,d:180,art:2,name:'Apartments'}
];
export const SCENERY=[
 {id:'tea',x:1245,y:1710,art:3,width:94,radius:25},
 {id:'fruit',x:1470,y:1880,art:2,width:136,radius:34},
 {id:'east-fruit',x:2650,y:1990,art:2,width:136,radius:34},
 {id:'rickshaw',x:1515,y:1570,art:1,width:125,radius:29},
 {id:'east-rickshaw',x:2285,y:1880,art:1,width:125,radius:29},
 {id:'bus',x:1610,y:1130,art:0,width:310,radius:51},
 {id:'south-tea',x:1240,y:2185,art:3,width:94,radius:25}
];
export const ACTIVITY_SPOTS=[
 {id:'tea-seller',x:1215,y:1687,sprite:6,role:'shopkeeper',partner:'tea-buyer',lines:['Fresh cha!','One cup, coming up.'],prop:'tea'},
 {id:'tea-buyer',x:1290,y:1730,sprite:5,role:'customer',partner:'tea-seller',lines:['One cha, please.','Less sugar, bhai.']},
 {id:'fruit-seller',x:1440,y:1835,sprite:6,role:'vendor',partner:'fruit-buyer',lines:['Fresh mangoes!','Take a look!'],prop:'fruit'},
 {id:'fruit-buyer',x:1540,y:1855,sprite:4,role:'customer',partner:'fruit-seller',lines:['How much for these?','Half a kilo, please.']},
 {id:'chat-a',x:1125,y:1840,sprite:4,role:'conversation',partner:'chat-b',lines:['How is everyone?','See you tomorrow.']},
 {id:'chat-b',x:1190,y:1870,sprite:6,role:'conversation',partner:'chat-a',lines:['Doing well, thanks.','See you!']},
 {id:'east-vendor',x:2615,y:1945,sprite:5,role:'vendor',partner:'east-buyer',lines:['Sweet papaya!','Fresh this morning.'],prop:'east-fruit'},
 {id:'east-buyer',x:2720,y:1990,sprite:4,role:'customer',partner:'east-vendor',lines:['Two, please.','Thank you.']},
 {id:'south-seller',x:1180,y:2235,sprite:6,role:'shopkeeper',partner:'south-buyer',lines:['Tea is ready.','Have a seat.'],prop:'south-tea'},
 {id:'south-buyer',x:1290,y:2240,sprite:5,role:'customer',partner:'south-seller',lines:['A cup, please.','Busy day today.']}
];
