# Day1 Demo Data Plan

This document defines the temporary 5-day demo environment for Day1.

For the actual step-by-step build sequence, use:

- [DAY1-DEMO-BUILD-CHECKLIST.md](E:/wind%20new/day1main/docs/DAY1-DEMO-BUILD-CHECKLIST.md)

For the actual setup sequence, use:

- [DAY1-DEMO-BUILD-CHECKLIST.md](E:/wind%20new/day1main/docs/DAY1-DEMO-BUILD-CHECKLIST.md)

The purpose is to make the system behave like a real working business for testing:

- real-looking members
- real-looking applications
- dated claims
- dated pre-authorizations
- payment setup and payment checks
- handoffs between departments

We are not just testing whether pages open.

We are testing whether the full Day1 operating model works.

## Demo Window

- Demo duration: `5 days`
- After the demo window: remove or archive all demo records
- All demo data must be clearly identifiable

## Demo Data Naming Rule

Every temporary demo record should be marked so we can clean it up later.

Recommended prefixes:

- Members: `DEMO-`
- Applications: `DEMOAPP-`
- Claims: `DEMOCLM-`
- Pre-auths: `DEMOPA-`
- Payment groups: `DEMOGRP-`

Recommended shared marker fields where possible:

- `demo_batch = 'DAY1-5DAY-UAT-2026-05'`
- `notes` or `comments` include `TEMP DEMO DATA`

If there is no dedicated marker column, store the marker in:

- reference number
- notes
- comments
- description

## Demo Goal

At the end of this demo we want to prove:

1. New business can enter the system
2. Applications can move through review and approval
3. Members can exist with valid policy data
4. Providers can check eligibility against live member records
5. Providers can submit claims and pre-auth requests
6. Claims team can receive and action those items
7. Operations can see and manage members/groups
8. Finance-facing payment information can be checked
9. Cross-role status changes appear correctly on each side

---

## 1. Demo Users

These users are already available and should be used during the demo:

- Admin: `admin@day1main.com / admin123`
- Onboarding: `onboarding@day1main.com / onboarding123`
- Call Centre: `callcentre@day1main.com / callcentre123`
- Claims: `claims@day1main.com / claims123`
- Operations: `operations@day1main.com / operations123`
- Provider primary: `nxamalo@gmail.com / 223344`
- Provider backup: `provider@day1main.com / provider123`
- Member: `member@day1main.com / member123`
- Broker: `broker@day1main.com / broker123`
- Marketing: `marketing@day1main.com / marketing123`
- Finance: `finance@day1main.com / finance123`
- Compliance: `compliance@day1main.com / compliance123`
- Ambulance Authorization: `ambu@out.com / ambu123`
- Africa Assist Authorization: `afri@out.com / afri123`

Authorization demo notes:

- `ambu@out.com` uses role `ambulance_operator`.
- `afri@out.com` uses role `africa_assist_authorization`.
- Both enter through the public **Authorizations** login tile.
- Ambulance users see the unified verification page as Ambulance Benefit Check.
- Africa Assist users see the unified verification page as Hospital Benefit Check plus GOP Intake.
- The authorization benefit check uses the secure role-limited member lookup flow.
- GOP submission is still a controlled demo action until it is wired into `hospital_claim_intakes` and the Hospital Claims scanner/review flow.

---

## 2. Demo Records To Create

We should create a small controlled set, not a huge random set.

### Applications To Create

Create `3` demo applications:

1. `DEMOAPP-001`
   - adult principal member
   - clean application
   - should be approved into a member

2. `DEMOAPP-002`
   - family application
   - should need call-centre review before approval

3. `DEMOAPP-003`
   - application with one issue
   - should be rejected or pended for missing information

### Members To Create

Create `3 to 5` demo members:

1. `DEMO-MEMBER-001`
   - active
   - valid plan
   - eligible for provider check

2. `DEMO-MEMBER-002`
   - active
   - family/dependants
   - useful for claims and pre-auth tests

3. `DEMO-MEMBER-003`
   - suspended or inactive
   - useful to prove ineligible behavior

4. `DEMO-MEMBER-004`
   - active
   - in payment group
   - useful for operations and finance checks

### Claims To Create

Create at least `3` demo claims:

1. `DEMOCLM-001`
   - submitted by provider
   - status: pending

2. `DEMOCLM-002`
   - submitted by provider
   - status: approved

3. `DEMOCLM-003`
   - submitted by provider
   - status: rejected or pended

