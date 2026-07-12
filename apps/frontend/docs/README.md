# Day1Main Documentation

This is the single documentation home for the Day1Main project.

## Start Here

- [project/CURRENT_DASHBOARD_ROLES.md](./project/CURRENT_DASHBOARD_ROLES.md) - current dashboard role definition
- [project/CURRENT_INFRASTRUCTURE.md](./project/CURRENT_INFRASTRUCTURE.md) - current hosting, database, and environment direction
- [project/MEDICAL_INSURER_OPERATING_MODEL_REFERENCE.md](./project/MEDICAL_INSURER_OPERATING_MODEL_REFERENCE.md) - current medical-insurer operating model reference
- [project/STRUCTURE_IMPLEMENTATION_SUMMARY.md](./project/STRUCTURE_IMPLEMENTATION_SUMMARY.md) - current project structure summary
- [project/TECH_STACK.md](./project/TECH_STACK.md) - current technology stack
- [claims/workspace/CLAIMS_WORKSPACE_EXCEL_PLUS_DESIGN.md](./claims/workspace/CLAIMS_WORKSPACE_EXCEL_PLUS_DESIGN.md) - hospital claims workspace plan and current flow
- [netcash/README.md](./netcash/README.md) - Netcash collection and payment processing

## Current Dashboard Roles

In Day1Main planning, a **role** means a unique dashboard or portal experience with its own sidebar and workflow.

1. Admin
2. Operations
3. Marketing
4. Broker
5. Compliance
6. Finance
7. Claims
8. Provider
9. Call Centre
10. Authorization
11. Member
12. Onboarding

## Folder Structure

### `project/`

Project-level references, system setup, dashboard roles, plans, member filters, import templates, and provider TODOs.

### `data/`

Source data files such as member and provider spreadsheets/CSVs.

### `claims/`

Claims forms, GOP/pre-authorization templates, tariffs, workflows, and hospital claims workspace documentation.

### `netcash/`

Netcash debit order, transaction, refund, webhook, and reconciliation documentation.

### `benefits/`

Benefit limits, waiting periods, exclusions, and benefit configuration references.

### `compliance/`

Compliance, CMS, PMB, and Medical Schemes Act documentation.

### `operations/`

Operational training, SLAs, provider contracts, and process documents.

### `guides/`

Implementation guides, status reports, setup notes, SQL snippets, and feature completion notes.

### `internal-review/`

Internal audits, security reviews, implementation reviews, and historical technical assessments.

### `cover plan brochures/`

Plan brochures and public-facing product PDFs.

### `private/`

Local/private notes that should not be treated as public product documentation.

## Documentation Rules

1. Keep all project documentation under this folder.
2. Do not create a second root `docs/` folder.
3. Use dashboard-role terminology from `project/CURRENT_DASHBOARD_ROLES.md`.
4. Put provider-specific payment docs in their own folder. Netcash remains under `netcash/`.
5. Keep claims and GOP material under `claims/`.

## Last Updated

July 11, 2026
