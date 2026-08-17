/** SATRIA SISWA — 8 modul aktivitas siswa; akses data siswa melalui Write Gateway. */
const SISWA_MODULES=Object.freeze({
 AGENDA_BELAJAR:{nama:'Agenda Belajar',icon:'📚',sheet:'TRX_AGENDA_BELAJAR',fields:[['tanggal','Tanggal','date'],['mataPelajaran','Mata Pelajaran','text'],['materi','Materi','text'],['tujuanBelajar','Tujuan Belajar','textarea'],['kegiatan','Kegiatan Belajar','textarea'],['refleksi','Refleksi','textarea']]},
 TUJUHKAIH:{nama:'Kegiatan 7KAIH',icon:'🌱',sheet:'TRX_7KAIH',fields:[['tanggal','Tanggal','date'],['kegiatan','Kegiatan','text'],['kategori','Kategori 7KAIH','text'],['uraian','Uraian Kegiatan','textarea'],['nilaiKarakter','Nilai/karakter yang dipraktikkan','text'],['refleksi','Refleksi','textarea']]},
 BELAJAR_MANDIRI:{nama:'Kegiatan Belajar Mandiri',icon:'🧠',sheet:'TRX_BELAJAR_MANDIRI',fields:[['tanggal','Tanggal','date'],['mataPelajaran','Mata Pelajaran','text'],['materi','Materi','text'],['sumberBelajar','Sumber Belajar','text'],['durasi','Durasi Belajar','text'],['hasilBelajar','Hasil Belajar','textarea'],['refleksi','Refleksi','textarea']]},
 JURNAL_REFLEKSI:{nama:'Jurnal/Refleksi Belajar',icon:'📝',sheet:'TRX_JURNAL_REFLEKSI',fields:[['tanggal','Tanggal','date'],['mataPelajaran','Mata Pelajaran','text'],['halDipelajari','Hal yang Dipelajari','textarea'],['kesulitan','Kesulitan/Hambatan','textarea'],['solusi','Solusi/Upaya','textarea'],['rencana','Rencana Perbaikan','textarea']]},
 PRESTASI:{nama:'Prestasi Siswa',icon:'🏆',sheet:'TRX_PRESTASI_SISWA',fields:[['tanggal','Tanggal','date'],['bidang','Bidang Prestasi','text'],['namaPrestasi','Nama Prestasi','text'],['tingkat','Tingkat','text'],['penyelenggara','Penyelenggara','text'],['keterangan','Keterangan','textarea']]},
 LITERASI:{nama:'Kegiatan Literasi',icon:'📖',sheet:'TRX_LITERASI_SISWA',fields:[['tanggal','Tanggal','date'],['jenis','Jenis Literasi','text'],['judul','Judul Buku/Sumber','text'],['penulis','Penulis/Sumber','text'],['ringkasan','Ringkasan','textarea'],['refleksi','Refleksi','textarea']]},
 ORGANISASI:{nama:'Kegiatan Organisasi',icon:'🤝',sheet:'TRX_ORGANISASI_SISWA',fields:[['tanggal','Tanggal','date'],['organisasi','Nama Organisasi','text'],['jabatan','Peran/Jabatan','text'],['kegiatan','Nama Kegiatan','text'],['uraian','Uraian Kegiatan','textarea'],['hasil','Hasil/Refleksi','textarea']]},
 AGENDA_KEGIATAN:{nama:'Agenda/Kegiatan Siswa',icon:'📅',sheet:'TRX_KEGIATAN_SISWA',fields:[['tanggal','Tanggal','date'],['jenis','Jenis Kegiatan','text'],['namaKegiatan','Nama Kegiatan','text'],['tempat','Tempat','text'],['uraian','Uraian Kegiatan','textarea'],['hasil','Hasil/Keterangan','textarea']]}
});

/** Struktur menu baru: BERANDA tanpa submenu; empat induk dengan submenu. */
const SISWA_MENU_GROUPS=Object.freeze([
 {kode:'MULIA',nama:'MULIA',icon:'🌱',items:['TUJUHKAIH','JURNAL_REFLEKSI']},
 {kode:'BERAKHLAK',nama:'BERAKHLAK',icon:'🤝',items:['ORGANISASI']},
 {kode:'HEBAT',nama:'HEBAT',icon:'🏆',items:['AGENDA_BELAJAR','BELAJAR_MANDIRI','PRESTASI']},
 {kode:'BERKARYA',nama:'BERKARYA',icon:'✨',items:['LITERASI','AGENDA_KEGIATAN']}
]);

