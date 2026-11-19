// Monta o link do WhatsApp com uma mensagem pronta a partir do contato configurado no back
// (ex.: "https://wa.me/5511999999999" ou só o número). Null se não der para montar.
export function linkWhatsApp(contato: string | null | undefined, mensagem: string): string | null {
  if (!contato) return null;
  const texto = encodeURIComponent(mensagem);
  if (/^https:\/\/wa\.me\//i.test(contato)) {
    return `${contato.split("?")[0]}?text=${texto}`;
  }
  const numero = contato.replace(/\D/g, "");
  return numero.length >= 10 ? `https://wa.me/${numero}?text=${texto}` : null;
}
