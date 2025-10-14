import Login from "./pages/Login.jsx";
import Home from "./pages/Home.jsx";
import Empleados from "./pages/Empleados.jsx";
import CrearEmpleado from "./components/CrearEmpleado.jsx";
import Productos from "./pages/Productos.jsx";
import CrearProducto from "./components/CrearProducto.jsx";
import Clientes from "./pages/Clientes.jsx";
import CrearCliente from "./components/Crearcliente.jsx";
import Proveedores from "./pages/Proveedores.jsx";
import CrearProveedor from "./components/CrearProveedor.jsx";
// import CrearVenta from "./components/CrearVenta.jsx";
import Compras from "./pages/Compras.jsx";
import Ventas from "./pages/Ventas.jsx";
import { Route, Routes } from "react-router-dom";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login></Login>}></Route>
      <Route path="/home" element={<Home></Home>}></Route>
      <Route path="/empleados" element={<Empleados></Empleados>}></Route>
      <Route path="/crearEmpleado" element={<CrearEmpleado />}></Route>
      <Route path="/productos" element={<Productos />}></Route>
      <Route path="/crearProducto" element={<CrearProducto />}></Route>
      <Route path="/clientes" element={<Clientes />}></Route>
      <Route path="/crearcliente" element={<CrearCliente />}></Route>
      <Route path="/proveedores" element={<Proveedores />}></Route>
      <Route path="/crearProveedor" element={<CrearProveedor />}></Route>
      {/* <Route path="/crearVenta" element={<CrearVenta />}></Route> */}
      <Route path="/Ventas" element={<Ventas />}></Route>
      <Route path="/compras" element={<Compras />}></Route>
    </Routes>
  );
}

export default App;
