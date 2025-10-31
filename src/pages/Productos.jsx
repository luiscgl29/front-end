import { useState } from "react";
import API from "../lib/axiosLocal";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

const Productos = () => {
  const irA = useNavigate();
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [codigo, setCodigo] = useState("");
  const [error, setError] = useState("");

  const CODIGO_ACCESO = "AS2025";

  const { data, isLoading } = useQuery({
    queryFn: async () => {
      try {
        const respuesta = await API.get("/productos");
        return respuesta.data?.Producto || [];
      } catch (e) {
        console.log(e);
        return [];
      }
    },
    queryKey: ["productos"],
  });

  if (isLoading) {
    return <h1 className="loading">Cargando...</h1>;
  }

  const productoEditar = (producto) => {
    setProductoSeleccionado(producto);
    setMostrarModal(true);
    setError("");
    setCodigo("");
  };

  const verificarCodigo = (e) => {
    e.preventDefault();
    if (codigo === CODIGO_ACCESO) {
      irA(`/productos/editar/${productoSeleccionado.idProducto}`);
    } else {
      setError("Código incorrecto");
      setCodigo("");
    }
  };

  return (
    <>
      <main className="pagina-container">
        <header className="pagina-header">
          <h1>Inventario de Productos</h1>
          <div>
            <button onClick={() => irA("/productos/crear")}>
              Crear Producto
            </button>
          </div>
        </header>
        <section className="productos-grid">
          {data?.map((producto) => (
            <article key={producto.idProducto} className="producto-card">
              <h2>{producto.nombre}</h2>
              <p className="descripcion">{producto.descripcion}</p>
              <p className="precio">Q{producto.precioVenta}</p>
              <p className="cantidad">Stock: {producto.cantidadDisponible}</p>
              <button
                className="btn-editar"
                onClick={() => productoEditar(producto)}
              >
                Editar Producto
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
                Producto: <strong>{productoSeleccionado?.nombre}</strong>
              </p>
              <form className="modal-editar-form" onSubmit={verificarCodigo}>
                <label className="modal-editar-form">
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

export default Productos;
