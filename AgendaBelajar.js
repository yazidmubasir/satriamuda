/** Menu pertama: Agenda Belajar siswa — write/read melalui Gateway. */
function getAgendaBelajar() {
  const s=getSessionInfo(); if(!s.idKelas)return[];
  const k=listKelas_().find(x=>String(x.idKelas)===String(s.idKelas)); if(!k)return[];
  const result=gatewayReadClass_(k.spreadsheetId,APP_CONFIG.SHEET.AGENDA_BELAJAR);
  const rows=result.data&&result.data.rows?result.data.rows:[];
  return rows.filter(r=>String(r[2]).toLowerCase()===String(s.email).toLowerCase()).map(r=>({id:r[0],timestamp:r[1],email:r[2],nisn:r[3],nama:r[4],idKelas:r[5],tanggal:r[6],mataPelajaran:r[7],materi:r[8],tujuanBelajar:r[9],kegiatan:r[10],refleksi:r[11]}));
}

function saveAgendaBelajar(data) {
  const s=getSessionInfo();
  if(!['SISWA','ADMIN_KELAS'].includes(s.role))throw new Error('Akun tidak memiliki akses input Agenda Belajar.');
  const k=listKelas_().find(x=>String(x.idKelas)===String(s.idKelas)); if(!k)throw new Error('Kelas tidak ditemukan.');
  const d=data||{}, id='AB-'+Date.now()+'-'+Math.floor(Math.random()*1000);
  gatewayAppendClass_(k.spreadsheetId,APP_CONFIG.SHEET.AGENDA_BELAJAR,[id,new Date(),s.email,s.nisn||'',s.name||'',k.idKelas,d.tanggal||'',d.mataPelajaran||'',d.materi||'',d.tujuanBelajar||'',d.kegiatan||'',d.refleksi||'']);
  return {ok:true,id,message:'Agenda Belajar berhasil disimpan melalui Gateway.'};
}

function deleteAgendaBelajar(id) {
  const s=getSessionInfo(); if(s.role!=='SISWA')throw new Error('Hanya siswa yang dapat menghapus agenda miliknya.');
  const k=listKelas_().find(x=>String(x.idKelas)===String(s.idKelas)); if(!k)throw new Error('Kelas tidak ditemukan.');
  const result=gatewayReadClass_(k.spreadsheetId,APP_CONFIG.SHEET.AGENDA_BELAJAR);
  const rows=result.data&&result.data.rows?result.data.rows:[];
  const idx=rows.findIndex(r=>String(r[0])===String(id)&&String(r[2]).toLowerCase()===String(s.email).toLowerCase());
  if(idx<0)throw new Error('Data tidak ditemukan atau bukan milik Anda.');
  gatewayDeleteClass_(k.spreadsheetId,APP_CONFIG.SHEET.AGENDA_BELAJAR,idx+2);
  return {ok:true};
}
