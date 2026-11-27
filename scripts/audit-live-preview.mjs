import fs from 'node:fs';
import assert from 'node:assert/strict';
const pages=JSON.parse(fs.readFileSync(new URL('../src/config/pages.json',import.meta.url),'utf8'));
function origin(value){const u=new URL(value);assert.equal(u.protocol,'https:');assert.equal(u.pathname,'/');assert.ok(!u.search&&!u.hash&&!u.username&&!u.password);return u.origin}
const args=process.argv.slice(2),revisionIndex=args.indexOf('--revision');
let expected;
if(revisionIndex!==-1){expected=args[revisionIndex+1];assert.ok(/^[0-9a-f]{40}$/i.test(expected??''),'Expected full 40-character commit SHA');args.splice(revisionIndex,2)}
if(args.length<1||args.length>2){console.error('Usage: node scripts/audit-live-preview.mjs https://PUBLIC_ORIGIN [https://PRIVATE_ORIGIN] [--revision FULL_SHA]');process.exit(2)}
const publicOrigin=origin(args[0]),privateOrigin=args[1]?origin(args[1]):undefined;
if(privateOrigin)assert.notEqual(publicOrigin,privateOrigin,'Preview origins must be distinct');
async function get(base,p,status=200,document=false){const r=await fetch(base+p,{redirect:'manual',signal:AbortSignal.timeout(15000)});assert.equal(r.status,status,base+p);if(document){assert.ok(/noindex/i.test(r.headers.get('x-robots-tag')||''),base+p+' X-Robots-Tag');const csp=r.headers.get('content-security-policy')||'';assert.ok(/frame-ancestors\s+'none'/.test(csp),base+p+' CSP frame isolation');assert.ok(/(?:^|;\s*)connect-src\s+'self'\s*(?:;|$)/.test(csp),base+p+' CSP network isolation')}return r}
const revisionOf=html=>html.match(/<meta\s+name="build-revision"\s+content="([0-9a-f]{40})"/i)?.[1];
let commonRevision;
for(const base of [publicOrigin,...(privateOrigin?[privateOrigin]:[])]){
 let revision;
 for(const page of pages){const r=await get(base,page.path,200,true),html=await r.text();assert.ok(/noindex,nofollow/i.test(html));assert.ok(!/googlesyndication|adsterra|google-analytics/.test(html));assert.ok(html.includes(page.title.replaceAll('&','&amp;'))||html.includes(page.title));const sha=revisionOf(html);assert.ok(sha,base+page.path+' missing build revision');if(expected)assert.equal(sha,expected,base+page.path+' unexpected revision');if(revision)assert.equal(sha,revision,base+page.path+' mixed build revisions');else revision=sha}
 if(commonRevision)assert.equal(revision,commonRevision,'Public and private preview revisions differ');else commonRevision=revision;
 const robots=await (await get(base,'/robots.txt')).text();assert.ok(/Disallow:\s*\//i.test(robots));
 for(const asset of ['/art/kenney-outdoor.png','/art/kenney-indoor.png']){const r=await get(base,asset);assert.ok((r.headers.get('content-type')||'').startsWith('image/png'));const b=Buffer.from(await r.arrayBuffer());assert.equal(b.subarray(0,8).toString('hex'),'89504e470d0a1a0a')}
 const credit=await fetch(base+'/art/credits.html',{redirect:'manual',signal:AbortSignal.timeout(15000)});if(credit.status===308||credit.status===301){assert.equal(new URL(credit.headers.get('location')||'',base).href,base+'/art/credits','Unexpected artwork-credit redirect');await get(base,'/art/credits')}else assert.equal(credit.status,200,'Artwork credits');await get(base,'/nonexistent-preview-acceptance-check-404',404);
 const html=await(await get(base,'/tracker/',200,true)).text();assert.equal(html.includes('Choose main save file'),base===privateOrigin,'Save input separation');
 if(base===publicOrigin&&privateOrigin)assert.ok(html.includes(privateOrigin+'/tracker/'),'Public tracker does not link to configured private origin');
 console.log(base+': '+pages.length+' routes, revision '+revision+', security headers, assets, 404 and save-input separation passed');
}
if(!privateOrigin)console.log('Public-only verification passed. Private deployment and cross-origin isolation remain unverified.');
