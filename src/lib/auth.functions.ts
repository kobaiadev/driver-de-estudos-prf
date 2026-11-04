import { createServerFn } from "@tanstack/react-start";

// Credenciais verificadas no servidor para não ficarem expostas no código do navegador.
export const entrar = createServerFn({ method: "POST" })
  .inputValidator((d: { usuario: string; senha: string }) => ({
    usuario: String(d?.usuario ?? "").slice(0, 100),
    senha: String(d?.senha ?? "").slice(0, 100),
  }))
  .handler(async ({ data }) => {
    const ok = data.usuario.trim().toUpperCase() === "ADM" && data.senha === "ADM@123";
    return { ok };
  });
