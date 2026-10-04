
# Hotel Digital Registration — DEMO

A Google Apps Script + Google Sheets prototype for a QR-based hotel registration card.

## What it does

- Mobile-first guest registration page
- First name / surname
- Date of birth
- Nationality
- Residence address
- ID/passport number
- Optional car registration number
- Conditional visa-number field
- Arrival date automatically set to today's date
- Guest selects check-out date
- Finger/touch signature
- Privacy/GDPR acknowledgement checkbox
- Stores registrations in Google Sheets
- Stores signature PNG files in a private Google Drive folder

## Important

This is a DEMO. Do not enter real guest personal data until the hotel owner approves the system and the hotel has reviewed its GDPR/privacy, data-retention, access-control and legal requirements.

The visa list is based on the Czech Ministry of Foreign Affairs' general Schengen visa-required list and is deliberately copied into an editable Google Sheet. Visa requirements can have exceptions (passport type, residence permit, purpose/status, etc.), so the hotel should verify the rule before production.

## Setup

1. Go to Google Drive and create a new Google Apps Script project.
2. Create two files:
   - `Code.gs`
   - `Index.html`
3. Paste the corresponding files from this package.
4. In Apps Script, save the project.
5. Run `setupDemo()` once from the Apps Script editor.
6. Authorize the requested Google permissions.
7. Open the returned spreadsheet URL from the execution result.
8. Check `Guest Registrations` and `Visa Rules`.
9. Deploy:
   - Deploy → New deployment
   - Type: Web app
   - Execute as: Me
   - Who has access: Anyone
10. Copy the Web app URL.
11. Generate a QR code containing that URL.
12. Scan it with an iPhone/Android and test the form.

## Production changes later

After hotel approval, we can add:
- hotel logo/name/colors
- official privacy notice link
- Czech/English/Russian/Tajik language selector
- automatic email notification to reception
- room number / booking number
- multiple guests per booking
- receptionist dashboard
- automatic PDF copy of the signed registration
- retention/deletion policy
- role-based access
- audit log
- stronger data protection
- QR code poster
