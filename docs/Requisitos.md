# JBIFC: Documento de Requisitos e Especificação

Trabalho de Desenvolvimento Web 2, Instituto Federal Catarinense. Versão 1.1, 22 de outubro de 2026. Projeto acadêmico, sem relação com o Instituto Federal Catarinense real.

## 1. Introdução

### 1.1 Objetivo

Este documento descreve o que o site JBIFC deve fazer, como ele é organizado e como será testado e publicado. Serve de referência para a equipe durante o desenvolvimento e como parte da entrega da disciplina.

### 1.2 Escopo

O sistema é um site com vários microjogos de poucos segundos, no estilo de Dumb Ways to Die e WarioWare. O jogador cria uma conta, entra, joga uma sequência de minijogos até perder as três vidas e tem sua melhor pontuação registrada em um ranking online da turma.

Ficam fora do escopo: multijogador em tempo real, suporte a celulares e telas de toque, e recuperação de senha (a conta não tem e-mail).

### 1.3 Definições

| Termo | Significado |
|---|---|
| Minijogo | Jogo de 5 a 10 segundos com uma única instrução e uma regra de vitória. |
| Rodada | Uma execução de um minijogo, da instrução até o resultado. |
| Partida | Sequência de rodadas, da primeira até a perda da terceira vida. |
| Pontuação | Total de pontos de uma partida, com 10 pontos por rodada vencida. |
| Sequência de vitórias | Rodadas vencidas seguidas na partida atual. Volta a zero a cada derrota. |
| Conta | Cadastro do jogador, com nome de usuário e senha. |
| Token (JWT) | Texto assinado pelo servidor que identifica o jogador logado. É enviado no cabeçalho Authorization. |
| Ranking | Lista de todos os jogadores da turma, com a melhor pontuação de cada um. |
| Pódio | Destaque visual dos 3 primeiros do ranking. |
| API | Servidor que recebe e entrega os dados do ranking e das contas por requisições HTTP. |
| Phaser | Biblioteca JavaScript para jogos 2D que desenha dentro de um canvas. |

## 2. Visão geral do produto

O produto é uma aplicação web de página única com três partes: o frontend em React, que contém o site e o jogo feito em Phaser; a API em Express; e o banco de dados PostgreSQL.

Usuários: jogadores (professor e estudantes da turma) criam uma conta e entram nela para jogar.

Premissas: os jogadores usam computador com versão recente de Chrome, Firefox, Edge ou Safari, tela de pelo menos 1280x720 e internet; o professor avalia por link público.

## 3. Elicitação de requisitos

### 3.1 Partes interessadas

| Parte interessada | O que espera do sistema |
|---|---|
| Jogador | Entender o jogo sem explicação, jogar rápido no computador, ver sua posição no ranking. |
| Professor | Uso correto das tecnologias da disciplina, sistema funcionando em link público, relatório coerente. |
| Equipe de desenvolvimento | Escopo realista, arquitetura simples, poucos conflitos de código. |
| Equipe de design | Padrão claro de arquivos de arte e fichas de minijogos prontas cedo. |
| Organização | Tarefas visíveis, critérios de avaliação conhecidos, relatório e apresentação. |
| IFC (instituição) | Uso da marca sem alterações e com aviso de que o projeto não tem relação com a instituição real. |

### 3.2 Técnicas utilizadas

- Análise de referências: Dumb Ways to Die e WarioWare, para extrair o formato (rodadas curtas, instrução de uma palavra, velocidade crescente) sem copiar material protegido.
- Brainstorming da equipe: levantamento de ideias de minijogos, ainda em consolidação (seção 12).
- Prototipação: mockup da página inicial em HTML para validar paleta e hierarquia visual.
- Conversa com o professor: realizada, com as respostas na seção 3.3.
- Playtest com colegas: previsto para as semanas 2 e 3 (29/10 a 11/11), com o roteiro da seção 3.3.

### 3.3 Roteiro de perguntas

Perguntas ao professor e respostas recebidas:

