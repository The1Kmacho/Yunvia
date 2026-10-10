import assert from "node:assert/strict";
import test from "node:test";
import {
  advanceGroupBuy, advanceLoan, chooseQuote, findOpportunities,
  initialCooperationState, potentialGrossDifference, requestAsset,
  setMyUnits, totalUnits
} from "../src/lib/cooperation.ts";

const gardenProject = {
  id: "garden", communityId: "barrio-verde", title: { es: "Huerto comunitario", en: "Community garden" },
  needs: [{ id: "g-volunteers", pledged: 1, quantity: 4, tags: ["gardening"] }]
};

test("discovery suggests matching, opted-in actions across all three pillars", () => {
  const state = initialCooperationState();
  const matches = findOpportunities(state, [gardenProject], "barrio-verde");
  assert.deepEqual(matches.map((m) => m.kind).sort(), ["buy", "loan", "project"]);
  assert.ok(matches.every((m) => m.explanation.es && m.explanation.en));
  assert.equal(findOpportunities(state, [gardenProject], "comunidad-sol").length, 1);
});

test("opted-out or cross-community resources cannot become matches", () => {
  const state = initialCooperationState();
  state.assets[0].optedIn = false;
  state.capabilities[0].optedIn = false;
  const matches = findOpportunities(state, [gardenProject], "barrio-verde");
  assert.deepEqual(matches.map((m) => m.kind), ["buy"]);
  state.assets[0].optedIn = true;
  state.assets[0].communityId = "comunidad-sol";
  assert.deepEqual(findOpportunities(state, [gardenProject], "barrio-verde").map((m) => m.kind), ["buy"]);
});

test("a buying group only locks after sufficient commitments, then completes", () => {
  const first = initialCooperationState();
  const prematurely = advanceGroupBuy(first, "buy-rice");
  assert.equal(prematurely.groupBuys[0].phase, "collecting");
  const committed = setMyUnits(first, "buy-rice", 1);
  assert.equal(totalUnits(committed.groupBuys[0]), 12);
  assert.equal(totalUnits(first.groupBuys[0]), 11);
  assert.equal(potentialGrossDifference(committed.groupBuys[0]), 21);
  assert.equal(advanceGroupBuy(committed, "buy-rice").groupBuys[0].phase, "locked");
  const locked = advanceGroupBuy(committed, "buy-rice");
  const fulfilled = advanceGroupBuy(locked, "buy-rice");
  assert.equal(fulfilled.groupBuys[0].phase, "fulfilled");
  assert.equal(setMyUnits(fulfilled, "buy-rice", 99).groupBuys[0].myUnits, 1);
  assert.equal(advanceGroupBuy(fulfilled, "buy-rice").groupBuys[0].phase, "fulfilled");
});

test("invalid buying commitments and unknown supplier quotes have no effect", () => {
  const state = initialCooperationState();
  for (const qty of [-1, 101, 0.5, NaN]) {
    assert.equal(setMyUnits(state, "buy-rice", qty).groupBuys[0].myUnits, 0);
  }
  assert.equal(chooseQuote(state, "buy-rice", "invalid").groupBuys[0].selectedQuoteId, "quote-a");
});

test("loan request must be approved and returned before the asset can be requested again", () => {
  const state = initialCooperationState();
  const requested = requestAsset(state, "asset-drill");
  assert.equal(requested.assets[0].loan.status, "requested");
  assert.equal(requestAsset(requested, "asset-drill").assets[0].loan.status, "requested");
  assert.equal(findOpportunities(requested, [gardenProject], "barrio-verde").some((match) => match.kind === "loan"), false);
  const approved = advanceLoan(requested, "asset-drill");
  assert.equal(approved.assets[0].loan.status, "approved");
  const returned = advanceLoan(approved, "asset-drill");
  assert.equal(returned.assets[0].loan.status, "returned");
  assert.equal(findOpportunities(returned, [gardenProject], "barrio-verde").some((match) => match.kind === "loan"), true);
  const again = requestAsset(returned, "asset-drill");
  assert.equal(again.assets[0].loan.status, "requested");
});
