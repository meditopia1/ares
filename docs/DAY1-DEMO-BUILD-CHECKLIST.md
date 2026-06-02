# Day1 Demo Build Checklist

This is the practical build order for the 5-day Day1 demo environment.

Use this file while we create the demo setup.

- `[ ]` means not built yet
- `[x]` means built and confirmed
- if something fails, leave it unchecked and add a short note below it

## Build Rules

- Create the business-critical items through the app where possible
- Use direct DB setup only for support data or where the UI is too slow/incomplete
- Keep all demo records clearly marked with:
  - `DEMO-`
  - `DEMOAPP-`
  - `DEMOCLM-`
  - `DEMOPA-`
  - `DEMOGRP-`
  - `TEMP DEMO DATA`
  - `DAY1-5DAY-UAT-2026-05`

---

## Real Member Creation Routes For This Demo

For this demo, we should treat these as the real entry routes into the system:

1. **Application Funnel Route**
   - prospect starts from the main site
   - step 1 saves the prospect into `contacts` as a lead/contact
   - completes the full 6-step application
   - final submission creates the application record and shows the applicant an application reference code
   - **call-centre does the first verification**
   - **admin does the final approval and member conversion**
   - approved application becomes a member

2. **Manual Assisted Route**
   - broker or call-centre drives the member creation process manually
   - used where the person is assisted directly instead of self-submitting online
   - still needs the same compliance information where applicable:
     - identity
     - dependants
     - banking
     - policy confirmation
     - consent / verification evidence

For now, this is the most practical and realistic test setup.

---

## Application Handoff Logic

This is the exact operational chain we are testing for new members:

1. **Applicant**
   - starts from the funnel
   - completes page 1 and is saved to `contacts`
   - completes pages 2 to 6
   - submits the application
   - receives an application reference code and page notification

2. **Call Centre**
   - receives the submitted application first
   - calls the applicant
   - checks identity, documents, banking, dependants, and general completeness
   - performs the **first verification**
   - clicks `Verify` / moves the application into the verified-review state

3. **Admin**
   - receives the call-centre-verified application
   - checks compliance items including plan wording, terms, voice/signature, and overall application quality
   - performs the **final approval**
   - converts the approved application into a member record

This is the main member-creation route we should treat as the standard demo flow.

---

## 1. Pre-Build Checks

- [ ] Confirm local app opens at `http://localhost:3001`
- [ ] Confirm self-hosted backend is reachable through the app
- [ ] Confirm admin login works: `admin@day1main.com / admin123`
- [ ] Confirm provider login works: `nxamalo@gmail.com / 223344`
- [ ] Confirm claims login works: `claims@day1main.com / claims123`

---

## 2. Create Demo Applications Through The App

These should be created through the public or app-facing flow if possible.

### 2A. Run The Real 6-Step Application Flow

This is the actual application process we should use from the funnel.

#### Step 1: Personal Info

- [ ] Open the public application flow
- [ ] Enter personal details
  - first name
  - last name
  - ID number
  - date of birth
  - gender
  - email
  - mobile
  - address
- [ ] Confirm the step accepts and moves forward

#### Step 2: Documents

- [ ] Upload ID document
- [ ] Upload proof of address
- [ ] Upload or capture selfie
- [ ] Confirm OCR / document handling works as expected

#### Step 3: Dependants

- [ ] Add spouse if the case needs one
- [ ] Add child if the case needs one
- [ ] Confirm dependant details save correctly

#### Step 4: Medical History

- [ ] Complete the medical history section
- [ ] Include a realistic answer set where needed
- [ ] Confirm the step saves correctly

#### Step 5: Banking Details

- [ ] Enter bank name
- [ ] Enter account number
- [ ] Enter branch code
- [ ] Enter account holder name
- [ ] Select debit order day or collection method
- [ ] Confirm the step saves correctly

#### Step 6: Review & Submit

