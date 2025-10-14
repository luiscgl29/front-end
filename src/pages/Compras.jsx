import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import API from "../lib/axiosLocal";
// import "../css/Compras.css"; // Puedes usar el mismo estilo base

const Compras = () => {
  const irA = useNavigate();
  const idUsuario = 1; // Usuario logueado (ajústalo según tu autenticación)

  // --- Estados principales ---
  const [busqueda, setBusqueda] = useState("");
  const [carrito, setCarrito] = useState([]);
  const [proveedor, setProveedor] = useState("");
  const [fechaCompra, setFechaCompra] = useState(
    new Date().toISOString().split("T")[0]
  );

  // --- Consultar lotes y productos ---
  const { data: lotes, isLoading: cargandoLotes } = useQuery({
    queryKey: ["lotes"],
    queryFn: async () => {
      const res = await API.get("/lotes");
      return res.data?.Lotes || [];
    },
  });

  const { data: proveedores, isLoading: cargandoProveedores } = useQuery({
    queryKey: ["proveedores"],
    queryFn: async () => {
      const res = await API.get("/proveedores");
      return res.data?.Proveedores || [];
    },
  });

  // --- Agregar lote al carrito ---
  const agregarLote = (lote, cantidad, precio) => {
    const existente = carrito.find((p) => p.idLote === lote.idLote);
    if (existente) {
      const nuevaCantidad = existente.cantidadComprada + cantidad;
      setCarrito(
        carrito.map((p) =>
          p.idLote === lote.idLote
            ? {
                ...p,
                cantidadComprada: nuevaCantidad,
                montoTotal: nuevaCantidad * precio,
              }
            : p
        )
      );
    } else {
      setCarrito([
        ...carrito,
        {
          idLote: lote.idLote,
          idProducto: lote.idProducto,
          nombre: lote.producto?.nombre || "Sin nombre",
          cantidadComprada: cantidad,
          precioCompra: precio,
          montoTotal: cantidad * precio,
        },
      ]);
    }
  };

  // --- Eliminar lote del carrito ---
  const eliminarLote = (idLote) => {
    setCarrito(carrito.filter((p) => p.idLote !== idLote));
  };

  // --- Calcular totales ---
  const subtotal = carrito.reduce((acc, p) => acc + p.montoTotal, 0);
  const iva = subtotal * 0.12;
  const totalCompra = subtotal + iva;

  // --- Enviar compra ---
  const mutationCompra = useMutation({
    mutationFn: async () => {
      // if (!proveedor) throw new Error("Debes seleccionar un proveedor.");
      const compra = {
        idUsuario,
        codProveedor: Number(proveedor) || 1,
        fecha: fechaCompra,
        detalles: carrito.map((p) => ({
          idLote: p.idLote,
          cantidadComprada: p.cantidadComprada,
          precioCompra: p.precioCompra,
        })),
      };
      console.log(compra);

      const res = await API.post("/compras", compra);
      return res.data;
    },
    onSuccess: () => {
      alert("✅ Compra registrada con éxito y stock actualizado.");
      setCarrito([]);
      setProveedor("");
    },
    onError: (err) => {
      const msg = err.response?.data?.mensaje || err.message;
      alert("❌ Error al registrar la compra: " + msg);
    },
  });

  if (cargandoLotes || cargandoProveedores) return <h2>Cargando datos...</h2>;

  // --- Filtro búsqueda ---
  const filtrados = lotes.filter((l) =>
    (l.producto?.nombre || "").toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="layout">
      {/* Sidebar reutilizada */}
      <aside className="sidebar">
        <h2 className="logo">Constru-Tech</h2>
        <nav>
          <ul>
            <li onClick={() => irA("/empleados")}>Empleados</li>
            <li onClick={() => irA("/productos")}>Productos</li>
            <li onClick={() => irA("/clientes")}>Clientes</li>
            <li onClick={() => irA("/ventas")}>Ventas</li>
            <li onClick={() => irA("/compras")}>Compras</li>
            <li onClick={() => irA("/reportes")}>Reportes</li>
          </ul>
        </nav>
      </aside>

      <main className="main">
        <header className="header">
          <h1>Registrar Compra</h1>
        </header>

        {/* SECCIÓN BUSCADOR */}
        <div className="buscador">
          <input
            type="text"
            placeholder="Buscar producto o lote..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>

        {/* SECCIÓN LISTADO DE LOTES */}
        <section className="tabla-productos">
          <table>
            <thead>
              <tr>
                <th>ID Lote</th>
                <th>Producto</th>
                <th>Cant. Total</th>
                <th>Precio Compra</th>
                <th>Agregar Cantidad</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map((l) => (
                <tr key={l.idLote}>
                  <td>{l.idLote}</td>
                  <td>{l.producto?.nombre || "Sin nombre"}</td>
                  <td>{l.cantidadTotal || 0}</td>
                  <td>Q. {l.precioCompra?.toFixed(2)}</td>
                  <td>
                    <input
                      type="number"
                      min="1"
                      defaultValue="1"
                      id={`cant-${l.idLote}`}
                    />
                  </td>
                  <td>
                    <button
                      onClick={() =>
                        agregarLote(
                          l,
                          parseInt(
                            document.getElementById(`cant-${l.idLote}`).value
                          ),
                          Number(l.precioCompra)
                        )
                      }
                    >
                      ➕ Agregar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* SECCIÓN CARRITO DE COMPRA */}
        <section className="carrito">
          <h2>Lotes Agregados</h2>
          <table>
            <thead>
              <tr>
                <th>ID Lote</th>
                <th>Producto</th>
                <th>Cantidad</th>
                <th>Precio</th>
                <th>Total</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {carrito.map((p) => (
                <tr key={p.idLote}>
                  <td>{p.idLote}</td>
                  <td>{p.nombre}</td>
                  <td>{p.cantidadComprada}</td>
                  <td>Q. {p.precioCompra.toFixed(2)}</td>
                  <td>Q. {p.montoTotal.toFixed(2)}</td>
                  <td>
                    <button onClick={() => eliminarLote(p.idLote)}>
                      🗑 Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="totales">
            <p>Subtotal: Q. {subtotal.toFixed(2)}</p>
            <p>IVA (12%): Q. {iva.toFixed(2)}</p>
            <h3>Total: Q. {totalCompra.toFixed(2)}</h3>
          </div>

          {/* DATOS GENERALES DE COMPRA */}
          <div className="pago">
            <label htmlFor="proveedor">Proveedor:</label>
            <select
              id="proveedor"
              value={proveedor}
              onChange={(e) => setProveedor(e.target.value)}
            >
              <option value="">-- Seleccione un proveedor --</option>
              {proveedores.map((prov) => (
                <option key={prov.codProveedor} value={prov.codProveedor}>
                  {prov.nombreEmpresa}
                </option>
              ))}
            </select>

            <label htmlFor="fechaCompra">Fecha:</label>
            <input
              type="date"
              id="fechaCompra"
              value={fechaCompra}
              onChange={(e) => setFechaCompra(e.target.value)}
            />
          </div>

          <button onClick={() => mutationCompra.mutate()}>
            💾 Registrar Compra
          </button>
        </section>
      </main>
    </div>
  );
};

export default Compras;
