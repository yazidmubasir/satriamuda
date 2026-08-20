/** Menu pertama: Agenda Belajar siswa — jalur simpan cepat melalui Gateway. */
const AGENDA_BELAJAR_HEADERS=['id','timestamp','email','nisn','nama','id_kelas','tanggal','namaGuru','mataPelajaran','materi','tujuanBelajar','kegiatan','refleksi'];

function agendaBelajarClass_(s){
  const kelas=String(s&&s.idKelas||'').trim();
  if(!kelas)throw new Error('Kelas pengguna belum terdaftar.');
  const key='SM_AB_CLASS_'+kelas.toUpperCase().replace(/[^A-Z0-9_-]/g,'_');
  const cache=CacheService.getScriptCache();
  try{const c=cache.get(key);if(c)return JSON.parse(c)}catch(e){}
  const k=getMasterKelas().find(x=>String(x.idKelas)===kelas);
  if(!k)throw new Error('Kelas tidak ditemukan.');
  const out={idKelas:String(k.idKelas),spreadsheetId:String(k.spreadsheetId)};
  try{cache.put(key,JSON.stringify(out),300)}catch(e){}
  return out;
}

function ensureAgendaBelajarReady_(spreadsheetId){
  const key='SM_AB_READY_'+spreadsheetId,cache=CacheService.getScriptCache();
  try{if(cache.get(key))return}catch(e){}
  gatewayEnsureSheet_(spreadsheetId,APP_CONFIG.SHEET.AGENDA_BELAJAR,AGENDA_BELAJAR_HEADERS);
  try{cache.put(key,'1',1800)}catch(e){}
}

function getAgendaBelajar(){
  const s=getSessionInfo();if(!s.idKelas)return[];
  const k=agendaBelajarClass_(s),result=gatewayReadClass_(k.spreadsheetId,APP_CONFIG.SHEET.AGENDA_BELAJAR),rows=result.data&&result.data.rows?result.data.rows:[];
  return rows.filter(r=>String(r[2]).toLowerCase()===String(s.email).toLowerCase()).map(r=>({id:r[0],timestamp:r[1],email:r[2],nisn:r[3],nama:r[4],idKelas:r[5],tanggal:r[6],namaGuru:r[7],mataPelajaran:r[8],materi:r[9],tujuanBelajar:r[10],kegiatan:r[11],refleksi:r[12]}));
}

/** Jalur cepat: cache kelas + append. Tidak melakukan READ sebelum simpan. */
function saveAgendaBelajar(data){
  const s=getSessionInfo();
  if(!['SISWA','ADMIN_KELAS'].includes(s.role))throw new Error('Akun tidak memiliki akses input Agenda Belajar.');
  const k=agendaBelajarClass_(s);
  ensureAgendaBelajarReady_(k.spreadsheetId);
  const d=data||{},id='AB-'+Date.now()+'-'+Math.floor(Math.random()*100000),row=[id,new Date(),s.email,s.nisn||'',s.name||'',k.idKelas,d.tanggal||'',d.namaGuru||'',d.mataPelajaran||'',d.materi||'',d.tujuanBelajar||'',d.kegiatan||'',d.refleksi||''];
  gatewayAppendClass_(k.spreadsheetId,APP_CONFIG.SHEET.AGENDA_BELAJAR,row);
  return{ok:true,id,message:'Agenda Belajar berhasil disimpan.'};
}

function deleteAgendaBelajar(id){
  const s=getSessionInfo();if(s.role!=='SISWA')throw new Error('Hanya siswa yang dapat menghapus agenda miliknya.');
  const k=agendaBelajarClass_(s),result=gatewayReadClass_(k.spreadsheetId,APP_CONFIG.SHEET.AGENDA_BELAJAR),rows=result.data&&result.data.rows?result.data.rows:[];
  const idx=rows.findIndex(r=>String(r[0])===String(id)&&String(r[2]).toLowerCase()===String(s.email).toLowerCase());
  if(idx<0)throw new Error('Data tidak ditemukan atau bukan milik Anda.');
  gatewayDeleteClass_(k.spreadsheetId,APP_CONFIG.SHEET.AGENDA_BELAJAR,idx+2);return{ok:true};
}
