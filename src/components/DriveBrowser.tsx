import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ChevronRight, ExternalLink, FileText, Folder } from "lucide-react";
import { useState } from "react";
import { listarDrive, type DriveItem } from "@/lib/drive.functions";

export function DriveBrowser({ pastaId, depth = 0 }: { pastaId: string; depth?: number }) {
  const listar = useServerFn(listarDrive);
  const { data, error, isLoading } = useQuery({
    queryKey: ["drive", pastaId],
    queryFn: () => listar({ data: { pastaId } }),
  });
  const pad = depth * 16 + 8;

  if (isLoading) return <p className="px-2 py-2 text-sm text-muted-foreground" style={{ paddingLeft: pad }}>Carregando materiais do Drive…</p>;
  if (error) return <DriveFallback pastaId={pastaId} depth={depth} message="Não foi possível carregar esta pasta pela integração." />;
  if (data?.erro) return <DriveFallback pastaId={pastaId} depth={depth} message={`${data.erro}. A pasta também pode ser visualizada aqui se estiver compartilhada com sua conta Google.`} />;
  if (!data?.itens.length) return <p className="px-2 py-2 text-sm text-muted-foreground" style={{ paddingLeft: pad }}>Esta pasta ainda não tem arquivos ou subpastas.</p>;

  return (
    <div className="space-y-0.5">
      {data.itens.map((item) => <DriveRow key={item.id} item={item} depth={depth} />)}
    </div>
  );
}

function DriveFallback({ pastaId, depth, message }: { pastaId: string; depth: number; message: string }) {
  return (
    <div className="space-y-2 p-2" style={{ marginLeft: depth * 16 }}>
      <p role="alert" className="text-sm text-muted-foreground">{message}</p>
      <iframe
        title="Conteúdo da pasta no Google Drive"
        src={`https://drive.google.com/embeddedfolderview?id=${encodeURIComponent(pastaId)}#list`}
        className="h-[min(60vh,520px)] min-h-72 w-full rounded-md border bg-card"
        loading="lazy"
      />
    </div>
  );
}

function DriveRow({ item, depth }: { item: DriveItem; depth: number }) {
  const [open, setOpen] = useState(false);
  const style = { paddingLeft: depth * 16 + 8 };
  const className = "flex w-full min-w-0 items-center gap-2 rounded-md px-2 py-2 text-left text-sm hover:bg-secondary";
  const fileUrl = item.link ?? `https://drive.google.com/file/d/${item.id}/view`;

  if (!item.pasta) {
    return (
      <a href={fileUrl} target="_blank" rel="noreferrer" className={className} style={style}>
        <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
        <span className="truncate">{item.nome}</span>
        <ExternalLink className="ml-auto h-3.5 w-3.5 shrink-0 text-muted-foreground" />
      </a>
    );
  }

  return (
    <div>
      <button type="button" onClick={() => setOpen(!open)} aria-expanded={open} className={className} style={style}>
        <ChevronRight className={`h-3.5 w-3.5 shrink-0 transition ${open ? "rotate-90" : ""}`} />
        <Folder className="h-4 w-4 shrink-0 text-accent-foreground" />
        <span className="truncate">{item.nome}</span>
      </button>
      {open && <DriveBrowser pastaId={item.id} depth={depth + 1} />}
    </div>
  );
}
