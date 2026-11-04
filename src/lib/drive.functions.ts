import { createServerFn } from "@tanstack/react-start";

export type DriveItem = { id: string; nome: string; pasta: boolean; mimeType: string; link?: string; tamanho?: string };

export const listarDrive = createServerFn({ method: "GET" })
  .inputValidator((d: { pastaId?: string }) => ({ pastaId: /^[\w-]{1,200}$/.test(d?.pastaId ?? "") ? d.pastaId! : "root" }))
  .handler(async ({ data }): Promise<{ itens: DriveItem[]; erro?: string }> => {
    const lk = process.env.LOVABLE_API_KEY;
    const dk = process.env.GOOGLE_DRIVE_API_KEY;
    if (!lk || !dk) return { itens: [], erro: "Google Drive não configurado" };
    const q = `'${data.pastaId}' in parents and trashed=false`;
    const url = new URL("https://connector-gateway.lovable.dev/google_drive/drive/v3/files");
    url.searchParams.set("q", q);
    url.searchParams.set("pageSize", "200");
    url.searchParams.set("orderBy", "folder,name");
    url.searchParams.set("fields", "files(id,name,mimeType,webViewLink,size)");
    const res = await fetch(url, { headers: { Authorization: `Bearer ${lk}`, "X-Connection-Api-Key": dk } });
    if (!res.ok) {
      const body = await res.text();
      console.error(`Drive falhou [${res.status}]: ${body}`);
      return { itens: [], erro: `Erro do Google Drive (${res.status})` };
    }
    const json = (await res.json()) as { files: { id: string; name: string; mimeType: string; webViewLink?: string; size?: string }[] };
    return {
      itens: json.files.map((f) => ({
        id: f.id, nome: f.name, mimeType: f.mimeType, link: f.webViewLink, tamanho: f.size,
        pasta: f.mimeType === "application/vnd.google-apps.folder",
      })),
    };
  });
