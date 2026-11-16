import { useAuth } from "../contexts/useAuth";

export default function Home() {
  const { usuario, sair } = useAuth();

  return (
    <main>
      <h1>Olá, {usuario?.nome}</h1>
      <p>Perfil: {usuario?.perfil} | Plano: {usuario?.plano}</p>
      <button onClick={sair}>Sair</button>
    </main>
  );
}