| Pergunta | Por que importa | Resposta |
|---|---|---|
| Há tecnologias obrigatórias ou proibidas, por exemplo bibliotecas de jogos como o Phaser? | Evita refazer o projeto no fim. | Não. Pode-se utilizar todo o conhecimento técnico do estudante. |
| O banco de dados precisa ser relacional? Algum específico? | Confirma a escolha do PostgreSQL. | Qualquer banco, de preferência o ensinado em Banco de Dados (PostgreSQL). |
| O site precisa estar em link público ou basta rodar localmente na apresentação? | Define se o deploy é obrigatório. | Precisa estar em link público. |
| Podemos usar a marca do IFC no site? | Define o uso do logo. | Pode, mas é preciso citar que o projeto não está relacionado com a instituição real. |

Perguntas para o playtest com colegas:

- A pessoa entendeu a instrução de cada minijogo sem explicação?
- O controle por mouse e teclado foi confortável?
- Alguma rodada pareceu injusta ou impossível?
- Quanto tempo jogou seguido e voltaria para melhorar sua posição?

### 3.4 Decisões tomadas até aqui

| Decisão | Motivo |
|---|---|
| JavaScript em vez de C com WebAssembly | A disciplina é de web, microjogos não exigem desempenho extra e a configuração do Emscripten aumentaria o risco do prazo. |
| Phaser 3 | Já traz cenas, entrada por mouse, sons e animações. |
| React com Tailwind e React Router | Tecnologias que a equipe já domina. |
| Express com PostgreSQL | Mesma linguagem do frontend, planos gratuitos de hospedagem e conteúdo ensinado no curso. |
| Frontend na Vercel | Definido pela equipe. |
| Foco em computador, com mouse e teclado | Simplifica controles e testes. Celular e telas de toque ficam fora do escopo. |
| Meta de 8 minijogos | Escopo compatível com dois desenvolvedores em um mês. |
| Sem multijogador em tempo real | Exigiria WebSockets e sincronização, um projeto à parte. |
| Ranking vinculado a conta | Aumenta a dificuldade, mas aplica o conteúdo atual do curso. |
| Autenticação com bcrypt e JWT no cabeçalho Authorization | Mais simples que cookies quando frontend e API ficam em domínios diferentes (Vercel e Render). O custo é o token ficar no navegador. |
| Conta só com nome de usuário e senha, sem e-mail | Coleta o mínimo de dados pessoais. O custo é não haver recuperação de senha. |

## 4. Requisitos funcionais

| ID | Requisito | Prioridade |
|---|---|---|
| RF01 | O jogador precisa criar uma conta, com nome de usuário e senha, para poder jogar. | Essencial |
| RF02 | O sistema sorteia um minijogo a cada rodada, nunca repetindo o da rodada anterior. Com 8 minijogos, as repetições ocorrem ao longo da partida. | Essencial |
| RF03 | O sistema mostra a instrução por cerca de 1 segundo antes de cada rodada. | Essencial |
| RF04 | Cada rodada tem tempo inicial de 5 a 10 segundos, definido na ficha do minijogo. O segundo da instrução não entra nessa contagem. | Essencial |
| RF05 | O sistema decide vitória ou derrota pela regra do minijogo ou pelo tempo esgotado. | Essencial |
| RF06 | O sistema controla 3 vidas e remove 1 a cada derrota. | Essencial |
| RF07 | O sistema soma 10 pontos por vitória e mostra pontuação e vidas na tela. | Essencial |
| RF08 | A cada 5 vitórias seguidas o tempo das rodadas diminui (RN06). A sequência volta a zero a cada derrota. | Importante |
| RF09 | A partida termina com 0 vidas e mostra a pontuação final. | Essencial |
| RF10 | O sistema envia a pontuação ao servidor ao fim da partida, em nome do jogador logado. | Essencial |
| RF11 | O sistema exibe o ranking com todos os jogadores da turma, cada um com sua melhor pontuação, e destaca os 3 primeiros em um pódio. | Essencial |
| RF12 | O jogador pode jogar de novo sem recarregar a página. | Importante |
| RF13 | O site tem uma página Como jogar. | Importante |
| RF14 | O site tem uma página Equipe com créditos e fontes dos assets. | Importante |
| RF15 | A navegação entre páginas não recarrega o site. | Importante |
| RF16 | Se o envio da pontuação falhar, o sistema avisa o jogador, mantém a pontuação na tela e permite tentar de novo. | Importante |
| RF17 | Sons e música com botão para silenciar. | Desejável |
| RF18 | O ranking pode ser filtrado por período (dia ou semana). | Desejável |
| RF19 | O jogador entra com nome de usuário e senha, a sessão é mantida por token e a página de jogo só abre com login. | Essencial |
| RF20 | O rodapé de todas as páginas e a página Equipe informam que o projeto não tem relação com o IFC real. | Essencial |

