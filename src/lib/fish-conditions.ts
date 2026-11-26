import type {CatalogItem} from './game-collections.ts';
export function referenceFishRoute(item:CatalogItem){
 const hint=item.hint||'',main=hint.split(';')[0],weather=/\brain\b/i.test(main)?'rain':/\bsun(?:ny)?\b/i.test(main)?'sun':'unspecified';
 const time=(s:string)=>{if(s==='noon')return 12*60;if(s==='midnight')return 24*60;const m=s.match(/^(\d{1,2})(am|pm)$/);if(!m)return null;let h=Number(m[1])%12+(m[2]==='pm'?12:0);if(h<6)h+=24;return h*60};
 const ranges=[...main.toLowerCase().matchAll(/(\d{1,2}(?:am|pm)|noon|midnight)[–-](\d{1,2}(?:am|pm)|noon|midnight)/g)].flatMap(m=>{const start=time(m[1]),end=time(m[2]);return start!==null&&end!==null&&end>start?[[start,end]]:[]});
 return {main,weather,ranges,anytime:/\banytime\b/i.test(main),pot:/crab pot/i.test(main)};
}
export function matchesFishReference(item:CatalogItem,filter:{location:string;weather:string;time:number|null;includeUnknown:boolean;method:string}){
 const r=referenceFishRoute(item);
 if(filter.location&&!r.main.toLowerCase().includes(filter.location.toLowerCase()))return false;
 if(filter.weather!=='all'&&r.weather!==filter.weather&&!(filter.includeUnknown&&r.weather==='unspecified'))return false;
 if(filter.method==='pot'&&!r.pot||filter.method==='other'&&r.pot)return false;
 if(filter.time!==null&&!r.anytime){if(!r.ranges.length)return filter.includeUnknown;return r.ranges.some(([a,b])=>filter.time!>=a&&filter.time!<b)}
 return true;
}
