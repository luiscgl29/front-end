import Login from "./pages/Login.jsx";
import Empleados from "./pages/Empleados.jsx";
import CrearEmpleado from "./components/CrearEmpleado.jsx";
import EditarEmpleado from "./components/EditarEmpleado.jsx";
import Productos from "./pages/Productos.jsx";
import CrearProducto from "./components/CrearProducto.jsx";
import EditarProducto from "./components/EditarProducto.jsx";
import Clientes from "./pages/Clientes.jsx";
import CrearCliente from "./components/CrearCliente.jsx";
import EditarCliente from "./components/EditarCliente.jsx";
import Proveedores from "./pages/Proveedores.jsx";
import CrearProveedor from "./components/CrearProveedor.jsx";
import EditarProveedor from "./components/EditarProveedor.jsx";
import Compras from "./pages/Compras.jsx";
import Ventas from "./pages/Ventas.jsx";
import Menu from "./pages/autentificacion/Menu.jsx";
import SoloAdmin from "./pages/autentificacion/permisos/SoloAdmin.jsx";
import AccesosVendedor from "./pages/autentificacion/permisos/AccesosVendedor.jsx";
import AccesosBodeguero from "./pages/autentificacion/permisos/AccesosBodeguero.jsx";
import ReportesCompras from "./pages/reportes/ReportesCompras.jsx";
import ReportesVentas from "./pages/reportes/ReportesVentas.jsx";
import Lotes from "./pages/lotes/Lotes.jsx";
import CrearLote from "./pages/lotes/CrearLote.jsx";
import EditarLote from "./pages/lotes/EditarLotes.jsx";
import Graficos from "./pages/Graficos.jsx";
import { Route, Routes } from "react-router-dom";
import GraficosMayoristas from "./pages/GraficosMayoristas.jsx";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login></Login>}></Route>
      <Route path="/" element={<Menu />}>
        <Route element={<SoloAdmin />}>
          {/* Empleados */}
          <Route index={true} element={<Empleados />} />
          <Route path="empleados/crear" element={<CrearEmpleado />} />
          <Route path="empleados/editar/:id" element={<EditarEmpleado />} />
          {/* reportes */}
          <Route path="reportes/ventas" element={<ReportesVentas />} />
          <Route path="reportes/compras" element={<ReportesCompras />} />
          <Route path="graficosMinoristas" element={<Graficos />} />
          <Route path="graficosMayoristas" element={<GraficosMayoristas />} />
        </Route>
        <Route element={<AccesosBodeguero />}>
          {/* Lotes */}
          <Route path="lotes">
            <Route index={true} element={<Lotes />} />
            <Route path="crear" element={<CrearLote />} />
            <Route path="editar/:id" element={<EditarLote />} />
          </Route>
          {/* Productos */}
          <Route path="productos">
            <Route index={true} element={<Productos />} />
            <Route path="crear" element={<CrearProducto />} />
            <Route path="editar/:id" element={<EditarProducto />} />
          </Route>
          {/* Compras */}
          <Route path="compras" element={<Compras />} />
          {/* Proveedores */}
          <Route path="proveedores">
            <Route index={true} element={<Proveedores />} />
            <Route path="crear" element={<CrearProveedor />} />
            <Route path="editar/:id" element={<EditarProveedor />} />
          </Route>
        </Route>
        <Route element={<AccesosVendedor />}>
          {/* Clientes */}
          <Route path="clientes">
            <Route index={true} element={<Clientes />} />
            <Route path="crearCliente" element={<CrearCliente />} />
            <Route path="editar/:id" element={<EditarCliente />} />
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