## 5. Requisitos não funcionais

| ID | Categoria | Requisito |
|---|---|---|
| RNF01 | Desempenho | O jogo roda a cerca de 60 quadros por segundo em um computador intermediário. |
| RNF02 | Desempenho | A primeira tela jogável aparece em até 5 segundos, sem contar a espera do servidor gratuito (RNF09). |
| RNF03 | Compatibilidade | Versões recentes de Chrome, Firefox, Edge e Safari para computador. |
| RNF04 | Responsividade | Resolução mínima de 1280x720. Celular e tablet não são suportados. |
| RNF05 | Usabilidade | Controles por mouse e teclado. |
| RNF06 | Acessibilidade | Contraste mínimo de 4,5 para 1 em texto pequeno (3 para 1 em texto grande e elementos gráficos), navegação por teclado no site, foco visível e cor nunca como única indicação (vitória e derrota também aparecem em texto ou ícone). |
| RNF07 | Segurança | Validação no servidor, consultas SQL parametrizadas, segredos fora do repositório, senhas com bcrypt, autenticação por JWT, helmet e limite de requisições. |
| RNF08 | Manutenibilidade | Um minijogo por arquivo, todos com a mesma interface. |
| RNF09 | Disponibilidade | No plano gratuito o servidor pode levar cerca de 1 minuto para responder após inatividade (valor a conferir no plano atual). O site chama /api/saude ao abrir e avisa o jogador enquanto espera. |
| RNF10 | Legal | Sem imagens, sons ou músicas protegidos; licenças dos assets registradas; marca do IFC sem alterações e acompanhada do aviso de que o projeto não tem relação com a instituição. |
| RNF11 | Idioma | Interface em português do Brasil. |

## 6. Regras de negócio

| ID | Regra |
|---|---|
| RN01 | Toda partida começa com 3 vidas, 0 pontos e sequência de vitórias zero. |
| RN02 | Cada rodada vencida vale 10 pontos. Não há pontuação máxima. O servidor só aceita pontos inteiros, não negativos, múltiplos de 10 e dentro da faixa do tipo INTEGER do banco. |
| RN03 | O nome de usuário tem de 1 a 20 caracteres, com espaços nas pontas removidos, e é único sem diferenciar maiúsculas de minúsculas. A senha tem de 8 a 72 caracteres (72 é o limite do bcrypt). |
| RN04 | Cada jogador aparece uma vez no ranking, com sua melhor pontuação. A ordem é por pontos, do maior para o menor. Em caso de empate, fica acima quem atingiu essa pontuação primeiro. |
| RN05 | A pontuação de cada partida é enviada uma única vez, ao fim da partida. O reenvio só acontece quando o envio anterior falhou. Como o ranking usa a melhor pontuação de cada jogador, uma duplicata eventual não o altera. |
| RN06 | A cada 5 vitórias seguidas o tempo da rodada diminui 10%, com mínimo de 1,5 segundo. O tempo é calculado pela sequência atual: tempo inicial multiplicado por 0,9 elevado ao número de grupos completos de 5 vitórias. Quando a sequência volta a zero, o tempo volta ao inicial. Valores a ajustar após os playtests. |

## 7. Caso de uso: jogar uma partida

Ator: jogador. Pré-condição: site aberto.

Fluxo principal:

1. O jogador cria uma conta ou entra nela.
2. O jogador abre a página de jogo e clica em Jogar.
3. O sistema inicia a partida com 3 vidas, 0 pontos e sequência zero.
4. O sistema sorteia um minijogo diferente do anterior e mostra a instrução.
5. O jogador age dentro do tempo da rodada.
6. O sistema avalia o resultado. Na vitória soma 10 pontos e 1 à sequência; na derrota remove 1 vida e zera a sequência. Em seguida mostra o feedback.
7. Se ainda há vidas, volta ao passo 4, com o tempo ajustado conforme a RN06.
8. Sem vidas, o sistema mostra a pontuação final e envia a pontuação à API.
9. O sistema mostra a posição devolvida pela API e oferece Jogar de novo.

