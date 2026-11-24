# JBIFC: Documento de Requisitos e Especificação

Trabalho de Desenvolvimento Web 2, Instituto Federal Catarinense. Versão 2.0, 23 de novembro de 2026. Projeto acadêmico.

## 1. Introdução

### 1.1 Objetivo

Este documento descreve o que o site JBIFC faz, como ele é organizado e como é testado e publicado. Serve de referência para a equipe e como parte da entrega da disciplina. Tudo o que está descrito aqui corresponde ao que foi implementado, e o que ainda depende de definição da equipe está na seção 18.

### 1.2 Escopo

O sistema é um portal com vários microjogos de poucos segundos, no estilo de Dumb Ways to Die e WarioWare, reunidos no jogo A Regular Mosquito's Day. O jogador começa uma partida, enfrenta uma sequência de minijogos e a partida termina quando as três vidas acabam.

Qualquer pessoa pode jogar sem conta. Quem cria uma conta e entra nela tem a pontuação salva, a melhor pontuação registrada em um ranking online, um perfil público e conquistas.

Ficam fora do escopo: multijogador em tempo real, jogabilidade em celulares e telas de toque, recuperação de senha (a conta não tem e-mail) e filtros do ranking por período.

### 1.3 Definições

| Termo | Significado |
|---|---|
| Minijogo | Jogo curto, de até 8 segundos, com um título, uma instrução, controles e uma regra de vitória. |
| Rodada | Uma execução de um minijogo, da instrução até o resultado. |
| Partida | Sequência de rodadas, da primeira até a perda da terceira vida. |
| Pontuação | Total de pontos de uma partida, com 1 ponto por rodada vencida. |
| Nível | Calculado como a parte inteira de pontos dividido por 5. Quanto maior o nível, menor o tempo das rodadas. |
| Sequência de vitórias | Rodadas vencidas seguidas na partida atual. Volta a zero a cada derrota e é usada em conquistas. |
| Conta | Cadastro do jogador, com nome de usuário e senha. |
| Sessão | Identificação do jogador logado, feita por um token JWT guardado em cookie httpOnly. |
| Modo demonstração | Jogar sem conta. A pontuação não é salva. |
| Modo prática | Treino de um minijogo escolhido, fora de uma partida. |
| Ranking | Lista dos jogadores com a melhor pontuação de cada um. |
| Conquista | Marco desbloqueado por uma regra de desempenho (seção 6). |
| API | Servidor que recebe e entrega os dados de contas, ranking e conquistas por requisições HTTP. |
| Phaser | Biblioteca JavaScript para jogos 2D que desenha dentro de um canvas. |

## 2. Visão geral do produto

O produto é uma aplicação web com três partes: o frontend em React, que contém o portal e o jogo feito em Phaser; a API em Express; e o banco de dados PostgreSQL, acessado por meio do Supabase.

Usuários: jogadores, que podem ser visitantes sem conta ou jogadores com conta.

Premissas: os jogadores usam computador com versão recente de Chrome, Firefox, Edge ou Safari, tela de pelo menos 1280x720 e internet. O professor avalia por link público.

## 3. Elicitação de requisitos

### 3.1 Partes interessadas

| Parte interessada | O que espera do sistema |
|---|---|
| Jogador | Entender o jogo sem explicação, jogar rápido no computador, ver sua posição no ranking e suas conquistas. |
| Professor | Uso correto das tecnologias da disciplina, sistema funcionando em link público, documentação coerente com o que foi feito. |
| Equipe de desenvolvimento | Escopo realista, arquitetura simples, poucos conflitos de código. |
| Equipe de design | Padrão claro de arquivos de arte e fichas de minijogos prontas cedo. |
| Organização | Tarefas visíveis, critérios de avaliação conhecidos, relatório e apresentação. |
| IFC (instituição) | Uso da marca sem alterações. |

### 3.2 Técnicas utilizadas

- Análise de referências: Dumb Ways to Die e WarioWare, para extrair o formato (rodadas curtas, instrução curta, velocidade crescente) sem copiar material protegido.
- Brainstorming da equipe: levantamento de ideias de minijogos.
- Prototipação: mockup da página inicial em HTML para validar paleta e hierarquia visual.
- Conversa com o professor: realizada, com as respostas na seção 3.3.
- Playtest com colegas: roteiro de perguntas na seção 3.3.

### 3.3 Roteiro de perguntas

Perguntas ao professor e respostas recebidas:

| Pergunta | Por que importa | Resposta |
|---|---|---|
| Há tecnologias obrigatórias ou proibidas, por exemplo bibliotecas de jogos como o Phaser? | Evita refazer o projeto no fim. | Não. Pode-se utilizar todo o conhecimento técnico do estudante. |
| O banco de dados precisa ser relacional? Algum específico? | Confirma a escolha do PostgreSQL. | Qualquer banco, de preferência o ensinado em Banco de Dados (PostgreSQL). |
| O site precisa estar em link público ou basta rodar localmente na apresentação? | Define se o deploy é obrigatório. | Precisa estar em link público. |

Perguntas para o playtest com colegas:

- A pessoa entendeu a instrução de cada minijogo sem explicação?
- Os controles por mouse e teclado foram confortáveis?
- Alguma rodada pareceu injusta ou impossível?
- Quanto tempo jogou seguido e voltaria para melhorar sua posição?

### 3.4 Decisões tomadas

