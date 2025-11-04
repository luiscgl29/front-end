import { useState } from "react";
import API from "../lib/axiosLocal";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

const Proveedores = () => {
  const irA = useNavigate();
  const [proveedorSeleccionado, setProveedorSeleccionado] = useState(null);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [codigo, setCodigo] = useState("");
  const [error, setError] = useState("");

  const CODIGO_ACCESO = "AS2025";

  const { data, isLoading } = useQuery({
    queryFn: async () => {
      try {
        const respuesta = await API.get("/proveedores");
        return respuesta.data || [];
      } catch (error) {
        console.log(error);
        return [];
      }
    },
    queryKey: ["proveedores"],
  });
  if (isLoading) {
    return <h1 className="loading">Cargando...</h1>;
  }

  const proveedorEditar = (proveedor) => {
    setProveedorSeleccionado(proveedor);
    setMostrarModal(true);
    setError("");
    setCodigo("");
  };

  const verificarCodigo = (e) => {
    e.preventDefault();
    if (codigo === CODIGO_ACCESO) {
      irA(`/proveedores/editar/${proveedorSeleccionado.codProveedor}`);
    }
  };

  return (
    <>
      <main className="pagina-container">
        <header className="pagina-header">
          <h1>Listado de Proveedores</h1>
          <button
            className="btn-crear"
            onClick={() => irA("/proveedores/crear")}
          >
            Crear Proveedor
          </button>
        </header>
        <section className="grid">
          {data?.Proveedor?.map((proveedor) => (
            <article key={proveedor.codProveedor} className="card">
              <h2>{proveedor.nombreEmpresa}</h2>
              <p className="telefono">{proveedor.telefono}</p>
              <p className="direccion">{proveedor.direccion}</p>
              <button
                className="btn-editar"
                onClick={() => proveedorEditar(proveedor)}
              >
                Editar Proveedor
              </button>
            </article>
          ))}
        </section>

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
                Proveedor:{" "}
                <strong>{proveedorSeleccionado?.nombreEmpresa}</strong>
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
                  autoFocus
                />
                {error && <p className="modal-editar-error">{error}</p>}
                <div className="modal-editar-botones">
                  <button
                    className="modal-editar-btn modal-editar-bton-verificar"
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

export default Proveedores;
