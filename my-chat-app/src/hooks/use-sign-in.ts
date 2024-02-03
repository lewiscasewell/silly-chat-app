import { useMutation } from "@tanstack/react-query";

const handleSignIn = async (username: string, password: string) => {
  const response = await fetch("http://localhost:6969/signin", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Client-Type": "web",
    },
    credentials: "include",
    body: JSON.stringify({ username, password }),
  });
  const data = await response.json();
  return data;
};

const useSignIn = () => {
  //   const navigate = useNavigate();
  const useSignInMutation = useMutation({
    mutationFn: async (variables: { username: string; password: string }) =>
      handleSignIn(variables.username, variables.password),
    // onSuccess: (data: { search: { redirect: string } }) => {
    //   navigate({ to: data.search.redirect });
    // },
    onError: (error) => {
      console.error(error);
    },
  });

  return useSignInMutation;
};

export default useSignIn;
