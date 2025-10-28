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
          <div className="modal-overlay" onClick={() => setMostrarModal(false)}>
            <div
              className="caja-productos modal-contenido"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="titulo-formulario">Verificación de Acceso</h2>
              <p className="modal-producto-nombre">
                Lote: <strong>{loteSeleccionado?.nombrePaquete}</strong>
              </p>
              <form onSubmit={verificarCodigo}>
                <label className="label-producto">
                  Ingrese el código de acceso:
                </label>
                <input
                  className="input-producto"
                  type="password"
                  value={codigo}
                  onChange={(e) => setCodigo(e.target.value)}
                  placeholder="Código de acceso"
                  autoFocus
                />
                {error && <p className="modal-error">{error}</p>}
                <button className="boton-producto" type="submit">
                  Verificar
                </button>
                <button
                  className="boton-producto btn-cancelar"
                  type="button"
                  onClick={() => setMostrarModal(false)}
                >
                  Cancelar
                </button>
              </form>
            </div>
          </div>
        )}
      </main>
    </>
  );
};

export default Lotes;