| Decisão | Motivo |
|---|---|
| JavaScript em vez de C com WebAssembly | A disciplina é de web, microjogos não exigem desempenho extra e a configuração do Emscripten aumentaria o risco do prazo. |
| Phaser 4 | Já traz cenas, entrada por mouse e teclado, sons e animações. |
| React 19 com Tailwind CSS 4 e React Router | Tecnologias que a equipe já domina. |
| Express 5 | Mesma linguagem do frontend e rotas simples. |
| PostgreSQL no Supabase | Conteúdo ensinado no curso e plano gratuito. O backend acessa o banco pela API REST do Supabase com a chave de serviço, e as tabelas têm Row Level Security. |
| Vercel Services para frontend e backend | Os dois ficam no mesmo domínio, e as chamadas começadas por /api vão para o backend. |
| Sessão em cookie httpOnly, com proteção contra CSRF | Como frontend e API estão no mesmo domínio, o cookie é mais seguro que guardar o token no navegador, onde um XSS poderia roubá-lo. |
| Conta só com nome de usuário e senha, sem e-mail | Coleta o mínimo de dados pessoais. O custo é não haver recuperação de senha. |
| Jogar sem conta é permitido | Reduz a barreira de entrada. O custo é que essas partidas não entram no ranking. |
| Pontuação validada no servidor | O jogo roda no navegador, então o servidor registra cada partida, mede o tempo e confere o resumo antes de aceitar a pontuação. |
| Foco em computador, com mouse e teclado | Simplifica controles e testes. O portal é responsivo, mas os minijogos não são adaptados a toque. |
| Meta de 5 minijogos | Escopo compatível com a equipe e o prazo. |
| Sem multijogador em tempo real | Exigiria WebSockets e sincronização, um projeto à parte. |

## 4. Requisitos funcionais

| ID | Requisito | Prioridade |
|---|---|---|
| RF01 | O jogador pode jogar sem conta, no modo demonstração. A pontuação dessas partidas não é salva, e o sistema avisa isso ao fim da partida. | Essencial |
| RF02 | O jogador pode criar uma conta com nome de usuário e senha, entrar nela e sair. | Essencial |
| RF03 | O sistema sorteia um minijogo a cada rodada, nunca repetindo o da rodada anterior. | Essencial |
| RF04 | Antes de cada rodada o sistema mostra o título, a descrição e os controles do minijogo por cerca de 3,5 segundos. | Essencial |
| RF05 | Cada minijogo tem tempo inicial de 8 segundos, que diminui com o nível (RN06), com mínimo de 1,5 segundo. O tempo da instrução não entra nessa contagem. | Essencial |
| RF06 | O sistema decide vitória ou derrota pela regra do minijogo ou pelo tempo esgotado. Em minijogos de sobrevivência, sobreviver até o fim do tempo é vitória. | Essencial |
| RF07 | O sistema controla 3 vidas e remove 1 a cada derrota. | Essencial |
| RF08 | O sistema soma 1 ponto por vitória e mostra pontuação e vidas na tela. | Essencial |
| RF09 | A cada 5 pontos o nível sobe e o tempo das rodadas diminui (RN06). O nível não volta a cair durante a partida. | Importante |
| RF10 | A partida termina com 0 vidas e o sistema mostra a pontuação final. | Essencial |
| RF11 | Para o jogador logado, o sistema registra a partida no servidor ao começar e envia a pontuação ao fim dela. O ranking guarda a melhor pontuação de cada jogador. | Essencial |
| RF12 | O sistema exibe o ranking com até 100 jogadores, cada um com sua melhor pontuação, com destaque para o primeiro colocado. O nome de cada jogador leva ao seu perfil. | Essencial |
| RF13 | Cada jogador tem um perfil público com posição no ranking, melhor pontuação, total de partidas e conquistas. | Importante |
| RF14 | O sistema concede conquistas por desempenho (RN09) quando a pontuação é salva. | Importante |
| RF15 | O modo prática permite escolher um minijogo e treinar, sem gerar pontuação. | Importante |
| RF16 | A tecla P pausa a partida. | Importante |
| RF17 | O menu de opções permite ajustar o volume, inclusive silenciar o jogo, e a qualidade gráfica. | Importante |
| RF18 | Se o envio da pontuação falhar, o sistema avisa o jogador, mantém a pontuação na tela e permite tentar de novo, sem duplicar o registro. | Importante |
| RF19 | Ao fim da partida o jogador volta ao menu e pode jogar de novo sem recarregar a página. | Importante |
| RF20 | O site tem as páginas Como jogar e Equipe. | Importante |
| RF21 | A navegação entre páginas não recarrega o site, e endereços inexistentes mostram uma página de não encontrada. | Importante |

## 5. Requisitos não funcionais

