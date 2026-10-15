namespace Yunvia.Domain;

/// <summary>
/// This catalog is the source of truth when the .NET API is enabled.
/// In offline browser demo mode, the TypeScript snapshot is used instead.
/// </summary>
public static class SkillCatalog
{
    public static readonly IReadOnlyList<SkillGroup> Groups =
    [
        new("agriculture", new("Agricultura y huertos", "Gardening and agriculture"),
        [
            new("gardening.planting", new("Sembrar y trasplantar", "Planting and transplanting"), ["sembrar", "plantar", "planting", "seedlings"]),
            new("gardening.soil", new("Preparar y cuidar el suelo", "Soil preparation and care"), ["tierra", "suelo", "soil", "compost"]),
            new("gardening.planning", new("Planificar un huerto", "Planning a garden"), ["diseñar huertos", "huerto", "garden planning"])
        ]),
        new("education", new("Educación y enseñanza", "Education and tutoring"),
        [
            new("tutoring.math", new("Enseñar matemáticas", "Math tutoring"), ["mates", "matematicas", "maths", "algebra"]),
            new("tutoring.digital", new("Enseñar habilidades digitales", "Teaching digital skills"), ["computadora", "computers", "digital literacy"])
        ]),
        new("repair", new("Reparación y tecnología", "Repair and technology"),
        [
            new("repair.computers", new("Diagnóstico de computadoras", "Computer troubleshooting"), ["pc", "windows", "laptop", "computadoras"]),
            new("repair.bicycles", new("Reparación básica de bicicletas", "Basic bicycle repair"), ["bicicleta", "bici", "bikes", "cycle"])
        ]),
        new("community", new("Organización y apoyo", "Organization and assistance"),
        [
            new("community.events", new("Organizar eventos", "Event coordination"), ["eventos", "logistica", "events", "organizer"]),
            new("community.transport", new("Coordinar transporte", "Transportation coordination"), ["transporte", "rides", "transportation"])
        ]),
        new("food", new("Alimentos y cocina", "Food and cooking"),
        [
            new("food.meals", new("Preparar comidas comunitarias", "Community meal preparation"), ["cocina", "cocinar", "cooking", "meal prep"]),
            new("food.preservation", new("Conservar alimentos", "Food preservation"), ["conservas", "fermentacion", "preserving", "canning"])
        ])
    ];

    private static readonly IReadOnlyDictionary<string, SkillTask> TasksById =
        Groups.SelectMany(group => group.Tasks).ToDictionary(task => task.Id, StringComparer.Ordinal);

    public static bool IsKnown(string? id) => id is not null && TasksById.ContainsKey(id);

    public static LocalizedText Label(string id) =>
        TasksById.TryGetValue(id, out var task) ? task.Label : new(id, id);
}
