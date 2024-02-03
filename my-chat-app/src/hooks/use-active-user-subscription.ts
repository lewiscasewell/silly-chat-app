import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:6969", { withCredentials: true });

const useActiveUserSubscription = () => {
  const queryClient = useQueryClient();
  useEffect(() => {
    socket.on("connect", (activeUser) => {
      console.log("active-user", activeUser);
      queryClient.setQueryData(["active-users"], (oldData) => {
        return [...oldData, activeUser];
      });
    });

    return () => {
      socket.off("active-user");
    };
  }, [queryClient]);
};
