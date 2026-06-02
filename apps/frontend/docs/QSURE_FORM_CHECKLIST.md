# Qsure Integration Access Request Form - Completion Checklist

**Date:** April 29, 2026  
**Purpose:** Complete Qsure Integration Access Request Form to obtain API documentation and credentials  
**Form Source:** Provided by user (text format)  

---

## Form Sections & Required Information

### Section 1: Company Information

**Company Details:**
- [ ] **Company Name:** Day1Health
- [ ] **Registration Number:** [Your company registration number]
- [ ] **Physical Address:** [Your physical address]
- [ ] **Postal Address:** [Your postal address]
- [ ] **VAT Number:** [Your VAT number if applicable]

**Primary Contact:**
- [ ] **Full Name:** [Your full name]
- [ ] **Job Title:** [Your job title - e.g., CTO, Technical Director]
- [ ] **Email Address:** [Your email address]
- [ ] **Phone Number:** [Your phone number]
- [ ] **Mobile Number:** [Your mobile number]

**Technical Contact (if different):**
- [ ] **Full Name:** [Developer/Tech lead name]
- [ ] **Job Title:** [Job title - e.g., Lead Developer]
- [ ] **Email Address:** [Developer email]
- [ ] **Phone Number:** [Developer phone]

---

### Section 2: Integration Requirements

**Integration Type:**
- [x] **Collections API** - For collecting debit orders from members
- [x] **Disbursements API** - For paying providers and members
- [ ] **Reporting API** - For payment reports (optional)
- [ ] **Reconciliation API** - For payment reconciliation (optional)

**Integration Purpose:**
```
Day1Health is a medical insurance operating system managing ~4,700 members. 
We currently use Qsure for manual collections and need to automate:

1. INCOMING: Individual and group debit order collections from members
2. OUTGOING: EFT payments to healthcare providers and member refunds

Expected monthly volume:
- Collections: ~4,700 transactions (~R3.5M)
- Disbursements: ~500 transactions (~R2M)
```

**Current Qsure Usage:**
- [x] **Existing Qsure Client:** Yes
- [ ] **New Qsure Client:** No
- [ ] **Client Number:** [Your existing Qsure client number if known]

---

### Section 3: Technical Environment

**Hosting Platform:**
- [x] **Vercel** (Next.js deployment platform)
- [ ] **AWS**
- [ ] **Azure**
- [ ] **Google Cloud**
- [ ] **Other:** ___________

**Technology Stack:**
- [x] **Framework:** Next.js 14 (App Router)
- [x] **Language:** TypeScript 5.3.3
- [x] **Database:** Supabase (PostgreSQL)
- [x] **Runtime:** Node.js 18+
- [x] **Package Manager:** pnpm 8.15.0+

**API Integration Method:**
- [x] **REST API** (preferred)
- [ ] **SOAP API**
- [ ] **GraphQL**
- [ ] **Other:** ___________

