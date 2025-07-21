import axios from "axios";
const devorprod =
  import.meta.env.MODE === "development"
    ? "http://localhost:5001/api"
    : import.meta.env.VITE_SERVER_URL + "/api";
export const axiosInstance = axios.create({
  baseURL: devorprod,
  withCredentials: true,
});
