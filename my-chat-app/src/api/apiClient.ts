import axios from "axios";

const apiClient = axios.create({
  baseURL: "http://localhost:6969/",
  timeout: 1000,
  withCredentials: true, // Send cookies when making requests
  headers: {
    "X-Client-Type": "web", // Let the server know that this is a web client
  },
});

// Response interceptor to refresh token on receiving a 401
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      //   const refreshToken = await getRefreshToken(); // Implement this function to get your refresh token from secure storage
      //   console.log("refreshToken", refreshToken);
      try {
        // Attempt to get a new access token using the refresh token
        await axios.post(
          "http://localhost:6969/refresh_token",
          {},
          {
            withCredentials: true,
          }
        );

        return apiClient(originalRequest); // Retry the original request with the new token
      } catch (refreshError) {
        // Handle failed refresh here (e.g., redirect to login or show a message)
        console.error("Unable to refresh token", refreshError);
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
