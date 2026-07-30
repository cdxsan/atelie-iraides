-- ============================================================
-- Migration 00010 — Validar campos de texto no banco
-- ============================================================
-- As validações de "nome em branco", "whatsapp vazio" e
-- "endereço vazio" estavam só no JavaScript. Um atacante pode
-- chamar a API REST direto e mandar string vazia — o banco
-- aceita porque not null só impede NULL, não ''.
--
-- Esta migration adiciona check constraints para garantir que
-- esses campos tenham pelo menos 1 caractere que não seja espaço.
-- ============================================================

-- 1. cliente_nome: não pode ser vazio nem só espaço
alter table pedido
add constraint pedido_cliente_nome_nao_vazio
check (cliente_nome is null or length(trim(cliente_nome)) > 0);

-- 2. cliente_whatsapp: não pode ser vazio nem só espaço
alter table pedido
add constraint pedido_cliente_whatsapp_nao_vazio
check (cliente_whatsapp is null or length(trim(cliente_whatsapp)) > 0);

-- 3. cliente_endereco: não pode ser vazio nem só espaço
alter table pedido
add constraint pedido_cliente_endereco_nao_vazio
check (cliente_endereco is null or length(trim(cliente_endereco)) > 0);
