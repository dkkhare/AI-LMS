# Database Design

AI-LMS uses MySQL and a regional, multi-tenant architecture. Database tables are finalized one by one before their Laravel migrations are implemented.

## Design workflow

For every table, agree on purpose, columns and MySQL types, keys and indexes, relationships, tenant isolation, validation, privacy, retention, auditing, migration, and rollback.

## Status definitions

- `Proposed`: under discussion and freely changeable.
- `Approved`: logical design accepted, but not yet implemented.
- `Implemented`: migration, model, policies, and tests exist.
- `Released`: deployed to a shared or production environment.
- `Retired`: no longer used and completing safe removal.

## Current table order

| Order | Table | Status | Purpose |
|---:|---|---|---|
| 1 | `users` | Proposed | Identity for all human and service accounts |
| 2 | `platform_roles` | Pending | Platform-wide roles such as super administrator |
| 3 | `platform_user_roles` | Pending | Assign platform roles to users |
| 4 | `tenant_registration_requests` | Pending | Tenant self-registration and super-admin review |
| 5 | `tenants` | Proposed/revision required | Approved institution identity and entitlements |
| 6 | `tenant_memberships` | Pending | Connect users to one or more tenants |
| 7 | `tenant_membership_roles` | Pending | Assign tenant administrator, teacher, student, and reviewer roles |
| 8 | `approval_requests` | Pending | General tenant approval workflow |
| 9 | `approval_actions` | Pending | Immutable approval decision history |

## Confirmed workflow

Tenant applicants may self-register, or a super administrator may register a tenant. Every self-registration requires super-administrator approval. After approval, a super administrator assigns at least one tenant administrator. The same administrator may be assigned to several tenants. Tenant administrators then manage permitted approvals and activities within their assigned tenants.

Roles are not separate user tables. A person exists once in `users`; platform roles and tenant memberships determine authority.
