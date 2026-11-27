import {readLocal} from './local.ts';
// Private data validation is imported only when a user requests local observations.
export async function readObservedSave(){
 const {decodeSaveObservations,SAVE_OBSERVATIONS_KEY}=await import('./save-observations.ts');
 return decodeSaveObservations(await readLocal(SAVE_OBSERVATIONS_KEY));
}
