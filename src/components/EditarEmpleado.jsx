import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../lib/axiosLocal";

const EditarEmpleado = () => {
  const irA = useNavigate();
  const { id } = useParams();
  const [idRol, setIdRol] = useState("");
  const [nombre, setNombre] = useState("");
  const [user, setUser] = useState("");
  const [correo, setCorreo] = useState("");
  const [salario, setSalario] = useState("");

  useEffect(() => {
    document.title = "Editar Empleado";
  }, []);

  // Obtener el empleado
  const { data: empleadoData, isLoading: cargandoEmpleado } = useQuery({
    queryKey: ["empleado", id],
    queryFn: async () => {
      const respuesta = await API.get(`/empleados/${id}`);
      return respuesta.data;
    },
    enabled: !!id,
  });

  // Cargar datos del empleado en el formulario
  useEffect(() => {
    if (empleadoData?.datosUsuario) {
      const empleado = empleadoData.datosUsuario;
      setIdRol(empleado.idRol?.toString() || "");
      setNombre(empleado.nombre || "");
      setUser(empleado.user || "");
      setCorreo(empleado.correo || "");
      setSalario(empleado.salario?.toString() || "");
    }
  }, [empleadoData]);

  // Obtener roles disponibles
  const { data: roles } = useQuery({
    queryKey: ["roles"],
    queryFn: async () => {
      const respuesta = await API.get("/roles");
      return respuesta.data;
    },
  });

  const queryClient = useQueryClient();
  const { mutate } = useMutation({
    mutationFn: async (empleado) => {
      const respuesta = await API.put(`/empleados/${id}`, empleado);
      return respuesta.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["empleados"],
      });
      queryClient.invalidateQueries({
        queryKey: ["empleado", id],
      });
    },
  });

  if (cargandoEmpleado) {
    return <h1 className="loading">Cargando...</h1>;
  }

  return (
    <>
      <div className="productos">
        <div className="caja-productos">
          <h2 className="titulo-formulario">Editar Empleado</h2>
          <form>
            <select value={idRol} onChange={(e) => setIdRol(e.target.value)}>
              <option value="">Seleccione el rol</option>
              {roles?.roles?.map((rol) => (
                <option key={rol.idRol} value={rol.idRol}>
                  {rol.nombreRol}
                </option>
              ))}
            </select>
            <label className="label-producto">Nombre del Empleado: </label>
            <input
              className="input-producto"
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
            />
            <label className="label-producto">Usuario: </label>
            <input
              className="input-producto"
              type="text"
              value={user}
              onChange={(e) => setUser(e.target.value)}
            />
            <label className="label-producto">Correo Electrónico: </label>
            <input
              className="input-producto"
              type="email"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
            />
            <label className="label-producto">Salario: </label>
            <input
              className="input-producto"
              type="text"
              value={salario}
              onChange={(e) => setSalario(e.target.value)}
            />
            <button
              className="boton-producto"
              onClick={(e) => {
                e.preventDefault();
                const empleado = {
                  idRol: Number(idRol) || null,
                  nombre,
                  user,
                  correo,
                  salario: Number(salario) || null,
                };
                mutate(empleado, {
                  onSuccess: () => {
                    irA("/");
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
                irA("/");
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

export default EditarEmpleado;
