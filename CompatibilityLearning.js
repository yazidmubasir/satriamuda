/** SATRIA MUDA V1.3 — compatibility layer for shared MASTER_KELAS. */
function listKelas_(){
  try{
    if(typeof getMasterKelas==='function') return getMasterKelas();
    const masterId=PropertiesService.getScriptProperties().getProperty(APP_CONFIG.PROP.MASTER_SIM_ID);
    if(!masterId) return [];
    const r=gatewayReadClass_(masterId,APP_CONFIG.SHEET.MASTER_KELAS);
    const rows=r&&r.data&&Array.isArray(r.data.rows)?r.data.rows:[];
    return rows.filter(x=>x&&x[0]&&String(x[5]||'ACTIVE').toUpperCase()!=='INACTIVE').map(x=>({
      idKelas:String(x[0]),
      namaKelas:String(x[1]||x[0]),
      spreadsheetId:String(x[2]||''),
      folderId:String(x[3]||''),
      adminEmail:String(x[4]||''),
      status:String(x[5]||'ACTIVE').toUpperCase()
    }));
  }catch(e){
    console.warn('listKelas_ compatibility:',e);
    return [];
  }
}

/** ALL/SEMUA KELAS must always be treated as a global target. */
function isAllClassTarget_(value){
  const v=String(value||'').trim().toUpperCase().replace(/\s+/g,' ');
  return !v || ['ALL','ALL KELAS','SEMUA','SEMUA KELAS','SEMUA_KELAS','*'].includes(v);
}
