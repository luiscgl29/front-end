import { useState } from "react";
import API from "../lib/axiosLocal";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

const Empleados = () => {
  const irA = useNavigate();
  const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState(null);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [codigo, setCodigo] = useState("");
  const [error, setError] = useState("");

  const CODIGO_ACCESO = "AS2025";

  const { data, isLoading } = useQuery({
    queryFn: async () => {
      try {
        const respuesta = await API.get("/empleados");
        return respuesta.data?.Usuario || [];
      } catch (e) {
        console.log(e);
        return [];
      }
    },
    queryKey: ["empleados"],
  });

  if (isLoading) {
    return <h1 className="loading">Cargando...</h1>;
  }

  const empleadoEditar = (empleado) => {
    setEmpleadoSeleccionado(empleado);
    setMostrarModal(true);
    setError("");
    setCodigo("");
  };

  const verificarCodigo = (e) => {
    e.preventDefault();
    if (codigo === CODIGO_ACCESO) {
      irA(`/empleados/editar/${empleadoSeleccionado.idUsuario}`);
    } else {
      setError("Código incorrecto");
      setCodigo("");
    }
  };

  return (
    <>
      <main className="pagina-container">
        <header className="pagina-header">
          <h1>Gestión de Empleados</h1>
          <div>
            <button onClick={() => irA("/empleados/crear")}>
              Crear Empleado
            </button>
          </div>
        </header>
        <section className="productos-grid">
          {data?.map((empleado) => (
            <article key={empleado.idUsuario} className="producto-card">
              <h2>{empleado.nombre}</h2>
              <p className="descripcion">Usuario: {empleado.user}</p>
              <p className="precio">Salario: Q{empleado.salario || "0.00"}</p>
              <p className="cantidad">Correo: {empleado.correo}</p>
              <button
                className="btn-editar"
                onClick={() => empleadoEditar(empleado)}
              >
                Editar Empleado
              </button>
            </article>
          ))}
        </section>

        {/* Modal para código de acceso */}
        {mostrarModal && (
          <div
            className="modal-editar-overlay"
            onClick={() => setMostrarModal(false)}
          >
            <div
              className="modal-editar-contenido"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="modal-editar-titulo">Verificación de Acceso</h2>
              <p className="modal-editar-nombre">
                Empleado: <strong>{empleadoSeleccionado?.nombre}</strong>
              </p>
              <form className="modal-editar-form" onSubmit={verificarCodigo}>
                <label className="modal-editar-label">
                  Ingrese el código de acceso:
                </label>
                <input
                  className="modal-editar-input"
                  type="password"
                  value={codigo}
                  onChange={(e) => setCodigo(e.target.value)}
                  placeholder="Código de acceso"
                  autoFocus
                />
                {error && <p className="modal-editar-error">{error}</p>}
                <div className="modal-editar-botones">
                  <button
                    className="modal-editar-btn modal-editar-btn-verificar"
                    type="submit"
                  >
                    Verificar
                  </button>
                  <button
                    className="modal-editar-btn modal-editar-btn-cancelar"
                    type="button"
                    onClick={() => setMostrarModal(false)}
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </>
  );
};

export default Empleados;
