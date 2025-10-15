import { Outlet, useNavigate, Link } from "react-router-dom";
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
            <li onClick={() => irA("/clientes")}>Clientes</li>
            <li onClick={() => irA("/ventas")}>Ventas</li>
            <li onClick={() => irA("/compras")}>Compras</li>
            <li onClick={() => irA("/reportes/ventas")}>Reporte de ventas</li>
            <li onClick={() => irA("/reportes/compras")}>Reporte de compras</li>
          </ul>
          <article>
            <h4>Usario: {data?.usuario?.user}</h4>
            <h4>Rol: {data?.usuario?.rol}</h4>
          </article>
          <button
            onClick={() => {
              cerrarSesion();
            }}
          >
            Cerrar sesion
          </button>
        </nav>
      </aside>
      <Outlet />
    </div>
  );
};

export default Menu;
