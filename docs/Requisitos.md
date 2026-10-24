# Microjogos IFC: Documento de Requisitos e Especificação

Trabalho de Desenvolvimento Web 2, Instituto Federal Catarinense. Versão 1.0, 22 de outubro de 2026.

## 1. Introdução

### 1.1 Objetivo

Este documento descreve o que o site JBIFC deve fazer, como ele é organizado e como será testado e publicado. Serve de referência para a equipe durante o desenvolvimento e como parte da entrega da disciplina.

### 1.2 Escopo

O sistema é um site com vários microjogos de poucos segundos, no estilo de Dumb Ways to Die e WarioWare. O jogador faz login, joga uma sequência de minijogos até perder as três vidas e tem a pontuação registrada em um ranking online.

### 1.3 Definições

| Termo | Significado |
|---|---|
| Minijogo | Jogo de 5 a 10 segundos com uma única instrução e uma regra de vitória. |
| Rodada | Uma execução de um minijogo, da instrução até o resultado. |
| Partida | Sequência de rodadas, da primeira até a perda da terceira vida. |
| Pontuação | Número de rodadas vencidas em uma partida. |
| Ranking | Lista das melhores pontuações de todos os jogadores. |
| API | Servidor que recebe e entrega os dados do ranking e conta por requisições HTTP. |
| Phaser | Biblioteca JavaScript para jogos 2D que desenha dentro de um canvas. |

## 2. Visão geral do produto

O produto é uma aplicação web de página única com três partes: o frontend em React, que contém o site e o jogo feito em Phaser; a API em Express; e o banco de dados PostgreSQL.

Usuários: jogadores (professor e estudantes da turma) podem criar conta e entrar em suas contas

Premissas: os jogadores têm navegador atualizado e internet; o professor avalia por link público.

## 3. Elicitação de requisitos

### 3.1 Partes interessadas

| Parte interessada | O que espera do sistema |
|---|---|
| Jogador | Entender o jogo sem explicação, jogar rápido no celular ou no computador, ver sua posição no ranking. |
| Professor | Uso correto das tecnologias da disciplina, sistema funcionando, relatório coerente. |
| Equipe de desenvolvimento | Escopo realista, arquitetura simples, poucos conflitos de código. |
| Equipe de design | Padrão claro de arquivos de arte e fichas de minijogos prontas cedo. |
| Organização | Tarefas visíveis, critérios de avaliação conhecidos, relatório e apresentação. |
| IFC (instituição) | Uso da marca sem alterações. |

### 3.2 Técnicas utilizadas

- Análise de referências: Dumb Ways to Die e WarioWare, para extrair o formato (rodadas curtas, instrução de uma palavra, velocidade crescente) sem copiar material protegido.
- Brainstorming da equipe: gerou a lista de ideias de minijogos da seção 12.
- Prototipação: mockup da página inicial em HTML para validar paleta e hierarquia visual.
- Conversa com o professor: pendente, com o roteiro da seção 3.3.
- Playtest com colegas: previsto para as semanas 2 e 3, com o roteiro da seção 3.3.

### 3.3 Roteiro de perguntas

Perguntas ao professor (as respostas devem ser preenchidas pela organização):

| Pergunta | Por que importa | Resposta |
|---|---|---|
| Há tecnologias obrigatórias ou proibidas, por exemplo bibliotecas de jogos como o Phaser? | Evita refazer o projeto no fim. | Não, pode se utilizar todo conhecimento técnico do estudante |
| O banco de dados precisa ser relacional? Algum específico? | Confirma a escolha do PostgreSQL. | Qualquer banco de dados, mas de preferencia o ensinado em Banco de Dados |
| O site precisa estar em link público ou basta rodar localmente na apresentação? | Define se o deploy é obrigatório. | Precisa |
| Podemos usar a marca do IFC no site? | Define o uso do logo. | Pode-se utilizar, mas citar que não está relacionado com a instituição real |

Perguntas para o playtest com colegas:

