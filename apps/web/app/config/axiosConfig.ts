import axios from "axios";
const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000",
  timeout: 10000,
  headers: {
    "content-type": "application/json",
  },
});

export default axiosInstance;