Fluxos alternativos:

- A1: falha no envio. O sistema avisa o jogador, mantém a pontuação na tela e oferece Tentar de novo. O reenvio só existe quando o envio falhou.
- A2: jogador sem login abre a página de jogo. O sistema o leva para a página Entrar e, depois do login, de volta ao jogo.

Pós-condição: a pontuação da partida está registrada no banco.

## 8. Arquitetura

```
Navegador
  React (site, rotas, login, ranking)
    Phaser (cenas: Menu, Partida, FimDeJogo)
         |
         | fetch (JSON, token JWT no cabeçalho Authorization)
         v
  API Express  --->  PostgreSQL (tabelas conta e pontuacao)
```

O jogo apenas gera a pontuação e a entrega ao React. O React cuida do login, do envio à API e da exibição do ranking, que consulta a API diretamente, sem passar pelo Phaser.

| Camada | Tecnologia | Hospedagem |
|---|---|---|
| Frontend | React, Vite, Tailwind, React Router | Vercel |
| Jogo | Phaser 3 | dentro do frontend |
| API | Node.js, Express 5, pacote pg, bcrypt, jsonwebtoken | Render |
| Banco | PostgreSQL | Neon |

Autenticação: as senhas são guardadas com bcrypt. No cadastro e no login a API devolve um JWT assinado com a variável JWT_SECRET e com validade limitada (sugestão: 24 horas). O frontend guarda o token no localStorage e o envia em Authorization: Bearer. Risco conhecido: uma falha de XSS poderia roubar o token. O React escapa texto por padrão e o projeto não deve inserir HTML bruto vindo de usuários. Cookie httpOnly com SameSite=None seria mais seguro, mas é mais trabalhoso com domínios diferentes.

## 9. Modelo de dados

| Tabela | Colunas |
|---|---|
| conta | id, nome_usuario (único, sem diferenciar maiúsculas), senha_hash, criado_em |
| pontuacao | id, conta_id (referência a conta), pontos, criado_em |

Script de criação:

```sql
CREATE TABLE conta (
  id SERIAL PRIMARY KEY,
  nome_usuario VARCHAR(20) NOT NULL,
  senha_hash TEXT NOT NULL,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX conta_nome_unico ON conta (lower(nome_usuario));

CREATE TABLE pontuacao (
  id SERIAL PRIMARY KEY,
  conta_id INTEGER NOT NULL REFERENCES conta(id),
  pontos INTEGER NOT NULL CHECK (pontos >= 0),
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

Consulta do ranking (uma linha por jogador, melhor pontuação, desempate pela data):

```sql
WITH melhores AS (
  SELECT DISTINCT ON (conta_id) conta_id, pontos, criado_em
  FROM pontuacao
  ORDER BY conta_id, pontos DESC, criado_em ASC
)
SELECT ROW_NUMBER() OVER (ORDER BY m.pontos DESC, m.criado_em ASC) AS posicao,
       c.nome_usuario AS nome, m.pontos
