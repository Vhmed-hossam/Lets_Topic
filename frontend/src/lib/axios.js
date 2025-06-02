import axios from "axios";
const devorprod =
  import.meta.env.MODE === "development" ? "http://localhost:5001/api" : "/api";
export const axiosInstance = axios.create({
  baseURL: devorprod,
  withCredentials: true,
});
