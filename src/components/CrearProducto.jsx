import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../lib/axiosLocal";

const CrearProducto = () => {
  const irA = useNavigate();
  const [idCategoria, setIdCategoria] = useState("");
  const [idMarca, setIdMarca] = useState("");
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [precioVenta, setPrecioVenta] = useState("");
  const [cantidadDisponible, setcantidadDisponible] = useState("");

  useEffect(() => {
    document.title = "Crear Producto";
  }, []);

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
      try {
        const respuesta = await API.post("/productos", productos);
      } catch (e) {
        console.error(e);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryClient: ["productos"],
      });
    },
  });

  return (
    <div className="form-container">
      <div className="form-box">
        <h2 className="form-title">Ingrese los datos del producto</h2>
        <form>
          <div className="form-group">
            <label className="form-label">Categoría</label>
            <select
              className="form-select"
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
          </div>

          <div className="form-group">
            <label className="form-label">Marca</label>
            <select
              className="form-select"
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
          </div>

          <div className="form-group">
            <label className="form-label">Nombre del Producto</label>
            <input
              className="form-input"
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Descripción del Producto</label>
            <input
              className="form-input"
              type="text"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Precio de Venta</label>
            <input
              className="form-input"
              type="text"
              value={precioVenta}
              onChange={(e) => setPrecioVenta(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Cantidad Disponible</label>
            <input
              className="form-input"
              type="text"
              value={cantidadDisponible}
              onChange={(e) => setcantidadDisponible(e.target.value)}
            />
          </div>

          <button
            className="form-btn-primary"
            onClick={(e) => {
              e.preventDefault();
              const productos = {
                idCategoria: Number(idCategoria),
                idMarca: Number(idMarca),
                nombre,
                descripcion,
                precioVenta,
                cantidadDisponible,
              };
              mutate(productos, {
                onSuccess: () => {
                  irA("/productos");
                },
              });
            }}
          >
            Crear Producto
          </button>
          <button
            className="form-btn-secondary"
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
  );
};

export default CrearProducto;
