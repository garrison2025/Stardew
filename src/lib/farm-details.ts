import {FARM_TEMPLATE_LINKS} from './farm-templates.ts';
import {originalMap} from './map-model.ts';
export const FARM_DETAILS=[
  {
    "name": "Standard",
    "best": "Large crop operations and flexible building placement",
    "advantage": "Large connected planting fields",
    "limitation": "Few exclusive resource bonuses",
    "idea": "Reserve a central crop area and a separate machine/animal zone"
  },
  {
    "name": "Riverland",
    "best": "Fishing-first play and smoked fish",
    "advantage": "Fish Smoker at start; river fishing",
    "limitation": "Land fragmented by water",
    "idea": "Group crops on one island and use bridges for travel"
  },
  {
    "name": "Forest",
    "best": "Foraging and hardwood",
    "advantage": "Renewing hardwood stumps and seasonal forage",
    "limitation": "Woodland and ponds reduce planting space",
    "idea": "Keep renewable stumps accessible; put fields in open clearings"
  },
  {
    "name": "Hill-top",
    "best": "Mining and processing",
    "advantage": "Small resource quarry",
    "limitation": "Cliffs, stream and possible blocked quarry access",
    "idea": "Keep a route to the quarry; place machines nearby"
  },
  {
    "name": "Wilderness",
    "best": "Combat-oriented mixed farming",
    "advantage": "Night monster option and special golem encounters",
    "limitation": "Night work can be interrupted; ponds and cliffs",
    "idea": "Keep paths between buildings clear"
  },
  {
    "name": "Four Corners",
    "best": "Co-op or separated production zones",
    "advantage": "Distinct zones with forestry, fishing and quarry resources",
    "limitation": "Cross-zone travel and terrain barriers",
    "idea": "Allocate one zone to each major production activity"
  },
  {
    "name": "Beach",
    "best": "Animals, fish ponds and artisan goods",
    "advantage": "Beach forage and supply crates; open building space",
    "limitation": "Ordinary sprinklers fail on sand; limited non-sandy crop area",
    "idea": "Reserve irrigable soil for crops; use sand for buildings"
  },
  {
    "name": "Meadowlands",
    "best": "Early livestock and grazing",
    "advantage": "Starts with a coop, two chickens and blue grass",
    "limitation": "Less open tillable area than Standard",
    "idea": "Protect grass and reserve space for animal buildings"
  }
] as const;
// Convert our existing original schematic into one path per terrain class, not a game map.
export function schematicPaths(name:string){
 const id=FARM_TEMPLATE_LINKS.find(x=>x.farm===name)?.id;if(!id)throw Error('Unknown farm');
 const m=originalMap(id),paths:Record<string,string>={};
 for(let y=0;y<m.h;y++){let x=0;while(x<m.w){const t=m.tiles[y*m.w+x];let end=x+1;while(end<m.w&&m.tiles[y*m.w+end]===t)end++;paths[t]=(paths[t]??'')+'M'+x+' '+y+'h'+(end-x)+'v1h-'+(end-x)+'z';x=end}}
 return {w:m.w,h:m.h,paths,id};
}
