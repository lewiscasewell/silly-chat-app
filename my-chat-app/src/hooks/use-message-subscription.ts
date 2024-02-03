import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:6969", { withCredentials: true });

const useMessageSubscription = () => {
  const queryClient = useQueryClient();
  useEffect(() => {
    socket.on("message", (message) => {
      console.log("message", message);
      queryClient.setQueryData(["messages"], (oldData) => {
        return [...oldData, { message, timestamp: Date.now() }];
      });
    });

    return () => {
      socket.off("message");
    };
  }, [queryClient]);
};

export default useMessageSubscription;