- A pessoa entendeu a instrução de cada minijogo sem explicação?
- Jogou no celular ou no computador, e o controle foi confortável?
- Alguma rodada pareceu injusta ou impossível?
- Quanto tempo jogou seguido e voltaria para melhorar sua posição?

### 3.4 Decisões tomadas até aqui

| Decisão | Motivo |
|---|---|
| JavaScript em vez de C com WebAssembly | A disciplina é de web, microjogos não exigem desempenho extra e a configuração do Emscripten aumentaria o risco do prazo. |
| Phaser 3 | Já traz cenas, entrada por mouse e toque, sons e animações. |
| React com Tailwind e React Router | Tecnologias que a equipe já domina. |
| Express com PostgreSQL | Mesma linguagem do frontend e planos gratuitos de hospedagem. Também são ensinados no curso. |
| Controles só por mouse e teclado | Funciona apenas em computadores |
| Meta de 8 minijogos | Escopo compatível com dois desenvolvedores em um mês. |
| Sem multijogador em tempo real | Exigiria WebSockets e sincronização, um projeto à parte. |
| Ranking com login | Mesmo com dificuldade a mais, se relacionará com o conteúdo atual ensinado no curso |

## 4. Requisitos funcionais

| ID | Requisito | Prioridade |
|---|---|---|
| RF01 | O jogador precisa criar uma conta para poder jogar | Essencial |
| RF02 | O sistema sorteia um minijogo a cada rodada, tendo repetições com o tempo, mas nunca os dois mesmos seguidos. | Essencial |
| RF03 | O sistema mostra a instrução por cerca de 1 segundo antes de cada rodada. | Essencial |
| RF04 | Cada rodada tem limite de tempo de 5 a 10 segundos. | Essencial |
| RF05 | O sistema decide vitória ou derrota pela regra do minijogo ou pelo tempo esgotado. | Essencial |
| RF06 | O sistema controla 3 vidas e remove 1 a cada derrota. | Essencial |
| RF07 | O sistema soma 10 ponto por vitória e mostra pontuação e vidas na tela. | Essencial |
| RF08 | O tempo das rodadas diminui a cada 5 vitórias seguidas. | Importante |
| RF09 | A partida termina com 0 vidas e mostra a pontuação final. | Essencial |
| RF10 | O sistema envia nome e pontuação ao servidor ao fim da partida. | Essencial |
| RF11 | O sistema exibe o ranking com todas as pontuações da turma, mas com um pódio. | Essencial |
| RF12 | O jogador pode jogar de novo sem recarregar a página. | Importante |
| RF13 | O site tem uma página Como jogar. | Importante |
| RF14 | O site tem uma página Equipe com créditos e fontes dos assets. | Importante |
| RF15 | A navegação entre páginas não recarrega o site. | Importante |
| RF16 | Se o envio da pontuação falhar, o sistema avisa o jogador e mantém a pontuação na tela. | Importante |
| RF17 | Sons e música com botão para silenciar. | Desejável |

## 5. Requisitos não funcionais

| ID | Categoria | Requisito |
|---|---|---|
| RNF01 | Desempenho | O jogo roda a cerca de 60 quadros por segundo em um computador intermediário. |
| RNF02 | Desempenho | A primeira tela jogável aparece em até 5 segundos. |
| RNF03 | Compatibilidade | Qualquer navegador. |
| RNF04 | Responsividade | Telas gerais de computador. |
| RNF05 | Usabilidade | Uso de teclado e mouse. |
| RNF06 | Acessibilidade | Contraste mínimo de 4,5 para 1 em texto pequeno, navegação por teclado no site e foco visível. |
| RNF07 | Segurança | Validação no servidor, consultas SQL parametrizadas e segredos fora do repositório. |
| RNF08 | Manutenibilidade | Um minijogo por arquivo, todos com a mesma interface. |
| RNF09 | Disponibilidade | No plano gratuito o servidor pode levar até 60 segundos para responder após inatividade; o site deve avisar o jogador. |
| RNF10 | Legal | Sem imagens, sons ou músicas protegidos; licenças dos assets registradas; marca do IFC sem alterações. |
| RNF11 | Idioma | Interface em português do Brasil. |