| ID | Categoria | Requisito |
|---|---|---|
| RNF01 | Desempenho | O jogo roda a cerca de 60 quadros por segundo em um computador intermediário. A qualidade gráfica pode ser reduzida nas opções. |
| RNF02 | Desempenho | A primeira tela jogável aparece em até 5 segundos, sem contar a espera do servidor gratuito (RNF09). |
| RNF03 | Compatibilidade | Versões recentes de Chrome, Firefox, Edge e Safari para computador. |
| RNF04 | Responsividade | O portal (páginas, menus e navegação) se adapta a computador, tablet e celular. Os minijogos são otimizados para computador, e a jogabilidade em celular e tablet não é garantida. |
| RNF05 | Usabilidade | Os controles são por mouse e teclado, conforme o minijogo, e aparecem na tela antes de cada rodada. |
| RNF06 | Acessibilidade | Contraste mínimo de 4,5 para 1 em texto pequeno e de 3 para 1 em texto grande e elementos gráficos, navegação por teclado no portal, foco visível e cor nunca como única indicação de vitória ou derrota. O projeto não declara conformidade com a WCAG, e os minijogos não foram projetados para tecnologias assistivas. |
| RNF07 | Segurança | Senhas com bcrypt, sessão por cookie httpOnly, proteção contra CSRF, limite de requisições com contagem compartilhada no banco, Row Level Security, validação de todas as entradas no servidor, validação da pontuação (partida registrada, tempo mínimo e consistência do resumo), cabeçalhos de segurança e Content Security Policy, segredos fora do repositório. Os detalhes estão no README. |
| RNF08 | Manutenibilidade | Um minijogo por arquivo, todos com a mesma interface (título, descrição, controles, duração, iniciar, atualizar, resultado e destruir). |
| RNF09 | Disponibilidade | No plano gratuito, a primeira requisição depois de um período sem uso pode demorar mais, porque a função serverless precisa iniciar e o banco pode estar pausado por inatividade (limites a conferir nos planos atuais). A tela do ranking avisa o jogador durante a espera. |
| RNF10 | Legal | Sem imagens, sons ou músicas protegidos usados sem licença. Créditos e licenças de músicas e fontes registrados. Marca do IFC usada sem alterações. |
| RNF11 | Idioma | Interface em português do Brasil. |
| RNF12 | Privacidade | O sistema guarda apenas nome de usuário, hash da senha, pontuações, conquistas e total de partidas. Endereços IP aparecem no banco apenas como hash, no controle de limite de requisições. |

## 6. Regras de negócio

| ID | Regra |
|---|---|
| RN01 | Toda partida começa com 3 vidas, 0 pontos, nível 0 e sequência de vitórias zero. |
| RN02 | Cada rodada vencida vale 1 ponto. Não há pontuação máxima no jogo. O servidor só aceita pontuação inteira, não negativa e coerente com o resumo da partida (RN07). |
| RN03 | O nome de usuário tem de 3 a 20 caracteres, com espaços nas pontas removidos, e aceita letras latinas, números, sublinhado e hífen. É único sem diferenciar maiúsculas de minúsculas, e nomes reservados, como admin e professor, não podem ser registrados. Contas criadas com outras letras antes dessa regra continuam podendo entrar. A senha tem de 8 a 72 caracteres (72 bytes é o limite do bcrypt) e não pode ser igual ao nome de usuário. |
| RN04 | Cada jogador aparece uma vez no ranking, com sua melhor pontuação, que só é substituída por uma maior. A ordem é pontuação do maior para o menor, depois nível, depois data. Como o servidor calcula o nível a partir da pontuação, empates são decididos por quem atingiu a pontuação primeiro. O ranking exibe no máximo 100 jogadores. |
| RN05 | A pontuação de cada partida é enviada uma única vez. Cada partida é registrada no servidor quando começa e só pode ser usada uma vez. O reenvio de uma partida já registrada é reconhecido sem duplicar o total de partidas nem as conquistas. |
| RN06 | O nível é a parte inteira de pontos dividido por 5 e nunca diminui durante a partida. O tempo da rodada é o maior valor entre 1,5 segundo e o tempo base multiplicado por 0,9 elevado ao nível. Alguns minijogos também ajustam o próprio ritmo conforme o nível. |
| RN07 | Para a pontuação ser aceita, o servidor confere o tempo e o resumo. A partida precisa ter durado pelo menos (pontos + 3) vezes 4 segundos e no máximo 6 horas. O resumo precisa ser consistente: vidas restantes igual a zero, fases completas igual à pontuação e sequência máxima não maior que o número de fases. Cada jogador tem uma única partida em andamento, e iniciar outra substitui a anterior. O nível usado no desempate é sempre calculado pelo servidor. |
| RN08 | Cada jogador pode enviar no máximo 1 pontuação a cada 10 segundos e 100 por hora. |
| RN09 | As conquistas são concedidas pelo servidor ao salvar a pontuação, conforme a tabela abaixo. Cada conquista é concedida uma única vez por jogador. |

Tempo da rodada para um minijogo de 8 segundos:

| Nível | Pontos | Tempo da rodada |
|---|---|---|
| 0 | 0 a 4 | 8,00 s |
| 1 | 5 a 9 | 7,20 s |
| 5 | 25 a 29 | 4,72 s |
| 10 | 50 a 54 | 2,79 s |
| 15 | 75 a 79 | 1,65 s |
| 16 ou mais | 80 ou mais | 1,50 s (mínimo) |

Conquistas:

| Conquista | Regra |
|---|---|
| Primeiro Dia | Completar a primeira partida. |
| Sobrevivente | Vencer 5 minigames em uma mesma partida. |
| Quase um Milagre | Vencer um minigame com apenas uma vida restante. |
| Velocista | Vencer um minigame em até 10 segundos. |
| Veterano do IFC | Vencer 10 minigames em uma mesma partida. |
| Colecionador de Pontos | Vencer 15 minigames em uma mesma partida. |
| Persistente | Completar 10 partidas. |
| Sem Medo | Vencer 5 minigames consecutivos sem falhar. |

## 7. Caso de uso: jogar uma partida

Ator: jogador, com ou sem conta. Pré-condição: site aberto.

Fluxo principal:

1. O jogador abre a página Jogar e, se quiser salvar a pontuação, entra na conta.
2. No menu do jogo, o jogador escolhe Jogar.
3. Se estiver logado, o sistema registra a partida no servidor. A partida começa com 3 vidas, 0 pontos, nível 0 e sequência zero.
4. O sistema sorteia um minijogo diferente do anterior e mostra título, descrição e controles por cerca de 3,5 segundos.
5. O jogador age dentro do tempo da rodada.
6. O sistema avalia o resultado. Na vitória soma 1 ponto e 1 à sequência. Na derrota remove 1 vida e zera a sequência. Em seguida mostra o feedback.
7. Se ainda há vidas, volta ao passo 4, com o tempo ajustado conforme a RN06.
8. Sem vidas, o sistema mostra a pontuação final. Se o jogador estiver logado, envia a pontuação ao servidor.
9. O servidor valida a partida e devolve a posição do jogador e as conquistas novas.
10. O jogador volta ao menu e pode jogar de novo.

