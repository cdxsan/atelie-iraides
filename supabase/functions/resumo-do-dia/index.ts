var ORIGEM_PERMITIDA = "*";
const TEXTO_MAXIMO = 1500;
const LIMITE_DIARIO = 30;
const TIMEOUT_IA_MS = 30_000;

const PROMPT_SISTEMA = `Você é um assistente de uma loja de vestidos.
Extraia as informações do pedido da conversa de WhatsApp abaixo.

Responda APENAS com um JSON neste formato exato, sem explicações adicionais:

{
  "cliente_nome": "Nome completo do cliente",
  "cliente_whatsapp": "Número do WhatsApp com DDD e país",
  "cliente_endereco": "Endereço completo de entrega",
  "frete_valor": 1200,
  "total": 10100,
  "itens": [
    { "nome": "Nome do produto", "quantidade": 1, "preco_unitario": 8900 }
  ],
  "confianca": 95
}

REGRAS IMPORTANTES:
- Preços sempre em centavos: R$ 89,00 vira 8900, R$ 120,00 vira 12000
- Quantidade sempre número inteiro
- Se um campo nao estiver claro no texto, use null
- confianca: 100 se todos os dados estao explicitos; 70 se alguns foram inferidos; 50 ou menos se muitos estao ambiguos
- frete_valor: se nao foi mencionado, use 1200 (padrao)
- total = (quantidade * preco_unitario de cada item) + frete_valor
- cliente_whatsapp: so numeros com DDD e pais (ex: 5562999999999)`;

function headersCORS() {
  return {
    "Access-Control-Allow-Origin": ORIGEM_PERMITIDA,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Authorization, Content-Type",
  };
}

function respostaJSON(dados, status) {
  if (status === undefined) status = 200;
  return new Response(JSON.stringify(dados), {
    status: status,
    headers: Object.assign({ "Content-Type": "application/json; charset=utf-8" }, headersCORS()),
  });
}

function respostaTexto(texto, status) {
  if (status === undefined) status = 200;
  return new Response(texto, {
    status: status,
    headers: Object.assign({ "Content-Type": "text/plain; charset=utf-8" }, headersCORS()),
  });
}

function formatarPreco(centavos) {
  return "R$ " + (centavos / 100).toFixed(2).replace(".", ",");
}

function getSupabaseUrl() {
  return Deno.env.get("SUPABASE_URL") || "";
}

function getAnonKey() {
  return Deno.env.get("SUPABASE_ANON_KEY") || "";
}

function cabecalhos(authHeader) {
  return {
    "Authorization": authHeader,
    "apikey": getAnonKey(),
    "Content-Type": "application/json",
  };
}

async function consultarAPI(rota, authHeader) {
  const url = getSupabaseUrl() + rota;
  const resp = await fetch(url, { headers: cabecalhos(authHeader) });
  if (!resp.ok) return null;
  return resp.json();
}

async function consultarRPCSemArg(nome, authHeader) {
  const url = getSupabaseUrl() + "/rest/v1/rpc/" + nome;
  const resp = await fetch(url, {
    method: "POST",
    headers: cabecalhos(authHeader),
    body: "{}",
  });
  if (!resp.ok) return null;
  const texto = await resp.text();
  if (texto === "true") return true;
  if (texto === "false") return false;
  try { return JSON.parse(texto); } catch { return null; }
}

async function consultarRPCComArg(nome, args, authHeader) {
  const url = getSupabaseUrl() + "/rest/v1/rpc/" + nome;
  const resp = await fetch(url, {
    method: "POST",
    headers: cabecalhos(authHeader),
    body: JSON.stringify(args),
  });
  if (!resp.ok) return null;
  const texto = await resp.text();
  try { return JSON.parse(texto); } catch { return texto; }
}

async function handleResumo(authHeader) {
  const hoje = new Date().toISOString().substring(0, 10);

  const url = getSupabaseUrl()
    + "/rest/v1/pedido?select=*,pedido_item(id,nome,quantidade,preco_unitario)"
    + "&created_at=gte." + hoje
    + "&order=created_at.desc";

  const resp = await fetch(url, { headers: cabecalhos(authHeader) });
  if (!resp.ok) {
    return respostaTexto("Erro ao consultar o banco.", 500);
  }

  const pedidos = await resp.json();

  if (!pedidos || pedidos.length === 0) {
    return respostaTexto("📋 Nenhum pedido hoje.");
  }

  const grupos = { pendente: [], pago: [], entregue: [] };
  let totalGeral = 0;

  for (const p of pedidos) {
    if (grupos[p.status]) grupos[p.status].push(p);
    totalGeral += p.total;
  }

  const agora = new Date();
  const dataFmt =
    String(agora.getDate()).padStart(2, "0") + "/" +
    String(agora.getMonth() + 1).padStart(2, "0") + "/" +
    agora.getFullYear();

  const linhas = [
    "📋 RESUMO DO DIA — " + dataFmt,
    "",
    "💰 Total geral: " + formatarPreco(totalGeral),
    "📦 Pendentes: " + grupos.pendente.length + "  |  Pagos: " + grupos.pago.length + "  |  Entregues: " + grupos.entregue.length,
    "",
  ];

  const secoes = [
    { chave: "pendente", label: "PENDENTES", emoji: "⏳" },
    { chave: "pago", label: "PAGOS", emoji: "✅" },
    { chave: "entregue", label: "ENTREGUES", emoji: "📦" },
  ];

  for (const secao of secoes) {
    const lista = grupos[secao.chave];
    if (lista.length === 0) continue;
    linhas.push("━━━ " + secao.label + " ━━━");
    for (const pedido of lista) {
      const qtd = pedido.pedido_item ? pedido.pedido_item.length : 0;
      var info = "";
      if (qtd > 0) {
        info = " — " + qtd + " " + (qtd === 1 ? "item" : "itens");
      }
      linhas.push(secao.emoji + " " + pedido.cliente_nome + " — " + formatarPreco(pedido.total) + info);
    }
    linhas.push("");
  }

  return respostaTexto(linhas.join("\n"));
}

