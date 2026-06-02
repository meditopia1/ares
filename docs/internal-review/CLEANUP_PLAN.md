# Safe Cleanup Plan - External Review Preparation

**Date**: 2026-05-15  
**Purpose**: Clean up root directory and remove Plus1 references  
**Status**: READY FOR EXECUTION

---

## ✅ DEPENDENCY CHECK COMPLETE

**Plus1 Cron Job**: No active imports or references found  
**Sync Theo Pin**: No active imports or references found  
**Safe to proceed**: YES

---

## 📁 PART 1: Move Root Test/Debug Files

### Create Target Directory
```
/dev-tools/
```

### Files to Move (9 files)

**From Root → To `/dev-tools/`**:

1. `test-api-direct.html` → `dev-tools/test-api-direct.html`
2. `test-login.json` → `dev-tools/test-login.json`
3. `temp_members_page.txt` → `dev-tools/temp_members_page.txt`
4. `list-tables.js` → `dev-tools/list-tables.js`
5. `write-slider.bat` → `dev-tools/write-slider.bat`
6. `fix-all-prisma.ps1` → `dev-tools/fix-all-prisma.ps1`
7. `fix-prisma-to-supabase.ps1` → `dev-tools/fix-prisma-to-supabase.ps1`
8. `fix-remaining-prisma.ps1` → `dev-tools/fix-remaining-prisma.ps1`
9. `DEV_TEST_USERS.md` → `dev-tools/DEV_TEST_USERS.md`

**Rationale**: These are development/testing utilities not needed in root

---

## 📁 PART 2: Move Internal Review/Security Docs

### Create Target Directory
```
/docs/internal-review/
```

### Files to Move (7 files)

**From Root → To `/docs/internal-review/`**:

1. `EXTERNAL_REVIEW_SCAN.md` → `docs/internal-review/EXTERNAL_REVIEW_SCAN.md`
2. `LOGIN_PASSWORD_CLEANUP_SUMMARY.md` → `docs/internal-review/LOGIN_PASSWORD_CLEANUP_SUMMARY.md`
3. `SECURITY_POSTURE_ASSESSMENT.md` → `docs/internal-review/SECURITY_POSTURE_ASSESSMENT.md`
4. `FIELD_MAPPING_VERIFICATION.md` → `docs/internal-review/FIELD_MAPPING_VERIFICATION.md`
5. `MEMBERS_TABLE_COLUMNS.md` → `docs/internal-review/MEMBERS_TABLE_COLUMNS.md`
6. `PROVIDER_CLAIMS_ACTUAL_STATUS.md` → `docs/internal-review/PROVIDER_CLAIMS_ACTUAL_STATUS.md`
7. `PROVIDER_CLAIMS_SYSTEM_GAP_ANALYSIS.md` → `docs/internal-review/PROVIDER_CLAIMS_SYSTEM_GAP_ANALYSIS.md`

**Rationale**: Internal security/review docs should not be in root

---

## 🗑️ PART 3: Delete Plus1 Integration Files

### Files to Delete (2 files)

1. **`apps/frontend/src/app/api/cron/sync-plus1-status/route.ts`**
   - Purpose: Synced Plus1Rewards member status
   - Status: Plus1 integration removed
   - Dependencies: None found
   - Safe to delete: YES

2. **`apps/frontend/sync-theo-pin.js`**
   - Purpose: Synced specific Plus1 member PIN
   - Status: Plus1 integration removed
   - Dependencies: None found
   - Safe to delete: YES

**Rationale**: Plus1 integration was completely removed, these files are dead code

---

## 📋 EXECUTION CHECKLIST

### Pre-Execution Verification
- [x] Checked for active imports of Plus1 files
- [x] Checked for route references to Plus1 cron
- [x] Confirmed no dependencies on files to be deleted
- [x] Verified target directories exist or can be created

### Execution Steps

**Step 1: Create Directories**
```bash
mkdir dev-tools
mkdir docs/internal-review
```

