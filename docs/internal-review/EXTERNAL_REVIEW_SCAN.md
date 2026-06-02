# External Developer Review - First Glance Scan

**Scan Date**: 2026-05-15  
**Purpose**: Identify obvious red flags before first external developer review  
**Scope**: Development build - NOT production-hardened

---

## 🔴 CRITICAL - Must Fix Before Review

### 1. Broken Import - Plus1 Plan Mapper
**File**: `apps/frontend/src/app/api/admin/applications/route.ts` (Line 4)  
**Issue**: Imports deleted file `@/lib/plus1-plan-mapper`  
**Impact**: Application approval route will crash  
**Fix**: Remove import and any usage of `mapPlus1PlanToProduct()`

### 2. Provider Edit Route Still Stores login_password
**File**: `apps/frontend/src/app/api/admin/providers/[id]/route.ts` (Line 138)  
**Issue**: PUT handler still inserts `login_password` into providers table  
**Impact**: Reintroduces plaintext password storage vulnerability  
**Fix**: Remove `login_password` from update object (same as POST route fix)

### 3. Unprotected DELETE Handlers
**Files**:
- `apps/frontend/src/app/api/admin/providers/[id]/route.ts` (Line 144)
- `apps/frontend/src/app/api/admin/brokers/[id]/route.ts` (Line 41)
- `apps/frontend/src/app/api/admin/payment-groups/[id]/route.ts` (Line 42)

**Issue**: No authentication checks on DELETE operations  
**Impact**: Anyone can delete providers, brokers, payment groups  
**Fix**: Add `requireAnyRole()` or disable with 403 response

### 4. Unprotected Provider Detail Route
**File**: `apps/frontend/src/app/api/admin/providers/[id]/route.ts` (Line 9)  
**Issue**: GET and PUT have no authentication  
**Impact**: Anyone can view/edit provider details including banking info  
**Fix**: Add `requireAnyRole()` to GET and PUT handlers

---

## 🟡 MEDIUM - Should Fix Before Review

### 5. Test/Debug Files in Root Directory
**Files**:
- `test-api-direct.html`
- `test-login.json`
- `temp_members_page.txt`
- `list-tables.js`
- `write-slider.bat`
- `fix-all-prisma.ps1`
- `fix-prisma-to-supabase.ps1`
- `fix-remaining-prisma.ps1`

**Issue**: Development/test files visible in root  
**Impact**: Looks unprofessional, may contain test credentials  
**Fix**: Move to `/scripts` or `/dev-tools` folder, or delete

### 6. Documentation Files in Root
**Files**:
- `DEV_TEST_USERS.md` (contains test credentials)
- `LOGIN_PASSWORD_CLEANUP_SUMMARY.md`
- `FIELD_MAPPING_VERIFICATION.md`
- `MEMBERS_TABLE_COLUMNS.md`
- `PROVIDER_CLAIMS_ACTUAL_STATUS.md`
- `PROVIDER_CLAIMS_SYSTEM_GAP_ANALYSIS.md`
- `SECURITY_POSTURE_ASSESSMENT.md`

**Issue**: Internal docs in root directory  
**Impact**: Exposes internal security discussions, test credentials  
**Fix**: Move to `/docs` folder or `.kiro/` folder