async function handleExtrair(req, userId, authHeader) {
  var admin = await consultarRPCSemArg("is_admin", authHeader);
  if (!admin) {
    return respostaJSON({ erro: "So Iraides pode extrair pedidos com IA." }, 403);
  }

  var chamadas = await consultarRPCComArg("contar_chamada", {
    p_user_id: userId,
    p_funcao: "extrair_pedido",
  }, authHeader);

  if (chamadas === null) {
    return respostaJSON({ erro: "Erro interno ao verificar limite." }, 500);
  }

  if (typeof chamadas === "number" && chamadas > LIMITE_DIARIO) {
    return respostaJSON({
      erro: "Voce atingiu o limite de " + LIMITE_DIARIO + " extracoes hoje. Volte amanha.",
    }, 429);
  }

  var body;
  try {
    body = await req.json();
  } catch (_) {
    return respostaJSON({ erro: "Envie um JSON com o campo 'texto'." }, 400);
  }

  var texto = (body.texto || "").trim();

  if (!texto) {
    return respostaJSON({ erro: "O campo 'texto' nao pode ficar vazio." }, 400);
  }

  if (texto.length > TEXTO_MAXIMO) {
    return respostaJSON({
      erro: "Texto muito longo. Maximo de " + TEXTO_MAXIMO + " caracteres.",
    }, 413);
  }

  var apiKey = Deno.env.get("CEREBRAS_API_KEY");
  if (!apiKey) {
    console.error("CEREBRAS_API_KEY nao configurada");
    return respostaJSON({
      erro: "Chave da IA nao configurada. Adicione CEREBRAS_API_KEY nos Secrets do Supabase.",
    }, 500);
  }

  var controller = new AbortController();
  var timer = setTimeout(function() { controller.abort(); }, TIMEOUT_IA_MS);

  try {
    var respostaIA = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Authorization": "Bearer " + apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-oss-120b",
          messages: [
            { role: "system", content: PROMPT_SISTEMA },
            { role: "user", content: texto },
          ],
          temperature: 0.1,
          response_format: { type: "json_object" },
        }),
        signal: controller.signal,
      }
    );

    clearTimeout(timer);

    if (!respostaIA.ok) {
      console.error("Cerebras HTTP", respostaIA.status);
      return respostaJSON({
        erro: "A IA nao conseguiu processar o texto agora. Tente novamente.",
      }, 502);
    }

    var dadosIA = await respostaIA.json();
    var conteudo = dadosIA.choices?.[0]?.message?.content;

    if (!conteudo) {
      console.error("Cerebras: resposta sem content");
      return respostaJSON({ erro: "Resposta vazia da IA." }, 502);
    }

    var sugestao;
    try {
      sugestao = JSON.parse(conteudo);
    } catch (_) {
      console.error("Cerebras: JSON invalido");
      return respostaJSON({ erro: "Formato inesperado da IA." }, 502);
    }

    if (!sugestao.cliente_nome || String(sugestao.cliente_nome).trim() === "") {
      var confAtual = typeof sugestao.confianca === "number" ? sugestao.confianca : 100;
      sugestao.confianca = Math.min(confAtual, 20);
    }

    if (typeof sugestao.confianca !== "number") {
      sugestao.confianca = 50;
    }

    sugestao.texto_bruto = texto;

    return respostaJSON({ sugestao: sugestao });
  } catch (erro) {
    clearTimeout(timer);
    if (erro instanceof Error && erro.name === "AbortError") {
      return respostaJSON({ erro: "A IA demorou muito. Tente com um texto mais curto." }, 504);
    }
    console.error("Erro extracao:", erro instanceof Error ? erro.message : erro);
    return respostaJSON({ erro: "Erro inesperado. Tente novamente." }, 500);
  }
}

Deno.serve(async function(req) {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: headersCORS() });
  }

  var authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return respostaJSON({ erro: "Voce precisa estar logado." }, 401);
  }

  var urlUser = getSupabaseUrl() + "/auth/v1/user";
  var respUser = await fetch(urlUser, {
    headers: {
      "Authorization": authHeader,
      "apikey": getAnonKey(),
    },
  });

  if (!respUser.ok) {
    return respostaJSON({ erro: "Token invalido ou expirado." }, 401);
  }

  var usuario = await respUser.json();
  var userId = usuario.id;

  if (req.method === "GET") {
    return handleResumo(authHeader);
  }

  if (req.method === "POST") {
    return handleExtrair(req, userId, authHeader);
  }

  return respostaJSON({ erro: "Metodo nao permitido." }, 405);
});
