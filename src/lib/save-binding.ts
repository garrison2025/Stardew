export const SAVE_BINDING_KEY = 'save-binding-v1';

export function decodeSaveBinding(raw: unknown): string {
 if (typeof raw !== 'string' || !/^[\da-f]{64}$/.test(raw)) throw Error('Invalid save binding.');
 return raw;
}

export async function saveFingerprint(game: string, host: string) {
 if (!/^\d{1,20}$/.test(game) || !/^-?\d{1,20}$/.test(host)) return null;
 const gameId = BigInt(game), hostId = BigInt(host);
 if (gameId < 1n || gameId >= 1n << 64n || hostId === 0n || hostId < -(1n << 63n) || hostId >= 1n << 64n) return null;
 const seed = new TextEncoder().encode('field-and-farm:v1:' + gameId + ':' + BigInt.asUintN(64, hostId));
 const digest = await crypto.subtle.digest('SHA-256', seed);
 return Array.from(new Uint8Array(digest), value => value.toString(16).padStart(2, '0')).join('');
}

export function keepSaveBinding(previous: unknown, incoming: string | null, allowAnonymous: boolean) {
 if (previous !== undefined) {
  const binding = decodeSaveBinding(previous);
  if (!incoming || incoming !== binding) throw Error('This profile is linked to another farm or this file has no readable identity. Switch profiles to merge.');
  return binding;
 }
 if (!incoming) {
  if (!allowAnonymous) throw Error('A named farm profile requires a save with a readable game and host identity.');
  return undefined;
 }
 return decodeSaveBinding(incoming);
}