Fluxos alternativos:

- A1, falha no envio: o sistema avisa o jogador, mantém a pontuação na tela e oferece Tentar novamente. O reenvio de uma partida já salva é reconhecido sem duplicar o registro.
- A2, jogador sem conta: ao fim da partida o sistema informa que a pontuação não foi salva e que é preciso entrar para participar do ranking.
- A3, sessão expirada: o sistema informa que a sessão expirou e pede que o jogador entre de novo.
- A4, partida recusada pelo servidor (rápida demais, expirada ou substituída por outra mais nova): o sistema mostra o motivo, e a pontuação não é salva.
- A5, pausa: a tecla P pausa a partida e a retoma.

Pós-condição: para o jogador logado, a melhor pontuação está registrada no banco.

## 8. Arquitetura

```
Navegador
  React (portal, rotas, login, ranking, perfil)
    Phaser (cenas: Carregamento, Menu, Prática, Opções, Instrução, Partida, Pausa)
         |
         | axios (JSON, cookie de sessão httpOnly)
         v
  API Express  --->  PostgreSQL no Supabase
  (mesmo domínio,      (jogadores, ranking, conquistas_jogador,
   rotas /api)          partidas_em_andamento, rate_limits)
```

O jogo apenas gera a pontuação e a entrega ao React. O React cuida da sessão, do registro da partida, do envio da pontuação e da exibição do ranking e do perfil, que consultam a API diretamente, sem passar pelo Phaser.

| Camada | Tecnologia | Hospedagem |
|---|---|---|
| Frontend | React 19, Vite, Tailwind CSS 4, React Router, Axios, Lucide React | Vercel Services |
| Jogo | Phaser 4 | dentro do frontend |
| API | Node.js, Express 5, bcryptjs, jsonwebtoken, express-rate-limit, cors | Vercel Services |
| Banco | PostgreSQL, acessado pela API REST do Supabase | Supabase |

O arquivo vercel.json, na raiz, define os dois serviços (frontend e backend) e encaminha as requisições que começam com /api ao backend.

Autenticação: as senhas são guardadas com bcrypt. No cadastro e no login a API gera um JWT (HS256) assinado com a variável JWT_SECRET e válido por 24 horas, e o entrega em um cookie com as propriedades HttpOnly, SameSite=Lax, Path=/api e Secure em produção. O token não aparece nas respostas nem fica no navegador acessível ao JavaScript. O frontend descobre quem está logado consultando GET /api/usuario. Como a sessão usa cookie, as requisições que alteram dados só são aceitas se vierem do próprio site (verificação de Sec-Fetch-Site e Origin). O logout apaga o cookie, mas o servidor não mantém lista de tokens revogados.

## 9. Modelo de dados

| Tabela | Colunas |
|---|---|
| jogadores | id, usuario (único, sem diferenciar maiúsculas), senha_hash, partidas_totais, criado_em |
| ranking | id, jogador_id (único, referência a jogadores com exclusão em cascata), usuario, pontuacao, nivel, data |
| conquistas_jogador | id, jogador_id (referência a jogadores com exclusão em cascata), codigo, nome, descricao, icone, desbloqueado_em. Cada par jogador e código é único. |
| partidas_em_andamento | jogador_id (chave primária, referência a jogadores), id (identificador da partida), iniciada_em, usada |
| rate_limits | chave (hash), contagem, expira_em |

A view ranking_posicoes calcula a posição de cada jogador ordenando por pontuação (maior primeiro), nível (maior primeiro), data (mais antiga primeiro) e id. As funções SQL incrementar_partidas, rate_limit_hit, rate_limit_undo e rate_limit_reset são usadas pelo backend e só podem ser executadas pelo papel service_role. Todas as tabelas têm Row Level Security habilitado, com as permissões dos papéis públicos revogadas. O script completo está em backend/supabase-schema.sql e pode ser executado mais de uma vez.

## 10. Especificação da API

### 10.1 Convenções

- Em produção, a API fica no mesmo domínio do site, nas rotas /api. Localmente, o Vite encaminha /api para o backend na porta 5000.
- Formato: JSON em UTF-8. Requisições com corpo usam Content-Type: application/json, e o corpo é limitado a 10 KB.
- A sessão usa o cookie jbifc_token, definido pelo servidor no cadastro e no login. A API não aceita token no cabeçalho Authorization. Rotas protegidas sem sessão válida respondem 401.
- Requisições que alteram dados e vêm de outro site respondem 403.
- Erros devolvem um objeto com o campo erro. Excesso de requisições devolve 429, e rotas inexistentes devolvem 404.

### 10.2 Resumo das rotas

| Método | Rota | Função | Sessão |
|---|---|---|---|
| POST | /api/conta | Cria a conta e inicia a sessão | Não |
| POST | /api/login | Entra na conta e inicia a sessão | Não |
| POST | /api/logout | Encerra a sessão (apaga o cookie) | Não |
| GET | /api/usuario | Dados da conta logada | Sim |
| GET | /api/usuarios/:usuario | Perfil público de um jogador | Não |
| GET | /api/conquistas | Conquistas da conta logada | Sim |
| GET | /api/ranking | Ranking, com até 100 jogadores | Não |
| POST | /api/partida | Registra o início de uma partida | Sim |
| POST | /api/ranking | Registra a pontuação de uma partida | Sim |
| GET | /api/health | Verifica o estado da API e do banco | Não |

