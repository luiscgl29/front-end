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
      <div style={styles.loading}>
        <h2>Cargando compras...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.error}>
        <h2>❌ Error al cargar las compras</h2>
        <p>{error.message}</p>
      </div>
    );
  }

  const comprasFiltradas = data.filter((compra) => {
    const empleado = `${compra.usuario?.nombre || ""} ${
      compra.usuario?.apellido || ""
    }`.toLowerCase();
    const idCompra = compra.idCompra.toString();
    const fecha = new Date(compra.fecha).toLocaleDateString();
    const termino = busqueda.toLowerCase();

    return (
      empleado.includes(termino) ||
      idCompra.includes(termino) ||
      fecha.includes(termino)
    );
  });

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1>📦 Historial de Compras</h1>
        <input
          type="text"
          placeholder="Buscar por empleado, ID o fecha..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          style={styles.searchInput}
        />
      </header>

      <div style={styles.gridContainer}>
        {comprasFiltradas.length === 0 ? (
          <div style={styles.noResults}>
            <p>No se encontraron compras</p>
          </div>
        ) : (
          comprasFiltradas.map((compra) => (
            <div key={compra.idCompra} style={styles.card}>
              <div style={styles.cardHeader}>
                <h3 style={styles.cardTitle}>Compra #{compra.idCompra}</h3>
                <span style={styles.badge}>
                  {new Date(compra.fecha).toLocaleDateString("es-GT", {
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
                    {compra.usuario?.nombre || "N/A"}{" "}
                    {compra.usuario?.apellido || ""}
                  </span>
                </div>

                <div style={styles.infoRow}>
                  <span style={styles.label}>📧 Correo:</span>
                  <span style={styles.value}>
                    {compra.usuario?.correo || "N/A"}
                  </span>
                </div>

                <div style={styles.divider}></div>

                <div style={styles.detallesHeader}>
                  <h4 style={styles.detallesTitle}>Detalles de Compra</h4>
                </div>

                <div style={styles.detallesContainer}>
                  {compra.compradetalle?.map((detalle) => (
                    <div
                      key={detalle.idCompraDetalle}
                      style={styles.detalleItem}
                    >
                      <div style={styles.detalleInfo}>
                        <span style={styles.loteBadge}>
                          Lote #{detalle.idLote}
                        </span>
                        <div style={styles.detalleStats}>
                          <span>Cantidad: {detalle.cantidadComprada}</span>
                          <span>
                            Precio: Q. {Number(detalle.precioCompra).toFixed(2)}
                          </span>
                        </div>
                      </div>
                      <div style={styles.detalleTotal}>
                        Q.{" "}
                        {(
                          Number(detalle.precioCompra) *
                          detalle.cantidadComprada
                        ).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>

                <div style={styles.divider}></div>

                <div style={styles.totalRow}>
                  <span style={styles.totalLabel}>Total Compra:</span>
                  <span style={styles.totalValue}>
                    Q. {Number(compra.totalCompra).toFixed(2)}
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
    backgroundColor: "#4CAF50",
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
    backgroundColor: "#2196F3",
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
  detalleTotal: {
    fontWeight: "600",
    color: "#4CAF50",
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
    color: "#4CAF50",
  },
};

export default ListarCompras;
