/** Centralized Axios instance with base configuration for all API requests. */
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000",
  withCredentials: true,
});

export default api;
