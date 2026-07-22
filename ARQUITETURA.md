# ARQUITETURA.md — Onde cada parte mora

---

## As três camadas do sistema

```
+------------------------------------------------------------------+
|                         CELULAR DO CLIENTE                        |
|  (navegador — Chrome, Safari, qualquer um)                       |
|                                                                  |
|  Front estático                                                  |
|  • Página de apresentação                                        |
|  • Página de cada vestido                                        |
|  • Página "Ver outros modelos"                                   |
|  • Painel do Caderno de Pedidos (quando estiver logado)          |
|                                                                  |
|  Publicado no Cloudflare Pages                                   |
|  Funciona primeiro no celular (390 px)                           |
+------------------------------------------------------------------+
           |                          |
           | consultas                | (futuro) chamadas
           |                          | para IA
           v                          v
+--------------------------+  +------------------+
|       SUPABASE           |  |  EDGE FUNCTION   |
|                          |  |                  |
|  • Banco de dados        |  |  • Cofre da      |
|    (PostgreSQL)          |  |    chave da IA   |
|  • Login / autenticação  |  |                  |
|  • Regras de segurança   |  |  Só roda no      |
|    (Row Level Security)  |  |  servidor do     |
|                          |  |  Cloudflare      |
|  Dados criptografados    |  |                  |
|  em repouso              |  |  Constrói no     |
|                          |  |  dia 9           |
+--------------------------+  +------------------+
```

### O que cada camada faz

**Front estático (navegador)**
São arquivos HTML, CSS e JavaScript puros, sem servidor próprio. Publicados no Cloudflare Pages porque o Cloudflare entrega arquivos estáticos rápido no mundo inteiro e de graça. O cliente abre no celular e vê as telas.

**Supabase (banco + login)**
É um serviço que junta banco de dados PostgreSQL com autenticação. O navegador conversa diretamente com ele (com permissão controlada). O banco guarda os produtos, os pedidos e os itens. O login é do Supabase também — quando chegar, Iraides fará login por e-mail ou WhatsApp.

**Edge Function (futuro cofre da IA)**
É um pedaço de código que roda no servidor do Cloudflare, não no navegador. A chave secreta da IA mora aqui, escondida. O navegador chama essa função quando precisar da IA, mas nunca vê a chave. Será construída no dia 9.

---

## Onde vive cada segredo

| Segredo | Onde mora | Pode ir para o navegador? |
|---|---|---|
| Chave pública do Supabase (anon key) | No código do front, à vista | **Sim** |
| Chave secreta da IA | Dentro da Edge Function, numa variável de ambiente | **NÃO** |

### Por que uma pode e a outra não

A **chave anônima do Supabase** é feita para ficar pública. O Supabase permite que qualquer um leia dados, mas só deixa escrever ou ler dados alheios se quem pediu estiver autenticado e autorizado. É como o número da sua loja — qualquer um pode ver a vitrine, mas só você entra no cofre.

A **chave da IA** é a senha do cofre. Se ela vaza para o navegador, qualquer pessoa pode usá-la de graça, em qualquer lugar, sem o seu controle. Por isso ela vive trancada na Edge Function, que é o único lugar que o navegador não consegue bisbilhotar.

---

## Regra: toda mudança no banco vira SQL no git

Qualquer alteração no banco (criar tabela, adicionar campo, mudar tipo) é escrita em um arquivo `.sql` dentro da pasta `supabase/migrations/` e guardada no git.

```
supabase/
  migrations/
    00001_criar_tabela_produtos.sql
    00002_criar_tabela_pedidos.sql
    00003_criar_tabela_pedido_itens.sql
```

Isso garante que:
- Você tem **histórico** de cada mudança
- Dá para **voltar atrás** se algo der errado
- Outra pessoa (ou você daqui um mês) consegue montar o banco do zero só rodando os arquivos em ordem
