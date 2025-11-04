import { Link } from "react-router-dom";

const NoEstaLogeado = () => {
  return (
    <main className="no-autorizado-simple">
      <h1>¡No estás logeado!</h1>
      <Link to={"/login"} className="link-login-simple">
        Ir a iniciar sesión
      </Link>
    </main>
  );
};

export default NoEstaLogeado;
