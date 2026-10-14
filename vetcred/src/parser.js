const MAX_TEXT=300000;
export function parseTranscript(text) {
 if(typeof text!=='string'||!text.trim()) throw new Error('Add a JST or CCAF document or load a synthetic example.');
 if(text.length>MAX_TEXT) throw new Error('Text exceeds the 300,000 character limit. Use a shorter extract.');
 const type=/\bCCAF\b|community college of the air force/i.test(text)?'CCAF':/\bJST\b|joint services transcript/i.test(text)?'JST':null;
 if(!type) throw new Error('Document type not recognized. Use JST or CCAF text with its document heading.');
 const lines=text.replaceAll('\r','').split('\n');
 const starts=lines.map((s,i)=>/^\s*(?:Course ID|ACE (?:Identifier|ID)|Military Course ID)\s*:/i.test(s)?i:-1).filter(i=>i>=0);
 const records=starts.map((start,n)=>{
  const block=lines.slice(start,starts[n+1]??lines.length);
  const get=pattern=>block.map(l=>l.match(pattern)?.[1]?.trim()).find(Boolean)||'';
  const creditText=get(/^(?:Semester Credits|Credit Hours|Credits)\s*:\s*(.+)$/i);
  const level=get(/^(?:Level|Academic Level)\s*:\s*(.+)$/i).toLowerCase();
  const status=get(/^Status\s*:\s*(.+)$/i).toLowerCase();
  return {sourceId:get(/^(?:Course ID|ACE (?:Identifier|ID)|Military Course ID)\s*:\s*(.+)$/i),title:get(/^(?:Course Title|Title|Course Name)\s*:\s*(.+)$/i),
   credits:/^\d+(?:\.\d+)?(?:\s*(?:semester|hours|credits|SH))*$/i.test(creditText)?Number.parseFloat(creditText):null,
   date:get(/^(?:Completion Date|Completed)\s*:\s*(.+)$/i),level:/^(?:lower|lower.division|lower.division baccalaureate|l)$/i.test(level)?'lower':/^(?:upper|upper.division|upper.division baccalaureate|u)$/i.test(level)?'upper':'unknown',
   status:/^(?:completed|passed)$/i.test(status)?'completed':'unknown',outcomes:get(/^(?:Learning Outcomes|Description|Topics)\s*:\s*(.+)$/i),verified:false,
   evidence:{location:`${type}:lines-${start+1}-${start+block.length}`,type}};
 });
 // Conservative CCAF table support: ID | title | ISO date | semester credits | grade.
 if(!records.length && type==='CCAF') lines.forEach((line,index)=>{
  const m=line.match(/^\s*([A-Z][A-Z0-9-]*\s?\d[A-Z0-9-]*)\s*\|\s*([^|]+)\|\s*(\d{4}-\d{2}-\d{2})\s*\|\s*(\d+(?:\.\d+)?)\s*\|\s*([A-FPSUW][+-]?)\s*$/i);
  if(m) records.push({sourceId:m[1].trim(),title:m[2].trim(),date:m[3],credits:Number(m[4]),level:'unknown',status:/^[ABCPS]/i.test(m[5])?'completed':'unknown',outcomes:'',verified:false,evidence:{location:`CCAF:line-${index+1}`,type}});
 });
 if(!records.length) throw new Error('No course rows could be extracted safely. Use the labeled sample format or paste a CCAF pipe-separated course table. Scanned PDFs require OCR outside this prototype.');
 if(records.length>100) throw new Error('Limit exceeded: use at most 100 course records.');
 return {type,records,warnings:['Review every extracted field against the original. Unsupported sections may have been omitted. No personal identifiers are needed.']};
}
export async function readDocument(file) {
 if(!file) throw new Error('Choose a PDF or text file.');
 if(file.size>10*1024*1024) throw new Error('File exceeds the 10 MB limit.');
 const ext=file.name.split('.').pop().toLowerCase();
 if(ext==='txt') return file.text();
 if(ext!=='pdf') throw new Error('Unsupported file. Choose a text-based PDF or UTF-8 TXT file.');
 const pdfjs=await import('pdfjs-dist');
 const worker=await import('pdfjs-dist/build/pdf.worker.min.mjs?url');
 pdfjs.GlobalWorkerOptions.workerSrc=worker.default;
 let task;
 try {
  task=pdfjs.getDocument({data:new Uint8Array(await file.arrayBuffer()),isEvalSupported:false});
  const doc=await task.promise;
  if(doc.numPages>50) throw new Error('PDF exceeds the 50-page limit.');
  let text='';
  for(let p=1;p<=doc.numPages;p++) {
   const page=await doc.getPage(p), content=await page.getTextContent();
   let y=null;
   for(const item of content.items) {
    if(!('str' in item)) continue;
    if(y!==null && Math.abs(item.transform[5]-y)>3) text+='\n';
    text+=item.str+(item.hasEOL?'\n':' ');y=item.transform[5];
   }
   text+='\n';
   if(text.length>MAX_TEXT) throw new Error('Extracted PDF text exceeds the size limit.');
  }
  if(!text.trim()) throw new Error('No selectable text found. Scanned PDFs require OCR outside this prototype.');
  return text;
 } catch(error) {
  if(error.name==='PasswordException') throw new Error('Password-protected PDFs are unsupported. Use an unlocked synthetic extract.');
  throw new Error(`PDF could not be read: ${error.message}`);
 } finally {await task?.destroy();}
}