- [ ] Review all captured details
- [ ] Accept terms
- [ ] record voice verification
- [ ] capture digital signature
- [ ] set marketing / communication consent choices
- [ ] submit the application
- [ ] confirm success / submitted state appears

### 2B. Why We Use The Full 6 Steps

This is needed because approved applications feed the member record with:

- personal details
- documents and OCR data
- dependants
- medical history
- banking details
- voice verification
- signature
- POPIA / communication consent
- application tracking data

So for the funnel route, we should test the real process, not a shortened version.

### Application 1

- [ ] Create `DEMOAPP-001`
  - Applicant: `Lindiwe Mokoena`
  - ID Number: `9002150824087`
  - Plan: `VALUE PLUS PLAN`
  - Submit Date: `2026-05-28`
  - Intended outcome: clean approval

### Application 2

- [ ] Create `DEMOAPP-002`
  - Applicant: `Sipho Naidoo`
  - ID Number: `8604105476083`
  - Plan: `EXECUTIVE HOSPITAL PLAN`
  - Submit Date: `2026-05-28`
  - Intended outcome: call-centre review, then approval

### Application 3

- [ ] Create `DEMOAPP-003`
  - Applicant: `Amanda van Wyk`
  - ID Number: `9509210312085`
  - Plan: `VALUE PLUS PLAN`
  - Submit Date: `2026-05-28`
  - Intended outcome: pend or reject

### Validate Application Visibility

- [ ] Log in as onboarding and confirm all three applications are visible
- [ ] Log in as call-centre and confirm the applications can be found if that queue supports them
- [ ] Log in as admin and confirm applications can be reviewed there

### Call-Centre First Verification

- [ ] Log in as call-centre
- [ ] Open each submitted application
- [ ] Confirm the application has enough information for a verification call
- [ ] Verify the applicant details by phone-call workflow
- [ ] Click `Verify` or move the application into the verified-review state
- [ ] Confirm the application is now ready for admin review

### Admin Final Approval And Member Conversion

- [ ] Log in as admin
- [ ] Open the call-centre-verified application
- [ ] Confirm compliance items are present:
  - plan details
  - terms / wording
  - voice verification
  - signature
  - consent fields
- [ ] Approve the application
- [ ] Confirm the application converts into a member record

---

## 3. Manual New Member Route Through Broker / Call Centre

This route is for assisted onboarding where the member is not coming through the public funnel.

We should still treat it as a compliance-sensitive route.

### Broker-Assisted Manual Creation

- [ ] Log in as broker
- [ ] Check whether the broker flow supports creating or handing off a new member/application
- [ ] If it does, capture:
  - personal details
  - chosen plan
  - contact information
  - banking details if available
  - any notes or supporting information
- [ ] Confirm whether broker-created records appear in the admin/onboarding side

### Call-Centre-Assisted Manual Creation

- [ ] Log in as call-centre
- [ ] Check whether the call-centre flow supports assisted application or member setup
- [ ] If it does, capture:
  - personal details
  - member or applicant contact details
  - plan intent
  - banking details if available
  - verification notes
- [ ] Confirm whether the record appears in the right downstream queue

### Manual Route Compliance Check

For manual creation routes, confirm what evidence is captured and what is still missing:

- [ ] identity details
- [ ] dependant details if relevant
- [ ] banking details
- [ ] consent / terms confirmation
- [ ] voice verification or equivalent evidence
- [ ] document uploads or references

### Manual Route Outcome

- [ ] Confirm whether broker is currently a realistic source of new applications
- [ ] Confirm whether call-centre is currently a realistic source of new applications
- [ ] Note which route is more complete today

---

## 4. Approve Or Create Demo Members

We want these member records available for provider, claims, operations, and finance tests.

### Members Expected From Application Flow

- [ ] Approve `DEMOAPP-001` into `DEMO-MEMBER-001`
  - Full Name: `Lindiwe Mokoena`
  - Member Number: `DEMO100001`
  - Status: `active`
  - Plan: `DAY1 VALUE PLUS PLAN`
  - Start Date: `2026-05-29`
  - Payment Method: `retail debit order`

