import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePayload } from "../hooks/usePayload";

const Login = () => {
  const { login } = usePayload();

  const [nombre, setNombre] = useState("");
  const [contrasenia, setContrasenia] = useState("");

  const navegar = useNavigate();

  const manejadorSubir = (e) => {
    e.preventDefault();

    login(
      { nombre, contrasenia },
      {
        onSuccess: () => {
          navegar("/Bienvenido");
        },
        onError: (error) => {
          // Handle login error (show message to user)
          console.error(error);
        },
      }
    );
  };

  return (
    <form onSubmit={manejadorSubir}>
      <input
        type="text"
        placeholder="nombre"
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
      />
      <input
        type="text"
        placeholder="contrasenia"
        value={contrasenia}
        onChange={(e) => setContrasenia(e.target.value)}
      />
      <button>Entrar</button>
    </form>
  );
};

export default Login;
