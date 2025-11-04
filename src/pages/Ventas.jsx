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

  const [mostrarModal, setMostrarModal] = useState(false);
  const [nuevoCliente, setNuevoCliente] = useState({
    nombre: "",
    nitCliente: "",
    telefono: "",
    direccion: "",
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
      setMostrarModal(false);
      setNuevoCliente({
        nombre: "",
        nitCliente: "",
        telefono: "",
        direccion: "",
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
      // Recalcular con nueva cantidad
      const subtotalItem = nuevaCantidad * Number(producto.precioVenta);
      const ivaItem = subtotalItem * 0.12;
      const totalItem = subtotalItem + ivaItem;

      setCarrito(
        carrito.map((p) =>
          p.idProducto === producto.idProducto
            ? {
                ...p,
                cantidad: nuevaCantidad,
                ivaProducto: ivaItem,
                montoTotal: totalItem,
              }
            : p
        )
      );
    } else {
      if (cantidad > producto.cantidadDisponible) {
        alert("No hay suficiente stock disponible.");
        return;
      }
      // Calcular IVA para nuevo item
      const subtotalItem = cantidad * Number(producto.precioVenta);
      const ivaItem = subtotalItem * 0.12;
      const totalItem = subtotalItem + ivaItem;

      setCarrito([
        ...carrito,
        {
          idProducto: producto.idProducto,
          idLote: null,
          nombre: producto.nombre,
          cantidad,
          precioUnitario: Number(producto.precioVenta),
          ivaProducto: ivaItem,
          montoTotal: totalItem,
          tipo: "producto",
        },
      ]);
    }
  };

  // --- Agregar lote al carrito ---
  const agregarLote = (lote, cantidad) => {
    // Calcular cuántas unidades individuales se necesitan
    const unidadesNecesarias = cantidad * (lote.cantidadTotal || 0);

    // Verificar stock disponible del producto base
    const productoBase = productos.find(
      (p) => p.idProducto === lote.idProducto
    );
    const stockDisponible = productoBase?.cantidadDisponible || 0;

    // Calcular cuántas unidades ya están en el carrito para este producto
    const unidadesEnCarrito = carrito
      .filter((item) => {
        // Si es el mismo lote
        if (item.idLote === lote.idLote) return false;
        // Si es otro lote del mismo producto o el producto individual
        return (
          item.idProducto === lote.idProducto ||
          (item.idLote && item.idProductoBase === lote.idProducto)
        );
      })
      .reduce((total, item) => {
        if (item.tipo === "lote") {
          const loteItem = lotes.find((l) => l.idLote === item.idLote);
          return total + item.cantidad * (loteItem?.cantidadTotal || 0);
        }
        return total + item.cantidad;
      }, 0);

    const existente = carrito.find((p) => p.idLote === lote.idLote);
    const cantidadActualEnCarrito = existente
      ? existente.cantidad * (lote.cantidadTotal || 0)
      : 0;

    // Verificar si hay suficiente stock
    const stockRestante = stockDisponible - unidadesEnCarrito;
    if (unidadesNecesarias > stockRestante) {
      const lotesDisponibles = Math.floor(
        stockRestante / (lote.cantidadTotal || 1)
      );
      alert(
        `⚠️ Stock insuficiente!\n\n` +
          `Necesitas: ${unidadesNecesarias} unidades de ${
            productoBase?.nombre || "producto"
          }\n` +
          `Disponible: ${stockRestante} unidades\n` +
          `Máximo de lotes que puedes agregar: ${lotesDisponibles}`
      );
      return;
    }

    if (existente) {
      const nuevaCantidad = existente.cantidad + cantidad;
      // Recalcular con nueva cantidad
      const subtotalItem = nuevaCantidad * Number(lote.precioVenta);
      const ivaItem = subtotalItem * 0.12;
      const totalItem = subtotalItem + ivaItem;

      setCarrito(
        carrito.map((p) =>
          p.idLote === lote.idLote
            ? {
                ...p,
                cantidad: nuevaCantidad,
                ivaProducto: ivaItem,
                montoTotal: totalItem,
              }
            : p
        )
      );
    } else {
      // Calcular IVA para nuevo lote
      const subtotalItem = cantidad * Number(lote.precioVenta);
      const ivaItem = subtotalItem * 0.12;
      const totalItem = subtotalItem + ivaItem;

      setCarrito([
        ...carrito,
        {
          idProducto: null, // NO enviar idProducto en ventas por lote
          idLote: lote.idLote,
          nombre: `${lote.nombrePaquete} (${
            lote.producto?.nombre || "Sin nombre"
          })`,
          cantidad,
          precioUnitario: Number(lote.precioVenta),
          ivaProducto: ivaItem,
          montoTotal: totalItem,
          tipo: "lote",
          idProductoBase: lote.idProducto, // Solo para validaciones de stock
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
  const subtotal = carrito.reduce((acc, p) => {
    // El subtotal es sin IVA
    return acc + p.cantidad * p.precioUnitario;
  }, 0);

  const iva = carrito.reduce((acc, p) => {
    return acc + (p.ivaProducto || 0);
  }, 0);

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
          ivaProducto: p.ivaProducto,
          descuento: 0,
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
      queryClient.invalidateQueries(["productos"]);
      queryClient.invalidateQueries(["lotes"]);
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
    return <h1 className="loading">Cargando datos...</h1>;
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
      <main className="main-compraventa">
        <header className="header-compraventa">
          <h1>Registrar Venta</h1>
        </header>

        <div className="buscador-compraventa">
          <label
            style={{
              display: "flex",
              alignItems: "center",
              fontSize: "16px",
              fontWeight: "600",
            }}
          >
            <input
              type="checkbox"
              checked={mostrarLotes}
              onChange={(e) => handleToggleLotes(e.target.checked)}
              style={{
                marginRight: "8px",
                width: "18px",
                height: "18px",
                cursor: "pointer",
              }}
            />
            Venta al mayoreo
          </label>
        </div>

        {/* BUSCADOR */}
        <div className="buscador-compraventa">
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
        <section className="tabla-compraventa">
          <table className="table-compraventa">
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
                          className="input-cantidad-compraventa"
                        />
                      </td>
                      <td>
                        <button
                          className="btn-agregar-compraventa"
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
                          ➕ Agregar
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
                          className="input-cantidad-compraventa"
                        />
                      </td>
                      <td>
                        <button
                          className="btn-agregar-compraventa"
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
                          ➕ Agregar
                        </button>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </section>

        {/* CARRITO */}
        <section className="carrito-compraventa">
          <h2>{mostrarLotes ? "Lotes Agregados" : "Productos Agregados"}</h2>
          <table className="table-compraventa">
            <thead>
              <tr>
                <th>Código</th>
                <th>Nombre</th>
                <th>Cantidad</th>
                <th>Precio</th>
                <th>IVA</th>
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
                  <td className="precio-compraventa">
                    Q. {item.precioUnitario.toFixed(2)}
                  </td>
                  <td className="precio-compraventa">
                    Q. {(item.ivaProducto || 0).toFixed(2)}
                  </td>
                  <td className="precio-compraventa">
                    Q. {item.montoTotal.toFixed(2)}
                  </td>
                  <td>
                    <button
                      className="btn-eliminar-compraventa"
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

          <div className="totales-compraventa">
            <p>Subtotal: Q. {subtotal.toFixed(2)}</p>
            <p>IVA (12%): Q. {iva.toFixed(2)}</p>
            <h3>Total: Q. {total.toFixed(2)}</h3>
          </div>

          <div className="info-pago-compraventa">
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
                onClick={() => setMostrarModal(true)}
                className="btn-crear-compraventa"
              >
                ➕ Crear Cliente
              </button>
            </div>

            <p
              style={{ marginTop: "20px", fontSize: "15px", color: "#4b5563" }}
            >
              Tipo de Pago: <strong>Efectivo</strong>
            </p>

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
            className="btn-principal-compraventa"
            disabled={carrito.length === 0 || total === 0}
            onClick={() => mutationVenta.mutate()}
          >
            💾 Realizar Venta
          </button>
        </section>
      </main>

      {/* MODAL CREAR CLIENTE */}
      {mostrarModal && (
        <div
          className="modal-overlay-compraventa"
          onClick={() => setMostrarModal(false)}
        >
          <div
            className="modal-content-compraventa"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header-compraventa">
              <h2>Nuevo Cliente</h2>
              <button
                className="modal-close-compraventa"
                onClick={() => setMostrarModal(false)}
              >
                ✕
              </button>
            </div>

            <div className="modal-body-compraventa">
              <label htmlFor="nuevoNombre">Nombre Completo *</label>
              <input
                id="nuevoNombre"
                type="text"
                placeholder="Nombre del cliente"
                value={nuevoCliente.nombre}
                onChange={(e) =>
                  setNuevoCliente({ ...nuevoCliente, nombre: e.target.value })
                }
                maxLength={100}
                required
                className="modal-input-compraventa"
              />

              <label htmlFor="nuevoNit">NIT (opcional)</label>
              <input
                id="nuevoNit"
                type="text"
                placeholder="NIT del cliente"
                value={nuevoCliente.nitCliente}
                onChange={(e) =>
                  setNuevoCliente({
                    ...nuevoCliente,
                    nitCliente: e.target.value,
                  })
                }
                maxLength={20}
                className="modal-input-compraventa"
              />

              <label htmlFor="nuevoTelefono">Teléfono (opcional)</label>
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
                maxLength={15}
                className="modal-input-compraventa"
              />

              <label htmlFor="nuevaDireccion">Dirección (opcional)</label>
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
                maxLength={200}
                className="modal-input-compraventa"
              />
            </div>

            <div className="modal-footer-compraventa">
              <button
                type="button"
                onClick={() => setMostrarModal(false)}
                className="btn-cancelar-modal-compraventa"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleCrearCliente}
                disabled={mutationCrearCliente.isPending}
                className="btn-guardar-modal-compraventa"
              >
                {mutationCrearCliente.isPending ? "Guardando..." : "💾 Guardar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Ventas;