- [ ] Approve `DEMOAPP-002` into `DEMO-MEMBER-002`
  - Full Name: `Sipho Naidoo`
  - Member Number: `DEMO100002`
  - Status: `active`
  - Plan: `DAY1 EXECUTIVE PLAN`
  - Start Date: `2026-05-29`
  - Payment Method: `group debit order`

### Members That May Need Direct DB Setup

- [ ] Create or confirm `DEMO-MEMBER-003`
  - Full Name: `Amanda van Wyk`
  - Member Number: `DEMO100003`
  - Status: `suspended`
  - Plan: `DAY1 VALUE PLUS PLAN`
  - Start Date: `2026-05-29`
  - Payment Method: `EFT`
  - Main purpose: ineligible provider test

- [ ] Create or confirm `DEMO-MEMBER-004`
  - Full Name: `Kabelo Dlamini`
  - Member Number: `DEMO100004`
  - Status: `active`
  - Plan: `DAY1 PLATINUM OPTION 3`
  - Start Date: `2026-05-20`
  - Payment Method: `group debit order`
  - Main purpose: payment group / operations test

### Validate Member Visibility

- [ ] Log in as operations and confirm demo members are visible
- [ ] Confirm demo member statuses are stored correctly
- [ ] Confirm plan names display correctly

---

## 5. Create Demo Dependants If Supported

- [ ] Create `DEMODEP-001`
  - Linked Member: `DEMO-MEMBER-002`
  - Name: `Thandeka Naidoo`
  - Relationship: `spouse`
  - DOB: `1990-07-12`

- [ ] Create `DEMODEP-002`
  - Linked Member: `DEMO-MEMBER-002`
  - Name: `Aarya Naidoo`
  - Relationship: `child`
  - DOB: `2018-03-05`

- [ ] Confirm family/dependant view works where supported

---

## 6. Build Payment Group And Payment Scaffolding

This may need direct DB setup if the UI does not support full creation cleanly.

### Payment Group

- [ ] Create `DEMOGRP-001`
  - Group Name: `Demo Transport Services Pty Ltd`
  - Collection Method: `group debit order`
  - Setup Date: `2026-05-29`

### Link Members To Group

- [ ] Link `DEMO-MEMBER-002` to `DEMOGRP-001`
- [ ] Link `DEMO-MEMBER-004` to `DEMOGRP-001`

### Payment Status Markers

- [ ] Create or confirm `DEMOPAY-001`
  - Target: `DEMO-MEMBER-001`
  - Type: `retail debit order`
  - Due Date: `2026-06-01`
  - Status: `scheduled`
  - Amount: `R899`

- [ ] Create or confirm `DEMOPAY-002`
  - Target: `DEMOGRP-001`
  - Type: `group debit order`
  - Due Date: `2026-06-01`
  - Status: `pending`
  - Amount: `R4,320`

- [ ] Create or confirm `DEMOPAY-003`
  - Target: `DEMO-MEMBER-003`
  - Type: `EFT`
  - Due Date: `2026-06-01`
  - Status: `overdue`
  - Amount: `R699`

### Validate Payment / Group Visibility

- [ ] Log in as admin and confirm group setup is visible
- [ ] Log in as operations and confirm group/member visibility
- [ ] Log in as finance and confirm payment-related pages can see useful demo information

---

## 7. Run Provider Eligibility Setup

These checks should be done through the provider UI.

- [ ] Log in as `nxamalo@gmail.com / 223344`

- [ ] Check eligibility for `DEMO-MEMBER-001`
  - Expected: eligible

- [ ] Check eligibility for `DEMO-MEMBER-002`
  - Expected: eligible

- [ ] Check eligibility for `DEMO-MEMBER-003`
  - Expected: not eligible

- [ ] Confirm policy information is visible for active demo members

---

## 8. Submit Demo Claims Through The App

### Claim 1

