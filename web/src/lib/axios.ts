import axios from "axios";
import { auth } from "./firebase";

// If no env is provided, default to local in dev and Render backend in prod.
const defaultBase =
  import.meta.env.VITE_API_BASE_URL ??
  (import.meta.env.DEV
    ? "http://localhost:4000/api"
    : "https://app-caraban-backend.onrender.com/api");

const api = axios.create({ baseURL: defaultBase });

api.interceptors.request.use(async (config) => {
  const user = auth.currentUser;
  if (user) {
    const token = await user.getIdToken();
    // Axios 1.x expects AxiosHeaders; mutate existing headers to avoid type mismatch
    if (!config.headers) config.headers = {};
    (config.headers as any).Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
