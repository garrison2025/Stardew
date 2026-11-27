import test from 'node:test';import assert from 'node:assert/strict';
import {forecastCalendar,greenRainDay,trainClock,type CalendarInput} from '../src/lib/event-calendar.ts';
const base:CalendarInput={gameId:'123456789',year:1,season:'summer',day:1,legacy:false,greenhouse:false};
// Expected vectors produced independently using libxxhash XXH32 (five LE int32 words)
// and a separate Python implementation of the .NET subtractive RNG. Reference roll order:
// MouseyPounds/stardew-predictor blob f84c2b30a32a04c3485ddabfba2be57cb0cde596.
const cases=[
 {legacy:false,greenhouse:false,rain:[7,15],train:[[31,1100],[39,1500],[44,1210],[52,1720]],night:[[30,'Earthquake'],[37,'Meteor'],[54,'Fairy']],wind:[39,51,54]},
 {legacy:false,greenhouse:true,rain:[7,15],train:[[31,1100],[39,1500],[44,1210],[52,1720]],night:[[30,'Earthquake'],[37,'Witch']],wind:[39,51,54]},
 {legacy:true,greenhouse:false,rain:[14,7],train:[[32,1110],[34,1640]],night:[[30,'Earthquake'],[37,'Witch'],[38,'Stone Owl'],[42,'Meteor'],[43,'Fairy']],wind:[39,43]},
 {legacy:true,greenhouse:true,rain:[14,7],train:[[32,1110],[34,1640]],night:[[30,'Earthquake'],[37,'Fairy'],[38,'Meteor'],[42,'Witch']],wind:[39,43]}
];
for(const v of cases)test('calendar reference vectors legacy='+v.legacy+' greenhouse='+v.greenhouse,()=>{
 const rows=forecastCalendar({...base,legacy:v.legacy,greenhouse:v.greenhouse});
 assert.deepEqual([greenRainDay(base.gameId,1,v.legacy),greenRainDay(base.gameId,2,v.legacy)],v.rain);
 assert.deepEqual(rows.filter(r=>r.trainTime!==null).map(r=>[r.absoluteDay,r.trainTime]),v.train);
 assert.deepEqual(rows.filter(r=>r.overnight!==null).map(r=>[r.absoluteDay,r.overnight]),v.night);
 assert.deepEqual(rows.filter(r=>r.windstormRoll).map(r=>r.absoluteDay),v.wind);
 assert.equal(rows.filter(r=>r.greenRain).length,1);assert.equal(rows.length,28);
});
test('cross-season and cross-year date labels, train times and input validation',()=>{
 const rows=forecastCalendar({...base,season:'winter',day:28});
 assert.deepEqual([rows[0].year,rows[0].season,rows[0].day],[1,'winter',28]);
 assert.deepEqual([rows[1].year,rows[1].season,rows[1].day],[2,'spring',1]);
 assert.equal(trainClock(900),'09:00');assert.equal(trainClock(1520),'15:20');
 for(const row of rows)if(row.trainTime!==null){assert.ok(row.trainTime>=900&&row.trainTime<1800);assert.ok(row.trainTime%100<60)}
 for(const bad of [{gameId:'9007199254740992'},{gameId:'0'},{year:0},{day:29},{season:'invalid'}])assert.throws(()=>forecastCalendar({...base,...bad} as CalendarInput));
});
