import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../lib/axiosLocal";

const EditarProducto = () => {
  const irA = useNavigate();
  const { id } = useParams();
  const [idCategoria, setIdCategoria] = useState("");
  const [idMarca, setIdMarca] = useState("");
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [precioVenta, setPrecioVenta] = useState("");
  const [cantidadDisponible, setcantidadDisponible] = useState("");

  useEffect(() => {
    document.title = "Editar Producto";
  }, []);

  // Obtener el producto
  const { data: productoData, isLoading: cargandoProducto } = useQuery({
    queryKey: ["producto", id],
    queryFn: async () => {
      const respuesta = await API.get(`/productos/${id}`);
      return respuesta.data;
    },
    enabled: !!id,
  });

  // Cargar datos del producto en el formulario
  useEffect(() => {
    if (productoData?.datosProducto) {
      const producto = productoData.datosProducto;
      setIdCategoria(producto.idCategoria?.toString() || "");
      setIdMarca(producto.idMarca?.toString() || "");
      setNombre(producto.nombre || "");
      setDescripcion(producto.descripcion || "");
      setPrecioVenta(producto.precioVenta?.toString() || "");
      setcantidadDisponible(producto.cantidadDisponible?.toString() || "");
    }
  }, [productoData]);

  const { data: categorias } = useQuery({
    queryKey: ["categorias"],
    queryFn: async () => {
      const respuesta = await API.get("/productos/categoria");
      return respuesta.data;
    },
  });

  const { data: marcas } = useQuery({
    queryKey: ["marcas"],
    queryFn: async () => {
      const respuesta = await API.get("/productos/marca");
      return respuesta.data;
    },
  });

  const queryClient = useQueryClient();
  const { mutate } = useMutation({
    mutationFn: async (productos) => {
      const respuesta = await API.put(`/productos/${id}`, productos);
      return respuesta.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["productos"],
      });
      queryClient.invalidateQueries({
        queryKey: ["producto", id],
      });
    },
  });

  if (cargandoProducto) {
    return <h1 className="loading">Cargando...</h1>;
  }

  return (
    <>
      <div className="productos">
        <div className="caja-productos">
          <h2 className="titulo-formulario">Editar Producto</h2>
          <form>
            <select
              value={idCategoria}
              onChange={(e) => setIdCategoria(e.target.value)}
            >
              <option value="">Seleccione la categoría</option>
              {categorias?.categorias?.map((categoria) => (
                <option
                  key={categoria.idCategoria}
                  value={categoria.idCategoria}
                >
                  {categoria.categoria}
                </option>
              ))}
            </select>
            <select
              value={idMarca}
              onChange={(e) => setIdMarca(e.target.value)}
            >
              <option value="">Selecciona la marca</option>
              {marcas?.marcas?.map((marca) => (
                <option key={marca.idMarca} value={marca.idMarca}>
                  {marca.nombre}
                </option>
              ))}
            </select>
            <label className="label-producto">Nombre del Producto: </label>
            <input
              className="input-producto"
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
            />
            <label className="label-producto">Descripción del Producto: </label>
            <input
              className="input-producto"
              type="text"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
            />
            <label className="label-producto">
              Precio de venta del Producto:{" "}
            </label>
            <input
              className="input-producto"
              type="text"
              value={precioVenta}
              onChange={(e) => setPrecioVenta(e.target.value)}
            />
            <label className="label-producto">Cantidad del Producto: </label>
            <input
              className="input-producto"
              type="text"
              value={cantidadDisponible}
              onChange={(e) => setcantidadDisponible(e.target.value)}
            />
            <button
              className="boton-producto"
              onClick={(e) => {
                e.preventDefault();
                const productos = {
                  idCategoria: Number(idCategoria) || null,
                  idMarca: Number(idMarca) || null,
                  nombre,
                  descripcion,
                  precioVenta: Number(precioVenta),
                  cantidadDisponible: Number(cantidadDisponible),
                };
                mutate(productos, {
                  onSuccess: () => {
                    irA("/productos");
                  },
                });
              }}
            >
              Guardar Cambios
            </button>
            <button
              className="boton-producto"
              onClick={(e) => {
                e.preventDefault();
                irA("/productos");
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

export default EditarProducto;
