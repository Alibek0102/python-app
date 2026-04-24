import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

export default api;

export const loginUser = async (email: string, password: string) => {
  const res = await api.post("/auth/login", { email, password });
  return res.data;
};

export const logoutUser = async () => {
  const res = await api.post("/auth/logout");
  return res.data;
};

export const getMe = async () => {
  const res = await api.get("/auth/me");
  return res.data;
};

export const getProducts = async () => {
  const res = await api.get("/products");
  return res.data;
};

export const createOrder = async (productId: number) => {
  const res = await api.post("/orders", { product_id: productId });
  return res.data;
};

export const getProfile = async () => {
  const res = await api.get("/profile/profile");
  return res.data;
};

export const getAdminProducts = async () => {
  const res = await api.get("/admin/products");
  return res.data;
};

export const createAdminProduct = async (data: any) => {
  const res = await api.post("/admin/products", data);
  return res.data;
};

export const updateAdminProduct = async (id: number, data: any) => {
  const res = await api.put(`/admin/products/${id}`, data);
  return res.data;
};

export const deleteAdminProduct = async (id: number) => {
  const res = await api.delete(`/admin/products/${id}`);
  return res.data;
};

export const getAdminOrders = async () => {
  const res = await api.get("/admin/orders");
  return res.data;
};