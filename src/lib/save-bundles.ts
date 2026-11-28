export type SaveBundle = {
  id: number;
  room: string;
  name: string;
  needed: number;
  completedInSave?: true;
  slots: { item: string; quantity: number; quality: number; donated: boolean | null }[];
};

export function readBundleDefinition(key: string, value: string, progress: readonly boolean[] | undefined): SaveBundle | null {
  const match = /^([^/]{1,80})\/(\d{1,5})$/.exec(key);
  const [name, , items, , required] = value.split('/');
  if (!match || !name || name.length > 100 || !items) return null;
  const tokens = items.trim().split(/\s+/);
  const length = tokens.length / 3;
  if (!Number.isInteger(length) || length < 1 || length > 48) return null;
  const needed = required ? (/^\d{1,2}$/.test(required) ? Number(required) : -1) : length;
  if (needed < 1 || needed > length) return null;
  // Completed bundles may have the entire padded flag array set, including unused slots.
  const completedInSave = progress !== undefined && progress.length > length && progress.every(Boolean);
  const trustworthy = progress && progress.length >= length && !progress.slice(length).includes(true);
  const slots: SaveBundle['slots'] = [];
  for (let i = 0; i < length; i++) {
    const [item, quantityText, qualityText] = tokens.slice(i * 3, i * 3 + 3);
    if (!/^(?:-1|(?:\(O\))?[A-Za-z0-9_.-]{1,80})$/.test(item) || !/^\d{1,7}$/.test(quantityText) || !/^\d{1,7}$/.test(qualityText)) return null;
    const quantity = Number(quantityText), quality = Number(qualityText);
    if (quantity < 1 || (item === '-1' ? length !== 1 || quantity !== quality : ![0, 1, 2, 4].includes(quality))) return null;
    slots.push({ item, quantity, quality: item === '-1' ? 0 : quality, donated: trustworthy ? progress[i] : null });
  }
  return { id: Number(match[2]), room: match[1], name, needed, slots, ...(completedInSave ? {completedInSave:true as const} : {}) };
}