### 10.3 POST /api/conta

```json
{ "usuario": "Eduardo", "senha": "umaSenhaForte123" }
```

| Código | Quando | Corpo |
|---|---|---|
| 201 | Conta criada, com cookie de sessão | { "id": 1, "usuario": "Eduardo" } |
| 400 | Nome ou senha fora das regras da RN03 | { "erro": "..." } |
| 409 | Nome já em uso | { "erro": "Este nome de usuário já está em uso." } |
| 429 | Excesso de cadastros | { "erro": "..." } |

### 10.4 POST /api/login

Corpo igual ao do cadastro.

| Código | Quando | Corpo |
|---|---|---|
| 200 | Nome e senha corretos, com cookie de sessão | { "id": 1, "usuario": "Eduardo" } |
| 401 | Nome inexistente ou senha errada, com a mesma mensagem nos dois casos | { "erro": "..." } |
| 429 | Excesso de tentativas, por IP ou por conta | { "erro": "..." } |

### 10.5 GET /api/usuario

Devolve os dados da conta dona da sessão. O frontend usa essa rota ao abrir o site para saber quem está logado.

| Código | Quando | Corpo |
|---|---|---|
| 200 | Sessão válida | { "id": 1, "usuario": "Eduardo", "partidasTotais": 12 } |
| 401 | Sessão ausente, inválida ou expirada | { "erro": "..." } |

### 10.6 GET /api/usuarios/:usuario

Perfil público de um jogador.

| Código | Quando | Corpo |
|---|---|---|
| 200 | Jogador encontrado | { "usuario": "Eduardo", "partidasTotais": 12, "ranking": { ... }, "conquistas": [ ... ] } |
| 404 | Jogador não encontrado | { "erro": "Usuário não encontrado." } |

### 10.7 GET /api/ranking

Aceita o parâmetro opcional limite (de 1 a 100, padrão 100). Devolve um registro por jogador, ordenado conforme a RN04.

```json
[
  { "posicao": 1, "usuario": "Jogador1", "pontuacao": 31, "nivel": 6 },
  { "posicao": 2, "usuario": "Jogador2", "pontuacao": 27, "nivel": 5 }
]
```

Erro: 500 se o banco estiver indisponível.

### 10.8 POST /api/partida

Registra o início de uma partida da conta logada, com o horário marcado pelo servidor. Substitui a partida anterior que ainda estivesse em andamento.

| Código | Quando | Corpo |
|---|---|---|
| 201 | Partida registrada | { "partida": "identificador (UUID)" } |
| 401 | Sessão inválida | { "erro": "..." } |
| 429 | Excesso de partidas iniciadas | { "erro": "..." } |

### 10.9 POST /api/ranking

Registra a pontuação de uma partida terminada, em nome da conta logada.

```json
{
  "pontuacao": 12,
  "partida": "identificador devolvido por POST /api/partida",
  "resumo": {
    "score": 12,
    "vidasRestantes": 0,
    "sequenciaMaxima": 8,
    "fasesCompletas": 12,
    "minigameMaisRapidoMs": 4200,
    "venceuComUmaVida": true
  }
}
```

| Código | Quando | Corpo |
|---|---|---|
| 201 | Pontuação registrada | { "mensagem": "...", "posicao": 4, "registro": { "usuario": "...", "pontuacao": 12, "nivel": 2 }, "conquistasNovas": [ ... ] } |
| 400 | Pontuação, resumo ou identificador de partida inválidos, ou partida rápida demais | { "erro": "..." } |
| 401 | Sessão inválida | { "erro": "..." } |
| 409 | Partida já registrada (codigo partida_ja_registrada), ou inválida, expirada ou substituída (codigo partida_invalida) | { "erro": "...", "codigo": "..." } |
| 429 | Mais de 1 envio a cada 10 segundos ou mais de 100 por hora | { "erro": "..." } |
| 500 | Falha no banco | { "erro": "..." } |

### 10.10 Demais rotas

- POST /api/logout: responde 204 e apaga o cookie.
- GET /api/conquistas: exige sessão e devolve { "conquistas": [ ... ], "partidasTotais": 12 }.
- GET /api/health: responde 200 com { "banco": "ok" } ou 503 com { "banco": "indisponivel" }.

### 10.11 Limites de requisições

| Limite | Valor | Chave |
|---|---|---|
| Geral da API | 120 por minuto | IP |
| Login (tentativas que falham) | 20 a cada 15 minutos | IP |
| Login (tentativas que falham) | 10 a cada 15 minutos | Nome de usuário |
| Cadastro | 20 por hora | IP |
| Perfil público | 30 por minuto | IP |
| Início de partida | 10 por minuto | Jogador |
| Envio de pontuação | 1 a cada 10 segundos e 100 por hora | Jogador |

## 11. Frontend: páginas e rotas

| Rota | Página | Conteúdo | Acesso | Requisitos |
|---|---|---|---|---|
| / | Início | Apresentação do jogo, carrossel de minijogos, como funciona e prévia do ranking | Pública | RF21 |
| /login | Entrar | Formulário com duas abas: Entrar e Criar conta | Pública | RF02 |
| /jogar | Jogar | O jogo em Phaser. Sem conta, joga-se em modo demonstração. | Pública | RF01, RF03 a RF11, RF15 a RF19 |
| /ranking | Ranking | Tabela com até 100 jogadores, com destaque para o primeiro | Pública | RF12 |
| /perfil/:nome | Perfil | Posição, melhor pontuação, partidas e conquistas do jogador | Pública | RF13, RF14 |
| /como-jogar | Como jogar | Passo a passo e regras | Pública | RF20 |
| /equipe | Equipe | Integrantes e tecnologias | Pública | RF20 |
| * | Não encontrada | Mensagem para endereços inexistentes | Pública | RF21 |

