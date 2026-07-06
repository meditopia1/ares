# Hospital Claims Test Scenarios

These two scenarios are the quickest way to verify the Africa Assist authorization flow and the Hospital Claims workspace flow end to end.

## Shared Test Data

- Africa Assist demo login: `afri@out.com` / `afri123`
- Ambulance demo login: `ambu@out.com` / `ambu123`
- Claims workspace: `/claims/hospital`
- Authorization workspace: `/authorizations/member-verification`
- GOP intake workspace: `/authorizations/gop-intake`

## Scenario 1: Africa Assist verification to GOP intake

Purpose: confirm that Africa Assist can verify a patient, upload a GOP from the authorization dashboard, and push the intake into the claims workflow.

1. Sign in as `afri@out.com`.
2. Open `/authorizations/member-verification`.
3. Search using one field only, such as member number, ID number, or cell phone.
4. Confirm the page auto-fills the other member fields and shows `Active` or `Suspended`.
5. Click `Verify Hospital Benefit`.
6. Confirm the result shows the plan name and `Hospital cover included`.
7. Open `/authorizations/gop-intake`.
8. Upload a GOP PDF or application form.
9. Confirm the scan review shows extracted fields and the generated `HCRYYMMDD0000001` claim number format.
10. Click `Submit to Hospital Claims Intake`.
11. Open `/claims/hospital`.
12. Confirm the new intake appears in the hospital claims register as a pending or awaiting-GOP row with editable fields.

Pass criteria:

- Member lookup works from a single search field.
- Hospital benefit status and plan name are displayed.
- GOP upload is accepted from the authorization side.
- The claims workspace receives the intake as a new claim row.

## Scenario 2: Direct hospital claims intake from the workspace

Purpose: confirm that claims staff can upload a GOP/application straight from the hospital claims workspace, scan it, and add it into the register.

1. Sign in with a claims-capable user.
2. Open `/claims/hospital`.
3. Click `New GOP/Application`.
4. Upload the same kind of GOP PDF or claim form.
5. Confirm OCR extraction starts automatically.
6. Confirm the scan review shows the extracted field list, confidence score, and generated claim number.
7. Review the suggested fields for member name, member number, policy number, hospital name, admission date, diagnosis, and payment date.
8. Click `Add to claims`.
9. Confirm the new row is added at the next available line in the register.
10. Open the drawer for the new row and confirm the fields remain editable.
11. Save a change and confirm it persists back to `hospital_claims_register`.

Pass criteria:

- The upload triggers scanning automatically.
- The claim number is generated before the row is added.
- The row is appended to the workspace without disturbing existing claims.
- Edits save back to the database.

## Notes

- The current implementation uses scan review plus draft row creation in the workspace. If we later want a separate persistent notification feed between authorizations and claims, that can be layered on top of this flow.
- The hospital claims scan/add path is live. The authorization-side GOP submit button is the handoff point to finish wiring into the same intake table and notification path.
- The goal of both scenarios is to prove that the workflow feels fluent: lookup, scan, review, add, and edit without unnecessary re-entry.