**Authentication Preference:**
- [ ] **API Key**
- [ ] **OAuth 2.0**
- [ ] **JWT**
- [ ] **Other:** ___________ (will accept Qsure's standard method)

---

### Section 4: Integration Scope

**Collections (INCOMING):**

**Individual Debit Orders:**
- [x] **Number of Members:** ~4,200 (individual debit orders)
- [x] **Collection Frequency:** Monthly (various debit order days 1-31)
- [x] **Average Transaction Value:** R750
- [x] **Monthly Volume:** ~R3.15M

**Group Debit Orders:**
- [x] **Number of Groups:** 45 active payment groups
- [x] **Number of Members:** ~500 (group debit orders)
- [x] **Collection Frequency:** Monthly (agreed strike dates per group)
- [x] **Average Transaction Value:** R700
- [x] **Monthly Volume:** ~R350K

**Disbursements (OUTGOING):**

**Provider Payments:**
- [x] **Number of Providers:** ~1,900 healthcare providers
- [x] **Payment Frequency:** Weekly batches
- [x] **Average Transaction Value:** R3,500
- [x] **Monthly Volume:** ~R1.75M (500 transactions)

**Member Refunds:**
- [x] **Payment Frequency:** As needed (refund claims)
- [x] **Average Transaction Value:** R1,200
- [x] **Monthly Volume:** ~R250K (200 transactions)

---

### Section 5: Data Requirements

**Member Data Fields (Collections):**
- [x] Member number (unique identifier)
- [x] Full name
- [x] ID number
- [x] Bank name
- [x] Account number
- [x] Branch code
- [x] Account type (cheque/savings)
- [x] Debit order day (1-31)
- [x] Monthly premium amount

**Payee Data Fields (Disbursements):**
- [x] Payee name (provider/member)
- [x] Bank name
- [x] Account number
- [x] Branch code
- [x] Account type
- [x] Payment amount
- [x] Payment reference

**Required API Responses:**
- [x] Transaction ID (Qsure reference)
- [x] Transaction status (success/failed/pending)
- [x] Failure reason (if failed)
- [x] Processing date
- [x] Settlement date

---

### Section 6: Webhook Requirements

**Webhook Endpoints:**
- [x] **Payment Status Updates:** `https://[your-domain]/api/qsure/webhook/payment-status`
- [x] **Disbursement Status Updates:** `https://[your-domain]/api/qsure/webhook/disbursement-status`

**Webhook Security:**
- [x] **HTTPS Required:** Yes
- [x] **Signature Verification:** Yes (preferred)
- [x] **IP Whitelisting:** Yes (if required)

**Webhook Events Needed:**
- [x] Payment successful
- [x] Payment failed
- [x] Payment reversed
- [x] Disbursement processing
- [x] Disbursement completed
- [x] Disbursement failed

---

### Section 7: Testing Requirements

**UAT Environment:**
- [x] **UAT Access Required:** Yes
- [x] **Test Data Required:** Yes (10-20 test members)
- [x] **Testing Duration:** 2-4 weeks
- [x] **Go-Live Date:** Target: June 2026

**Testing Scope:**
- [x] Individual debit order submission
- [x] Group debit order submission
- [x] Payment status webhooks
- [x] Reconciliation API
- [x] Provider payment submission
- [x] Member refund submission
- [x] Disbursement status webhooks

---

### Section 8: Compliance & Security

**Data Protection:**
- [x] **POPIA Compliance:** Yes (South African data protection)
- [x] **PCI DSS:** Yes (payment card industry standards)
- [x] **Data Encryption:** Yes (HTTPS, encrypted storage)

**Security Measures:**
- [x] Environment variables for credentials (never committed to git)
- [x] Webhook signature verification
- [x] API rate limiting
- [x] Audit trail for all transactions
- [x] Row Level Security (RLS) on database

**Audit Requirements:**
- [x] Transaction logging
- [x] Error logging
- [x] API request/response logging
- [x] Reconciliation reports

---

### Section 9: Support & SLA

**Support Requirements:**
- [x] **Technical Support:** Email + Phone
- [x] **Business Hours Support:** 8:00 AM - 5:00 PM SAST
- [x] **After Hours Support:** Critical issues only
- [x] **Response Time SLA:** < 4 hours for critical issues

**Escalation Contacts:**
- [ ] **Primary:** [Your name and contact]
- [ ] **Secondary:** [Backup contact]
- [ ] **Technical:** [Developer contact]

---

### Section 10: Additional Information

**Integration Timeline:**
```
Phase 1: API Access Setup (2 weeks)
- Receive API documentation
- Receive UAT credentials
- Set up development environment

Phase 2: UAT Implementation (3 weeks)
- Implement collections API
- Implement disbursements API
- Implement webhooks
- Test all scenarios

Phase 3: UAT Testing (2 weeks)
- Test with sample data
- Verify payment flows
- Test failure scenarios
- Reconciliation testing

Phase 4: Production Deployment (2 weeks)
- Soft launch (20 members)
- Gradual rollout (100, 500, all)
- Monitor and optimize

Total Timeline: ~9 weeks (Target: June 2026)
```

**Special Requirements:**
```
1. Exclude Plus1Rewards members (broker_code = 'POR') from Qsure collections
2. Exclude EFT payments (manual processing) from Qsure collections
3. Support for group debit orders with flexible strike dates
4. Real-time payment status updates via webhooks
5. Batch payment processing for provider disbursements
```

**Questions for Qsure:**
```
1. What is the API authentication method? (API Key, OAuth, JWT)
2. What is the webhook signature algorithm? (HMAC-SHA256, etc.)
3. What is the API rate limit? (requests per minute/hour)
4. What is the payment processing timeline? (same day, next day, T+2)
5. What is the reconciliation file format? (CSV, JSON, XML)
6. What is the support SLA for API issues?
7. Are there any setup fees or transaction fees for API usage?
8. What is the UAT environment URL and how do we access it?
```

---

## Submission Checklist

Before submitting the form:

- [ ] All company information completed
- [ ] All contact details verified
- [ ] Integration requirements clearly stated
- [ ] Technical environment details provided
- [ ] Integration scope defined with volumes
- [ ] Data requirements specified
- [ ] Webhook endpoints planned
- [ ] Testing requirements outlined
- [ ] Compliance measures confirmed
- [ ] Support requirements stated
- [ ] Timeline provided
- [ ] Questions for Qsure listed

**Submission Method:**
- [ ] Email to: api-support@qsure.co.za
- [ ] Subject: "Day1Health - API Integration Request"
- [ ] Attach: This completed form (PDF or Word)
- [ ] CC: [Your internal stakeholders]

**Expected Response Time:** 3-5 business days

---

## Post-Submission Actions

After submitting the form:

1. [ ] Save confirmation email from Qsure
2. [ ] Create calendar reminder to follow up (5 business days)
3. [ ] Prepare development environment for API integration
4. [ ] Review existing payment infrastructure (database tables)
5. [ ] Create API client library skeleton (`src/lib/qsure-api.ts`)
6. [ ] Set up environment variables structure
7. [ ] Create webhook endpoint skeletons
8. [ ] Document API integration plan

---

## Notes

- **Existing Qsure Client:** Day1Health is already using Qsure for manual collections
- **No New Tables Needed:** All payment infrastructure exists in database
- **Qsure Fields Added:** Migration applied to `claim_payments` and `payment_batches` tables
- **Demo Data Safe:** 2,334 members are demo data, safe for testing
- **Tech Stack:** Vercel + Supabase + Next.js 14 + TypeScript

---

**Document Status:** ✅ Ready for completion and submission  
**Created:** April 29, 2026  
**Next Action:** Complete form and email to api-support@qsure.co.za
