export default function EmBreve({ titulo }: { titulo: string }) {
  return (
    <section className="em-breve">
      <h1>{titulo}</h1>
      <p>Esta tela chega em breve.</p>
    </section>
  );
}