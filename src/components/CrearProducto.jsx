import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../lib/axiosLocal";

const CrearProducto = () => {
  const irA = useNavigate();
  const queryClient = useQueryClient();

  const [idCategoria, setIdCategoria] = useState("");
  const [idMarca, setIdMarca] = useState("");
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [precioVenta, setPrecioVenta] = useState("");
  const [cantidadDisponible, setcantidadDisponible] = useState("");

  // Estados para modal de categoría
  const [mostrarModalCategoria, setMostrarModalCategoria] = useState(false);
  const [nuevaCategoria, setNuevaCategoria] = useState({
    categoria: "",
    descripcion: "",
  });

  // Estados para modal de marca
  const [mostrarModalMarca, setMostrarModalMarca] = useState(false);
  const [nuevaMarca, setNuevaMarca] = useState({
    nombre: "",
  });

  useEffect(() => {
    document.title = "Crear Producto";
  }, []);

  const { data: categorias } = useQuery({
    queryKey: ["categorias"],
    queryFn: async () => {
      const respuesta = await API.get("/productos/categoria");
      return respuesta.data;
    },
  });

  const { data: marcas } = useQuery({
    queryKey: ["marcas"],
    queryFn: async () => {
      const respuesta = await API.get("/productos/marca");
      return respuesta.data;
    },
  });

  // Mutation para crear categoría
  const mutationCrearCategoria = useMutation({
    mutationFn: async (categoriaData) => {
      const res = await API.post("/productos/categoria", categoriaData);
      return res.data;
    },
    onSuccess: (data) => {
      console.log("Respuesta crear categoría:", data);
      alert("✅ Categoría creada con éxito");
      queryClient.invalidateQueries(["categorias"]);
      setMostrarModalCategoria(false);
      setNuevaCategoria({
        categoria: "",
        descripcion: "",
      });

      // Seleccionar automáticamente la nueva categoría
      // Ajusta según la estructura de tu respuesta del servidor
      const nuevoId = data?.idCategoria || data?.categoria?.idCategoria;
      if (nuevoId) {
        setIdCategoria(nuevoId.toString());
      }
    },
    onError: (err) => {
      console.error("Error al crear categoría:", err);
      const msg = err.response?.data?.mensaje || err.message;
      alert("❌ Error al crear categoría: " + msg);
    },
  });

  // Mutation para crear marca
  const mutationCrearMarca = useMutation({
    mutationFn: async (marcaData) => {
      const res = await API.post("/productos/marca", marcaData);
      return res.data;
    },
    onSuccess: (data) => {
      console.log("Respuesta crear marca:", data);
      alert("✅ Marca creada con éxito");
      queryClient.invalidateQueries(["marcas"]);
      setMostrarModalMarca(false);
      setNuevaMarca({
        nombre: "",
      });

      // Seleccionar automáticamente la nueva marca
      // Ajusta según la estructura de tu respuesta del servidor
      const nuevoId = data?.idMarca || data?.marca?.idMarca;
      if (nuevoId) {
        setIdMarca(nuevoId.toString());
      }
    },
    onError: (err) => {
      console.error("Error al crear marca:", err);
      const msg = err.response?.data?.mensaje || err.message;
      alert("❌ Error al crear marca: " + msg);
    },
  });

  const handleCrearCategoria = () => {
    if (!nuevaCategoria.categoria.trim()) {
      alert("El nombre de la categoría es obligatorio.");
      return;
    }
    mutationCrearCategoria.mutate({
      categoria: nuevaCategoria.categoria.trim(),
      descripcion: nuevaCategoria.descripcion.trim() || "",
    });
  };

  const handleCrearMarca = () => {
    if (!nuevaMarca.nombre.trim()) {
      alert("El nombre de la marca es obligatorio.");
      return;
    }
    mutationCrearMarca.mutate({
      nombre: nuevaMarca.nombre.trim(),
    });
  };

  const { mutate } = useMutation({
    mutationFn: async (productos) => {
      const respuesta = await API.post("/productos", productos);
      return respuesta.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["productos"]);
      alert("✅ Producto creado con éxito");
      irA("/productos");
    },
    onError: (err) => {
      console.error("Error al crear producto:", err);
      const msg = err.response?.data?.mensaje || err.message;
      alert("❌ Error al crear producto: " + msg);
    },
  });

  const handleCrearProducto = (e) => {
    e.preventDefault();

    // Validaciones
    if (!idCategoria) {
      alert("⚠️ Debe seleccionar una categoría");
      return;
    }
    if (!idMarca) {
      alert("⚠️ Debe seleccionar una marca");
      return;
    }
    if (!nombre.trim()) {
      alert("⚠️ El nombre del producto es obligatorio");
      return;
    }
    if (!precioVenta || isNaN(precioVenta) || Number(precioVenta) <= 0) {
      alert("⚠️ El precio de venta debe ser un número mayor a 0");
      return;
    }
    if (
      !cantidadDisponible ||
      isNaN(cantidadDisponible) ||
      Number(cantidadDisponible) < 0
    ) {
      alert("⚠️ La cantidad disponible debe ser un número mayor o igual a 0");
      return;
    }

    const productos = {
      idCategoria: Number(idCategoria),
      idMarca: Number(idMarca),
      nombre: nombre.trim(),
      descripcion: descripcion.trim() || null,
      precioVenta: Number(precioVenta),
      cantidadDisponible: Number(cantidadDisponible),
    };

    mutate(productos);
  };

  return (
    <>
      <div className="form-container">
        <div className="form-box">
          <h2 className="form-title">Ingrese los datos del producto</h2>
          <form>
            <div className="form-group">
              <label className="form-label">Categoría</label>
              <div style={{ display: "flex", gap: "10px" }}>
                <select
                  className="form-select"
                  value={idCategoria}
                  onChange={(e) => setIdCategoria(e.target.value)}
                  style={{ flex: 1 }}
                >
                  <option value="">Seleccione la categoría</option>
                  {categorias?.categorias?.map((categoria) => (
                    <option
                      key={categoria.idCategoria}
                      value={categoria.idCategoria}
                    >
                      {categoria.categoria}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setMostrarModalCategoria(true)}
                  className="btn-crear-compraventa"
                >
                  ➕
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Marca</label>
              <div style={{ display: "flex", gap: "10px" }}>
                <select
                  className="form-select"
                  value={idMarca}
                  onChange={(e) => setIdMarca(e.target.value)}
                  style={{ flex: 1 }}
                >
                  <option value="">Selecciona la marca</option>
                  {marcas?.marcas?.map((marca) => (
                    <option key={marca.idMarca} value={marca.idMarca}>
                      {marca.nombre}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setMostrarModalMarca(true)}
                  className="btn-crear-compraventa"
                >
                  ➕
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Nombre del Producto</label>
              <input
                className="form-input"
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Descripción del Producto</label>
              <input
                className="form-input"
                type="text"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Precio de Venta</label>
              <input
                className="form-input"
                type="number"
                step="0.01"
                min="0"
                value={precioVenta}
                onChange={(e) => setPrecioVenta(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Cantidad Disponible</label>
              <input
                className="form-input"
                type="number"
                min="0"
                value={cantidadDisponible}
                onChange={(e) => setcantidadDisponible(e.target.value)}
              />
            </div>

            <button className="form-btn-primary" onClick={handleCrearProducto}>
              Crear Producto
            </button>
            <button
              className="form-btn-secondary"
              onClick={(e) => {
                e.preventDefault();
                irA("/productos");
              }}
              style={{ backgroundColor: "#6c757d" }}
            >
              Cancelar
            </button>
          </form>
        </div>
      </div>

      {/* MODAL CREAR CATEGORÍA */}
      {mostrarModalCategoria && (
        <div
          className="modal-overlay-compraventa"
          onClick={() => setMostrarModalCategoria(false)}
        >
          <div
            className="modal-content-compraventa"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header-compraventa">
              <h2>Nueva Categoría</h2>
              <button
                className="modal-close-compraventa"
                onClick={() => setMostrarModalCategoria(false)}
              >
                ✕
              </button>
            </div>

            <div className="modal-body-compraventa">
              <label htmlFor="nuevaCategoriaNombre">
                Nombre de la Categoría *
              </label>
              <input
                id="nuevaCategoriaNombre"
                type="text"
                placeholder="Nombre de la categoría"
                value={nuevaCategoria.categoria}
                onChange={(e) =>
                  setNuevaCategoria({
                    ...nuevaCategoria,
                    categoria: e.target.value,
                  })
                }
                maxLength={45}
                required
                className="modal-input-compraventa"
              />

              <label htmlFor="nuevaCategoriaDescripcion">
                Descripción (opcional)
              </label>
              <input
                id="nuevaCategoriaDescripcion"
                type="text"
                placeholder="Descripción de la categoría"
                value={nuevaCategoria.descripcion}
                onChange={(e) =>
                  setNuevaCategoria({
                    ...nuevaCategoria,
                    descripcion: e.target.value,
                  })
                }
                maxLength={100}
                className="modal-input-compraventa"
              />
            </div>

            <div className="modal-footer-compraventa">
              <button
                type="button"
                onClick={() => setMostrarModalCategoria(false)}
                className="btn-cancelar-modal-compraventa"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleCrearCategoria}
                disabled={mutationCrearCategoria.isPending}
                className="btn-guardar-modal-compraventa"
              >
                {mutationCrearCategoria.isPending
                  ? "Guardando..."
                  : "💾 Guardar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CREAR MARCA */}
      {mostrarModalMarca && (
        <div
          className="modal-overlay-compraventa"
          onClick={() => setMostrarModalMarca(false)}
        >
          <div
            className="modal-content-compraventa"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header-compraventa">
              <h2>Nueva Marca</h2>
              <button
                className="modal-close-compraventa"
                onClick={() => setMostrarModalMarca(false)}
              >
                ✕
              </button>
            </div>

            <div className="modal-body-compraventa">
              <label htmlFor="nuevaMarcaNombre">Nombre de la Marca *</label>
              <input
                id="nuevaMarcaNombre"
                type="text"
                placeholder="Nombre de la marca"
                value={nuevaMarca.nombre}
                onChange={(e) =>
                  setNuevaMarca({
                    ...nuevaMarca,
                    nombre: e.target.value,
                  })
                }
                maxLength={45}
                required
                className="modal-input-compraventa"
              />
            </div>

            <div className="modal-footer-compraventa">
              <button
                type="button"
                onClick={() => setMostrarModalMarca(false)}
                className="btn-cancelar-modal-compraventa"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleCrearMarca}
                disabled={mutationCrearMarca.isPending}
                className="btn-guardar-modal-compraventa"
              >
                {mutationCrearMarca.isPending ? "Guardando..." : "💾 Guardar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CrearProducto;
