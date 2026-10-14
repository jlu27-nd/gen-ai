import {courses,programs,pathways,policy,version} from '../data/catalog.js';
export function validateRecord(r) {
 const errors=[];
 if(!r.title?.trim()) errors.push('Missing course title');
 if(!Number.isFinite(r.credits)||r.credits<=0||r.credits>30) errors.push('Missing or invalid semester credits');
 if(!['lower','upper'].includes(r.level)) errors.push('Unknown academic level');
 if(r.status!=='completed') errors.push('Completion not confirmed');
 if(!/^\d{4}-\d{2}-\d{2}$/.test(r.date||'') || Number.isNaN(Date.parse(r.date)) || new Date(r.date).toISOString().slice(0,10)!==r.date) errors.push('Missing or invalid completion date');
 if(r.date && r.date>new Date().toISOString().slice(0,10)) errors.push('Completion date is in the future');
 if(!r.verified) errors.push('Extracted fields need human verification');
 return errors;
}
export function recommend(records, programId) {
 const program=programs.find(p=>p.id===programId);
 if(!program) throw new Error('Choose a valid program.');
 const used=new Set(); let total=0;
 return records.map((r,index)=>{
  const errors=validateRecord(r);
  const pathway=pathways.find(p=>p.sourceId===r.sourceId && r.date>=p.validFrom && r.date<=p.validTo && r.level===p.level && r.credits>=p.minCredits);
  const words=new Set(`${r.title} ${r.outcomes||''}`.toLowerCase().match(/[a-z]+/g)||[]);
  const candidates=courses.map(c=>({course:c,hits:c.tags.filter(t=>words.has(t))})).filter(c=>c.hits.length).sort((a,b)=>b.hits.length/b.course.tags.length-a.hits.length/a.course.tags.length||a.course.id.localeCompare(b.course.id));
  const candidate=pathway?{course:courses.find(c=>c.id===pathway.target),hits:[]}:candidates[0];
  const course=candidate?.course;
  const match=course?candidate.hits.length/course.tags.length:0;
  let confidence=pathway?95:Math.round(match*55);
  let kind=pathway?'pathway':'faculty-assessment';
  if(!course) {errors.push('No supported course candidate. Request a syllabus or ACE evidence.');kind='insufficient-evidence';}
  if(!pathway && course) errors.push('No approved pathway. Topic overlap does not establish outcome equivalence.');
  if(course && r.credits<course.credits) errors.push('Insufficient source credits for this course');
  if(course && r.level!==course.level) errors.push('Academic level differs from the candidate course');
  if(course && used.has(course.id)) errors.push('Duplicate target course: no additional credits proposed');
  if(course && total+course.credits>policy.militaryCreditCap) errors.push('Synthetic military-credit cap exceeded');
  if(errors.length) confidence=Math.min(confidence,40);
  const credits=errors.length?0:course.credits;
  if(credits) {used.add(course.id);total+=credits;}
  return {id:`R${index+1}`,record:{...r},course:course||null,pathway:pathway||null,kind,confidence,credits,
   applicability:course?(program.major.includes(course.id)?'Major core':program.general.includes(course.id)?'General education':'Elective candidate — advisor confirmation needed'):'Unassigned',
   rationale:pathway?`Exact identifier matches ${pathway.id}; completion date, lower/upper level and source credits meet its synthetic conditions.`:course?`Shared topic terms: ${candidate.hits.join(', ')}. This is a search lead, not evidence of equivalent learning.`:'The catalog has no supported match for these learning details.',
   gaps:errors,evidence:[{id:r.evidence?.location||'manually-entered',type:'Transcript extraction',detail:`${r.sourceId||'Unidentified course'}; ${r.title}; ${r.credits??'?'} credits; ${r.date||'date unknown'}. Verify against the original.`},...(course?[{id:course.syllabus.id,type:'Synthetic syllabus',detail:course.outcomes.join('; ')}]:[]),...(pathway?[{id:pathway.id,type:'Synthetic approved pathway',detail:`${pathway.sourceId} → ${pathway.target}; ${pathway.validFrom} through ${pathway.validTo}`}]:[]),{id:policy.id,type:'Synthetic policy',detail:policy.rules.join(' ')}],
   state:'pending-faculty',history:[]};
 });
}
export function review(item,{role,action,note}) {
 if(!note?.trim()) throw new Error('Add a review rationale before saving.');
 const expected={'pending-faculty':'Faculty','pending-director':'Academic director','pending-registrar':'Registrar'}[item.state];
 if(!expected || role!==expected) throw new Error(`This item requires ${expected||'a new analysis'} before another decision.`);
 if(!['advance','reject','request-evidence'].includes(action)) throw new Error('Invalid review action.');
 if(action==='advance' && item.gaps.length) throw new Error('Resolve evidence gaps in the input and analyze again before advancing.');
 const next=action==='reject'?'not-recommended':action==='request-evidence'?'needs-evidence':({'pending-faculty':'pending-director','pending-director':'pending-registrar','pending-registrar':'review-complete'})[item.state];
 return {...item,state:next,credits:action==='advance'?item.credits:0,history:[...item.history,{role,action,note:note.trim(),from:item.state,to:next,at:new Date().toISOString()}]};
}
export function packet(items,programId) {
 if(!items.length) throw new Error('Analyze a transcript before exporting.');
 return {schemaVersion:1,catalogVersion:version,generatedAt:new Date().toISOString(),institution:'University of Notion Dame — fictional',programId,
  notice:'ADVISORY ONLY. No credit awarded. Simulated AI and unauthenticated demonstration reviewers. Validate original records and current institutional policy.',
  proposedSemesterCredits:items.reduce((n,r)=>n+r.credits,0),reviewComplete:items.every(i=>['review-complete','not-recommended','needs-evidence'].includes(i.state)),recommendations:items};
}
export function csvExport(items) {
 const cell=v=>{let s=String(v??'');if(/^[=+\-@\t\r]/.test(s.trimStart())) s="'"+s;return '"'+s.replaceAll('"','""')+'"';};
 const rows=[['Recommendation','Source course','Target course','Proposed semester credits','Confidence heuristic (not probability)','Status','Rationale','Evidence IDs','Review notes','Notice'],...items.map(i=>[i.id,i.record.title,i.course?.id,i.credits,i.confidence,i.state,i.rationale,i.evidence.map(e=>e.id).join('; '),i.history.map(h=>`${h.role}: ${h.note}`).join('; '),'ADVISORY ONLY; no credit awarded; synthetic policy'])];
 return rows.map(r=>r.map(cell).join(',')).join('\r\n');
}
