import { useQuery } from "@tanstack/react-query";

type Message = {
  username: string;
  message: string;
  timestamp: string;
};

const useMessages = () => {
  return useQuery({
    queryKey: ["messages"],
    queryFn: async () => {
      const response = await fetch("http://localhost:6969/messages", {
        headers: {
          "X-Client-Type": "web",
        },
        credentials: "include",
      });
      const data = await response.json();
      return data as Message[];
    },
    select: (data) => {
      return data.sort((a, b) => {
        return (
          new Date(parseInt(a.timestamp)).getTime() -
          new Date(parseInt(b.timestamp)).getTime()
        );
      });
    },
  });
};

export default useMessages;
