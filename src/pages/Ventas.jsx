import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import API from "../lib/axiosLocal";
import "../css/Ventas.css";

const Ventas = () => {
  const irA = useNavigate();

  // --- Estados principales ---
  const [busqueda, setBusqueda] = useState("");
  const [carrito, setCarrito] = useState([]);
  const [metodoPago, setMetodoPago] = useState("Efectivo"); // Se mantiene en "Efectivo"
  const [efectivoRecibido, setEfectivoRecibido] = useState("");
  const [cliente, setCliente] = useState(1); // ID cliente por defecto

  // --- NUEVOS ESTADOS PARA DATOS DEL CLIENTE ---
  const [nombreCliente, setNombreCliente] = useState(""); // Nuevo estado para el nombre
  const [numeroNit, setNumeroNit] = useState(""); // Nuevo estado para el NIT
  // ---------------------------------------------

  const idUsuario = 1; // Usuario logueado

  // --- Consultar productos ---
  const { data: productos = [], isLoading } = useQuery({
    queryKey: ["productos"],
    queryFn: async () => {
      const res = await API.get("/productos");
      return res.data?.Producto || [];
    },
  });

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
          nombre: producto.nombre,
          cantidad,
          precioUnitario: Number(producto.precioVenta),
          montoTotal: cantidad * Number(producto.precioVenta),
        },
      ]);
    }
  };

  // --- Eliminar producto ---
  const eliminarProducto = (id) => {
    setCarrito(carrito.filter((p) => p.idProducto !== id));
  };

  // --- Calcular totales ---
  const subtotal = carrito.reduce((acc, p) => acc + p.montoTotal, 0);
  const iva = subtotal * 0.12;
  const total = subtotal + iva;

  // --- Calcular Cambio/Vuelto (Se mantuvo tu lógica existente y se hizo más explícita) ---
  const efectivoIngresado = Number(efectivoRecibido) || 0;
  const cambio = efectivoIngresado >= total ? efectivoIngresado - total : 0;

  // --- Enviar venta ---
  const mutationVenta = useMutation({
    mutationFn: async () => {
      // Validación básica para el pago en efectivo
      if (efectivoIngresado < total) {
        throw new Error(
          "El efectivo recibido es menor que el total de la venta."
        );
      }

      const venta = {
        idUsuario,
        codCliente: cliente, // Asumiendo que `cliente` es el ID del cliente registrado o '1' por defecto
        fecha: new Date(),
        metodoPago, // Siempre "Efectivo"
        // --- Considera añadir nombreCliente y numeroNit al objeto de venta si el backend los soporta ---
        // nombreFactura: nombreCliente,
        // nitFactura: numeroNit,
        // -------------------------------------------------------------------------------------------------
        detalles: carrito.map((p) => ({
          idProducto: p.idProducto,
          cantidad: p.cantidad,
          precioUnitario: p.precioUnitario,
          montoTotal: p.montoTotal,
        })),
      };
      const res = await API.post("/ventas", venta);
      return res.data;
    },
    onSuccess: (data) => {
      alert("✅ Venta registrada con éxito.");
      setCarrito([]);
      setEfectivoRecibido(""); // Limpiar efectivo recibido
      setNombreCliente(""); // Limpiar nombre
      setNumeroNit(""); // Limpiar NIT
    },
    onError: (err) => {
      const mensajeError = err.message.includes("efectivo")
        ? err.message
        : "❌ Error al registrar la venta: " +
          (err.response?.data?.mensaje || err.message);
      alert(mensajeError);
    },
  });

  if (isLoading) return <h1>Cargando productos...</h1>;

  // --- Filtro de búsqueda ---
  const filtrados = productos?.filter((p) =>
    p.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <>
      <main className="main">
        <header className="header">
          <h1>Registrar Venta</h1>
        </header>

        {/* BUSCADOR */}
        <div className="buscador">
          <input
            type="text"
            placeholder="Ingrese nombre o código del producto..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>

        {/* LISTADO PRODUCTOS */}
        <section className="tabla-productos">
          <table>
            <thead>
              <tr>
                <th>Código</th>
                <th>Nombre</th>
                <th>Precio</th>
                <th>Stock</th>
                <th>Cantidad</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map((p) => (
                <tr key={p.idProducto}>
                  <td>{p.codigo || p.idProducto}</td>
                  <td>{p.nombre}</td>
                  <td>Q. {p.precioVenta}</td>
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
          <h2>Productos Agregados</h2>
          <table>
            <thead>
              <tr>
                <th>Código</th>
                <th>Producto</th>
                <th>Cantidad</th>
                <th>Precio</th>
                <th>Total</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {carrito.map((p) => (
                <tr key={p.idProducto}>
                  <td>{p.codigo || p.idProducto}</td>
                  <td>{p.nombre}</td>
                  <td>{p.cantidad}</td>
                  <td>Q. {p.precioUnitario.toFixed(2)}</td>
                  <td>Q. {p.montoTotal.toFixed(2)}</td>
                  <td>
                    <button onClick={() => eliminarProducto(p.idProducto)}>
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
            {/* Campo para el Nombre del Cliente */}
            <label htmlFor="nombreCliente">Nombre Cliente:</label>
            <input
              id="nombreCliente"
              type="text"
              placeholder="Consumidor Final"
              value={nombreCliente}
              onChange={(e) => setNombreCliente(e.target.value)}
            />

            {/* Campo para el Número de NIT */}
            <label htmlFor="numeroNit">Número de NIT:</label>
            <input
              id="numeroNit"
              type="text"
              placeholder="C/F o NIT"
              value={numeroNit}
              onChange={(e) => setNumeroNit(e.target.value)}
            />

            {/* Se elimina el select de Tipo de Pago, se mantiene solo Efectivo */}
            <p>Tipo de Pago: **Efectivo**</p>

            <label htmlFor="efectivoRecibido">Efectivo Recibido:</label>
            <input
              id="efectivoRecibido"
              type="number"
              min={total.toFixed(2)}
              value={efectivoRecibido}
              onChange={(e) => setEfectivoRecibido(e.target.value)}
            />

            {/* VUELTO / CAMBIO */}
            <p>
              <strong>Vuelto / Cambio: </strong>Q.{""}
              {cambio.toFixed(2)}
            </p>
          </div>

          <button
            className="btn-venta"
            disabled={
              carrito.length === 0 || total === 0 || efectivoIngresado < total
            }
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
