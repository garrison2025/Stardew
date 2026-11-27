import test from 'node:test';
import assert from 'node:assert/strict';
import {parseSaveXml,MAX_SAVE_BYTES} from '../src/lib/save-xml.ts';
test('namespace-aware worker tree preserves children, text, attributes and XML escapes',()=>{
 const {root,fields}=parseSaveXml('<?xml version="1.0"?><SaveGame xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"><player><name>A &amp; B</name><crop xsi:nil="true"/><note><![CDATA[a<b]]></note></player></SaveGame>');
 assert.equal(fields,5);const p=root.children[0];assert.equal(p.children[0].textContent,'A & B');assert.equal(p.children[1].getAttributeNS('http://www.w3.org/2001/XMLSchema-instance','nil'),'true');assert.equal(p.children[2].textContent,'a<b');
});
test('reject unsafe, malformed, wrong-root, deep and over-limit XML',()=>{
 for(const x of ['<!DOCTYPE SaveGame><SaveGame/>','<SaveGame><x></SaveGame>','<SaveGame>&unknown;</SaveGame>','<SaveGameInfo/>','<SaveGame/><SaveGame/>'])assert.throws(()=>parseSaveXml(x));
 assert.throws(()=>parseSaveXml('<SaveGame><a><b/></a></SaveGame>',2,10),/nodes/);
 assert.throws(()=>parseSaveXml('<SaveGame><a><b/></a></SaveGame>',10,2),/nesting/);
 assert.equal(MAX_SAVE_BYTES,50*1024*1024);
});
test('valid XML beyond former 10 MiB limit is accepted',()=>{const xml='<SaveGame><!--'+'x'.repeat(11*1024*1024)+'--><gameVersion>1.6.15</gameVersion></SaveGame>';assert.equal(parseSaveXml(xml).root.children[0].textContent,'1.6.15');});
