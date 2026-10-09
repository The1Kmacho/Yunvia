# Yunvia — Visual identity and interface principles

> Initial design direction for the local interactive prototype, not a finalized brand guide.

## Brand

**Yunvia — Build together. Live better.**

Born in Puerto Rico; designed to work across languages and borders. The identity should evoke growth, connection, trust, and practical optimism without using partisan political imagery.

## Design decisions

- **Personality:** neighborly, optimistic, capable, clear — never corporate-bureaucratic or charity-centric.
- **Colors:** deep forest green (#204c3f) for trust and strong actions; warm off-white (#f8f8f3) and white for calm space; mint/sage for growth; muted peach as a friendly accent. These are prototype tokens, not accessibility-certified combinations in all situations.
- **Typography:** legible rounded/humanist system fallbacks. No external font download is required.
- **Shape:** soft corners, clear cards, comfortable touch targets, ample spacing.
- **Iconography:** simple stroke icons and abstract plant/growth imagery; no stereotyped representations of specific neighborhoods or people.
- **Copy:** Spanish-first for Puerto Rico; English via explicit control. Community contributions can be user-authored in either language and are **not automatically translated**.
- **Information architecture:** community selector → projects → needs → milestones/contributions.

## Key screens in the prototype

1. **Home:** purpose-driven welcome, featured projects, community overview, requests for help.
2. **Projects:** community-specific initiatives and new project creation.
3. **Resources:** outstanding project needs; voluntary pledge and unpledge.
4. **My community:** switch or create a demo community, see local projects.
5. **Project details:** milestones, needed resources, pledge actions, add a resource need.

## Interaction model

Buttons must perform an understandable action. This prototype persists changes in the visitor's browser (localStorage) and clearly labels itself a demo. It does **not** create real community accounts or share data with other people.

In the production version, many demo interactions must become server-authorized actions with audit trails. Milestone changes and resource requests must be restricted to appropriately authorized community roles.

## Responsive behavior

Sidebar on desktop; collapsible mobile navigation; one-column project layout on small screens. Support text zoom and reduced motion; keyboard and screen-reader testing is required before a pilot launch.

## Unresolved decisions

- Final wordmark/icon and trademark clearance.
- User-researched Spanish/English copy.
- Field-tested screen-reader and contrast compliance.
- Community moderation and reporting interaction patterns.
- Authenticated profile and membership onboarding.
