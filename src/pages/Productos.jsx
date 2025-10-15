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
        return respuesta.data?.Producto || [];
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
    <>
      <main className="main">
        <header className="header">
          <button className="btn-volver" onClick={() => irA("/home")}>
            ⬅ Volver
          </button>
          <h1>Inventario de Productos</h1>
          <button className="btn-crear" onClick={() => irA("/productos/crear")}>
            Crear Producto
          </button>
        </header>

        <section className="grid">
          {data?.map((producto) => (
            <article key={producto.idProducto} className="card">
              <h2>{producto.nombre}</h2>
              <p className="descripcion">{producto.descripcion}</p>
              <p className="precio">Q{producto.precioVenta}</p>
              <p className="cantidad">{producto.cantidadDisponible}</p>
            </article>
          ))}
        </section>
      </main>
    </>
  );
};

export default Productos;
