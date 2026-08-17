/** OWNER setup: semua nilai penting diisi melalui frontend, bukan hard-code. */
function ownerSaveConfig(form) {
  assertOwner_();
  form = form || {};
  const masterId = String(form.masterSimId || '').trim();
  const gatewayUrl = String(form.gatewayUrl || '').trim();
  const gatewayToken = String(form.gatewayToken || '').trim();
  if (!masterId) throw new Error('ID Spreadsheet MASTER_SIM wajib diisi.');
  SpreadsheetApp.openById(masterId);
  PropertiesService.getScriptProperties().setProperties({
    MASTER_SIM_ID: masterId,
    GATEWAY_URL: gatewayUrl,
    GATEWAY_TOKEN: gatewayToken,
    SETUP_OWNER_EMAIL: APP_CONFIG.OWNER_EMAIL
  }, true);
  ensureMasterSim_();
  return {ok:true, message:'Konfigurasi OWNER berhasil disimpan dan MASTER_SIM siap digunakan.', setup:getSetupStatus_()};
}

function ownerInitializeMaster() {
  assertOwner_();
  ensureMasterSim_();
  return {ok:true, message:'MASTER_SIM berhasil dibuat/dilengkapi.', setup:getSetupStatus_()};
}

function ownerSaveKelas(form) {
  assertOwner_();
  ensureMasterSim_();
  form = form || {};
  const id = String(form.idKelas || '').trim().toUpperCase();
  const nama = String(form.namaKelas || '').trim();
  const spreadsheetId = String(form.spreadsheetId || '').trim();
  const folderId = String(form.folderId || '').trim();
  const adminEmail = String(form.adminEmail || '').trim().toLowerCase();
  if (!id || !nama || !spreadsheetId || !adminEmail) throw new Error('ID kelas, nama kelas, spreadsheet kelas, dan email admin wajib diisi.');
  SpreadsheetApp.openById(spreadsheetId);
  const sh = getMasterSheet_();
  const rows = sh.getDataRange().getValues();
  const data = [id,nama,spreadsheetId,folderId,adminEmail,'ACTIVE',new Date()];
  const idx = rows.findIndex((r,i)=>i>0 && String(r[0]).toUpperCase()===id);
  if (idx > 0) sh.getRange(idx+1,1,1,data.length).setValues([data]); else sh.appendRow(data);
  ensureKelasSpreadsheet_(spreadsheetId, id, adminEmail);
  return {ok:true,message:'Kelas berhasil disimpan dan MASTER_KELAS siap.',kelas:{id,nama,spreadsheetId,folderId,adminEmail}};
}

function assertOwner_() {
  const email = String(Session.getActiveUser().getEmail() || '').toLowerCase();
  if (email !== APP_CONFIG.OWNER_EMAIL.toLowerCase()) throw new Error('Akses OWNER diperlukan.');
}

function getMasterSheet_() {
  const id = PropertiesService.getScriptProperties().getProperty(APP_CONFIG.PROP.MASTER_SIM_ID);
  if (!id) throw new Error('MASTER_SIM belum dikonfigurasi.');
  return SpreadsheetApp.openById(id).getSheetByName(APP_CONFIG.SHEET.MASTER_SIM) || SpreadsheetApp.openById(id).insertSheet(APP_CONFIG.SHEET.MASTER_SIM);
}

function ensureMasterSim_() {
  const sh = getMasterSheet_();
  if (sh.getLastRow() === 0) sh.appendRow(['id_kelas','nama_kelas','spreadsheet_id','folder_id','admin_email','status','updated_at']);
  else if (String(sh.getRange(1,1).getValue()) !== 'id_kelas') sh.insertRows(1,1).getRange(1,1,1,7).setValues([['id_kelas','nama_kelas','spreadsheet_id','folder_id','admin_email','status','updated_at']]);
}

function ensureKelasSpreadsheet_(id, kelasId, adminEmail) {
  const ss = SpreadsheetApp.openById(id);
  let users = ss.getSheetByName(APP_CONFIG.SHEET.USERS) || ss.insertSheet(APP_CONFIG.SHEET.USERS);
  if (users.getLastRow() === 0) users.appendRow(['id_user','nisn','nama','email','role','status','id_kelas']);
  let agenda = ss.getSheetByName(APP_CONFIG.SHEET.AGENDA_BELAJAR) || ss.insertSheet(APP_CONFIG.SHEET.AGENDA_BELAJAR);
  if (agenda.getLastRow() === 0) agenda.appendRow(['id','timestamp','email','nisn','nama','id_kelas','tanggal','mata_pelajaran','materi','tujuan_belajar','kegiatan','refleksi']);
  const rows = users.getDataRange().getValues();
  const email = String(adminEmail).toLowerCase();
  if (!rows.slice(1).some(r=>String(r[3]).toLowerCase()===email)) users.appendRow(['ADMIN_'+kelasId,'',adminEmail,adminEmail,'ADMIN_KELAS','ACTIVE',kelasId]);
}

function listKelas_() {
  try {
    const sh = getMasterSheet_();
    return sh.getDataRange().getValues().slice(1).filter(r=>r[0]).map(r=>({idKelas:r[0],namaKelas:r[1],spreadsheetId:r[2],folderId:r[3],adminEmail:r[4],status:r[5]}));
  } catch(e) { return []; }
}
