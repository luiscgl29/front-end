import { useState } from "react";
import API from "../../lib/axiosLocal";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

const Lotes = () => {
  const irA = useNavigate();
  const [loteSeleccionado, setLoteSeleccionado] = useState(null);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [codigo, setCodigo] = useState("");
  const [error, setError] = useState("");

  const CODIGO_ACCESO = "AS2025";

  const { data, isLoading } = useQuery({
    queryFn: async () => {
      try {
        const respuesta = await API.get("/lotes");
        return respuesta.data?.Lotes || [];
      } catch (e) {
        console.log(e);
        return [];
      }
    },
    queryKey: ["lotes"],
  });

  if (isLoading) {
    return <h1 className="loading">Cargando...</h1>;
  }

  const loteEditar = (lote) => {
    setLoteSeleccionado(lote);
    setMostrarModal(true);
    setError("");
    setCodigo("");
  };

  const verificarCodigo = (e) => {
    e.preventDefault();
    if (codigo === CODIGO_ACCESO) {
      irA(`/lotes/editar/${loteSeleccionado.idLote}`);
    } else {
      setError("Código incorrecto");
      setCodigo("");
    }
  };

  return (
    <>
      <main className="pagina-container">
        <header className="pagina-header">
          <h1>Gestión de Lotes</h1>
          <div>
            <button onClick={() => irA("/lotes/crear")}>Crear Lote</button>
          </div>
        </header>
        <section className="productos-grid">
          {data?.map((lote) => (
            <article key={lote.idLote} className="producto-card">
              <h2>{lote.nombrePaquete}</h2>
              <p className="descripcion">
                Producto: {lote.producto?.nombre || "Sin nombre"}
              </p>
              <p className="precio">Precio Venta: Q{lote.precioVenta}</p>
              <p className="cantidad">Cantidad Total: {lote.cantidadTotal}</p>
              <p className="cantidad">Precio Compra: Q{lote.precioCompra}</p>
              <button className="btn-editar" onClick={() => loteEditar(lote)}>
                Editar Lote
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
                Lote: <strong>{loteSeleccionado?.nombrePaquete}</strong>
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

export default Lotes;
