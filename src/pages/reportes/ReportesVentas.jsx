import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import API from "../../lib/axiosLocal";
import { useNavigate } from "react-router-dom";

const ListarVentas = () => {
  const irA = useNavigate();
  const [busqueda, setBusqueda] = useState("");

  const { data, isLoading, error } = useQuery({
    queryKey: ["ventas"],
    queryFn: async () => {
      const res = await API.get("/ventas");
      return res.data?.ventas || [];
    },
  });

  if (isLoading) {
    return <h1 className="loading">Cargando ventas...</h1>;
  }

  if (error) {
    return (
      <div className="error-container">
        <h2>Error al cargar las ventas</h2>
        <p>{error.message}</p>
      </div>
    );
  }

  const ventasFiltradas = data.filter((venta) => {
    const empleado = `${venta.usuario?.nombre || ""} ${
      venta.usuario?.apellido || ""
    }`.toLowerCase();
    const cliente = venta.cliente?.nombre?.toLowerCase() || "cf";
    const idVenta = venta.idVenta.toString();
    const fechaEspecifica = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    const fecha = new Date(venta.fecha).toLocaleDateString(
      "es",
      fechaEspecifica
    );
    const termino = busqueda.toLowerCase();

    return (
      empleado.includes(termino) ||
      cliente.includes(termino) ||
      idVenta.includes(termino) ||
      fecha.includes(termino)
    );
  });

  // Calcular el IVA total de una venta
  const calcularIVATotal = (detalles) => {
    return (
      detalles?.reduce((total, detalle) => {
        return total + (Number(detalle.ivaProducto) || 0);
      }, 0) || 0
    );
  };

  return (
    <main className="pagina-container">
      <header className="pagina-header">
        <h1>Historial de Ventas</h1>
        <div>
          <button
            className="btn-reportes-graficos"
            onClick={() => irA("/graficosMinoristas")}
          >
            Graficos Minoristas
          </button>
          <button onClick={() => irA("/graficosMayoristas")}>
            Graficos Mayoristas
          </button>
        </div>
        <input
          type="text"
          placeholder="Buscar por empleado, cliente, ID o fecha..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="search-input"
        />
      </header>

      <section className="productos-grid">
        {ventasFiltradas.length === 0 ? (
          <div className="no-results">
            <p>No se encontraron ventas</p>
          </div>
        ) : (
          ventasFiltradas.map((venta) => (
            <article key={venta.idVenta} className="producto-card">
              <div className="card-header-venta">
                <h2>Venta #{venta.idVenta}</h2>
                <span className="date-badge-venta">
                  {new Date(venta.fecha).toLocaleDateString("es", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>

              <div className="venta-info-section">
                <div className="descripcion">
                  <strong>Empleado:</strong> {venta.usuario?.nombre || "N/A"}{" "}
                  {venta.usuario?.apellido || ""}
                </div>

                <div className="descripcion">
                  <strong>Cliente:</strong> {venta.cliente?.nombre || "CF"}
                </div>

                {venta.cliente?.nitCliente && (
                  <div className="descripcion">
                    <strong>NIT:</strong> {venta.cliente.nitCliente}
                  </div>
                )}
              </div>

              <div className="venta-productos-titulo">
                <strong>Productos</strong>
              </div>

              <div className="details-list-venta">
                {venta.detalleventa?.map((detalle, index) => (
                  <div key={detalle.idDetalleVenta}>
                    <div className="detail-item-venta">
                      <div className="detail-producto-nombre">
                        {detalle.producto?.nombre ||
                          detalle.lote?.producto?.nombre ||
                          `Producto #${detalle.idProducto || detalle.idLote}`}
                      </div>
                      <div className="detail-cantidad-precio">
                        <span>Cantidad: {detalle.cantidad}</span>
                        <span>
                          Precio: Q {Number(detalle.precioUnitario).toFixed(2)}
                        </span>
                      </div>
                      {detalle.descuento && Number(detalle.descuento) > 0 && (
                        <div className="detail-descuento">
                          Descuento: Q {Number(detalle.descuento).toFixed(2)}
                        </div>
                      )}
                      <div className="detail-subtotal">
                        Subtotal: Q{" "}
                        {Number(
                          detalle.montoTotal - detalle.ivaProducto
                        ).toFixed(2)}
                      </div>
                    </div>
                    {index < venta.detalleventa.length - 1 && (
                      <div className="divider-producto"></div>
                    )}
                  </div>
                ))}
              </div>

              <div className="venta-totales">
                <div className="venta-iva">
                  <span>IVA:</span>
                  <span>
                    Q {calcularIVATotal(venta.detalleventa).toFixed(2)}
                  </span>
                </div>
                <div className="venta-total">
                  <span>Total:</span>
                  <span>Q {Number(venta.totalVenta).toFixed(2)}</span>
                </div>
              </div>
            </article>
          ))
        )}
      </section>
    </main>
  );
};

export default ListarVentas;
