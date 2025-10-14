import API from "../lib/axiosLocal";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
// import "../css/Proveedores.css";

const Proveedores = () => {
  const irA = useNavigate();
  const { data, isLoading } = useQuery({
    queryFn: async () => {
      try {
        const respuesta = await API.get("/proveedores");
        return respuesta.data;
      } catch (error) {
        console.log(error);
      }
    },
    queryKey: ["proveedores"],
  });
  if (isLoading) {
    return <h1 className="loading">Cargando...</h1>;
  }

  return (
    <div className="layot">
      <aside className="sidebar">
        <h2 className="logo">Constru-Tech</h2>
        <nav>
          <ul>
            <li onClick={() => irA("/empleados")}>Empleados</li>
            <li onClick={() => irA("/productos")}>Productos</li>
            <li onClick={() => irA("/clientes")}>Clientes</li>
            <li onClick={() => irA("/ventas")}>Ventas</li>
            <li onClick={() => irA("/compras")}>Compras</li>
            <li onClick={() => irA("/reportes")}>Reportes</li>
          </ul>
        </nav>
      </aside>

      <main className="main">
        <header className="header">
          <button className="btn-volver" onClick={() => irA("/home")}>
            - volver
          </button>
          <h1>Listado de Proveedores</h1>
          <button className="btn-crear" onClick={() => irA("/crearProveedor")}>
            Crear Proveedor
          </button>
        </header>

        <section className="grid">
          {data?.Proveedor?.map((proveedor) => (
            <article key={proveedor.codProveedor} className="card">
              <h2>{proveedor.nombreEmpresa}</h2>
              <p className="telefono">{proveedor.telefono}</p>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
};

export default Proveedores;
