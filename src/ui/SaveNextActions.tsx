import React from 'react';
import {CATALOGS} from '../lib/game-collections';
import {MUSEUM_ITEMS} from '../lib/museum-data';
import {SAVE_COLLECTION_IDS} from '../lib/save-collection-ids';
import type {SaveProgress} from '../lib/save-progress';
import type {Season} from '../lib/map-model';

const links = [
  ['fishing', 'Fish collection'],
  ['museum', 'Museum'],
  ['shipping', 'Shipping'],
  ['cooking', 'Cooking'],
  ['crafting', 'Crafting'],
] as const;
const qualities: Record<number, string> = {0: 'normal or better', 1: 'silver or better', 2: 'gold or better', 4: 'iridium'};
const itemNames = new Map<string, string>(
  Object.values(SAVE_COLLECTION_IDS).flatMap(entries => Object.entries(entries)),
);

export default function SaveNextActions({progress, season}: {progress: SaveProgress; season: Season | null}) {
  const taken = new Set(progress.collections?.fishing?.done);
  const tag = season === 'autumn' ? 'fall' : season;
  const seasonalFish = progress.collections?.fishing && tag
    ? CATALOGS.fishing.filter(item => (item.seasons?.includes(tag) || item.seasons?.includes('all')) && !taken.has(item.name))
    : [];
  const learned = (progress.crafting?.known ?? []).filter(name => !progress.crafting?.done.includes(name));
  const bundles = progress.bundles ?? [];
  const openBundles = bundles.filter(bundle => !bundle.slots.every(slot => slot.donated !== null) || bundle.slots.filter(slot => slot.donated).length < bundle.needed);

  return <section aria-label="Next actions from this save">
    <h3>What to check next</h3>
    <p className="muted">Based on this file only. Confirm entries in game before marking completion. Unrecognized or absent records stay unknown.</p>
    {seasonalFish.length > 0 && <details open>
      <summary>{seasonalFish.length} fish to check for {season} · common routes</summary>
      <ul>{seasonalFish.map(item => <li key={item.name}><strong>{item.name}</strong>{item.hint ? ' · ' + item.hint : ''}</li>)}</ul>
      <a href="/fishing/">Open fish collection and filters</a>
    </details>}
    {bundles.length > 0 && <details open>
      <summary>Community Center · {openBundles.length} bundles to check</summary>
      <p className="muted">Uses the requirements stored in this file, including a custom set where present. Slot data is shown for review and stays separate from manually saved donations.</p>
      {openBundles.map(bundle => {
        const flagged = bundle.slots.filter(slot => slot.donated).length;
        const complete = bundle.slots.every(slot => slot.donated !== null);
        return <details key={bundle.id}>
          <summary>{bundle.room} · {bundle.name} · {complete ? (bundle.needed - flagged) + ' remaining' : 'donations unknown'}</summary>
          <ul>{bundle.slots.filter(slot => slot.donated !== true).map((slot, i) => {
            const id = slot.item.replace(/^\(O\)/, '');
            const label = slot.item === '-1' ? slot.quantity.toLocaleString('en-US') + 'g' : slot.quantity + ' × ' + (itemNames.get(id) ?? 'game item ' + slot.item) + ' · ' + qualities[slot.quality];
            return <li key={i}>{label}{slot.donated === null ? ' · check donation in game' : ''}</li>;
          })}</ul>
        </details>;
      })}
      <a href="/bundles/">Open bundle tracker</a>
    </details>}
    {learned.length > 0 && <details>
      <summary>{learned.length} known crafting recipes without a positive crafted count</summary>
      <ul>{learned.map(name => <li key={name}>{name}</li>)}</ul>
      <a href="/crafting/">Open recipe and material planner</a>
    </details>}
    <div className="rules-grid">
      {links.map(([kind, label]) => {
        const observed = kind === 'crafting' ? progress.crafting : progress.collections?.[kind];
        const count = kind === 'museum' ? MUSEUM_ITEMS.length : CATALOGS[kind].length;
        return <article className="rule-card" key={kind}>
          <strong><a href={'/' + kind + '/'}>{label}</a></strong>
          <small>{observed ? observed.done.length + ' recognized out of ' + count + ' reference entries' : 'No readable records in this file'}</small>
        </article>;
      })}
    </div>
    <p><a href="/golden-walnuts/">Check walnut tasks manually</a> · <a href="/perfection/">Review perfection estimate</a></p>
  </section>;
}
