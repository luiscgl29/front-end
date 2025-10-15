import API from "../../lib/axiosLocal";
import { useQuery } from "@tanstack/react-query";

export const useAutentificacion = () => {
  return useQuery({
    queryKey: ["usuario_actual"],
    queryFn: async () => {
      try {
        const respuesta = await API.get("/empleados/identidad");
        return respuesta.data;
      } catch (error) {
        throw new Error("No ha iniciado sesion");
      }
    },
  });
};
