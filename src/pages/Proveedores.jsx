import API from "../lib/axiosLocal";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

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
    <>
      <main className="pagina-container">
        <header className="pagina-header">
          <h1>Listado de Proveedores</h1>
          <button
            className="btn-crear"
            onClick={() => irA("/proveedores/crearProveedor")}
          >
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
    </>
  );
};

export default Proveedores;