## 6. Regras de negócio

| ID | Regra |
|---|---|
| RN01 | Toda partida começa com 3 vidas. |
| RN02 | A pontuação máxima aceita pelo servidor é 1000. |
| RN03 | O nome do usuário tem de 1 a 20 caracteres, com espaços nas pontas removidos. |
| RN04 | O ranking é ordenado por pontos, do maior para o menor. Em caso de empate, fica acima quem chegou primeiro. |
| RN05 | A pontuação é enviada uma única vez, ao fim da partida. |
| RN06 | A cada 5 vitórias seguidas o tempo da rodada diminui 10%, com mínimo de 1,5 segundo. Valores iniciais, a ajustar após os playtests. |

## 7. Caso de uso: jogar uma partida

Ator: jogador. Pré-condição: site aberto na página de jogo.

Fluxo principal:

1. O jogador cria uma conta e toca em Jogar.
2. O sistema inicia a partida com 3 vidas e 0 pontos.
3. O sistema sorteia um minijogo e mostra a instrução.
4. O jogador age dentro do tempo da rodada.
5. O sistema avalia o resultado, atualiza pontos ou vidas e mostra o feedback.
6. Se ainda há vidas, volta ao passo 3, com o tempo reduzido quando aplicável.
7. Sem vidas, o sistema mostra a pontuação final e envia nome e pontos à API.
8. O sistema mostra a posição no ranking e oferece Jogar de novo.

Fluxos alternativos:

- A1: falha no envio. O sistema avisa o jogador, mantém a pontuação na tela e permite tentar de novo.

## 8. Arquitetura

```
Navegador
  React (site, rotas, ranking, conta)
    Phaser (cenas: Menu, Partida, FimDeJogo)
         |
         | fetch (JSON)
         v
  API Express  --->  PostgreSQL (tabela ranking, conta)
```

O jogo apenas gera a pontuação. A exibição do ranking é feita pelo React, que consulta a API diretamente, sem passar pelo Phaser.

| Camada | Tecnologia | Hospedagem |
|---|---|---|
| Frontend | React, Vite, Tailwind, React Router | Vercel |
| Jogo | Phaser 3 | dentro do frontend |
| API | Node.js, Express 5, pacote pg | Render |
| Banco | PostgreSQL | Neon |

## 10. Especificação da API

### 10.1 Convenções

- URL base local: http://localhost:5000. Em produção, a URL do serviço no Render, configurada no frontend pela variável VITE_API_URL.
- Formato: JSON com codificação UTF-8. Requisições com corpo usam o cabeçalho Content-Type: application/json.
- CORS habilitado para o domínio do frontend.
- Erros devolvem um objeto com o campo erro.

### 10.2 Resumo das rotas

| Método | Rota | Função | Situação |
|---|---|---|---|
| POST | /api/conta | Registra a conta de um usuário | Implementada |
| GET | /api/conta | Pega as informações de um usuário | Implementada |
| GET | /api/ranking | Lista as 10 melhores pontuações | Implementada |
| POST | /api/pontuacao | Registra uma pontuação | Implementada |
| GET | /api/saude | Verifica se o servidor está ativo | Proposta |
| GET | /api/ranking?periodo=dia | Ranking do dia ou da semana | Futura (RF18) |

### 10.3 GET /api/ranking

Devolve até 10 registros ordenados por pontos, do maior para o menor.

Resposta 200:

```json
[
  { "nome": "Jogador 1", "pontos": 31 },
  { "nome": "Jogador 2", "pontos": 27 }
]
```

Erros: 500 com { "erro": "erro interno" } se o banco estiver indisponível.

### 10.4 POST /api/pontuacao

Registra a pontuação de uma partida terminada.

Corpo da requisição:

