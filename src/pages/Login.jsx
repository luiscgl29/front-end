import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../lib/axiosLocal";
import "../css/Login.css";

const Login = () => {
  const irA = useNavigate();
  const [user, setUser] = useState("");
  const [contrasenia, setContrasenia] = useState("");

  const enviar = async () => {
    try {
      const respuesta = await API.post("/login", { user, contrasenia });
      if (respuesta.status === 200) {
        irA("/");
      }
    } catch (e) {
      console.error(e);
      alert("Contraseña incorrecta");
    }
  };

  return (
    <div className="login">
      <div className="caja-form">
        <h1 className="h1-Inicio">Iniciar Sesion</h1>
        <form>
          <label className="label-form">Usuario:</label>
          <input
            className="input-form"
            type="text"
            placeholder="Nombre"
            value={user}
            onChange={(e) => setUser(e.target.value)}
          />
          <label className="label-form">Contraseña: </label>
          <input
            className="input-form"
            type="password"
            placeholder="Contraseña"
            value={contrasenia}
            onChange={(e) => setContrasenia(e.target.value)}
          />
          <button
            className="boton-form"
            onClick={(e) => {
              e.preventDefault();
              enviar();
            }}
          >
            Enviar
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