- [ ] Submit `DEMOCLM-001`
  - Member: `DEMO-MEMBER-001`
  - Provider: `nxamalo@gmail.com`
  - Claim Type: `GP Consultation`
  - Service Date: `2026-05-30`
  - Amount: `R650`
  - Intended outcome: approved

### Claim 2

- [ ] Submit `DEMOCLM-002`
  - Member: `DEMO-MEMBER-002`
  - Provider: `nxamalo@gmail.com`
  - Claim Type: `Specialist Consultation`
  - Service Date: `2026-05-30`
  - Amount: `R1,450`
  - Intended outcome: pended

### Claim 3

- [ ] Submit `DEMOCLM-003`
  - Member: `DEMO-MEMBER-004`
  - Provider: `nxamalo@gmail.com`
  - Claim Type: `Pathology / Lab`
  - Service Date: `2026-05-31`
  - Amount: `R820`
  - Intended outcome: rejected

### Validate Provider View

- [ ] Open provider claims history
- [ ] Confirm claim records are visible or at least traceable

---

## 9. Submit Demo Pre-Auth Requests Through The App

### Preauth 1

- [ ] Submit `DEMOPA-001`
  - Member: `DEMO-MEMBER-002`
  - Service Type: `MRI Scan`
  - Request Date: `2026-05-30`
  - Estimated Cost: `R6,800`
  - Intended outcome: approved

### Preauth 2

- [ ] Submit `DEMOPA-002`
  - Member: `DEMO-MEMBER-001`
  - Service Type: `Minor Procedure`
  - Request Date: `2026-05-31`
  - Estimated Cost: `R2,400`
  - Intended outcome: rejected

### Validate Provider View

- [ ] Open provider pre-auth list
- [ ] Confirm requests are visible or traceable

---

## 10. Process Demo Claims As Claims Team

- [ ] Log in as `claims@day1main.com / claims123`

- [ ] Find `DEMOCLM-001`
  - Action: approve

- [ ] Find `DEMOCLM-002`
  - Action: pend

- [ ] Find `DEMOCLM-003`
  - Action: reject

- [ ] Confirm statuses save correctly

---

## 11. Process Demo Pre-Auths As Claims Team

- [ ] Find `DEMOPA-001`
  - Action: approve

- [ ] Find `DEMOPA-002`
  - Action: reject

- [ ] Confirm statuses save correctly

---

## 12. Cross-Role Visibility Checks

### Provider Side

- [ ] Log back in as provider
- [ ] Confirm claim outcomes are visible
- [ ] Confirm pre-auth outcomes are visible

### Operations Side

- [ ] Log in as operations
- [ ] Confirm demo members and group setup are visible

### Finance Side

- [ ] Log in as finance
- [ ] Confirm any payment-related demo records are visible or traceable

### Member Side

- [ ] Log in as member if useful
- [ ] Confirm at least one policy/payment-style view behaves as expected

---

## 13. Build Completion Check

- [ ] 3 demo applications created
- [ ] full 6-step application flow tested from the funnel
- [ ] broker manual route reviewed
- [ ] call-centre manual route reviewed
- [ ] 4 demo members available
- [ ] 2 demo dependants available if supported
- [ ] 1 demo payment group available
- [ ] 3 demo payment markers/statuses available
- [ ] 3 demo claims submitted
- [ ] 2 demo pre-auth requests submitted
- [ ] claims team processed demo work
- [ ] provider can see outcomes
- [ ] operations can see member/group effects
- [ ] finance can inspect payment-side demo data

---

## 14. Notes During Build

- Note 1:

- Note 2:

- Note 3:

---

## 15. Suggested Working Sequence

Use this exact order:

1. run the 6-step funnel application
2. review broker and call-centre manual entry routes
3. approve or create members
4. add dependants
5. add payment group and payment markers
6. run provider eligibility
7. submit claims
8. submit pre-auths
9. process claims
10. process pre-auths
11. check visibility across roles

That order gives us the least confusion and the cleanest demo story.
