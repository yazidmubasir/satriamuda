/** SATRIA MUDA V1.4.3 — canonical module resolution; ALL/SEMUA KELAS + fast cache. */
function normalizeLearningTargetAll_(v){
  const s=String(v==null?'':v).trim().toUpperCase().replace(/[\u2013\u2014]/g,'-').replace(/\s+/g,' ');
  const compact=s.replace(/[\s_\-\/]/g,'');
  return !s || compact==='ALL' || compact==='SEMUA' || compact==='ALLKELAS' || compact==='SEMUA KELAS'.replace(/\s/g,'') || compact==='SEMUAALLKELAS' || s==='*';
}
function learningTargetMatch_(target,idKelas){
  if(normalizeLearningTargetAll_(target)) return true;
  const a=String(target==null?'':target).trim().toUpperCase(),b=String(idKelas==null?'':idKelas).trim().toUpperCase();
  return !!a&&!!b&&a===b;
}
function learningStatusActive_(v){const s=String(v==null?'ACTIVE':v).trim().toUpperCase();return !s||['ACTIVE','AKTIF','TRUE','YA','YES','1','ON'].includes(s)}
function moduleTargetAllowed_(m,idKelas){return !!m&&learningStatusActive_(m.status)&&learningTargetMatch_(m.targetKelas,idKelas)}
function getLearningModulesRaw_(){
  const id=PropertiesService.getScriptProperties().getProperty(APP_CONFIG.PROP.MASTER_SIM_ID);if(!id)return[];
  const key='SM_LM_RAW_'+id;try{const c=CacheService.getScriptCache().get(key);if(c)return JSON.parse(c)}catch(e){}
  const r=gatewayReadClass_(id,APP_CONFIG.SHEET.MASTER_MODUL),rows=r&&r.data&&Array.isArray(r.data.rows)?r.data.rows:[];
  const out=rows.filter(x=>x&&x[0]).map(x=>({idModul:String(x[0]).trim(),jenis:String(x[1]||'').trim().toUpperCase(),namaModul:String(x[2]||x[0]).trim(),deskripsi:String(x[3]||''),targetKelas:normalizeLearningTargetValue_(x[4]),status:String(x[5]||'ACTIVE').trim().toUpperCase(),pembuatEmail:String(x[6]||''),pembuatNama:String(x[7]||'')}));
  try{CacheService.getScriptCache().put(key,JSON.stringify(out),20)}catch(e){}return out;
}
function findLearningModuleForStudent_(idModul,jenis,idKelas){
  let all=[];try{all=getLearningModulesRaw_()}catch(e){all=getMasterModul_(true)||[]}
  const requested=String(idModul||'').trim().toUpperCase();
  let m=all.find(x=>String(x.idModul||'').trim().toUpperCase()===requested&&moduleTargetAllowed_(x,idKelas));if(m)return m;
  const type=String(jenis||'').trim().toUpperCase();
  if(requested==='LITERASI'||requested==='NUMERASI')m=all.find(x=>String(x.jenis||'').trim().toUpperCase()===requested&&moduleTargetAllowed_(x,idKelas));
  if(!m&&type)m=all.find(x=>String(x.jenis||'').trim().toUpperCase()===type&&moduleTargetAllowed_(x,idKelas));
  return m||null;
}
function getActiveLearningModulesForStudentFixed(){const s=getSessionInfo(),k=findKelasForSession_(s);if(!k)throw new Error('Kelas siswa belum terdaftar.');let all=[];try{all=getLearningModulesRaw_()}catch(e){all=getMasterModul_(false)||[]}return all.filter(m=>moduleTargetAllowed_(m,k.idKelas))}
function startLearningChallengeFixed(idModul,level,count,jenis){
  const s=getSessionInfo(),k=findKelasForSession_(s);if(s.role!=='SISWA')throw new Error('Hanya siswa yang dapat mengerjakan latihan.');if(!k)throw new Error('Kelas siswa belum terdaftar.');level=Number(level);if(!LM_LEVELS.includes(level))throw new Error('Level tidak valid.');
  const module=findLearningModuleForStudent_(idModul,jenis,k.idKelas);if(!module)throw new Error('Modul tidak aktif atau tidak ditujukan untuk kelas Anda.');
  const bank=readMasterLearningSheet_(APP_CONFIG.SHEET.BANK_SOAL),rows=bank.data&&bank.data.rows?bank.data.rows:[];let qs=rows.filter(q=>String(q[19]||'').trim().toUpperCase()==='ACTIVE'&&String(q[1]||'').trim()===String(module.idModul).trim()&&Number(q[3])===level&&learningTargetMatch_(q[4],k.idKelas));qs=shuffle_(qs).slice(0,Math.min(Math.max(Number(count)||5,1),10));if(!qs.length)throw new Error('Belum ada soal aktif untuk tantangan ini.');
  return{ok:true,idModul:module.idModul,namaModul:module.namaModul,jenis:module.jenis,level,questions:qs.map(q=>({idSoal:q[0],materi:q[5],stimulus:q[7],pertanyaan:q[8],tipeSoal:q[9],opsiA:q[10],opsiB:q[11],opsiC:q[12],opsiD:q[13],opsiE:q[14]}))};
}
function getLearningDashboardFixed(){const s=getSessionInfo();if(s.role!=='SISWA')return{ok:true,role:s.role};const k=findKelasForSession_(s);if(!k)throw new Error('Kelas siswa belum terdaftar.');const modules=getActiveLearningModulesForStudentFixed(),bank=readMasterLearningSheet_(APP_CONFIG.SHEET.BANK_SOAL),rows=bank.data&&bank.data.rows?bank.data.rows:[],active=rows.filter(q=>learningStatusActive_(q[19])&&learningTargetMatch_(q[4],k.idKelas)),trx=ensureLearningProgressSheet_(k.spreadsheetId),tr=trx.data&&trx.data.rows?trx.data.rows:[],own=tr.filter(x=>String(x[2]).toLowerCase()===String(s.email).toLowerCase()),correct=own.filter(x=>truth_(x[11])).length,xp=own.reduce((a,x)=>a+Number(x[13]||0),0),byType={LITERASI:{correct:0,total:0},NUMERASI:{correct:0,total:0}};own.forEach(x=>{const t=String(x[8]).toUpperCase();if(byType[t]){byType[t].total++;if(truth_(x[11]))byType[t].correct++}});return{ok:true,role:s.role,xp,correct,total:own.length,streak:calcStreak_(own),badge:badgeFor_(correct),modules,byType,available:modules.map(m=>({idModul:m.idModul,namaModul:m.namaModul,jenis:m.jenis,targetKelas:m.targetKelas,levels:LM_LEVELS.map(l=>({level:l,soal:active.filter(q=>String(q[1]).trim()===String(m.idModul).trim()&&Number(q[3])===l).length,unlocked:l===1||correct>=((l-1)*5)}))}))}}
