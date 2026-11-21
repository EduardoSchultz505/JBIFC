import { useId, useRef, useState } from "react";
import { useNavigate } from "react-router";
import axios from "axios";
import { Eye, EyeOff } from "lucide-react";
import Container from "../components/Container";
import { useAuth } from "../auth/useAuth";

const VAZIO = { usuario: "", senha: "", confirmar: "" };
// Login aceita contas antigas; cadastro novo só aceita letras latinas (igual ao servidor)
const USUARIO_VALIDO = /^[\p{L}\p{N}_-]{3,20}$/u;
const USUARIO_NOVO = /^[\p{Script=Latin}0-9_-]{3,20}$/u;
const MODOS = [
  ["login", "Entrar"],
  ["cadastro", "Criar conta"],
];

function validar(modo, v) {
  const erros = {};
  const regra = modo === "cadastro" ? USUARIO_NOVO : USUARIO_VALIDO;
  if (!regra.test(v.usuario.trim())) {
    erros.usuario = modo === "cadastro"
      ? "Use de 3 a 20 letras latinas, números, _ ou -."
      : "Use de 3 a 20 letras, números, _ ou -.";
  }
  if (!v.senha) {
    erros.senha = "Digite a senha.";
  } else if (modo === "cadastro" && v.senha.length < 8) {
    erros.senha = "A senha precisa ter pelo menos 8 caracteres.";
  } else if (modo === "cadastro" && new TextEncoder().encode(v.senha).length > 72) {
    erros.senha = "A senha pode ter no máximo 72 bytes.";
  } else if (modo === "cadastro" && v.senha.toLowerCase() === v.usuario.trim().toLowerCase()) {
    erros.senha = "A senha não pode ser igual ao nome de usuário.";
  }
  if (modo === "cadastro" && v.confirmar !== v.senha) {
    erros.confirmar = "As senhas não são iguais.";
  }
  return erros;
}

function Campo({ label, erro, children }) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold">
        {label}
      </label>
      {children(id, erro ? `${id}-erro` : undefined)}
      {erro && (
        <p id={`${id}-erro`} className="mt-1.5 text-sm text-danger">
          {erro}
        </p>
      )}
    </div>
  );
}

const classeInput = (erro) =>
  `min-h-12 w-full rounded-lg border bg-surface px-4 text-base outline-none transition duration-150 placeholder:text-muted focus-visible:border-brand focus-visible:ring-2 focus-visible:ring-brand/25 ${
    erro ? "border-danger" : "border-line"
  }`;