FROM melhores m
JOIN conta c ON c.id = m.conta_id
ORDER BY posicao;
```

## 10. Especificação da API

### 10.1 Convenções

- URL base local: http://localhost:5000. Em produção, a URL do serviço no Render, configurada no frontend pela variável VITE_API_URL.
- Formato: JSON com codificação UTF-8. Requisições com corpo usam o cabeçalho Content-Type: application/json.
- Rotas protegidas exigem o cabeçalho Authorization: Bearer seguido do token. Sem token válido, a resposta é 401.
- CORS habilitado apenas para o domínio do frontend.
- Erros devolvem um objeto com o campo erro.
- Excesso de requisições devolve 429 com { "erro": "muitas requisições" }.

### 10.2 Resumo das rotas

| Método | Rota | Função | Login | Situação |
|---|---|---|---|---|
| POST | /api/conta | Cadastra uma conta | Não | Implementada, a ajustar |
| POST | /api/login | Entra na conta | Não | A implementar |
| GET | /api/conta | Dados da conta logada | Sim | Implementada, a ajustar |
| GET | /api/ranking | Lista todos os jogadores com a melhor pontuação | Não | Implementada, a ajustar |
| POST | /api/pontuacao | Registra uma pontuação | Sim | Implementada, a ajustar |
| GET | /api/saude | Verifica se o servidor está ativo | Não | Proposta |
| GET | /api/ranking?periodo=dia | Ranking do dia ou da semana | Não | Futura (RF18) |

### 10.3 POST /api/conta

Cria uma conta e já devolve um token.

```json
{ "nome": "Eduardo", "senha": "umaSenhaForte123" }
```

| Código | Quando | Corpo |
|---|---|---|
| 201 | Conta criada | { "nome": "Eduardo", "token": "..." } |
| 400 | Nome ou senha fora das regras da RN03 | { "erro": "dados inválidos" } |
| 409 | Nome já em uso | { "erro": "nome já em uso" } |
| 500 | Falha no banco | { "erro": "erro interno" } |

### 10.4 POST /api/login

Corpo igual ao do cadastro.

| Código | Quando | Corpo |
|---|---|---|
| 200 | Nome e senha corretos | { "nome": "Eduardo", "token": "..." } |
| 400 | Campos ausentes | { "erro": "dados inválidos" } |
| 401 | Nome inexistente ou senha errada (mesma mensagem nos dois casos) | { "erro": "nome ou senha incorretos" } |
| 500 | Falha no banco | { "erro": "erro interno" } |

### 10.5 GET /api/conta

Devolve os dados da conta dona do token. O frontend usa essa rota para confirmar a sessão ao abrir o site.

| Código | Quando | Corpo |
|---|---|---|
| 200 | Token válido | { "nome": "Eduardo" } |
| 401 | Token ausente, inválido ou expirado | { "erro": "não autorizado" } |
| 500 | Falha no banco | { "erro": "erro interno" } |

### 10.6 GET /api/ranking

Devolve todos os jogadores com pelo menos uma partida, um registro por jogador, ordenados conforme a RN04. O pódio é montado pelo React com os 3 primeiros.

Resposta 200:

```json
[
  { "posicao": 1, "nome": "Jogador 1", "pontos": 310 },
  { "posicao": 2, "nome": "Jogador 2", "pontos": 270 }
]
```

Erros: 500 com { "erro": "erro interno" } se o banco estiver indisponível. A lista não tem paginação, o que é aceitável para o tamanho de uma turma.

### 10.7 POST /api/pontuacao

Registra a pontuação de uma partida terminada, em nome do dono do token. O nome não vem mais no corpo.

```json
{ "pontos": 120 }
```

| Código | Quando | Corpo |
|---|---|---|
| 201 | Pontuação salva | { "posicao": 4 } (posição atual do jogador no ranking) |
| 400 | Pontos fora das regras da RN02 | { "erro": "dados inválidos" } |
| 401 | Token ausente, inválido ou expirado | { "erro": "não autorizado" } |
| 500 | Falha no banco | { "erro": "erro interno" } |

### 10.8 GET /api/saude (proposta)

Resposta 200: { "status": "ok" }. Serve como verificação de saúde do Render e para o frontend acordar o servidor assim que o site abre, reduzindo a espera do primeiro acesso.

## 11. Frontend: páginas e rotas

| Rota | Página | Conteúdo | Acesso | Requisitos |
|---|---|---|---|---|
| / | Início | Apresentação, botão Jogar, como funciona, prévia do ranking com os 3 primeiros | Pública | RF15 |
| /entrar | Entrar | Formulário de login | Pública | RF19 |
| /cadastro | Cadastro | Formulário de criação de conta | Pública | RF01 |
| /jogar | Jogar | O jogo em Phaser | Exige login | RF01 a RF12, RF16, RF19 |
| /ranking | Ranking | Pódio com os 3 primeiros e tabela com todos os jogadores | Pública | RF11 |
| /como-jogar | Como jogar | Regras e instrução de cada minijogo | Pública | RF13 |
| /equipe | Equipe | Integrantes, créditos, fontes dos assets e aviso de que o projeto não tem relação com o IFC real | Pública | RF14, RF20 |
| * | Não encontrada | Mensagem e link para o início | Pública | RF15 |

A navbar e o rodapé aparecem em todas as páginas. A navbar mostra Entrar e Cadastro para quem não está logado, e o nome do jogador e Sair para quem está. O rodapé traz o aviso de que o projeto não tem relação com o IFC real (RF20).

Sessão: o token fica no localStorage. Ao receber 401 da API, o frontend apaga o token e leva o jogador a /entrar. A página /jogar sem login redireciona para /entrar e volta ao jogo depois do login.

O componente do jogo deve destruir a instância do Phaser ao sair da página, para não duplicar o canvas ao voltar.

## 12. Minijogos

### 12.1 Interface comum

Todo minijogo é uma classe com instrução, duração e quatro métodos: iniciar (cria os objetos na tela), atualizar (lógica por quadro), resultado (devolve jogando, ganhou ou perdeu) e destruir (remove os objetos). A cena Partida apenas chama esses métodos.

### 12.2 Lista

Meta: 8 minijogos.

| Minijogo | Instrução | Vitória | Derrota | Duração |
|---|---|---|---|---|
| A definir | | | | |

### 12.3 Modelo de ficha

- Nome e instrução na tela (uma palavra).
- Como se ganha e como se perde.
- Duração inicial e como a dificuldade aumenta.
- Controle (mouse ou teclado).
- Lista de imagens e sons necessários, com tamanho e nome dos arquivos.

## 13. Identidade visual

A paleta é provisória (placeholder) e deve ser confirmada no logo oficial atual com um conta-gotas. Os valores de verde e vermelho são aproximações.

| Cor | Hex | Uso |
|---|---|---|
| Verde IFC | #2F9E41 | Cor principal em áreas grandes, ícones e textos grandes. Vitória. Nunca para texto pequeno nem botões com texto pequeno. |
| Verde escuro | #1E6B2C | Navbar, botões principais com texto branco, texto sobre fundo claro. |
| Verde claro | #A8DDB2 | Fundos suaves, página atual. Texto sobre ele sempre grafite. |
| Vermelho IFC | #CD191E | Perda de vida e erro. Texto branco sobre ele, ou ele sobre creme. |
| Amarelo | #FFC93C | Botão Jogar (texto grafite), pontuação, destaque. |
| Grafite | #1F2A30 | Fundos escuros e texto principal. |
| Creme | #F7F4EA | Fundo das páginas. |

Contrastes das combinações (calculados pela fórmula do WCAG, a conferir com uma ferramenta depois de confirmar as cores). Texto grande é o de 24 px ou mais, ou 18,66 px ou mais em negrito.

| Combinação | Contraste | Uso permitido |
|---|---|---|
| Grafite sobre creme | 13,3 para 1 | Texto pequeno |
| Grafite sobre amarelo | 9,5 para 1 | Texto pequeno |
| Grafite sobre verde claro | 9,5 para 1 | Texto pequeno |
| Branco sobre verde escuro | 6,6 para 1 | Texto pequeno |
| Verde escuro sobre creme | 6,0 para 1 | Texto pequeno |
| Branco sobre vermelho | 5,6 para 1 | Texto pequeno |
| Vermelho sobre creme | 5,1 para 1 | Texto pequeno |
| Verde escuro sobre verde claro | 4,3 para 1 | Só texto grande |
| Grafite sobre verde IFC | 4,3 para 1 | Só texto grande |
| Branco sobre verde IFC | 3,4 para 1 | Só texto grande |
| Verde IFC sobre creme | 3,1 para 1 | Só texto grande e elementos gráficos |

Tipografia: Fredoka (pesos 500, 600 e 700). Regras: o vermelho sempre significa perda ou erro; vitória e derrota nunca aparecem só por cor, sempre com texto ou ícone junto; o logo do IFC é usado sem alteração, na versão negativa sobre fundo escuro; arte dos minijogos em estilo chapado, sem degradês.

## 14. Plano de testes

| ID | Caso de teste | Resultado esperado | Requisito |
|---|---|---|---|
| T01 | Cadastro com nome e senha válidos | 201 com token. Conta no banco com senha em hash, nunca em texto puro. | RF01, RNF07 |
| T02 | Cadastro com nome vazio ou só espaços | 400 | RN03 |
| T03 | Cadastro com nome de 21 caracteres | 400 | RN03 |
| T04 | Cadastro com senha de 7 caracteres | 400 | RN03 |
| T05 | Cadastro com nome já usado, inclusive com maiúsculas diferentes | 409 | RN03 |
| T06 | Cadastro com texto de injeção de SQL no nome, por exemplo ' OR 1=1 -- | O texto é tratado só como dado: rejeitado (400) ou salvo literalmente (201). Nenhum SQL é executado e as tabelas continuam íntegras. | RNF07 |
| T07 | Login com nome e senha corretos | 200 com token | RF19 |
| T08 | Login com senha errada e login com nome inexistente | 401 com a mesma mensagem nos dois casos | RF19 |
| T09 | Muitas tentativas de login em pouco tempo | 429 | RNF07 |
| T10 | Envio de pontuação com token válido e pontos válidos | 201 com a posição. Registro ligado à conta do token. | RF10 |
| T11 | Envio de pontuação sem token, com token inválido e com token expirado | 401 e nada gravado | RF19 |
| T12 | Envio de pontos negativos, decimais, não numéricos ou não múltiplos de 10 | 400 | RN02 |
| T13 | Ranking com vários jogadores e mais de uma pontuação por jogador | Cada jogador aparece uma vez, com a melhor pontuação, em ordem decrescente e sem limite de 10 | RF11, RN04 |
| T14 | Ranking com empate de pontos | Fica acima quem atingiu a pontuação primeiro | RN04 |
| T15 | Partida completa perdendo 3 rodadas | Tela final, envio da pontuação e posição exibida | RF09, RF10 |
| T16 | Cinco vitórias seguidas e depois uma derrota | Tempo cai 10% ao completar 5 vitórias e volta ao inicial após a derrota. Nunca abaixo de 1,5 s. | RF08, RN06 |
| T17 | 50 rodadas seguidas | Nunca o mesmo minijogo duas vezes em sequência | RF02 |
| T18 | Desligar a internet no fim da partida e religar | Aviso de falha, pontuação mantida na tela e Tentar de novo envia uma vez | RF16, RN05 |
| T19 | Abrir /jogar sem login | Redireciona para /entrar e, depois do login, volta ao jogo | RF19 |
| T20 | Abrir /ranking digitando o endereço no site publicado | Página abre, sem erro 404 | RF15 |
| T21 | Sair da página de jogo e voltar três vezes | Um único canvas e o jogo funciona normalmente | Seção 11 |
| T22 | Navegar só pelo teclado, inclusive nos formulários | Foco visível e todos os links e botões acessíveis | RNF06 |
| T23 | Abrir o site em 1280x720 nos quatro navegadores | Sem rolagem horizontal e jogo jogável | RNF03, RNF04 |
| T24 | Conferir o repositório | Nenhum .env versionado. DATABASE_URL e JWT_SECRET só em variáveis de ambiente. | RNF07 |
| T25 | Abrir cada página e a página Equipe | Rodapé e Equipe trazem o aviso de que o projeto não tem relação com o IFC real | RF20 |
| T26 | Medir o contraste dos textos com uma ferramenta | 4,5 para 1 ou mais em texto pequeno | RNF06 |

## 15. Segurança e riscos

### 15.1 Segurança

- Senhas armazenadas com bcrypt, nunca em texto puro.
- O JWT é assinado com JWT_SECRET, que fica fora do repositório, e tem validade limitada. O token fica no localStorage e seria exposto por uma falha de XSS. O React escapa texto por padrão e o projeto não deve inserir HTML bruto.
- Uso de helmet e limite de requisições, com limite mais rígido em /api/login e /api/conta.
- CORS liberado apenas para o domínio do frontend.
- A pontuação sai do navegador, então qualquer jogador logado pode enviar valores falsos pelo console. Como não há pontuação máxima (RN02), a falsificação é mais fácil do que seria com um limite. A validação só impede valores inválidos, não valores falsos. Essa limitação deve constar no relatório.
- Sem e-mail não há recuperação de senha. Quem esquecer a senha precisa criar outra conta. Isso também deve constar no relatório.
- Todas as consultas usam parâmetros (por exemplo $1 e $2), o que evita injeção de SQL.
- DATABASE_URL e JWT_SECRET ficam no arquivo .env, que não vai para o GitHub, e no painel de variáveis do Render. Como o repositório é público, o .gitignore precisa conter .env antes do primeiro commit do backend.

### 15.2 Riscos do projeto

| Risco | Impacto | Mitigação |
|---|---|---|
| Escopo grande para 2 desenvolvedores | Atraso | Meta de 8 minijogos, congelar funcionalidades em 15/11 e priorizar as semanas 1 a 4 do cronograma. |
| Um desenvolvedor ficar indisponível | Projeto para | Revisão cruzada de pull requests e conhecimento compartilhado do código. |
| Autenticação mais trabalhosa que o previsto | Atraso na semana 1 | Implementar cadastro e login primeiro, com bibliotecas prontas (bcrypt e jsonwebtoken), e cobrir com os testes T01 a T11. |
| Arte entregue tarde ou fora do padrão | Retrabalho | Fichas prontas cedo, padrão de arquivos combinado e placeholders no código. |
| Servidor gratuito dormindo | Primeiro acesso e primeiro login lentos na apresentação | Abrir o site antes de apresentar e usar a rota /api/saude. |
| Rota direta dando erro 404 após o deploy | Site parece quebrado | Configurar a reescrita para index.html no vercel.json e testar desde a semana 1. |
| Som bloqueado pelo navegador | Jogo mudo | Tela inicial com botão Jogar que libera o áudio. |
| Uso indevido de marca ou assets protegidos | Perda de nota | Logo oficial sem alteração, aviso de não vínculo no rodapé e licenças dos assets anotadas na página Equipe. |
| Segredo do banco ou do JWT publicado | Banco ou contas comprometidos | .env no .gitignore. Se vazar, gerar nova senha no Neon e novo JWT_SECRET, o que invalida os tokens existentes. |

## 16. Configuração e publicação

### 16.1 Variáveis de ambiente

| Variável | Onde | Valor |
|---|---|---|
| DATABASE_URL | backend (.env e painel do Render) | String de conexão do PostgreSQL |
| JWT_SECRET | backend (.env e painel do Render) | Texto longo e aleatório para assinar os tokens |
| FRONTEND_URL | backend (.env e painel do Render) | Domínio do frontend, usado no CORS |
| PORT | backend (opcional) | Porta do servidor, padrão 5000 |
| VITE_API_URL | frontend | URL base da API |

### 16.2 Rodar localmente

Crie as tabelas com o script da seção 9 antes de iniciar o backend.

```bash
# backend
cd backend
npm install
npm run dev

