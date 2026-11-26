import {useEffect,useState} from 'react';import type {ArtPack} from '../lib/art-packs';
type Loaded={path:string;image:HTMLImageElement|null;failed:boolean};
const cache=new Map<string,HTMLImageElement>();
export function useArtPack(pack:ArtPack,enabled:boolean){
 const [loaded,setLoaded]=useState<Loaded|null>(null);
 useEffect(()=>{if(!enabled)return;let alive=true;const existing=cache.get(pack.path);if(existing&&existing.naturalWidth===pack.width&&existing.naturalHeight===pack.height){setLoaded({path:pack.path,image:existing,failed:false});return}
 const img=new Image();setLoaded(null);
 img.onload=()=>{if(!alive)return;const valid=img.naturalWidth===pack.width&&img.naturalHeight===pack.height;if(valid)cache.set(pack.path,img);setLoaded({path:pack.path,image:valid?img:null,failed:!valid})};
 img.onerror=()=>{if(alive)setLoaded({path:pack.path,image:null,failed:true})};
 img.src=pack.path;return()=>{alive=false;img.onload=null;img.onerror=null}
 },[pack,enabled]);
 const current=enabled&&loaded?.path===pack.path?loaded:null;
 return {image:current?.image??null,failed:current?.failed??false,status:!enabled?'original':current?.image?'ready':current?.failed?'fallback':'loading'}
}
