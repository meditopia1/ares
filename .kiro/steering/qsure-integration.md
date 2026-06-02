---
title: Qsure Collections API Integration
description: Complete guide for integrating Qsure payment collections and disbursements API with Day1Health
inclusion: auto
tags: [qsure, payments, collections, api, integration]
---

# Qsure Collections API Integration

**Last Updated:** April 29, 2026  
**Status:** 🟡 Planning Phase - Awaiting API Documentation  
**Integration Partner:** Qsure (api-support@qsure.co.za)  

## Overview

Day1Health is integrating with Qsure's Collections API to automate payment processing for ~4,700 members. Qsure will handle BOTH incoming collections (member debit orders) AND outgoing disbursements (provider/member payments).

**Current State:** Manual collections via Qsure portal  
**Target State:** Fully automated API-driven payment processing  

## Integration Scope

### INCOMING: Collections FROM Members

**1. Individual Debit Orders**
- Members with `collection_method = 'debit_order'` AND `payment_group_id IS NULL`
- Monthly collections on member-specific debit order day
- Direct bank account debit
- Real-time status updates via API

**2. Group Debit Orders**
- Members with `payment_group_id IS NOT NULL`
- Batch collections on agreed strike dates (stored in `payment_groups.collection_dates` JSONB)
- Company-level debit order agreements
- 45 payment groups currently active

**Exclusions:**
- ❌ Plus1Rewards members (`broker_code = 'POR'`) - handled by Plus1Rewards system
- ❌ EFT payments (`collection_method = 'eft'`) - manual, tracked in `eft_payment_notifications`

### OUTGOING: Payments TO Providers/Members

**1. Provider Claim Payments**
- Approved claims paid to healthcare providers
- Batch payments via `payment_batches` table
- EFT to provider bank accounts
- Payment tracking and reconciliation

**2. Member Refund Payments**
- Refund claims paid to members
- Individual payments via `claim_payments` table
- EFT to member bank accounts
- Refund request tracking

## Database Schema (VERIFIED)

### Existing Tables - NO NEW TABLES NEEDED

**INCOMING Payments (Collections FROM Members):**

**`payment_history`** - Individual member payments
```sql
-- Key columns (verified):
id UUID PRIMARY KEY
member_id UUID REFERENCES members(id)
amount DECIMAL(10,2)
payment_date DATE
status TEXT -- pending, successful, failed, reversed
payment_method TEXT -- debit_order, eft, cash
qsure_transaction_id TEXT -- ✅ Already exists
netcash_transaction_id TEXT -- Legacy field
source TEXT -- qsure, netcash, manual
reference_number TEXT
failure_reason TEXT
created_at TIMESTAMP
updated_at TIMESTAMP
```

**`payment_groups`** - Group debit order companies
```sql
-- Key columns (verified):
id UUID PRIMARY KEY
group_name TEXT -- Company name
group_code TEXT -- Unique identifier
collection_dates JSONB -- Array of agreed strike dates
status TEXT -- active, inactive
created_at TIMESTAMP
-- 45 rows currently
```

**`group_payment_history`** - Group payment transactions
```sql
-- Key columns (verified):
id UUID PRIMARY KEY
payment_group_id UUID REFERENCES payment_groups(id)
collection_date DATE
total_amount DECIMAL(10,2)
successful_count INTEGER
failed_count INTEGER
status TEXT
qsure_batch_id TEXT
created_at TIMESTAMP
```

**`group_member_payments`** - Individual payments within group
```sql
-- Key columns (verified):
id UUID PRIMARY KEY
group_payment_id UUID REFERENCES group_payment_history(id)
member_id UUID REFERENCES members(id)
amount DECIMAL(10,2)
status TEXT
qsure_transaction_id TEXT
created_at TIMESTAMP
```

**OUTGOING Payments (Payments TO Providers/Members):**

**`claim_payments`** - Individual claim payments
```sql
-- Key columns (verified + new Qsure fields):
id UUID PRIMARY KEY
claim_id UUID REFERENCES claims(id)
payee_type TEXT -- provider, member
payee_id UUID -- provider_id or member_id
amount DECIMAL(10,2)
payment_method TEXT -- eft, cheque
bank_name TEXT
account_number TEXT
branch_code TEXT
account_type TEXT
status TEXT -- pending, processing, paid, failed
payment_date DATE
reference_number TEXT
qsure_payment_id TEXT -- ✅ NEW (added 2026-04-29)
qsure_batch_reference TEXT -- ✅ NEW
qsure_response JSONB -- ✅ NEW
qsure_status TEXT -- ✅ NEW
created_at TIMESTAMP
updated_at TIMESTAMP
```

