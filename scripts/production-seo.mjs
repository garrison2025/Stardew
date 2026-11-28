import assert from 'node:assert/strict';
export function approvedOrigins(release,pages,publicValue,privateValue){
 assert.ok(release.status==='production-approved'&&release.rightsApproved===true&&release.dataApproved===true&&release.fixturesApproved===true&&release.serpApproved===true,'Production approval gates remain closed');
 assert.ok(Array.isArray(release.gameVersions)&&release.gameVersions.length>0&&release.gameVersions.every(v=>/^\d+\.\d+\.\d+(?:\.\d+)?$/.test(v)),'Explicit supported patch versions required');
 assert.ok(pages.length===16&&new Set(pages.map(p=>p.path)).size===16&&pages.every(p=>p.indexable===true&&p.releaseStatus==='approved'&&p.adsEnabled===false),'Every core tool needs separate approval; advertising remains disabled');
 function parse(value){const u=new URL(value);assert.ok(u.protocol==='https:'&&u.pathname==='/'&&!u.search&&!u.hash&&!u.username&&!u.password&&!u.port,'Use an HTTPS root origin');assert.ok(u.hostname.includes('.')&&!u.hostname.endsWith('.pages.dev')&&!u.hostname.endsWith('.localhost')&&!/^\d+\.\d+\.\d+\.\d+$/.test(u.hostname),'Use an approved custom domain, not a preview or IP');return u}
 const pub=parse(publicValue),priv=parse(privateValue);
 assert.notEqual(pub.origin,priv.origin);assert.ok(!pub.hostname.startsWith('www.')&&priv.hostname==='app.'+pub.hostname,'Public apex and distinct app subdomain required');
 return {publicOrigin:pub.origin,workspaceOrigin:priv.origin};
}
export function canonicalFor(page,origin){assert.ok(/^\/(?:[a-z0-9-]+\/)?$/.test(page.path),'Invalid public route');return new URL(page.path,origin).href}
export function schemaFor(page,origin){
 const canonical=canonicalFor(page,origin),site=origin+'/#website',application=canonical+'#application',webpage=canonical+'#webpage';
 const graph=[
 {'@type':'WebSite','@id':site,name:'Field & Farm',url:origin+'/',inLanguage:'en'},
 {'@type':'WebPage','@id':webpage,url:canonical,name:page.h1,description:page.description,inLanguage:'en',isPartOf:{'@id':site},mainEntity:{'@id':application}},
 {'@type':'WebApplication','@id':application,name:page.h1,url:canonical,description:page.description,applicationCategory:'GameApplication',operatingSystem:'Any',browserRequirements:'Requires JavaScript',offers:{'@type':'Offer',price:0,priceCurrency:'USD'}}
 ];
 if(page.path!=='/')graph.push({'@type':'BreadcrumbList','@id':canonical+'#breadcrumb',itemListElement:[{'@type':'ListItem',position:1,name:'Tools',item:origin+'/'},{'@type':'ListItem',position:2,name:page.h1.replace('Stardew Valley ',''),item:canonical}]});
 return {'@context':'https://schema.org','@graph':graph}
}
const xml=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
export function sitemapFor(pages,origin){assert.ok(pages.every(p=>p.indexable===true),'Only approved canonical URLs');return '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'+pages.map(p=>'  <url><loc>'+xml(canonicalFor(p,origin))+'</loc></url>').join('\n')+'\n</urlset>\n'}
export function activateSeo(html,page,origin){const robots=/<meta\s+name="robots"\s+content="noindex,nofollow"\s*\/?>/i;assert.ok(robots.test(html),'Expected preview robots tag');assert.ok(!/rel="canonical"/i.test(html),'Unexpected existing canonical');const canonical=canonicalFor(page,origin),json=JSON.stringify(schemaFor(page,origin)).replaceAll('<','\\u003c');assert.ok(html.includes('</head>'));return html.replace(robots,'<meta name="robots" content="index,follow">').replace('</head>','<link rel="canonical" href="'+xml(canonical)+'"><meta property="og:url" content="'+xml(canonical)+'"><script type="application/ld+json">'+json+'</script></head>')}

export function assertProductionPage(html,page,origin){
 const canonical=canonicalFor(page,origin),head=html.slice(0,html.indexOf('</head>'));
 assert.ok(head.includes('<meta name="robots" content="index,follow">'),page.path+' missing index directive');
 assert.ok(!/noindex|nofollow/i.test(head),page.path+' conflicting directives');
 assert.equal((head.match(/<link\s+rel="canonical"/g)||[]).length,1,page.path+' canonical count');
 assert.ok(head.includes('rel="canonical" href="'+xml(canonical)+'"'),page.path+' canonical mismatch');
 assert.ok(head.includes('property="og:url" content="'+xml(canonical)+'"'),page.path+' social URL mismatch');
 const ld=[...head.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];assert.equal(ld.length,1,page.path+' schema count');
 assert.deepEqual(JSON.parse(ld[0][1]),schemaFor(page,origin),page.path+' schema drift');
 assert.ok(!/aggregateRating|reviewRating/.test(ld[0][1]),page.path+' unsupported rating');
 return canonical;
}
