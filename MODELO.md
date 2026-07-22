# MODELO.md — Tabelas e campos do sistema

---

## Tabela: `produtos`

Cada vestido que Iraides cadastra para vender.

| Campo | Tipo | O que é |
|---|---|---|
| `id` | texto (identificador único) | Crachá do vestido |
| `user_id` | texto (identificador único) | Dono do vestido (veja regra abaixo) |
| `nome` | texto | Nome do vestido |
| `descricao` | texto | Descrição (cor, comprimento, ocasião de uso) |
| `preco` | número (centavos) | Preço em reais multiplicado por 100 (R$ 89,00 vira 8900) |
| `foto_url` | texto | Endereço da foto do vestido |
| `instagram_post_url` | texto | Link do post do Instagram para incorporar |
| `disponivel` | verdadeiro/falso | Se está à venda ou não |
| `created_at` | data e hora | Quando foi cadastrado |

---

## Tabela: `pedidos`

Cada compra feita por um cliente.

| Campo | Tipo | O que é |
|---|---|---|
| `id` | texto (identificador único) | Crachá do pedido |
| `user_id` | texto (identificador único) | Dono do pedido (veja regra abaixo) |
| `cliente_nome` | texto | Nome do cliente |
| `cliente_whatsapp` | texto | WhatsApp do cliente |
| `cliente_endereco` | texto | Endereço completo de entrega |
| `frete_valor` | número (centavos) | Valor do frete |
| `total` | número (centavos) | Produtos + frete |
| `status` | lista fechada | `pendente`, `pago`, `entregue` |
| `texto_bruto` | texto (opcional) | O texto cru colado do WhatsApp — a IA vai preencher no futuro |
| `confianca` | número (0 a 100, opcional) | O quanto a IA confia no que entendeu — a IA vai preencher no futuro |
| `created_at` | data e hora | Quando o pedido foi criado |

### Status do pedido (lista fechada)

- `pendente` — cliente enviou comprovante, Iraides ainda não confirmou
- `pago` — Iraides confirmou o pagamento
- `entregue` — produto saiu para entrega

---

## Tabela: `pedido_itens`

Cada vestido dentro de um pedido. Um pedido pode ter vários itens.

| Campo | Tipo | O que é |
|---|---|---|
| `id` | texto (identificador único) | Crachá do item |
| `user_id` | texto (identificador único) | Dono do item |
| `pedido_id` | texto | Crachá do pedido ao qual este item pertence |
| `produto_id` | texto | Crachá do vestido comprado |
| `quantidade` | número inteiro | Quantas unidades deste vestido |
| `preco_unitario` | número (centavos) | Preço de cada unidade no momento da compra |

### Como se relacionam

```
um pedido  →─── vários pedido_itens
um produto →─── vários pedido_itens
```

Ou seja: a tabela `pedido_itens` liga um pedido a um ou mais produtos.

---

## REGRA QUE NÃO SE NEGOCIA: o dono do dado

**Toda tabela tem `user_id`.** Mesmo que o login ainda não exista. O motivo:

> O dado não é órfão. Ele pertence a Iraides desde o nascimento. Quando o login chegar, o sistema já sabe que todo registro é dela — não precisa adivinhar nem migrar.
