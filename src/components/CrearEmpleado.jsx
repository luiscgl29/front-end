import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import API from "../lib/axiosLocal";
import "../css/CrearEmpleado.css";

const CrearEmpleado = () => {
  const [idRol, setIdRol] = useState("");
  const [nombre, setNombre] = useState("");
  const [user, setUser] = useState("");
  const [contrasenia, setContrasenia] = useState("");
  const [correo, setCorreo] = useState("");
  const [salario, setSalario] = useState("");

  useEffect(() => {
    document.title = "Crear Empleado";
  }, []);
  
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
    <section>
      <form>
        <input
          type="text"
          placeholder="Nombre Usuario"
          value={user}
          onChange={(e) => setUser(e.target.value)}
        />
        <input
          type="text"
          placeholder="Nombre Empleado"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={contrasenia}
          onChange={(e) => setContrasenia(e.target.value)}
        />
        <input
          type="text"
          placeholder="Correo"
          value={correo}
          onChange={(e) => setCorreo(e.target.value)}
        />
        <input
          type="text"
          placeholder="Salario"
          value={salario}
          onChange={(e) => setSalario(e.target.value)}
        />
        <input
          type="text"
          placeholder="Rol Empleado"
          value={idRol}
          onChange={(e) => setIdRol(e.target.value)}
        />
        <button
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
            mutate(empleados);
          }}
        >
          Crear Empleado
        </button>
      </form>
    </section>
  );
};

export default CrearEmpleado;
