-- ============================================================
-- Migration 00007 — Semear tabela produto com vestidos iniciais
-- ============================================================
-- Insere os vestidos que antes estavam apenas no JavaScript
-- na tabela produto do banco de dados.
-- Cada produto fica com o user_id do admin (iraides@atelie.com).

-- Primeiro descobre o id do admin
do $$
declare
  v_admin_id uuid;
begin
  select id into v_admin_id from auth.users where email = 'iraides@atelie.com';

  -- So insere se a tabela estiver vazia
  if not exists (select 1 from produto limit 1) then
    insert into produto (user_id, nome, descricao, preco, disponivel) values
      (v_admin_id, 'Vestido Florido Azul',    'Curto, manga curta, tecido leve. Ideal para passeios diurnos de fim de semana.',       8900,  true),
      (v_admin_id, 'Vestido Linho Bege',      'Midi, alça fina, tecido de linho. Fresco e elegante para dias quentes.',               12000, true),
      (v_admin_id, 'Vestido Estampado Vermelho', 'Longo, estampa floral, decote V. Perfeito para eventos durante o dia.',             9500,  true),
      (v_admin_id, 'Vestido Midi Preto',      'Midi, gola redonda, tecido acetinado. Básico versátil do armário.',                    11000, true),
      (v_admin_id, 'Vestido Cropped Verde',   'Curto, modelo cropped, tecido viscolycra. Moderno e confortável.',                     7500,  true);
  end if;
end;
$$;
