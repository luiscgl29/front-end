import API from "../lib/axiosLocal";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
// import "../css/Clientes.css";

const Clientes = () => {
  const irA = useNavigate();
  const { data, isLoading } = useQuery({
    queryFn: async () => {
      try {
        const respuesta = await API.get("/clientes");
        return respuesta.data;
      } catch (error) {
        console.log(error);
      }
    },
    queryKey: ["clientes"],
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
          <h1>Listado de Clientes</h1>
          <button className="btn-crear" onClick={() => irA("/crearCliente")}>
            Crear Cliente
          </button>
        </header>

        <section className="grid">
          {data?.Cliente?.map((cliente) => (
            <article key={cliente.id} className="card">
              <h2>{cliente.nombre}</h2>
              <p className="direccion">{cliente.direccion}</p>
              <p className="telefono">{cliente.telefono}</p>
              <p className="saldo">Q{cliente.saldo}</p>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
};

export default Clientes;
