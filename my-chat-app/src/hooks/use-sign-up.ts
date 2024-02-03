import { useMutation } from "@tanstack/react-query";

const useSignUp = () => {
  return useMutation({
    mutationFn: async (variables: { username: string; password: string }) => {
      const response = await fetch("http://localhost:6969/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Client-Type": "web",
        },
        credentials: "include",
        body: JSON.stringify(variables),
      });
      const data = await response.json();
      return data;
    },
  });
};

export default useSignUp;
