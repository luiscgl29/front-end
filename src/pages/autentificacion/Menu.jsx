import { Outlet, useNavigate } from "react-router-dom";
import { useAutentificacion } from "./hookAutentificacion";
import NoEstaLogeado from "./permisos/NoEstaLogeado";
import API from "../../lib/axiosLocal";

export const Menu = () => {
  const { isError, data } = useAutentificacion();
  const irA = useNavigate();

  const cerrarSesion = async () => {
    await API.get("/login");
    irA("/login");
  };

  if (isError) return <NoEstaLogeado />;

  return (
    <div className="layout">
      <aside className="sidebar">
        <h2 className="logo">Constru-Tech</h2>
        <nav>
          <ul>
            <li onClick={() => irA("/")}>Empleados</li>
            <li onClick={() => irA("/productos")}>Productos</li>
            <li onClick={() => irA("/lotes")}>Lotes</li>
            <li onClick={() => irA("/clientes")}>Clientes</li>
            <li onClick={() => irA("/proveedores")}>Proveedores</li>
            <li onClick={() => irA("/ventas")}>Ventas</li>
            <li onClick={() => irA("/compras")}>Compras</li>
            <li onClick={() => irA("/reportes/ventas")}>Reporte de ventas</li>
            <li onClick={() => irA("/reportes/compras")}>Reporte de compras</li>
          </ul>

          <div className="user-profile">
            <div className="user-profile-name">
              {data?.usuario?.user || "Usuario"}
            </div>
            <div className="user-profile-role">
              {data?.usuario?.rol || "Sin rol"}
            </div>
          </div>

          <button onClick={() => cerrarSesion()}>Cerrar sesión</button>
        </nav>
      </aside>
      <Outlet />
    </div>
  );
};

export default Menu;
