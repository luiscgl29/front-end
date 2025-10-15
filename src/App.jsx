import Login from "./pages/Login.jsx";
import Empleados from "./pages/Empleados.jsx";
import CrearEmpleado from "./components/CrearEmpleado.jsx";
import Productos from "./pages/Productos.jsx";
import CrearProducto from "./components/CrearProducto.jsx";
import Clientes from "./pages/Clientes.jsx";
import CrearCliente from "./components/Crearcliente.jsx";
import Proveedores from "./pages/Proveedores.jsx";
import CrearProveedor from "./components/CrearProveedor.jsx";
import Compras from "./pages/Compras.jsx";
import Ventas from "./pages/Ventas.jsx";
import Menu from "./pages/autentificacion/Menu.jsx";
import SoloAdmin from "./pages/autentificacion/permisos/SoloAdmin.jsx";
import AccesosVendedor from "./pages/autentificacion/permisos/AccesosVendedor.jsx";
import AccesosBodeguero from "./pages/autentificacion/permisos/AccesosBodeguero.jsx";
import { Route, Routes } from "react-router-dom";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login></Login>}></Route>
      <Route path="/" element={<Menu />}>
        {/* Empleados */}
        <Route element={<SoloAdmin />}>
          <Route index={true} element={<Empleados />} />
          <Route path="empleados/crear" element={<CrearEmpleado />} />
        </Route>
        <Route element={<AccesosBodeguero />}>
          {/* Productos */}
          <Route path="productos">
            <Route index={true} element={<Productos />} />
            <Route path="crear" element={<CrearProducto />} />
          </Route>
          {/* Compras */}
          <Route path="compras" element={<Compras />} />
          {/* Proveedores */}
          <Route path="proveedores">
            <Route index={true} element={<Proveedores />} />
            <Route path="crear" element={<CrearProveedor />} />
          </Route>
        </Route>
        <Route element={<AccesosVendedor />}>
          {/* Clientes */}
          <Route path="clientes">
            <Route index={true} element={<Clientes />} />
            <Route path="crear" element={<CrearCliente />} />
          </Route>
          {/* Ventas */}
          <Route path="ventas" element={<Ventas />} />
        </Route>
        <Route path="*" element={<h1>Esta ruta no existe</h1>} />
      </Route>
    </Routes>
  );
}

export default App;
