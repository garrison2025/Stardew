import type {SaveElement} from './save-xml.ts';
const child=(n:SaveElement|undefined,k:string)=>n?.children.find(c=>c.localName===k);
export const UINT_MAX=4294967295;
export function readPlayerStat(player:SaveElement|undefined,key:string):number|null{
 const node=child(child(player,'stats'),'Values');
 if(!node||node.getAttributeNS('http://www.w3.org/2001/XMLSchema-instance','nil')==='true'||node.children.length>10000)return null;
 const matches=node.children.filter(e=>e.localName==='item'&&child(child(e,'key'),'string')?.textContent.trim().toLowerCase()===key.toLowerCase());
 if(matches.length!==1)return null;
 const value=child(matches[0],'value'),elements=value?.children??[];
 if(elements.length!==1||!['unsignedInt','int'].includes(elements[0].localName))return null;
 const raw=elements[0].textContent.trim(),n=Number(raw);
 return /^\d+$/.test(raw)&&Number.isSafeInteger(n)&&n<=UINT_MAX?n:null;
}