A barra de navegação mostra Início, Ranking, Como jogar e Equipe, e o acesso à conta. Para quem está logado, mostra o nome do jogador e a opção de sair.

Sessão: um contexto de autenticação (AuthProvider) consulta GET /api/usuario ao abrir o site e quando a aba volta a ter foco, e atualiza o estado em login e logout. Nenhum dado de sessão fica no localStorage. Se a API responder 401 ao salvar uma pontuação, o frontend informa que a sessão expirou.

O componente do jogo destrói a instância do Phaser ao sair da página, para não duplicar o canvas ao voltar.

## 12. Minijogos

### 12.1 Interface comum

Todo minijogo é uma classe com título, descrição, controles, duração e os métodos iniciar (cria os objetos na tela), atualizar (lógica por quadro), resultado (devolve jogando, ganhou ou perdeu) e destruir (remove os objetos e escutas). A cena Partida apenas chama esses métodos. Alguns minijogos também ajustam o próprio ritmo conforme o nível.

### 12.2 Lista

Meta atual: 5 minijogos.

| Minijogo | Arquivo | Controles | Vitória | Derrota | Duração base |
|---|---|---|---|---|---|
| Solte os Porcos! | lockpick.js | E encaixa a gazua, W A S D arrombam | Abrir o portão antes do tempo acabar | Tempo esgotado | 8 s |
| Jonha Bird | naoSejaPego.js | Espaço ou botão do mouse para pular, E para esconder o jogo | Sobreviver até o fim do tempo | Falhar no jogo ou ser flagrado pelo professor | 8 s |
| Parado Aí! | vigiliaDosPorcos.js | Mouse | Impedir os alunos que estão aprontando (são 3) antes do tempo acabar | Tempo esgotado | 8 s |
| A preencher | | | | | |
| A preencher | | | | | |

### 12.3 Modelo de ficha

- Título, descrição e controles exibidos na instrução.
- Como se ganha e como se perde.
- Duração inicial e como a dificuldade aumenta.
- Lista de imagens e sons necessários, com tamanho e nome dos arquivos.

## 13. Identidade visual

A paleta do portal é a abaixo.

| Cor | Hex | Uso |
|---|---|---|
| Fundo da página | #F5F6F4 | Fundo das páginas |
| Superfícies | #FFFFFF | Cartões e painéis |
| Texto principal | #1F2A30 | Texto e títulos |
| Texto secundário | #5B6770 | Textos de apoio |
| Bordas | #D9DDD7 | Linhas e divisórias |
| Verde de marca | #1E6B2C | Botões principais, links e destaques |
| Verde de apoio | #EAF4EC | Fundos suaves |
| Verde vivo | #2F9E41 | Elementos gráficos e textos grandes |
| Fundo do jogo | #141B1F | Fundo da área do jogo |
| Amarelo | #FFC93C | Destaques, pontuação e primeiro colocado |
| Vermelho | #CD191E | Perda de vida e erro |

Contrastes das combinações, calculados pela fórmula do WCAG. Texto grande é o de 24 px ou mais, ou de 18,66 px ou mais em negrito.

| Combinação | Contraste | Uso permitido |
|---|---|---|
| Texto principal sobre fundo da página | 13,5 para 1 | Texto pequeno |
| Texto principal sobre superfície | 14,7 para 1 | Texto pequeno |
| Texto principal sobre amarelo | 9,5 para 1 | Texto pequeno |
| Branco sobre fundo do jogo | 17,4 para 1 | Texto pequeno |
| Amarelo sobre fundo do jogo | 11,3 para 1 | Texto pequeno |
| Branco sobre verde de marca | 6,6 para 1 | Texto pequeno |
| Verde de marca sobre fundo da página | 6,1 para 1 | Texto pequeno |
| Verde de marca sobre verde de apoio | 5,8 para 1 | Texto pequeno |
| Texto secundário sobre superfície | 5,8 para 1 | Texto pequeno |
| Texto secundário sobre fundo da página | 5,4 para 1 | Texto pequeno |
| Branco sobre vermelho | 5,6 para 1 | Texto pequeno |
| Vermelho sobre fundo da página | 5,2 para 1 | Texto pequeno |
| Verde vivo sobre fundo do jogo | 5,0 para 1 | Texto pequeno |
| Branco sobre verde vivo | 3,4 para 1 | Só texto grande e elementos gráficos |
| Verde vivo sobre fundo da página | 3,2 para 1 | Só texto grande e elementos gráficos |

Tipografia: Inter para o texto do portal, e fontes de estilo pixel art (Press Start 2P e Pixelify Sans) no jogo. Todas as fontes são servidas pelo próprio site, sem carregar nada de terceiros.

Regras: o vermelho sempre significa perda ou erro. Vitória e derrota nunca aparecem só por cor, sempre com texto junto. O logo do IFC é usado sem alteração. A arte dos minijogos segue o estilo pixel art da equipe de design.

## 14. Plano de testes

