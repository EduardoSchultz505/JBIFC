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

drop policy if exists "ranking_leitura_publica" on public.ranking;
drop policy if exists "ranking_insercao_propria" on public.ranking;
drop policy if exists "ranking_atualizacao_propria" on public.ranking;
drop policy if exists "jogadores_leitura_publica" on public.jogadores;
drop policy if exists "jogadores_insercao_publica" on public.jogadores;
drop policy if exists "conquistas_leitura_publica" on public.conquistas_jogador;
drop policy if exists "conquistas_insercao_publica" on public.conquistas_jogador;
drop policy if exists "conquistas_atualizacao_propria" on public.conquistas_jogador;


revoke all on public.jogadores, public.ranking, public.conquistas_jogador, public.ranking_posicoes
  from anon, authenticated;

notify pgrst, 'reload schema';