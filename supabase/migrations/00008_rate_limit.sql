-- ============================================================
-- Migration 00008 — Rate limit para chamadas de IA
-- ============================================================
-- Cria uma tabela que conta quantas vezes cada usuario chamou
-- cada funcao de IA por dia. A funcao contar_chamada() faz o
-- incremento e devolve o total de forma atomica.
--
-- security definer = a funcao ignora RLS e roda como dona.
-- Isso permite que a Edge Function (cliente logado) consiga
-- contar chamadas sem precisar da chave service_role.
-- ============================================================

-- 1. Tabela de contagem
create table if not exists rate_limits (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references auth.users(id),
  funcao text not null,
  data date not null default current_date,
  chamadas integer not null default 1
);

-- Indice unico: um registro por usuario / funcao / dia
create unique index if not exists idx_rate_limits_unique
on rate_limits(user_id, funcao, data);

-- 2. Funcao que incrementa e devolve o total
create or replace function public.contar_chamada(
  p_user_id uuid,
  p_funcao text
)
returns integer
language plpgsql
security definer
stable
as $$
declare
  v_chamadas integer;
begin
  insert into rate_limits (user_id, funcao, data, chamadas)
  values (p_user_id, p_funcao, current_date, 1)
  on conflict (user_id, funcao, data)
  do update set chamadas = rate_limits.chamadas + 1
  returning chamadas into v_chamadas;

  return v_chamadas;
end;
$$;