**`payment_batches`** - Batch payments to providers
```sql
-- Key columns (verified + new Qsure fields):
id UUID PRIMARY KEY
batch_number TEXT -- Unique batch identifier
batch_date DATE
total_amount DECIMAL(10,2)
payment_count INTEGER
status TEXT -- pending, approved, processing, completed, failed
approved_by UUID REFERENCES users(id)
approved_at TIMESTAMP
qsure_batch_id TEXT -- ✅ NEW (added 2026-04-29)
qsure_batch_reference TEXT -- ✅ NEW
qsure_submitted_at TIMESTAMP -- ✅ NEW
qsure_response JSONB -- ✅ NEW
created_at TIMESTAMP
updated_at TIMESTAMP
```

**Supporting Tables:**

**`payment_reconciliations`** - Reconciliation records
```sql
-- Key columns (verified):
id UUID PRIMARY KEY
reconciliation_date DATE
total_expected DECIMAL(10,2)
total_received DECIMAL(10,2)
discrepancy_amount DECIMAL(10,2)
status TEXT
notes TEXT
created_at TIMESTAMP
```

**`payment_discrepancies`** - Discrepancy tracking
```sql
-- Key columns (verified):
id UUID PRIMARY KEY
reconciliation_id UUID REFERENCES payment_reconciliations(id)
member_id UUID REFERENCES members(id)
expected_amount DECIMAL(10,2)
received_amount DECIMAL(10,2)
discrepancy_amount DECIMAL(10,2)
reason TEXT
resolved BOOLEAN
created_at TIMESTAMP
```

**`eft_payment_notifications`** - Manual EFT tracking
```sql
-- Key columns (verified):
id UUID PRIMARY KEY
member_id UUID REFERENCES members(id)
amount DECIMAL(10,2)
payment_date DATE
reference_number TEXT
proof_of_payment_url TEXT
status TEXT
verified_by UUID
verified_at TIMESTAMP
created_at TIMESTAMP
```

**`members`** - Member records with debit order details
```sql
-- Key debit order columns (verified):
id UUID PRIMARY KEY
member_number TEXT
collection_method TEXT -- debit_order, eft
payment_group_id UUID REFERENCES payment_groups(id) -- NULL for individual
bank_name TEXT
account_number TEXT
branch_code TEXT
account_type TEXT
account_holder_name TEXT
debit_order_day INTEGER -- 1-31 for individual debit orders
debit_order_status TEXT -- active, suspended, cancelled
monthly_premium DECIMAL(10,2)
broker_code TEXT -- 'POR' = Plus1Rewards (exclude from Qsure)
status TEXT -- active, suspended, cancelled
-- 2,334 rows (demo data)
```

## API Integration Architecture

### Technology Stack

**Hosting:** Vercel (Next.js deployment)  
**Database:** Supabase (PostgreSQL with RLS)  
**Framework:** Next.js 14 (App Router)  
**Language:** TypeScript 5.3.3 (strict mode)  
**API Routes:** `src/app/api/` (Next.js App Router convention)  

### API Endpoints to Create

**INCOMING Collections:**

1. **`POST /api/qsure/submit-debit-orders`**
   - Submit individual debit orders to Qsure
   - Query members: `collection_method = 'debit_order'` AND `payment_group_id IS NULL` AND `broker_code != 'POR'`
   - Filter by `debit_order_day` matching current date
   - Create Qsure API request with member bank details
   - Store `qsure_transaction_id` in `payment_history`

2. **`POST /api/qsure/submit-group-debit-orders`**
   - Submit group debit orders to Qsure
   - Query payment groups with collection date matching today
   - Get all members in group: `payment_group_id = [group_id]` AND `broker_code != 'POR'`
   - Create batch Qsure API request
   - Store `qsure_batch_id` in `group_payment_history`

3. **`POST /api/qsure/webhook/payment-status`**
   - Receive payment status updates from Qsure
   - Update `payment_history.status` based on Qsure response
   - Handle: successful, failed, reversed
   - Store failure reasons
   - Trigger notifications to members

