import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import { useAutentificacion } from "./autentificacion/hookAutentificacion";
import API from "../lib/axiosLocal";

const Compras = () => {
  const irA = useNavigate();
  const { data } = useAutentificacion();
  const queryClient = useQueryClient();

  const [busqueda, setBusqueda] = useState("");
  const [carrito, setCarrito] = useState([]);
  const [proveedorSeleccionado, setProveedorSeleccionado] = useState(null);

  // Estados para el modal de crear proveedor
  const [mostrarModal, setMostrarModal] = useState(false);
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
      setMostrarModal(false);
      setNuevoProveedor({
        nombreEmpresa: "",
        telefono: "",
      });
      // Seleccionar automáticamente el nuevo proveedor
      if (data?.proveedor?.codProveedor) {
        setProveedorSeleccionado({
          value: data.proveedor.codProveedor,
          label: data.proveedor.nombreEmpresa,
        });
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
          nombreLote: lote.nombrePaquete,
          nombreProducto: lote.producto?.nombre || "Sin nombre",
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

  const totalCompra = carrito.reduce((acc, p) => acc + p.montoTotal, 0);

  const mutationCompra = useMutation({
    mutationFn: async () => {
      if (carrito.length === 0) throw new Error("El carrito está vacío.");

      const compra = {
        idUsuario: data?.usuario?.usuarioId,
        codProveedor: proveedorSeleccionado?.value,
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
      setProveedorSeleccionado(null);
      queryClient.invalidateQueries(["lotes"]);
    },
    onError: (err) => {
      const msg = err.response?.data?.mensaje || err.message;
      alert("❌ Error al registrar la compra: " + msg);
    },
  });

  if (cargandoLotes || cargandoProveedores) return <h2>Cargando datos...</h2>;

  const filtrados = lotes.filter(
    (l) =>
      (l.nombrePaquete || "").toLowerCase().includes(busqueda.toLowerCase()) ||
      (l.producto?.nombre || "").toLowerCase().includes(busqueda.toLowerCase())
  );

  // Opciones para react-select
  const opcionesProveedores = proveedores.map((prov) => ({
    value: prov.codProveedor,
    label: prov.nombreEmpresa,
  }));

  return (
    <>
      <main className="main-compraventa">
        <header className="header-compraventa">
          <h1>Registrar Compra</h1>
        </header>

        <div className="buscador-compraventa">
          <input
            type="text"
            placeholder="Buscar por lote o producto..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>

        <section className="tabla-compraventa">
          <table className="table-compraventa">
            <thead>
              <tr>
                <th>ID Lote</th>
                <th>Nombre Lote</th>
                <th>Producto</th>
                <th>Unidades por Paquete</th>
                <th>Precio Compra</th>
                <th>Precio Venta</th>
                <th>Cantidad a Comprar</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map((l) => (
                <tr key={l.idLote}>
                  <td>{l.idLote}</td>
                  <td>{l.nombrePaquete || "Sin nombre"}</td>
                  <td>{l.producto?.nombre || "Sin nombre"}</td>
                  <td>{l.cantidadTotal || 0}</td>
                  <td>Q. {Number(l.precioCompra || 0).toFixed(2)}</td>
                  <td>Q. {Number(l.precioVenta || 0).toFixed(2)}</td>
                  <td>
                    <input
                      type="number"
                      min="1"
                      defaultValue="1"
                      id={`cant-${l.idLote}`}
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
                            document.getElementById(`cant-${l.idLote}`).value
                          ),
                          Number(l.precioCompra || 0)
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

        <section className="carrito-compraventa">
          <h2>Lotes Agregados al Carrito</h2>
          <table className="table-compraventa">
            <thead>
              <tr>
                <th>ID Lote</th>
                <th>Nombre Lote</th>
                <th>Producto</th>
                <th>Cantidad</th>
                <th>Precio Compra</th>
                <th>Total</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {carrito.map((p) => (
                <tr key={p.idLote}>
                  <td>{p.idLote}</td>
                  <td>{p.nombreLote || "Sin nombre"}</td>
                  <td>{p.nombreProducto}</td>
                  <td>{p.cantidadComprada}</td>
                  <td className="precio-compraventa">
                    Q. {p.precioCompra.toFixed(2)}
                  </td>
                  <td className="precio-compraventa">
                    Q. {p.montoTotal.toFixed(2)}
                  </td>
                  <td>
                    <button
                      className="btn-eliminar-compraventa"
                      onClick={() => eliminarLote(p.idLote)}
                    >
                      🗑 Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="totales-compraventa">
            <h3>Total: Q. {totalCompra.toFixed(2)}</h3>
          </div>

          <div className="info-pago-compraventa">
            <h3>Información del Proveedor</h3>

            <label htmlFor="selectProveedor">Seleccionar Proveedor:</label>
            <div style={{ display: "flex", gap: "10px", marginBottom: "15px" }}>
              <div style={{ flex: 1 }}>
                <Select
                  id="selectProveedor"
                  options={opcionesProveedores}
                  value={proveedorSeleccionado}
                  onChange={setProveedorSeleccionado}
                  placeholder="Buscar proveedor por nombre..."
                  isClearable
                  noOptionsMessage={() => "No se encontraron proveedores"}
                />
              </div>
              <button
                type="button"
                onClick={() => setMostrarModal(true)}
                className="btn-crear-compraventa"
              >
                ➕ Crear Proveedor
              </button>
            </div>
          </div>

          <button
            className="btn-principal-compraventa"
            onClick={() => mutationCompra.mutate()}
          >
            💾 Registrar Compra
          </button>
        </section>
      </main>

      {/* MODAL CREAR PROVEEDOR */}
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
              <h2>Nuevo Proveedor</h2>
              <button
                className="modal-close-compraventa"
                onClick={() => setMostrarModal(false)}
              >
                ✕
              </button>
            </div>

            <div className="modal-body-compraventa">
              <label htmlFor="nuevoNombreEmpresa">Nombre de la Empresa *</label>
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
                className="modal-input-compraventa"
              />

              <label htmlFor="nuevoTelefono">Teléfono (opcional)</label>
              <input
                id="nuevoTelefono"
                type="tel"
                placeholder="Número de teléfono"
                value={nuevoProveedor.telefono}
                onChange={(e) =>
                  setNuevoProveedor({
                    ...nuevoProveedor,
                    telefono: e.target.value,
                  })
                }
                maxLength={15}
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
                onClick={handleCrearProveedor}
                disabled={mutationCrearProveedor.isPending}
                className="btn-guardar-modal-compraventa"
              >
                {mutationCrearProveedor.isPending
                  ? "Guardando..."
                  : "💾 Guardar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Compras;
