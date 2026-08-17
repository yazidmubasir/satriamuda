/**
 * SATRIA MUDA — Dashboard aktivitas lintas kelas.
 * OWNER dan ADMIN_KELAS dapat melihat ringkasan seluruh kelas.
 * Data dibaca melalui Write Gateway; tidak membuka spreadsheet kelas secara langsung.
 */
function getDashboardData(){
  const session=getSessionInfo();
  const allowed=[APP_CONFIG.ROLE.OWNER,APP_CONFIG.ROLE.ADMIN_KELAS];
  if(allowed.indexOf(session.role)<0){
    return {ok:true,scope:'NONE',updatedAt:new Date(),cards:[]};
  }

  const kelas=listKelas_();
  const cards=Object.keys(SISWA_MODULES).map(function(kode){
    const cfg=SISWA_MODULES[kode];
    const all=[];

    kelas.forEach(function(k){
      try{
        const result=gatewayReadClass_(k.spreadsheetId,cfg.sheet);
        const rows=result&&result.data&&Array.isArray(result.data.rows)?result.data.rows:[];
        const headers=result&&result.data&&Array.isArray(result.data.headers)?result.data.headers:null;
        rows.forEach(function(row){
          const item=dashboardRowToObject_(cfg,row,headers);
          item.idKelas=item.idKelas||k.idKelas;
          item.namaKelas=k.namaKelas||k.idKelas;
          all.push(item);
        });
      }catch(e){
        // Satu kelas/sheet yang bermasalah tidak boleh membuat dashboard seluruhnya gagal.
      }
    });

    all.sort(function(a,b){
      const da=dashboardDateValue_(a.tanggal||a.timestamp);
      const db=dashboardDateValue_(b.tanggal||b.timestamp);
      return db-da;
    });

    return {
      kode:kode,
      nama:cfg.nama,
      icon:cfg.icon,
      total:all.length,
      kelasCount:all.reduce(function(acc,r){acc[r.idKelas||r.namaKelas||'-']=true;return acc;},{} ) instanceof Object ? Object.keys(all.reduce(function(acc,r){acc[r.idKelas||r.namaKelas||'-']=true;return acc;},{})).length : 0,
      rows:all.slice(0,6)
    };
  });

  return {
    ok:true,
    scope:'ALL_CLASSES',
    role:session.role,
    kelasCount:kelas.length,
    updatedAt:new Date(),
    cards:cards
  };
}

function dashboardRowToObject_(cfg,row,headers){
  const o={};
  const safeHeaders=Array.isArray(headers)&&headers.length?headers:moduleHeaders_(cfg);
  safeHeaders.forEach(function(h,i){
    const key=dashboardNormalizeKey_(h);
    if(key)o[key]=row[i];
  });

  // Fallback untuk gateway yang hanya mengembalikan rows tanpa headers.
  if(o.id===undefined)o.id=row[0];
  if(o.timestamp===undefined)o.timestamp=row[1];
  if(o.email===undefined)o.email=row[2];
  if(o.nisn===undefined)o.nisn=row[3];
  if(o.nama===undefined)o.nama=row[4];
  if(o.idKelas===undefined)o.idKelas=row[5];
  cfg.fields.forEach(function(f,i){
    if(o[f[0]]===undefined)o[f[0]]=row[6+i];
  });
  return o;
}

function dashboardNormalizeKey_(header){
  const s=String(header||'').trim();
  if(!s)return '';
  const aliases={
    'id_kelas':'idKelas',
    'idkelas':'idKelas',
    'nama_guru':'namaGuru',
    'nama guru':'namaGuru',
    'mata_pelajaran':'mataPelajaran',
    'mata pelajaran':'mataPelajaran',
    'tujuan_belajar':'tujuanBelajar',
    'tujuan belajar':'tujuanBelajar',
    'kegiatan_belajar':'kegiatan',
    'kegiatan belajar':'kegiatan',
    'nilai/karakter yang dipraktikkan':'nilaiKarakter',
    'nilai_karakter':'nilaiKarakter',
    'hal_dipelajari':'halDipelajari',
    'hal yang dipelajari':'halDipelajari',
    'nama_prestasi':'namaPrestasi',
    'nama prestasi':'namaPrestasi',
    'sumber_belajar':'sumberBelajar',
    'sumber belajar':'sumberBelajar',
    'hasil_belajar':'hasilBelajar',
    'hasil belajar':'hasilBelajar',
    'nama_kegiatan':'namaKegiatan',
    'nama kegiatan':'namaKegiatan'
  };
  const low=s.toLowerCase();
  if(aliases[low])return aliases[low];
  return s.replace(/[^a-zA-Z0-9]+(.)/g,function(_,c){return c.toUpperCase();}).replace(/^[A-Z]/,function(c){return c.toLowerCase();});
}

function dashboardDateValue_(v){
  if(v instanceof Date)return v.getTime();
  const d=new Date(v);
  return isNaN(d.getTime())?0:d.getTime();
}
