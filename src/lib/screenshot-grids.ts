// Suggest integer, square-pixel grids for a full uncropped screenshot. No game map data is inferred.
export type GridCandidate={w:number;h:number;tile:number};
export function screenshotGrids(width:number,height:number):GridCandidate[]{
 if(!Number.isSafeInteger(width)||!Number.isSafeInteger(height)||width<8||height<8||width*height>24000000)return [];
 const result:GridCandidate[]=[];for(let tile=4;tile<=128;tile++){if(width%tile||height%tile)continue;const w=width/tile,h=height/tile;if(w>=8&&w<=160&&h>=8&&h<=160)result.push({w,h,tile})}
 return result.sort((a,b)=>Math.abs(a.tile-16)-Math.abs(b.tile-16)||a.tile-b.tile);
}
