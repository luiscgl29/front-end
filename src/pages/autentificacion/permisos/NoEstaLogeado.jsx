import { Link } from "react-router-dom";
const NoEstaLogeado = () => {
  return (
    <main>
      <h1>No esta logeado!</h1>
      <Link to={"/login"}>Ir a iniciar sesion</Link>
    </main>
  );
};

export default NoEstaLogeado;
