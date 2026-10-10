# Integrated Cooperation Prototype

This branch adds a connected **Discover → Coordinate → Track outcomes** experience across three pillars. It is a proof of the product workflow, **not a multi-user pilot**.

## How to try it

Checkout `feat/integrated-opportunity-workflows` and run:

```bash
npm install
npm run dev
```

Go to **Discover / Descubrir**. Data uses fictional people, quotes and buying interests; browser storage is local.

### A. Collective purchasing

1. Open Discover → Group buying / Compras colectivas.
2. Inspect two fictional supplier quotes for a rice buying group.
3. Commit 1 unit. The example group goes from 11 to 12 units, meeting its minimum.
4. In this **demo**, advance it through commitments locked → distribution completed.
5. Note the displayed gross price *difference*, based on a fictional reference price, is not verified savings. No money changes hands.
6. Propose another buying group with its own fictitious supplier price and minimum.

### B. Shared assets

1. Open Discover → Shared resources / Biblioteca de recursos.
2. Request the example drill. The item is no longer presented as available to new matching requests.
3. Advance the simulated owner's approval and register a return.
4. After a return, the item becomes available again.
5. You can also create a fictional asset offer.

**Important:** A production owner must approve a request. Demo controls deliberately let one visitor simulate both sides to test the state machine; real authorization and scheduling do not yet exist.

### C. Community intelligence and project coordination

1. Open Discover → Opportunities / Oportunidades.
2. See three matches generated from opted-in resources and same-community needs.
3. Each match explains the reason; tool requests lead to lending, purchasing matches lead to buying, skill matches open the existing garden project.
4. Post a new need, publish a skill, or share a tool and see matching recomputed from current data.
5. Complete a real simulated action by opening the garden project and pledging to a need or marking a milestone.
6. Switch demo communities and confirm that private or other-community capabilities do not appear in matches.

Matching is **deterministic**, not AI-generated. The rules are in `src/lib/cooperation.ts` and have automated tests.

## Architecture

- **Single demo state:** the existing `DemoState` now holds `cooperation`, persisted under the existing browser storage key.
- **Pure domain operations:** `setMyUnits`, `advanceGroupBuy`, `requestAsset`, `advanceLoan`, `findOpportunities`.
- **Presentation:** `src/components/cooperation-hub.tsx` and `src/app/hub.css`.
- **Incremental data migration:** previously saved prototype data is supplemented with the new cooperation seed if it lacks the field.
- **No hidden geo-resolution:** discovery scopes to the currently selected demo community, not a person's actual position.

## Trust and production boundaries

- All sample offers, quotes, people and reference prices are **fictional**.
- No real accounts, billing, money custody, supplier verification, community identity verification, loan contracts, or moderation.
- Buying group actions and loan approvals intentionally simulate organizer/owner roles; in production they **must** be server-authorized and audited.
- No exact residential address is required or stored here.
- No real financial savings are calculated or promised.
- User-generated titles are preserved as entered rather than auto-translated.
- Unlike a production-grade group buy, this first prototype has no unit-level allocation, refunds, shipping cost calculations, inventory verification, or deadline.
- Matching currently recognizes a deliberately small taxonomy of demonstration needs and skills. Users cannot list every possible real-world capability yet.
- For the pilot we need real-world validation, moderation workflows, permission boundaries, and explicit user privacy controls.

## Tests

```bash
npm run test
npm run check
```

Tests cover same-community opted-in matching, explained results, unit minimums, invalid quantities, quote integrity, loan state transitions, and exclusion of unavailable items. Browser accessibility and multi-user integration tests remain to be added.
