namespace Yunvia.Domain;

/// <summary>Transport contracts for the temporary, stateless demonstration API.</summary>
public sealed record LocalizedText(string Es, string En);
public sealed record SkillTask(string Id, LocalizedText Label, IReadOnlyList<string> Terms);
public sealed record SkillGroup(string Id, LocalizedText Label, IReadOnlyList<SkillTask> Tasks);

public sealed record NeedInput(
    string Id, string CommunityId, string Kind, string Tag, LocalizedText Title,
    bool Active, IReadOnlyList<string>? SkillTaskIds = null);
public sealed record CapabilityInput(
    string Id, string CommunityId, bool OptedIn, IReadOnlyList<string>? SkillTaskIds = null);
public sealed record LoanInput(string Status);
public sealed record AssetInput(
    string Id, string CommunityId, string Tag, LocalizedText Title, bool OptedIn, LoanInput? Loan);
public sealed record GroupBuyInput(string Id, string CommunityId, string Tag, string Phase);
public sealed record ProjectNeedInput(int Quantity, int Pledged, IReadOnlyList<string>? SkillTaskIds = null);
public sealed record ProjectInput(
    string Id, string CommunityId, LocalizedText Title, IReadOnlyList<ProjectNeedInput> Needs);
public sealed record MatchRequest(
    string CommunityId,
    IReadOnlyList<NeedInput> Needs,
    IReadOnlyList<CapabilityInput> Capabilities,
    IReadOnlyList<AssetInput> Assets,
    IReadOnlyList<GroupBuyInput> GroupBuys,
    IReadOnlyList<ProjectInput> Projects);
public sealed record Opportunity(
    string Id, string Kind, string NeedId, string TargetId,
    LocalizedText Title, LocalizedText Explanation);
public sealed record MatchResponse(IReadOnlyList<Opportunity> Opportunities);
