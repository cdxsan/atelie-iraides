-- ============================================================
-- Migration 00009 — Fechar RLS na tabela rate_limits
-- ============================================================
-- A tabela rate_limits foi criada sem RLS, o que significa que
-- qualquer um com a chave anônima podia ler, escrever e apagar
-- registros dela — inclusive zerar o próprio limite de IA e
-- continuar usando de graça.
--
-- Esta migration:
-- 1. Liga a fechadura RLS na tabela
-- 2. Cria a policy de dono (cada um só vê/mexe na sua contagem)
--    com USING e WITH CHECK — tanto para leitura quanto escrita
-- 3. Cria a policy para admin ver tudo (igual às outras tabelas)
-- 4. Nada muda para a edge function: a função contar_chamada()
--    usa security definer, então ela continua funcionando mesmo
--    com RLS ligada.
-- ============================================================

-- 1. Liga a fechadura
alter table rate_limits enable row level security;

-- 2. Policy de dono: cada um vê e mexe só nos próprios registros
--    FOR ALL cobre SELECT, INSERT, UPDATE, DELETE
--    USING  → ninguém vê registro que não é seu
--    WITH CHECK → ninguém cria/edita registro com user_id de outro
create policy "Dono do rate_limit"
on rate_limits
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- 3. Admin pode ver qualquer contagem (diagnóstico)
--    Sem WITH CHECK para evitar que admin crie registros
--    para outros usuários acidentalmente
create policy "Admin ver todas as contagens"
on rate_limits
for select
using (public.is_admin());
