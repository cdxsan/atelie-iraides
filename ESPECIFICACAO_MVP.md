# Especificação do MVP — Plataforma de Venda de Vestidos da Iraides

## 1. O Problema

Iraides vende vestidos casuais femininos para passeios de fim de semana. Hoje as peças não têm exposição nenhuma para o público final. Quem compra são apenas os mesmos fornecedores (revendedores) de Aparecida de Goiânia — GO, que revendem com margem de 100%+. Fornecedores novos não aparecem há muito tempo. Clientes finais que veriam as peças no Instagram não têm como comprar.

## 2. Quem sofre

- **Iraides** — não consegue aumentar as vendas nem atingir o consumidor final.
- **Clientes finais** — veem os vestidos no Instagram mas não têm canal de compra.

## 3. O que conta como sucesso

**Vender 10 peças para compradores finais por mês** (não revendedores).

## 4. O fluxo do cliente (Instagram → compra)

1. Cliente vê o vestido no feed/story do Instagram da Iraides.
2. Clica no **link da bio**.
3. É direcionada para uma página do site que mostra o vestido do post + outras opções disponíveis.
4. Na página do produto, digita o **CEP** para ver o frete (valor fixo, média da região).
5. Clica em **Comprar**.
6. É direcionada para o **WhatsApp comercial** da Iraides com uma mensagem pronta contendo:
   - Nome do vestido
   - Valor do produto + frete = **total**
   - Endereço de entrega informado
   - Chave PIX para pagamento
   - Instrução: "Envie o comprovante aqui"
7. Cliente paga o PIX e envia o comprovante no WhatsApp.
8. **Iraides recebe o comprovante + endereço no WhatsApp pessoal**.
9. Iraides prepara, entrega e avisa o cliente.

## 5. O que fica de FORA (pós-MVP)

- Login / cadastro de cliente
- Controle de estoque
- Avaliações e opiniões de clientes
- Cálculo de frete por API do Uber (substitui por frete fixo)
- Modelo virtual com IA
- Revisão manual de descrições geradas por IA

## 6. A única inteligência artificial do sistema

**Descrição automática do produto**: ao subir a foto de um vestido no cabide, o sistema remove automaticamente o fundo da imagem e escreve sozinho o nome, a cor, o comprimento e sugestões básicas de uso. Tudo 100% automático, sem revisão manual.

> "A IA olha a foto do vestido no cabide e devolve: foto sem fundo + descrição pronta (nome, cor, comprimento, ocasião)."

## 7. Tecnologias para implementar em 10 dias

### Site (front-end)
- Página inicial com lista de vestidos disponíveis
- Página individual de cada produto com:
  - Foto otimizada (fundo removido)
  - Descrição gerada automaticamente
  - Campo de CEP
  - Exibição do frete (valor fixo)
  - Botão "Comprar via WhatsApp"

### Processamento de imagens e IA
- Removedor de fundo automático (ex: rembg ou similar)
- IA de descrição textual (ex: API de visão computacional)

### WhatsApp
- Geração de link com mensagem pré-formatada contendo dados do pedido

### Painel interno (simples)
- Iraides consegue cadastrar um vestido novo subindo apenas a foto
- Sistema gera a descrição e disponibiliza no site

## 8. Decisões arquiteturais

| Decisão | Escolha |
|---|---|
| Frete | Valor fixo (média de Aparecida de Goiânia) |
| Cadastro de produto | 100% automático (sobe foto → sistema faz o resto) |
| Compra | Redireciona para WhatsApp com mensagem formatada |
| Pagamento | PIX (cliente paga manualmente e envia comprovante) |
| Autenticação | Nenhuma — site aberto, sem login |
| Entrega | Iraides prepara e despacha, avisa o cliente |

## 9. Critério de sucesso para o MVP

10 peças vendidas para compradores finais no primeiro mês de operação.
