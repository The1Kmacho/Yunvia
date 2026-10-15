using Yunvia.Domain;

var builder = WebApplication.CreateBuilder(args);

if (builder.Environment.IsDevelopment())
{
    // Explicit development origins only; never enable wildcard CORS with private data.
    builder.Services.AddCors(options => options.AddPolicy("LocalDev", policy =>
        policy.WithOrigins("http://localhost:3000", "http://127.0.0.1:3000")
            .AllowAnyHeader()
            .AllowAnyMethod()));
}

var app = builder.Build();

app.MapGet("/health", () => Results.Ok(new { status = "ok" }));

// Until accounts, identity and database access controls exist, do not expose
// the client-supplied demonstration matching API outside Development.
if (app.Environment.IsDevelopment())
{
    app.UseCors("LocalDev");

    var demo = app.MapGroup("/api/v1/demo");
    demo.MapGet("/skills", () => Results.Ok(new { groups = SkillCatalog.Groups }));

    demo.MapPost("/opportunities/match", (MatchRequest input) =>
    {
        if (!Valid(input)) return Results.BadRequest(new
        {
            error = "Invalid demo data. Fields must be present and within limits."
        });
        return Results.Ok(OpportunityMatcher.Match(input));
    });
}

app.Run();

static bool Valid(MatchRequest? input)
{
    if (input is null || string.IsNullOrWhiteSpace(input.CommunityId) || input.CommunityId.Length > 100 ||
        input.Needs is null || input.Capabilities is null || input.Assets is null ||
        input.GroupBuys is null || input.Projects is null) return false;

    if (input.Needs.Count > 150 || input.Capabilities.Count > 150 ||
        input.Assets.Count > 150 || input.GroupBuys.Count > 150 || input.Projects.Count > 150) return false;

    return input.Needs.All(n => n is not null && n.Title is not null &&
            n.Id is { Length: > 0 and <= 100 } && n.CommunityId is { Length: > 0 and <= 100 } &&
            n.Kind is "tool" or "buy" or "skill" && n.Tag is { Length: > 0 and <= 40 } &&
            (n.SkillTaskIds?.Count ?? 0) <= 20) &&
        input.Capabilities.All(c => c is not null &&
            c.Id is { Length: > 0 and <= 100 } && c.CommunityId is { Length: > 0 and <= 100 } &&
            (c.SkillTaskIds?.Count ?? 0) <= 20) &&
        input.Assets.All(a => a is not null && a.Title is not null &&
            a.Id is { Length: > 0 and <= 100 } && a.CommunityId is { Length: > 0 and <= 100 }) &&
        input.GroupBuys.All(b => b is not null &&
            b.Id is { Length: > 0 and <= 100 } && b.CommunityId is { Length: > 0 and <= 100 }) &&
        input.Projects.All(p => p is not null && p.Title is not null && p.Needs is not null &&
            p.Id is { Length: > 0 and <= 100 } && p.CommunityId is { Length: > 0 and <= 100 } &&
            p.Needs.Count <= 100 && p.Needs.All(n => n is not null &&
                n.Quantity is >= 0 and <= 100000 && n.Pledged is >= 0 and <= 100000 &&
                (n.SkillTaskIds?.Count ?? 0) <= 20));
}
