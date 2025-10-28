import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useAutentificacion } from "./autentificacion/hookAutentificacion";
import API from "../lib/axiosLocal";

const Compras = () => {
  const irA = useNavigate();
  const { data } = useAutentificacion();
  const queryClient = useQueryClient();

  const [busqueda, setBusqueda] = useState("");
  const [carrito, setCarrito] = useState([]);
  const [proveedor, setProveedor] = useState("");
  const [fechaCompra, setFechaCompra] = useState(
    new Date().toISOString().split("T")[0]
  );

  // Estados para el formulario de crear proveedor
  const [mostrarFormProveedor, setMostrarFormProveedor] = useState(false);
  const [nuevoProveedor, setNuevoProveedor] = useState({
    nombreEmpresa: "",
    telefono: "",
  });

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
      return res.data?.Proveedor || [];
    },
  });

  // Mutation para crear proveedor
  const mutationCrearProveedor = useMutation({
    mutationFn: async (proveedorData) => {
      const res = await API.post("/proveedores", proveedorData);
      return res.data;
    },
    onSuccess: (data) => {
      alert("✅ Proveedor creado con éxito");
      queryClient.invalidateQueries(["proveedores"]);
      setMostrarFormProveedor(false);
      setNuevoProveedor({
        nombreEmpresa: "",
        telefono: "",
      });
      // Seleccionar automáticamente el nuevo proveedor
      if (data?.proveedor?.codProveedor) {
        setProveedor(data.proveedor.codProveedor.toString());
      }
    },
    onError: (err) => {
      const msg = err.response?.data?.mensaje || err.message;
      alert("❌ Error al crear proveedor: " + msg);
    },
  });

  const handleCrearProveedor = () => {
    if (!nuevoProveedor.nombreEmpresa.trim()) {
      alert("El nombre de la empresa es obligatorio.");
      return;
    }
    mutationCrearProveedor.mutate({
      nombreEmpresa: nuevoProveedor.nombreEmpresa.trim(),
      telefono: nuevoProveedor.telefono.trim() || null,
    });
  };

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

  const eliminarLote = (idLote) => {
    setCarrito(carrito.filter((p) => p.idLote !== idLote));
  };

  const subtotal = carrito.reduce((acc, p) => acc + p.montoTotal, 0);
  const iva = subtotal * 0.12;
  const totalCompra = subtotal + iva;

  const mutationCompra = useMutation({
    mutationFn: async () => {
      if (carrito.length === 0) throw new Error("El carrito está vacío.");

      const compra = {
        idUsuario: data?.usuario?.usuarioId,
        codProveedor: Number(proveedor),
        totalCompra: totalCompra,
        compradetalle: carrito.map((p) => ({
          idLote: p.idLote,
          cantidadComprada: p.cantidadComprada,
          precioCompra: p.precioCompra,
        })),
      };

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

  const filtrados = lotes.filter((l) =>
    (l.producto?.nombre || "").toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <>
      <main className="main">
        <header className="header">
          <h1>Registrar Compra</h1>
        </header>

        <div className="buscador">
          <input
            type="text"
            placeholder="Buscar producto o lote..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>

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

          <div className="pago">
            <h3>Información del Proveedor</h3>

            <label htmlFor="proveedor">Seleccionar Proveedor:</label>
            <div style={{ display: "flex", gap: "10px", marginBottom: "15px" }}>
              <select
                id="proveedor"
                value={proveedor}
                onChange={(e) => setProveedor(e.target.value)}
                style={{ flex: 1 }}
              >
                <option value="">-- Seleccione un proveedor --</option>
                {proveedores.map((prov) => (
                  <option key={prov.codProveedor} value={prov.codProveedor}>
                    {prov.nombreEmpresa}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setMostrarFormProveedor(!mostrarFormProveedor)}
                style={{
                  padding: "8px 16px",
                  backgroundColor: mostrarFormProveedor ? "#6c757d" : "#28a745",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                {mostrarFormProveedor ? "❌ Cancelar" : "➕ Crear Proveedor"}
              </button>
            </div>

            {/* FORMULARIO CREAR PROVEEDOR */}
            {mostrarFormProveedor && (
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
                  Nuevo Proveedor
                </h4>

                <label htmlFor="nuevoNombreEmpresa">
                  Nombre de la Empresa: *
                </label>
                <input
                  id="nuevoNombreEmpresa"
                  type="text"
                  placeholder="Nombre de la empresa"
                  value={nuevoProveedor.nombreEmpresa}
                  onChange={(e) =>
                    setNuevoProveedor({
                      ...nuevoProveedor,
                      nombreEmpresa: e.target.value,
                    })
                  }
                  maxLength={45}
                  required
                />

                <label htmlFor="nuevoTelefono">Teléfono:</label>
                <input
                  id="nuevoTelefono"
                  type="tel"
                  placeholder="Número de teléfono (opcional)"
                  value={nuevoProveedor.telefono}
                  onChange={(e) =>
                    setNuevoProveedor({
                      ...nuevoProveedor,
                      telefono: e.target.value,
                    })
                  }
                  maxLength={15}
                />

                <button
                  type="button"
                  onClick={handleCrearProveedor}
                  disabled={mutationCrearProveedor.isPending}
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
                  {mutationCrearProveedor.isPending
                    ? "Guardando..."
                    : "💾 Guardar Proveedor"}
                </button>
              </div>
            )}

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
    </>
  );
};

export default Compras;
