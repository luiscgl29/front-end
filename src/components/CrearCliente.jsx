import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../lib/axiosLocal";
// import "../css/CrearCliente.css";

const CrearCliente = () => {
  const irA = useNavigate();
  const [nombre, setNombre] = useState("");
  const [direccion, setDireccion] = useState("");
  const [telefono, setTelefono] = useState("");
  const [saldo, setSaldo] = useState("");
  const [nitCliente, setNitCliente] = useState("");
  useEffect(() => {
    document.title = "Crear Cliente";
  }, []);

  const queryClient = useQueryClient();
  const { mutate } = useMutation({
    mutationFn: async (clientes) => {
      try {
        const respuesta = await API.post("/clientes", clientes);
      } catch (error) {
        console.error(error);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryClient: ["clientes"],
      });
    },
  });

  return (
    <>
      <div className="clientes">
        <div className="caja-clientes">
          <h2 className="titulo-formulario">Ingrese los datos del producto</h2>
          <form>
            <label className="label-cliente">Ingrese nombre del cliente </label>
            <input
              className="input-cliente"
              type="text"
              placeholder="Nombre del Cliente"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
            />
            <label className="label-cliente">
              Ingrese la direccion del Cliente{" "}
            </label>
            <input
              className="input-cliente"
              type="text"
              placeholder="Direccion del Cliente"
              value={direccion}
              onChange={(e) => setDireccion(e.target.value)}
            />
            <label className="label-cliente">
              Ingrese el telefono del Cliente{""}
            </label>
            <input
              className="input-cliente"
              type="text"
              placeholder="Telefono del Cliente"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
            />
            <label className="label-cliente">
              Ingrese el saldo del Cliente{" "}
            </label>
            <input
              className="input-cliente"
              type="text"
              placeholder="Saldo del Cliente"
              value={saldo}
              onChange={(e) => setSaldo(e.target.value)}
            />
            <label className="label-cliente">Ingrese el NIT del Cliente</label>
            <input
              className="input-cliente"
              type="text"
              placeholder="NIT del Cliente"
              value={nitCliente}
              onChange={(e) => setNitCliente(e.target.value)}
            />
            <button
              className="boton-cliente"
              onclick={(e) => {
                e.preventDefault();
                const clientes = {
                  nombre,
                  direccion,
                  telefono,
                  saldo,
                  nitCliente,
                };
                mutate(clientes);
              }}
            >
              Crear Cliente
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default CrearCliente;
