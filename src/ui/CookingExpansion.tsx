import React from 'react';
import {expandedCookingPlan} from '../lib/cooking-expansion';
import {download} from '../lib/local';
export default function CookingExpansion({batches}:{batches:Record<string,number>}){
 const result=expandedCookingPlan(batches);
 if(!result.ingredients.length)return null;
 return <details className="rule-card"><summary>Expand intermediate cooking recipes</summary><p>Make every selected dish and its named cooking prerequisites from scratch. Existing intermediate stock is not deducted; this is separate from the direct ingredient inventory and cost tool. Processed goods outside the cooking catalogue and generic ingredient groups remain inputs.</p>
 <h3>Expanded ingredient requirements</h3><div className="tablewrap"><table><thead><tr><th scope="col">Ingredient</th><th scope="col">Quantity</th></tr></thead><tbody>{result.ingredients.map(([name,n])=><tr key={name}><th scope="row">{name}</th><td>{n}</td></tr>)}</tbody></table></div>
 <h3>Additional intermediate recipe batches</h3><p>{result.intermediates.map(([name,n])=>n+' × '+name).join(' · ')||'No intermediate cooking recipes required'}</p><button onClick={()=>download('expanded-cooking-plan.json',JSON.stringify({schema:1,batches,...result},null,2))}>Export expanded cooking ingredients</button></details>
}
