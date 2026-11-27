import React from 'react';
export function Glyph({name}:{name:string}){
const paths:Record<string,React.ReactNode>={
grid:<><rect x="3" y="3" width="18" height="18" rx="3"/><path d="M3 9h18M3 15h18M9 3v18M15 3v18"/></>,
sprout:<><path d="M12 21v-9M12 14C5 14 3 9 4 4c5 0 8 3 8 8M12 16c0-6 4-9 8-9 0 6-3 9-8 9"/></>,
water:<><path d="M12 3c3 4 7 8 7 12a7 7 0 1 1-14 0c0-4 4-8 7-12Z"/><path d="M9 16c0 2 1 3 3 3"/></>,
path:<><path d="M8 3 4 21M16 3l4 18M12 3v3m0 4v4m0 4v3"/></>,
house:<><path d="m3 11 9-8 9 8M5 10v11h14V10M10 21v-7h4v7"/></>,
erase:<><path d="m4 12 8-9 9 8-8 10H8l-4-4a4 4 0 0 1 0-5ZM7 8l9 8M13 21h8"/></>,
undo:<><path d="m9 14-5-5 5-5M4 9h10a6 6 0 0 1 0 12"/></>,
redo:<><path d="m15 14 5-5-5-5m5 5H10a6 6 0 0 0 0 12"/></>,
download:<><path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5"/></>,
image:<><rect x="3" y="4" width="18" height="16" rx="3"/><circle cx="9" cy="9" r="2"/><path d="m3 16 5-5 5 5 3-3 5 5"/></>,
minus:<path d="M5 12h14"/>,plus:<path d="M5 12h14M12 5v14"/>,
spark:<><path d="m12 2 2.5 7.5L22 12l-7.5 2.5L12 22l-2.5-7.5L2 12l7.5-2.5Z"/></>,
info:<><circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-10v.1"/></>
};return <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round">{paths[name]||paths.grid}</svg>}

export function Num({name,value,set,min=0,max=100000}:{name:string;value:number;set:(n:number)=>void;min?:number;max?:number}){return <label>{name}<input type="number" min={min} max={max} value={value} onChange={e=>set(Number(e.target.value))}/></label>}
