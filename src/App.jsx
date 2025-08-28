import Login from "./pages/Login.jsx";
import Bienvenido from "./pages/Bienvenido.jsx";
import { Route, Routes } from "react-router-dom";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login></Login>}></Route>
      <Route path="/Bienvenido" element={<Bienvenido></Bienvenido>}></Route>
    </Routes>
  );
}

export default App;
