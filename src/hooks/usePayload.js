import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import API from "../lib/axiosConfig";

const logeo = async (credenciales) => {
  const response = await API.post("/jwt", credenciales);
  return response.data;
};

export const usePayload = () => {
  const queryClient = useQueryClient();

  const { data: usuario, isLoading } = useQuery({
    queryKey: ["usuario"],
    queryFn: logeo,
    retry: false,
    enabled: true,
  });

  const loginMutation = useMutation({
    mutationFn: logeo,
    onSuccess: (data) => {
      queryClient.setQueryData(["usuario"], data.usuario);
    },
    onError: (error) => {
      console.error("Login error:", error);
    },
  });

  return {
    usuario,
    isLoading,
    login: loginMutation.mutate,
  };
};
