# Yunvia — Architecture (proposal, not yet implemented)

This document records a starting technical direction, not an existing production system.

## Goals

- **Project-first:** model communities and collaborative work as first-class entities.
- **Simple MVP:** keep deployment and contributor setup manageable.
- **Secure by design:** every read/write has server-side authorization.
- **Bilingual and accessible:** internationalization and assistive technology are baseline concerns.
- **Privacy-conscious:** no public exact address by default; scope data to intended audiences.
- **Portable:** avoid binding community records to proprietary formats where practical.

## Recommended initial shape

A **modular monolith** is preferable to microservices at this stage.

Provisional stack:
- **Language:** TypeScript.
- **App:** Next.js (responsive web application, progressively enhanced/PWA-ready).
- **Data:** PostgreSQL with schema migrations.
- **Authentication:** established, well-maintained solution; decide after comparing hosting and privacy requirements.
- **Deployment:** managed platform with backups, observability, and documented recovery; provider undecided.

These are proposals. We should record alternatives, tradeoffs, and final selections before scaffolding.

## Domain model (first pass)

| Entity | Responsibility |
| --- | --- |
| User | Authentication identity, account settings, preferred language |
| Profile | Voluntary member bio, skills, approximate area, visibility |
| Community | Identity, description, approximate geography, governance settings |
| Membership | User's status and role in a community |
| Project | A community initiative, outcome, owner/coordinator, lifecycle |
| Milestone | Trackable project steps and progress |
| ResourceNeed | Required skill, equipment, material, or volunteer time |
| Contribution | Voluntary offer/pledge against a resource need |
| ProjectUpdate | Visible progress notes and lightweight discussion |
| Report | Safety/moderation report with restricted access |
| ModerationAction | Documented enforcement decisions and appeal status |
| AuditEvent | Record of consequential state and permission changes |

Start with the smallest useful subset; do not model speculative finance or federation features in the MVP schema.

## Authorization boundaries

**Never equate “logged in” with “allowed.”** For every resource, check both identity and membership-specific permissions on the server.

- Profiles may have public, community-only, and private fields.
- Private projects and their resources must not leak to other communities.
- Project contributions remain voluntary; withdrawal behavior must be defined.
- A coordinator cannot use UI privileges to inspect unrelated sensitive reports.
- Platform moderator access is narrowly scoped, logged, and reviewed.
- Explicitly test cross-community access and role escalation.
- Community membership, moderation actions, and project lifecycle transitions should be auditable.

Use a simple role model initially, but avoid hard-coding “one owner controls everything” into data structures. Voting and governance features can be added later.

## Privacy considerations

- Store approximate locality separately from exact addresses; do not require a home address.
- Do not expose location history or precise member maps.
- Design consent and visibility controls before exposing skill/resource directories.
- Treat emergency needs, medical information, and contact data as sensitive.
- Set data retention, export, and deletion policies before production.
- Avoid third-party behavioral tracking or advertising SDKs.
- No credentials, API keys, or user data in the repository.

## Trust and safety

A project can involve strangers meeting or sharing physical resources. Software must support blocking, reporting, permission boundaries, and reviewable moderator actions. Do not promise background checks, insurance, professional vetting, or emergency response unless those services truly exist.

Consider age eligibility for pilot participation, local rules for high-risk activities, and accessibility for people who cannot safely meet in person.

## Internationalization and accessibility

- Use translation keys rather than hard-coded strings.
- Spanish and English at launch, with Spanish-first Puerto Rico flows.
- Support locale-dependent dates, times, units, and pluralization.
- Test keyboard and screen-reader flows, contrast, text scaling, touch targets, and slow networks.
- Design mobile-first but keep core workflows usable on a desktop.

## Technical quality gates

Before pilot launch:
1. Unit and integration tests for project lifecycle and permissions.
2. End-to-end test for creating/joining a community and coordinating a project.
3. Negative authorization tests across users/communities.
4. Basic automated accessibility checks plus manual testing.
5. Documented secret management, backups, incident response, and deployment rollback.
6. Performance checks on lower-end mobile devices and constrained networks.
7. Privacy review of what other members and unauthenticated visitors can see.

## Proposed module boundaries

- `identity` — users, profiles, authentication.
- `communities` — membership and coordinator roles.
- `projects` — milestones, needs, progress.
- `contributions` — offered help and resource commitments.
- `communications` — updates, comments, notifications.
- `trust-safety` — reports, blocking, moderation.
- `platform` — i18n, audit, feature flags, configuration.

These are conceptual boundaries; they do not require separate deployed services.

## Decisions to record before implementation

Create small architecture decision records (ADRs) for:
- Framework and deployment approach.
- Authentication and permission system.
- Data access layer and migrations.
- Bilingual content strategy.
- Privacy/retention and exports.
- Notifications and moderation workflow.

## Defer intentionally

No monetary custody, token economy, automatic matching AI, public precise location sharing, complex federation, or configurable governance engine in v1. Design extension points only when they do not slow down the core project workflow.
