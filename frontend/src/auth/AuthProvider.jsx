
import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { AuthContext } from "./contexto";

const DESLOGADO = {
  carregando: false,
  usuario: null,
  id: null,
  erro: false,
};

async function consultarSessao() {
  try {
    const { data } = await axios.get("/api/usuario", {
      timeout: 20000,
      withCredentials: true,
    });

    return {
      carregando: false,
      usuario: data.usuario,
      id: data.id,
      erro: false,
    };
  } catch (erro) {
    if (erro.response?.status === 401) return DESLOGADO;

    return (atual) => ({
      ...atual,
      carregando: false,
      erro: true,
    });
  }
}

export default function AuthProvider({ children }) {
  const [sessao, setSessao] = useState({
    ...DESLOGADO,
    carregando: true,
  });

  useEffect(() => {
    const verificar = () => consultarSessao().then(setSessao);

    verificar();

    window.addEventListener("focus", verificar);

    return () => window.removeEventListener("focus", verificar);
  }, []);

  const entrar = useCallback((dados) => {
    setSessao({
      carregando: false,
      usuario: dados.usuario,
      id: dados.id,
      erro: false,
    });
  }, []);

  const expirar = useCallback(() => setSessao(DESLOGADO), []);

  const sair = useCallback(async () => {
    try {
      await axios.post("/api/logout", null, {
        timeout: 15000,
        withCredentials: true,
      });
    } catch {
      // Mesmo sem resposta, encerra a sessão na interface.
    } finally {
      setSessao(DESLOGADO);
    }
  }, []);

  const valor = useMemo(
    () => ({ ...sessao, entrar, sair, expirar }),
    [sessao, entrar, sair, expirar],
  );

  return (
    <AuthContext.Provider value={valor}>
      {children}
    </AuthContext.Provider>
  );
}