export default function Login() {
  const navigate = useNavigate();
  const { entrar } = useAuth();
  const id = useId();
  const abas = useRef([]);
  const [modo, setModo] = useState("login");
  const [valores, setValores] = useState(VAZIO);
  const [erros, setErros] = useState({});
  const [erroServidor, setErroServidor] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [verSenha, setVerSenha] = useState(false);
  const cadastro = modo === "cadastro";

  function trocarModo(novo) {
    setModo(novo);
    setErros({});
    setErroServidor("");
    setValores((v) => ({ ...v, senha: "", confirmar: "" }));
  }

  function aoTeclar(e) {
    const atual = MODOS.findIndex(([valor]) => valor === modo);
    const destino = {
      ArrowRight: atual + 1,
      ArrowLeft: atual - 1,
      Home: 0,
      End: MODOS.length - 1,
    }[e.key];
    if (destino === undefined) return;

    e.preventDefault();
    const novo = (destino + MODOS.length) % MODOS.length;
    trocarModo(MODOS[novo][0]);
    abas.current[novo]?.focus();
  }

  function atualizar(campo) {
    return (e) => {
      setValores((v) => ({ ...v, [campo]: e.target.value }));
      if (erros[campo]) setErros((er) => ({ ...er, [campo]: undefined }));
    };
  }

  async function enviar(e) {
    e.preventDefault();
    if (carregando) return;
    setErroServidor("");
    const encontrados = validar(modo, valores);
    const primeiroErro = Object.keys(encontrados)[0];
    if (primeiroErro) {
      setErros(encontrados);
      e.currentTarget.elements[primeiroErro]?.focus();
      return;
    }
    setCarregando(true);
    try {
      const rota = cadastro ? "conta" : "login";
      const corpo = { usuario: valores.usuario.trim(), senha: valores.senha };

      const resposta = await axios.post(`/api/${rota}`, corpo, {
        withCredentials: true,
        timeout: 70000,
      });
      entrar(resposta.data);
      navigate("/jogar");
    } catch (err) {
      if (err.response?.data?.erro) {
        setErroServidor(err.response.data.erro);
      } else if (err.code === "ECONNABORTED" || !err.response) {
        setErroServidor(
          "Não foi possível falar com o servidor. Tente de novo em instantes.",
        );
      } else {
        setErroServidor("Algo deu errado. Tente de novo.");
      }
    } finally {
      setCarregando(false);
    }
  }

  return (
    <main className="py-10 md:py-16">
      <Container className="max-w-md">
        <h1 className="text-3xl font-bold leading-tight tracking-tighter md:text-4xl">
          {cadastro ? "Crie sua conta" : "Entre na sua conta"}
        </h1>
        <p className="mt-3 mb-8 text-base leading-normal text-muted">
          {cadastro
            ? "Com uma conta, suas pontuações entram no ranking com o seu nome."
            : "Entre para salvar suas pontuações e aparecer no ranking."}
        </p>
        <div className="rounded-xl border border-line bg-surface p-5 shadow-game md:p-8">
          <div
            role="tablist"
            aria-label="Entrar ou criar conta"
            onKeyDown={aoTeclar}
            className="mb-6 grid grid-cols-2 gap-1 rounded-lg bg-line/70 p-1"
          >
            {MODOS.map(([valor, rotulo], i) => (
              <button
                key={valor}
                ref={(el) => (abas.current[i] = el)}
                id={`${id}-aba-${valor}`}
                type="button"
                role="tab"
                aria-selected={modo === valor}
                aria-controls={`${id}-painel`}
                tabIndex={modo === valor ? 0 : -1}
                onClick={() => trocarModo(valor)}
                className={`min-h-11 cursor-pointer rounded-md text-sm font-semibold transition duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
                  modo === valor
                    ? "bg-surface text-brand shadow-sm"
                    : "hover:text-brand"
                }`}
              >
                {rotulo}
              </button>
            ))}
          </div>

          <form
            id={`${id}-painel`}
            role="tabpanel"
            aria-labelledby={`${id}-aba-${modo}`}
            onSubmit={enviar}
            noValidate
            className="flex flex-col gap-4"
          >
            <Campo label="Nome de usuário" erro={erros.usuario}>
              {(campoId, descr) => (
                <input
                  id={campoId}
                  name="usuario"
                  type="text"
                  autoComplete="username"
                  maxLength={20}
                  value={valores.usuario}
                  onChange={atualizar("usuario")}
                  aria-invalid={!!erros.usuario}
                  aria-describedby={descr}
                  className={classeInput(erros.usuario)}
                  placeholder="Como você quer aparecer no ranking"
                />
              )}
            </Campo>
            <Campo label="Senha" erro={erros.senha}>
              {(campoId, descr) => (
                <div className="relative">
                  <input
                    id={campoId}
                    name="senha"
                    type={verSenha ? "text" : "password"}
                    autoComplete={
                      cadastro ? "new-password" : "current-password"
                    }
                    value={valores.senha}
                    onChange={atualizar("senha")}
                    aria-invalid={!!erros.senha}
                    aria-describedby={descr}
                    className={`${classeInput(erros.senha)} pr-14`}
                    placeholder={
                      cadastro ? "Mínimo de 8 caracteres" : "Sua senha"
                    }
                  />
                  <button
                    type="button"
                    onClick={() => setVerSenha((v) => !v)}
                    aria-label="Mostrar senha"
                    aria-pressed={verSenha}
                    className="absolute top-1/2 right-0.5 grid size-11 -translate-y-1/2 cursor-pointer place-items-center rounded-md text-muted transition duration-150 hover:text-brand focus-visible:outline-2 focus-visible:outline-brand"
                  >
                    {verSenha ? (
                      <EyeOff aria-hidden="true" size={18} />
                    ) : (
                      <Eye aria-hidden="true" size={18} />
                    )}
                  </button>
                </div>
              )}
            </Campo>
            {cadastro && (
              <Campo label="Confirmar senha" erro={erros.confirmar}>
                {(campoId, descr) => (
                  <input
                    id={campoId}
                    name="confirmar"
                    type={verSenha ? "text" : "password"}
                    autoComplete="new-password"
                    value={valores.confirmar}
                    onChange={atualizar("confirmar")}
                    aria-invalid={!!erros.confirmar}
                    aria-describedby={descr}
                    className={classeInput(erros.confirmar)}
                    placeholder="Repita a senha"
                  />
                )}
              </Campo>
            )}
            <div
              aria-live="polite"
              className="flex flex-col gap-2 empty:hidden"
            >
              {erroServidor && (
                <p className="rounded-lg border border-danger bg-danger/10 px-4 py-2.5 text-sm text-danger">
                  {erroServidor}
                </p>
              )}
              {carregando && (
                <p className="text-sm text-muted">
                  Na primeira vez o servidor pode levar até 1 minuto para
                  acordar.
                </p>
              )}
            </div>
            <button
              type="submit"
              disabled={carregando}
              className="inline-flex min-h-12 cursor-pointer items-center justify-center rounded-lg bg-brand px-6 text-base font-semibold text-white transition duration-150 hover:-translate-y-px hover:bg-brand-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:translate-y-0 disabled:cursor-wait disabled:opacity-70"
            >
              {carregando ? "Enviando..." : cadastro ? "Criar conta" : "Entrar"}
            </button>
          </form>
        </div>
      </Container>
    </main>
  );
}