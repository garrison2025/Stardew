import React,{useState} from 'react';

const fishPrices:Record<string,number>={
 Anchovy:30,Blobfish:500,Catfish:200,'Largemouth Bass':100,'Lava Eel':700,Legend:5000,
 Pufferfish:200,Salmon:75,Sardine:40,Sturgeon:200,Sunfish:30,Tuna:100,Woodskip:75
};
const professionFactors={none:100,fisher:125,angler:150} as const;
type Profession=keyof typeof professionFactors;

export default function FishSalePrices(){
 const [fish,setFish]=useState('Catfish');
 const [manual,setManual]=useState('');
 const [profession,setProfession]=useState<Profession>('none');
 const amount=fish==='custom'?Number(manual):fishPrices[fish];
 const valid=Number.isSafeInteger(amount)&&amount>=1&&amount<=1000000;
 const price=valid?Math.floor(amount*professionFactors[profession]/100):null;

 return <section className="rule-card" id="fish-prices" aria-labelledby="fish-prices-title">
  <h3 id="fish-prices-title">Stardew Valley fish prices</h3>
  <p>Compare normal-quality raw fish sale prices. Choose one of {Object.keys(fishPrices).length} reference fish or enter another fish’s base value.</p>
  <div className="formgrid">
   <label>Fish<select aria-label="Fish" value={fish} onChange={e=>setFish(e.target.value)}>
    {Object.keys(fishPrices).map(name=><option key={name}>{name}</option>)}
    <option value="custom">Enter base price</option>
   </select></label>
   {fish==='custom'&&<label>Base sale price (g)<input aria-label="Base sale price (g)" type="number" min={1} max={1000000} step={1} value={manual} onChange={e=>setManual(e.target.value)}/></label>}
   <label>Fishing profession<select aria-label="Fishing profession" value={profession} onChange={e=>setProfession(e.target.value as Profession)}>
    <option value="none">No price bonus</option><option value="fisher">Fisher (+25%)</option><option value="angler">Angler (+50%)</option>
   </select></label>
  </div>
  <p aria-live="polite">{price===null?'Enter a whole-gold base price.':price.toLocaleString('en-US')+'g per fish'}</p>
  <p className="muted">Angler’s bonus replaces Fisher’s. For other fish or quality tiers, consult the <a href="https://stardewvalleywiki.com/Fish">fish price reference</a>.</p>
 </section>;
}