| ID | Caso de teste | Resultado esperado | Requisito |
|---|---|---|---|
| T01 | Cadastro com nome e senha válidos | 201, cookie de sessão definido e conta no banco com senha em hash, nunca em texto puro | RF02, RNF07 |
| T02 | Cadastro com nome vazio, com menos de 3 ou com mais de 20 caracteres | 400 | RN03 |
| T03 | Cadastro com letras de outros alfabetos (por exemplo cirílico) ou com nome reservado, como Admin | 400 | RN03 |
| T04 | Cadastro com senha de 7 caracteres, com mais de 72 bytes ou igual ao nome | 400 | RN03 |
| T05 | Cadastro com nome já usado, inclusive com maiúsculas diferentes | 409 | RN03 |
| T06 | Cadastro com texto de injeção de SQL no nome, por exemplo ' OR 1=1 -- | Rejeitado com 400. Nenhuma consulta é alterada e as tabelas continuam íntegras. | RNF07 |
| T07 | Login com nome e senha corretos | 200 e cookie de sessão | RF02 |
| T08 | Login com senha errada e login com nome inexistente | 401 com a mesma mensagem nos dois casos | RF02 |
| T09 | Muitas tentativas erradas de login, no mesmo IP e na mesma conta | 429, e o bloqueio continua depois de reiniciar o servidor | RNF07 |
| T10 | Logout e depois GET /api/usuario | O cookie é apagado e a segunda chamada devolve 401 | RF02 |
| T11 | POST de outro site (origem diferente) para uma rota que altera dados | 403 | RNF07 |
| T12 | Iniciar uma partida, esperar o tempo mínimo e enviar a pontuação | 201 com a posição e as conquistas novas | RF11, RN07 |
| T13 | Enviar a pontuação sem partida registrada, ou com identificador inventado | 400 ou 409, e nada é gravado | RN05, RN07 |
| T14 | Enviar a pontuação antes do tempo mínimo da partida | 400, e a partida é descartada | RN07 |
| T15 | Reenviar uma partida que já foi salva | 409 com codigo partida_ja_registrada, sem duplicar o total de partidas | RN05 |
| T16 | Enviar resumo inconsistente (por exemplo vidas restantes diferente de zero) ou pontuação negativa ou decimal | 400 | RN02, RN07 |
| T17 | Enviar duas pontuações em menos de 10 segundos | 429 na segunda | RN08 |
| T18 | Enviar pontuação sem sessão | 401 e nada gravado | RF11 |
| T19 | Ranking com vários jogadores e mais de uma partida por jogador | Cada jogador aparece uma vez, com a melhor pontuação, em ordem decrescente e com no máximo 100 linhas | RF12, RN04 |
| T20 | Ranking com empate de pontuação | Fica acima quem atingiu a pontuação primeiro | RN04 |
| T21 | Jogar sem conta uma partida completa | A partida funciona, o sistema avisa que a pontuação não foi salva e nada é gravado | RF01 |
| T22 | Jogar com conta uma partida completa perdendo as 3 vidas | Tela final, envio da pontuação, posição exibida e conquistas registradas | RF10, RF11 |
| T23 | Completar 5 vitórias e depois perder uma rodada | O tempo cai 10% ao chegar a 5 pontos e não volta ao inicial depois da derrota. Nunca fica abaixo de 1,5 s. | RF09, RN06 |
| T24 | 50 rodadas seguidas | Nunca o mesmo minijogo duas vezes em sequência | RF03 |
| T25 | Desligar a internet no fim da partida e religar | Aviso de falha, pontuação mantida na tela e Tentar novamente envia uma única vez | RF18, RN05 |
| T26 | Deixar a sessão expirar e salvar uma pontuação | Aviso de sessão expirada e pedido para entrar de novo | RF11 |
| T27 | Desbloquear conquistas e abrir o perfil público | As conquistas aparecem no perfil, uma única vez cada | RF13, RF14, RN09 |
| T28 | Pausar com P durante a partida e retomar | O jogo para e volta de onde estava | RF16 |
| T29 | Abrir o modo prática e treinar um minijogo | O minijogo roda sem gerar pontuação nem registro no ranking | RF15 |
| T30 | Ajustar o volume até silenciar e mudar a qualidade gráfica | O som cala, a qualidade muda e o volume é lembrado | RF17 |
| T31 | Abrir um endereço inexistente | Página de não encontrada | RF21 |
| T32 | Abrir /ranking digitando o endereço no site publicado | A página abre, sem erro 404 | RF21 |
| T33 | Sair da página de jogo e voltar três vezes | Um único canvas e o jogo funciona normalmente | Seção 11 |
| T34 | Navegar só pelo teclado, inclusive nos formulários | Foco visível e todos os links e botões acessíveis | RNF06 |
| T35 | Abrir o site em 1280x720 nos quatro navegadores | Sem rolagem horizontal e jogo jogável | RNF03, RNF04 |
| T36 | Abrir o portal em tela de celular | Páginas e menus se adaptam ao tamanho da tela | RNF04 |
| T37 | Medir o contraste dos textos com uma ferramenta | 4,5 para 1 ou mais em texto pequeno | RNF06 |
| T38 | Conferir o repositório | Nenhum .env versionado. SUPABASE_SERVICE_ROLE_KEY e JWT_SECRET só em variáveis de ambiente. | RNF07 |
| T39 | Rodar npm audit no backend e no frontend | Nenhuma vulnerabilidade conhecida nas dependências de produção | RNF07 |
| T40 | Abrir as ferramentas do navegador no site publicado e conferir os cabeçalhos e o console | Cabeçalhos de segurança presentes e nenhum erro de Content Security Policy durante uma partida completa | RNF07 |

## 15. Segurança e riscos

### 15.1 Segurança

As medidas estão descritas com detalhes na seção de segurança do README. Em resumo:

