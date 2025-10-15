import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../lib/axiosLocal";
import "../css/CrearProducto.css";

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
    <>
      <div className="productos">
        <div className="caja-productos">
          <h2 className="titulo-formulario">Ingrese los datos del producto</h2>
          <form>
            <label className="label-producto">
              Ingrese categoria del Producto:{" "}
            </label>
            <input
              className="input-producto"
              type="text"
              //placeholder="Categoria"
              value={idCategoria}
              onChange={(e) => setIdCategoria(e.target.value)}
            />
            <label className="label-producto">
              Ingrese marca del Producto:{" "}
            </label>
            <input
              className="input-producto"
              type="text"
              //placeholder="Marca"
              value={idMarca}
              onChange={(e) => setIdMarca(e.target.value)}
            />
            <label className="label-producto">
              Ingrese nombre del Producto:{" "}
            </label>
            <input
              className="input-producto"
              type="text"
              // placeholder="Nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
            />
            <label className="label-producto">
              Ingrese descripcion del Producto:{" "}
            </label>
            <input
              className="input-producto"
              type="text"
              // placeholder="descripcion"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
            />
            <label className="label-producto">
              Ingrese precio de venta del Producto:{" "}
            </label>
            <input
              className="input-producto"
              type="text"
              // placeholder="Precio de venta"
              value={precioVenta}
              onChange={(e) => setPrecioVenta(e.target.value)}
            />
            <label className="label-producto">
              Ingrese cantidad del Producto:{" "}
            </label>
            <input
              className="input-producto"
              type="text"
              // placeholder="estado"
              value={cantidadDisponible}
              onChange={(e) => setcantidadDisponible(e.target.value)}
            />
            <button
              className="boton-producto"
              onClick={(e) => {
                e.preventDefault();
                const productos = {
                  idCategoria,
                  idMarca,
                  nombre,
                  descripcion,
                  precioVenta,
                  cantidadDisponible,
                };
                mutate(productos);
              }}
            >
              Crear Producto
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default CrearProducto;
