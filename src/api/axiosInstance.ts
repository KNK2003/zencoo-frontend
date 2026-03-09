import axios from "axios";
import { getJWT } from "../utils/secureStore";

const getBaseUrl = () => {
  // Use localhost for development - this works for both web and mobile with adb reverse
  // For mobile without adb reverse, you might need your PC's IP address
  return "http://localhost:8080/api";
};

const instance = axios.create({
  baseURL: getBaseUrl(),
});

instance.interceptors.request.use(
  async (config) => {
    const token = await getJWT();
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default instance;
