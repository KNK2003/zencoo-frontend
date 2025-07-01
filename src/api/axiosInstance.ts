// import axios from "axios";
// import { getJWT } from "../utils/secureStore";

// const instance = axios.create({
//   baseURL: "http://localhost:8080/api",
// });

// instance.interceptors.request.use(
//   async (config) => {
//     const token = await getJWT();
//     if (token) {
//       config.headers = config.headers || {};
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => Promise.reject(error)
// );

// export default instance;