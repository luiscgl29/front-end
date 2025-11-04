import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../lib/axiosLocal";

const EditarCliente = () => {
  const irA = useNavigate();
  const { id } = useParams();
  const [nombre, setNombre] = useState("");
  const [direccion, setDireccion] = useState("");
  const [telefono, setTelefono] = useState("");
  const [nitCliente, setNitCliente] = useState("");

  useEffect(() => {
    document.title = "Editar Cliente";
  }, []);

  // Obtener el cliente
  const { data: clienteData, isLoading: cargandoCliente } = useQuery({
    queryKey: ["cliente", id],
    queryFn: async () => {
      const respuesta = await API.get(`/clientes/${id}`);
      return respuesta.data;
    },
    enabled: !!id,
  });

  // Cargar datos del cliente en el formulario
  useEffect(() => {
    if (clienteData?.datosCliente) {
      const cliente = clienteData.datosCliente;
      setNombre(cliente.nombre || "");
      setDireccion(cliente.direccion || "");
      setTelefono(cliente.telefono || "");
      setNitCliente(cliente.nitCliente || "");
    }
  }, [clienteData]);

  const queryClient = useQueryClient();
  const { mutate } = useMutation({
    mutationFn: async (cliente) => {
      const respuesta = await API.put(`/clientes/${id}`, cliente);
      return respuesta.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["clientes"],
      });
      queryClient.invalidateQueries({
        queryKey: ["cliente", id],
      });
    },
  });

  if (cargandoCliente) {
    return <h1 className="loading">Cargando...</h1>;
  }

  return (
    <>
      <div className="form-container">
        <div className="form-box">
          <h2 className="form-title">Editar Cliente</h2>
          <form>
            <div className="form-group">
              <label className="form-label">Nombre del Cliente: </label>
              <input
                className="form-input"
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Dirección: </label>
              <input
                className="form-input"
                type="text"
                value={direccion}
                onChange={(e) => setDireccion(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Teléfono: </label>
              <input
                className="form-input"
                type="text"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">NIT del Cliente: </label>
              <input
                className="form-input"
                type="text"
                value={nitCliente}
                onChange={(e) => setNitCliente(e.target.value)}
              />
            </div>
            <button
              className="form-btn-primary"
              onClick={(e) => {
                e.preventDefault();
                const cliente = {
                  nombre,
                  direccion,
                  telefono,
                  nitCliente,
                };
                mutate(cliente, {
                  onSuccess: () => {
                    irA("/clientes");
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
                irA("/clientes");
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

export default EditarCliente;
