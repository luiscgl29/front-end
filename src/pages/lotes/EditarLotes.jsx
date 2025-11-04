import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../../lib/axiosLocal";
import { useAutentificacion } from "../autentificacion/hookAutentificacion";

const EditarLote = () => {
  const irA = useNavigate();
  const { id } = useParams();
  // PRUEBA
  const { data } = useAutentificacion();
  const [idProducto, setIdProducto] = useState("");
  const [cantidadTotal, setCantidadTotal] = useState("");
  const [precioCompra, setPrecioCompra] = useState("");
  const [precioVenta, setPrecioVenta] = useState("");
  const [nombrePaquete, setNombrePaquete] = useState("");

  useEffect(() => {
    document.title = "Editar Lote";
  }, []);

  // Obtener el lote
  const { data: loteData, isLoading: cargandoLote } = useQuery({
    queryKey: ["lote", id],
    queryFn: async () => {
      const respuesta = await API.get(`/lotes/${id}`);
      return respuesta.data;
    },
    enabled: !!id,
  });

  // Cargar datos del lote en el formulario
  useEffect(() => {
    if (loteData?.datosLote) {
      const lote = loteData.datosLote;
      setIdProducto(lote.idProducto?.toString() || "");
      setCantidadTotal(lote.cantidadTotal?.toString() || "");
      setPrecioCompra(lote.precioCompra?.toString() || "");
      setPrecioVenta(lote.precioVenta?.toString() || "");
      setNombrePaquete(lote.nombrePaquete || "");
    }
  }, [loteData]);

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
      const respuesta = await API.put(`/lotes/${id}`, lote);
      return respuesta.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["lotes"],
      });
      queryClient.invalidateQueries({
        queryKey: ["lote", id],
      });
    },
  });

  if (cargandoLote) {
    return <h1 className="loading">Cargando...</h1>;
  }

  return (
    <>
      <div className="form-container">
        <div className="form-box">
          <h2 className="form-title">Editar Lote</h2>
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
                min="0"
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
                min="0"
              />
            </div>

            <button
              className="form-btn-primary"
              onClick={(e) => {
                e.preventDefault();
                const lote = {
                  idProducto: Number(idProducto) || null,
                  cantidadTotal: Number(cantidadTotal),
                  precioCompra: Number(precioCompra),
                  precioVenta: Number(precioVenta),
                  nombrePaquete,
                  // PRUEBA
                  usuarioNombre: data?.usuario?.user,
                };
                mutate(lote, {
                  onSuccess: () => {
                    irA("/lotes");
                  },
                });
              }}
            >
              Guardar Cambios
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
    </>
  );
};

export default EditarLote;
