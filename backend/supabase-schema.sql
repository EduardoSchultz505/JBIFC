create table if not exists public.jogadores (
  id serial primary key,
  usuario varchar(20) not null,
  senha_hash varchar(100) not null,
  criado_em timestamptz not null default now(),
  constraint jogadores_usuario_unico unique (lower(usuario))
);

create table if not exists public.ranking (
  id serial primary key,
  jogador_id integer null references public.jogadores(id) on delete cascade,
  usuario varchar(50) not null,
  pontuacao double precision not null check (pontuacao >= 0),
  nivel integer not null default 0 check (nivel >= 0),
  data timestamptz not null default now(),
  constraint ranking_jogador_unico unique (jogador_id)
);

create unique index if not exists ranking_usuario_unico
on public.ranking (lower(usuario));

create index if not exists ranking_pontuacao_idx
on public.ranking (pontuacao desc, nivel desc, data asc);

alter table public.jogadores enable row level security;
alter table public.ranking enable row level security;

create policy "ranking_leitura_publica"
on public.ranking
for select using (true);

create policy "ranking_insercao_propria"
on public.ranking
for insert with check (jogador_id is not null);

create policy "ranking_atualizacao_propria"
on public.ranking
for update using (jogador_id is not null) with check (jogador_id is not null);

create policy "jogadores_leitura_publica"
on public.jogadores
for select using (true);

create policy "jogadores_insercao_publica"
on public.jogadores
for insert with check (true);
