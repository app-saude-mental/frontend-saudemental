// Data de hoje no fuso do navegador, no formato que o back espera (AAAA-MM-DD).
// Não use new Date().toISOString().slice(0, 10): ele converte para UTC e, à noite
// no Brasil, devolveria o dia seguinte.
export function hojeISO(): string {
  const agora = new Date();
  const mes = String(agora.getMonth() + 1).padStart(2, "0");
  const dia = String(agora.getDate()).padStart(2, "0");
  return `${agora.getFullYear()}-${mes}-${dia}`;
}