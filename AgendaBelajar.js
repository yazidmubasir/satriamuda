/** Menu pertama: Agenda Belajar siswa — jalur simpan langsung, Gateway hanya fallback permission. */
const AGENDA_BELAJAR_HEADERS=['id','timestamp','email','nisn','nama','id_kelas','tanggal','namaGuru','mataPelajaran','materi','tujuanBelajar','kegiatan','refleksi'];

/** Ambil session + kelas dari cache cepat. Gateway hanya disentuh saat cache kelas belum tersedia. */
function agendaBelajarContext_(){
  const s=typeof fastSession_==='function'?fastSession_():getSessionInfo();
  if(!s||!s.idKelas)throw new Error('Kelas pengguna belum terdaftar.');
  const k=typeof fastKelas_==='function'?fastKelas_(s):agendaBelajarClass_(s);
  if(!k||!k.spreadsheetId)throw new Error('Spreadsheet kelas belum terdaftar.');
  return{s,k};
}

/**
 * Jalur utama: SpreadsheetApp langsung.
 * Gateway HANYA dipanggil bila penulisan langsung gagal karena permission.
 * Tidak ada READ, ENSURE_SHEET, ENSURE_HEADERS, UrlFetch, atau gateway normal.
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
  const {s,k}=agendaBelajarContext_();
  const result=gatewayReadClass_(k.spreadsheetId,APP_CONFIG.SHEET.AGENDA_BELAJAR),rows=result.data&&result.data.rows?result.data.rows:[];
  return rows.filter(r=>String(r[2]).toLowerCase()===String(s.email).toLowerCase()).map(r=>({id:r[0],timestamp:r[1],email:r[2],nisn:r[3],nama:r[4],idKelas:r[5],tanggal:r[6],namaGuru:r[7],mataPelajaran:r[8],materi:r[9],tujuanBelajar:r[10],kegiatan:r[11],refleksi:r[12]}));
}

function saveAgendaBelajar(data){
  const {s,k}=agendaBelajarContext_();
  if(!['SISWA','ADMIN_KELAS'].includes(s.role))throw new Error('Akun tidak memiliki akses input Agenda Belajar.');
  const d=data||{},id='AB-'+Date.now()+'-'+Math.floor(Math.random()*100000);
  const row=[id,new Date(),s.email,s.nisn||'',s.name||'',k.idKelas,d.tanggal||'',d.namaGuru||'',d.mataPelajaran||'',d.materi||'',d.tujuanBelajar||'',d.kegiatan||'',d.refleksi||''];
  const result=appendAgendaBelajarFast_(k.spreadsheetId,row);
  return{ok:true,id,mode:result.mode,message:'Agenda Belajar berhasil disimpan.'};
}

function deleteAgendaBelajar(id){
  const {s,k}=agendaBelajarContext_();
  if(s.role!=='SISWA')throw new Error('Hanya siswa yang dapat menghapus agenda miliknya.');
  const result=gatewayReadClass_(k.spreadsheetId,APP_CONFIG.SHEET.AGENDA_BELAJAR),rows=result.data&&result.data.rows?result.data.rows:[];
  const idx=rows.findIndex(r=>String(r[0])===String(id)&&String(r[2]).toLowerCase()===String(s.email).toLowerCase());
  if(idx<0)throw new Error('Data tidak ditemukan atau bukan milik Anda.');
  gatewayDeleteClass_(k.spreadsheetId,APP_CONFIG.SHEET.AGENDA_BELAJAR,idx+2);return{ok:true};
}
