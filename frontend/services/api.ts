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

export const getAdminUsers = async () => {
  const res = await api.get("/admin/users");
  return res.data;
};

export const createAdminUser = async (data: {
  name: string;
  email: string;
  password: string;
  role: string;
  coin_balance: number;
}) => {
  const res = await api.post("/admin/users", data);
  return res.data;
};

export const updateAdminUser = async (id: number, data: any) => {
  const res = await api.put(`/admin/users/${id}`, data);
  return res.data;
};

export const deleteAdminUser = async (id: number) => {
  const res = await api.delete(`/admin/users/${id}`);
  return res.data;
};

export const uploadAdminImage = async (file: File): Promise<string> => {
  const form = new FormData();
  form.append("file", file);
  const res = await api.post("/admin/upload", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data.url;
};

export const getAdminUserDetail = async (id: number) => {
  const res = await api.get(`/admin/users/${id}`);
  return res.data;
};

export const getTemplates = async () => {
  const res = await api.get("/admin/templates");
  return res.data;
};

export const createTemplate = async (data: {
  name: string;
  type: "AWARD" | "PENALTY";
  amount: number;
  description?: string;
  is_active?: boolean;
}) => {
  const res = await api.post("/admin/templates", data);
  return res.data;
};

export const updateTemplate = async (id: number, data: any) => {
  const res = await api.put(`/admin/templates/${id}`, data);
  return res.data;
};

export const deleteTemplate = async (id: number) => {
  const res = await api.delete(`/admin/templates/${id}`);
  return res.data;
};

export const applyTemplate = async (userId: number, templateId: number) => {
  const res = await api.post(`/admin/users/${userId}/apply-template`, {
    template_id: templateId,
  });
  return res.data;
};

export const getTreasury = async () => {
  const res = await api.get("/admin/treasury");
  return res.data;
};

export const issueTreasury = async (amount: number, note?: string) => {
  const res = await api.post("/admin/treasury/issue", { amount, note });
  return res.data;
};

export const getTreasuryOperations = async () => {
  const res = await api.get("/admin/treasury/operations");
  return res.data;
};

export const getCoinLog = async () => {
  const res = await api.get("/admin/coin-log");
  return res.data;
};