- Senhas guardadas com bcrypt (custo 12), com regras de tamanho e de nome.
- Sessão por JWT em cookie httpOnly, SameSite=Lax e Secure em produção, com validade de 24 horas, e proteção contra CSRF por verificação de origem.
- Limite de requisições por IP, por conta e por jogador, com a contagem guardada no banco para valer entre todas as instâncias do servidor.
- Pontuação validada no servidor: partida registrada, de uso único, com tempo mínimo e resumo consistente, e nível calculado pelo servidor.
- Row Level Security em todas as tabelas, permissões públicas revogadas e chave de serviço só no backend.
- Validação de todas as entradas, erros genéricos para o cliente e perfil público sem identificador interno.
- Cabeçalhos de segurança na API e no frontend, com Content Security Policy sem fontes ou scripts de terceiros.
- Segredos em variáveis de ambiente, com o arquivo .env fora do repositório.

Limitações conhecidas, que também devem constar no relatório:

- O jogo roda no navegador, então um programa que espere o tempo necessário e envie um resumo coerente ainda consegue registrar uma pontuação. As barreiras tornam isso lento e trabalhoso, mas não impossível.
- O logout apaga o cookie, mas um token copiado antes continua válido até expirar, em 24 horas.
- O limite por nome de usuário protege contra força bruta, mas permite bloquear temporariamente a conta de outra pessoa (10 tentativas erradas, 15 minutos).
- Sem e-mail não há recuperação de senha. Quem esquecer a senha precisa criar outra conta.
- Se o banco ficar indisponível, o limite de requisições passa a ser local, o que é menos eficaz entre várias instâncias.

### 15.2 Riscos do projeto

| Risco | Impacto | Mitigação |
|---|---|---|
| Prazo curto para o escopo | Funcionalidades incompletas | Priorizar o que já funciona, congelar funcionalidades e usar o tempo final para correções, documentação e vídeo. |
| Um integrante ficar indisponível | Parte do projeto para | Revisão cruzada de pull requests e conhecimento compartilhado do código. |
| Arte entregue tarde ou fora do padrão | Retrabalho | Fichas prontas cedo, padrão de arquivos combinado e placeholders no código. |
| Primeira requisição lenta no plano gratuito | Primeiro acesso e primeiro login lentos na apresentação | Abrir o site antes de apresentar. A tela do ranking avisa o jogador durante a espera. |
| Rota direta dando erro 404 após o deploy | Site parece quebrado | Configurar a reescrita para o index.html e testar no link público (T32). |
| Som bloqueado pelo navegador | Jogo mudo | O áudio só toca depois de uma interação do jogador, como o clique em Jogar. |
| Uso indevido de assets protegidos | Perda de nota | Arte própria, músicas e fontes com licenças anotadas. |
| Content Security Policy bloqueando algum recurso do jogo | Jogo quebrado em produção | Testar uma partida completa com o console aberto (T40) antes de cada entrega. |
| Segredo do banco ou do JWT publicado | Banco ou contas comprometidos | .env no .gitignore. Se vazar, gerar nova chave de serviço no Supabase e novo JWT_SECRET, o que desloga todos os jogadores. |
| Banco desatualizado em relação ao backend | Salvamento de pontuação e conquistas falha | Executar o supabase-schema.sql antes de publicar uma nova versão do backend. |

## 16. Configuração e publicação

### 16.1 Variáveis de ambiente

| Variável | Onde | Valor |
|---|---|---|
| SUPABASE_URL | backend | Endereço do projeto Supabase |
| SUPABASE_SERVICE_ROLE_KEY | backend | Chave de serviço, privada |
| JWT_SECRET | backend | Texto aleatório com pelo menos 32 caracteres. Com um valor menor, o servidor não inicia. |
| JWT_EXPIRACAO | backend (opcional) | Validade do token, padrão 24h |
| FRONTEND_URL | backend (opcional) | Origens permitidas, separadas por vírgula |
| PORT | backend (opcional) | Porta do servidor, padrão 5000 |

O frontend não precisa de variáveis, porque as requisições usam caminhos relativos, como /api/login.

### 16.2 Rodar localmente

Execute o arquivo backend/supabase-schema.sql no Supabase antes de iniciar o backend e crie o backend/.env com as variáveis acima.

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

Acesse o site pelo endereço do Vite (normalmente http://localhost:5173), que encaminha as chamadas /api para o backend.

### 16.3 Publicação

1. Banco: criar o projeto no Supabase e executar o backend/supabase-schema.sql (também a cada atualização do schema).
2. Repositório: enviar o código ao GitHub e conectá-lo à Vercel.
3. A Vercel identifica os dois serviços definidos no vercel.json: frontend (Vite) e backend (Express).
4. Cadastrar as variáveis de ambiente do backend nas configurações do projeto.
5. Testar o fluxo completo no link público: criar conta, entrar, jogar, salvar a pontuação e ver o ranking e o perfil.

## 17. Entregas

A entrega final é em 24/11/2026, conforme as orientações do trabalho.

| Entrega | O que é |
|---|---|
| 1 | Aplicação web publicada, com link válido e testado antes da entrega. |
| 2 | Repositório do GitHub com o código-fonte, organizado em pastas e arquivos. O link do repositório e o link do site publicado são diferentes, e os dois são informados. |
| 3 | README.md com a documentação, correspondendo ao que foi efetivamente desenvolvido. |
| 4 | Vídeo de apresentação técnica no YouTube, de 5 a 10 minutos, com a participação de todos os integrantes. |

## 18. Pendências

- Preencher os dois minijogos que faltam na tabela da seção 12.2.
- Confirmar com o professor que o link da Vercel atende à Entrega 1, já que as orientações citam o GitHub Pages.
- Conferir os limites atuais dos planos gratuitos da Vercel e do Supabase, incluindo a espera do RNF09.
- Medir desempenho e contraste e executar o plano de testes da seção 14.
- Gravar e publicar o vídeo da Entrega 4.