import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../lib/axiosLocal";

const EditarProveedor = () => {
  const irA = useNavigate();
  const { id } = useParams();
  const [nombreEmpresa, setNombreEmpresa] = useState("");
  const [telefono, setTelefono] = useState("");
  const [direccion, setDireccion] = useState("");

  useEffect(() => {
    document.title = "Editar Proveedor";
  }, []);

  // Obtener el proveedor
  const { data: proveedorData, isLoading: cargandoProveedor } = useQuery({
    queryKey: ["proveedor", id],
    queryFn: async () => {
      const respuesta = await API.get(`/proveedores/${id}`);
      return respuesta.data;
    },
    enabled: !!id,
  });

  // Cargar datos del proveedor en el formulario
  useEffect(() => {
    if (proveedorData?.datosProveedor) {
      const proveedor = proveedorData.datosProveedor;
      setNombreEmpresa(proveedor.nombreEmpresa || "");
      setTelefono(proveedor.telefono || "");
      setDireccion(proveedor.direccion || "");
    }
  }, [proveedorData]);

  const queryClient = useQueryClient();
  const { mutate } = useMutation({
    mutationFn: async (proveedor) => {
      const respuesta = await API.put(`/proveedores/${id}`, proveedor);
      return respuesta.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["proveedores"],
      });
      queryClient.invalidateQueries({
        queryKey: ["proveedor", id],
      });
    },
  });

  if (cargandoProveedor) {
    return <h1 className="loading">Cargando...</h1>;
  }

  return (
    <>
      <div className="form-container">
        <div className="form-box">
          <h2 className="form-title">Editar Proveedor</h2>
          <form>
            <div className="form-group">
              <label className="form-label">Nombre de la Empresa: </label>
              <input
                className="form-input"
                type="text"
                value={nombreEmpresa}
                onChange={(e) => setNombreEmpresa(e.target.value)}
                placeholder="Nombre de la empresa"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Teléfono: </label>
              <input
                className="form-input"
                type="text"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                placeholder="Número de teléfono"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Direccion: </label>
              <input
                className="form-input"
                type="text"
                value={direccion}
                onChange={(e) => setDireccion(e.target.value)}
                placeholder="Direccion de la empresa"
              />
            </div>
            <button
              className="form-btn-primary"
              onClick={(e) => {
                e.preventDefault();
                const proveedor = {
                  nombreEmpresa,
                  telefono,
                  direccion,
                };
                mutate(proveedor, {
                  onSuccess: () => {
                    irA("/proveedores");
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

export default EditarProveedor;