```json
{ "nome": "Eduardo", "pontos": 12 }
```

Validações no servidor: nome é texto de 1 a 20 caracteres depois de remover espaços nas pontas; pontos é inteiro entre 0 e 1000.

| Código | Quando | Corpo |
|---|---|---|
| 201 | Pontuação salva | vazio |
| 400 | Dados inválidos | { "erro": "dados inválidos" } |
| 500 | Falha no banco | { "erro": "erro interno" } |

### 10.5 GET /api/saude (proposta)

Resposta 200: { "status": "ok" }. Serve como verificação de saúde do Render e para o frontend acordar o servidor assim que o site abre, reduzindo a espera do primeiro acesso.


## 11. Frontend: páginas e rotas

| Rota | Página | Conteúdo | Requisitos |
|---|---|---|---|
| / | Início | Apresentação, botão Jogar, como funciona, prévia do ranking | RF15 |
| /jogar | Jogar | Campo de nome e o jogo em Phaser | RF01 a RF10, RF12, RF16 |
| /ranking | Ranking | Tabela com as 10 melhores pontuações | RF11 |
| /como-jogar | Como jogar | Regras e instrução de cada minijogo | RF13 |
| /equipe | Equipe | Integrantes, créditos e fontes dos assets | RF14 |
| * | Não encontrada | Mensagem e link para o início | RF15 |

A navbar e o rodapé aparecem em todas as páginas. O componente do jogo deve destruir a instância do Phaser ao sair da página, para não duplicar o canvas ao voltar.

## 12. Minijogos

### 12.1 Interface comum

Todo minijogo é uma classe com instrução, duração e quatro métodos: iniciar (cria os objetos na tela), atualizar (lógica por quadro), resultado (devolve jogando, ganhou ou perdeu) e destruir (remove os objetos). A cena Partida apenas chama esses métodos.

### 12.2 Lista

| Minijogo | Instrução | Vitória | Derrota | Duração |
|---|---|---|---|---|
A definir

### 12.3 Modelo de ficha

- Nome e instrução na tela (uma palavra).
- Como se ganha e como se perde.
- Duração e como a dificuldade aumenta.
- Controle (toque, teclado, movimento).
- Lista de imagens e sons necessários, com tamanho e nome dos arquivos.

## 13. Identidade visual

| Cor | Hex | Uso |
|---|---|---|
| Verde IFC | #2F9E41 | Cor principal, vitória |
| Verde escuro | #1E6B2C | Navbar, texto sobre fundo claro |
| Verde claro | #A8DDB2 | Fundos suaves, página atual |
| Vermelho IFC | #CD191E | Perda de vida e erro |
| Amarelo | #FFC93C | Botão Jogar, pontuação, destaque |
| Grafite | #1F2A30 | Fundos escuros e texto principal |
| Creme | #F7F4EA | Fundo das páginas |

Os valores de verde e vermelho são aproximações e devem ser confirmados no logo oficial atual com um conta-gotas. Tipografia: Fredoka (pesos 500, 600 e 700). Regras: o vermelho sempre significa perda ou erro; o logo do IFC é usado sem alteração, na versão negativa sobre fundo escuro; arte dos minijogos em estilo chapado, sem degradês.

## 14. Plano de testes

| ID | Caso de teste | Resultado esperado |
|---|---|---|
| T01 | POST /api/pontuacao com nome e pontos válidos | 201 e registro no banco |
| T02 | POST com nome vazio | 400 com erro |
| T03 | POST com pontos 1001 | 400 com erro |
| T04 | POST com pontos não numéricos | 400 com erro |
| T05 | POST com nome de 40 caracteres | Nome cortado em 20 ou rejeitado, conforme a regra |
| T06 | GET /api/ranking com mais de 10 registros | Apenas 10, do maior para o menor |
| T07 | Partida completa perdendo 3 rodadas | Tela final e envio da pontuação |
| T08 | Desligar a internet no fim da partida | Aviso de falha e pontuação mantida na tela |
| T09 | Jogar no celular, em tela de 360 px | Todos os minijogos jogáveis só com toque |
| T10 | Abrir /ranking digitando o endereço no navegador publicado | Página abre, sem erro 404 |
| T11 | Sair da página de jogo e voltar três vezes | Um único canvas e o jogo funciona normalmente |
| T12 | Navegar só pelo teclado | Foco visível e todos os links acessíveis |
| T13 | Criar conta com tentativa de hack | Bloquear com o uso de bibliotecas express |

