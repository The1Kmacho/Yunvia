# Structured Capabilities & Group Buying v2 — Prototype

This branch improves two areas identified during prototype review: ambiguous group-buying flow, and unreliable text-based skill matching.

## Skill architecture

- `src/lib/skills.ts` owns a small, **curated bilingual catalog** with stable task IDs, named categories, translated labels and search synonyms.
- A visitor can search categories and select individual activities, e.g., `gardening.planting`, rather than a generic gardening tag.
- The user may provide a free-text note, but **notes, descriptions, claimed experience, and broad categories do not determine matches**.
- Capability offers record selected task IDs, self-reported experience, contribution preference (volunteer/exchange/paid), and an explicit opt-in checkbox.
- A posted skill need also uses selected task IDs. Project creation and project-detail **Add Need** can now classify tasks with the same picker. A project need must request that same task ID, and an opted-in member must offer it before a match is suggested.
- Suggestions remain community-scoped and show a plain-language explanation. Arbitrary/custom skill descriptions can be visible as notes but aren't silently given matching privileges.
- Regulated credentials, endorsements, and professional verification **are not implemented**. Experience claims do not constitute a safety guarantee.
- New activities will eventually require a review/suggestion pipeline before gaining an approved catalog ID; this first prototype only includes the sample taxonomy.

## Group Buying as a guided workflow

The Buying screen now explains the sequence:

1. Neighbors express an interest in a product.
2. An organizer gathers and compares supplier quotations.
3. Members review the product specification, pickup plan and chosen price, then pledge a **quantity** voluntarily.
4. When the minimum is met, the organizer closes commitments.
5. Payment is handled externally; fulfillment is tracked in Yunvia.

Choose **Participant** to see a product, terms, selected supplier, your own quantities and your estimated cost. A participant can change or withdraw their quantity until the organizer closes the group.

Choose **Organizer** to inspect supplier quotations, select one, close the group once the minimum is met, and simulate fulfillment. **Changing the selected quote resets all existing commitments**, because changing the price without renewed consent is unsafe.

### Sample walkthrough

1. Go to **Discover → Group Buying**.
2. Review the fictional 5 lb rice order, pickup conditions and selected sample supplier.
3. In Participant view, pledge **one unit**. The group moves from 11 to 12.
4. Switch to Organizer view and close commitments.
5. Simulate external fulfillment.
6. Alternatively, switch suppliers *before closing* and observe all commitments reset, requiring renewed participation.

**The organizer toggle is only a demo control, not real authorization**. A production launch requires accounts, membership and organizer roles, identity/supplier checks, payment terms, cancellation policies, deadlines, confirmation of delivery, unit allocations and moderation.

The sample supplier pricing, reference price, participant counts and fulfillment are fictional. Price differences are hypothetical gross comparisons excluding fees, transport and taxes, **not verified savings**. Yunvia does not hold money.

## Try a structured project need

1. Create a new community project, and choose one or more catalogued activities in its skill picker.
2. In Discover, publish a **Skill** need with the same activity, and offer that activity using the **Share a skill** form with explicit consent.
3. A matching project suggestion now appears, with a readable reason. Selecting a different task such as planning rather than planting does not match an unrelated project requirement.
4. Plain-text project needs remain available for human coordination, but do **not** gain automatic skill-matching tags from their text.

## Development and migration

The branch is stacked on `feat/integrated-opportunity-workflows`. Check it out, then:

```bash
npm run dev
npm run check
```

No new npm dependencies are introduced in this change, so an existing installation with current dependencies normally needs **no `npm install`**.

Demo browser storage is upgraded conservatively: only the known seeded `cap-garden` capability and garden volunteer need get precise planting IDs. Older user-entered arbitrary skill descriptions remain unindexed and cannot generate matches.

## Before real users

- Approve catalog governance, taxonomy additions and translations.
- Define eligibility and qualified-professional restrictions for regulated activities.
- Server-enforced permissions and genuine consent.
- Real multi-user quote change/commitment invalidation and notifications.
- Actual group-buy commitment cutoff dates and payment/consumer disclosures.
- Feedback mechanisms against spam, irrelevant listings and abuse.
- Screen reader and interaction testing for dialogs and selectors.

The prototype is for workflow review, not production transactions.
