import { ReactNode, createContext, useContext, useEffect } from "react";
import { io } from "socket.io-client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "../api/apiClient";

// Create the context
const AuthContext = createContext<{
  isAuthenticated: boolean;
  isLoading: boolean;
}>({
  isAuthenticated: false,
  isLoading: true,
});

// Assuming your Socket.IO server is the same as your API server
const socket = io("http://localhost:6969", {
  withCredentials: true,
  extraHeaders: { "socket-type": "auth" },
});

// Provider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const queryClient = useQueryClient();

  const authenticatedQuery = useQuery({
    queryKey: ["is-authenticated"],
    queryFn: async () => {
      try {
        await apiClient.get("is-authenticated");
        return true;
      } catch (error) {
        return false;
      }
    },
    initialData: false,
  });

  useEffect(() => {
    // Listen for authentication changes
    socket.on("auth_change", (data) => {
      // console.log(data);
      if (data.status === "logged_in") {
        queryClient.setQueryData(["is-authenticated"], true);
      } else if (data.status === "logged_out") {
        queryClient.setQueryData(["is-authenticated"], false);
      }
    });

    return () => {
      socket.off("auth_change");
    };
  }, [queryClient, authenticatedQuery.data]);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: authenticatedQuery.data,
        isLoading: authenticatedQuery.isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);
