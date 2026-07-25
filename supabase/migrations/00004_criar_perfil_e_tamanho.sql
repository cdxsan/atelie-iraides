-- ============================================================
-- Migration 00004 — Criar perfil de usuario e campo tamanho
-- ============================================================

-- ============================================================
-- 1. Adicionar campo tamanho em pedido_item
-- ============================================================
-- Registra o tamanho (P, M, G, GG) que o cliente escolheu
alter table pedido_item
add column tamanho text not null default '';

-- ============================================================
-- 2. Tabela: perfil
-- ============================================================
-- Cada usuario tem um papel: admin (Iraides) ou cliente
-- user_id e unico (cada pessoa tem um so perfil)
create table perfil (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references auth.users(id) unique,
  papel text not null default 'cliente' check (papel in ('admin', 'cliente')),
  created_at timestamptz not null default now()
);

-- Liga a fechadura RLS
alter table perfil enable row level security;

-- Regra 1: qualquer pessoa logada pode ler o proprio perfil
create policy "Ler proprio perfil"
on perfil
for select
using (auth.uid() = user_id);

-- Regra 2: admin pode ler todos os perfis
-- (para decidir se um usuario e admin, o banco olha a tabela perfil)
create policy "Admin ler todos os perfis"
on perfil
for select
using (
  exists (
    select 1 from perfil
    where user_id = auth.uid() and papel = 'admin'
  )
);

-- ============================================================
-- 3. Gatilho: criar perfil automaticamente ao cadastrar
-- ============================================================
-- Quando alguem cria uma conta, o banco ja insere o perfil
-- como 'cliente' sem precisar de codigo JavaScript
create or replace function criar_perfil_cliente()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.perfil (user_id, papel)
  values (new.id, 'cliente')
  on conflict (user_id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.criar_perfil_cliente();

-- ============================================================
-- 4. Preencher perfis dos usuarios existentes
-- ============================================================
-- Cria perfil 'cliente' para todas as contas que ja existem
insert into perfil (user_id, papel)
select id, 'cliente'
from auth.users
on conflict (user_id) do nothing;

-- Marca Iraides como admin
update perfil
set papel = 'admin'
where user_id = (select id from auth.users where email = 'iraides@atelie.com');
