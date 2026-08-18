/** SATRIA MUDA — jalur cepat transaksi modul.
 *  Normal path sengaja tidak melakukan ENSURE_SHEET/ENSURE_HEADERS pada setiap klik.
 *  Struktur sheet dibuat saat setup/registrasi kelas; transaksi harian cukup READ/APPEND/DELETE.
 */
function fastSession_(){
  const email=String(Session.getActiveUser().getEmail()||'').toLowerCase();
  const key='SM_FAST_SESSION_'+Utilities.base64EncodeWebSafe(email).slice(0,80);
  const cache=CacheService.getScriptCache();
  if(email){try{const hit=cache.get(key);if(hit)return JSON.parse(hit);}catch(e){}}
  const s=getSessionInfo();
  if(email){try{cache.put(key,JSON.stringify(s),300);}catch(e){}}
  return s;
}
function fastKelas_(s){
  const cache=CacheService.getScriptCache(),key='SM_FAST_KELAS_V2';
  try{const hit=cache.get(key);if(hit){const rows=JSON.parse(hit);const k=rows.find(x=>String(x.idKelas)===String(s.idKelas));if(k)return k;}}catch(e){}
  const rows=listKelas_();
  try{cache.put(key,JSON.stringify(rows),300);}catch(e){}
  return rows.find(x=>String(x.idKelas)===String(s.idKelas))||null;
}
function getSiswaModuleDataFast(kode){
  const cfg=requireModule_(kode),s=fastSession_();
  if(s.role!=='SISWA')throw new Error('Modul kegiatan siswa hanya dapat diakses oleh akun SISWA.');
  const k=fastKelas_(s);if(!k)throw new Error('Kelas pengguna belum terdaftar.');
  const result=gatewayReadClass_(k.spreadsheetId,cfg.sheet);
  const data=result.data||{},rows=Array.isArray(data.rows)?data.rows:[],headers=Array.isArray(data.headers)&&data.headers.length?data.headers:moduleHeaders_(cfg);
  return rows.map((r,i)=>Object.assign(rowToModule_(cfg,r,headers),{_rowNumber:i+2})).filter(r=>String(r.email).toLowerCase()===String(s.email).toLowerCase());
}
function saveSiswaModuleFast(kode,data){
  const cfg=requireModule_(kode),s=fastSession_();
  if(s.role!=='SISWA')throw new Error('Modul kegiatan siswa hanya dapat diinput oleh akun SISWA.');
  const k=fastKelas_(s);if(!k)throw new Error('Kelas pengguna belum terdaftar.');
  // Header standar dibuat pada setup. Tidak melakukan ENSURE/READ sebelum APPEND.
  const headers=moduleHeaders_(cfg),row=buildModuleRow_(cfg,data||{},s,k,headers);
  gatewayAppendClass_(k.spreadsheetId,cfg.sheet,row);
  return{ok:true,id:row[0],message:cfg.nama+' berhasil disimpan.'};
}
function deleteSiswaModuleFast(kode,id){
  const cfg=requireModule_(kode),s=fastSession_();
  if(s.role!=='SISWA')throw new Error('Hanya siswa yang dapat menghapus data.');
  const k=fastKelas_(s);if(!k)throw new Error('Kelas pengguna belum terdaftar.');
  const result=gatewayReadClass_(k.spreadsheetId,cfg.sheet),data=result.data||{},rows=Array.isArray(data.rows)?data.rows:[],headers=Array.isArray(data.headers)?data.headers:moduleHeaders_(cfg);
  const idIdx=findModuleHeaderIndex_(headers,'id','id'),emailIdx=findModuleHeaderIndex_(headers,'email','email');
  const idx=rows.findIndex(r=>String(r[idIdx])===String(id)&&String(r[emailIdx]).toLowerCase()===String(s.email).toLowerCase());
  if(idx<0)throw new Error('Data tidak ditemukan atau bukan milik Anda.');
  gatewayDeleteClass_(k.spreadsheetId,cfg.sheet,idx+2);return{ok:true,message:'Data berhasil dihapus.'};
}
function clearFastModuleCache_(){try{CacheService.getScriptCache().remove('SM_FAST_KELAS_V2');}catch(e){}}
