# Security Hardening Checklist

This checklist is specific to the current Day1 repo and is ordered by likely risk reduction, not by implementation convenience.

## How to use this checklist

- Treat `P0` items as blockers before exposing more data or inviting external review.
- Treat `P1` items as the next hardening wave once the biggest bypasses are closed.
- Treat `P2` items as cleanup, consistency, and assurance work that prevents drift.

## P0: Close direct paths around database authorization

### 1. Stop relying on `service_role` for normal user-driven reads

Why this is first:
- `SUPABASE_SERVICE_ROLE_KEY` bypasses Row-Level Security entirely.
- Many authenticated API routes currently authorize in Next.js and then query Supabase with full database bypass privileges.
- If one route has a logic flaw, the database will not save us.

Repo evidence:
- [apps/frontend/src/app/api/operations/members/route.ts](/e:/wind new/day1main/apps/frontend/src/app/api/operations/members/route.ts:7)
- [apps/frontend/src/app/api/operations/members/[id]/route.ts](/e:/wind new/day1main/apps/frontend/src/app/api/operations/members/[id]/route.ts:5)
- [apps/frontend/src/app/api/provider/eligibility/route.ts](/e:/wind new/day1main/apps/frontend/src/app/api/provider/eligibility/route.ts:29)
- [apps/frontend/src/app/api/member/claims/route.ts](/e:/wind new/day1main/apps/frontend/src/app/api/member/claims/route.ts:5)
- [apps/frontend/src/lib/supabase-server.ts](/e:/wind new/day1main/apps/frontend/src/lib/supabase-server.ts:3)

Action:
- Split server-side Supabase usage into two categories:
  - Session-bound clients for user-facing reads and writes.
  - `service_role` clients only for tightly scoped privileged operations such as background jobs, admin-only mutations, or server-side workflows that genuinely must bypass RLS.
- For routes that already call `requireRole` or `requireAnyRole`, decide whether the database query can run as the logged-in user instead of the service role.
- Start with high-sensitivity routes touching member, dependant, claims, provider, and application data.

Done when:
- User-facing routes no longer default to `service_role`.
- A route compromise would still hit database-layer authorization.

### 2. Enable and verify live RLS on sensitive tables

Why this is first:
- The repo contains planned SQL, but the current internal review still says RLS status is unknown.
- Without verified RLS, session auth only partially helps.

Current verified live finding as of 2026-06-01:
- `anon` access can read live rows from `members`, `member_dependants`, `claims`, `providers`, and `users`.
- Treat this as a critical exposure, not just a documentation gap.
- See the repo-specific containment breakdown in [docs/internal-review/RLS_CONTAINMENT_PLAN.md](/e:/wind new/day1main/docs/internal-review/RLS_CONTAINMENT_PLAN.md:1).

Repo evidence:
- [docs/SELF_HOSTED_SUPABASE_SETUP.md](/e:/wind new/day1main/docs/SELF_HOSTED_SUPABASE_SETUP.md:479)
- [docs/internal-review/SECURITY_POSTURE_ASSESSMENT.md](/e:/wind new/day1main/docs/internal-review/SECURITY_POSTURE_ASSESSMENT.md:66)

Priority tables:
- `members`
- `member_dependants` or `member_dependents` depending on live schema
- `claims`
- `applications`
- `providers`
- Any table holding medical, identity, payment, or audit data

Action:
- Verify live RLS state in Postgres, not just in docs.
- Add explicit policies for each role model you actually support:
  - member
  - provider
  - call centre
  - operations
  - finance
  - claims
  - admin or system admin
- Avoid generic `TO authenticated USING (true)` policies on sensitive data.
- For `UPDATE`, include both `USING` and `WITH CHECK`.
- Review views and privileged functions for RLS bypass behavior.

Minimum verification queries:

