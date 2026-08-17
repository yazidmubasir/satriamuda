/** Entry point SATRIA SISWA. */
function doGet() {
  return HtmlService.createTemplateFromFile('ui/index').evaluate().setTitle(APP_CONFIG.NAME+' v'+APP_CONFIG.VERSION).setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}
function include(filename){return HtmlService.createHtmlOutputFromFile(String(filename||'').trim()).getContent();}
function getSessionInfo(){const email=String(Session.getActiveUser().getEmail()||'').toLowerCase();if(email===APP_CONFIG.OWNER_EMAIL.toLowerCase())return{email,role:'OWNER',name:'OWNER'};return findUserByEmail_(email)||{email,role:'UNKNOWN',name:email||'Pengguna'};}
function getInitialData(){return{session:getSessionInfo(),setup:getSetupStatus_(),kelas:listKelas_(),menus:getSiswaModules(),menuGroups:getSiswaMenuGroups()};}
function getSetupStatus_(){const p=PropertiesService.getScriptProperties();return{masterSimId:p.getProperty(APP_CONFIG.PROP.MASTER_SIM_ID)||'',gatewayUrl:p.getProperty(APP_CONFIG.PROP.GATEWAY_URL)||'',gatewayToken:p.getProperty(APP_CONFIG.PROP.GATEWAY_TOKEN)||'',ownerEmail:p.getProperty(APP_CONFIG.PROP.SETUP_OWNER_EMAIL)||APP_CONFIG.OWNER_EMAIL};}
function getModuleConfig(kode){const c=requireModule_(kode);return{kode,nama:c.nama,icon:c.icon,sheet:c.sheet,fields:c.fields};}
