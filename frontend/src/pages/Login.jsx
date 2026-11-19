import { useId, useState } from "react";
import { useNavigate } from "react-router";
import axios from "axios";
import { Eye, EyeOff } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL?.replace(/\/$/, "");
const API_URL_LOCAL = import.meta.env.DEV ? "http://localhost:5000" : API_URL;

const VAZIO = { usuario: "", senha: "", confirmar: "" };
const USUARIO_VALIDO = /^[\p{L}\p{N}_-]{3,20}$/u;

function validar(modo, v) {
  const erros = {};
  const usuario = v.usuario.trim();
  if (!USUARIO_VALIDO.test(usuario)) erros.usuario = "Use letras, números, _ ou - (3 a 20).";
  if (usuario.length < 3 || usuario.length > 20) {
    erros.usuario = "Use de 3 a 20 caracteres.";
  }
  if (modo === "cadastro" && v.senha.length < 8) {
    erros.senha = "A senha precisa ter pelo menos 8 caracteres.";
  } else if (!v.senha) {
    erros.senha = "Digite a senha.";
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
        <p id={`${id}-erro`} className="mt-1.5 text-[13px] text-[#CD191E]">
          {erro}
        </p>
      )}
    </div>
  );
}

const classeInput = (erro) =>
  `min-h-12 w-full rounded-lg border bg-surface px-3.5 text-[15px] outline-none transition duration-150 placeholder:text-muted focus-visible:border-brand focus-visible:ring-2 focus-visible:ring-brand/25 ${
    erro ? "border-[#CD191E]" : "border-line"
  }`;

export default function Login() {
  const navigate = useNavigate();
  const [modo, setModo] = useState("login");
  const [valores, setValores] = useState(VAZIO);
  const [erros, setErros] = useState({});
  const [erroServidor, setErroServidor] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [verSenha, setVerSenha] = useState(false);

  const cadastro = modo === "cadastro";

  // Ao trocar de aba, limpa erros e senhas
  function trocarModo(novo) {
    setModo(novo);
    setErros({});
    setErroServidor("");
    setValores((v) => ({ ...v, senha: "", confirmar: "" }));
  }

  function atualizar(campo) {
    return (e) => {
      setValores((v) => ({ ...v, [campo]: e.target.value }));
      if (erros[campo]) setErros((er) => ({ ...er, [campo]: undefined }));
    };
  }

  async function enviar(e) {
    e.preventDefault();
    setErroServidor("");

    const encontrados = validar(modo, valores);
    if (Object.keys(encontrados).length > 0) {
      setErros(encontrados);
      return;
    }
    if (!API_URL_LOCAL) {
      setErroServidor("A URL da API não está configurada.");
      return;
    }

    setCarregando(true);
    try {
      // Rotas do backend: POST /api/conta e POST /api/login
      const rota = cadastro ? "conta" : "login";
      const corpo = { usuario: valores.usuario.trim(), senha: valores.senha };

      // Timeout longo porque o servidor gratuito pode estar dormindo
      const resposta = await axios.post(`${API_URL_LOCAL}/api/${rota}`, corpo, {
        timeout: 70000,
      });

      localStorage.setItem("jbifc_token", resposta.data.token);
      navigate("/jogar");
    } catch (err) {
      if (err.response?.data?.erro) {
        setErroServidor(err.response.data.erro);
      } else if (err.code === "ECONNABORTED" || !err.response) {
        setErroServidor("Não foi possível falar com o servidor. Tente de novo em instantes.");
      } else {
        setErroServidor("Algo deu errado. Tente de novo.");
      }
    } finally {
      setCarregando(false);
    }
  }

  return (
    <main className="py-10 md:py-16">
      <div className="mx-auto w-[calc(100%-32px)] max-w-105">
        <h1 className="text-[32px] leading-[1.1] font-bold tracking-tighter md:text-4xl">
          {cadastro ? "Crie sua conta" : "Entre na sua conta"}
        </h1>
        <p className="mt-3 mb-7 text-base leading-normal text-muted">
          {cadastro
            ? "Com uma conta, suas pontuações entram no ranking com o seu nome."
            : "Entre para salvar suas pontuações e aparecer no ranking."}
        </p>

        <div className="rounded-xl border border-line bg-surface p-5 shadow-game md:p-7">
          <div
            role="tablist"
            aria-label="Entrar ou criar conta"
            className="mb-6 grid grid-cols-2 gap-1 rounded-lg bg-subtle p-1"
          >
            {[
              ["login", "Entrar"],
              ["cadastro", "Criar conta"],
            ].map(([valor, rotulo]) => (
              <button
                key={valor}
                type="button"
                role="tab"
                aria-selected={modo === valor}
                onClick={() => trocarModo(valor)}
                className={`min-h-10 rounded-md text-sm font-semibold transition duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
                  modo === valor
                    ? "bg-surface text-brand shadow-sm"
                    : "text-muted hover:text-foreground"
                }`}
              >
                {rotulo}
              </button>
            ))}
          </div>

          <form onSubmit={enviar} noValidate className="flex flex-col gap-4.5">
            <Campo label="Nome de usuário" erro={erros.usuario}>
              {(id, descr) => (
                <input
                  id={id}
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
              {(id, descr) => (
                <div className="relative">
                  <input
                    id={id}
                    type={verSenha ? "text" : "password"}
                    autoComplete={cadastro ? "new-password" : "current-password"}
                    value={valores.senha}
                    onChange={atualizar("senha")}
                    aria-invalid={!!erros.senha}
                    aria-describedby={descr}
                    className={`${classeInput(erros.senha)} pr-12`}
                    placeholder={cadastro ? "Mínimo de 8 caracteres" : "Sua senha"}
                  />
                  <button
                    type="button"
                    onClick={() => setVerSenha((v) => !v)}
                    aria-label={verSenha ? "Ocultar senha" : "Mostrar senha"}
                    aria-pressed={verSenha}
                    className="absolute top-1/2 right-1 grid size-10 -translate-y-1/2 place-items-center rounded-md text-muted transition duration-150 hover:text-brand focus-visible:outline-2 focus-visible:outline-brand"
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
                {(id, descr) => (
                  <input
                    id={id}
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

            <div aria-live="polite">
              {erroServidor && (
                <p className="rounded-lg border border-[#CD191E] bg-[#CD191E]/8 px-3.5 py-2.5 text-sm text-[#CD191E]">
                  {erroServidor}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={carregando}
              className="inline-flex min-h-12 items-center justify-center rounded-lg bg-brand px-5.5 text-[15px] font-semibold text-white transition duration-150 hover:-translate-y-px hover:bg-brand-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:translate-y-0 disabled:cursor-wait disabled:opacity-70"
            >
              {carregando ? "Enviando..." : cadastro ? "Criar conta" : "Entrar"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}