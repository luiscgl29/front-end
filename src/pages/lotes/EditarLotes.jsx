import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../../lib/axiosLocal";

const EditarLote = () => {
  const irA = useNavigate();
  const { id } = useParams();
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
      <div className="productos">
        <div className="caja-productos">
          <h2 className="titulo-formulario">Editar Lote</h2>
          <form>
            <label className="label-producto">Producto: </label>
            <select
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

            <label className="label-producto">Nombre del Paquete: </label>
            <input
              className="input-producto"
              type="text"
              value={nombrePaquete}
              onChange={(e) => setNombrePaquete(e.target.value)}
              maxLength={150}
            />

            <label className="label-producto">Cantidad Total: </label>
            <input
              className="input-producto"
              type="number"
              value={cantidadTotal}
              onChange={(e) => setCantidadTotal(e.target.value)}
              min="0"
            />

            <label className="label-producto">Precio de Compra: </label>
            <input
              className="input-producto"
              type="number"
              step="0.01"
              value={precioCompra}
              onChange={(e) => setPrecioCompra(e.target.value)}
              min="0"
            />

            <label className="label-producto">Precio de Venta: </label>
            <input
              className="input-producto"
              type="number"
              step="0.01"
              value={precioVenta}
              onChange={(e) => setPrecioVenta(e.target.value)}
              min="0"
            />

            <div className="modal-botones">
              <button
                className="boton-producto btn-cancelar"
                onClick={(e) => {
                  e.preventDefault();
                  irA("/lotes");
                }}
              >
                Cancelar
              </button>
              <button
                className="boton-producto"
                onClick={(e) => {
                  e.preventDefault();
                  const lote = {
                    idProducto: Number(idProducto) || null,
                    cantidadTotal: Number(cantidadTotal),
                    precioCompra: Number(precioCompra),
                    precioVenta: Number(precioVenta),
                    nombrePaquete,
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
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default EditarLote;
