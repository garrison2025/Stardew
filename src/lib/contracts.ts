/** Versioned contracts. No real game adapter is registered until data and fixture review. */
export type Version = {gameVersion:string;platform:string;rulesVersion:string;dataHash:string};
export type Known<T> = {status:'known';value:T;source:'save'|'manual';at:string}|{status:'unknown';reason:string};
export type SourceRecord = {id:string;url:string;retrievedAt:string;rights:'pending'|'approved'|'rejected';evidence:string};
export type Feature = 'planner'|'bundles'|'museum'|'predictor'|'tracker'|'crop-calculator'|'fair-calculator'|'fishing'|'perfection'|'crafting'|'shipping'|'cooking'|'golden-walnuts'|'farm-comparison'|'grandpa-calculator'|'skills';
export type DataManifest=Version&{schemaVersion:1;features:Feature[];sourceIds:string[];fixtureHash:string};
export type Snapshot = {schemaVersion:1;version:Version;localProfileId:string;farm:Record<string,Known<unknown>>;players:Record<string,Record<string,Known<unknown>>>;importedAt:string;contentHash:string;warnings:string[]};
export type ProgressEntry={entityId:string;scope:'farm'|'player';scopeId:string;observed:Known<boolean>;override?:Known<boolean>;rulesVersion:string};
export type Result<T>={status:'supported';value:T;version:Version}|{status:'unsupported';reason:string};
export interface GameRulesAdapter {version:Version;features:ReadonlySet<Feature>;parseSave(bytes:ArrayBuffer):Promise<Result<Snapshot>>;progress(snapshot:Snapshot):Result<ProgressEntry[]>;predict(input:unknown):Result<unknown>;calculateCrop(input:unknown):Result<unknown>;scoreFair(input:unknown):Result<unknown>}
export function validateManifest(manifest:DataManifest,sources:SourceRecord[]):string[]{
 const errors:string[]=[];
 if(manifest.schemaVersion!==1)errors.push('Unsupported schema');
 if(!/^\d+\.\d+\.\d+(?:\.\d+)?$/.test(manifest.gameVersion))errors.push('Exact game patch required');
 if(!/^[a-f0-9]{64}$/i.test(manifest.dataHash)||!/^[a-f0-9]{64}$/i.test(manifest.fixtureHash))errors.push('Data and fixture SHA-256 required');
 if(!manifest.platform||!manifest.rulesVersion||!manifest.features.length||!manifest.sourceIds.length)errors.push('Missing version metadata');
 if(new Set(manifest.features).size!==manifest.features.length)errors.push('Duplicate features');
 for(const id of manifest.sourceIds){const src=sources.find(s=>s.id===id);if(!src||src.rights!=='approved'||!src.evidence||!src.url||!src.retrievedAt)errors.push('Source not approved: '+id);}
 return errors;
}
const registry=new Map<string,GameRulesAdapter>();
const id=(v:Version)=>[v.gameVersion,v.platform,v.rulesVersion,v.dataHash].join('|');
export function registerAdapter(adapter:GameRulesAdapter,manifest:DataManifest,sources:SourceRecord[]){
 const errors=validateManifest(manifest,sources);if(errors.length)throw new Error(errors.join('; '));
 if(id(adapter.version)!==id(manifest)||[...adapter.features].some(f=>!manifest.features.includes(f)))throw new Error('Adapter and manifest mismatch');
 registry.set(id(manifest),adapter);
}
export function getAdapter(version:Version,feature:Feature):Result<GameRulesAdapter>{const adapter=registry.get(id(version));return adapter?.features.has(feature)?{status:'supported',value:adapter,version}:{status:'unsupported',reason:'No approved adapter for the exact game version, platform, dataset and feature'};}
export function observedValue(entry:ProgressEntry){return entry.override??entry.observed;}
