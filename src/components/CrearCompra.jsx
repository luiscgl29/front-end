import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

const registrarCompra = async (compraData) => {
  const res = await axios.post("http://localhost:3000/compras", compraData);
  return res.data;
};

export const useRegistrarCompra = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: registrarCompra,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["productos"] });
      queryClient.invalidateQueries({ queryKey: ["compras"] });
      alert("Compra registrada y stock actualizado exitosamente.");
    },
    onError: (error) => {
      const mensajeError = error.response?.data?.detalle || error.message;
      alert(`ERROR: ${mensajeError}`);
    },
  });
};
