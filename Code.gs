/** Entry point SATRIA SISWA. */
function doGet() {
  return HtmlService.createTemplateFromFile('ui/index')
    .evaluate()
    .setTitle(APP_CONFIG.NAME + ' v' + APP_CONFIG.VERSION)
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(String(filename || '').trim()).getContent();
}

function getSessionInfo() {
  const email = String(Session.getActiveUser().getEmail() || '').toLowerCase();
  const owner = APP_CONFIG.OWNER_EMAIL.toLowerCase();
  if (email === owner) return {email, role: APP_CONFIG.ROLE.OWNER, name: 'OWNER'};
  const user = findUserByEmail_(email);
  return user || {email, role: 'UNKNOWN', name: email || 'Pengguna'};
}

function getInitialData() {
  return {
    session: getSessionInfo(),
    setup: getSetupStatus_(),
    kelas: listKelas_(),
    menus: [{kode:'AGENDA_BELAJAR', nama:'Agenda Belajar', icon:'📚'}]
  };
}

function getSetupStatus_() {
  const p = PropertiesService.getScriptProperties();
  return {
    masterSimId: p.getProperty(APP_CONFIG.PROP.MASTER_SIM_ID) || '',
    gatewayUrl: p.getProperty(APP_CONFIG.PROP.GATEWAY_URL) || '',
    gatewayToken: p.getProperty(APP_CONFIG.PROP.GATEWAY_TOKEN) || '',
    ownerEmail: p.getProperty(APP_CONFIG.PROP.SETUP_OWNER_EMAIL) || APP_CONFIG.OWNER_EMAIL
  };
}
