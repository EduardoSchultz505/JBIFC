create table if not exists public.jogadores (
  id serial primary key,
  usuario varchar(20) not null,
  senha_hash varchar(100) not null,
  partidas_totais integer not null default 0 check (partidas_totais >= 0),
  criado_em timestamptz not null default now()
);

alter table public.jogadores
  add column if not exists partidas_totais integer not null default 0 check (partidas_totais >= 0);

create unique index if not exists jogadores_usuario_lower_idx
  on public.jogadores (lower(usuario));

create table if not exists public.ranking (
  id serial primary key,
  jogador_id integer references public.jogadores(id) on delete cascade,
  usuario varchar(20) not null,
  pontuacao integer not null check (pontuacao >= 0),
  nivel integer not null default 0 check (nivel >= 0),
  data timestamptz not null default now(),
  constraint ranking_jogador_unico unique (jogador_id)
);

create table if not exists public.conquistas_jogador (
  id serial primary key,
  jogador_id integer not null references public.jogadores(id) on delete cascade,
  codigo varchar(50) not null,
  nome varchar(100) not null,
  descricao text not null,
  icone text not null default '🏆',
  desbloqueado_em timestamptz not null default now(),
  constraint conquistas_jogador_unica unique (jogador_id, codigo)
);

drop view if exists public.ranking_posicoes;

alter table public.ranking
  alter column pontuacao type integer using round(pontuacao)::integer;

drop index if exists public.ranking_usuario_unico;

update public.ranking r
set jogador_id = j.id
from public.jogadores j
where r.jogador_id is null
  and lower(r.usuario) = lower(j.usuario)
  and not exists (select 1 from public.ranking x where x.jogador_id = j.id)
  and r.id = (
    select min(y.id) from public.ranking y
    where y.jogador_id is null and lower(y.usuario) = lower(j.usuario)
  );

create index if not exists ranking_ordem_idx
  on public.ranking (pontuacao desc, nivel desc, data asc, id asc);

create view public.ranking_posicoes
with (security_invoker = true) as
select
  row_number() over (order by pontuacao desc, nivel desc, data asc, id asc) as posicao,
  id,
  jogador_id,
  usuario,
  pontuacao,
  nivel,
  data
from public.ranking;

alter table public.jogadores enable row level security;
alter table public.ranking enable row level security;
alter table public.conquistas_jogador enable row level security;

-- Uma partida em andamento por jogador (relógio e uso único controlados pelo servidor)
create table if not exists public.partidas_em_andamento (
  jogador_id integer primary key references public.jogadores(id) on delete cascade,
  id uuid not null,
  iniciada_em timestamptz not null default now(),
  usada boolean not null default false
);
alter table public.partidas_em_andamento enable row level security;

-- Contadores do rate limit (compartilhados entre as instâncias da Vercel)
create table if not exists public.rate_limits (
  chave text primary key,
  contagem integer not null,
  expira_em timestamptz not null
);
alter table public.rate_limits enable row level security;

drop policy if exists "ranking_leitura_publica" on public.ranking;
drop policy if exists "ranking_insercao_propria" on public.ranking;
drop policy if exists "ranking_atualizacao_propria" on public.ranking;
drop policy if exists "jogadores_leitura_publica" on public.jogadores;
drop policy if exists "jogadores_insercao_publica" on public.jogadores;
drop policy if exists "conquistas_leitura_publica" on public.conquistas_jogador;
drop policy if exists "conquistas_insercao_publica" on public.conquistas_jogador;
drop policy if exists "conquistas_atualizacao_propria" on public.conquistas_jogador;


revoke all on public.jogadores, public.ranking, public.conquistas_jogador, public.ranking_posicoes, public.partidas_em_andamento, public.rate_limits
  from anon, authenticated;

-- Soma atômica usada pelo backend (evita perder contagem em requisições simultâneas)
create or replace function public.incrementar_partidas(p_jogador integer)
returns integer
language sql
as $$
  update public.jogadores
     set partidas_totais = partidas_totais + 1
   where id = p_jogador
  returning partidas_totais;
$$;

revoke all on function public.incrementar_partidas(integer) from public, anon, authenticated;
grant execute on function public.incrementar_partidas(integer) to service_role;

create or replace function public.rate_limit_hit(p_chave text, p_janela_ms integer)
returns table (total integer, reseta_em timestamptz)
language plpgsql
as $$
begin
  -- limpeza ocasional de contadores vencidos
  if random() < 0.01 then
    delete from public.rate_limits where expira_em < now() - interval '1 hour';
  end if;

  insert into public.rate_limits as r (chave, contagem, expira_em)
  values (p_chave, 1, now() + make_interval(secs => p_janela_ms / 1000.0))
  on conflict (chave) do update
    set contagem = case when r.expira_em <= now() then 1 else r.contagem + 1 end,
        expira_em = case when r.expira_em <= now()
                         then now() + make_interval(secs => p_janela_ms / 1000.0)
                         else r.expira_em end
  returning r.contagem, r.expira_em into total, reseta_em;

  return next;
end;
$$;

create or replace function public.rate_limit_undo(p_chave text)
returns void
language sql
as $$
  update public.rate_limits set contagem = greatest(contagem - 1, 0) where chave = p_chave;
$$;

create or replace function public.rate_limit_reset(p_chave text)
returns void
language sql
as $$
  delete from public.rate_limits where chave = p_chave;
$$;

revoke all on function public.rate_limit_hit(text, integer) from public, anon, authenticated;
revoke all on function public.rate_limit_undo(text) from public, anon, authenticated;
revoke all on function public.rate_limit_reset(text) from public, anon, authenticated;
grant execute on function public.rate_limit_hit(text, integer) to service_role;
grant execute on function public.rate_limit_undo(text) to service_role;
grant execute on function public.rate_limit_reset(text) to service_role;

notify pgrst, 'reload schema';