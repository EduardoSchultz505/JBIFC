
# Roteiro de Apresentação — JBIFC
## A Regular Mosquito's Day

**Duração prevista:** 8 minutos  
**Participantes:** Eduardo Schultz, Vinicius Pecini, Endrio Ruan, Guilherme Otávio, Gustavo Kell e João Araldi.

---

## 1. Apresentação do projeto — Eduardo Schultz
**Tempo: 0:00–1:00**

Olá a todos! Nós somos a equipe JBIFC e vamos apresentar nosso projeto de desenvolvimento web, chamado **Regular Mosquito's Day**.

O projeto consiste em um portal web que reúne diversos minijogos no estilo arcade, com estética em pixel art. São partidas rápidas e dinâmicas, que desafiam os reflexos, a atenção e a capacidade de reação dos jogadores.

Nossa proposta é reunir diversas experiências de jogo em uma única plataforma, proporcionando uma experiência divertida para os usuários.

## 2. Objetivo, problema e público-alvo — Vinicius Pecini
**Tempo: 1:00–2:00**

O principal objetivo do projeto é criar uma plataforma de jogos curtos e acessíveis, na qual os usuários possam testar suas habilidades e competir por melhores pontuações.

O público-alvo são pessoas que gostam de jogos casuais, especialmente aquelas que procuram desafios rápidos e partidas curtas.

Um exemplo de utilização é um jogador acessar o portal, criar uma conta, escolher um minijogo, jogar e depois consultar sua pontuação no ranking.

A aplicação também conta com conquistas, incentivando os jogadores a continuarem explorando os desafios disponíveis.

## 3. Demonstração do portal — Endrio Ruan
**Tempo: 2:00–3:15**

Agora vamos apresentar o funcionamento do site.

[Mostrar a página inicial.]

Aqui temos a página inicial, que apresenta o projeto e permite navegar pelas diferentes áreas da aplicação.

[Mostrar as páginas principais.]

O usuário pode criar uma conta ou entrar em uma conta existente. Depois de autenticado, consegue acessar as funcionalidades relacionadas ao seu perfil.

[Mostrar o ranking e as conquistas.]

Também temos o ranking, que organiza os jogadores de acordo com suas pontuações, e o sistema de conquistas, que registra objetivos alcançados durante as partidas.

A interface foi desenvolvida com uma identidade visual própria, inspirada em jogos arcade e na estética pixel art.

## 4. Demonstração dos minijogos — Guilherme Otávio
**Tempo: 3:15–4:45**

O principal recurso da aplicação são os minijogos.

Atualmente, desenvolvemos cinco desafios:

**Lockpick:** o jogador precisa realizar uma tarefa de precisão e atenção para concluir o desafio.

[Demonstrar uma partida.]

**Não Seja Pego:** o objetivo é evitar ser identificado ou capturado durante o desafio.

[Demonstrar uma partida.]

**Vigília dos Porcos:** outro desafio que exige atenção e rapidez nas decisões.

[Demonstrar uma partida.]

**Use o Totem:** o jogador precisa escolher o lanche correto no totem.

[Demonstrar uma partida.]

**Pegue Mais um Lanche:** Peça para a tia da merenda mais um lanche.

[Demonstrar uma partida.]

Os jogos possuem partidas curtas, sistema de vidas e pontuação. A ideia é que cada minijogo apresente uma mecânica diferente, mantendo a experiência variada.

## 5. Tecnologias, estrutura e implementação — Gustavo Kell
**Tempo: 4:45–6:00**

Para desenvolver o projeto, utilizamos diferentes tecnologias.

No frontend, utilizamos JavaScript, React 19, Vite e Tailwind CSS 4. Para desenvolver os minijogos, utilizamos o Phaser 4.

No backend, utilizamos Node.js e Express 5 para criar a API responsável pela comunicação entre a aplicação e o banco de dados.

O banco de dados utilizado foi o PostgreSQL, por meio do Supabase.

Também utilizamos bibliotecas como Axios para requisições HTTP, bcryptjs para proteger as senhas e JWT para autenticação dos usuários.

A estrutura do projeto foi dividida em duas partes principais:

- **frontend:** contém as páginas, componentes, estilos e arquivos dos minijogos.
- **backend:** contém a API, as rotas, a lógica de autenticação e a integração com o banco de dados.

O funcionamento ocorre da seguinte maneira: o jogador interage com o frontend, que envia requisições para a API. O backend processa essas informações e realiza as operações necessárias no banco de dados.

A aplicação está publicada na Vercel e utiliza o Supabase para armazenamento dos dados. E esse é o link atual do Vercel:

## 6. Requisitos, desafios e soluções — João
**Tempo: 6:00–7:30**

Durante o desenvolvimento, estabelecemos requisitos funcionais e não funcionais.

Entre os requisitos funcionais, destacamos:

- Cadastro e login de usuários.
- Acesso e execução dos minijogos.
- Sistema de vidas e pontuação.
- Registro das pontuações.
- Ranking de jogadores.
- Sistema de conquistas.

Esses requisitos foram implementados por meio da integração entre o frontend, a API e o banco de dados.

Quanto aos requisitos não funcionais, buscamos desenvolver uma interface responsiva, organizar o código em módulos, proteger as credenciais e senhas dos usuários e garantir a comunicação entre as diferentes partes do sistema.

Um dos desafios foi integrar o React com o Phaser, pois são tecnologias que possuem estruturas e formas de funcionamento diferentes.

Também tivemos desafios na comunicação entre frontend e backend e na persistência dos dados dos jogadores.

Para solucionar esses problemas, organizamos melhor a estrutura do projeto, separamos as responsabilidades de cada parte e realizamos testes durante o desenvolvimento.

## 7. Encerramento — Endrio
**Tempo: 7:30–8:00**

Com isso, finalizamos a apresentação do nosso projeto, **A Regular Mosquito's Day**.

Durante o desenvolvimento, conseguimos trabalhar com tecnologias de frontend, backend, banco de dados e desenvolvimento de jogos, integrando tudo em uma única aplicação.

Agradecemos pela atenção!

---

## Orientações para a gravação

- Mantenham a duração total entre 5 e 10 minutos.
- Todos os integrantes devem aparecer e explicar sua contribuição.
- Durante as demonstrações, utilizem o site funcionando, não apenas imagens ou slides.
- Evitem ler o roteiro palavra por palavra; utilizem-no como guia.
- Verifiquem se cadastro, login, ranking, conquistas e minijogos estão funcionando antes da gravação.
- Gravem a tela com boa resolução e mantenham o áudio compreensível.
- Publiquem o vídeo no YouTube como **Não listado** e compartilhem o link com o professor.

**Título sugerido para o vídeo:**

JBIFC — A Regular Mosquito's Day | Apresentação do Projeto