4. **`GET /api/qsure/reconcile-payments`**
   - Fetch payment results from Qsure API
   - Compare with expected payments
   - Create `payment_reconciliations` record
   - Flag discrepancies in `payment_discrepancies`

**OUTGOING Disbursements:**

5. **`POST /api/qsure/submit-claim-payments`**
   - Submit approved claim payments to Qsure
   - Query `claim_payments`: `status = 'pending'` AND `payment_method = 'eft'`
   - Create Qsure payment request with payee bank details
   - Store `qsure_payment_id` in `claim_payments`

6. **`POST /api/qsure/submit-payment-batch`**
   - Submit payment batch to Qsure
   - Query `payment_batches`: `status = 'approved'`
   - Get all payments in batch from `claim_payments`
   - Create batch Qsure API request
   - Store `qsure_batch_id` in `payment_batches`

7. **`POST /api/qsure/webhook/disbursement-status`**
   - Receive disbursement status updates from Qsure
   - Update `claim_payments.status` based on Qsure response
   - Update `payment_batches.status` for batch payments
   - Handle: processing, paid, failed
   - Trigger notifications to providers/members

### Cron Jobs (Vercel Cron)

**Daily Collections:**
```typescript
// /api/cron/qsure-daily-collections
// Schedule: Daily at 6:00 AM SAST
// 1. Check debit_order_day matching today
// 2. Submit individual debit orders to Qsure
// 3. Check group collection dates matching today
// 4. Submit group debit orders to Qsure
```

**Daily Reconciliation:**
```typescript
// /api/cron/qsure-daily-reconciliation
// Schedule: Daily at 8:00 PM SAST
// 1. Fetch payment results from Qsure
// 2. Compare with expected payments
// 3. Create reconciliation records
// 4. Flag discrepancies
// 5. Send reconciliation report to finance team
```

**Weekly Payment Batch:**
```typescript
// /api/cron/qsure-weekly-disbursements
// Schedule: Every Friday at 10:00 AM SAST
// 1. Query approved payment batches
// 2. Submit to Qsure for processing
// 3. Update batch status
// 4. Send confirmation to finance team
```

## Integration Workflow

### Phase 1: API Access Setup (CURRENT)

**Status:** 🟡 Awaiting API Documentation

**Steps:**
1. ✅ Complete Qsure Integration Access Request Form
2. ⬜ Email form to api-support@qsure.co.za
3. ⬜ Receive API documentation (PDF/online)
4. ⬜ Receive UAT credentials (test environment)
5. ⬜ Receive production credentials

**Required Information:**
- Company: Day1Health
- Contact: [Your Name]
- Email: [Your Email]
- Phone: [Your Phone]
- Integration Type: Collections API + Disbursements API
- Tech Stack: Vercel, Supabase, Next.js 14, TypeScript
- Expected Volume: ~4,700 members, ~R3.5M monthly collections

### Phase 2: UAT Environment Setup

**Steps:**
1. Create Qsure API client library (`src/lib/qsure-api.ts`)
2. Configure UAT credentials in environment variables
3. Implement authentication (API key, OAuth, etc.)
4. Test API connectivity
5. Implement error handling and retry logic

### Phase 3: INCOMING Collections Implementation

**Steps:**
1. Create individual debit order submission API
2. Create group debit order submission API
3. Implement webhook for payment status updates
4. Create reconciliation API
5. Test with UAT data
6. Verify payment status updates
7. Test failure scenarios

### Phase 4: OUTGOING Disbursements Implementation

**Steps:**
1. Create claim payment submission API
2. Create payment batch submission API
3. Implement webhook for disbursement status updates
4. Test with UAT data
5. Verify payment status updates
6. Test failure scenarios

### Phase 5: Cron Jobs & Automation

**Steps:**
1. Create daily collections cron job
2. Create daily reconciliation cron job
3. Create weekly disbursements cron job
4. Configure Vercel cron schedules
5. Test cron job execution
6. Monitor cron job logs

### Phase 6: Production Deployment

**Steps:**
1. Configure production credentials
2. Deploy to Vercel production
3. Test with small batch (10-20 members)
4. Monitor for 1 week
5. Gradually increase batch size
6. Full rollout to all members

### Phase 7: Monitoring & Optimization

**Steps:**
1. Set up payment success rate monitoring
2. Set up failure rate alerts
3. Create reconciliation dashboard
4. Optimize API performance
5. Implement retry logic for failed payments
6. Create payment analytics reports

## Environment Variables

