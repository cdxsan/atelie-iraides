-- ============================================================
-- Migration 00002 — Criar tabela pedido
-- ============================================================

-- 1. Tabela pedido com as colunas do MODELO.md
--    user_id é o dono, preenchido automático com auth.uid()
--    created_at é preenchido sozinho com o momento da inserção
create table pedido (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null default auth.uid() references auth.users(id),
  cliente_nome text not null,
  cliente_whatsapp text not null,
  cliente_endereco text not null,
  frete_valor integer not null,
  total integer not null,
  status text not null default 'pendente' check (status in ('pendente', 'pago', 'entregue')),
  texto_bruto text,
  confianca integer check (confianca >= 0 and confianca <= 100),
  created_at timestamptz not null default now()
);

-- 2. Liga a fechadura (Row Level Security) no mesmo instante
alter table pedido enable row level security;

-- 3. Regra de dono: vale para LER (USING) e para GRAVAR (WITH CHECK)
--    USING → ninguém vê pedido que não é seu
--    WITH CHECK → ninguém cria/edita pedido com user_id de outro
--    FOR ALL cobre SELECT, INSERT, UPDATE, DELETE
create policy "Dono do pedido"
on pedido
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