### 7. Hardcoded Test Password in Script
**File**: `scripts/policy-data/create-operations-user.js` (Line 39)  
**Code**: `const hashedPassword = await bcrypt.hash('operations123', 10);`  
**Issue**: Hardcoded password visible in code  
**Impact**: Low (it's hashed and for dev only)  
**Fix**: Document as dev-only or use env variable

### 8. Plus1 References in Cron Job
**File**: `apps/frontend/src/app/api/cron/sync-plus1-status/route.ts`  
**Issue**: Entire file references Plus1 integration that was removed  
**Impact**: Cron job will fail if triggered  
**Fix**: Delete file or disable route

### 9. Plus1 Sync Script
**File**: `apps/frontend/sync-theo-pin.js`  
**Issue**: References Plus1Rewards database  
**Impact**: Script will fail  
**Fix**: Delete file

---

## 🟢 LOW - Document for Future Production Hardening

### 10. Member/Provider Routes Not Yet Implemented
**Files**:
- `apps/frontend/src/app/api/member/claims/route.ts`
- `apps/frontend/src/app/api/member/profile/route.ts`
- `apps/frontend/src/app/api/provider/claims/route.ts`

**Issue**: TODO comments indicate auth not implemented  
**Impact**: None (routes not in use yet)  
**Action**: Document as "Phase 2 - Member/Provider Portal"

### 11. Service Role Key Usage in Scripts
**Pattern**: `process.env.SUPABASE_SERVICE_ROLE_KEY` in 50+ scripts  
**Issue**: Scripts use admin key (expected for migrations/admin tasks)  
**Impact**: None (scripts are server-side only)  
**Action**: Document that scripts are for admin use only

### 12. Audit Trail TODOs
**File**: `apps/frontend/src/app/api/claims-assessor/queue/[id]/route.ts` (Line 29)  
**Issue**: `performed_by: 'claims-assessor'` hardcoded instead of from auth  
**Impact**: Low (route not heavily used yet)  
**Action**: Document for Phase 2 audit improvements

---

## ✅ IGNORE - Expected for Development

### 13. .env.local in Root
**File**: `.env.local`  
**Status**: ✅ Already in .gitignore  
**Action**: None - this is correct for development

### 14. google-vision-key.json References
**Status**: ✅ Already in .gitignore  
**Action**: None - properly excluded

### 15. Multiple Supabase Scripts
**Location**: `/supabase` folder (77 scripts)  
**Purpose**: Database migrations, analysis, testing  
**Status**: ✅ Expected for development  
**Action**: None - these are admin tools

### 16. DEV_TEST_USERS.md
**Status**: ✅ Already in .gitignore  
**Action**: None - properly excluded from git

---

## 📋 QUICK FIX CHECKLIST

**Before External Review** (30 minutes):

1. ✅ Remove Plus1 import from applications route
2. ✅ Fix provider [id] route - remove login_password from PUT
3. ✅ Add auth to provider [id] GET/PUT/DELETE
4. ✅ Add auth or disable DELETE on brokers [id]
5. ✅ Add auth or disable DELETE on payment-groups [id]
6. ✅ Move test files from root to /scripts or delete
7. ✅ Move docs from root to /docs folder
8. ✅ Delete or disable Plus1 cron job
9. ✅ Delete sync-theo-pin.js

**After External Review** (future):
- Implement member/provider authentication
- Add comprehensive audit logging
- Add rate limiting
- Add input validation
- Add CORS policies
- Add API versioning

---

## 🎯 SUMMARY

**Critical Issues**: 4 (must fix)  
**Medium Issues**: 5 (should fix)  
**Low Issues**: 3 (document)  
**Ignore**: 4 (expected)

**Estimated Fix Time**: 30-45 minutes

**Risk Level**:
- Before fixes: 🔴 HIGH (broken imports, unprotected routes)
- After fixes: 🟡 MEDIUM (acceptable for dev review)
- Production ready: 🔴 NOT READY (needs Phase 2 hardening)

---

## 📝 NOTES FOR EXTERNAL REVIEWER

**What This Build Is**:
- Active development build
- Staff portal (admin, operations, claims, finance)
- Provider claims submission (basic)
- Member application processing

**What This Build Is NOT**:
- Production-ready
- Member portal (not implemented yet)
- Provider portal (basic auth only)
- Fully audited
- Rate-limited
- Input-validated

**Known Limitations**:
- Member authentication not implemented (Phase 2)
- Provider authentication basic (Phase 2)
- Audit logging incomplete (Phase 2)
- No rate limiting (Phase 3)
- No API versioning (Phase 3)

**Security Posture**:
- Staff routes: Protected with middleware + route-level auth
- Member routes: Not implemented yet
- Provider routes: Basic protection only
- Database: RLS policies in place
- Passwords: Stored in Supabase Auth (hashed)
- Service keys: In .env.local (gitignored)

