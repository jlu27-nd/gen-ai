// All course descriptions, syllabi, policies and mappings below are invented.
export const version = 'UND-2026.1';
export const sources = [
  {id:'ISU-CS', title:'Iowa State: Computer Science catalog', url:'https://catalog.iastate.edu/collegeofliberalartsandsciences/computerscience/index.html', use:'Inspiration for a 120 semester-credit degree, general education, major sequences and upper-level requirements.'},
  {id:'OSU-BA', title:'Oregon State: Business Administration', url:'https://catalog.oregonstate.edu/college-departments/business/business-administration-ba-bs-hba-hbs/', use:'Inspiration for business core, major study and experiential learning. OSU uses quarter credits; this synthetic catalog uses semester credits, not copied credit values.'},
  {id:'ISU-MIL', title:'Iowa State: Military and Veteran Students', url:'https://www.iastate.edu/admission-and-aid/admissions/military-and-nontraditonal-students/military-and-veteran-students', use:'Inspiration for human evaluation of JST/CCAF and ACE evidence. Does not establish an equivalency here.'},
  {id:'OSU-MIL', title:'Oregon State: Admission', url:'https://catalog.oregonstate.edu/admission/', use:'Comparison of military transfer and institution-specific limits. Its quarter-credit limits are not adopted here.'},
  {id:'JST', title:'JST frequently asked questions', url:'https://jst.doded.mil/jst/faq', use:'Context for military training records and credit recommendations; no live ACE lookup is performed.'}
].map(s=>({...s, accessed:'2026-10-13'}));
const rows = [
 ['ENG101','College Writing','writing|argument|research','Draft an evidence-based argument|Evaluate and cite sources'],
 ['COM101','Public Speaking','speaking|presentation|audience','Organize an oral presentation|Adapt delivery to an audience'],
 ['MAT120','College Algebra','algebra|functions|equations','Solve linear and quadratic equations|Model quantitative relationships'],
 ['MAT150','Applied Statistics','statistics|probability|data','Interpret descriptive statistics|Evaluate uncertainty in sample data'],
 ['HIS110','United States History','history|government|sources','Interpret primary historical sources|Explain institutional change'],
 ['PHI120','Ethics and Society','ethics|reasoning|responsibility','Compare ethical frameworks|Defend a reasoned position'],
 ['PSY101','Introduction to Psychology','psychology|behavior|research','Explain learning and cognition|Interpret behavioral research'],
 ['SOC101','Society and Institutions','society|institutions|culture','Analyze social institutions|Compare cultural perspectives'],
 ['BIO101','Principles of Biology','biology|cells|ecology','Explain cellular processes|Analyze ecological systems'],
 ['ENV110','Environmental Science','environment|ecology|sustainability','Assess environmental evidence|Explain sustainability tradeoffs'],
 ['ART100','Arts and Interpretation','art|visual|culture','Interpret visual works|Relate art to cultural context'],
 ['ENG210','Technical Communication','documentation|writing|technical','Write a technical report|Design usable instructions'],
 ['CS101','Computing Foundations','computing|hardware|software','Explain computer architecture|Distinguish system and application software'],
 ['CS110','Programming I','programming|variables|loops','Write programs with control flow|Test and debug simple programs'],
 ['CS210','Data Structures','algorithms|structures|complexity','Implement common data structures|Analyze algorithm complexity'],
 ['CS220','Computer Networks','networking|tcp|routing','Explain TCP/IP layers|Configure and troubleshoot a small network'],
 ['CS230','Database Systems','database|sql|relational','Design a relational schema|Write and validate SQL queries'],
 ['CS310','Cybersecurity Fundamentals','security|threats|access','Analyze common threats|Apply access controls and defense principles'],
 ['CS320','Software Engineering','software|testing|requirements','Translate requirements into a design|Evaluate software with systematic tests'],
 ['CS410','Computing Capstone','computing|project|evaluation','Deliver a scoped computing project|Evaluate design decisions'],
 ['BUS101','Introduction to Business','business|organizations|markets','Compare organizational forms|Explain business functions'],
 ['ACC201','Financial Accounting','accounting|statements|transactions','Record financial transactions|Interpret financial statements'],
 ['ECO201','Microeconomics','economics|markets|supply','Model supply and demand|Explain market incentives'],
 ['MGT210','Organizational Leadership','leadership|teams|communication','Apply team leadership methods|Plan and communicate a team objective'],
 ['MGT310','Project Management','project|schedule|risk','Build a project schedule|Assess project risk and resources'],
 ['MKT210','Principles of Marketing','marketing|customers|segmentation','Define a customer segment|Develop a marketing mix'],
 ['FIN310','Business Finance','finance|valuation|budget','Evaluate financial alternatives|Prepare a capital budget'],
 ['BUS410','Business Strategy Capstone','strategy|business|analysis','Analyze a business strategy|Defend an integrated business plan'],
 ['LOG210','Supply Chain Foundations','logistics|inventory|supply','Plan an inventory cycle|Explain supply chain relationships'],
 ['LOG310','Transportation Systems','transportation|distribution|routing','Compare distribution modes|Analyze a transport plan'],
 ['LOG320','Operations Planning','operations|quality|capacity','Plan operational capacity|Evaluate quality metrics'],
 ['LOG410','Supply Chain Capstone','logistics|project|analysis','Design a supply chain improvement|Evaluate cost and service tradeoffs'],
 ['HSC101','Health Systems','health|systems|care','Describe health delivery systems|Explain care coordination'],
 ['HSC210','Medical Terminology','medical|terminology|anatomy','Interpret common medical terms|Use anatomical terminology'],
 ['HSC220','Emergency Care Principles','emergency|triage|assessment','Explain initial assessment|Prioritize simulated emergency scenarios'],
 ['HSC310','Public Health','health|prevention|population','Interpret population health indicators|Design a prevention intervention'],
 ['HSC320','Health Program Evaluation','health|evaluation|research','Develop evaluation criteria|Interpret program evidence'],
 ['HSC410','Health Sciences Capstone','health|project|analysis','Plan a health systems project|Defend evidence-based recommendations'],
 ['MGT320','Organizational Behavior','behavior|teams|organizations','Analyze group dynamics|Evaluate organizational change'],
 ['RES300','Applied Research Methods','research|methods|evidence','Design a research question|Evaluate evidence quality']
];
export const courses = rows.map(([id,title,tags,outcomes])=>({
 id,title,credits:3,level:Number(id.match(/\d/)[0])>=3?'upper':'lower',
 tags:tags.split('|'),outcomes:outcomes.split('|'),
 syllabus:{id:`SYL-${id}`,version,description:`Synthetic syllabus: ${title}. Students practice ${tags.replaceAll('|',', ')} in guided exercises and an applied assignment.`,assessment:'Applied assignment 40%; scenario analysis 30%; final assessment 30%.',contactHours:45},
 prerequisites:({CS210:['CS110'],CS310:['CS220'],CS320:['CS210'],FIN310:['ACC201'],LOG310:['LOG210'],HSC310:['HSC101']})[id]||[]
}));
const general=['ENG101','COM101','MAT120','MAT150','HIS110','PHI120','PSY101','SOC101','BIO101','ENV110','ART100','ENG210'];
export const programs = [
 ['BS-CS','BS Computer Science',['CS101','CS110','CS210','CS220','CS230','CS310','CS320','CS410']],
 ['BS-BA','BS Business Administration',['BUS101','ACC201','ECO201','MGT210','MGT310','MKT210','FIN310','BUS410']],
 ['BS-LOG','BS Supply Chain Management',['BUS101','ACC201','ECO201','LOG210','LOG310','LOG320','MGT310','LOG410']],
 ['BS-HSC','BS Health Sciences',['HSC101','HSC210','HSC220','HSC310','HSC320','RES300','MGT320','HSC410']]
].map(([id,title,major])=>({id,title,totalCredits:120,general,major,buckets:{generalEducation:36,majorCore:24,approvedMajorElectives:24,freeElectives:36},upperDivisionMinimum:36,residencyMinimum:30,note:'Partial synthetic course catalog; elective selections and residency require an advisor. No graduation audit is performed.'}));
export const policy = {id:'POL-001',version,title:'Synthetic military learning review policy',militaryCreditCap:30,
 rules:['Recommendations never award credit. Registrar action in an institutional system is outside this prototype.','Only completed, verified learning with sufficient semester-credit evidence is eligible.','An approved synthetic pathway requires an exact source identifier, eligible completion date, level and sufficient credits.','Without a pathway, topic matching is a discovery aid only; faculty must request and assess learning outcomes.','No duplicate target-course credit; the selected program determines general education, major or elective applicability.','Faculty reviews equivalence, an academic director reviews program fit, and a registrar prepares the advisory packet.','Maximum 30 military semester credits in this fictional policy; residency, existing credit and upper-division totals require separate institutional checks.']};
export const pathways = [
 ['PATH-001','SYN-JST-NET-101','CS220'],['PATH-002','SYN-JST-LEAD-201','MGT210'],['PATH-003','SYN-CCAF-LOG-101','LOG210'],['PATH-004','SYN-CCAF-COMP-101','CS101']
].map(([id,sourceId,target])=>({id,sourceId,target,minCredits:3,level:'lower',validFrom:'2024-01-01',validTo:'2027-12-31',approvedBy:'Fictional curriculum committee',version,synthetic:true}));