**Step 2: Move Test/Debug Files (9 files)**
```bash
# Windows PowerShell
Move-Item "test-api-direct.html" "dev-tools/"
Move-Item "test-login.json" "dev-tools/"
Move-Item "temp_members_page.txt" "dev-tools/"
Move-Item "list-tables.js" "dev-tools/"
Move-Item "write-slider.bat" "dev-tools/"
Move-Item "fix-all-prisma.ps1" "dev-tools/"
Move-Item "fix-prisma-to-supabase.ps1" "dev-tools/"
Move-Item "fix-remaining-prisma.ps1" "dev-tools/"
Move-Item "DEV_TEST_USERS.md" "dev-tools/"
```

**Step 3: Move Internal Docs (7 files)**
```bash
# Windows PowerShell
Move-Item "EXTERNAL_REVIEW_SCAN.md" "docs/internal-review/"
Move-Item "LOGIN_PASSWORD_CLEANUP_SUMMARY.md" "docs/internal-review/"
Move-Item "SECURITY_POSTURE_ASSESSMENT.md" "docs/internal-review/"
Move-Item "FIELD_MAPPING_VERIFICATION.md" "docs/internal-review/"
Move-Item "MEMBERS_TABLE_COLUMNS.md" "docs/internal-review/"
Move-Item "PROVIDER_CLAIMS_ACTUAL_STATUS.md" "docs/internal-review/"
Move-Item "PROVIDER_CLAIMS_SYSTEM_GAP_ANALYSIS.md" "docs/internal-review/"
```

**Step 4: Delete Plus1 Files (2 files)**
```bash
# Windows PowerShell
Remove-Item "apps/frontend/src/app/api/cron/sync-plus1-status/route.ts"
Remove-Item "apps/frontend/sync-theo-pin.js"
```

**Step 5: Verify Cleanup**
```bash
# Check root directory is clean
Get-ChildItem -File | Where-Object { $_.Name -match "test|temp|fix-|DEV_TEST" }
# Should return nothing

# Check docs/internal-review exists
Test-Path "docs/internal-review"
# Should return True

# Check dev-tools exists
Test-Path "dev-tools"
# Should return True
```

---

## 📊 CLEANUP SUMMARY

**Total Files Affected**: 18 files

**Breakdown**:
- Moved to `/dev-tools/`: 9 files
- Moved to `/docs/internal-review/`: 7 files
- Deleted: 2 files

**Root Directory Before**: 28 files  
**Root Directory After**: 10 files (core config only)

**Files Remaining in Root** (expected):
- .env.local (gitignored)
- .eslintrc.json
- .gitignore
- .npmrc
- .prettierrc
- docker-compose.yml
- package-lock.json
- package.json
- pnpm-workspace.yaml
- README.md
- tsconfig.json
- CLEANUP_PLAN.md (this file - can be moved after execution)

---

## ⚠️ IMPORTANT NOTES

1. **DEV_TEST_USERS.md**: Already in .gitignore, safe to move
2. **Plus1 files**: No active dependencies, safe to delete
3. **No app logic changes**: Only file organization
4. **Reversible**: All moves can be undone if needed
5. **Git tracking**: Git will track moves automatically

---

## 🎯 POST-CLEANUP VERIFICATION

After execution, verify:

1. ✅ Root directory only has core config files
2. ✅ `/dev-tools/` contains 9 test/debug files
3. ✅ `/docs/internal-review/` contains 7 review docs
4. ✅ Plus1 files are deleted
5. ✅ Application still builds: `pnpm build`
6. ✅ No broken imports: `pnpm typecheck`

---

## 🚀 READY FOR EXECUTION

**Risk Level**: 🟢 LOW (no app logic changes)  
**Reversibility**: ✅ HIGH (all moves can be undone)  
**Dependencies**: ✅ VERIFIED (no active dependencies)  
**Safe to proceed**: ✅ YES

Execute when ready.
