-- ============================================================
-- Migration 00006 — Corrigir recursao infinita no RLS do perfil
-- ============================================================
-- A politica antiga fazia SELECT na tabela perfil para saber
-- se o usuario e admin, mas esse SELECT tambem passa pelo RLS,
-- criando um loop infinito.
-- 
-- Solucao: criar uma funcao com security definer (ignora RLS)
-- e usa-la tanto nas policies quanto no JavaScript.

-- 1. Funcao que verifica se o usuario logado e admin
--    security definer = executa como dono da funcao, sem RLS
--    stable = nao modifica o banco, pode ser otimizada
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from public.perfil
    where user_id = auth.uid() and papel = 'admin'
  );
$$;

-- 2. Corrigir policy do perfil (substituir a recursiva)
drop policy if exists "Admin ler todos os perfis" on perfil;
create policy "Admin ler todos os perfis"
on perfil
for select
using (public.is_admin());

-- 3. Corrigir policy do pedido
drop policy if exists "Admin ver todos os pedidos" on pedido;
create policy "Admin ver todos os pedidos"
on pedido
for all
using (public.is_admin());

-- 4. Corrigir policy do pedido_item
drop policy if exists "Admin ver todos os itens" on pedido_item;
create policy "Admin ver todos os itens"
on pedido_item
for all
using (public.is_admin());

-- 5. Corrigir policy do produto
drop policy if exists "Admin ver todos os produtos" on produto;
create policy "Admin ver todos os produtos"
on produto
for all
using (public.is_admin());
