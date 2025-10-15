import { useAutentificacion } from "../hookAutentificacion";
import { Outlet } from "react-router-dom";

const AccesosVendedor = () => {
  const { data, isLoading } = useAutentificacion();
  if (isLoading) return null;
  if (data?.usuario?.rol != "Administrador" && data?.usuario?.rol != "Vendedor")
    return (
      <main>
        <h1>Solo los vendedores pueden acceder a este modulo...</h1>
      </main>
    );
  return <Outlet />;
};

export default AccesosVendedor;
