import { useQuery } from "@tanstack/react-query";
import API from "../lib/axiosLocal";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";

const GraficosMayoristas = () => {
  const COLORS = [
    "#0088FE",
    "#00C49F",
    "#FFBB28",
    "#FF8042",
    "#8884d8",
    "#82ca9d",
    "#ffc658",
    "#ff7c7c",
  ];

  // Query para ventas diarias mayoristas
  const { data: ventasDiarias = [], isLoading: loadingVentas } = useQuery({
    queryKey: ["ventas-diarias-mayoristas"],
    queryFn: async () => {
      const res = await API.get("/graficos/ventas-diarias-mayoristas");
      return res.data.map((v) => ({
        fecha: new Date(v.fecha).toLocaleDateString("es-GT", {
          month: "short",
          day: "numeric",
        }),
        ventas: Number(v.totalVentas),
        monto: Number(v.montoTotal),
      }));
    },
  });

  // Query para top productos mayoristas
  const { data: topProductos = [], isLoading: loadingProductos } = useQuery({
    queryKey: ["top-productos-mayoristas"],
    queryFn: async () => {
      const res = await API.get("/graficos/top-productos-mayoristas");
      return res.data.map((p) => ({
        nombre: p.nombre,
        cantidad: Number(p.cantidadVendida),
        total: Number(p.totalGenerado),
        ventas: Number(p.numeroVentas),
        marca: p.marca,
        categoria: p.categoria,
      }));
    },
  });

  // Query para ventas por empleados mayoristas
  const { data: ventasEmpleados = [], isLoading: loadingEmpleados } = useQuery({
    queryKey: ["ventas-empleados-mayoristas"],
    queryFn: async () => {
      const res = await API.get("/graficos/ventas-empleados-mayoristas");
      return res.data.map((e) => ({
        nombre: e.empleado,
        ventas: Number(e.totalVentas),
        monto: Number(e.montoTotal),
        promedio: Number(e.promedioVenta),
        mayor: Number(e.ventaMayor),
        menor: Number(e.ventaMenor),
      }));
    },
  });

  // Query para métricas mayoristas
  const { data: metricas, isLoading: loadingMetricas } = useQuery({
    queryKey: ["metricas-mayoristas"],
    queryFn: async () => {
      const res = await API.get("/graficos/metricas-mayoristas");
      return res.data;
    },
  });

  const formatearMoneda = (valor) => {
    return new Intl.NumberFormat("es-GT", {
      style: "currency",
      currency: "GTQ",
    }).format(valor);
  };

  const isLoading =
    loadingVentas || loadingProductos || loadingEmpleados || loadingMetricas;

  if (isLoading) {
    return (
      <div className="estado-carga">
        Cargando datos del dashboard mayoristas...
      </div>
    );
  }

  return (
    <main className="pagina-container pagina-graficos">
      <header className="pagina-header header-graficos">
        <h1>Graficos Ventas Mayoristas</h1>
      </header>

      {/* Métricas principales */}
      {metricas && (
        <section className="metricas-graficos">
          <article className="card-metrica ventas">
            <div className="header-metrica">
              <h3>Ventas del Mes</h3>
            </div>
            <div className="valor-metrica">
              {formatearMoneda(metricas.ventasMes.montoTotal)}
            </div>
            <div className="detalle-metrica">
              <span>{metricas.ventasMes.totalVentas} ventas</span>
            </div>
          </article>

          <article className="card-metrica compras">
            <div className="header-metrica">
              <h3>Compras del Mes</h3>
            </div>
            <div className="valor-metrica">
              {formatearMoneda(metricas.comprasMes.montoTotal)}
            </div>
            <div className="detalle-metrica">
              <span>{metricas.comprasMes.totalCompras} compras</span>
            </div>
          </article>

          <article className="card-metrica clientes">
            <div className="header-metrica">
              <h3>Clientes Mayoristas</h3>
            </div>
            <div className="valor-metrica">{metricas.clientes.activos}</div>
            <div className="detalle-metrica">
              <span>Últimos 30 días</span>
            </div>
          </article>

          <article className="card-metrica stock">
            <div className="header-metrica">
              <h3>Lotes Bajo Stock</h3>
            </div>
            <div className="valor-metrica alerta">
              {metricas.inventario.lotesBAjoStock}
            </div>
            <div className="detalle-metrica">
              <span>Lotes con ≤5 unidades</span>
            </div>
          </article>
        </section>
      )}

      {/* Gráfico de ventas diarias */}
      <section className="card-grafico">
        <div className="header-card-grafico">
          <h2>Ventas Diarias Mayoristas - Últimos 30 días</h2>
        </div>
        <div className="contenedor-grafico">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={ventasDiarias}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="fecha" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip formatter={(value) => formatearMoneda(value)} />
              <Legend />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="ventas"
                stroke="#8884d8"
                strokeWidth={2}
                name="Número de Ventas"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="monto"
                stroke="#82ca9d"
                strokeWidth={2}
                name="Monto Total"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Top productos y ventas por empleado */}
      <section className="grid-graficos-doble">
        {/* Top lotes/productos */}
        <article className="card-grafico">
          <div className="header-card-grafico">
            <h2>Top 10 Lotes Mayoristas</h2>
          </div>
          <div className="contenedor-grafico">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topProductos}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="nombre"
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  fontSize={12}
                />
                <YAxis />
                <Tooltip
                  formatter={(value, name) => {
                    if (name === "Monto Generado")
                      return formatearMoneda(value);
                    return value.toLocaleString();
                  }}
                />
                <Legend />
                <Bar
                  dataKey="cantidad"
                  fill="#8884d8"
                  name="Cantidad Vendida"
                />
                <Bar dataKey="total" fill="#82ca9d" name="Monto Generado" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>

        {/* Ventas por empleado */}
        <article className="card-grafico">
          <div className="header-card-grafico">
            <h2>Ventas por Empleado (Mayoristas)</h2>
          </div>
          <div className="contenedor-grafico">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={ventasEmpleados}
                  dataKey="monto"
                  nameKey="nombre"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={(entry) =>
                    `${entry.nombre.split(" ")[0]}: ${formatearMoneda(
                      entry.monto
                    )}`
                  }
                  labelLine={false}
                >
                  {ventasEmpleados.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatearMoneda(value)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </article>
      </section>

      {/* Tabla de empleados */}
      <section className="card-tabla">
        <div className="header-tabla">
          <h2>Detalle de Ventas por Empleado (Mayoristas)</h2>
        </div>
        <div className="contenedor-tabla">
          <table className="tabla-datos">
            <thead>
              <tr>
                <th>Empleado</th>
                <th>N° Ventas</th>
                <th>Monto Total</th>
                <th>Promedio</th>
                <th>Venta Mayor</th>
                <th>Venta Menor</th>
              </tr>
            </thead>
            <tbody>
              {ventasEmpleados.length === 0 ? (
                <tr>
                  <td colSpan="6" className="sin-resultados">
                    No hay datos de ventas por empleado
                  </td>
                </tr>
              ) : (
                ventasEmpleados.map((empleado, idx) => (
                  <tr key={idx}>
                    <td className="nombre-empleado">{empleado.nombre}</td>
                    <td>{empleado.ventas}</td>
                    <td className="valor-monto">
                      {formatearMoneda(empleado.monto)}
                    </td>
                    <td className="valor-monto">
                      {formatearMoneda(empleado.promedio)}
                    </td>
                    <td className="valor-monto">
                      {formatearMoneda(empleado.mayor)}
                    </td>
                    <td className="valor-monto">
                      {formatearMoneda(empleado.menor)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
};

export default GraficosMayoristas;