# frontend, em outro terminal
cd frontend
npm install
npm run dev
```

### 16.3 Publicação

1. Banco: criar o projeto no Neon, executar o script da seção 9 e copiar a string de conexão.
2. Backend: serviço web no Render com Root Directory backend, comando de início npm start e DATABASE_URL, JWT_SECRET e FRONTEND_URL no painel.
3. Frontend: projeto na Vercel com Root Directory frontend, variável VITE_API_URL apontando para o Render e um vercel.json com regra de reescrita (rewrite) para index.html.
4. Testar o fluxo completo no link público: criar conta, entrar, jogar, enviar pontuação e ver o ranking.

## 17. Cronograma

Início em 22/10/2026 e entrega final em 22/11/2026.

| Semana | Período | Entregas |
|---|---|---|
| 1 | 22/10 a 28/10 | Repositório, primeiro deploy para testar rotas, páginas iniciais básicas, cadastro e login, página de ranking e estrutura básica do Phaser. |
| 2 | 29/10 a 04/11 | Núcleo do jogo (sorteio, vidas, dificuldade), minijogos 1, 2 e 3, arte dos minijogos 1 a 3. |
| 3 | 05/11 a 11/11 | Minijogos 4 a 6, arte final no lugar dos placeholders, páginas finais, testes de contraste e acessibilidade, sons (desejável, se houver tempo). |
| 4 | 12/11 a 18/11 | Minijogos 7 e 8, congelar funcionalidades em 15/11, correção de bugs, deploy final, relatório e apresentação. |
| Folga | 19/11 a 21/11 | 3 dias de folga para imprevistos. |
| Entrega | 22/11 | Entrega final com o link público funcionando. |

## 18. Pendências

- Lista e fichas completas dos minijogos (seção 12).
- Confirmar as cores no logo oficial atual (seção 13).
- Conferir os limites atuais dos planos gratuitos de Render e Neon, incluindo o tempo de espera do RNF09.
- Ajustar os valores de tempo e dificuldade (RN06) depois dos playtests.
- Confirmar a data de início (22/10) e a de entrega (22/11).