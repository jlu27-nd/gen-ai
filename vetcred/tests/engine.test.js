import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {parseTranscript,readDocument} from '../src/parser.js';
import {recommend,review,packet,csvExport,validateRecord} from '../src/engine.js';
import {courses,programs,pathways} from '../data/catalog.js';
const sample=async name=>parseTranscript(await readFile(new URL(`../public/samples/${name}.txt`,import.meta.url),'utf8')).records;
const verify=records=>records.map(r=>({...r,verified:true}));
test('typical JST: two traceable recommendations; three review gates; export',async()=>{
 let items=recommend(verify(await sample('jst')),'BS-CS');
 assert.equal(items.reduce((n,r)=>n+r.credits,0),6);
 assert.equal(items[0].course.id,'CS220');assert.equal(items[0].confidence,95);
 assert.equal(items[0].applicability,'Major core');
 assert(items[0].evidence.some(e=>e.id==='PATH-001'));
 for(const role of ['Faculty','Academic director','Registrar'])items[0]=review(items[0],{role,action:'advance',note:'Verified synthetic evidence.'});
 assert.equal(items[0].state,'review-complete');assert.equal(items[0].history.length,3);
 assert.equal(packet(items,'BS-CS').reviewComplete,false);
 assert.match(JSON.stringify(packet(items,'BS-CS')),/No credit awarded/);
});
test('CCAF sample maps to supply chain and computing courses',async()=>{
 const items=recommend(verify(await sample('ccaf')),'BS-LOG');
 assert.deepEqual(items.map(i=>i.course.id),['LOG210','CS101']);assert.equal(items[0].applicability,'Major core');
});
test('challenge: ambiguous and incomplete learning proposes zero credits',async()=>{
 const items=recommend(verify(await sample('challenge')),'BS-LOG');
 assert(items.every(i=>i.credits===0&&i.confidence<=40));
 assert.throws(()=>review(items[0],{role:'Faculty',action:'advance',note:'test'}),/Resolve evidence gaps/);
 assert.equal(review(items[0],{role:'Faculty',action:'request-evidence',note:'Need verified outcomes.'}).state,'needs-evidence');
});
test('empty, unsupported and malformed inputs fail clearly',()=>{
 for(const text of ['', 'random notes','JST\nNo courses'])assert.throws(()=>parseTranscript(text));
 assert.throws(()=>parseTranscript('JST'+ 'x'.repeat(300001)),/limit/);
});
test('no recommendation eligibility without human verification',async()=>{
 const items=recommend(await sample('jst'),'BS-CS');assert(items.every(i=>i.credits===0));
});
test('duplicate target and duplicate source never add double credit',async()=>{
 const [r]=verify(await sample('jst'));const items=recommend([r,{...r}],'BS-CS');assert.deepEqual(items.map(i=>i.credits),[3,0]);assert.match(items[1].gaps.join(),/Duplicate/);
});
test('date, level, credits and completion constraints cannot be bypassed',async()=>{
 const [r]=verify(await sample('jst'));
 for(const patch of [{date:'2023-01-01'},{date:'2025-02-31'},{date:'2099-01-01'},{credits:2},{credits:null},{credits:NaN},{level:'upper'},{status:'unknown'}])assert.equal(recommend([{...r,...patch}],'BS-CS')[0].credits,0,JSON.stringify(patch));
});
test('roles and notes gate review; terminal decisions cannot be advanced',async()=>{
 const [i]=recommend(verify(await sample('jst')),'BS-CS');
 assert.throws(()=>review(i,{role:'Registrar',action:'advance',note:'test'}),/Faculty/);
 assert.throws(()=>review(i,{role:'Faculty',action:'advance',note:' '}),/rationale/);
 const rejected=review(i,{role:'Faculty',action:'reject',note:'Not equivalent'});
 assert.throws(()=>review(rejected,{role:'Faculty',action:'advance',note:'test'}));
 assert.equal(i.history.length,0);
});
test('CSV escapes formulas, quotes and newlines',async()=>{
 const [i]=recommend(verify(await sample('jst')),'BS-CS');i.record.title='=SUM(1,2)';i.rationale='A "quote"\nand a line';const csv=csvExport([i]);assert(csv.includes("\"'=SUM(1,2)\""));assert(csv.includes('"A ""quote""\nand a line"'));
});
test('CCAF table requires academic-level verification and rejects failed grades',()=>{
 const {records}=parseTranscript('CCAF\nNET101 | Network Systems | 2025-01-01 | 3 | F');
 assert.equal(records.length,1);assert.equal(records[0].status,'unknown');assert(validateRecord(records[0]).length>=2);
});
test('file size and type limits are enforced before reading',async()=>{
 await assert.rejects(()=>readDocument({name:'a.txt',size:11*1024*1024}),/10 MB/);
 await assert.rejects(()=>readDocument({name:'a.docx',size:10}),/Unsupported/);
});
test('unknown learning abstains, and invalid program cannot produce results',()=>{
 const r={sourceId:'unknown',title:'Unrelated Learning',credits:3,level:'lower',date:'2025-01-01',status:'completed',verified:true};
 assert.equal(recommend([r],'BS-CS')[0].course,null);
 assert.throws(()=>recommend([r],'bad'),/valid program/);
 assert.throws(()=>packet([],'BS-CS'),/Analyze/);
});
test('catalog is internally consistent and synthetic',()=>{
 assert.equal(courses.length,40);assert.equal(new Set(courses.map(c=>c.id)).size,40);
 for(const p of programs){assert.equal(Object.values(p.buckets).reduce((a,b)=>a+b,0),120);for(const id of [...p.major,...p.general])assert(courses.some(c=>c.id===id));}
 for(const p of pathways){assert(p.synthetic);assert(courses.some(c=>c.id===p.target));}
});
