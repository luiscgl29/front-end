import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import API from "../../lib/axiosLocal";

const ListarCompras = () => {
  const [busqueda, setBusqueda] = useState("");

  const { data, isLoading, error } = useQuery({
    queryKey: ["compras"],
    queryFn: async () => {
      const res = await API.get("/compras");
      return res.data?.compras || [];
    },
  });

  if (isLoading) {
    return <h1 className="loading">Cargando compras...</h1>;
  }

  if (error) {
    return (
      <div className="error-container">
        <h2>Error al cargar las compras</h2>
        <p>{error.message}</p>
      </div>
    );
  }

  const comprasFiltradas = data.filter((compra) => {
    const empleado = `${compra.usuario?.nombre || ""} ${
      compra.usuario?.apellido || ""
    }`.toLowerCase();
    const proveedor = compra.proveedor?.nombreEmpresa?.toLowerCase() || "";
    const idCompra = compra.idCompra.toString();
    const fechaEspecifica = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    const fecha = new Date(compra.fecha).toLocaleDateString(
      "es",
      fechaEspecifica
    );
    const termino = busqueda.toLowerCase();

    return (
      empleado.includes(termino) ||
      proveedor.includes(termino) ||
      idCompra.includes(termino) ||
      fecha.includes(termino)
    );
  });

  return (
    <main className="pagina-container">
      <header className="pagina-header">
        <h1>Historial de Compras</h1>
        <input
          type="text"
          placeholder="Buscar por empleado, proveedor, ID o fecha..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="search-input"
        />
      </header>

      <section className="productos-grid">
        {comprasFiltradas.length === 0 ? (
          <div className="no-results">
            <p>No se encontraron compras</p>
          </div>
        ) : (
          comprasFiltradas.map((compra) => (
            <article key={compra.idCompra} className="producto-card">
              <div className="card-header-venta">
                <h2>Compra #{compra.idCompra}</h2>
                <span className="date-badge-venta">
                  {new Date(compra.fecha).toLocaleDateString("es", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>

              <div className="venta-info-section">
                <div className="descripcion">
                  <strong>Empleado:</strong> {compra.usuario?.nombre || "N/A"}{" "}
                  {compra.usuario?.apellido || ""}
                </div>

                <div className="descripcion">
                  <strong>Proveedor:</strong>{" "}
                  {compra.proveedor?.nombreEmpresa || "N/A"}
                </div>

                {compra.proveedor?.telefono && (
                  <div className="descripcion">
                    <strong>Teléfono:</strong> {compra.proveedor.telefono}
                  </div>
                )}
              </div>

              <div className="venta-productos-titulo">
                <strong>Detalles de Compra</strong>
              </div>

              <div className="details-list-venta">
                {compra.compradetalle?.map((detalle, index) => (
                  <div key={detalle.idCompraDetalle}>
                    <div className="detail-item-venta">
                      <div className="detail-producto-nombre">
                        {detalle.lote?.producto?.nombre ||
                          `Lote #${detalle.idLote}`}
                      </div>
                      <div className="detail-cantidad-precio">
                        <span>Cantidad: {detalle.cantidadComprada}</span>
                        <span>
                          Precio: Q {Number(detalle.precioCompra).toFixed(2)}
                        </span>
                      </div>
                      <div className="detail-subtotal">
                        Subtotal: Q{" "}
                        {(
                          Number(detalle.precioCompra) *
                          detalle.cantidadComprada
                        ).toFixed(2)}
                      </div>
                    </div>
                    {index < compra.compradetalle.length - 1 && (
                      <div className="divider-producto"></div>
                    )}
                  </div>
                ))}
              </div>

              <div className="venta-totales">
                <div className="venta-total">
                  <span>Total:</span>
                  <span>Q {Number(compra.totalCompra).toFixed(2)}</span>
                </div>
              </div>
            </article>
          ))
        )}
      </section>
    </main>
  );
};

export default ListarCompras;
