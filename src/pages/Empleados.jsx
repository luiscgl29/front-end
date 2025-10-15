import API from "../lib/axiosLocal";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
// import "../css/Empleados.css";

const Empleados = () => {
  const irA = useNavigate();
  const { data, isLoading } = useQuery({
    queryFn: async () => {
      try {
        const respuesta = await API.get("/empleados");
        return respuesta.data;
      } catch (e) {
        console.error(e);
      }
    },
    queryKey: ["empleados"],
  });

  if (isLoading) {
    return <h1>Cargando...</h1>;
  }
  return (
    <>
      <main className="main">
        <header className="header">
          <button className="btn-volver" onClick={() => irA("/home")}>
            ⬅ Volver
          </button>
          <h1>Listado de Empleados</h1>
          <button className="btn-crear" onClick={() => irA("/empleados/crear")}>
            Crear Empleado
          </button>
        </header>

        <section className="grid">
          {data?.Usuario?.map((empleado) => (
            <article key={empleado.idUsuario} className="card">
              <h2>{empleado.nombre}</h2>
              <p className="descripcion">Usuario: {empleado.user}</p>
              <p className="descripcion">Correo: {empleado.correo}</p>
              <p className="descripcion">Salario: {empleado.salario}</p>
            </article>
          ))}
        </section>
      </main>
    </>
  );
};

export default Empleados;
