
const CONFIG = {
  spreadsheetName: 'Hotel Digital Registration - DEMO',
  registrationsSheet: 'Guest Registrations',
  visaRulesSheet: 'Visa Rules',
  signaturesFolder: 'Hotel Registration Signatures - DEMO',
  privacyPolicyUrl: '' // Optional: paste the hotel's approved privacy-policy URL later.
};

function doGet() {
  return HtmlService.createTemplateFromFile('index')
    .evaluate()
    .setTitle('Guest Registration')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * Run once after creating/opening the Apps Script project.
 * It creates the spreadsheet, sheets, headers, visa rules and Drive folder.
 */
function setupDemo() {
  const ss = getOrCreateSpreadsheet_();
  const reg = getOrCreateSheet_(ss, CONFIG.registrationsSheet);
  const visa = getOrCreateSheet_(ss, CONFIG.visaRulesSheet);

  const headers = [
    'Submission timestamp', 'First name', 'Surname', 'Date of birth',
    'Nationality', 'Residence address', 'ID / Passport number',
    'Car registration number', 'Visa number', 'Arrival date',
    'Check-out date', 'Signature file', 'GDPR acknowledgement'
  ];
  if (reg.getLastRow() === 0) {
    reg.appendRow(headers);
    reg.setFrozenRows(1);
  }

  if (visa.getLastRow() === 0) {
    visa.appendRow(['Country / nationality', 'ISO code', 'Visa required?', 'Source / note']);
    const required = getVisaRequiredCountries_();
    const rows = required.map(c => [c.name, c.code, 'YES', 'Czech MFA list of states whose citizens need visas; verify before production.']);
    visa.getRange(2, 1, rows.length, 4).setValues(rows);
    visa.setFrozenRows(1);
  }

  const folder = getOrCreateFolder_(CONFIG.signaturesFolder);

  return {
    spreadsheetUrl: ss.getUrl(),
    spreadsheetId: ss.getId(),
    signatureFolderUrl: folder.getUrl(),
    message: 'Demo setup completed.'
  };
}

function getOrCreateSpreadsheet_() {
  const files = DriveApp.getFilesByName(CONFIG.spreadsheetName);
  if (files.hasNext()) return SpreadsheetApp.open(files.next());
  return SpreadsheetApp.create(CONFIG.spreadsheetName);
}

function getOrCreateSheet_(ss, name) {
  return ss.getSheetByName(name) || ss.insertSheet(name);
}

function getOrCreateFolder_(name) {
  const folders = DriveApp.getFoldersByName(name);
  return folders.hasNext() ? folders.next() : DriveApp.createFolder(name);
}

function getVisaRules() {
  const ss = getOrCreateSpreadsheet_();
  const sheet = ss.getSheetByName(CONFIG.visaRulesSheet);
  if (!sheet || sheet.getLastRow() < 2) return {};
  const values = sheet.getRange(2, 1, sheet.getLastRow() - 1, 3).getValues();
  const rules = {};
  values.forEach(r => {
    const country = String(r[0] || '').trim();
    const code = String(r[1] || '').trim().toUpperCase();
    const required = String(r[2] || '').trim().toUpperCase() === 'YES';
    if (country) rules[country] = required;
    if (code) rules[code] = required;
  });
  return rules;
}

function saveRegistration(data) {
  validate_(data);

  const ss = getOrCreateSpreadsheet_();
  const sheet = ss.getSheetByName(CONFIG.registrationsSheet);
  if (!sheet) throw new Error('Run setupDemo() first.');

  let signatureUrl = '';
  if (data.signatureDataUrl) {
    const match = data.signatureDataUrl.match(/^data:image\/png;base64,(.+)$/);
    if (!match) throw new Error('Invalid signature image.');

    const bytes = Utilities.base64Decode(match[1]);
    const blob = Utilities.newBlob(bytes, 'image/png',
      'signature_' + Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyyMMdd_HHmmss') + '.png');

    const folder = getOrCreateFolder_(CONFIG.signaturesFolder);
    const file = folder.createFile(blob);
    signatureUrl = file.getUrl();
  }

  sheet.appendRow([
    new Date(),
    data.firstName,
    data.surname,
    data.dateOfBirth,
    data.nationality,
    data.address,
    data.passportNumber,
    data.carRegistration,
    data.visaNumber || '',
    data.arrivalDate,
    data.checkoutDate,
    signatureUrl,
    data.gdpr ? 'YES' : 'NO'
  ]);

  return { ok: true, message: 'Registration submitted successfully.' };
}

function validate_(d) {
  const required = ['firstName', 'surname', 'dateOfBirth', 'nationality',
    'address', 'passportNumber', 'arrivalDate', 'checkoutDate'];
  required.forEach(k => {
    if (!d[k] || String(d[k]).trim() === '') throw new Error('Please complete all required fields.');
  });
  if (!d.gdpr) throw new Error('Please confirm the privacy acknowledgement.');
  if (!d.signatureDataUrl) throw new Error('Please provide your signature.');
  if (d.checkoutDate < d.arrivalDate) throw new Error('Check-out date cannot be before arrival date.');
}

function getVisaRequiredCountries_() {
  // General short-stay Schengen visa-required list from Czech MFA.
  // Keep this in the editable "Visa Rules" sheet so the hotel can update it.
  const names = [
    ['Afghanistan','AF'],['Algeria','DZ'],['Angola','AO'],['Armenia','AM'],
    ['Azerbaijan','AZ'],['Bahrain','BH'],['Bangladesh','BD'],['Belarus','BY'],
    ['Belize','BZ'],['Benin','BJ'],['Bhutan','BT'],['Bolivia','BO'],
    ['Botswana','BW'],['Burkina Faso','BF'],['Burundi','BI'],['Cambodia','KH'],
    ['Cameroon','CM'],['Cape Verde','CV'],['Central African Republic','CF'],
    ['Chad','TD'],['China','CN'],['Comoros','KM'],['Congo - Republic of the Congo','CG'],
    ['Congo - Democratic Republic of the Congo','CD'],['Cuba','CU'],
    ['Djibouti','DJ'],['Dominican Republic','DO'],['Ecuador','EC'],['Egypt','EG'],
    ['Equatorial Guinea','GQ'],['Eritrea','ER'],['Eswatini','SZ'],['Ethiopia','ET'],
    ['Fiji','FJ'],['Gabon','GA'],['Gambia','GM'],['Ghana','GH'],['Guinea','GN'],
    ['Guinea-Bissau','GW'],['Guyana','GY'],['Haiti','HT'],['India','IN'],
    ['Indonesia','ID'],['Iran','IR'],['Iraq','IQ'],['Ivory Coast','CI'],
    ['Jamaica','JM'],['Jordan','JO'],['Kazakhstan','KZ'],['Kenya','KE'],
    ['Kuwait','KW'],['Kyrgyzstan','KG'],['Laos','LA'],['Lebanon','LB'],
    ['Lesotho','LS'],['Liberia','LR'],['Libya','LY'],['Madagascar','MG'],
    ['Malawi','MW'],['Maldives','MV'],['Mali','ML'],['Mauritania','MR'],
    ['Mongolia','MN'],['Morocco','MA'],['Mozambique','MZ'],['Myanmar','MM'],
    ['Namibia','NA'],['Nepal','NP'],['Niger','NE'],['Nigeria','NG'],
    ['North Korea','KP'],['Oman','OM'],['Pakistan','PK'],['Papua New Guinea','PG'],
    ['Philippines','PH'],['Qatar','QA'],['Russia','RU'],['Rwanda','RW'],
    ['Sao Tome and Principe','ST'],['Saudi Arabia','SA'],['Senegal','SN'],
    ['Sierra Leone','SL'],['Somalia','SO'],['South Africa','ZA'],
    ['South Sudan','SS'],['Sri Lanka','LK'],['Sudan','SD'],['Suriname','SR'],
    ['Syria','SY'],['Tajikistan','TJ'],['Tanzania','TZ'],['Thailand','TH'],
    ['Togo','TG'],['Tunisia','TN'],['Turkey','TR'],['Turkmenistan','TM'],
    ['Uganda','UG'],['Uzbekistan','UZ'],['Vanuatu','VU'],['Vietnam','VN'],
    ['Yemen','YE'],['Zambia','ZM'],['Zimbabwe','ZW']
  ];
  return names.map(x => ({name:x[0], code:x[1]}));
}
