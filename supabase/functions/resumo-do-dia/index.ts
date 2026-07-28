// ──────────────────────────────────────────────────────────
//  EDGE FUNCTION: resumo-do-dia
// ──────────────────────────────────────────────────────────
//  O que faz:
//    Puxa os pedidos de hoje do banco e monta um texto
//    resumido, pronto para Iraides colar no WhatsApp.
//
//  Segurança (3 regras que você não abre mão):
//
//    Regra 1 — verify_jwt
//      No painel do Supabase, ao criar a função, ative
//      "JWT verification". Assim, se um deslogado tentar
//      chamar a função, o próprio Supabase barra antes
//      de executar qualquer código.
//
//    Regra 2 — RLS respeita o dono do dado
//      O cliente Supabase dentro da função é criado com
//      o TOKEN de quem chamou (não com a chave service_role).
//      Isso faz o Row Level Security do banco funcionar:
//        • Admin (Iraides) → vê TODOS os pedidos de todos
//        • Cliente comum    → vê só os próprios pedidos
//      Quem decide é o banco, não o código.
//
//    Regra 3 — Nenhuma chave nova no navegador
//      TUDO roda no servidor do Supabase. O navegador
//      só vê a URL da função. As chaves (SUPABASE_URL,
//      SUPABASE_ANON_KEY) são injetadas automaticamente
//      pelo Supabase como variável de ambiente — não
//      aparecem em lugar nenhum do código do front.
// ──────────────────────────────────────────────────────────

// ─── Importações ─────────────────────────────────────────
// Edge Function roda em Deno, não em Node.js.
// As importações são por URL, não por npm install.
// O Supabase já entende isso nativamente.
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ─── Utilitários ─────────────────────────────────────────

function responderErro(status: number, mensagem: string): Response {
  return new Response(mensagem, {
    status,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Access-Control-Allow-Origin": "*",
    },
  });
}

function formatarPreco(centavos: number): string {
  // Converte de centavos (8900) para reais (R$ 89,00)
  return "R$ " + (centavos / 100).toFixed(2).replace(".", ",");
}

// ─── Monta o texto do resumo ────────────────────────────

function montarResumo(pedidos: any[]): string {
  if (!pedidos || pedidos.length === 0) {
    return "📋 Nenhum pedido hoje.";
  }

  // Agrupa os pedidos por status
  const grupos: Record<string, any[]> = {
    pendente: [],
    pago: [],
    entregue: [],
  };
  let totalGeral = 0;

  for (const pedido of pedidos) {
    const status = pedido.status;
    if (grupos[status]) {
      grupos[status].push(pedido);
    }
    totalGeral += pedido.total;
  }

  // Data de hoje no formato brasileiro
  const agora = new Date();
  const dia = String(agora.getDate()).padStart(2, "0");
  const mes = String(agora.getMonth() + 1).padStart(2, "0");
  const ano = agora.getFullYear();
  const dataFormatada = `${dia}/${mes}/${ano}`;

  // Monta o texto linha a linha
  const linhas: string[] = [];

  // ── Cabeçalho ──
  linhas.push(`📋 RESUMO DO DIA — ${dataFormatada}`);
  linhas.push("");

  // ── Totais ──
  const qtdPendentes = grupos.pendente.length;
  const qtdPagos = grupos.pago.length;
  const qtdEntregues = grupos.entregue.length;
  linhas.push(`💰 Total geral: ${formatarPreco(totalGeral)}`);
  linhas.push(
    `📦 Pendentes: ${qtdPendentes}  |  Pagos: ${qtdPagos}  |  Entregues: ${qtdEntregues}`
  );
  linhas.push("");

  // ── Lista por status ──
  // Só mostra a seção se tiver pelo menos 1 pedido naquele status
  const secoes = [
    { chave: "pendente", label: "PENDENTES", emoji: "⏳" },
    { chave: "pago", label: "PAGOS", emoji: "✅" },
    { chave: "entregue", label: "ENTREGUES", emoji: "📦" },
  ];

  for (const secao of secoes) {
    const lista = grupos[secao.chave];
    if (lista.length === 0) continue;

    linhas.push(`━━━ ${secao.label} ━━━`);
    for (const pedido of lista) {
      const qtdItens = pedido.pedido_item?.length ?? 0;
      const plural = qtdItens === 1 ? "item" : "itens";
      const infoItens = qtdItens > 0 ? ` — ${qtdItens} ${plural}` : "";
      linhas.push(
        `${secao.emoji} ${pedido.cliente_nome} — ${formatarPreco(pedido.total)}${infoItens}`
      );
    }
    linhas.push("");
  }

  return linhas.join("\n");
}

