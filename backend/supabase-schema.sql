-- Schema base para o JBIFC usando Supabase.
-- Execute este SQL no SQL Editor do Supabase antes de iniciar o backend em produção.

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

-- Observação:
-- Se você migrar para o Supabase Auth nativo, o ideal é que o campo id da tabela public.jogadores
-- coincida com o auth.uid() do usuário autenticado, e as políticas abaixo devem substituir as regras acima.
--
-- create policy "jogadores_proprio" on public.jogadores
-- for select using (id = auth.uid());
--
-- create policy "ranking_proprio" on public.ranking
-- for select using (jogador_id = auth.uid());
--
-- create policy "ranking_update_proprio" on public.ranking
-- for update using (jogador_id = auth.uid())
-- with check (jogador_id = auth.uid());

-- O backend continua a usar o service_role_key em ambiente do servidor para evitar a porta 5432,
-- porém o frontend nunca recebe a service_role_key nem qualquer credencial privada.