## 15. Segurança e riscos

### 15.1 Segurança

- Senhas armazenadas com hash
- Uso de helmet e rate limit
- A pontuação sai do navegador, então qualquer pessoa pode enviar valores falsos pelo console. O limite de 1000 reduz o problema, mas não o elimina. A limitação deve constar no relatório.
- Todas as consultas usam parâmetros (por exemplo $1 e $2), o que evita injeção de SQL.
- A variável DATABASE_URL fica no arquivo .env, que não vai para o GitHub, e no painel de variáveis do Render. Como o repositório é público, o .gitignore precisa conter .env antes do primeiro commit do backend.

### 15.2 Riscos do projeto

| Risco | Impacto | Mitigação |
|---|---|---|
| Escopo grande para 2 desenvolvedores | Atraso | Meta de 6 minijogos, congelar funcionalidades no dia 22 e priorizar as semanas 1 a 4 do cronograma. |
| Um desenvolvedor ficar indisponível | Projeto para | Revisão cruzada de pull requests e conhecimento compartilhado do código. |
| Arte entregue tarde ou fora do padrão | Retrabalho | Fichas prontas cedo, padrão de arquivos combinado e placeholders no código. |
| Servidor gratuito dormindo | Primeiro acesso lento na apresentação | Abrir o site antes de apresentar e usar a rota /api/saude. |
| Rota direta dando erro 404 após o deploy | Site parece quebrado | Configurar o redirecionamento para index.html e testar desde a semana 1. |
| Som bloqueado pelo navegador | Jogo mudo | Tela inicial com botão Jogar que libera o áudio. |
| Uso indevido de marca ou assets protegidos | Perda de nota | Logo oficial sem alteração e licenças dos assets anotadas na página Equipe. |
| Segredo do banco publicado | Banco comprometido | .env no .gitignore; se vazar, gerar nova senha no Neon. |

## 16. Configuração e publicação

### 16.1 Variáveis de ambiente

| Variável | Onde | Valor |
|---|---|---|
| DATABASE_URL | backend (.env e painel do Render) | String de conexão do PostgreSQL |
| PORT | backend (opcional) | Porta do servidor, padrão 5000 |
| VITE_API_URL | frontend | URL base da API |

### 16.2 Rodar localmente

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

1. Banco: criar o projeto no Neon e copiar a string de conexão.
2. Backend: serviço web no Render com Root Directory backend, comando de início npm start e DATABASE_URL no painel.
3. Frontend: projeto na Vercel ou Netlify com Root Directory frontend, variável VITE_API_URL apontando para o Render e regra de redirecionamento para index.html.
4. Testar o fluxo completo no link público: jogar, enviar pontuação e ver o ranking.

## 17. Cronograma


| Semana | Entregas |
|---|---|
| 1 | Repositório, páginas iniciais básicas, funcionalidade de criação de conta, página de ranking e estrutura do phaser básica. |
| 2 | Núcleo do jogo (sorteio, vidas, dificuldade), minijogos 1, 2 e 3, arte dos minijogos 1 a 3. |
| 3 | Minijogos 4 a 6, sons, arte final no lugar dos placeholders, páginas finais, testes no celular. |
| 4 | Minijogos 7 e 8, congelar funcionalidades por volta do dia 25, correção de bugs, deploy final, relatório, apresentação e 3 dias de folga. |

## 18. Pendências

- Fichas completas dos minijogos
- Definir se haverá sons e música (RF17).