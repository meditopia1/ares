# Day1 UAT Checklist

This is the practical test checklist for the Day1 system.

For the full 5-day demo setup with dated test records, use:

- [DAY1-DEMO-DATA-PLAN.md](E:/wind%20new/day1main/docs/DAY1-DEMO-DATA-PLAN.md)

The goal is simple:

- open the real pages people use every day
- log in with the correct role
- do the real action
- mark it done when it works
- note anything broken so we know what still needs attention

## How To Use This File

- Use `[ ]` for not tested yet
- Change to `[x]` when the test passes
- If something fails, leave it unchecked and write a short note under it

Example:

```md
- [x] Login works
- [ ] Claim submits correctly
  - Note: save button does nothing after upload
```

## Test Accounts

- Admin: `admin@day1main.com / admin123`
- Onboarding: `onboarding@day1main.com / onboarding123`
- Call Centre: `callcentre@day1main.com / callcentre123`
- Claims: `claims@day1main.com / claims123`
- Operations: `operations@day1main.com / operations123`
- Provider test user: `nxamalo@gmail.com / 223344`
- Provider generic: `provider@day1main.com / provider123`
- Member: `member@day1main.com / member123`
- Broker: `broker@day1main.com / broker123`
- Marketing: `marketing@day1main.com / marketing123`
- Finance: `finance@day1main.com / finance123`
- Compliance: `compliance@day1main.com / compliance123`

## Important Notes

- The backend is already connected to the self-hosted Supabase server.
- Provider payments are still partly mock/static, so treat that section as partial until proven otherwise.
- Admin dashboard is in a good place now.
- Provider eligibility is working and shows real member/policy data.

---

## 1. Quick Smoke Test

### Main Site

- [ ] Open `http://localhost:3001`
  - Expected: the Day1 homepage opens

- [ ] Click one department tile from the homepage
  - Expected: you go to the login page

---

## 2. Admin Daily Flow

### Admin Login

- [ ] Open `http://localhost:3001/login`
- [ ] Log in with `admin@day1main.com / admin123`
  - Expected: admin dashboard opens

### Admin Dashboard

- [ ] Check that the dashboard stats load
  - Expected: cards and counts show normally

### Member Applications

- [ ] Click `Member Applications`
  - Expected: page opens normally without the old blocking loader

- [ ] Open one application if any exist
  - Expected: detail page opens

- [ ] If an application exists, test approve or reject flow
  - Expected: status updates and saves

### Policy Creator

- [ ] Click `Policy Creator`
  - Expected: page opens normally

- [ ] Confirm only the first 3 policies load at first
  - Expected: lighter first load

- [ ] Click `Load 3 More Policies`
  - Expected: next batch loads

### Brokers

- [ ] Click `Brokers`
  - Expected: page opens normally

- [ ] If editing is available, test one broker update
  - Expected: save works and data persists

### Group Setup

- [ ] Click `Group Setup`
  - Expected: page opens normally

- [ ] If available, create or edit one group
  - Expected: save works and data persists

---

## 3. Onboarding Daily Flow

### Onboarding Login

- [ ] Log out of admin
- [ ] Log in with `onboarding@day1main.com / onboarding123`
  - Expected: onboarding dashboard opens

### New Applications

- [ ] Click `New Applications`
  - Expected: queue opens or empty state is shown clearly

- [ ] If a real application exists, open it
  - Expected: application detail opens

---

## 4. Call Centre Daily Flow

### Call Centre Login

- [ ] Log out of onboarding
- [ ] Log in with `callcentre@day1main.com / callcentre123`
  - Expected: call-centre dashboard opens

### Member Support

- [ ] Click `Member Support`
  - Expected: normal page opens immediately, content loads inside the page

- [ ] If an application exists, open it from support
  - Expected: detail page opens

- [ ] If workflow is available, move one application to `under_review`
  - Expected: status updates and queue refreshes

### Member Lookup

- [ ] Click `Member Lookup`
  - Expected: lookup page opens

- [ ] Search for `van dyk`
  - Expected: matching members appear

### Tickets

- [ ] Click `Tickets`
  - Expected: normal page opens immediately, content loads inside the page

### Knowledge Base

- [ ] Click `Knowledge Base`
  - Expected: page opens and guidance content is visible

---

## 5. Provider Daily Flow

### Provider Login

- [ ] Log out of call-centre
- [ ] Log in with `nxamalo@gmail.com / 223344`
  - Expected: provider dashboard opens

### Check Eligibility

- [ ] Click `Check Eligibility`
  - Expected: eligibility page opens

- [ ] Search using:
  - Member Number: `DAY17053542`
  - ID Number: `103155085089`
  - Expected: member details and plan details load and show `Eligible`

### Submit Claim

- [ ] Click `Submit Claim`
  - Expected: claim form opens normally

- [ ] Complete and submit one test claim if safe to do so
  - Expected: claim record is created

- [ ] Go to `Claims History`
  - Expected: submitted claim is visible or at least the page loads correctly

### Pre-Authorization

- [ ] Click `Pre-Authorization`
  - Expected: pre-auth list page opens

- [ ] Click to submit a new pre-auth
  - Expected: submit page opens

- [ ] Submit one pre-auth request if safe to do so
  - Expected: request is created and listed

### Payments

- [ ] Click `Payments`
  - Expected: page opens

- [ ] Confirm whether data is real or still mock/static
  - Expected: note result clearly

---

## 6. Claims Team Daily Flow

### Claims Login

- [ ] Log out of provider
- [ ] Log in with `claims@day1main.com / claims123`
  - Expected: claims dashboard opens

