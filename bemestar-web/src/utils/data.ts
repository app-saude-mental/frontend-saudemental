// Data de hoje no fuso do navegador, no formato que o back espera (AAAA-MM-DD).
// Não use new Date().toISOString().slice(0, 10): ele converte para UTC e, à noite
// no Brasil, devolveria o dia seguinte.
export function hojeISO(): string {
  return dataISO(new Date());
}

export function dataISO(data: Date): string {
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  const dia = String(data.getDate()).padStart(2, "0");
  return `${data.getFullYear()}-${mes}-${dia}`;
}

// As datas da API vêm sem fuso, já no horário de Brasília ("2026-12-18T09:30:00").
// Formata direto do texto, sem passar por new Date(), para não haver conversão de fuso.
export function formatarData(iso: string | null | undefined): string {
  if (!iso) return "";
  const [data] = iso.split("T");
  const [ano, mes, dia] = data.split("-");
  return `${dia}/${mes}/${ano}`;
}

export function formatarDataHora(iso: string | null | undefined): string {
  if (!iso) return "";
  const [, hora = ""] = iso.split("T");
  return `${formatarData(iso)} ${hora.slice(0, 5)}`.trim();
}