```sql
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('members', 'member_dependants', 'member_dependents', 'claims', 'applications', 'providers');

SELECT schemaname, tablename, policyname, roles, cmd, qual, with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

Done when:
- RLS is enabled on all sensitive exposed tables.
- Policies are tested with real role-specific sessions.
- The status in the security assessment can be updated from unknown to verified.

### 3. Audit and eliminate any `NEXT_PUBLIC_*` service-role usage

Why this is first:
- A service-role key in a public env var is a severe secret-handling failure.
- Even if currently limited to scripts, this pattern is dangerous and normalizes unsafe handling.

Repo evidence:
- [apps/frontend/scripts/test-logout.js](/e:/wind new/day1main/apps/frontend/scripts/test-logout.js:5)
- [supabase/set-all-active.js](/e:/wind new/day1main/supabase/set-all-active.js:5)

Action:
- Remove any use of `NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY`.
- Search env files, deployment configs, CI variables, and local onboarding docs for the same pattern.
- Rotate the real service-role key if this naming pattern was ever used in a deployed environment.
- Keep service-role secrets server-only and never reference them from browser-capable code paths.

Done when:
- No repo code references `NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY`.
- Production secrets are rotated if exposure cannot be ruled out.

### 4. Lock down public network exposure before external sharing

Why this is first:
- The local self-hosted stack exposes several ports directly.
- If the HostAfrica instance is VM-hosted, internet-facing ports must be deliberately reduced.

Repo evidence:
- [infrastructure/docker-compose.yml](/e:/wind new/day1main/infrastructure/docker-compose.yml:11)
- [infrastructure/docker-compose.yml](/e:/wind new/day1main/infrastructure/docker-compose.yml:115)
- [infrastructure/docker-compose.yml](/e:/wind new/day1main/infrastructure/docker-compose.yml:149)
- [docs/SELF_HOSTED_SUPABASE_SETUP.md](/e:/wind new/day1main/docs/SELF_HOSTED_SUPABASE_SETUP.md:434)

Action:
- Ensure only the intended edge ports are public.
- If hosting on a VM, put `Kong` behind `Caddy` or `Nginx` for HTTPS termination and redirects.
- Do not expose Postgres `5432` publicly.
- Do not expose Studio `3000` publicly.
- Restrict any admin or internal service ports to localhost or a private network.
- Add firewall rules at the host and provider level.

Done when:
- Public scan shows only expected ports, ideally `80` and `443`.
- Database and internal service ports are not reachable from the internet.

## P0 Punch-List

Use this as the execution view for the `P0` work above. Owners are suggested roles, not fixed names.

### Effort scale

- `S`: less than 1 day
- `M`: 1 to 3 days
- `L`: 3 to 5 days
- `XL`: more than 5 days

### P0.1 Remove public service-role patterns and assess key rotation

Suggested owner:
- Full-stack engineer
- DevOps or platform owner for secret rotation

Estimated effort:
- `S` for repo cleanup and verification
- `M` if production key rotation is required

Tasks:
- Remove `NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY` references from scripts and tooling.
- Search local env templates, deployment configs, CI variables, and onboarding docs for the same pattern.
- Decide whether the current service-role key must be rotated based on prior deployment history.
- Document the final approved env var names for public versus server-only Supabase credentials.

Repo anchors:
- [apps/frontend/scripts/test-logout.js](/e:/wind new/day1main/apps/frontend/scripts/test-logout.js:5)
- [supabase/set-all-active.js](/e:/wind new/day1main/supabase/set-all-active.js:5)

Exit criteria:
- No code references `NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY`.
- Team has a yes or no decision recorded on production key rotation.

Dependencies:
- None. This should start immediately.

### P0.2 Verify live RLS status on sensitive tables

Suggested owner:
- Database engineer
- Supabase owner

Estimated effort:
- `S` for live verification only
- `M` if verification exposes missing or partial policies

Tasks:
- Run the verification queries against the live environment.
- Record actual table names where `dependants` versus `dependents` differ from docs.
- Capture current policies for `members`, `member_dependants` or `member_dependents`, `claims`, `applications`, and `providers`.
- Update the security assessment with dated findings after verification.

Repo anchors:
- [docs/internal-review/SECURITY_POSTURE_ASSESSMENT.md](/e:/wind new/day1main/docs/internal-review/SECURITY_POSTURE_ASSESSMENT.md:66)
- [docs/SELF_HOSTED_SUPABASE_SETUP.md](/e:/wind new/day1main/docs/SELF_HOSTED_SUPABASE_SETUP.md:479)

Exit criteria:
- A dated evidence snapshot exists for live RLS status and current policies.
- The team knows which tables are protected, missing protection, or partially protected.
- If `anon` reads are currently possible, containment is planned and prioritized before external sharing.

Dependencies:
- Requires database access to the real environment.

### P0.3 Design role-accurate RLS policies for sensitive tables

Suggested owner:
- Database engineer
- Product or operations lead for access rules validation

Estimated effort:
- `M` to `L`

Tasks:
- Define who should read and write which rows for each role:
  - member
  - provider
  - call centre
  - operations
  - finance
  - claims
  - admin or system admin
- Translate that access model into explicit Postgres policies.
- Review any views or functions that could bypass the intended RLS model.
- Prepare a safe rollout plan for policy changes and regression testing.

Exit criteria:
- A reviewed RLS policy matrix exists before route refactors depend on it.
- Proposed SQL is ready for staged rollout.

Dependencies:
- Depends on `P0.2` because policy design should reflect the live starting point.

### P0.4 Refactor highest-risk user-facing routes off `service_role`

Suggested owner:
- Full-stack engineer
- Reviewer with Supabase or auth experience

Estimated effort:
- `L`

Tasks:
- Create or standardize a session-bound server client path for authenticated requests.
- Refactor the highest-risk routes first:
  - operations member APIs
  - member claims APIs
  - provider eligibility and claims APIs
- Keep `service_role` only where the business action is truly privileged and cannot reasonably run under the user session.
- For each refactored route, confirm behavior with the intended role and with a disallowed role.

Repo anchors:
- [apps/frontend/src/app/api/operations/members/route.ts](/e:/wind new/day1main/apps/frontend/src/app/api/operations/members/route.ts:7)
- [apps/frontend/src/app/api/operations/members/[id]/route.ts](/e:/wind new/day1main/apps/frontend/src/app/api/operations/members/[id]/route.ts:5)
- [apps/frontend/src/app/api/member/claims/route.ts](/e:/wind new/day1main/apps/frontend/src/app/api/member/claims/route.ts:5)
- [apps/frontend/src/app/api/provider/eligibility/route.ts](/e:/wind new/day1main/apps/frontend/src/app/api/provider/eligibility/route.ts:29)
- [apps/frontend/src/lib/auth-server.ts](/e:/wind new/day1main/apps/frontend/src/lib/auth-server.ts:162)

Exit criteria:
- High-sensitivity user-facing routes no longer default to `service_role`.
- Route tests confirm the database rejects out-of-scope access.

Dependencies:
- Strongly depends on `P0.2` and `P0.3`.

### P0.5 Lock down external network exposure and HTTPS termination

Suggested owner:
- DevOps or infrastructure owner

Estimated effort:
- `M`

Tasks:
- Confirm which ports are currently exposed on the HostAfrica instance.
- Restrict public exposure to the intended edge only.
- Put `Kong` behind `Caddy` or `Nginx` if the deployment is VM-based.
- Enforce HTTPS redirection and valid certificate provisioning.
- Confirm Postgres `5432`, Studio `3000`, and any admin surfaces are not publicly reachable.

Repo anchors:
- [infrastructure/docker-compose.yml](/e:/wind new/day1main/infrastructure/docker-compose.yml:11)
- [infrastructure/docker-compose.yml](/e:/wind new/day1main/infrastructure/docker-compose.yml:115)
- [infrastructure/docker-compose.yml](/e:/wind new/day1main/infrastructure/docker-compose.yml:149)

Exit criteria:
- Public scan shows only intended public ports.
- HTTPS is active and internal services are not internet-reachable.

Dependencies:
- Can run in parallel with `P0.2` and `P0.4`.

### P0.6 Prove the fixes with role-based verification

Suggested owner:
- QA engineer
- Full-stack engineer

Estimated effort:
- `M`

Tasks:
- Test member, provider, operations, finance, claims, and admin access against the updated routes.
- Confirm allowed actions still work.
- Confirm disallowed cross-user or cross-role access is rejected at the database layer where expected.
- Save the verification results into the internal review docs.

Exit criteria:
- There is evidence, not just intent, that `P0` controls work in practice.

Dependencies:
- Depends on `P0.2`, `P0.3`, `P0.4`, and any network changes affecting access paths.

### Recommended sequence

1. `P0.1` Remove public service-role patterns and decide on secret rotation.
2. `P0.2` Verify live RLS status.
3. `P0.3` Finalize the real access model and RLS policy design.
4. `P0.4` Refactor the highest-risk routes off `service_role`.
5. `P0.5` Lock down network exposure and HTTPS.
6. `P0.6` Run role-based verification and update the security posture docs.

### Suggested milestone split

- Milestone A: Exposure reduction
  - `P0.1`
  - `P0.2`
- Milestone B: Database enforcement
  - `P0.3`
  - `P0.4`
- Milestone C: External readiness
  - `P0.5`
  - `P0.6`

## P1: Remove weak policies and overly broad access patterns

### 5. Replace permissive placeholder RLS policies

Why this matters:
- Some repo SQL shows RLS turned on but effectively disabled by `USING (true)`.
- That is acceptable only for clearly non-sensitive development tables, never for production personal or medical data.

Repo evidence:
- [apps/frontend/scripts/create-feedback-table.sql](/e:/wind new/day1main/apps/frontend/scripts/create-feedback-table.sql:36)
- [docs/guides/RUN_POLICY_SECTIONS_IN_SUPABASE.sql](/e:/wind new/day1main/docs/guides/RUN_POLICY_SECTIONS_IN_SUPABASE.sql:22)

Action:
- Review every policy that grants `authenticated` broad read or write access.
- Separate low-sensitivity content tables from high-sensitivity operational data.
- Restrict production feedback, audit, and internal operations tables to the smallest role set needed.

Done when:
- No sensitive table relies on `USING (true)` or broad authenticated access.

### 6. Review storage policies for public access

Why this matters:
- Current example storage policies allow public upload, read, update, and delete on the `applications` bucket.
- If applied live, that would be a major data exposure risk.

Repo evidence:
- [docs/guides/setup-storage-policies.sql](/e:/wind new/day1main/docs/guides/setup-storage-policies.sql:4)

Action:
- Confirm whether these storage policies were ever applied to a real environment.
- Restrict uploads to authenticated users or signed upload flows.
- Restrict reads to the owning member, assigned staff, or short-lived signed URLs.
- Remove public update and delete unless there is a very specific controlled reason.

Done when:
- Application documents are not world-readable or world-writable.

### 7. Inventory routes that mix app-layer RBAC with database bypass

Why this matters:
- App-layer role checks are useful, but when combined with `service_role`, they become the only barrier.
- This increases blast radius from one coding mistake.

Repo evidence:
- [apps/frontend/src/lib/auth-server.ts](/e:/wind new/day1main/apps/frontend/src/lib/auth-server.ts:162)
- [apps/frontend/src/app/api/claims/route.ts](/e:/wind new/day1main/apps/frontend/src/app/api/claims/route.ts:18)
- [apps/frontend/src/app/api/finance/payment-batches/route.ts](/e:/wind new/day1main/apps/frontend/src/app/api/finance/payment-batches/route.ts:10)

Action:
- Build a route inventory:
  - route path
  - required app role
  - tables touched
  - whether it uses session client or `service_role`
  - whether RLS is expected to protect the same data
- Use that inventory to prioritize refactors.

Done when:
- You can explain which routes rely on database enforcement versus only application logic.

## P2: Tighten operational hygiene and add proof

### 8. Separate production-safe scripts from ad hoc admin scripts

Why this matters:
- There are many maintenance scripts using `service_role`.
- That is normal for admin tooling, but it should be isolated and clearly marked to reduce accidental misuse.

Repo evidence:
- `apps/frontend/scripts/*`
- `supabase/*.js`

Action:
- Move one-off scripts into an explicitly internal/admin tooling area.
- Add naming and README guidance that these scripts are server-only and must never run from browser-exposed contexts.
- Remove scripts that are obsolete or dangerous.

Done when:
- The repo makes a clear distinction between production app code and privileged maintenance code.

### 9. Add repeatable security verification steps to release workflow

Why this matters:
- Security hardening drifts unless verification is routine.

Action:
- Add a pre-release security checklist covering:
  - RLS status query
  - policy diff review
  - secret scan
  - public port scan
  - spot tests with member, provider, and admin accounts
- Store expected results in docs so future reviewers can compare quickly.

Done when:
- Hardening checks are run before demos, partner access, or external audits.

### 10. Update internal docs to reflect actual live security posture

Why this matters:
- Some docs describe intended controls, not confirmed controls.
- That creates false confidence during review.

Repo evidence:
- [docs/internal-review/SECURITY_POSTURE_ASSESSMENT.md](/e:/wind new/day1main/docs/internal-review/SECURITY_POSTURE_ASSESSMENT.md:66)
- [docs/SELF_HOSTED_SUPABASE_SETUP.md](/e:/wind new/day1main/docs/SELF_HOSTED_SUPABASE_SETUP.md:473)

Action:
- Mark example SQL as example SQL until executed and verified.
- Record the date and environment for every security verification.
- Keep one source of truth for current RLS status, public exposure, and certificate setup.

Done when:
- Reviewers can tell the difference between planned, applied, and verified controls.

## Suggested implementation order

1. Remove public service-role patterns and rotate secrets if needed.
2. Verify live RLS state on sensitive tables.
3. Refactor the highest-risk user-facing routes off `service_role`.
4. Close public network exposure and enforce HTTPS at the edge.
5. Replace permissive RLS and storage policies.
6. Add repeatable verification and documentation updates.

## What not to do

- Do not replace every server-side query with session auth blindly. Some privileged workflows legitimately need elevated access.
- Do not declare RLS done just because `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` was run.
- Do not expose Postgres or Supabase Studio publicly for convenience.
- Do not keep example permissive policies around without labeling them as unsafe for production.

## Immediate go/no-go rule for external sharing

Do not broaden external access until all of the following are true:
- Sensitive tables have verified live RLS.
- User-facing routes no longer broadly depend on `service_role`.
- No public service-role secret pattern remains.
- Internet-facing services terminate HTTPS properly and internal ports are closed.
