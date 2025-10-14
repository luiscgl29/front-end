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
        console.log(respuesta);
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
          <h1>Listado de Empleados</h1>
          <button className="btn-crear" onClick={() => irA("/crearEmpleado")}>
            Crear Empleado
          </button>
        </header>

        <section className="grid">
          {data?.Usuario?.map((empleado) => (
            <article key={empleado.id} className="card">
              <h2>{empleado.nombre}</h2>
              <p className="descripcion">Usuario: {empleado.user}</p>
              <p className="descripcion">Correo: {empleado.correo}</p>
              <p className="descripcion">Salario: {empleado.salario}</p>
            </article>
          ))}
        </section>
      </main>
    </div>
  );

  // return (
  //   <div className="layout">
  //     <aside className="sidebar">
  //       <h2 className="logo">Constru-Tech</h2>
  //       <nav>
  //         <ul>
  //           <li onClick={() => irA("/empleados")}>Empleados</li>
  //           <li onClick={() => irA("/productos")}>Productos</li>
  //           <li onClick={() => irA("/clientes")}>Clientes</li>
  //           <li onClick={() => irA("/ventas")}>Ventas</li>
  //           <li onClick={() => irA("/reportes")}>Reportes</li>
  //         </ul>
  //       </nav>
  //     </aside>

  //     <section className="grid">
  //       <h1>Empleados</h1>
  //       <p>
  //         {data?.Usuario?.map((empleado) => (
  //           <article>
  //             <h2>{empleado.user}</h2>
  //             <p>{empleado.contrasenia}</p>
  //           </article>
  //         ))}
  //       </p>
  //       <button onClick={() => irA("/crearEmpleado")}>Crear Empleado</button>
  //     </section>
  //   </div>
  // );
};

export default Empleados;
