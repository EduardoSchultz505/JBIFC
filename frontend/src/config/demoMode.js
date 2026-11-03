const getEnvDemoMode = () => {
  const valor = import.meta.env.VITE_DEMO_MODE;
  if (typeof valor === "string") {
    return valor.toLowerCase() === "true";
  }
  return false;
};

export function isDemoModeAtivo() {
  if (typeof window === "undefined") {
    return getEnvDemoMode();
  }

  const persistido = window.localStorage.getItem("jbifc_demo_mode");
  if (persistido === "true" || persistido === "false") {
    return persistido === "true";
  }

  return getEnvDemoMode();
}

export function setDemoModeAtivo(ativo) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem("jbifc_demo_mode", String(Boolean(ativo)));
}
