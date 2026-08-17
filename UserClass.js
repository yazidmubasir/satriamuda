/** User kelas. Data siswa di MASTER_KELAS diakses melalui Gateway. */
function findUserByEmail_(email) {
  if (!email) return null;
  for (const k of listKelas_()) {
    try {
      const result=gatewayReadClass_(k.spreadsheetId,APP_CONFIG.SHEET.USERS), rows=result.data&&result.data.rows?result.data.rows:[];
      const u=rows.find(r=>String(r[3]).toLowerCase()===email.toLowerCase()&&String(r[5]).toUpperCase()!=='INACTIVE');
      if(u)return {email,idUser:u[0],nisn:u[1],name:u[2],role:u[4],idKelas:u[6]};
    }catch(e){}
  }
  return null;
}
function adminSaveStudent(form) {
  const s=getSessionInfo(); if(s.role!==APP_CONFIG.ROLE.ADMIN_KELAS)throw new Error('Hanya ADMIN_KELAS.');
  const k=listKelas_().find(x=>String(x.idKelas)===String(s.idKelas)); if(!k)throw new Error('Kelas admin tidak ditemukan.');
  const f=form||{}; if(!f.idUser||!f.nisn||!f.nama||!f.email)throw new Error('ID user, NISN, nama, dan email wajib diisi.');
  const result=gatewayReadClass_(k.spreadsheetId,APP_CONFIG.SHEET.USERS), rows=result.data&&result.data.rows?result.data.rows:[];
  const idx=rows.findIndex(r=>String(r[0])===String(f.idUser)||String(r[3]).toLowerCase()===String(f.email).toLowerCase());
  const data=[f.idUser,f.nisn,f.nama,f.email.toLowerCase(),APP_CONFIG.ROLE.SISWA,'ACTIVE',k.idKelas];
  if(idx>=0){const all=rows.slice();all[idx]=data;replaceSheetThroughGateway_(k.spreadsheetId,APP_CONFIG.SHEET.USERS,all);}
  else gatewayAppendClass_(k.spreadsheetId,APP_CONFIG.SHEET.USERS,data);
  return {ok:true,message:'User siswa berhasil disimpan melalui Gateway.'};
}
function replaceSheetThroughGateway_(spreadsheetId,sheet,rows){
  // Minimal implementation: append replacement rows is intentionally avoided; updates are not yet exposed by gateway.
  // For now, existing student rows are deleted from bottom and rewritten through append.
  const current=gatewayReadClass_(spreadsheetId,sheet), old=current.data&&current.data.rows?current.data.rows:[];
  for(let i=old.length+1;i>=2;i--)gatewayDeleteClass_(spreadsheetId,sheet,i);
  rows.forEach(r=>gatewayAppendClass_(spreadsheetId,sheet,r));
}
function adminListStudents() {
  const s=getSessionInfo(); if(s.role!==APP_CONFIG.ROLE.ADMIN_KELAS)throw new Error('Hanya ADMIN_KELAS.');
  const k=listKelas_().find(x=>String(x.idKelas)===String(s.idKelas)); if(!k)return[];
  const result=gatewayReadClass_(k.spreadsheetId,APP_CONFIG.SHEET.USERS), rows=result.data&&result.data.rows?result.data.rows:[];
  return rows.filter(r=>String(r[4])===APP_CONFIG.ROLE.SISWA).map(r=>({idUser:r[0],nisn:r[1],nama:r[2],email:r[3],status:r[5]}));
}
function deleteStudent(idUser) {
  const s=getSessionInfo(); if(s.role!==APP_CONFIG.ROLE.ADMIN_KELAS)throw new Error('Hanya ADMIN_KELAS.');
  const k=listKelas_().find(x=>String(x.idKelas)===String(s.idKelas)); if(!k)throw new Error('Kelas tidak ditemukan.');
  const result=gatewayReadClass_(k.spreadsheetId,APP_CONFIG.SHEET.USERS), rows=result.data&&result.data.rows?result.data.rows:[];
  const idx=rows.findIndex(r=>String(r[0])===String(idUser)); if(idx<0)throw new Error('User tidak ditemukan.');
  gatewayDeleteClass_(k.spreadsheetId,APP_CONFIG.SHEET.USERS,idx+2); return {ok:true};
}
