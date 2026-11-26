import React,{useEffect,useRef,useState} from 'react';
import type {Point} from '../lib/map-model';

export type ImageBounds={x:number;y:number;width:number;height:number};

export default function ScreenshotBounds({image,bounds,onChange}:{
 image:ImageBitmap;
 bounds:ImageBounds|null;
 onChange:(bounds:ImageBounds)=>void;
}){
 const canvas=useRef<HTMLCanvasElement>(null);
 const gesture=useRef<{pointer:number;start:Point}|null>(null);
 const [draft,setDraft]=useState<ImageBounds|null>(null);
 const scale=Math.min(1,480/image.width,220/image.height);
 const width=Math.max(1,Math.round(image.width*scale));
 const height=Math.max(1,Math.round(image.height*scale));

 useEffect(()=>{
  const ctx=canvas.current?.getContext('2d');
  if(!ctx)return;
  ctx.drawImage(image,0,0,width,height);
  const region=draft??bounds;
  if(!region)return;
  const x=region.x*width/image.width,y=region.y*height/image.height;
  const w=region.width*width/image.width,h=region.height*height/image.height;
  ctx.fillStyle='#24213799';
  ctx.fillRect(0,0,width,y);
  ctx.fillRect(0,y+h,width,height-y-h);
  ctx.fillRect(0,y,x,h);
  ctx.fillRect(x+w,y,width-x-w,h);
  ctx.strokeStyle='#ffdf89';
  ctx.lineWidth=2;
  ctx.strokeRect(x,y,w,h);
 },[image,width,height,bounds,draft]);

 function point(event:React.PointerEvent<HTMLCanvasElement>):Point{
  const box=event.currentTarget.getBoundingClientRect();
  return {
   x:Math.round(Math.max(0,Math.min(1,(event.clientX-box.left)/box.width))*image.width),
   y:Math.round(Math.max(0,Math.min(1,(event.clientY-box.top)/box.height))*image.height)
  };
 }
 function selection(event:React.PointerEvent<HTMLCanvasElement>){
  const active=gesture.current;
  if(active?.pointer!==event.pointerId)return null;
  const end=point(event);
  return {
   x:Math.min(active.start.x,end.x),y:Math.min(active.start.y,end.y),
   width:Math.abs(end.x-active.start.x),height:Math.abs(end.y-active.start.y)
  };
 }
 function reset(){
  gesture.current=null;
  setDraft(null);
 }
 return <canvas ref={canvas} width={width} height={height} className="screenshot-bounds" role="img"
  aria-label="Screenshot map bounds"
  onPointerDown={event=>{
   if(!event.isPrimary||event.button!==0)return;
   event.currentTarget.setPointerCapture(event.pointerId);
   gesture.current={pointer:event.pointerId,start:point(event)};
  }}
  onPointerMove={event=>{const next=selection(event);if(next)setDraft(next)}}
  onPointerUp={event=>{
   const next=selection(event);
   if(!next)return;
   reset();
   onChange(next);
  }}
  onLostPointerCapture={reset}
 />;
}
