import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Select from "react-select";
import API from "../lib/axiosLocal";
import { useAutentificacion } from "../pages/autentificacion/hookAutentificacion";

const Ventas = () => {
  const queryClient = useQueryClient();
  const { data } = useAutentificacion();

  const [busqueda, setBusqueda] = useState("");
  const [carrito, setCarrito] = useState([]);
  const [efectivoRecibido, setEfectivoRecibido] = useState("");
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [mostrarLotes, setMostrarLotes] = useState(false);

  // Estados para el formulario de crear cliente
  const [mostrarFormCliente, setMostrarFormCliente] = useState(false);
  const [nuevoCliente, setNuevoCliente] = useState({
    nombre: "",
    nitCliente: "",
    telefono: "",
    direccion: "",
    saldo: 0,
  });

  // --- Consultar clientes ---
  const { data: clientes = [], isLoading: cargandoClientes } = useQuery({
    queryKey: ["clientes"],
    queryFn: async () => {
      const res = await API.get("/clientes");
      return res.data?.Cliente || [];
    },
  });

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
    enabled: mostrarLotes,
  });

  // --- Crear cliente ---
  const mutationCrearCliente = useMutation({
    mutationFn: async (clienteData) => {
      const res = await API.post("/clientes", clienteData);
      return res.data;
    },
    onSuccess: (data) => {
      alert("✅ Cliente creado con éxito.");
      queryClient.invalidateQueries(["clientes"]);
      setMostrarFormCliente(false);
      setNuevoCliente({
        nombre: "",
        nitCliente: "",
        telefono: "",
        direccion: "",
        saldo: 0,
      });
      // Seleccionar automáticamente el cliente recién creado
      if (data.cliente) {
        setClienteSeleccionado({
          value: data.cliente.nitCliente,
          label: data.cliente.nombre,
          codCliente: data.cliente.codCliente,
        });
      }
    },
    onError: (err) => {
      alert(
        "❌ Error al crear cliente: " +
          (err.response?.data?.mensaje || err.message)
      );
    },
  });

  // --- Opciones para react-select ---
  const opcionesClientes = clientes.map((c) => ({
    value: c.nitCliente || "CF",
    label: c.nombre,
    codCliente: c.codCliente,
  }));

  // --- Cambiar entre productos y lotes ---
  const handleToggleLotes = (checked) => {
    setMostrarLotes(checked);
    setCarrito([]);
    setBusqueda("");
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
        codCliente: clienteSeleccionado?.codCliente || null,
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
      setClienteSeleccionado(null);
    },
    onError: (err) => {
      const mensajeError =
        err.message ||
        err.response?.data?.mensaje ||
        "Error al registrar la venta";
      alert("❌ " + mensajeError);
    },
  });

  // --- Manejar creación de cliente ---
  const handleCrearCliente = () => {
    if (!nuevoCliente.nombre.trim()) {
      alert("El nombre del cliente es obligatorio.");
      return;
    }
    mutationCrearCliente.mutate(nuevoCliente);
  };

  if (
    cargandoProductos ||
    cargandoClientes ||
    (mostrarLotes && cargandoLotes)
  ) {
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
                ? itemsFiltrados.map((l) => (
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
                : itemsFiltrados.map((p) => (
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
            <h3>Información del Cliente</h3>

            <label htmlFor="selectCliente">Seleccionar Cliente:</label>
            <div style={{ display: "flex", gap: "10px", marginBottom: "15px" }}>
              <div style={{ flex: 1 }}>
                <Select
                  id="selectCliente"
                  options={opcionesClientes}
                  value={clienteSeleccionado}
                  onChange={setClienteSeleccionado}
                  placeholder="Buscar cliente por nombre..."
                  isClearable
                  noOptionsMessage={() => "No se encontraron clientes"}
                />
              </div>
              <button
                type="button"
                onClick={() => setMostrarFormCliente(!mostrarFormCliente)}
                style={{
                  padding: "8px 16px",
                  backgroundColor: mostrarFormCliente ? "#6c757d" : "#28a745",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                {mostrarFormCliente ? "❌ Cancelar" : "➕ Crear Cliente"}
              </button>
            </div>

            {/* FORMULARIO CREAR CLIENTE */}
            {mostrarFormCliente && (
              <div
                style={{
                  marginBottom: "20px",
                  padding: "15px",
                  border: "2px solid #28a745",
                  borderRadius: "8px",
                  backgroundColor: "#f8f9fa",
                }}
              >
                <h4 style={{ marginTop: 0, color: "#28a745" }}>
                  Nuevo Cliente
                </h4>

                <label htmlFor="nuevoNombre">Nombre Completo: *</label>
                <input
                  id="nuevoNombre"
                  type="text"
                  placeholder="Nombre del cliente"
                  value={nuevoCliente.nombre}
                  onChange={(e) =>
                    setNuevoCliente({ ...nuevoCliente, nombre: e.target.value })
                  }
                  required
                />

                <label htmlFor="nuevoNit">NIT:</label>
                <input
                  id="nuevoNit"
                  type="text"
                  placeholder="NIT del cliente (opcional)"
                  value={nuevoCliente.nitCliente}
                  onChange={(e) =>
                    setNuevoCliente({
                      ...nuevoCliente,
                      nitCliente: e.target.value,
                    })
                  }
                />

                <label htmlFor="nuevoTelefono">Teléfono:</label>
                <input
                  id="nuevoTelefono"
                  type="tel"
                  placeholder="Número de teléfono"
                  value={nuevoCliente.telefono}
                  onChange={(e) =>
                    setNuevoCliente({
                      ...nuevoCliente,
                      telefono: e.target.value,
                    })
                  }
                />

                <label htmlFor="nuevaDireccion">Dirección:</label>
                <input
                  id="nuevaDireccion"
                  type="text"
                  placeholder="Dirección completa"
                  value={nuevoCliente.direccion}
                  onChange={(e) =>
                    setNuevoCliente({
                      ...nuevoCliente,
                      direccion: e.target.value,
                    })
                  }
                />

                <label htmlFor="nuevoSaldo">Saldo Inicial:</label>
                <input
                  id="nuevoSaldo"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={nuevoCliente.saldo}
                  onChange={(e) =>
                    setNuevoCliente({ ...nuevoCliente, saldo: e.target.value })
                  }
                />

                <button
                  type="button"
                  onClick={handleCrearCliente}
                  style={{
                    width: "100%",
                    padding: "10px",
                    backgroundColor: "#28a745",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontWeight: "bold",
                    marginTop: "10px",
                  }}
                >
                  💾 Guardar Cliente
                </button>
              </div>
            )}

            <p style={{ marginTop: "20px" }}>Tipo de Pago: **Efectivo**</p>

            <label htmlFor="efectivoRecibido">Efectivo Recibido:</label>
            <input
              id="efectivoRecibido"
              type="number"
              step="0.01"
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
