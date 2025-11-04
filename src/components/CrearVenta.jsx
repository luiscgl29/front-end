import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

const registrarVenta = async (ventaData) => {
  const response = await axios.post("http://localhost:3000/ventas", ventaData);
  return response.data;
};

export const useRegistrarVenta = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: registrarVenta,
    onSuccess: () => {
      // Invalida la lista de productos para recargar el stock actualizado
      queryClient.invalidateQueries({ queryKey: ["productos"] });
      queryClient.invalidateQueries({ queryKey: ["ventas"] }); // Para reportes
      alert("Venta realizada y stock descontado exitosamente.");
    },
    onError: (error) => {
      const mensajeError = error.response?.data?.detalle || error.message;
      alert(`ERROR: ${mensajeError}`);
    },
  });
};
