import {COOKING,ingredientTotals} from './game-collections.ts';
// Expand only named cooking recipes. Processed food inputs not in the cooking
// catalogue, ingredient groups and store-bought items remain explicit terminal inputs.
export function expandedCookingPlan(batches:Record<string,number>,existing:Record<string,number>={}){
 ingredientTotals('cooking',batches); // Validate existing input contract.
 const recipes=new Map(COOKING.map(r=>[r.name,r]));
 const ingredients=new Map<string,number>(),intermediates=new Map<string,number>(),used=new Map<string,number>(),stock=new Map<string,number>();for(const [name,n] of Object.entries(existing)){if(!recipes.has(name)||!Number.isSafeInteger(n)||n<0||n>1000000)throw Error('Invalid intermediate stock');stock.set(name,n)}
 function add(map:Map<string,number>,name:string,n:number){const next=(map.get(name)??0)+n;if(!Number.isSafeInteger(next)||next>1e8)throw Error('Ingredient expansion too large');map.set(name,next)}
 function expand(name:string,units:number,stack:Set<string>,intermediate:boolean){
  const r=recipes.get(name);if(!r){add(ingredients,name,units);return}
  if(stack.has(name))throw Error('Recipe cycle: '+name);if(intermediate){const taken=Math.min(stock.get(name)??0,units);if(taken){stock.set(name,(stock.get(name)??0)-taken);add(used,name,taken);units-=taken}if(!units)return}
  const count=Math.ceil(units/(r.yield??1));if(intermediate)add(intermediates,name,count);
  const next=new Set(stack);next.add(name);
  for(const item of r.ingredients??[])expand(item.name,item.quantity*count,next,true);
 }
 for(const [name,count] of Object.entries(batches))if(count>0){const r=recipes.get(name)!;expand(name,count*(r.yield??1),new Set(),false)}
 const sort=(m:Map<string,number>)=>[...m].sort((a,b)=>a[0].localeCompare(b[0]));
 return {ingredients:sort(ingredients),intermediates:sort(intermediates),usedIntermediateStock:sort(used)};
}
