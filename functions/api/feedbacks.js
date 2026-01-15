// Esta função roda no servidor da Cloudflare
export async function onRequestGet(context) {
  try {
    // context.env.DB é a conexão com seu banco D1
    // Aqui fazemos a consulta SQL
    const stmt = context.env.DB.prepare("SELECT * FROM feedbacks ORDER BY id DESC LIMIT 50");
    
    // Executa e pega os resultados
    const { results } = await stmt.all();
    
    // Devolve para o site em formato JSON
    return Response.json(results);
    
  } catch (e) {
    // Se der erro (ex: banco desconectado), avisa o frontend
    return Response.json({ error: e.message }, { status: 500 });
  }
}