### Pre-Auth Requests To Create

Create at least `2` demo pre-auth requests:

1. `DEMOPA-001`
   - submitted
   - awaiting claims review

2. `DEMOPA-002`
   - reviewed
   - approved or rejected

### Payment / Group Data To Create

Create at least:

- `1` demo payment group
- `2` demo members linked into that group if the schema supports it
- `1 or 2` payment history or payment status examples if supported by the app

---

## 2A. Exact Demo Record Pack

This is the exact starter pack I recommend.

These records are small enough to manage and rich enough to test the real system.

### Demo Applications

| Ref | Applicant Name | ID Number | Plan | Submit Date | Intended Outcome | Notes |
|---|---|---|---|---|---|---|
| DEMOAPP-001 | Lindiwe Mokoena | 9002150824087 | DAY1 VALUE PLUS PLAN | 2026-05-28 | approved into member | clean application |
| DEMOAPP-002 | Sipho Naidoo | 8604105476083 | DAY1 EXECUTIVE PLAN | 2026-05-28 | call-centre review then approve | family case |
| DEMOAPP-003 | Amanda van Wyk | 9509210312085 | DAY1 VALUE PLUS PLAN | 2026-05-28 | pend or reject | missing or inconsistent detail |

### Demo Members

| Demo Member Ref | Full Name | ID Number | Member Number | Plan | Status | Start Date | Payment Method | Main Test Use |
|---|---|---|---|---|---|---|---|---|
| DEMO-MEMBER-001 | Lindiwe Mokoena | 9002150824087 | DEMO100001 | DAY1 VALUE PLUS PLAN | active | 2026-05-29 | retail debit order | provider eligibility and claim |
| DEMO-MEMBER-002 | Sipho Naidoo | 8604105476083 | DEMO100002 | DAY1 EXECUTIVE PLAN | active | 2026-05-29 | group debit order | pre-auth and family workflow |
| DEMO-MEMBER-003 | Amanda van Wyk | 9509210312085 | DEMO100003 | DAY1 VALUE PLUS PLAN | suspended | 2026-05-29 | EFT | ineligible provider test |
| DEMO-MEMBER-004 | Kabelo Dlamini | 9208085643085 | DEMO100004 | DAY1 PLATINUM OPTION 3 | active | 2026-05-20 | group debit order | operations and payment group test |

### Demo Dependants

If dependants are supported in the current flow, create:

| Dependant Ref | Linked Member | Full Name | Relationship | Date of Birth | Main Test Use |
|---|---|---|---|---|---|
| DEMODEP-001 | DEMO-MEMBER-002 | Thandeka Naidoo | spouse | 1990-07-12 | family cover validation |
| DEMODEP-002 | DEMO-MEMBER-002 | Aarya Naidoo | child | 2018-03-05 | dependant eligibility view |

### Demo Claims

| Claim Ref | Member | Provider | Claim Type | Service Date | Submit Date | Initial Status | Final Intended Decision | Amount |
|---|---|---|---|---|---|---|---|---|
| DEMOCLM-001 | DEMO-MEMBER-001 | nxamalo@gmail.com | GP Consultation | 2026-05-30 | 2026-05-30 | submitted | approved | R650 |
| DEMOCLM-002 | DEMO-MEMBER-002 | nxamalo@gmail.com | Specialist Consultation | 2026-05-30 | 2026-05-30 | submitted | pended | R1,450 |
| DEMOCLM-003 | DEMO-MEMBER-004 | nxamalo@gmail.com | Pathology / Lab | 2026-05-31 | 2026-05-31 | submitted | rejected | R820 |

### Demo Pre-Authorizations

| Preauth Ref | Member | Provider | Service Type | Request Date | Initial Status | Final Intended Decision | Estimated Cost |
|---|---|---|---|---|---|---|---|
| DEMOPA-001 | DEMO-MEMBER-002 | nxamalo@gmail.com | MRI Scan | 2026-05-30 | submitted | approved | R6,800 |
| DEMOPA-002 | DEMO-MEMBER-001 | nxamalo@gmail.com | Minor Procedure | 2026-05-31 | submitted | rejected | R2,400 |

### Demo Payment Group

Based on the supported payment methods, create one demo group:

| Group Ref | Group Name | Collection Method | Setup Date | Members Linked | Main Test Use |
|---|---|---|---|---|---|
| DEMOGRP-001 | Demo Transport Services Pty Ltd | group debit order | 2026-05-29 | DEMO-MEMBER-002, DEMO-MEMBER-004 | admin group setup, operations visibility, finance checks |

