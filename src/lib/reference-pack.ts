// Single available reference pack; no game-verified compatibility or commercial approval.
export const REFERENCE_PACK_ID='ref-pc-1.6.15-20261128-r10';
export function decodeReferenceBinding(raw:unknown):string|undefined{
 if(raw===undefined)return undefined;
 if(typeof raw!=='string'||(raw!==REFERENCE_PACK_ID&&raw!=='ref-pc-1.6.15-20261128-r9'&&raw!=='ref-pc-1.6.15-20261128-r8'&&raw!=='ref-pc-1.6.15-20261128-r7'&&raw!=='ref-pc-1.6.15-20261128-r1'&&raw!=='ref-pc-1.6.15-20261128-r2'&&raw!=='ref-pc-1.6.15-20261128-r3'&&raw!=='ref-pc-1.6.15-20261128-r4'&&raw!=='ref-pc-1.6.15-20261128-r5'&&raw!=='ref-pc-1.6.15-20261128-r6'))throw Error('Unsupported reference pack. Keep the original backup and use its matching build; no automatic conversion was performed.');
 return raw;
}
