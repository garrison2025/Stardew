import fs from 'node:fs';import path from 'node:path';import {gzipSync} from 'node:zlib';import assert from 'node:assert/strict';
const dir=process.argv[2]||'dist';
function walk(d){return fs.readdirSync(d,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(d,e.name)):[path.join(d,e.name)])}
const files=walk(dir),measure=ext=>files.filter(f=>f.endsWith(ext)).map(f=>({file:path.relative(dir,f),bytes:fs.statSync(f).size,gzip:gzipSync(fs.readFileSync(f)).length}));
const js=measure('.js'),css=measure('.css'),html=measure('.html'),png=files.filter(f=>f.endsWith('.png')).map(f=>({file:path.relative(dir,f),bytes:fs.statSync(f).size}));const sum=(a,k)=>a.reduce((n,v)=>n+v[k],0);
const report={dir,jsGzip:sum(js,'gzip'),cssGzip:sum(css,'gzip'),maxHtmlGzip:Math.max(...html.map(f=>f.gzip)),pngBytes:sum(png,'bytes'),largestJs:js.sort((a,b)=>b.gzip-a.gzip).slice(0,5)};
console.log(JSON.stringify(report,null,2));assert.ok(report.jsGzip<=650000,'JS bundle compressed budget (all chunks) exceeded');assert.ok(report.cssGzip<=100000,'CSS compressed budget exceeded');assert.ok(report.maxHtmlGzip<=180000,'HTML compressed budget exceeded');assert.ok(report.pngBytes<=500000,'Bundled PNG budget exceeded');console.log('Static transfer size budgets passed; not a Core Web Vitals measurement.');