function getSiswaModules(){return Object.keys(SISWA_MODULES).map(k=>({kode:k,nama:SISWA_MODULES[k].nama,icon:SISWA_MODULES[k].icon}));}
function getSiswaMenuGroups(){return SISWA_MENU_GROUPS.map(g=>({kode:g.kode,nama:g.nama,icon:g.icon,items:g.items.map(k=>({kode:k,nama:SISWA_MODULES[k].nama,icon:SISWA_MODULES[k].icon}))}));}
function getModuleConfig(kode){const c=requireModule_(kode);return{kode,nama:c.nama,icon:c.icon,sheet:c.sheet,fields:c.fields};}
function moduleHeaders_(cfg){return['id','timestamp','email','nisn','nama','id_kelas'].concat(cfg.fields.map(f=>f[0]));}
function ensureModuleViaGateway_(spreadsheetId,cfg){return gatewayEnsureSheet_(spreadsheetId,cfg.sheet,moduleHeaders_(cfg));}
function getSiswaModuleData(kode){const cfg=requireModule_(kode),s=getSessionInfo(),k=findKelasForSession_(s);if(!k)return[];ensureModuleViaGateway_(k.spreadsheetId,cfg);const result=gatewayReadClass_(k.spreadsheetId,cfg.sheet),rows=result.data&&result.data.rows?result.data.rows:[];return rows.map((r,i)=>Object.assign(rowToModule_(cfg,r),{_rowNumber:i+2})).filter(r=>String(r.email).toLowerCase()===String(s.email).toLowerCase());}
function saveSiswaModule(kode,data){const cfg=requireModule_(kode),s=getSessionInfo(),k=findKelasForSession_(s);if(s.role!=='SISWA')throw new Error('Modul kegiatan siswa hanya dapat diinput oleh akun SISWA.');if(!k)throw new Error('Kelas pengguna belum terdaftar.');ensureModuleViaGateway_(k.spreadsheetId,cfg);const d=data||{},id='SM-'+Date.now()+'-'+Math.floor(Math.random()*10000),row=[id,new Date(),s.email,s.nisn||'',s.name||'',k.idKelas].concat(cfg.fields.map(f=>d[f[0]]||''));gatewayAppendClass_(k.spreadsheetId,cfg.sheet,row);return{ok:true,id,message:cfg.nama+' berhasil disimpan.'};}
function deleteSiswaModule(kode,id){const cfg=requireModule_(kode),s=getSessionInfo(),k=findKelasForSession_(s);if(s.role!=='SISWA')throw new Error('Hanya siswa yang dapat menghapus data.');if(!k)throw new Error('Kelas pengguna belum terdaftar.');ensureModuleViaGateway_(k.spreadsheetId,cfg);const result=gatewayReadClass_(k.spreadsheetId,cfg.sheet),rows=result.data&&result.data.rows?result.data.rows:[],idx=rows.findIndex(r=>String(r[0])===String(id)&&String(r[2]).toLowerCase()===String(s.email).toLowerCase());if(idx<0)throw new Error('Data tidak ditemukan atau bukan milik Anda.');gatewayDeleteClass_(k.spreadsheetId,cfg.sheet,idx+2);return{ok:true,message:'Data berhasil dihapus.'};}
function requireModule_(kode){const cfg=SISWA_MODULES[String(kode||'').toUpperCase()];if(!cfg)throw new Error('Modul tidak dikenal: '+kode);return cfg;}
function findKelasForSession_(s){return listKelas_().find(k=>String(k.idKelas)===String(s.idKelas));}
function rowToModule_(cfg,r){const o={id:r[0],timestamp:r[1],email:r[2],nisn:r[3],nama:r[4],idKelas:r[5]};cfg.fields.forEach((f,i)=>o[f[0]]=r[6+i]);return o;}
function ensureAllSiswaModuleSheets_(spreadsheetId){const ss=SpreadsheetApp.openById(spreadsheetId);Object.keys(SISWA_MODULES).forEach(k=>{const cfg=SISWA_MODULES[k];let sh=ss.getSheetByName(cfg.sheet);if(!sh)sh=ss.insertSheet(cfg.sheet);const headers=moduleHeaders_(cfg);if(sh.getLastRow()===0)sh.appendRow(headers)});return true;}