### Demo Payment Status Examples

| Payment Ref | Member or Group | Payment Type | Due Date | Status | Amount | Main Test Use |
|---|---|---|---|---|---|---|
| DEMOPAY-001 | DEMO-MEMBER-001 | retail debit order | 2026-06-01 | scheduled | R899 | member and finance visibility |
| DEMOPAY-002 | DEMOGRP-001 | group debit order | 2026-06-01 | pending | R4,320 | group payment workflow |
| DEMOPAY-003 | DEMO-MEMBER-003 | EFT | 2026-06-01 | overdue | R699 | suspended / arrears style test |

---

## 3. Five-Day Demo Story

This is the simplest realistic story I suggest.

## Day 1: New Business Enters

### Create / Simulate

- `DEMOAPP-001`
- `DEMOAPP-002`
- `DEMOAPP-003`

### Departments Involved

- Public / Prospect
- Onboarding

### What We Must Prove

- main site works
- application entry works
- onboarding can see incoming applications

### Day 1 Checks

- [ ] Open main site
- [ ] Submit `DEMOAPP-001`
- [ ] Submit `DEMOAPP-002`
- [ ] Submit `DEMOAPP-003`
- [ ] Log in as onboarding
- [ ] Confirm all three applications appear
- [ ] Confirm the reference numbers or applicant names make them easy to trace

## Day 2: Review And Approval

### Actions

- Onboarding reviews all three
- Call-centre follows up on one
- Admin approves at least one and rejects or pends one

### Departments Involved

- Onboarding
- Call Centre
- Admin

### What We Must Prove

- applications move through statuses
- review notes or status changes persist
- approved application becomes a member record

### Day 2 Checks

- [ ] Open `DEMOAPP-001`
- [ ] Approve it into a member
- [ ] Confirm resulting member exists
- [ ] Open `DEMOAPP-002`
- [ ] Move it to review / under review
- [ ] Open `DEMOAPP-003`
- [ ] Reject it or pend it with reason
- [ ] Confirm `DEMO-MEMBER-001` and `DEMO-MEMBER-002` exist if approvals are completed

## Day 3: Provider Activity Starts

### Actions

- Use approved member(s) for provider testing
- Check eligibility
- Submit claims
- Submit pre-auth request

### Departments Involved

- Provider
- Claims

### What We Must Prove

- provider can find member
- provider sees member status and plan
- provider can submit claim
- provider can submit pre-auth

### Day 3 Checks

- [ ] Log in as provider
- [ ] Check eligibility for `DEMO-MEMBER-001`
- [ ] Confirm active plan and eligibility details show
- [ ] Check eligibility for `DEMO-MEMBER-003`
- [ ] Confirm suspended member shows as not eligible
- [ ] Submit `DEMOCLM-001`
- [ ] Submit `DEMOCLM-002`
- [ ] Submit `DEMOPA-001`

## Day 4: Claims Team Processes Work

### Actions

- Claims team reviews incoming claims and pre-auths
- One claim is approved
- One claim is pended or rejected
- Pre-auth is approved or rejected

### Departments Involved

- Claims
- Provider

### What We Must Prove

- claims queue receives provider items
- claim decisions persist
- provider can later see result

### Day 4 Checks

- [ ] Log in as claims
- [ ] Find `DEMOCLM-001`
- [ ] Approve, pend, or reject it
- [ ] Find `DEMOCLM-002`
- [ ] give a different decision
- [ ] Find `DEMOCLM-003`
- [ ] reject or pend it
- [ ] Find `DEMOPA-001`
- [ ] approve or reject it
- [ ] Find `DEMOPA-002` if it was created
- [ ] action it differently to the first pre-auth

## Day 5: Operations And Payment Validation

### Actions

- Operations checks member and group records
- Finance-related records are checked
- Provider or member views resulting records where applicable

### Departments Involved

- Operations
- Finance
- Provider
- Member

### What We Must Prove

- member data is visible and manageable
- payment grouping works if configured
- status changes are visible across roles

### Day 5 Checks

- [ ] Log in as operations
- [ ] Confirm approved demo members are visible
- [ ] Add or verify demo group setup
- [ ] Confirm demo members can be linked correctly
- [ ] Log in as finance
- [ ] Check payment-related pages for demo records
- [ ] Log in as provider
- [ ] Confirm claim/pre-auth status results are visible
- [ ] Log in as member if needed and confirm at least one member can see the expected policy/payment state

