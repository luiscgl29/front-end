import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

// 1. Función para enviar los datos de venta al backend
const registrarVenta = async (ventaData) => {
  const response = await axios.post("http://localhost:3000/ventas", ventaData);
  return response.data;
};

export const useRegistrarVenta = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: registrarVenta,
    // 2. Después del éxito, invalidar consultas
    onSuccess: () => {
      // Invalida la lista de productos para recargar el stock actualizado
      queryClient.invalidateQueries({ queryKey: ["productos"] });
      queryClient.invalidateQueries({ queryKey: ["ventas"] }); // Para reportes
      alert("Venta realizada y stock descontado exitosamente.");
    },
    // 3. Manejo de errores
    onError: (error) => {
      const mensajeError = error.response?.data?.detalle || error.message;
      alert(`ERROR: ${mensajeError}`);
    },
  });
};
