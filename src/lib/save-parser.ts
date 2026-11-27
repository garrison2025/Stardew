import {readBundleDefinition, type SaveBundle} from './save-bundles';
import type {GeodeInput} from './geode-prediction';
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
function readBundles(root: Element): SaveBundle[] | undefined {
 const locations = Array.from(child(root, 'locations')?.children ?? []);
 const centers = locations.filter(el => el.localName === 'GameLocation' && text(el, 'name') === 'CommunityCenter');
 const definitions = child(root, 'bundleData');
 if (!definitions || centers.length !== 1 || definitions.children.length > 100) return undefined;
 const records = new Map<number, boolean[] | null>();
 for (const entry of dictionary(child(centers[0], 'bundles'))) {
  const id = num(text(child(entry, 'key'), 'int'));
  const row = child(child(entry, 'value'), 'ArrayOfBoolean');
  if (id === null || !row || row.children.length > 48) continue;
  const values = Array.from(row.children).map(el => el.localName === 'boolean' ? el.textContent?.trim() : '');
  records.set(id, records.has(id) || !values.every(v => v === 'true' || v === 'false') ? null : values.map(v => v === 'true'));
 }
 const result = new Map<number, SaveBundle | null>();
 for (const entry of dictionary(definitions)) {
  const key = text(child(entry, 'key'), 'string'), value = text(child(entry, 'value'), 'string');
  const id = num(key.split('/')[1] ?? '');
  if (id === null || value.length > 6000) continue;
  result.set(id, result.has(id) ? null : readBundleDefinition(key, value, records.get(id) ?? undefined));
 }
 const recognized = [...result.values()].filter((bundle): bundle is SaveBundle => bundle !== null);
 return recognized.length ? recognized : undefined;
}
function readGeodeFields(root: Element, player: Element | undefined): GeodeInput | undefined {
 const gameId = text(root, 'uniqueIDForThisGame'), playerId = text(player, 'UniqueMultiplayerID');
 const legacy = text(root, 'useLegacyRandom');
 const openedRows = dictionary(child(child(player, 'stats'), 'Values')).filter(row => text(child(row, 'key'), 'string') === 'geodesCracked');
 const openedNode = child(openedRows[0], 'value');
 const opened = safeCount(num(text(openedNode, 'unsignedInt') || text(openedNode, 'int')), 1000000);
 const depth = safeCount(num(text(player, 'deepestMineLevel')));
 const orders = child(root, 'specialOrders');
 if (!/^\d{1,20}$/.test(gameId) || !/^-?\d{1,20}$/.test(playerId) || BigInt(gameId) >= 1n << 64n || BigInt(playerId) < -(1n << 63n) || BigInt(playerId) >= 1n << 64n || openedRows.length !== 1 || opened === null || depth === null || !['true', 'false'].includes(legacy) || !orders || xsi(orders, 'nil') === 'true') return undefined;
 const qiBeans = Array.from(orders.children).some(order => order.localName === 'SpecialOrder' && /\bDROP_QI_BEANS\b/.test(text(order, 'specialRule')));
 return {gameId, playerId, opened, mineLevel: Math.min(depth, 120), legacy: legacy === 'true', qiBeans};
}
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
function parseMainSave(xml: string) {
 verifySaveText(xml);
 const doc = new DOMParser().parseFromString(xml, 'application/xml'), root = doc.documentElement;
 if (doc.querySelector('parsererror') || root.localName !== 'SaveGame') throw Error('Expected a valid main SaveGame XML, not SaveGameInfo.');
 const fields = doc.getElementsByTagName('*').length;
 if (fields > 250000) throw Error('Too many XML nodes.');
 const player = child(root, 'player'), version = (text(root, 'gameVersion') || text(player, 'gameVersion') || 'Unknown').slice(0, 40);
 return {root, fields, player, version};
}
export function parseSave(xml:string):SaveSnapshot{
 const {root, fields, player, version} = parseMainSave(xml);
 const rawSeason=text(root,'currentSeason').toLowerCase(),seasonText=rawSeason==='fall'?'autumn':rawSeason,season=SEASONS.includes(seasonText as Season)?seasonText as Season:null;
 const farmLocations=Array.from(child(root,'locations')?.children??[]).filter(e=>e.localName==='GameLocation'&&text(e,'name')==='Farm');
 const farm=farmLocations.length===1?farmLocations[0]:undefined;
 const records:FarmRecord[]=[];
 const snapshot:SaveSnapshot={version,farmType:num(text(root,'whichFarm')),year:num(text(root,'year')),day:num(text(root,'dayOfMonth')),season,fields,records,farmFound:!!farm};
 if(supportedVersion(version)) {
  snapshot.progress=readProgress(root,player);
  const bundles = readBundles(root);
  if (bundles) snapshot.progress.bundles = bundles;
 }
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
export async function readGeodeSave(file: File) {
 const {root, player, version} = parseMainSave(await readSaveText(file));
 if (version !== '1.6.15') throw Error('Automatic prefill requires a save reporting game version 1.6.15.');
 const fields = readGeodeFields(root, player);
 if (!fields) throw Error('The required main-player RNG fields are missing or unsupported. Confirm the values in game and enter them manually.');
 return fields;
}
async function readSaveText(file: File) {
 if (file.size > 10 * 1024 * 1024) throw Error('File exceeds 10 MiB preview limit.');
 return file.text();
}
export async function readSave(file:File){return parseSave(await readSaveText(file))}
