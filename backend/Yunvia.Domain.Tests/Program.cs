using Yunvia.Domain;

var tests = 0;
void Check(bool success, string description)
{
    tests++;
    if (!success) throw new Exception("FAIL: " + description);
    Console.WriteLine("PASS: " + description);
}

var text = new LocalizedText("Huerto", "Garden");
var request = new MatchRequest(
    "barrio",
    [
        new("need-skill", "barrio", "skill", "gardening", text, true, ["gardening.planting"]),
        new("need-tool", "barrio", "tool", "drill", text, true),
        new("need-buy", "barrio", "buy", "rice", text, true)
    ],
    [new("cap", "barrio", true, ["gardening.planting"])],
    [new("drill", "barrio", "drill", text, true, null)],
    [new("buy", "barrio", "rice", "collecting")],
    [new("project", "barrio", text, [new(2, 0, ["gardening.planting"])])]
);

Check(SkillCatalog.IsKnown("gardening.planting"), "curated taxonomy recognizes known activity");
Check(!SkillCatalog.IsKnown("farting"), "free-text nonsense does not become a task ID");
var matched = OpportunityMatcher.Match(request).Opportunities;
Check(matched.Count == 3 && matched.Select(x => x.Kind).Order().SequenceEqual(["buy", "loan", "project"]),
    "all three pillars match when legitimately eligible");
Check(matched.All(o => !string.IsNullOrWhiteSpace(o.Explanation.Es) &&
    !string.IsNullOrWhiteSpace(o.Explanation.En)), "matches explain themselves in both languages");

var noConsent = request with { Capabilities = [new("cap", "barrio", false, ["gardening.planting"])] };
Check(!OpportunityMatcher.Match(noConsent).Opportunities.Any(o => o.Kind == "project"), "no consent means no skill match");

var anotherCommunity = request with { Capabilities = [new("cap", "other", true, ["gardening.planting"])] };
Check(!OpportunityMatcher.Match(anotherCommunity).Opportunities.Any(o => o.Kind == "project"), "community boundaries prevent skill matches");

var wrongTask = request with { Capabilities = [new("cap", "barrio", true, ["gardening.planning"])] };
Check(!OpportunityMatcher.Match(wrongTask).Opportunities.Any(o => o.Kind == "project"), "broad categories do not match different tasks");

var forgedText = request with { Capabilities = [new("cap", "barrio", true, ["pretend.pro"]) ] };
Check(!OpportunityMatcher.Match(forgedText).Opportunities.Any(o => o.Kind == "project"), "unknown skill IDs are ignored");

var taken = request with { Assets = [new("drill", "barrio", "drill", text, true, new("approved"))] };
Check(!OpportunityMatcher.Match(taken).Opportunities.Any(o => o.Kind == "loan"), "loaned tools are not offered twice");

var closedBuy = request with { GroupBuys = [new("buy", "barrio", "rice", "locked")] };
Check(!OpportunityMatcher.Match(closedBuy).Opportunities.Any(o => o.Kind == "buy"), "closed group buys cannot recruit new participants");

var unrelatedProduct = request with { GroupBuys = [new("buy", "barrio", "eggs", "collecting")] };
Check(!OpportunityMatcher.Match(unrelatedProduct).Opportunities.Any(o => o.Kind == "buy"), "buying matching requires identical product tags");

Console.WriteLine($"All {tests} backend domain checks passed.");