```bash
# Qsure API Configuration
QSURE_API_URL=https://api.qsure.co.za/v1
QSURE_API_KEY=your_api_key_here
QSURE_CLIENT_ID=your_client_id_here
QSURE_CLIENT_SECRET=your_client_secret_here

# Qsure UAT Environment (for testing)
QSURE_UAT_API_URL=https://uat-api.qsure.co.za/v1
QSURE_UAT_API_KEY=your_uat_api_key_here

# Webhook Security
QSURE_WEBHOOK_SECRET=your_webhook_secret_here

# Cron Job Security
CRON_SECRET=your_cron_secret_here
```

## Security Considerations

1. **API Authentication:** Store Qsure credentials in Vercel environment variables (never commit to git)
2. **Webhook Validation:** Verify webhook signatures to prevent spoofing
3. **Data Encryption:** Use HTTPS for all API calls
4. **PCI Compliance:** Never store full bank account numbers in logs
5. **Access Control:** Use Supabase RLS policies for payment data
6. **Audit Trail:** Log all payment transactions for compliance

## Error Handling

**Payment Failures:**
- Store failure reason in `payment_history.failure_reason`
- Update member status if multiple failures (suspend debit order)
- Send notification to member and call centre
- Create manual follow-up task

**API Failures:**
- Implement exponential backoff retry logic
- Log all API errors for debugging
- Send alert to tech team if API unavailable
- Fallback to manual processing if critical

**Reconciliation Discrepancies:**
- Flag in `payment_discrepancies` table
- Send alert to finance team
- Create manual review task
- Track resolution status

## Testing Strategy

**UAT Testing:**
1. Test individual debit order submission (10 test members)
2. Test group debit order submission (1 test group)
3. Test payment status webhook (success, failure, reversed)
4. Test reconciliation API
5. Test claim payment submission (5 test payments)
6. Test payment batch submission (1 test batch)
7. Test disbursement status webhook

**Production Testing:**
1. Soft launch with 20 members (1 week)
2. Expand to 100 members (1 week)
3. Expand to 500 members (1 week)
4. Full rollout to all members

## Success Metrics

**Collections:**
- Payment success rate > 95%
- Failed payment resolution < 48 hours
- Reconciliation accuracy > 99%
- Zero duplicate payments

**Disbursements:**
- Payment processing time < 3 business days
- Payment success rate > 98%
- Zero payment errors
- Accurate payment tracking

## Monitoring & Alerts

**Daily Monitoring:**
- Payment success rate
- Failed payment count
- Reconciliation discrepancies
- API response times
- Webhook delivery success

**Alerts:**
- Payment success rate < 90% (critical)
- API unavailable > 5 minutes (critical)
- Reconciliation discrepancy > R10,000 (high)
- Failed payment count > 50 (medium)

## Support & Escalation

**Qsure Support:**
- Email: api-support@qsure.co.za
- Phone: [To be provided]
- SLA: [To be confirmed]

**Internal Escalation:**
- Tech issues: Development team
- Payment issues: Finance team
- Member issues: Call centre team

## Next Steps

1. ✅ Complete Qsure Integration Access Request Form
2. ⬜ Email form to api-support@qsure.co.za with subject: "Day1Health - API Integration Request"
3. ⬜ Wait for API documentation and UAT credentials
4. ⬜ Review API documentation thoroughly
5. ⬜ Create detailed technical specification
6. ⬜ Begin Phase 2: UAT Environment Setup

## References

- Qsure Integration Access Request Form: `apps/frontend/docs/QSURE_FORM_CHECKLIST.md`
- Email Template: `apps/frontend/docs/QSURE_API_REQUEST_EMAIL.txt`
- Database Schema: Verified via Supabase power (2026-04-29)
- Payment Infrastructure: 9 existing tables (no new tables needed)

## Notes

- **NO NEW TABLES REQUIRED** - All payment infrastructure already exists
- **Qsure fields added** - Migration applied to `claim_payments` and `payment_batches` (2026-04-29)
- **Plus1Rewards exclusion** - Members with `broker_code = 'POR'` handled separately
- **EFT exclusion** - Manual EFT payments tracked in `eft_payment_notifications`
- **Demo data safe** - 2,334 members and 2,390 dependants are demo data, safe to test with

---

**Document Status:** ✅ Complete - Ready for API documentation receipt  
**Last Verified:** April 29, 2026  
**Next Review:** After receiving Qsure API documentation
