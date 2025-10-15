import { useAutentificacion } from "../hookAutentificacion";
import { Outlet } from "react-router-dom";

const AccesosBodeguero = () => {
  const { data, isLoading } = useAutentificacion();
  if (isLoading) return null;
  if (
    data?.usuario?.rol != "Administrador" &&
    data?.usuario?.rol != "Bodeguero"
  )
    return (
      <main>
        <h1>Solo los bodegueros pueden acceder a este modulo...</h1>
      </main>
    );
  return <Outlet />;
};

export default AccesosBodeguero;
