import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../lib/axiosLocal";

const CrearProveedor = () => {
  const irA = useNavigate();
  const [nombreEmpresa, setNombreEmpresa] = useState("");
  const [telefono, setTelefono] = useState("");
  const [direccion, setDireccion] = useState("");

  useEffect(() => {
    document.title = "Crear Proveedor";
  }, []);

  const queryClient = useQueryClient();
  const { mutate } = useMutation({
    mutationFn: async (proveedores) => {
      try {
        const respuesta = await API.post("/proveedores", {
          nombreEmpresa,
          telefono,
          direccion,
        });
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
      <div className="form-container">
        <div className="form-box">
          <h2 className="form-title">Ingrese los datos del proveedor</h2>
          <form>
            <label className="form-label">Ingrese nombre de la empresa </label>
            <input
              className="form-input"
              type="text"
              placeholder="Nombre de la empresa"
              value={nombreEmpresa}
              onChange={(e) => setNombreEmpresa(e.target.value)}
            />
            <label className="form-label">
              Ingrese telefono de la empresa:{" "}
            </label>
            <input
              className="form-input"
              type="text"
              placeholder="Telefono de la empresa"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
            />
            <label className="form-label">
              Ingrese direccion de la empresa:{" "}
            </label>
            <input
              className="form-input"
              type="text"
              placeholder="Direccion de la empresa"
              value={direccion}
              onChange={(e) => setDireccion(e.target.value)}
            />

            <button
              className="form-btn-primary"
              onClick={(e) => {
                e.preventDefault();
                const proveedores = {
                  nombreEmpresa,
                  telefono,
                  direccion,
                };
                mutate(proveedores);
              }}
            >
              Crear Proveedor
            </button>
            <button
              className="form-btn-secondary"
              onClick={(e) => {
                e.preventDefault();
                irA("/proveedores");
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

export default CrearProveedor;
