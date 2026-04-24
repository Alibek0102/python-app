"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminProductList from "@/components/AdminProductList";
import AdminOrderList from "@/components/AdminOrderList";
import AdminProductForm from "@/components/AdminProductForm";
import AdminUserList from "@/components/AdminUserList";
import AdminUserForm from "@/components/AdminUserForm";
import AdminTemplateList, { CoinTemplate } from "@/components/AdminTemplateList";
import AdminTemplateForm, { TemplateFormData } from "@/components/AdminTemplateForm";
import AdminTreasuryPanel from "@/components/AdminTreasuryPanel";
import AdminCoinLog from "@/components/AdminCoinLog";
import {
  getMe,
  getAdminProducts,
  getAdminOrders,
  createAdminProduct,
  getAdminUsers,
  createAdminUser,
  getTemplates,
  createTemplate,
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

interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: string;
  coin_balance: number;
}

type Tab = "products" | "orders" | "users" | "templates" | "treasury" | "coinlog";

export default function AdminPage() {
  const [user, setUser] = useState<any>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [templates, setTemplates] = useState<CoinTemplate[]>([]);
  const [tab, setTab] = useState<Tab>("products");
  const [showProductForm, setShowProductForm] = useState(false);
  const [showUserForm, setShowUserForm] = useState(false);
  const [showTemplateForm, setShowTemplateForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    getMe()
      .then((data) => {
        if (data.role !== "ADMIN" && data.role !== "SUPERADMIN") {
          router.push("/");
          return;
        }
        setUser(data);
        fetchAll();
      })
      .catch(() => router.push("/login"))
      .finally(() => setLoading(false));
  }, [router]);

  const fetchAll = async () => {
    try {
      const [p, o, u, t] = await Promise.all([
        getAdminProducts(),
        getAdminOrders(),
        getAdminUsers(),
        getTemplates(),
      ]);
      setProducts(p);
      setOrders(o);
      setUsers(u);
      setTemplates(t);
    } catch (err) {
      console.error(err);
    }
  };

  const refreshUsers = async () => setUsers(await getAdminUsers());
  const refreshTemplates = async () => setTemplates(await getTemplates());

  const handleCreateProduct = async (data: any) => {
    await createAdminProduct(data);
    setShowProductForm(false);
    setProducts(await getAdminProducts());
  };

  const handleCreateUser = async (data: any) => {
    await createAdminUser(data);
    setShowUserForm(false);
    refreshUsers();
  };

  const handleCreateTemplate = async (data: TemplateFormData) => {
    await createTemplate(data);
    setShowTemplateForm(false);
    refreshTemplates();
  };

  if (loading) {
    return <div className="text-center py-16 text-gray-400 font-bold">Loading…</div>;
  }
  if (!user) return null;

  const isSuper = user.role === "SUPERADMIN";
  const allowedRoles: Array<"USER" | "ADMIN"> = isSuper ? ["USER", "ADMIN"] : ["USER"];

  const tabs: Array<{ id: Tab; label: string; super?: boolean }> = [
    { id: "products", label: "Products" },
    { id: "orders", label: "Orders" },
    { id: "users", label: "Users" },
    { id: "templates", label: "Templates", super: true },
    { id: "treasury", label: "Treasury", super: true },
    { id: "coinlog", label: "Coin Log" },
  ];

  return (
    <div className="space-y-6">
      <div className="card-duo p-6 bg-gradient-to-br from-duo-purpleLight to-white">
        <h1 className="text-3xl font-black text-duo-grayDark flex items-center gap-3 flex-wrap">
          Admin Dashboard
          {isSuper && (
            <span className="badge-duo bg-duo-purple text-white">⚡ SUPERADMIN</span>
          )}
        </h1>
        <p className="text-gray-600 mt-1">Manage products, users, coins & templates.</p>
      </div>

      <div className="flex gap-1 border-b-2 border-gray-100 overflow-x-auto">
        {tabs
          .filter((t) => !t.super || isSuper)
          .map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`tab-duo whitespace-nowrap ${
                tab === t.id ? "tab-duo-active" : ""
              }`}
            >
              {t.label}
            </button>
          ))}
      </div>

      {tab === "products" && (
        <div className="space-y-4">
          {!showProductForm && (
            <button onClick={() => setShowProductForm(true)} className="btn-duo">
              + Add Product
            </button>
          )}
          {showProductForm && (
            <AdminProductForm
              onSubmit={handleCreateProduct}
              onCancel={() => setShowProductForm(false)}
            />
          )}
          <AdminProductList products={products} onRefresh={fetchAll} />
        </div>
      )}

      {tab === "orders" && <AdminOrderList orders={orders} />}

      {tab === "users" && (
        <div className="space-y-4">
          {!showUserForm && (
            <button onClick={() => setShowUserForm(true)} className="btn-duo">
              + Add User
            </button>
          )}
          {showUserForm && (
            <AdminUserForm
              onSubmit={handleCreateUser}
              onCancel={() => setShowUserForm(false)}
              allowedRoles={allowedRoles}
            />
          )}
          <AdminUserList users={users} currentUserId={user.id} onRefresh={refreshUsers} />
        </div>
      )}

      {tab === "templates" && isSuper && (
        <div className="space-y-4">
          {!showTemplateForm && (
            <button onClick={() => setShowTemplateForm(true)} className="btn-duo">
              + Add Template
            </button>
          )}
          {showTemplateForm && (
            <AdminTemplateForm
              onSubmit={handleCreateTemplate}
              onCancel={() => setShowTemplateForm(false)}
            />
          )}
          <AdminTemplateList templates={templates} onRefresh={refreshTemplates} />
        </div>
      )}

      {tab === "treasury" && isSuper && <AdminTreasuryPanel />}

      {tab === "coinlog" && <AdminCoinLog />}
    </div>
  );
}