---

## 4. Recommended Demo Data Set

Use a small, believable data pack.

### Demo Member Set

| Demo ID | Purpose | Status | Plan | Used For |
|---|---|---|---|---|
| DEMO-MEMBER-001 | clean active member | active | value plus | eligibility, claim |
| DEMO-MEMBER-002 | family case | active | family/executive | pre-auth |
| DEMO-MEMBER-003 | ineligible test | inactive or suspended | any | eligibility failure |
| DEMO-MEMBER-004 | payment/group case | active | any valid plan | ops + finance |

### Demo Claim Set

| Claim Ref | Member | Provider | Starting Status | Final Test Use |
|---|---|---|---|---|
| DEMOCLM-001 | DEMO-MEMBER-001 | nxamalo@gmail.com | submitted | approve |
| DEMOCLM-002 | DEMO-MEMBER-002 | nxamalo@gmail.com | submitted | reject or pend |
| DEMOCLM-003 | DEMO-MEMBER-004 | nxamalo@gmail.com | already approved | visibility test |

### Demo Pre-Auth Set

| Preauth Ref | Member | Provider | Starting Status | Final Test Use |
|---|---|---|---|---|
| DEMOPA-001 | DEMO-MEMBER-002 | nxamalo@gmail.com | submitted | approve/reject |
| DEMOPA-002 | DEMO-MEMBER-001 | nxamalo@gmail.com | approved | visibility test |

---

## 5. Build Strategy

To keep this clean, we should use both app actions and controlled data setup.

### Seed Directly In DB

Use direct DB creation for:

- demo members
- demo dependants
- demo payment groups
- demo payment markers / statuses if the app supports them
- support records if they are painful to create manually
- baseline claims or pre-auths if needed for visibility testing

### Create Through The App

Use the app UI for:

- public applications
- application review
- eligibility checks
- live provider claim submission
- live provider pre-auth submission
- claims approval or rejection

That gives us:

- reliable starting data
- real workflow validation

---

## 6. Cleanup Plan After 5 Days

At the end of the demo window:

1. Search for all records containing:
   - `DEMO-`
   - `DEMOAPP-`
   - `DEMOCLM-`
   - `DEMOPA-`
   - `TEMP DEMO DATA`
   - `DAY1-5DAY-UAT-2026-05`

2. Export them first if needed

3. Delete demo-only records in the correct dependency order

Suggested order:

- pre-auth demo records
- claim demo records
- payment-group membership demo records
- payment demo records
- application demo records
- member demo records

4. Verify no demo records remain in:

- members
- claims
- pre-authorizations
- applications
- payment groups

---

## 7. What We Need To Do Next

### Step 1

Decide the minimum demo pack:

- `3 applications`
- `4 members`
- `3 claims`
- `2 pre-auths`
- `1 payment group`

This is my recommended minimum.

### Step 2

Prepare the exact demo identities:

- member names
- ID numbers
- member numbers
- plan names
- provider-linked cases

### Step 3

Seed the foundational records

### Step 4

Run the 5-day checklist through the app

### Step 5

Clean up after sign-off

---

## 8. Suggested Starting Decision

My suggestion is:

- keep the demo small and controlled
- build only enough records to exercise every core business flow
- avoid flooding the database with random fake data

Recommended first build:

- 3 applications
- 4 members
- 2 dependants
- 3 claims
- 2 pre-auths
- 1 payment group
- 3 payment markers or statuses

That is enough to make the system feel alive while staying easy to clean up.

---

## 9. Build Order

This is the order I recommend when we actually create the demo pack:

1. Create or confirm the three public applications
2. Approve the clean ones into real demo members
3. Insert any missing demo members directly if approval flow is too slow for setup
4. Create the demo payment group
5. Link the correct demo members to the group
6. Log in as provider and run eligibility on active and suspended demo members
7. Submit live demo claims
8. Submit live demo pre-auth requests
9. Log in as claims and process them
10. Check visibility from provider, operations, finance, and member side

## 10. What I Suggest We Do Next

The next practical step should be:

1. confirm these exact demo names, dates, and references
2. identify which records must be created through the app
3. identify which records should be inserted directly into the database
4. start building the pack in the correct order

My recommendation:

- create the 3 applications through the app
- create or supplement the 4 members directly if needed
- submit the claims and pre-auths through the app
- use direct DB only for the payment/group scaffolding if the UI is too slow or incomplete
