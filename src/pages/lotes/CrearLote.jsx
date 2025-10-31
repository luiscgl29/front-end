import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../lib/axiosLocal";

const CrearLote = () => {
  const irA = useNavigate();
  const [idProducto, setIdProducto] = useState("");
  const [cantidadTotal, setCantidadTotal] = useState("");
  const [precioCompra, setPrecioCompra] = useState("");
  const [precioVenta, setPrecioVenta] = useState("");
  const [nombrePaquete, setNombrePaquete] = useState("");

  useEffect(() => {
    document.title = "Crear Lote";
  }, []);

  // Obtener productos disponibles
  const { data: productos } = useQuery({
    queryKey: ["productos"],
    queryFn: async () => {
      const respuesta = await API.get("/productos");
      return respuesta.data;
    },
  });

  const queryClient = useQueryClient();
  const { mutate } = useMutation({
    mutationFn: async (lote) => {
      const respuesta = await API.post("/lotes", lote);
      return respuesta.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["lotes"],
      });
    },
  });

  return (
    <div className="form-container">
      <div className="form-box">
        <h2 className="form-title">Crear Nuevo Lote</h2>
        <form>
          <div className="form-group">
            <label className="form-label">Producto: </label>
            <select
              className="form-select"
              value={idProducto}
              onChange={(e) => setIdProducto(e.target.value)}
            >
              <option value="">Seleccione el producto</option>
              {productos?.Producto?.map((producto) => (
                <option key={producto.idProducto} value={producto.idProducto}>
                  {producto.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Nombre del Paquete: </label>
            <input
              className="form-input"
              type="text"
              value={nombrePaquete}
              onChange={(e) => setNombrePaquete(e.target.value)}
              placeholder="Ej: Paquete de 12 unidades"
              maxLength={150}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Cantidad Total: </label>
            <input
              className="form-input"
              type="number"
              value={cantidadTotal}
              onChange={(e) => setCantidadTotal(e.target.value)}
              placeholder="Cantidad de unidades en el lote"
              min="1"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Precio de Compra: </label>
            <input
              className="form-input"
              type="number"
              step="0.01"
              value={precioCompra}
              onChange={(e) => setPrecioCompra(e.target.value)}
              placeholder="0.00"
              min="0"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Precio de Venta: </label>
            <input
              className="form-input"
              type="number"
              step="0.01"
              value={precioVenta}
              onChange={(e) => setPrecioVenta(e.target.value)}
              placeholder="0.00"
              min="0"
            />
          </div>

          <button
            className="form-btn-primary"
            onClick={(e) => {
              e.preventDefault();
              if (
                !idProducto ||
                !nombrePaquete ||
                !cantidadTotal ||
                !precioCompra ||
                !precioVenta
              ) {
                alert("Por favor complete todos los campos");
                return;
              }
              const lote = {
                idProducto: Number(idProducto),
                cantidadTotal: Number(cantidadTotal),
                precioCompra: Number(precioCompra),
                precioVenta: Number(precioVenta),
                nombrePaquete,
              };
              mutate(lote, {
                onSuccess: () => {
                  irA("/lotes");
                },
                onError: (error) => {
                  alert(
                    "Error al crear el lote: " +
                      (error.response?.data?.mensaje || error.message)
                  );
                },
              });
            }}
          >
            Crear Lote
          </button>
          <button
            className="form-btn-secondary"
            onClick={(e) => {
              e.preventDefault();
              irA("/lotes");
            }}
            style={{ backgroundColor: "#6c757d" }}
          >
            Cancelar
          </button>
        </form>
      </div>
    </div>
  );
};

export default CrearLote;
