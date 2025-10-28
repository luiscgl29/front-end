import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import API from "../lib/axiosLocal";
import { useNavigate } from "react-router-dom";

const CrearEmpleado = () => {
  const irA = useNavigate();
  const [idRol, setIdRol] = useState("");
  const [nombre, setNombre] = useState("");
  const [user, setUser] = useState("");
  const [contrasenia, setContrasenia] = useState("");
  const [correo, setCorreo] = useState("");
  const [salario, setSalario] = useState("");

  useEffect(() => {
    document.title = "Crear Empleado";
  }, []);

  const { data: roles } = useQuery({
    queryKey: ["roles"],
    queryFn: async () => {
      const respuesta = await API.get("/roles");
      return respuesta.data;
    },
  });

  const queryClient = useQueryClient();
  const { mutate } = useMutation({
    mutationFn: async (empleados) => {
      try {
        const respuesta = await API.post("/empleados", empleados);
      } catch (e) {
        console.log(e);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["empleados"],
      });
    },
  });

  return (
    <div className="form-container">
      <div className="form-box">
        <h2 className="form-title">Ingrese los datos del empleado</h2>
        <form>
          <div className="form-group">
            <label className="form-label">Nombre de Usuario</label>
            <input
              className="form-input"
              type="text"
              placeholder="Ingrese nombre de usuario"
              value={user}
              onChange={(e) => setUser(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Nombre Completo</label>
            <input
              className="form-input"
              type="text"
              placeholder="Ingrese nombre completo del empleado"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Contraseña</label>
            <input
              className="form-input"
              type="password"
              placeholder="Ingrese contraseña"
              value={contrasenia}
              onChange={(e) => setContrasenia(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Correo Electrónico</label>
            <input
              className="form-input"
              type="email"
              placeholder="ejemplo@correo.com"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Salario</label>
            <input
              className="form-input"
              type="text"
              placeholder="Ingrese salario"
              value={salario}
              onChange={(e) => setSalario(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Rol del Usuario</label>
            <select
              className="form-select"
              value={idRol}
              onChange={(e) => setIdRol(e.target.value)}
            >
              <option value="">Seleccione el rol del usuario</option>
              {roles?.roles?.map((rol) => (
                <option key={rol.idRol} value={rol.idRol}>
                  {rol.nombreRol}
                </option>
              ))}
            </select>
          </div>

          <button
            className="form-btn-primary"
            onClick={(e) => {
              e.preventDefault();
              const empleados = {
                nombre,
                user,
                contrasenia,
                correo,
                salario,
                idRol,
              };
              mutate(empleados, {
                onSuccess: () => {
                  alert("Empleado Creado");
                  irA("/");
                },
              });
            }}
          >
            Crear Empleado
          </button>
        </form>
      </div>
    </div>
  );
};

export default CrearEmpleado;
