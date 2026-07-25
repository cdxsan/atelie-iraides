-- ============================================================
-- Migration 00003 — Criar tabelas produto e pedido_item
-- ============================================================

-- 1. Extensão unaccent: permite buscar ignorando acentos
--    Ex: buscar "Jose" encontra "José"
create extension if not exists unaccent;

-- ============================================================
-- 2. Tabela: produto
-- ============================================================
-- Cada vestido que Iraides cadastra para vender.
-- Os campos seguem o MODELO.md.
create table produto (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null default auth.uid() references auth.users(id),
  nome text not null,
  descricao text,
  preco integer not null,
  foto_url text,
  instagram_post_url text,
  disponivel boolean not null default true,
  created_at timestamptz not null default now()
);

-- Liga a fechadura RLS no mesmo instante
alter table produto enable row level security;

-- Regra de dono: cada pessoa só vê e mexe nos próprios produtos
create policy "Dono do produto"
on produto
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- ============================================================
-- 3. Tabela: pedido_item
-- ============================================================
-- Cada vestido dentro de um pedido.
-- Um pedido pode ter vários itens.
-- Produto_id liga ao catalogo, mas nome guarda o nome na hora
-- da compra (se o produto mudar de nome depois, o pedido mantem
-- o nome que tinha no momento).
create table pedido_item (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null default auth.uid() references auth.users(id),
  pedido_id uuid not null references pedido(id) on delete cascade,
  produto_id uuid references produto(id),
  nome text not null,
  quantidade integer not null check (quantidade > 0),
  preco_unitario integer not null check (preco_unitario > 0)
);

-- Liga a fechadura RLS
alter table pedido_item enable row level security;

-- Regra de dono: cada pessoa só vê e mexe nos proprios itens
create policy "Dono do item"
on pedido_item
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- ============================================================
-- 4. Recalculo automatico do total do pedido
-- ============================================================
-- Funcao chamada pelos gatilhos abaixo.
-- Quando um item e inserido, atualizado ou removido,
-- esta funcao atualiza o total do pedido somando
-- (quantidade * preco_unitario) de todos os itens + frete.
create or replace function recalcular_total_pedido()
returns trigger
language plpgsql
as $$
declare
  v_pedido_id uuid;
begin
  -- Pega o id do pedido afetado (OLD em caso de DELETE, NEW nos outros)
  if tg_op = 'DELETE' then
    v_pedido_id := old.pedido_id;
  else
    v_pedido_id := new.pedido_id;
  end if;

  -- Atualiza o total = frete + soma dos itens
  update pedido
  set total = frete_valor + (
    select coalesce(sum(quantidade * preco_unitario), 0)
    from pedido_item
    where pedido_id = v_pedido_id
  )
  where id = v_pedido_id;

  return coalesce(new, old);
end;
$$;

-- Gatilho: quando um item e inserido, alterado ou removido,
-- o total do pedido e recalculado automaticamente
create trigger trigger_recalcular_total_item
after insert or update or delete on pedido_item
for each row execute function recalcular_total_pedido();

-- Gatilho: quando o frete do pedido e alterado,
-- o total e recalculado (frete novo + itens existentes)
create or replace function recalcular_total_frete()
returns trigger
language plpgsql
as $$
begin
  update pedido
  set total = new.frete_valor + (
    select coalesce(sum(quantidade * preco_unitario), 0)
    from pedido_item
    where pedido_id = new.id
  )
  where id = new.id;
  return new;
end;
$$;

create trigger trigger_recalcular_total_frete
after update of frete_valor on pedido
for each row execute function recalcular_total_frete();
