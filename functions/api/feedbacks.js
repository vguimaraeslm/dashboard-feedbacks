export async function onRequestGet(context) {
  const { searchParams } = new URL(context.request.url);
  const marca = searchParams.get('marca');
  const versao = searchParams.get('versao');
  const formato = searchParams.get('formato');

  try {
    let query = "SELECT * FROM video_feedbacks";
    const params = [];
    const conditions = [];

    // Filtros dinâmicos baseados na URL
    if (marca && marca !== "Todas") {
      conditions.push("video_marca = ?");
      params.push(marca);
    }
    if (versao && versao !== "Todas") {
      conditions.push("video_versao = ?");
      params.push(versao);
    }
    if (formato && formato !== "Todos") {
      conditions.push("video_formato = ?");
      params.push(formato);
    }

    if (conditions.length > 0) {
      query += " WHERE " + conditions.join(" AND ");
    }

    query += " ORDER BY created_at DESC LIMIT 100";

    // DB é o binding que você configurou no dashboard da Cloudflare
    const stmt = context.env.DB.prepare(query).bind(...params);
    const { results } = await stmt.all();
    
    return Response.json(results);
    
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}