import { SaxesParser } from 'saxes';
export const MAX_SAVE_BYTES=50*1024*1024;
export const MAX_SAVE_NODES=600_000;
export const MAX_SAVE_DEPTH=128;
type Attribute={name:string;local:string;uri:string;value:string};
export class SaveElement {
 readonly children:SaveElement[]=[];
 private readonly parts:(string|SaveElement)[]=[];
 readonly localName:string;
 private readonly attributes:readonly Attribute[];
 constructor(localName:string,attributes:readonly Attribute[]){this.localName=localName;this.attributes=attributes}
 appendText(value:string){if(value)this.parts.push(value)}
 appendChild(child:SaveElement){this.children.push(child);this.parts.push(child)}
 get textContent():string{return this.parts.map(part=>typeof part==='string'?part:part.textContent).join('')}
 getAttribute(name:string):string|null{return this.attributes.find(a=>a.name===name)?.value??null}
 getAttributeNS(uri:string,local:string):string|null{return this.attributes.find(a=>a.uri===uri&&a.local===local)?.value??null}
}
export function parseSaveXml(xml:string,maxNodes=MAX_SAVE_NODES,maxDepth=MAX_SAVE_DEPTH){
 if(xml.length>MAX_SAVE_BYTES)throw Error('Save exceeds 50 MiB limit.');
 if(/<!\s*(DOCTYPE|ENTITY)/i.test(xml))throw Error('DTD and entity declarations are not supported.');
 let root:SaveElement|undefined,fields=0;const stack:SaveElement[]=[];
 const parser=new SaxesParser({xmlns:true as const});
 parser.on('error',()=>{throw Error('Expected well-formed UTF-8 main SaveGame XML.')});
 parser.on('doctype',()=>{throw Error('DTD and entity declarations are not supported.')});
 parser.on('opentag',tag=>{
  if(++fields>maxNodes)throw Error('Too many XML nodes.');
  if(stack.length>=maxDepth)throw Error('XML nesting is too deep.');
  const node=new SaveElement(tag.local,Object.values(tag.attributes));
  const parent=stack.at(-1);if(parent)parent.appendChild(node);else{if(root)throw Error('Expected a single XML root.');root=node}stack.push(node);
 });
 parser.on('text',value=>stack.at(-1)?.appendText(value));
 parser.on('cdata',value=>stack.at(-1)?.appendText(value));
 parser.on('closetag',()=>{stack.pop()});
 parser.write(xml).close();
 if(!root||stack.length||root.localName!=='SaveGame')throw Error('Expected a valid main SaveGame XML, not SaveGameInfo.');
 return {root,fields};
}
