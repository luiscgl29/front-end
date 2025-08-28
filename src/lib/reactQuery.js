import { QueryClient } from "@tanstack/react-query";

const reactQueryCliente = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

export default reactQueryCliente;
