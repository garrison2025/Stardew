export const SAVE_FARM_BINDING_KEY='save-farm-binding-v1';
const FINGERPRINT=/^[0-9a-f]{64}$/;
const MAX_GAME_ID=18446744073709551615n;

export async function farmFingerprint(gameId:string):Promise<string|null>{
 if(!/^\d{1,20}$/.test(gameId))return null;
 const id=BigInt(gameId);
 if(id===0n||id>MAX_GAME_ID||!globalThis.crypto?.subtle)return null;
 const input=new TextEncoder().encode('field-and-farm:save-farm:v1:'+id.toString());
 const bytes=new Uint8Array(await crypto.subtle.digest('SHA-256',input));
 return Array.from(bytes,byte=>byte.toString(16).padStart(2,'0')).join('');
}

export function decodeFarmBinding(raw:unknown){
 const value=raw as {schema?:unknown;fingerprint?:unknown}|null|undefined;
 if(value?.schema!==1||typeof value.fingerprint!=='string'||!FINGERPRINT.test(value.fingerprint)){
  throw Error('Invalid workspace farm binding.');
 }
 return {schema:1 as const,fingerprint:value.fingerprint};
}

export function bindSaveFarm(fingerprint:string,previous:unknown){
 const next=decodeFarmBinding({schema:1,fingerprint});
 if(previous!==undefined&&decodeFarmBinding(previous).fingerprint!==next.fingerprint){
  throw Error('This save belongs to a different farm. This workspace keeps one farm’s progress.');
 }
 return next;
}
