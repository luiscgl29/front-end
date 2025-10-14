import { useNavigate } from "react-router-dom";
import "../css/Home.css";
// import { cerrarSesion } from "../../../backend/src/controllers/jwtControlador";

const Home = () => {
  const irA = useNavigate();

  const opciones = [
    {
      titulo: "Empleados",
      descripcion: "Registrar, eliminar o actualizar empleados",
      icono: "🏭",
      ruta: "/empleados",
    },
    {
      titulo: "Productos",
      descripcion: "Registrar, eliminar o actualizar productos",
      icono: "📦",
      ruta: "/productos",
    },
    {
      titulo: "Clientes",
      descripcion: "Registrar, eliminar o actualizar clientes",
      icono: "👥",
      ruta: "/clientes",
    },
    {
      titulo: "Ventas",
      descripcion: "Hacer una venta al contado o un apartado",
      icono: "🛒",
      ruta: "/ventas",
    },
    {
      titulo: "Reportes",
      descripcion: "Ver reportes de ventas y movimientos",
      icono: "📊",
      ruta: "/reportes",
    },
  ];

  return (
    <main className="menu-container">
      <h1 className="titulo">Bienvenido. Elija una opción</h1>
      <section className="grid">
        {opciones.map((op, index) => (
          <article key={index} className="card" onClick={() => irA(op.ruta)}>
            <div className="icono">{op.icono}</div>
            <h2>{op.titulo}</h2>
            <p>{op.descripcion}</p>
          </article>
        ))}
        {/* <button onClick={cerrarSesion()}>Cerrar Sesión</button> */}
      </section>
    </main>
  );
};

export default Home;