### Claims Queue

- [ ] Click `Claims Queue`
  - Expected: queue opens

- [ ] If provider submitted a claim, find it
  - Expected: claim is visible

- [ ] Approve, pend, or reject a claim if safe to do so
  - Expected: status updates correctly

### Pre-Auth Queue

- [ ] Click `Pre-Auth Queue`
  - Expected: queue opens

- [ ] If provider submitted a pre-auth, find it
  - Expected: request is visible

- [ ] Approve or reject one request if safe to do so
  - Expected: status updates correctly

### Fraud Cases

- [ ] Click `Fraud Cases`
  - Expected: page opens without errors

---

## 7. Operations Daily Flow

### Operations Login

- [ ] Log out of claims
- [ ] Log in with `operations@day1main.com / operations123`
  - Expected: operations dashboard opens

### Manage Members

- [ ] Click `Manage Members`
  - Expected: members page opens

- [ ] Search/filter for a member
  - Expected: filters work

- [ ] If safe, edit one member
  - Expected: changes save

### Manage Groups

- [ ] Click `Manage Groups`
  - Expected: group page opens

- [ ] Confirm page works without `employee_number`
  - Expected: no employee number dependency appears

### Debit Orders / Claims Oversight / Providers Directory

- [ ] Open `Debit Orders`
  - Expected: page opens

- [ ] Open `Claims Oversight`
  - Expected: page opens

- [ ] Open `Providers Directory`
  - Expected: page opens

---

## 8. Member Daily Flow

### Member Login

- [ ] Log out of operations
- [ ] Log in with `member@day1main.com / member123`
  - Expected: member dashboard opens

### Member Checks

- [ ] Open member policies
  - Expected: policies show

- [ ] Open member claims
  - Expected: claims page opens

- [ ] Open member payments
  - Expected: payments page opens

- [ ] Open member documents
  - Expected: documents page opens

---

## 9. Broker Daily Flow

### Broker Login

- [ ] Log out of member
- [ ] Log in with `broker@day1main.com / broker123`
  - Expected: broker dashboard opens

### Broker Checks

- [ ] Open leads
  - Expected: leads page opens

- [ ] Open quote flow if present
  - Expected: quote process opens

- [ ] Open policies view if present
  - Expected: policies page opens

---

## 10. Marketing Daily Flow

### Marketing Login

- [ ] Log out of broker
- [ ] Log in with `marketing@day1main.com / marketing123`
  - Expected: marketing dashboard opens

### Marketing Checks

- [ ] Open dashboard metrics
  - Expected: page opens and shows data or clear empty state

- [ ] Open leads
  - Expected: leads page opens

- [ ] Create a campaign if safe to test
  - Expected: campaign saves

---

## 11. Finance Daily Flow

### Finance Login

- [ ] Log out of marketing
- [ ] Log in with `finance@day1main.com / finance123`
  - Expected: finance dashboard opens

### Finance Checks

- [ ] Open ledger
  - Expected: page opens

- [ ] Open reconciliation
  - Expected: page opens

- [ ] Open payment batches
  - Expected: page opens and workflow is understandable

---

## 12. Compliance Daily Flow

### Compliance Login

- [ ] Log out of finance
- [ ] Log in with `compliance@day1main.com / compliance123`
  - Expected: compliance dashboard opens

### Compliance Checks

- [ ] Open POPIA or data request tools if present
  - Expected: page opens

- [ ] Open fraud / risk tools if present
  - Expected: page opens

---

## 13. End-To-End High Value Flows

These are the flows that really tell us whether the system is ready.

### Flow A: Public Application To Approved Member

- [ ] Open main public site
- [ ] Start a lead or application
- [ ] Submit the application
- [ ] Log in as onboarding and confirm it appears
- [ ] Log in as call-centre and confirm it can be reviewed
- [ ] Log in as admin and approve it
- [ ] Confirm a member record is created

### Flow B: Provider Claim End To End

- [ ] Log in as provider
- [ ] Check member eligibility
- [ ] Submit a claim
- [ ] Log in as claims
- [ ] Review the claim
- [ ] Approve, reject, or pend it
- [ ] Confirm provider can see the outcome

### Flow C: Provider Pre-Auth End To End

- [ ] Log in as provider
- [ ] Check eligibility
- [ ] Submit pre-auth request
- [ ] Log in as claims
- [ ] Review the request
- [ ] Approve or reject it
- [ ] Confirm provider can see the outcome

---

## 14. Defect Log

Use this section while testing.

| ID | Page / Flow | Role Used | What You Did | Expected | Actual | Status |
|---|---|---|---|---|---|---|
| D-001 |  |  |  |  |  | Open |
| D-002 |  |  |  |  |  | Open |
| D-003 |  |  |  |  |  | Open |

---

## 15. Sign-Off Snapshot

Update this as we go.

- Admin daily work: `[ ]`
- Onboarding daily work: `[ ]`
- Call-centre daily work: `[ ]`
- Provider daily work: `[ ]`
- Claims daily work: `[ ]`
- Operations daily work: `[ ]`
- Member daily work: `[ ]`
- Broker daily work: `[ ]`
- Marketing daily work: `[ ]`
- Finance daily work: `[ ]`
- Compliance daily work: `[ ]`
- Public onboarding flow: `[ ]`
- Provider claim flow end-to-end: `[ ]`
- Provider pre-auth flow end-to-end: `[ ]`

## Current Overall View

- Ready for controlled testing: `[x]`
- Ready for business UAT: `[ ]`
- Ready for go-live decision: `[ ]`