// ─── Função principal ────────────────────────────────────
// O Supabase chama esta função quando alguém faz uma
// requisição HTTP para /functions/v1/resumo-do-dia
// ─────────────────────────────────────────────────────────

serve(async (req: Request): Promise<Response> => {
  // ── CORS: responder requisições de preflight ──
  // O navegador envia um OPTIONS antes do GET/POST real
  // para perguntar se pode chamar a função.
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Authorization, Content-Type",
      },
    });
  }

  // ============================================================
  //  REGRA 1: VERIFICAR AUTENTICAÇÃO
  // ============================================================
  // O verify_jwt (ativado no painel do Supabase) já bloqueia
  // requisições sem token antes de entrar na função. Mesmo assim
  // a gente verifica de novo aqui — segurança em camadas.
  //
  // O token JWT vem no cabeçalho Authorization.
  // Exemplo: "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
  // ============================================================

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return responderErro(
      401,
      "Erro: você precisa estar logado para acessar esta função."
    );
  }

  // ============================================================
  //  REGRA 2: CRIAR CLIENTE SUPABASE COM O TOKEN DO USUÁRIO
  // ============================================================
  // Em vez de usar a chave service_role (que ignora o RLS),
  // a gente passa o token de quem chamou. Assim o Supabase
  // sabe QUEM está perguntando e aplica as regras certinhas:
  //
  //   Admin (Iraides) → policy de admin → enxerga TUDO
  //   Cliente comum   → policy de dono  → só seus pedidos
  //
  // SUPABASE_URL e SUPABASE_ANON_KEY são variáveis de ambiente
  // injetadas automaticamente pelo Supabase na Edge Function.
  // Nenhuma chave nova aparece no código do navegador (Regra 3).
  // ============================================================

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    {
      global: {
        headers: { Authorization: authHeader },
      },
    }
  );

  // ============================================================
  //  IDENTIFICAR O USUÁRIO
  // ============================================================
  // O Supabase decodifica o token JWT e devolve os dados do
  // usuário. Se o token venceu ou é inválido, barra aqui.
  // ============================================================

  const { data: usuario, error: erroUsuario } = await supabase.auth.getUser();

  if (erroUsuario || !usuario?.user) {
    console.error("Erro ao validar token:", erroUsuario?.message);
    return responderErro(
      401,
      "Erro: token inválido ou expirado. Faça login novamente."
    );
  }

  // ============================================================
  //  BUSCAR PEDIDOS DE HOJE
  // ============================================================
  // Usa .select com o token do usuário logado. O RLS do banco
  // filtra automaticamente baseado em quem está perguntando:
  //
  //   - Admin  → todas as linhas (policy "Admin ver todos")
  //   - Cliente → só as linhas com user_id = auth.uid()
  //
  // O .gte("created_at", hoje) filtra apenas pedidos de hoje.
  // "hoje" é meia-noite UTC. Se sentir falta de pedidos do fim
  // da noite (após 21h no Brasil), a gente ajusta o fuso depois.
  //
  // O select "pedido_item(...)" traz os itens junto com o pedido
  // (útil para o resumo mostrar quantos itens cada pedido tem).
  // ============================================================

  const hoje = new Date().toISOString().substring(0, 10);

  const { data: pedidos, error: erroPedidos } = await supabase
    .from("pedido")
    .select("*, pedido_item(id, nome, quantidade, preco_unitario)")
    .gte("created_at", hoje)
    .order("created_at", { ascending: false });

  if (erroPedidos) {
    console.error("Erro ao buscar pedidos:", erroPedidos);
    return responderErro(
      500,
      "Erro ao consultar o banco de dados. Tente novamente."
    );
  }

  // ============================================================
  //  MONTAR E DEVOLVER O RESUMO
  // ============================================================
  // A resposta é texto puro (não JSON) porque o destino é
  // colar no WhatsApp.
  // ============================================================

  const texto = montarResumo(pedidos ?? []);

  return new Response(texto, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Access-Control-Allow-Origin": "*",
    },
  });
});
