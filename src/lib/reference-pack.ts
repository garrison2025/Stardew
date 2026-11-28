// Single available reference pack; no game-verified compatibility or commercial approval.
export const REFERENCE_PACK_ID='ref-pc-1.6.15-20261128-r4';
export function decodeReferenceBinding(raw:unknown):string|undefined{
 if(raw===undefined)return undefined;
 if(typeof raw!=='string'||(raw!==REFERENCE_PACK_ID&&raw!=='ref-pc-1.6.15-20261128-r1'&&raw!=='ref-pc-1.6.15-20261128-r2'&&raw!=='ref-pc-1.6.15-20261128-r3'))throw Error('Unsupported reference pack. Keep the original backup and use its matching build; no automatic conversion was performed.');
 return raw;
}
