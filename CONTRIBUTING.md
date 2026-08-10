# Contributing to AI-LMS

## Branches

- Protect `main`; do not develop directly on it.
- Use `feature/<name>`, `fix/<name>`, or `docs/<name>` branches.
- Open a pull request for every change.

## Pull requests

Each pull request should explain what changed, why it changed, its user impact, and how it was validated. Database changes must include Laravel migrations and rollback considerations.

## Database changes

- Never edit a migration that has already reached a shared environment.
- Use additive, backward-compatible migrations where possible.
- Protect tenant isolation in every query, index, cache key, job, and test.
- Never run destructive reset commands against staging or production.
- Treat table designs as proposed until explicitly approved.

## Quality gates

- Automated tests and static analysis must pass.
- Authorization and cross-tenant isolation tests are mandatory.
- No API keys, passwords, certificates, personal data, or production configuration may be committed.
- AI-generated publishable content must remain subject to teacher review.
