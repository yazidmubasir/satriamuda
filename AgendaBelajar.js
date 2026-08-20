/** Menu pertama: Agenda Belajar siswa — jalur simpan langsung, Gateway hanya fallback permission. */
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
  try{cache.put(key,JSON.stringify(out),600)}catch(e){}
  return out;
}

/**
 * Jalur utama: tulis langsung menggunakan SpreadsheetApp.
 * Gateway hanya dipakai bila akun yang menjalankan Web App tidak memiliki
 * izin edit spreadsheet tujuan (mis. user Viewer).
 * Tidak ada ENSURE/READ sebelum penyimpanan.
 */
function appendAgendaBelajarFast_(spreadsheetId,row){
  try{
    const ss=SpreadsheetApp.openById(spreadsheetId);
    const sh=ss.getSheetByName(APP_CONFIG.SHEET.AGENDA_BELAJAR);
    if(!sh)throw new Error('Sheet '+APP_CONFIG.SHEET.AGENDA_BELAJAR+' belum tersedia pada spreadsheet kelas.');
    sh.appendRow(row);
    return{mode:'DIRECT'};
  }catch(e){
    const msg=String(e&&e.message||e||'');
    const permission=/permission|access|izin|authorize|not have permission|cannot access|forbidden/i.test(msg);
    if(!permission)throw e;
    gatewayAppendClass_(spreadsheetId,APP_CONFIG.SHEET.AGENDA_BELAJAR,row);
    return{mode:'GATEWAY'};
  }
}

function getAgendaBelajar(){
  const s=getSessionInfo();if(!s.idKelas)return[];
  const k=agendaBelajarClass_(s),result=gatewayReadClass_(k.spreadsheetId,APP_CONFIG.SHEET.AGENDA_BELAJAR),rows=result.data&&result.data.rows?result.data.rows:[];
  return rows.filter(r=>String(r[2]).toLowerCase()===String(s.email).toLowerCase()).map(r=>({id:r[0],timestamp:r[1],email:r[2],nisn:r[3],nama:r[4],idKelas:r[5],tanggal:r[6],namaGuru:r[7],mataPelajaran:r[8],materi:r[9],tujuanBelajar:r[10],kegiatan:r[11],refleksi:r[12]}));
}

/** Umumnya hanya uma panggilan SpreadsheetApp. Gateway hanya fallback permission. */
function saveAgendaBelajar(data){
  const s=getSessionInfo();
  if(!['SISWA','ADMIN_KELAS'].includes(s.role))throw new Error('Akun tidak memiliki akses input Agenda Belajar.');
  const k=agendaBelajarClass_(s),d=data||{};
  const id='AB-'+Date.now()+'-'+Math.floor(Math.random()*100000);
  const row=[id,new Date(),s.email,s.nisn||'',s.name||'',k.idKelas,d.tanggal||'',d.namaGuru||'',d.mataPelajaran||'',d.materi||'',d.tujuanBelajar||'',d.kegiatan||'',d.refleksi||''];
  const result=appendAgendaBelajarFast_(k.spreadsheetId,row);
  return{ok:true,id,mode:result.mode,message:'Agenda Belajar berhasil disimpan.'};
}

function deleteAgendaBelajar(id){
  const s=getSessionInfo();if(s.role!=='SISWA')throw new Error('Hanya siswa yang dapat menghapus agenda miliknya.');
  const k=agendaBelajarClass_(s),result=gatewayReadClass_(k.spreadsheetId,APP_CONFIG.SHEET.AGENDA_BELAJAR),rows=result.data&&result.data.rows?result.data.rows:[];
  const idx=rows.findIndex(r=>String(r[0])===String(id)&&String(r[2]).toLowerCase()===String(s.email).toLowerCase());
  if(idx<0)throw new Error('Data tidak ditemukan atau bukan milik Anda.');
  gatewayDeleteClass_(k.spreadsheetId,APP_CONFIG.SHEET.AGENDA_BELAJAR,idx+2);return{ok:true};
}
