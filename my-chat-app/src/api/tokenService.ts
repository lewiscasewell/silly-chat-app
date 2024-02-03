const getRefreshToken = async () => {
  const refreshToken = localStorage.getItem("refresh-token");
  return refreshToken;
};
const saveAccessToken = (accessToken: string) => {
  localStorage.setItem("access-token", accessToken);
};

export { getRefreshToken, saveAccessToken };
