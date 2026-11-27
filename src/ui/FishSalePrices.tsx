import React, { useState } from 'react';

type PriceTiers = readonly [number, number, number, number];
type PriceTable = readonly [PriceTiers, PriceTiers, PriceTiers];

// Item reference pages list prices by profession, then by quality.
const priceTables: Record<string, PriceTable> = {
  'Anchovy': [[30, 37, 45, 60], [37, 46, 56, 75], [45, 55, 67, 90]],
  'Blobfish': [[500, 625, 750, 1000], [625, 781, 937, 1250], [750, 937, 1125, 1500]],
  'Catfish': [[200, 250, 300, 400], [250, 312, 375, 500], [300, 375, 450, 600]],
  'Largemouth Bass': [[100, 125, 150, 200], [125, 156, 187, 250], [150, 187, 225, 300]],
  'Lava Eel': [[700, 875, 1050, 1400], [875, 1093, 1312, 1750], [1050, 1312, 1575, 2100]],
  'Legend': [[5000, 6250, 7500, 10000], [6250, 7812, 9375, 12500], [7500, 9375, 11250, 15000]],
  'Pufferfish': [[200, 250, 300, 400], [250, 312, 375, 500], [300, 375, 450, 600]],
  'Salmon': [[75, 93, 112, 150], [93, 116, 140, 187], [112, 139, 168, 225]],
  'Sardine': [[40, 50, 60, 80], [50, 62, 75, 100], [60, 75, 90, 120]],
  'Sturgeon': [[200, 250, 300, 400], [250, 312, 375, 500], [300, 375, 450, 600]],
  'Sunfish': [[30, 37, 45, 60], [37, 46, 56, 75], [45, 55, 67, 90]],
  'Tuna': [[100, 125, 150, 200], [125, 156, 187, 250], [150, 187, 225, 300]],
  'Woodskip': [[75, 93, 112, 150], [93, 116, 140, 187], [112, 139, 168, 225]],
};
const fishPrices = new Map(Object.entries(priceTables));
const professions = [
  { key: 'none', label: 'No price bonus', factor: 100 },
  { key: 'fisher', label: 'Fisher (+25%)', factor: 125 },
  { key: 'angler', label: 'Angler (+50%)', factor: 150 },
] as const;
const qualities = ['Normal', 'Silver', 'Gold', 'Iridium'];

function fishReference(name: string) {
  return 'https://stardewvalleywiki.com/' + encodeURIComponent(name.replaceAll(' ', '_'));
}

export default function FishSalePrices({ names }: { names: readonly string[] }) {
  const [fish, setFish] = useState('Catfish');
  const [manual, setManual] = useState('');
  const [profession, setProfession] = useState('none');
  const [quality, setQuality] = useState(0);
  const professionIndex = professions.findIndex(option => option.key === profession);
  const manualMode = fish === 'custom';
  const table = fishPrices.get(fish);
  const amount = Number(manual);
  const validAmount = Number.isSafeInteger(amount) && amount >= 1 && amount <= 1000000;
  const price = manualMode && validAmount
    ? Math.floor(amount * professions[professionIndex].factor / 100)
    : table?.[professionIndex]?.[quality];

  return <section className="rule-card" id="fish-prices" aria-labelledby="fish-prices-title">
    <h3 id="fish-prices-title">Stardew Valley fish prices</h3>
    <p>Compare raw sale prices for {fishPrices.size} verified fish across four quality tiers. Choose any collection entry to open its price reference, or enter a normal-quality base value.</p>
    <div className="formgrid">
      <label>Fish<select aria-label="Fish" value={fish} onChange={e => setFish(e.target.value)}>
        <optgroup label="Compare in this tool">
          {names.filter(name => fishPrices.has(name)).map(name => <option key={name}>{name}</option>)}
        </optgroup>
        <optgroup label="Look up on the wiki">
          {names.filter(name => !fishPrices.has(name)).map(name => <option key={name}>{name}</option>)}
        </optgroup>
        <option value="custom">Enter base price</option>
      </select></label>
      {manualMode && <label>Base sale price (g)<input aria-label="Base sale price (g)" type="number" min={1} max={1000000} step={1} value={manual} onChange={e => setManual(e.target.value)}/></label>}
      {table && <label>Fish quality<select aria-label="Fish quality" value={quality} onChange={e => setQuality(Number(e.target.value))}>
        {qualities.map((label, index) => <option key={label} value={index}>{label}</option>)}
      </select></label>}
      {(manualMode || table) && <label>Fishing profession<select aria-label="Fishing profession" value={profession} onChange={e => setProfession(e.target.value)}>
        {professions.map(({ key, label }) => <option key={key} value={key}>{label}</option>)}
      </select></label>}
    </div>
    <p aria-live="polite">{price !== undefined
      ? price.toLocaleString('en-US') + 'g per fish'
      : manualMode ? 'Enter a whole-gold base price.' : 'Use the item reference to check this entry’s sale price.'}</p>
    {manualMode
      ? <p className="muted">Manual entry uses normal quality. See the <a href="https://stardewvalleywiki.com/Fish">fish price reference</a> for item values.</p>
      : <p className="muted"><a href={fishReference(fish)} target="_blank" rel="noreferrer">{fish} sale price reference</a></p>}
  </section>;
}
