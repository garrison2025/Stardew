// Original, independently authored procedural pixel art. No extracted game assets.
import {dimensions,itemById,type Placed,type Season,type FarmMap,terrainAt} from './map-model.ts';
export const TILE=16;
export type Light='day'|'dusk'|'night';
type Ctx=CanvasRenderingContext2D;
export const palettes:Record<Season,{grass:string[];leaf:string[];soil:string;water:string;bank:string;road:string;cliff:string;detail:string}> = {
 spring:{grass:['#9fbc70','#a4c075','#a8c37a'],leaf:['#304f32','#456a38','#63883e','#88ad54','#b1c86b'],soil:'#a87a4e',water:'#478ca5',bank:'#c8b68a',road:'#d0ba8a',cliff:'#887f6e',detail:'#74974e'},
 summer:{grass:['#8fae60','#94b365','#98b76a'],leaf:['#2e5135','#426b36','#658d3c','#89ab4b','#abc45e'],soil:'#b18957',water:'#3c88a0',bank:'#c5b184',road:'#cfb684',cliff:'#8c8271',detail:'#6c9148'},
 autumn:{grass:['#bda76a','#c2ad70','#c7b375'],leaf:['#6b4836','#925a37','#b9743e','#d79b4b','#efc477'],soil:'#a77b52',water:'#5d8d9f',bank:'#cbbb8d',road:'#ccb688',cliff:'#887b70',detail:'#a3874e'},
 winter:{grass:['#d9e5df','#dfe9e5','#e4eeeb'],leaf:['#456761','#62877c','#8caaa1','#c0d8cf','#f0f5ed'],soil:'#a4aaa2',water:'#709daa',bank:'#bbc9c1',road:'#bfcac3',cliff:'#899b9a',detail:'#a4bfb8'}
};
export function hash(x:number,y:number,seed=0){let n=Math.imul(x+103,73856093)^Math.imul(y+157,19349663)^Math.imul(seed+17,83492791);n^=n>>>13;n=Math.imul(n,1274126177);return (n>>>0)/4294967296}
export function rect(c:Ctx,x:number,y:number,w:number,h:number,color:string){if(w<=0||h<=0)return;c.fillStyle=color;c.fillRect(Math.round(x),Math.round(y),Math.max(1,Math.round(w)),Math.max(1,Math.round(h)))}
function shade(hex:string,amount:number){const n=parseInt(hex.slice(1),16);return '#'+[n>>16&255,n>>8&255,n&255].map(v=>Math.max(0,Math.min(255,v+amount)).toString(16).padStart(2,'0')).join('')}
function oval(c:Ctx,x:number,y:number,w:number,h:number,color:string){
 const hh=Math.max(1,Math.round(h));for(let j=0;j<hh;j++){const t=(2*(j+.5)/hh)-1,a=Math.sqrt(Math.max(0,1-t*t))*w/2;rect(c,x+w/2-a,y+j,2*a,1,color)}
}
function pixel(c:Ctx,x:number,y:number,rows:string[],colors:Record<string,string>,scale=1){
 for(let j=0;j<rows.length;j++)for(let i=0;i<rows[j].length;i++){const col=colors[rows[j][i]];if(col)rect(c,x+i*scale,y+j*scale,scale,scale,col)}
}
function foliage(c:Ctx,x:number,y:number,w:number,h:number,season:Season,pine:boolean,seed:number){
 const p=palettes[season].leaf;
 oval(c,x+w*.07,y+h*.79,w*.91,h*.18,'#223c2d55');rect(c,x+w*.43,y+h*.54,w*.17,h*.38,'#60442e');rect(c,x+w*.44,y+h*.55,w*.07,h*.34,'#95704a');
 if(pine){
  for(let j=0;j<4;j++){const top=y+h*(.02+j*.14),ww=w*(.36+j*.19),cx=x+w*.5;for(let k=0;k<Math.round(h*.34);k++){const half=Math.max(1,ww*(k+3)/(h*.34+3)/2);rect(c,cx-half,top+k,half*2,1,p[1]);rect(c,cx-half+1,top+k,half*.85,1,p[2]);if(k%4===0)rect(c,cx-half+2,top+k,half*.55,1,p[3])}rect(c,cx-ww*.42,top+h*.34-2,ww*.84,2,p[0]);}
 }else{
  oval(c,x+w*.03,y+h*.18,w*.95,h*.62,p[0]);
  oval(c,x+w*.04,y+h*.11,w*.65,h*.53,p[1]);oval(c,x+w*.35,y+h*.12,w*.62,h*.58,p[1]);
  oval(c,x+w*.15,y+h*.03,w*.59,h*.5,p[2]);oval(c,x+w*.05,y+h*.24,w*.43,h*.37,p[2]);oval(c,x+w*.48,y+h*.2,w*.44,h*.39,p[2]);
  oval(c,x+w*.22,y+h*.08,w*.39,h*.26,p[3]);oval(c,x+w*.11,y+h*.27,w*.27,h*.19,p[3]);oval(c,x+w*.52,y+h*.25,w*.24,h*.16,p[3]);
  for(let j=0;j<10;j++){const xx=hash(j,seed,2),yy=hash(j,seed,3);if((xx-.5)**2+(yy-.4)**2<.12)rect(c,x+w*xx,y+h*yy,Math.max(1,w/12),1,p[4])}
 }
 if(season==='winter'){for(let j=0;j<4;j++)rect(c,x+w*(.24+j*.12),y+h*(.17+(j%2)*.18),w*.18,2,p[4])}
}
export function drawTerrainArt(c:Ctx,map:FarmMap,season:Season){
 const p=palettes[season],T=TILE;
 // Subtle terrain variation is patch-based, never a checkerboard.
 for(let y=0;y<map.h;y++)for(let x=0;x<map.w;x++){
  const t=map.tiles[y*map.w+x],px=x*T,py=y*T,n=hash(x,y),patch=hash(Math.floor(x/5),Math.floor(y/5));
  const base=p.grass[Math.floor(patch*3)];
  rect(c,px,py,T,T,t==='water'?p.water:t==='cliff'?p.cliff:t==='soil'?p.soil:t==='road'?p.road:t==='forest'?p.leaf[0]:base);
  if(t==='grass'||t==='forest'){for(let j=0;j<4;j++){const xx=px+Math.floor(hash(x,y,j+1)*14),yy=py+Math.floor(hash(x,y,j+9)*14);rect(c,xx,yy,1+(j%2),1,t==='forest'?p.leaf[1]:shade(base,j%2?8:-8))}
    if(t==='grass'&&n<.24){const xx=px+3+Math.floor(n*30),yy=py+8;rect(c,xx,yy,1,3,p.detail);rect(c,xx-2,yy+1,2,1,p.detail);rect(c,xx+1,yy-1,2,1,shade(base,23));if(n<.035){rect(c,xx,yy-3,3,2,season==='winter'?'#fff5e8':'#f4dc94');rect(c,xx+1,yy-3,1,1,'#d79664')}}
  }
  if(t==='soil'){for(let j=0;j<3;j++){const yy=py+3+j*5;rect(c,px+1,yy,14,1,shade(p.soil,-24));rect(c,px+2,yy+1,11,1,shade(p.soil,14))}}
  if(t==='road'){for(let j=0;j<6;j++)rect(c,px+Math.floor(hash(x,y,j+10)*14),py+Math.floor(hash(x,y,j+20)*14),1+(j%3===0?1:0),1,shade(p.road,j%2?15:-20))}
  if(t==='water'){if(n<.56){rect(c,px+2,py+4+Math.floor(n*9),5+Math.floor(n*7),1,shade(p.water,32));rect(c,px+8,py+12,5,1,shade(p.water,-10))}}
  if(t==='cliff'){rect(c,px+2,py+6,12,1,shade(p.cliff,-23));rect(c,px+Math.floor(n*10),py+7,1,7,shade(p.cliff,-28));rect(c,px+3,py+11,6,1,shade(p.cliff,17))}
 }
 // All four shore edges, corner joins, cliff faces and soft path margins.
 for(let y=0;y<map.h;y++)for(let x=0;x<map.w;x++){
  const t=terrainAt(map,x,y),px=x*T,py=y*T;
  if(t==='water'||t==='road'||t==='soil'||t==='cliff'){
   const edge=t==='water'?p.bank:t==='cliff'?shade(p.cliff,30):t==='road'?shade(p.road,-18):shade(p.soil,-15);
   const dark=t==='water'?shade(p.water,-21):shade(edge,-18);
   const north=terrainAt(map,x,y-1)!==t,south=terrainAt(map,x,y+1)!==t,west=terrainAt(map,x-1,y)!==t,east=terrainAt(map,x+1,y)!==t;
   if(north){rect(c,px,py,T,2,edge);if(t==='water'||t==='cliff')rect(c,px,py+2,T,1,dark)}
   if(south){rect(c,px,py+T-2,T,2,edge);if(t==='water'||t==='cliff')rect(c,px,py+T-3,T,1,dark)}
   if(west){rect(c,px,py,2,T,edge);if(t==='water')rect(c,px+2,py,1,T,dark)}
   if(east){rect(c,px+T-2,py,2,T,edge);if(t==='water')rect(c,px+T-3,py,1,T,dark)}
   if(t==='water'){for(const [dx,dy,ex,ey] of [[-1,-1,0,0],[1,-1,13,0],[-1,1,0,13],[1,1,13,13]])if(terrainAt(map,x+dx,y)===t&&terrainAt(map,x,y+dy)===t&&terrainAt(map,x+dx,y+dy)!==t)rect(c,px+ex,py+ey,3,3,edge);if(south&&hash(x,y,5)<.35){rect(c,px+6,py+10,1,4,p.detail);rect(c,px+8,py+8,1,6,p.detail)}}
   if(t==='cliff'&&south){rect(c,px,py+10,T,4,shade(p.cliff,-25));rect(c,px+3,py+10,2,4,shade(p.cliff,8));rect(c,px+10,py+12,4,1,shade(p.cliff,8))}
  }
 }
 for(let y=0;y<map.h;y++)for(let x=0;x<map.w;x++)if(terrainAt(map,x,y)==='forest'&&(x+y)%2===0){const n=hash(x,y,5);foliage(c,x*T-3+Math.round(n*3),y*T-8,22+Math.round(n*5),26+Math.round(n*6),season,n<.35,Math.floor(n*1000))}
}
type CropShape='root'|'round'|'berry'|'leaf'|'stalk'|'flower'|'vine';
const cropShapes:Record<string,CropShape>={
 parsnip:'root',potato:'root',cauliflower:'round','green-bean':'vine',kale:'leaf',strawberry:'berry',blueberry:'berry',melon:'round',corn:'stalk',tomato:'vine','hot-pepper':'vine',radish:'root',wheat:'stalk',cranberries:'berry',pumpkin:'round',eggplant:'vine',yam:'root','bok-choy':'leaf',grape:'berry',berry:'berry',sunflower:'flower',flowerbed:'flower',trellis:'vine',seedling:'leaf'
};
export function cropShape(id:string):CropShape{return cropShapes[id.replace(/^crop-/,'')]||'leaf'}
function crop(c:Ctx,id:string,color:string,season:Season){
 const p={d:'#385b32',l:'#6c9948',h:'#a8c66a',f:color,s:shade(color,-31),b:shade(color,24),t:'#78553b',w:'#d5b582'};
 const soil=palettes[season].soil;rect(c,0,1,16,15,shade(soil,-10));rect(c,1,2,14,1,shade(soil,25));rect(c,1,13,14,2,shade(soil,-29));rect(c,2,6,2,1,shade(soil,17));rect(c,12,10,2,1,shade(soil,17));
 const shape=cropShape(id);
 if(shape==='round')pixel(c,2,2,['.....dh.....','....dlh.....','...dllld....','..ssfsfs....','.sfbbfffs...','sfbfff ff s'.replaceAll(' ',''),'sfffffff fs'.replaceAll(' ',''),'sfffffff fs'.replaceAll(' ',''),'.sfffffs....','..sssss.....'],p);
 else if(shape==='berry')pixel(c,2,1,['.....h......','..dhhld.....','.dlhhlhld...','dlldlllldd..','dlfllflfld..','dllsfslld...','.dflldfld...','..dsfsdd....','....td......','...dld......'],p);
 else if(shape==='root')pixel(c,3,2,['.h..h.....','dlhdlh....','.dllld....','..dld.....','.ssfs.....','sfbffs....','sffffs....','.sffs.....','..ss......'],p);
 else if(shape==='stalk')pixel(c,3,1,['....b.....','..h.b.h...','..h.f.h...','...hfhl...','.h..f.l...','.dh.dh....','..dhld....','...dd.....','...dl.....','...dd.....','...dd.....'],p);
 else if(shape==='vine')pixel(c,2,1,['.t...t...t..','.twwwwww.t..','.tdhllh..t..','.tdlfld..t..','.t.hlsfs.t..','.tdhllfd.t..','.tldld...t..','.t.fld...t..','.t.sfd...t..','.t.dd....t..'],p);
 else if(shape==='flower')pixel(c,2,1,['....bff.....','...bfffb....','..bffsfbb...','..ffsfsff...','...bfffb....','....fff.....','.....d......','..h..d.h....','...hldl.....','....dd......'],p);
 else pixel(c,2,2,['.....h......','..h..lh.....','.dhhhlhd....','..dhlhld....','.hldlhlh....','dhlhllhld...','.dhldlld....','..dldld.....','....dd......','....td......'],p);
}
function house(c:Ctx,w:number,h:number,id:string,color:string,glass:boolean,season:Season){
 const wall='#d4b17e',dark='#684f3b',roof=shade(color,-15),ridge=shade(color,25);
 oval(c,0,h*.81,w,h*.18,'#263d2c60');rect(c,w*.08,h*.35,w*.84,h*.59,dark);rect(c,w*.11,h*.39,w*.78,h*.51,wall);
 for(let y=Math.round(h*.46);y<h*.9;y+=5){rect(c,w*.12,y,w*.76,1,'#9d774c');rect(c,w*.12,y+1,w*.76,1,'#ecd09a')}
 const silo=id==='game-silo';
 if(silo){oval(c,w*.17,h*.22,w*.66,h*.65,'#9d674b');rect(c,w*.17,h*.32,w*.66,h*.47,'#ac7755');for(let k=0;k<6;k++)rect(c,w*.2+k*w*.1,h*.33,1,h*.44,'#79523e');oval(c,w*.12,h*.07,w*.76,h*.31,roof);oval(c,w*.24,h*.08,w*.44,h*.13,ridge);rect(c,w*.43,h*.63,w*.16,h*.2,dark);return}
 const ry=Math.round(h*.13),rh=Math.round(h*.4);
 for(let y=0;y<rh;y++){const inset=Math.max(1,Math.round(w*.14*(1-y/rh)));rect(c,inset,ry+y,w-2*inset,1,y<rh*.48?roof:shade(color,-26));if(y%5===0)rect(c,inset+2,ry+y,w-2*inset-4,1,shade(color,17))}
 rect(c,w*.13,ry,w*.74,2,ridge);rect(c,1,ry+rh-1,w-2,3,dark);
 const barn=id.includes('barn'),coop=id.includes('coop'),shed=id.includes('shed'),doorW=w*(barn?.32:shed?.25:.17),dx=(w-doorW)/2,dy=h*.64;
 rect(c,dx-2,dy-2,doorW+4,h*.27+2,dark);rect(c,dx,dy,doorW,h*.26,barn?'#a76c49':'#79583c');if(barn||shed){rect(c,w*.5,dy,1,h*.26,'#d2a879');rect(c,dx+2,dy+3,doorW-4,1,'#d6ac7c')}
 for(const xx of [w*.19,w*.7]){const ww=Math.max(6,w*.12),yy=h*.62;rect(c,xx-1,yy-1,ww+2,10,dark);rect(c,xx,yy,ww,8,'#517c87');rect(c,xx+1,yy+1,ww-2,2,'#a3c4ba');rect(c,xx+ww/2,yy,1,8,'#e6c78e');rect(c,xx,yy+4,ww,1,'#e6c78e')}
 if(coop){rect(c,w*.12,h*.83,w*.18,3,'#b78e5f');for(let j=0;j<4;j++)rect(c,w*.12+j*2,h*.88+j,2,2,'#806044')}if(barn){rect(c,w*.43,ry+rh*.45,w*.14,Math.max(5,h*.08),dark);rect(c,w*.46,ry+rh*.47,w*.08,Math.max(3,h*.04),'#d7b680')}if(shed){rect(c,w*.12,h*.78,w*.17,h*.1,'#7a9b91');rect(c,w*.13,h*.78,w*.15,1,'#c4d5bb')}if(id==='cottage'||id==='game-farmhouse'){rect(c,w*.74,ry-3,w*.09,h*.16,'#8d6c53');rect(c,w*.72,ry-3,w*.13,3,'#c3a18a');rect(c,w*.39,h*.9,w*.23,3,'#ac946b')}
 if(glass){rect(c,w*.15,h*.16,w*.7,h*.31,'#7aafb1');for(let j=0;j<6;j++)rect(c,w*.16+j*w*.115,h*.16,1,h*.31,'#e2eee1');rect(c,w*.15,h*.3,w*.7,2,'#d7e8dd')}
 if(season==='winter'){rect(c,w*.15,ry,w*.7,3,'#e9f0e6');rect(c,w*.22,ry+3,w*.5,2,'#d1e1df')}
}
function equipment(c:Ctx,id:string,art:string,color:string){
 const p={d:'#54473b',l:'#a17b55',h:'#d4b282',b:'#dce4cf',m:color,s:shade(color,-29),v:shade(color,31),w:'#b5e3e2',k:'#39595e'};
 oval(c,1,12,14,3,'#35473355');
 if(art==='sprinkler')pixel(c,1,1,['......w.......','..w.......w...','......m.......','...mmmmmmm....','...vvmvvmm....','......b.......','......b.......','......b.......','....kkbkk.....','...kkkkkkk....','...kvvvvkk....','....kkkkk.....'],p);
 else if(art==='post')pixel(c,2,1,['....lll.....','...lllll....','..ddddddd...','....hhh.....','....hsh.....','.mmmmmmmmm..','...mmmm.....','...msmm.....','....ll......','....ll......','....ll......'],p);
 else if(art==='barrel')pixel(c,2,2,['...llll.....','..lhhhll....','.dlllllld...','.lhlhllld...','.dddddddd...','.lhlhllld...','.lhlhllld...','.dddddddd...','..llllll....','...dddd.....'],p);
 else if(art==='chest')pixel(c,1,2,['..dddddddd....','.dllhhlllld...','dllhhlllllld..','dddddddddddd..','dmmmmmmmmmmd..','dmmmbbmmmmmd..','dmmmbdmmmmmd..','dmmmmmmmmmmd..','dddddddddddd..'],p);
 else pixel(c,2,3,['....sss.....','..svmmss....','.svmmmmms...','svmmmmmmms..','smmmmmmms...','.sssssss....'],p);
 if(id.startsWith('nozzle-'))rect(c,6,3,4,2,'#f7e3b0');
}
function surface(c:Ctx,id:string,color:string){
 rect(c,0,0,16,16,shade(color,-12));if(id==='wood-path'){for(let j=0;j<4;j++){rect(c,0,j*4,16,3,color);rect(c,j%2?3:10,j*4,1,3,shade(color,-30));rect(c,1,j*4,5,1,shade(color,20))}}
 else if(id==='brick-path'){for(let j=0;j<4;j++)for(let k=-1;k<3;k++){const x=k*8+(j%2)*4;rect(c,x+1,j*4+1,7,3,color);rect(c,x+1,j*4+1,7,1,shade(color,15))}}
 else{for(let j=0;j<3;j++)for(let k=0;k<3;k++){const x=k*5,y=j*5;rect(c,x+1,y+1,4,4,shade(color,Math.round(hash(k,j)*18)-8));rect(c,x+1,y+1,3,1,shade(color,26))}}
}
// Independent silhouettes for frequently encountered starting structures.
function starterStructure(c:Ctx,id:string,w:number,h:number,season:Season):boolean{
 const snow=season==='winter';
 if(id==='gate'){
  rect(c,1,2,3,13,'#654a32');rect(c,12,2,3,13,'#654a32');
  rect(c,4,4,8,2,'#c9a46c');rect(c,4,10,8,2,'#ad854d');
  for(let i=0;i<7;i++)rect(c,5+i,5+i*.65,2,2,'#93643f');
  rect(c,3,4,2,2,'#c9d0c3');rect(c,10,8,2,2,'#e4d8a6');return true;
 }
 if(id==='game-shipping-bin'){
  oval(c,1,h*.65,w-2,h*.32,'#30433255');rect(c,2,3,w-4,h-4,'#63482f');rect(c,4,5,w-8,h-7,'#b88953');
  rect(c,3,2,w-6,5,'#d3ad77');rect(c,4,7,w-8,2,'#865b37');for(let x=7;x<w-5;x+=6)rect(c,x,9,1,h-10,'#795332');
  rect(c,w*.44,8,w*.12,3,'#e8c86c');if(snow)rect(c,4,2,w-8,2,'#dfe9e5');return true;
 }
 if(id==='game-pet-bowl'){
  oval(c,2,h*.58,w-4,h*.34,'#30433255');oval(c,w*.12,h*.22,w*.76,h*.60,'#4b6065');oval(c,w*.18,h*.19,w*.64,h*.45,'#c3d8d2');oval(c,w*.25,h*.26,w*.50,h*.28,'#4e96b0');rect(c,w*.34,h*.30,w*.22,2,'#a7dce4');rect(c,w*.34,h*.65,w*.32,2,'#e6e1c6');return true;
 }
 if(id==='game-greenhouse'||id==='greenhouse'){
  oval(c,0,h*.80,w,h*.19,'#253d2c55');rect(c,w*.08,h*.22,w*.84,h*.70,'#435a55');rect(c,w*.12,h*.26,w*.76,h*.62,'#82b5b1');
  for(let y=Math.round(h*.12);y<h*.32;y++){const inset=Math.round(w*.28*(1-(y-h*.12)/(h*.20)));rect(c,inset,y,w-2*inset,1,y%4===0?'#b5dfd3':'#6a9f9f')}
  for(let x=w*.13;x<w*.9;x+=w*.15)rect(c,x,h*.29,2,h*.54,'#d8e8d7');
  for(let y=h*.43;y<h*.84;y+=h*.17)rect(c,w*.10,y,w*.80,2,'#d8e8d7');
  for(let x=w*.20;x<w*.82;x+=w*.18)oval(c,x,h*.58,w*.10,h*.12,'#507e55');
  rect(c,w*.43,h*.68,w*.14,h*.24,'#3b605c');rect(c,w*.47,h*.71,w*.06,h*.17,'#aed3c3');
  rect(c,w*.07,h*.87,w*.86,h*.05,'#b3a08a');if(snow)rect(c,w*.28,h*.12,w*.44,3,'#e9f2eb');return true;
 }
 return false;
}
function magicalStructure(c:Ctx,id:string,w:number,h:number,color:string,season:Season){
 const edge=shade(color,-45),light=shade(color,45);
 oval(c,w*.06,h*.74,w*.88,h*.24,'#30433255');
 if(id==='game-junimo-hut'){
  rect(c,w*.16,h*.42,w*.68,h*.49,'#71533a');rect(c,w*.22,h*.47,w*.56,h*.39,'#c5a775');
  oval(c,w*.06,h*.09,w*.88,h*.53,edge);oval(c,w*.11,h*.08,w*.78,h*.42,color);oval(c,w*.26,h*.11,w*.42,h*.20,light);
  rect(c,w*.42,h*.60,w*.16,h*.31,'#514738');rect(c,w*.28,h*.57,w*.10,h*.12,'#cde1cb');
 }else if(id==='game-gold-clock'){
  rect(c,w*.17,h*.76,w*.66,h*.14,edge);rect(c,w*.28,h*.66,w*.44,h*.13,color);
  rect(c,w*.39,h*.40,w*.22,h*.28,edge);oval(c,w*.25,h*.03,w*.5,h*.66,edge);
  oval(c,w*.29,h*.08,w*.42,h*.56,color);oval(c,w*.35,h*.15,w*.30,h*.42,'#f6e7b4');
  rect(c,w*.49,h*.21,2,h*.17,'#544738');rect(c,w*.49,h*.36,w*.10,2,'#544738');rect(c,w*.47,h*.34,3,3,'#795331');
 }else{
  rect(c,w*.18,h*.76,w*.64,h*.16,edge);rect(c,w*.28,h*.68,w*.44,h*.10,color);
  rect(c,w*.35,h*.24,w*.30,h*.46,edge);rect(c,w*.40,h*.24,w*.19,h*.43,color);rect(c,w*.42,h*.25,2,h*.40,light);
  for(let y=0;y<Math.round(h*.26);y++){const half=Math.max(1,w*.17*(y+1)/(h*.26));rect(c,w*.5-half,h*.03+y,half*2,1,y%4===0?light:color);}
  rect(c,w*.47,h*.37,w*.06,h*.12,'#eee0b4');
 }
 if(season==='winter')rect(c,w*.22,h*.76,w*.56,2,'#dce8e2');
}
const cache=new Map<string,HTMLCanvasElement>();
export function sprite(o:Placed,season:Season):HTMLCanvasElement|null{
 if(typeof document==='undefined')return null;const i=itemById.get(o.itemId);if(!i)return null;const k=[o.itemId,o.rotation,season].join('|');const old=cache.get(k);if(old)return old;
 const d=dimensions(o),w=d.w*TILE,h=d.h*TILE,canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;const c=canvas.getContext('2d');if(!c)return null;c.imageSmoothingEnabled=false;
 if(starterStructure(c,o.itemId,w,h,season)){}
 else if(i.art==='magical')magicalStructure(c,o.itemId,w,h,i.color,season);
 else if(i.art==='house'||i.art==='glass')house(c,w,h,o.itemId,i.color,i.art==='glass',season);
 else if(i.art==='machine'){const body=i.color,dark=shade(body,-35),light=shade(body,38);oval(c,1,12,14,3,'#35473355');rect(c,2,4,12,10,dark);rect(c,3,4,10,8,body);rect(c,3,3,10,2,light);if(o.itemId==='machine-keg'){rect(c,3,5,10,2,'#72543a');rect(c,3,10,10,2,'#72543a');rect(c,10,8,3,2,'#e4c77b')}else if(o.itemId==='machine-jar'){rect(c,4,2,8,3,'#d6bba0');rect(c,5,6,6,5,'#d99472')}else if(o.itemId==='machine-furnace'){rect(c,5,7,6,5,'#453c36');rect(c,7,9,3,2,'#f0a14b')}else if(o.itemId==='machine-loom'){rect(c,4,5,2,7,'#d5c2a1');rect(c,9,5,2,7,'#d5c2a1');for(let y=6;y<12;y+=2)rect(c,5,y,5,1,'#ead8b1')}else if(o.itemId==='machine-dehydrator'){for(let y=5;y<13;y+=2)rect(c,4,y,8,1,'#e1bd9c')}else{rect(c,5,6,6,4,light);rect(c,7,10,2,2,'#4f5143')}}
 else if(i.art==='bee-house'){rect(c,2,12,12,2,'#60482f');rect(c,3,4,10,8,'#805a36');for(let y=5;y<12;y+=3)rect(c,4,y,8,2,'#d4ab67');rect(c,2,2,12,3,'#e8c88c');rect(c,6,9,4,2,'#503b2e')}
 else if(i.art==='fruit-sapling'){rect(c,7,6,2,8,'#765b40');rect(c,4,5,4,3,'#68964e');rect(c,8,3,4,4,'#97bd67');rect(c,5,2,4,3,'#b5d080')}
 else if(i.art==='tree'||i.art==='pine')foliage(c,0,0,w,h,season,i.art==='pine',17);
 else if(i.art==='pond'){oval(c,0,1,w,h-2,'#806d50');oval(c,2,2,w-4,h-5,'#c6b78c');oval(c,5,5,w-10,h-11,i.color);rect(c,w*.23,h*.3,w*.4,1,'#b1d7d6');rect(c,w*.4,h*.57,w*.3,1,'#a2cbd3')}
 else if(i.art==='path')surface(c,o.itemId,i.color);
 else if(i.art==='fence'){rect(c,0,5,16,3,'#b8915d');rect(c,0,10,16,2,'#8a6545');for(const x of [1,12]){rect(c,x,1,3,14,'#795838');rect(c,x,1,1,12,'#b28a55')}}
 else if(i.art==='crop'||i.art==='flower'||i.art==='trellis')crop(c,o.itemId,i.color,season);
 else equipment(c,o.itemId,i.art,i.color);
 if(cache.size>=512)cache.delete(cache.keys().next().value!);cache.set(k,canvas);return canvas
}
export function drawLighting(c:Ctx,map:FarmMap,light:Light){
 if(light==='day')return;const w=map.w*TILE,h=map.h*TILE;c.save();c.fillStyle=light==='dusk'?'#b1673935':'#223b795e';c.fillRect(0,0,w,h);c.restore();
}
