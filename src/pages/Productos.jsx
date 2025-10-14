import API from "../lib/axiosLocal";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import "../css/Productos.css";

const Productos = () => {
  const irA = useNavigate();
  const { data, isLoading } = useQuery({
    queryFn: async () => {
      try {
        const respuesta = await API.get("/productos");
        return respuesta.data;
      } catch (e) {
        console.log(e);
      }
    },
    queryKey: ["productos"],
  });

  if (isLoading) {
    return <h1 className="loading">Cargando...</h1>;
  }

  return (
    <div className="layout">
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
            ⬅ Volver
          </button>
          <h1>Inventario de Productos</h1>
          <button className="btn-crear" onClick={() => irA("/crearProducto")}>
            Crear Producto
          </button>
        </header>

        <section className="grid">
          {data?.Producto?.map((producto) => (
            <article key={producto.id} className="card">
              <h2>{producto.nombre}</h2>
              <p className="descripcion">{producto.descripcion}</p>
              <p className="precio">Q{producto.precioVenta}</p>
              <p className="cantidad">{producto.cantidadDisponible}</p>
              {/* <span
                className={`estado ${
                  producto.estado === "Activo" ? "activo" : "inactivo"
                }`}
              >
                {producto.estado}
              </span> */}
            </article>
          ))}
        </section>
      </main>
    </div>
  );
};

export default Productos;
