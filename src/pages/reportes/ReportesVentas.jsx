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
      <div style={styles.loading}>
        <h2>Cargando ventas...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.error}>
        <h2>❌ Error al cargar las ventas</h2>
        <p>{error.message}</p>
      </div>
    );
  }

  const ventasFiltradas = data.filter((venta) => {
    const empleado = `${venta.usuario?.nombre || ""} ${
      venta.usuario?.apellido || ""
    }`.toLowerCase();
    const idVenta = venta.idVenta.toString();
    const fecha = new Date(venta.fecha).toLocaleDateString();
    const termino = busqueda.toLowerCase();

    return (
      empleado.includes(termino) ||
      idVenta.includes(termino) ||
      fecha.includes(termino)
    );
  });

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1>💰 Historial de Ventas</h1>
        <input
          type="text"
          placeholder="Buscar por empleado, ID o fecha..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          style={styles.searchInput}
        />
      </header>

      <div style={styles.gridContainer}>
        {ventasFiltradas.length === 0 ? (
          <div style={styles.noResults}>
            <p>No se encontraron ventas</p>
          </div>
        ) : (
          ventasFiltradas.map((venta) => (
            <div key={venta.idVenta} style={styles.card}>
              <div style={styles.cardHeader}>
                <h3 style={styles.cardTitle}>Venta #{venta.idVenta}</h3>
                <span style={styles.badge}>
                  {new Date(venta.fecha).toLocaleDateString("es-GT", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>

              <div style={styles.cardBody}>
                <div style={styles.infoRow}>
                  <span style={styles.label}>👤 Empleado:</span>
                  <span style={styles.value}>
                    {venta.usuario?.nombre || "N/A"}{" "}
                    {venta.usuario?.apellido || ""}
                  </span>
                </div>

                <div style={styles.infoRow}>
                  <span style={styles.label}>📧 Correo:</span>
                  <span style={styles.value}>
                    {venta.usuario?.correo || "N/A"}
                  </span>
                </div>

                <div style={styles.divider}></div>

                <div style={styles.detallesHeader}>
                  <h4 style={styles.detallesTitle}>Detalles de Venta</h4>
                </div>

                <div style={styles.detallesContainer}>
                  {venta.detalleventa?.map((detalle) => (
                    <div
                      key={detalle.idDetalleVenta}
                      style={styles.detalleItem}
                    >
                      <div style={styles.detalleInfo}>
                        <span
                          style={{
                            ...styles.loteBadge,
                            backgroundColor: detalle.idLote
                              ? "#FF9800"
                              : "#9C27B0",
                          }}
                        >
                          {detalle.idLote
                            ? `Lote #${detalle.idLote}`
                            : `Producto #${detalle.idProducto}`}
                        </span>
                        <div style={styles.detalleStats}>
                          <span>Cantidad: {detalle.cantidad}</span>
                          <span>
                            Precio: Q.{" "}
                            {Number(detalle.precioUnitario).toFixed(2)}
                          </span>
                        </div>
                        {detalle.descuento && Number(detalle.descuento) > 0 && (
                          <div style={styles.descuentoBadge}>
                            Descuento: Q. {Number(detalle.descuento).toFixed(2)}
                          </div>
                        )}
                      </div>
                      <div style={styles.detalleTotal}>
                        Q. {Number(detalle.montoTotal).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>

                <div style={styles.divider}></div>

                <div style={styles.totalRow}>
                  <span style={styles.totalLabel}>Total Venta:</span>
                  <span style={styles.totalValue}>
                    Q. {Number(venta.totalVenta).toFixed(2)}
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

const styles = {
  container: {
    padding: "20px",
    maxWidth: "1400px",
    margin: "0 auto",
    fontFamily: "system-ui, -apple-system, sans-serif",
  },
  header: {
    marginBottom: "30px",
  },
  searchInput: {
    width: "100%",
    padding: "12px 16px",
    fontSize: "16px",
    border: "2px solid #e0e0e0",
    borderRadius: "8px",
    marginTop: "15px",
    outline: "none",
    transition: "border-color 0.3s",
  },
  loading: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "400px",
    fontSize: "18px",
    color: "#666",
  },
  error: {
    padding: "40px",
    textAlign: "center",
    color: "#dc3545",
  },
  noResults: {
    gridColumn: "1 / -1",
    textAlign: "center",
    padding: "40px",
    color: "#666",
    fontSize: "18px",
  },
  gridContainer: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))",
    gap: "20px",
    maxHeight: "calc(100vh - 200px)",
    overflowY: "auto",
    paddingRight: "10px",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: "12px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    overflow: "hidden",
    transition: "transform 0.2s, box-shadow 0.2s",
    cursor: "pointer",
    border: "1px solid #e0e0e0",
  },
  cardHeader: {
    backgroundColor: "#2196F3",
    color: "white",
    padding: "16px 20px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardTitle: {
    margin: 0,
    fontSize: "18px",
    fontWeight: "600",
  },
  badge: {
    backgroundColor: "rgba(255,255,255,0.2)",
    padding: "4px 12px",
    borderRadius: "20px",
    fontSize: "13px",
    fontWeight: "500",
  },
  cardBody: {
    padding: "20px",
  },
  infoRow: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "12px",
    fontSize: "14px",
  },
  label: {
    fontWeight: "600",
    color: "#555",
  },
  value: {
    color: "#333",
    textAlign: "right",
  },
  divider: {
    height: "1px",
    backgroundColor: "#e0e0e0",
    margin: "16px 0",
  },
  detallesHeader: {
    marginBottom: "12px",
  },
  detallesTitle: {
    margin: 0,
    fontSize: "15px",
    fontWeight: "600",
    color: "#333",
  },
  detallesContainer: {
    maxHeight: "200px",
    overflowY: "auto",
    paddingRight: "8px",
  },
  detalleItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px",
    backgroundColor: "#f8f9fa",
    borderRadius: "6px",
    marginBottom: "8px",
    fontSize: "13px",
  },
  detalleInfo: {
    flex: 1,
  },
  loteBadge: {
    display: "inline-block",
    color: "white",
    padding: "3px 10px",
    borderRadius: "4px",
    fontSize: "12px",
    fontWeight: "500",
    marginBottom: "6px",
  },
  detalleStats: {
    display: "flex",
    gap: "12px",
    color: "#666",
    marginTop: "4px",
  },
  descuentoBadge: {
    display: "inline-block",
    backgroundColor: "#FF5252",
    color: "white",
    padding: "2px 8px",
    borderRadius: "4px",
    fontSize: "11px",
    fontWeight: "500",
    marginTop: "4px",
  },
  detalleTotal: {
    fontWeight: "600",
    color: "#2196F3",
    fontSize: "14px",
  },
  totalRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: "12px",
  },
  totalLabel: {
    fontSize: "16px",
    fontWeight: "700",
    color: "#333",
  },
  totalValue: {
    fontSize: "20px",
    fontWeight: "700",
    color: "#2196F3",
  },
};

export default ListarVentas;
