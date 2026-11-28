import {dimensions,itemById,type Plan} from './map-model.ts';
import type {SaveSnapshot,ImportIssue} from './save-model.ts';
export type ObservedPlotRow={index:number;itemId:string|null;x:number;y:number;w:number;h:number;editable:boolean;reason:string|null};
export function observedFarmPreview(snapshot:SaveSnapshot,plan:Plan,issues:readonly ImportIssue[]){
 const accepted=new Set(plan.objects.map(o=>o.id)),rejected=new Map(issues.map(i=>[i.index,i.reason]));
 const plotted:ObservedPlotRow[]=[];let unlocated=0;
 for(const [index,r] of snapshot.records.entries()){
  if(r.x===null||r.y===null||!Number.isSafeInteger(r.x)||!Number.isSafeInteger(r.y)||r.x<0||r.y<0||r.x>=plan.map.w||r.y>=plan.map.h){unlocated++;continue}
  const known=r.itemId&&itemById.has(r.itemId)?r.itemId:null;
  const d=known?dimensions({itemId:known,rotation:0}):{w:1,h:1};
  const saved=r.kind==='building'&&Number.isSafeInteger(r.width)&&Number.isSafeInteger(r.height)&&r.width!>0&&r.height!>0&&r.width!<=160&&r.height!<=160?{w:r.width!,h:r.height!}:d;
  plotted.push({index,itemId:known,x:r.x,y:r.y,w:Math.min(saved.w,plan.map.w-r.x),h:Math.min(saved.h,plan.map.h-r.y),editable:accepted.has('save-'+index),reason:rejected.get(index)??null});
 }
 return {plotted,unlocated,editable:plan.objects.length,total:snapshot.records.length,observedOnly:plotted.filter(r=>!r.editable).length};
}
