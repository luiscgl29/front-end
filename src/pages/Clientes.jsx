import { useState } from "react";
import API from "../lib/axiosLocal";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

const Clientes = () => {
  const irA = useNavigate();
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [codigo, setCodigo] = useState("");
  const [error, setError] = useState("");

  const CODIGO_ACCESO = "AS2025";

  const { data, isLoading } = useQuery({
    queryFn: async () => {
      try {
        const respuesta = await API.get("/clientes");
        return respuesta.data || [];
      } catch (error) {
        console.log(error);
        return [];
      }
    },
    queryKey: ["clientes"],
  });
  if (isLoading) {
    return <h1 className="loading">Cargando...</h1>;
  }

  const clienteEditar = (cliente) => {
    setClienteSeleccionado(cliente);
    setMostrarModal(true);
    setError("");
    setCodigo("");
  };

  const verificarCodigo = (e) => {
    e.preventDefault();
    if (codigo === CODIGO_ACCESO) {
      irA(`/clientes/editar/${clienteSeleccionado.codCliente}`);
    } else {
      setError("Código incorrecto");
      setCodigo("");
    }
  };

  return (
    <>
      <main className="pagina-container">
        <header className="pagina-header">
          <h1>Listado de Clientes</h1>
          <div>
            <button
              className="btn-crear"
              onClick={() => irA("/clientes/crearCliente")}
            >
              Crear Cliente
            </button>
          </div>
        </header>

        <section className="grid">
          {data?.Cliente?.map((cliente) => (
            <article key={cliente.codCliente} className="card">
              <h2>{cliente.nombre}</h2>
              <p className="direccion">{cliente.direccion}</p>
              <p className="telefono">{cliente.telefono}</p>
              <p className="saldo">Q{cliente.saldo}</p>
              <button
                className="btn-editar"
                onClick={() => clienteEditar(cliente)}
              >
                Editar Cliente
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
                Cliente: <strong>{clienteSeleccionado?.nombre}</strong>
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

export default Clientes;
