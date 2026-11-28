import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {join} from 'node:path';
import {importDataLayers,restrictionCounts} from '../src/lib/data-layers.ts';
const rows=[
 ['regular',80,65,3745,3638,3426,0,15,['39c01e7f68eeaf3908c507ec334e479786572b95','361b0ec268b021865fd565da396bbec992ac7a1d','255a8d6ceeb1c0f65a9dd550092d6caf4daca7b8']],
 ['fishing',80,65,3185,2079,1620,0,15,['7b651f9b5d146d8e09ae9fad4dce33cbf5168ec1','0ab49e59570ad9a6184fbf55966fc24d5b255779','dd2e61b762b88fc0ef0eca77cd515e93d475a5ec']],
 ['foraging',80,65,3220,2935,1406,0,15,['5d93ff18642fa7176d91e8e4ef041bb31550fc37','f5ab71d2175a5470fb571d34c83c32ad5be91d8c','9c78eae487e1c954a7bd22ea9055fadf0c728d8e']],
 ['mining',80,65,2937,2589,1659,0,15,['c0c14547386487516eda16d193f53efbdaefc670','590c602092b06872b9b79b0bc6535dbdb308bca9','cca10fe064a9f771d243e6cba43ee936049f53a2']],
 ['combat',80,65,3025,2556,2151,0,15,['25c609767684c159f3d8f32af0105f5dc0541a32','3c60f507197432ed7a74908b6379a938fb77452c','2d6c6bbbdd6429f51b1672d2bd6d475ad4cbbe55']],
 ['fourcorners',80,80,3624,3398,2954,0,19,['fc95b1423ecc42cf9e2644dbaf374c28a11bbf37','140e480126e061c2427776f9a0a34a05031d2cbb','b21e107ffcc66d99c05c5eb6a14ce2f024efd196']],
 ['beach',110,110,9368,4668,2700,44,23,['75ceb43b7396be5c7162537b40424ca0f4b0cb10','575502031a8f36f1837e2a579cef44c32094ea00','039815b168772e9aa0c955087b4cf63b5a6f6acb']]
];
if(process.argv.length!==3)throw Error('Provide temporary directory containing pinned legacy references.');
let total=0;
for(const [id,w,h,clear,buildable,tillable,occupied,warp,hashes] of rows){
 const raw=await Promise.all(['accessible','buildable','tillable'].map(async (layer,i)=>{
  const bytes=await readFile(join(process.argv[2],id+'_'+layer+'.json'));
  assert.equal(createHash('sha1').update('blob '+bytes.length+'\0').update(bytes).digest('hex'),hashes[i]);
  return JSON.parse(bytes.toString('utf8'));
 }));
 const r=importDataLayers(raw,w,h);assert.deepEqual(restrictionCounts(r),{clear,buildable,tillable,occupied,warp});total+=w*h;
 console.log(id+': '+w+'×'+h+'; three complete legacy layers; exact pinned aggregate counts match.');
}
assert.equal(total,44500);console.log('21 legacy reference exports; 44,500 grid positions × 3 = 133,500 layer coordinates checked. Not current-patch terrain approval.');
