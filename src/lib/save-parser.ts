import {verifySaveText} from './engine';
import {SEASONS,type Season} from './map-model';
import {buildingItem,sprinklerItem,supportedVersion,type FarmRecord,type SaveSnapshot} from './save-model';
import {normalizeSkillXp,normalizeCrafting,normalizeObjectCollection,safeCount,type SaveProgress,type NamedCount} from './save-progress';
const child=(el:Element|undefined|null,name:string)=>el?Array.from(el.children).find(c=>c.localName===name):undefined;
const text=(el:Element|undefined|null,name:string)=>child(el,name)?.textContent?.trim()??'';
const num=(s:string):number|null=>/^-?\d+$/.test(s)&&Number.isSafeInteger(Number(s))?Number(s):null;
const xsi=(el:Element|undefined|null,key:string)=>el?.getAttributeNS('http://www.w3.org/2001/XMLSchema-instance',key)??el?.getAttribute('xsi:'+key)??'';
function point(el:Element|undefined){return {x:num(text(el,'X')),y:num(text(el,'Y'))}}
function dictionary(el:Element|undefined){return Array.from(el?.children??[]).filter(e=>e.localName==='item')}
function readProgress(root:Element,player:Element|undefined):SaveProgress{
 const warnings:string[]=[];
 const read=(el:Element|undefined,name:string,max=1000000000)=>safeCount(num(text(el,name)),max);
 const xpNode=child(player,'experiencePoints'),xp=xpNode?normalizeSkillXp(Array.from(xpNode.children).map(e=>e.localName==='int'?num(e.textContent?.trim()??''):null)):null;
 if(!xp)warnings.push('Skill XP absent or unsupported.');
 function rows(name:string):NamedCount[]|null{const el=child(player,name);if(!el||xsi(el,'nil')==='true')return null;const result:NamedCount[]=[];const seen=new Set<string>();if(el.children.length>2000)return null;for(const entry of Array.from(el.children)){if(entry.localName!=='item')return null;const k=text(child(entry,'key'),'string'),v=num(text(child(entry,'value'),'int'));if(!k||k.length>160||seen.has(k)||v===null||v<0)return null;seen.add(k);result.push({name:k,count:v})}return result}
 const crafts=rows('craftingRecipes'),cooking=rows('cookingRecipes');let crafting:SaveProgress['crafting']=null;
 if(crafts)try{crafting=normalizeCrafting(crafts)}catch{warnings.push('Crafting keys are ambiguous.')}
 if(!crafting)warnings.push('Crafting dictionary absent or unsupported.');
 const collections:NonNullable<SaveProgress['collections']>={};
 function objectRows(parent:Element|undefined,name:string,array=false,museum=false):NamedCount[]|null{const el=child(parent,name);if(!el||xsi(el,'nil')==='true'||el.children.length>2000)return null;const result:NamedCount[]=[];for(const entry of Array.from(el.children)){if(entry.localName!=='item')return null;const key=child(entry,'key'),value=child(entry,'value'),k=museum?(text(value,'string')||text(value,'int')):(text(key,'string')||text(key,'int')),count=museum?1:array?num(text(child(value,'ArrayOfInt'),'int')):num(text(value,'int'));if(!k||k.length>160||count===null||count<0)return null;result.push({name:k,count})}return result}
 const observed=[['shipping',objectRows(player,'basicShipped')],['fishing',objectRows(player,'fishCaught',true)],['cooking',objectRows(player,'recipesCooked')]] as const;
 for(const [kind,rows] of observed){if(rows)collections[kind]=normalizeObjectCollection(kind,rows);else warnings.push(kind+' records absent or unsupported.')}
 const museums=Array.from(child(root,'locations')?.children??[]).filter(e=>e.localName==='GameLocation'&&text(e,'name')==='ArchaeologyHouse');const donations=objectRows(museums.length===1?museums[0]:undefined,'museumPieces',false,true);if(donations)collections.museum=normalizeObjectCollection('museum',donations);else warnings.push('Museum donation dictionary absent or unsupported.');
 const walnutsFound=read(root,'goldenWalnutsFound',130),walnutsBalance=read(root,'goldenWalnuts',130);
 if(walnutsFound===null||walnutsBalance===null)warnings.push('Walnut counters absent or outside standard range.');
 if(walnutsFound!==null&&walnutsBalance!==null&&walnutsBalance>walnutsFound)warnings.push('Walnut balance exceeds lifetime count; inspect the save in game.');
 if(Array.from(child(root,'farmhands')?.children??[]).some(e=>e.localName==='Farmer'))warnings.push('Multiplayer save: only the main player is summarized; no combined perfection score.');
 return {xp,money:read(player,'money'),lifetimeEarnings:read(player,'totalMoneyEarned'),walnutsFound,walnutsBalance,crafting,learnedCooking:cooking?.length??null,collections,warnings}
}
export function parseSave(xml:string):SaveSnapshot{
 verifySaveText(xml);const doc=new DOMParser().parseFromString(xml,'application/xml'),root=doc.documentElement;
 if(doc.querySelector('parsererror')||root.localName!=='SaveGame')throw Error('Expected a valid main SaveGame XML, not SaveGameInfo.');
 const fields=doc.getElementsByTagName('*').length;if(fields>250000)throw Error('Too many XML nodes.');
 const player=child(root,'player'),version=(text(root,'gameVersion')||text(player,'gameVersion')||'Unknown').slice(0,40);
 const rawSeason=text(root,'currentSeason').toLowerCase(),seasonText=rawSeason==='fall'?'autumn':rawSeason,season=SEASONS.includes(seasonText as Season)?seasonText as Season:null;
 const farmLocations=Array.from(child(root,'locations')?.children??[]).filter(e=>e.localName==='GameLocation'&&text(e,'name')==='Farm');
 const farm=farmLocations.length===1?farmLocations[0]:undefined;
 const records:FarmRecord[]=[];
 const snapshot:SaveSnapshot={version,farmType:num(text(root,'whichFarm')),year:num(text(root,'year')),day:num(text(root,'dayOfMonth')),season,fields,records,farmFound:!!farm};
 if(supportedVersion(version))snapshot.progress=readProgress(root,player);
 if(!supportedVersion(version)||!farm)return snapshot;
 for(const b of Array.from(child(farm,'buildings')?.children??[])){
 const itemId=buildingItem(text(b,'buildingType'));records.push({kind:'building',itemId,x:num(text(b,'tileX')),y:num(text(b,'tileY')),width:num(text(b,'tilesWide'))??undefined,height:num(text(b,'tilesHigh'))??undefined,...(!itemId?{reason:'Unmapped building type'}:{})});
 }
 for(const entry of dictionary(child(farm,'objects'))){
 const keyPoint=point(child(child(entry,'key'),'Vector2')),o=child(child(entry,'value'),'Object');
 const id=text(o,'itemId')||text(o,'parentSheetIndex'),big=text(o,'bigCraftable');
 const itemId=o&&(big==='false'||id.startsWith('(O)'))?sprinklerItem(id,big==='true'):null;
 // Base sprinkler geometry only. A nonempty attachment is not interpreted.
 const hasAttachment=['heldObject','attachments'].some(key=>{const attachment=child(o,key);return !!attachment&&xsi(attachment,'nil')!=='true'&&(attachment.children.length>0||!!attachment.textContent?.trim())});
 records.push({kind:'object',itemId:hasAttachment?null:itemId,...keyPoint,...(hasAttachment?{reason:'Attachment or held object not mapped'}:!itemId?{reason:'Unmapped placed object'}:{})});
 }
 for(const entry of dictionary(child(farm,'terrainFeatures'))){
 const coords=point(child(child(entry,'key'),'Vector2')),feature=child(child(entry,'value'),'TerrainFeature'),crop=child(feature,'crop');
 const planted=xsi(feature,'type')==='HoeDirt'&&!!crop&&xsi(crop,'nil')!=='true'&&crop.children.length>0;
 records.push({kind:'terrain',itemId:planted?'seedling':null,...coords,...(!planted?{reason:'Unmapped terrain feature'}:{})});
 }
 if(records.length>20000)throw Error('Too many farm records.');
 return snapshot;
}
export async function readSave(file:File){if(file.size>10*1024*1024)throw Error('File exceeds 10 MiB preview limit.');return parseSave(await file.text())}
