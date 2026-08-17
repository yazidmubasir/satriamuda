/** User kelas + operasi data kelas. */
function findUserByEmail_(email) {
  if (!email) return null;
  const kelas = listKelas_();
  for (const k of kelas) {
    try {
      const sh = SpreadsheetApp.openById(k.spreadsheetId).getSheetByName(APP_CONFIG.SHEET.USERS);
      if (!sh || sh.getLastRow()<2) continue;
      const values = sh.getDataRange().getValues();
      for (let i=1;i<values.length;i++) {
        if (String(values[i][3]).toLowerCase() === email.toLowerCase() && String(values[i][5]).toUpperCase() !== 'INACTIVE') return {email, idUser:values[i][0], nisn:values[i][1], name:values[i][2], role:values[i][4], idKelas:values[i][6]};
      }
    } catch(e) {}
  }
  return null;
}

function adminSaveStudent(form) {
  const session = getSessionInfo();
  if (session.role !== APP_CONFIG.ROLE.ADMIN_KELAS) throw new Error('Hanya ADMIN_KELAS yang dapat mengatur siswa.');
  const k = listKelas_().find(x=>String(x.idKelas)===String(session.idKelas));
  if (!k) throw new Error('Kelas admin tidak ditemukan.');
  const f=form||{};
  if (!f.idUser || !f.nisn || !f.nama || !f.email) throw new Error('ID user, NISN, nama, dan email wajib diisi.');
  const sh=SpreadsheetApp.openById(k.spreadsheetId).getSheetByName(APP_CONFIG.SHEET.USERS);
  const rows=sh.getDataRange().getValues();
  const data=[f.idUser,f.nisn,f.nama,f.email.toLowerCase(),APP_CONFIG.ROLE.SISWA,'ACTIVE',k.idKelas];
  const idx=rows.findIndex((r,i)=>i>0 && (String(r[0])===String(f.idUser)||String(r[3]).toLowerCase()===String(f.email).toLowerCase()));
  if(idx>0)sh.getRange(idx+1,1,1,7).setValues([data]);else sh.appendRow(data);
  return {ok:true,message:'User siswa berhasil disimpan.'};
}

function adminListStudents() {
  const session=getSessionInfo();
  if(session.role!==APP_CONFIG.ROLE.ADMIN_KELAS) throw new Error('Hanya ADMIN_KELAS.');
  const k=listKelas_().find(x=>String(x.idKelas)===String(session.idKelas));
  if(!k)return[];
  const sh=SpreadsheetApp.openById(k.spreadsheetId).getSheetByName(APP_CONFIG.SHEET.USERS);
  return sh.getDataRange().getValues().slice(1).filter(r=>String(r[4])===APP_CONFIG.ROLE.SISWA).map(r=>({idUser:r[0],nisn:r[1],nama:r[2],email:r[3],status:r[5]}));
}

function deleteStudent(idUser) {
  const session=getSessionInfo();
  if(session.role!==APP_CONFIG.ROLE.ADMIN_KELAS) throw new Error('Hanya ADMIN_KELAS.');
  const k=listKelas_().find(x=>String(x.idKelas)===String(session.idKelas));
  const sh=SpreadsheetApp.openById(k.spreadsheetId).getSheetByName(APP_CONFIG.SHEET.USERS);
  const rows=sh.getDataRange().getValues();
  const idx=rows.findIndex((r,i)=>i>0&&String(r[0])===String(idUser));
  if(idx<1)throw new Error('User tidak ditemukan.');
  sh.deleteRow(idx+1); return {ok:true};
}
