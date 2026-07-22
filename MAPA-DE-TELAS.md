# MAPA-DE-TELAS.md — De fora para dentro

---

## O que é PÚBLICO e o que é PROTEGIDO

| PÚBLICO (qualquer um abre) | PROTEGIDO (só quem está logado) |
|---|---|
| Home (apresentação) | Caderno de Pedidos (lista de pedidos) |
| Página do vestido | Novo Pedido (colar texto do WhatsApp) |
| Ver outros modelos (catálogo) | Painel do Dia (pedidos pendentes) |
| Tela de login | — |

**Público** = o cliente vê os vestidos e compra. Não precisa de cadastro.
**Protegido** = Iraides gerencia os pedidos. Precisa de login (será construído depois).

---

## O caminho dos dados hoje

```
                    PÚBLICO                          PROTEGIDO
                    (cliente)                        (Iraides)
                    ________                         ________

                    +-----------+                    +-----------+
                    |   Home    |                    |  Login    |
                    |  (index)  |                    | (futuro)  |
                    +-----+-----+                    +-----+-----+
                          |                                |
                    +-----+-----+                          |
                    |  Vestido  |                          |
                    |  (único)  |                          |
                    +-----+-----+                          |
                          |                                |
                    +-----+-----+                    +-----+-----+
                    |  Outros   |                    | Caderno  |
                    |  Modelos  |                    | Pedidos  |
                    +-----+-----+                    +-----+-----+
                          |                                |
                          |       +----------+              |
                          +------>|         |<-------------+
                                 | SUPABASE |
                          +------>|         |<------+
                          |       +----------+       |
                    +-----+-----+                    |
                    | WhatsApp  |                    |
                    | (externo) |                    |
                    +-----------+                    |
                                                     |
                                          +----------+-------+
                                          |   Edge Function  |
                                          | (futuro — dia 9) |
                                          |  Chave da IA 🔒  |
                                          +------------------+
```

### Como a seta funciona

1. **Cliente** entra pelo link da bio e cai na página do vestido (público). O navegador busca os dados do produto **diretamente no Supabase** — cada produto tem uma permissão que permite leitura pública.

2. **Cliente** clica em "Comprar" e vai para o **WhatsApp** (fora do sistema). O pedido nasce quando Iraides recebe o comprovante.

3. **Iraides** (protegido, futuro) faz login e vê os pedidos. O navegador dela também busca direto no Supabase, mas com permissão de leitura e escrita — porque ela é a dona.

4. **Futuro (dia 9):** quando Iraides colar o texto do WhatsApp no "Novo Pedido", o navegador chama a **Edge Function**. Ela pega o texto, manda para a IA (com a chave secreta que está trancada lá dentro), devolve o pedido estruturado para Iraides conferir e salvar no Supabase.

---

## Resumo visual do fluxo de dados

```
 HOJE                    AMANHÃ (DIA 9)
─────                    ────────────────

 Navegador ──→ Supabase   Navegador ──→ Supabase
 (cliente    (ler          (Iraides    (ler/escrever
  vê os       produtos)     logada)     pedidos)
  vestidos)

                           Navegador ──→ Edge Function ──→ API da IA
                           (Iraides      (cofre com a     (extrai o
                            cola o        chave secreta)   pedido)
                            texto)
```

A chave da IA **nunca** sai da Edge Function. Ela não aparece no HTML, não entra no JavaScript do navegador, não é enviada na URL.
