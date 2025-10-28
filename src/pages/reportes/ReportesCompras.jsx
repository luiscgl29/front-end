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
    return (
      <div className="loading-container">
        <h2>Cargando compras...</h2>
      </div>
    );
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
    const fecha = new Date(compra.fecha).toLocaleDateString();
    const termino = busqueda.toLowerCase();

    return (
      empleado.includes(termino) ||
      proveedor.includes(termino) ||
      idCompra.includes(termino) ||
      fecha.includes(termino)
    );
  });

  return (
    <div className="page-container">
      <header className="page-header">
        <h1>Historial de Compras</h1>
        <input
          type="text"
          placeholder="Buscar por empleado, proveedor, ID o fecha..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="search-input"
        />
      </header>

      <div className="grid-container">
        {comprasFiltradas.length === 0 ? (
          <div className="no-results">
            <p>No se encontraron compras</p>
          </div>
        ) : (
          comprasFiltradas.map((compra) => (
            <div key={compra.idCompra} className="card">
              <div className="card-header compra-header">
                <h3 className="card-title">Compra #{compra.idCompra}</h3>
                <span className="date-badge">
                  {new Date(compra.fecha).toLocaleDateString("es-GT", {
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
                    {compra.usuario?.nombre || "N/A"}{" "}
                    {compra.usuario?.apellido || ""}
                  </span>
                </div>

                <div className="info-row">
                  <span className="label">Proveedor:</span>
                  <span className="value">
                    {compra.proveedor?.nombreEmpresa || "N/A"}
                  </span>
                </div>

                {compra.proveedor?.telefono && (
                  <div className="info-row">
                    <span className="label">Teléfono:</span>
                    <span className="value">{compra.proveedor.telefono}</span>
                  </div>
                )}

                <div className="divider"></div>

                <div className="details-header">
                  <h4>Detalles de Compra</h4>
                </div>

                <div className="details-container">
                  {compra.compradetalle?.map((detalle) => (
                    <div key={detalle.idCompraDetalle} className="detail-item">
                      <div className="detail-info">
                        <span className="item-badge">
                          Lote #{detalle.idLote}
                        </span>
                        <div className="detail-stats">
                          <span>Cantidad: {detalle.cantidadComprada}</span>
                          <span>
                            Precio: Q {Number(detalle.precioCompra).toFixed(2)}
                          </span>
                        </div>
                      </div>
                      <div className="detail-total">
                        Q{" "}
                        {(
                          Number(detalle.precioCompra) *
                          detalle.cantidadComprada
                        ).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="divider"></div>

                <div className="total-row">
                  <span className="total-label">Total Compra:</span>
                  <span className="total-value compra-total">
                    Q {Number(compra.totalCompra).toFixed(2)}
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

export default ListarCompras;
