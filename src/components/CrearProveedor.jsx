import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../lib/axiosLocal";
import "../css/CrearProducto.css";

const CrearProducto = () => {
  const irA = useNavigate();
  const [nombreEmpresa, setNombreEmpresa] = useState("");
  const [telefono, setTelefono] = useState("");

  useEffect(() => {
    document.title = "Crear Proveedor";
  }, []);

  const queryClient = useQueryClient();
  const { mutate } = useMutation({
    mutationFn: async (proveedores) => {
      try {
        const respuesta = await API.post("/proveedores", productos);
      } catch (e) {
        console.error(e);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryClient: ["proveedores"],
      });
    },
  });

  return (
    <>
      <div className="productos">
        <div className="caja-proveedor">
          <h2 className="titulo-formulario">Ingrese los datos del proveedor</h2>
          <form>
            <label className="label-proveedor">
              Ingrese nombre de la empresa{" "}
            </label>
            <input
              className="input-proveedor"
              type="text"
              placeholder="Nombre de la empresa"
              value={nombreEmpresa}
              onChange={(e) => setNombreEmpresa(e.target.value)}
            />
            <label className="label-proveedor">
              Ingrese telefono de la empresa:{" "}
            </label>
            <input
              className="input-proveedor"
              type="text"
              placeholder="Telefono de la empresa"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
            />

            <button
              className="boton-proveedor"
              onClick={(e) => {
                e.preventDefault();
                const proveedores = {
                  nombre,
                  telefono,
                };
                mutate(proveedores);
              }}
            >
              Crear Proveedor
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default CrearProducto;
