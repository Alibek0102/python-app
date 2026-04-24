"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getProfile } from "@/services/api";

interface Order {
  id: number;
  product_name: string;
  status: string;
  created_at: string;
}

interface Transaction {
  id: number;
  amount: number;
  type: string;
  reason: string | null;
  admin_name: string | null;
  template_name: string | null;
  created_at: string;
}

interface ProfileData {
  id: number;
  name: string;
  email: string;
  role: string;
  coin_balance: number;
  created_at: string;
  orders: Order[];
  transactions: Transaction[];
}

const roleBadge: Record<string, string> = {
  SUPERADMIN: "bg-duo-purpleLight text-duo-purpleDark",
  ADMIN: "bg-duo-blueLight text-duo-blueDark",
  USER: "bg-duo-greenLight text-duo-greenDark",
};

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    getProfile()
      .then((data) => setProfile(data))
      .catch(() => router.push("/login"))
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) {
    return <div className="text-center py-16 text-gray-400 font-bold">Loading…</div>;
  }
  if (!profile) return null;

  return (
    <div className="space-y-6">
      <div className="card-duo p-6 bg-gradient-to-br from-duo-yellowLight to-white">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-black text-duo-grayDark">
                {profile.name}
              </h1>
              <span
                className={`badge-duo ${roleBadge[profile.role] || roleBadge.USER}`}
              >
                {profile.role}
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-1">{profile.email}</p>
          </div>
          <div className="text-right">
            <div className="text-xs font-black uppercase text-gray-400">Balance</div>
            <div className="pill-coin text-xl px-4 py-2">
              <span className="text-2xl">🪙</span>
              <span>{profile.coin_balance}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="card-duo p-6">
        <h2 className="text-xl font-black text-duo-grayDark mb-4">Orders</h2>
        {profile.orders.length === 0 ? (
          <p className="text-gray-400 font-bold">No orders yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase text-gray-400 font-black">
                  <th className="px-3 py-2">Product</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Date</th>
                </tr>
              </thead>
              <tbody>
                {profile.orders.map((o) => (
                  <tr key={o.id} className="border-t-2 border-gray-100">
                    <td className="px-3 py-3 font-bold">{o.product_name}</td>
                    <td className="px-3 py-3">
                      <span className="badge-duo bg-duo-greenLight text-duo-greenDark">
                        {o.status}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-gray-500">
                      {new Date(o.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="card-duo p-6">
        <h2 className="text-xl font-black text-duo-grayDark mb-4">Transactions</h2>
        {profile.transactions.length === 0 ? (
          <p className="text-gray-400 font-bold">No transactions yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase text-gray-400 font-black">
                  <th className="px-3 py-2">Type</th>
                  <th className="px-3 py-2 text-right">Amount</th>
                  <th className="px-3 py-2">Template</th>
                  <th className="px-3 py-2">By admin</th>
                  <th className="px-3 py-2">Reason</th>
                  <th className="px-3 py-2">Date</th>
                </tr>
              </thead>
              <tbody>
                {profile.transactions.map((t) => (
                  <tr key={t.id} className="border-t-2 border-gray-100">
                    <td className="px-3 py-3">
                      <span
                        className={`badge-duo ${
                          t.type === "EARNED"
                            ? "bg-duo-greenLight text-duo-greenDark"
                            : "bg-duo-redLight text-duo-redDark"
                        }`}
                      >
                        {t.type}
                      </span>
                    </td>
                    <td
                      className={`px-3 py-3 text-right font-black ${
                        t.type === "EARNED" ? "text-duo-greenDark" : "text-duo-redDark"
                      }`}
                    >
                      {t.type === "EARNED" ? "+" : "−"}
                      {t.amount} 🪙
                    </td>
                    <td className="px-3 py-3">{t.template_name || "—"}</td>
                    <td className="px-3 py-3">{t.admin_name || "—"}</td>
                    <td className="px-3 py-3">{t.reason || "—"}</td>
                    <td className="px-3 py-3 text-gray-500">
                      {new Date(t.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
