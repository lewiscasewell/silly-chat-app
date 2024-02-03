import { useMutation } from "@tanstack/react-query";
import apiClient from "../api/apiClient";

const useSendMessage = () => {
  const sendMessageMutation = useMutation({
    mutationFn: async (variables: { message: string }) => {
      apiClient.post("/send-message", {
        message: variables.message,
      });
    },
  });

  return sendMessageMutation;
};

export default useSendMessage;
