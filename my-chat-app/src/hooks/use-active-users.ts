import apiClient from "@/api/apiClient";
import { useQuery } from "@tanstack/react-query";

const useActiveUsers = () => {
  return useQuery({
    queryKey: ["active-users"],
    queryFn: async () => {
      const response = await apiClient.get("active-users");
      const data = await response.data;
      return data as { username: string; socketId: string }[];
    },
    select: (data) => {
      // remove duplicate username unless the username is 'anonymous'
      return data.filter(
        (user, index, self) =>
          index === self.findIndex((t) => t.username === user.username)
      );
    },
  });
};

export default useActiveUsers;
