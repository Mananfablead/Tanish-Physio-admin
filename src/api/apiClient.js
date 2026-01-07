import axios from "axios";

/* =========================
   AXIOS INSTANCE
========================= */
console.log("BASE URL 👉", import.meta.env.VITE_API_BASE_URL);
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL||"http://localhost:5000",
  headers: {
    "Content-Type": "application/json",
  },
});

/* =========================
   REQUEST INTERCEPTOR
========================= */
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/* =========================
   API ENDPOINTS
========================= */
export const API = {
  // 🔐 Auth
  LOGIN: "/admin/login",
  REGISTER: "/auth/register",
  PROFILE: "/auth/profile",

  // 🛒 Products
  PRODUCTS: "/products",
  PRODUCT_BY_ID: (id) => `/products/${id}`,

  // 🏪 Shops
  SHOPS: "/shops",
  SHOP_BY_ID: (id) => `/shops/${id}`,

  // 📦 Orders
  ORDERS: "/orders",
  ORDER_BY_ID: (id) => `/orders/${id}`,

  // 👤 Users (Admin)
  USERS: "/users",
  USER_BY_ID: (id) => `/users/${id}`,
};

export default apiClient;
