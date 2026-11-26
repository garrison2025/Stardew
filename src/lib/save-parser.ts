import {verifySaveText} from './engine';
import {SEASONS,type Season} from './map-model';
import {buildingItem,sprinklerItem,supportedVersion,type FarmRecord,type SaveSnapshot} from './save-model';
const child=(el:Element|undefined|null,name:string)=>el?Array.from(el.children).find(c=>c.localName===name):undefined;
const text=(el:Element|undefined|null,name:string)=>child(el,name)?.textContent?.trim()??'';
const num=(s:string):number|null=>/^-?\d+$/.test(s)&&Number.isSafeInteger(Number(s))?Number(s):null;
const xsi=(el:Element|undefined|null,key:string)=>el?.getAttributeNS('http://www.w3.org/2001/XMLSchema-instance',key)??el?.getAttribute('xsi:'+key)??'';
function point(el:Element|undefined){return {x:num(text(el,'X')),y:num(text(el,'Y'))}}
function dictionary(el:Element|undefined){return Array.from(el?.children??[]).filter(e=>e.localName==='item')}
export function parseSave(xml:string):SaveSnapshot{
 verifySaveText(xml);const doc=new DOMParser().parseFromString(xml,'application/xml'),root=doc.documentElement;
 if(doc.querySelector('parsererror')||root.localName!=='SaveGame')throw Error('Expected a valid main SaveGame XML, not SaveGameInfo.');
 const fields=doc.getElementsByTagName('*').length;if(fields>250000)throw Error('Too many XML nodes.');
 const player=child(root,'player'),version=(text(root,'gameVersion')||text(player,'gameVersion')||'Unknown').slice(0,40);
 const rawSeason=text(root,'currentSeason').toLowerCase(),seasonText=rawSeason==='fall'?'autumn':rawSeason,season=SEASONS.includes(seasonText as Season)?seasonText as Season:null;
 const farmLocations=Array.from(child(root,'locations')?.children??[]).filter(e=>e.localName==='GameLocation'&&text(e,'name')==='Farm');
 const farm=farmLocations.length===1?farmLocations[0]:undefined;
 const records:FarmRecord[]=[];
 const snapshot={version,farmType:num(text(root,'whichFarm')),year:num(text(root,'year')),day:num(text(root,'dayOfMonth')),season,fields,records,farmFound:!!farm};
 if(!supportedVersion(version)||!farm)return snapshot;
 for(const b of Array.from(child(farm,'buildings')?.children??[])){
 const itemId=buildingItem(text(b,'buildingType'));records.push({kind:'building',itemId,x:num(text(b,'tileX')),y:num(text(b,'tileY')),width:num(text(b,'tilesWide'))??undefined,height:num(text(b,'tilesHigh'))??undefined,...(!itemId?{reason:'Unmapped building type'}:{})});
 }
 for(const entry of dictionary(child(farm,'objects'))){
 const keyPoint=point(child(child(entry,'key'),'Vector2')),o=child(child(entry,'value'),'Object');
 const id=text(o,'itemId')||text(o,'parentSheetIndex'),big=text(o,'bigCraftable');
 const itemId=o&&(big==='false'||id.startsWith('(O)'))?sprinklerItem(id,big==='true'):null;
 // Base sprinkler geometry only. A nonempty attachment is not interpreted.
 const attachment=child(o,'heldObject'),hasAttachment=!!attachment&&xsi(attachment,'nil')!=='true'&&(attachment.children.length>0||!!attachment.textContent?.trim());
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
