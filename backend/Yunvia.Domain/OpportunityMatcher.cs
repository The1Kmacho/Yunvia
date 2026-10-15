namespace Yunvia.Domain;

/// <summary>
/// Pure deterministic matching. Never matches on user-supplied descriptions, experience
/// claims, or loose category names. This is discovery only, not an authorization boundary.
/// </summary>
public static class OpportunityMatcher
{
    public static MatchResponse Match(MatchRequest data)
    {
        var matches = new List<Opportunity>();
        if (string.IsNullOrWhiteSpace(data.CommunityId)) return new(matches);

        foreach (var need in data.Needs)
        {
            if (!need.Active || need.CommunityId != data.CommunityId) continue;

            if (need.Kind == "tool")
            {
                foreach (var asset in data.Assets)
                {
                    if (!asset.OptedIn || asset.CommunityId != data.CommunityId || asset.Tag != need.Tag) continue;
                    if (asset.Loan is not null && asset.Loan.Status != "returned") continue;
                    matches.Add(new(
                        need.Id + ":" + asset.Id, "loan", need.Id, asset.Id,
                        new("Hay una herramienta disponible", "A shared tool is available"),
                        new(
                            "Solicitaste “" + need.Title.Es + "” y alguien ofreció “" + asset.Title.Es + "” en tu comunidad.",
                            "You listed “" + need.Title.En + "” and a member opted to share “" + asset.Title.En + "” in your community.")
                    ));
                }
            }
            else if (need.Kind == "buy")
            {
                foreach (var groupBuy in data.GroupBuys)
                {
                    if (groupBuy.CommunityId != data.CommunityId || groupBuy.Tag != need.Tag ||
                        groupBuy.Phase != "collecting") continue;
                    matches.Add(new(
                        need.Id + ":" + groupBuy.Id, "buy", need.Id, groupBuy.Id,
                        new("Puedes unirte a una compra colectiva", "A group purchase matches your need"),
                        new(
                            "Solicitaste “" + need.Title.Es + "” y ya hay una compra colectiva organizándose.",
                            "You listed “" + need.Title.En + "” and a buying group is already organizing.")
                    ));
                }
            }
            else if (need.Kind == "skill")
            {
                var requested = KnownTasks(need.SkillTaskIds);
                if (requested.Count == 0) continue;

                var offered = data.Capabilities
                    .Where(cap => cap.OptedIn && cap.CommunityId == data.CommunityId)
                    .SelectMany(cap => KnownTasks(cap.SkillTaskIds))
                    .ToHashSet(StringComparer.Ordinal);

                foreach (var project in data.Projects.Where(p => p.CommunityId == data.CommunityId))
                {
                    // Match the same specific task across a request, an opted-in offer,
                    // and a still-open project need.
                    var matchedTask = project.Needs
                        .Where(n => n.Quantity > n.Pledged && n.Quantity > 0)
                        .SelectMany(n => KnownTasks(n.SkillTaskIds))
                        .FirstOrDefault(id => requested.Contains(id) && offered.Contains(id));

                    if (matchedTask is null) continue;
                    var label = SkillCatalog.Label(matchedTask);
                    matches.Add(new(
                        need.Id + ":" + project.Id, "project", need.Id, project.Id,
                        new("Hay colaboradores para este proyecto", "Potential project collaborators found"),
                        new(
                            "La actividad “" + label.Es + "” fue seleccionada explícitamente y coincide con una necesidad de “" + project.Title.Es + "”.",
                            "The task “" + label.En + "” was explicitly offered and matches an open need in “" + project.Title.En + "”.")
                    ));
                }
            }
        }
        return new(matches);
    }

    private static HashSet<string> KnownTasks(IReadOnlyList<string>? ids) =>
        ids is null ? [] : ids.Where(SkillCatalog.IsKnown).ToHashSet(StringComparer.Ordinal);
}
