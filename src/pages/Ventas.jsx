import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import API from "../lib/axiosLocal";
import "../css/Ventas.css";
import { useAutentificacion } from "../pages/autentificacion/hookAutentificacion";

const Ventas = () => {
  const irA = useNavigate();
  const { data } = useAutentificacion();

  const [busqueda, setBusqueda] = useState("");
  const [carrito, setCarrito] = useState([]);
  const [metodoPago, setMetodoPago] = useState("Efectivo");
  const [efectivoRecibido, setEfectivoRecibido] = useState("");
  const [cliente, setCliente] = useState(1);
  const [nombreCliente, setNombreCliente] = useState("");
  const [numeroNit, setNumeroNit] = useState("");
  const [mostrarLotes, setMostrarLotes] = useState(false); // Nuevo estado para el checkbox

  // --- Consultar productos ---
  const { data: productos = [], isLoading: cargandoProductos } = useQuery({
    queryKey: ["productos"],
    queryFn: async () => {
      const res = await API.get("/productos");
      return res.data?.Producto || [];
    },
  });

  // --- Consultar lotes ---
  const { data: lotes = [], isLoading: cargandoLotes } = useQuery({
    queryKey: ["lotes"],
    queryFn: async () => {
      const res = await API.get("/lotes");
      return res.data?.Lotes || [];
    },
    enabled: mostrarLotes, // Solo consulta cuando el checkbox está activo
  });

  // --- Cambiar entre productos y lotes ---
  const handleToggleLotes = (checked) => {
    setMostrarLotes(checked);
    setCarrito([]); // Limpiar carrito al cambiar de modo
    setBusqueda(""); // Limpiar búsqueda
  };

  // --- Agregar producto al carrito ---
  const agregarProducto = (producto, cantidad) => {
    const existente = carrito.find((p) => p.idProducto === producto.idProducto);
    if (existente) {
      const nuevaCantidad = existente.cantidad + cantidad;
      if (nuevaCantidad > producto.cantidadDisponible) {
        alert("No hay suficiente stock disponible.");
        return;
      }
      setCarrito(
        carrito.map((p) =>
          p.idProducto === producto.idProducto
            ? {
                ...p,
                cantidad: nuevaCantidad,
                montoTotal: nuevaCantidad * p.precioUnitario,
              }
            : p
        )
      );
    } else {
      if (cantidad > producto.cantidadDisponible) {
        alert("No hay suficiente stock disponible.");
        return;
      }
      setCarrito([
        ...carrito,
        {
          idProducto: producto.idProducto,
          idLote: null,
          nombre: producto.nombre,
          cantidad,
          precioUnitario: Number(producto.precioVenta),
          montoTotal: cantidad * Number(producto.precioVenta),
          tipo: "producto",
        },
      ]);
    }
  };

  // --- Agregar lote al carrito ---
  const agregarLote = (lote, cantidad) => {
    const existente = carrito.find((p) => p.idLote === lote.idLote);
    if (existente) {
      const nuevaCantidad = existente.cantidad + cantidad;
      setCarrito(
        carrito.map((p) =>
          p.idLote === lote.idLote
            ? {
                ...p,
                cantidad: nuevaCantidad,
                montoTotal: nuevaCantidad * p.precioUnitario,
              }
            : p
        )
      );
    } else {
      setCarrito([
        ...carrito,
        {
          idProducto: null,
          idLote: lote.idLote,
          nombre: `${lote.nombrePaquete} (${
            lote.producto?.nombre || "Sin nombre"
          })`,
          cantidad,
          precioUnitario: Number(lote.precioVenta),
          montoTotal: cantidad * Number(lote.precioVenta),
          tipo: "lote",
        },
      ]);
    }
  };

  // --- Eliminar item del carrito ---
  const eliminarItem = (id, tipo) => {
    if (tipo === "producto") {
      setCarrito(carrito.filter((p) => p.idProducto !== id));
    } else {
      setCarrito(carrito.filter((p) => p.idLote !== id));
    }
  };

  // --- Calcular totales ---
  const subtotal = carrito.reduce((acc, p) => acc + p.montoTotal, 0);
  const iva = subtotal * 0.12;
  const total = subtotal + iva;

  const efectivoIngresado = Number(efectivoRecibido) || 0;
  const cambio = efectivoIngresado >= total ? efectivoIngresado - total : 0;

  // --- Enviar venta ---
  const mutationVenta = useMutation({
    mutationFn: async () => {
      if (carrito.length === 0) {
        throw new Error("El carrito está vacío.");
      }

      const venta = {
        idUsuario: data?.usuario?.usuarioId,
        totalVenta: total,
        detallesventa: carrito.map((p) => ({
          idProducto: p.idProducto,
          idLote: p.idLote,
          cantidad: p.cantidad,
          precioUnitario: p.precioUnitario,
          montoTotal: p.montoTotal,
        })),
      };

      const res = await API.post("/ventas", venta);
      return res.data;
    },
    onSuccess: () => {
      alert("✅ Venta registrada con éxito.");
      setCarrito([]);
      setEfectivoRecibido("");
      setNombreCliente("");
      setNumeroNit("");
    },
    onError: (err) => {
      const mensajeError =
        err.message ||
        err.response?.data?.mensaje ||
        "Error al registrar la venta";
      alert("❌ " + mensajeError);
    },
  });

  if (cargandoProductos || (mostrarLotes && cargandoLotes)) {
    return <h1>Cargando datos...</h1>;
  }

  // --- Filtro de búsqueda ---
  const itemsFiltrados = mostrarLotes
    ? lotes.filter(
        (l) =>
          (l.producto?.nombre || "")
            .toLowerCase()
            .includes(busqueda.toLowerCase()) ||
          (l.nombrePaquete || "").toLowerCase().includes(busqueda.toLowerCase())
      )
    : productos.filter((p) =>
        p.nombre.toLowerCase().includes(busqueda.toLowerCase())
      );

  return (
    <>
      <main className="main">
        <header className="header">
          <h1>Registrar Venta</h1>
        </header>

        {/* TOGGLE PRODUCTOS/LOTES */}
        <div className="buscador">
          <label style={{ marginRight: "20px", fontSize: "16px" }}>
            <input
              type="checkbox"
              checked={mostrarLotes}
              onChange={(e) => handleToggleLotes(e.target.checked)}
              style={{ marginRight: "8px" }}
            />
            Venta al mayoreo
          </label>
        </div>

        {/* BUSCADOR */}
        <div className="buscador">
          <input
            type="text"
            placeholder={
              mostrarLotes ? "Buscar lote o paquete..." : "Buscar producto..."
            }
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>

        {/* LISTADO PRODUCTOS O LOTES */}
        <section className="tabla-productos">
          <table>
            <thead>
              <tr>
                <th>{mostrarLotes ? "ID Lote" : "Código"}</th>
                <th>Nombre</th>
                {mostrarLotes && <th>Producto Base</th>}
                {mostrarLotes && <th>Cant. Total</th>}
                <th>Precio</th>
                {!mostrarLotes && <th>Stock</th>}
                <th>Cantidad</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {mostrarLotes
                ? // Mostrar LOTES
                  itemsFiltrados.map((l) => (
                    <tr key={l.idLote}>
                      <td>{l.idLote}</td>
                      <td>{l.nombrePaquete}</td>
                      <td>{l.producto?.nombre || "Sin nombre"}</td>
                      <td>{l.cantidadTotal}</td>
                      <td>Q. {Number(l.precioVenta).toFixed(2)}</td>
                      <td>
                        <input
                          type="number"
                          min="1"
                          defaultValue="1"
                          id={`cant-lote-${l.idLote}`}
                        />
                      </td>
                      <td>
                        <button
                          onClick={() =>
                            agregarLote(
                              l,
                              parseInt(
                                document.getElementById(`cant-lote-${l.idLote}`)
                                  .value
                              )
                            )
                          }
                        >
                          🛒 Agregar
                        </button>
                      </td>
                    </tr>
                  ))
                : // Mostrar PRODUCTOS
                  itemsFiltrados.map((p) => (
                    <tr key={p.idProducto}>
                      <td>{p.codigo || p.idProducto}</td>
                      <td>{p.nombre}</td>
                      <td>Q. {Number(p.precioVenta).toFixed(2)}</td>
                      <td>{p.cantidadDisponible}</td>
                      <td>
                        <input
                          type="number"
                          min="1"
                          max={p.cantidadDisponible}
                          defaultValue="1"
                          id={`cant-${p.idProducto}`}
                        />
                      </td>
                      <td>
                        <button
                          onClick={() =>
                            agregarProducto(
                              p,
                              parseInt(
                                document.getElementById(`cant-${p.idProducto}`)
                                  .value
                              )
                            )
                          }
                        >
                          🛒 Agregar
                        </button>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </section>

        {/* CARRITO */}
        <section className="carrito">
          <h2>{mostrarLotes ? "Lotes Agregados" : "Productos Agregados"}</h2>
          <table>
            <thead>
              <tr>
                <th>Código</th>
                <th>Nombre</th>
                <th>Cantidad</th>
                <th>Precio</th>
                <th>Total</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {carrito.map((item, index) => (
                <tr
                  key={`${item.tipo}-${
                    item.idProducto || item.idLote
                  }-${index}`}
                >
                  <td>{item.idProducto || item.idLote}</td>
                  <td>{item.nombre}</td>
                  <td>{item.cantidad}</td>
                  <td>Q. {item.precioUnitario.toFixed(2)}</td>
                  <td>Q. {item.montoTotal.toFixed(2)}</td>
                  <td>
                    <button
                      onClick={() =>
                        eliminarItem(item.idProducto || item.idLote, item.tipo)
                      }
                    >
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
            <h3>Total: Q. {total.toFixed(2)}</h3>
          </div>

          <div className="pago">
            <label htmlFor="nombreCliente">Nombre Cliente:</label>
            <input
              id="nombreCliente"
              type="text"
              placeholder="Consumidor Final"
              value={nombreCliente}
              onChange={(e) => setNombreCliente(e.target.value)}
            />

            <label htmlFor="numeroNit">Número de NIT:</label>
            <input
              id="numeroNit"
              type="text"
              placeholder="C/F o NIT"
              value={numeroNit}
              onChange={(e) => setNumeroNit(e.target.value)}
            />

            <p>Tipo de Pago: **Efectivo**</p>

            <label htmlFor="efectivoRecibido">Efectivo Recibido:</label>
            <input
              id="efectivoRecibido"
              type="number"
              min={total.toFixed(2)}
              value={efectivoRecibido}
              onChange={(e) => setEfectivoRecibido(e.target.value)}
            />

            <p>
              <strong>Vuelto / Cambio: </strong>Q. {cambio.toFixed(2)}
            </p>
          </div>

          <button
            className="btn-venta"
            disabled={carrito.length === 0 || total === 0}
            onClick={() => mutationVenta.mutate()}
          >
            💾 Realizar Venta
          </button>
        </section>
      </main>
    </>
  );
};

export default Ventas;
