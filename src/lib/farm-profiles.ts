export const DEFAULT_FARM = {id: 'default', name: 'Default farm'};
const PROFILES_KEY = 'field-farm-profiles-v1';
const ACTIVE_KEY = 'field-farm-active-profile-v1';
const uuid = /^[\da-f]{8}(?:-[\da-f]{4}){3}-[\da-f]{12}$/i;
export type FarmProfile = {id: string; name: string};

export function parseFarmProfiles(raw: string | null): FarmProfile[] {
 if (raw === null) return [DEFAULT_FARM];
 const list: unknown = JSON.parse(raw);
 if (!Array.isArray(list) || list.length > 12) throw Error('Local farm list is invalid.');
 const ids = new Set<string>(), names = new Set<string>([DEFAULT_FARM.name.toLowerCase()]);
 const profiles = list.map(profile => {
  if (!profile || typeof profile.id !== 'string' || !uuid.test(profile.id) || ids.has(profile.id)
   || typeof profile.name !== 'string' || !profile.name.trim() || profile.name.length > 60
   || profile.name !== profile.name.trim() || names.has(profile.name.toLowerCase())) throw Error('Local farm list is invalid.');
  ids.add(profile.id);
  names.add(profile.name.toLowerCase());
  return {id: profile.id, name: profile.name};
 });
 return [DEFAULT_FARM, ...profiles];
}

export function farmProfiles() {
 return parseFarmProfiles(localStorage.getItem(PROFILES_KEY));
}

export function activeFarm() {
 const id = sessionStorage.getItem(ACTIVE_KEY);
 if (!id || id === DEFAULT_FARM.id) return DEFAULT_FARM;
 const profile = farmProfiles().find(farm => farm.id === id);
 if (!profile) throw Error('This tab’s farm could not be found. Select a saved farm or return to Default farm.');
 return profile;
}

export function selectFarm(id: string) {
 if (id !== DEFAULT_FARM.id && !farmProfiles().some(profile => profile.id === id)) throw Error('Select an existing farm.');
 sessionStorage.setItem(ACTIVE_KEY, id);
 location.reload();
}

function registerFarm(name: string) {
 const profiles = farmProfiles().slice(1);
 if (profiles.length >= 12) throw Error('This browser already has 12 named farm profiles.');
 const profile = {id: crypto.randomUUID(), name: name.trim()};
 const next = JSON.stringify([...profiles, profile]);
 parseFarmProfiles(next);
 localStorage.setItem(PROFILES_KEY, next);
 return profile;
}

export async function createFarm(name: string) {
 const profile = navigator.locks
  ? await navigator.locks.request(PROFILES_KEY, () => registerFarm(name))
  : registerFarm(name);
 selectFarm(profile.id);
}

export function farmDatabaseName(id: string) {
 if (id === DEFAULT_FARM.id) return 'field-and-farm-preview';
 if (!uuid.test(id)) throw Error('Invalid farm profile ID.');
 return 'field-and-farm-preview:' + id;
}
