import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import API from "../../lib/axiosLocal";

const ListarVentas = () => {
  const [busqueda, setBusqueda] = useState("");

  const { data, isLoading, error } = useQuery({
    queryKey: ["ventas"],
    queryFn: async () => {
      const res = await API.get("/ventas");
      return res.data?.ventas || [];
    },
  });

  if (isLoading) {
    return (
      <div className="loading-container">
        <h2>Cargando ventas...</h2>
      </div>
    );
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
    const fecha = new Date(venta.fecha).toLocaleDateString();
    const termino = busqueda.toLowerCase();

    return (
      empleado.includes(termino) ||
      cliente.includes(termino) ||
      idVenta.includes(termino) ||
      fecha.includes(termino)
    );
  });

  return (
    <div className="page-container">
      <header className="page-header">
        <h1>Historial de Ventas</h1>
        <input
          type="text"
          placeholder="Buscar por empleado, cliente, ID o fecha..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="search-input"
        />
      </header>

      <div className="grid-container">
        {ventasFiltradas.length === 0 ? (
          <div className="no-results">
            <p>No se encontraron ventas</p>
          </div>
        ) : (
          ventasFiltradas.map((venta) => (
            <div key={venta.idVenta} className="card">
              <div className="card-header">
                <h3 className="card-title">Venta #{venta.idVenta}</h3>
                <span className="date-badge">
                  {new Date(venta.fecha).toLocaleDateString("es-GT", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>

              <div className="card-body">
                <div className="info-row">
                  <span className="label">Empleado:</span>
                  <span className="value">
                    {venta.usuario?.nombre || "N/A"}{" "}
                    {venta.usuario?.apellido || ""}
                  </span>
                </div>

                <div className="info-row">
                  <span className="label">Cliente:</span>
                  <span className="value">{venta.cliente?.nombre || "CF"}</span>
                </div>

                {venta.cliente?.nitCliente && (
                  <div className="info-row">
                    <span className="label">NIT:</span>
                    <span className="value">{venta.cliente.nitCliente}</span>
                  </div>
                )}

                <div className="divider"></div>

                <div className="details-header">
                  <h4>Detalles de Venta</h4>
                </div>

                <div className="details-container">
                  {venta.detalleventa?.map((detalle) => (
                    <div key={detalle.idDetalleVenta} className="detail-item">
                      <div className="detail-info">
                        <span className="item-badge">
                          {detalle.idLote
                            ? `Lote #${detalle.idLote}`
                            : `Producto #${detalle.idProducto}`}
                        </span>
                        <div className="detail-stats">
                          <span>Cantidad: {detalle.cantidad}</span>
                          <span>
                            Precio: Q{" "}
                            {Number(detalle.precioUnitario).toFixed(2)}
                          </span>
                        </div>
                        {detalle.descuento && Number(detalle.descuento) > 0 && (
                          <div className="discount-info">
                            Descuento: Q {Number(detalle.descuento).toFixed(2)}
                          </div>
                        )}
                      </div>
                      <div className="detail-total">
                        Q {Number(detalle.montoTotal).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="divider"></div>

                <div className="total-row">
                  <span className="total-label">Total Venta:</span>
                  <span className="total-value">
                    Q {Number(venta.totalVenta).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ListarVentas;
