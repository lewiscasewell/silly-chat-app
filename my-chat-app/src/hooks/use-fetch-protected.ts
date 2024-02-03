import { useQuery } from "@tanstack/react-query";
import apiClient from "../api/apiClient";

const handleFetch200 = async () => {
  try {
    const response = await apiClient.get("/protected", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access-token")}`,
      },
    });

    return response.data;
  } catch (error) {
    console.error("Fetch failed", error);
  }
};

const useFetchProtected = () => {
  const fetchProtectedQuery = useQuery({
    queryKey: ["fetch-protected"],
    queryFn: handleFetch200,
    refetchInterval: 30 * 1000,
    select: (data) => {
      return { ...data, refetchedAt: new Date().toLocaleTimeString() };
    },
  });

  return fetchProtectedQuery;
};

export default useFetchProtected;
