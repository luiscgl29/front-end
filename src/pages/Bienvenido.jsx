import { usePayload } from "../hooks/usePayload";
const Bienvenido = () => {
  const { usuario } = usePayload();
  return (
    <main>
      <h1>Bienvenido</h1>
      <p>{usuario.nombre}</p>
    </main>
  );
};

export default Bienvenido;
