"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminProductList from "@/components/AdminProductList";
import AdminOrderList from "@/components/AdminOrderList";
import AdminProductForm from "@/components/AdminProductForm";
import {
  getMe,
  getAdminProducts,
  getAdminOrders,
  createAdminProduct,
} from "@/services/api";

interface Product {
  id: number;
  name: string;
  coin_price: number;
  stock: number;
  is_active: boolean;
}

interface Order {
  id: number;
  user_name: string;
  product_name: string;
  status: string;
  created_at: string;
}

export default function AdminPage() {
  const [user, setUser] = useState<any>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [tab, setTab] = useState<"products" | "orders">("products");
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    getMe()
      .then((data) => {
        if (data.role !== "ADMIN") {
          router.push("/");
          return;
        }
        setUser(data);
        fetchAdminData();
      })
      .catch(() => router.push("/login"))
      .finally(() => setLoading(false));
  }, [router]);

  const fetchAdminData = async () => {
    try {
      const [p, o] = await Promise.all([getAdminProducts(), getAdminOrders()]);
      setProducts(p);
      setOrders(o);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateProduct = async (data: any) => {
    await createAdminProduct(data);
    setShowForm(false);
    fetchAdminData();
  };

  if (loading) {
    return <div className="text-center py-12 text-gray-500">Loading...</div>;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>

      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setTab("products")}
          className={`px-4 py-2 text-sm font-medium border-b-2 ${
            tab === "products"
              ? "border-gray-900 text-gray-900"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Products
        </button>
        <button
          onClick={() => setTab("orders")}
          className={`px-4 py-2 text-sm font-medium border-b-2 ${
            tab === "orders"
              ? "border-gray-900 text-gray-900"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Orders
        </button>
      </div>

      {tab === "products" && (
        <div className="space-y-4">
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="px-4 py-2 bg-gray-900 text-white rounded-md text-sm hover:bg-gray-800"
            >
              Add Product
            </button>
          )}
          {showForm && (
            <AdminProductForm
              onSubmit={handleCreateProduct}
              onCancel={() => setShowForm(false)}
            />
          )}
          <AdminProductList products={products} onRefresh={fetchAdminData} />
        </div>
      )}

      {tab === "orders" && <AdminOrderList orders={orders} />}
    </div>
  );
}