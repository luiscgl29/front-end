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
    <>
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
            <article key={cliente.codCliente} className="card">
              <h2>{cliente.nombre}</h2>
              <p className="direccion">{cliente.direccion}</p>
              <p className="telefono">{cliente.telefono}</p>
              <p className="saldo">Q{cliente.saldo}</p>
            </article>
          ))}
        </section>
      </main>
    </>
  );
};

export default Clientes;
