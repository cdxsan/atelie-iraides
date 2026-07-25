-- ============================================================
-- Migration 00005 — Admin pode ver todos os pedidos e itens
-- ============================================================
-- As policies existentes bloqueiam cada usuario a ver apenas
-- os proprios registros. Mas Iraides (admin) precisa ver
-- todos os pedidos de todos os clientes.
-- Essas policies extras liberam o acesso para quem e admin.

-- 1. Admin pode ver/editar qualquer pedido
create policy "Admin ver todos os pedidos"
on pedido
for all
using (
  exists (select 1 from perfil where user_id = auth.uid() and papel = 'admin')
);

-- 2. Admin pode ver/editar qualquer item de pedido
create policy "Admin ver todos os itens"
on pedido_item
for all
using (
  exists (select 1 from perfil where user_id = auth.uid() and papel = 'admin')
);

-- 3. Admin pode ver/editar qualquer produto
create policy "Admin ver todos os produtos"
on produto
for all
using (
  exists (select 1 from perfil where user_id = auth.uid() and papel = 'admin')
);
