import { useAutentificacion } from "../hookAutentificacion";
import { Outlet } from "react-router-dom";
const SoloAdmin = () => {
  const { data, isLoading } = useAutentificacion();
  if (isLoading) return null;
  if (data?.usuarioActual?.rol != "Administrador")
    return (
      <main>
        <h1>Solo los administradores pueden acceder a este modulo...</h1>
      </main>
    );
  return <Outlet />;
};

export default SoloAdmin;
