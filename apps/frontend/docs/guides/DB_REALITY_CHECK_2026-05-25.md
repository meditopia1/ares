## Database Reality Check

Date: 2026-05-25
Source of truth: live hosted Supabase project at `ldygmpaipxbokxzyzyti.supabase.co`
Method: service-role metadata and row-count queries from local workspace env

### Purpose

This note captures what the live database actually contains before the self-hosted migration work. Use this instead of assuming older docs are current.

### Live public schema summary

The public API currently exposes these operational table groups:

- Onboarding and member lifecycle: `contacts`, `applications`, `application_dependents`, `members`, `member_dependants`, `rejected_applicants`
- Claims and utilization: `claims`, `claim_lines`, `claim_documents`, `claim_audit_trail`, `claim_payments`, `benefit_usage`, `pre_authorizations`, `preauth_audit_trail`
- Providers and brokers: `providers`, `brokers`, `provider_fraud_alerts`
- Products and policy content: `products`, `product_benefits`, `policy_definitions`, `policy_sections`, `policy_section_items`, `policy_document_sections`
- Payments and collections: `payment_groups`, `payment_history`, `payment_batches`, `payment_reconciliations`, `payment_discrepancies`, `group_payment_history`, `group_member_payments`, `refund_requests`, `eft_payment_notifications`
- Access and audit: `users`, `roles`, `permissions`, `role_permissions`, `user_roles`, `profiles`, `sessions`, `audit_events`, `popia_audit_log`, `mfa_devices`
- Marketing: `landing_pages`, `landing_page_leads`, `landing_page_visits`, `contact_interactions`
- Legacy feedback tables retained for historical data only: `feedback`, `feedback_comments`

### Live row counts

These counts were verified directly against the live database:

| Table | Count |
|---|---:|
| `contacts` | 6 |
| `applications` | 0 |
| `application_dependents` | 0 |
| `members` | 2329 |
| `member_dependants` | 2390 |
| `providers` | 1916 |
| `brokers` | 20 |
| `products` | 10 |
| `claims` | 7 |
| `claim_lines` | 0 |
| `claim_payments` | 0 |
| `pre_authorizations` | 0 |
| `benefit_usage` | 0 |
| `payment_groups` | 45 |
| `payment_history` | 0 |
| `payment_batches` | 0 |
| `refund_requests` | 0 |
| `users` | 12 |
| `roles` | 13 |
| `user_roles` | 12 |
| `sessions` | 8 |
| `landing_pages` | 1 |
| `landing_page_leads` | 0 |
| `landing_page_visits` | 0 |
| `feedback` | 2 (legacy; runtime feature removed) |

### Important documentation mismatches

1. `apps/frontend/docs/guides/SUPABASE_CONNECTION_SUMMARY.md` is inaccurate.
   - It references `member_dependents`, but the live table is `member_dependants`.
   - It references a `policies` table, but the live schema exposes policy content through `policy_definitions`, `policy_sections`, `policy_section_items`, and `policy_document_sections`.

2. The old Kiro steering progress tracker overstated production completeness and has been removed from active docs.
   - It marks claims, pre-auth, payment processing, and benefit tracking as 100% complete.
   - The schema exists, but live usage is sparse or zero in several critical tables:
     - `claim_lines = 0`
     - `claim_payments = 0`
     - `pre_authorizations = 0`
     - `benefit_usage = 0`
     - `payment_batches = 0`
     - `payment_history = 0`
     - `refund_requests = 0`

3. The migration guide in `apps/frontend/docs/project/SELF_HOSTED_SUPABASE_SETUP.md` is infrastructure-oriented, not a verified inventory of current data.
   - It should not be treated as the schema or content source of truth.
   - Migration planning must use live DB inspection plus storage/auth configuration review.

### Migration implications

- Do not rely on older docs alone for schema naming or feature state.
- The migration must include low-volume but business-critical tables, not just the large ones.
- Special attention is required for auth/session-related data and storage objects because they are separate from the main operational row counts.
- Before cutover, verify storage buckets, auth settings, JWT/API key strategy, and any server-side functions separately.

### Practical source of truth for migration prep

Use this precedence order:

1. Live database inspection
2. Live storage/auth configuration inspection
3. Current application code paths
4. Repo documentation
