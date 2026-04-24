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
  reason: string;
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
    return <div className="text-center py-12 text-gray-500">Loading...</div>;
  }

  if (!profile) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Profile</h1>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Name:</span> <span className="font-medium">{profile.name}</span>
          </div>
          <div>
            <span className="text-gray-500">Email:</span> <span className="font-medium">{profile.email}</span>
          </div>
          <div>
            <span className="text-gray-500">Role:</span> <span className="font-medium">{profile.role}</span>
          </div>
          <div>
            <span className="text-gray-500">Balance:</span>{" "}
            <span className="font-medium">🪙 {profile.coin_balance}</span>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Orders</h2>
        {profile.orders.length === 0 ? (
          <p className="text-gray-500 text-sm">No orders yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="text-left px-3 py-2 font-medium">Product</th>
                  <th className="text-left px-3 py-2 font-medium">Status</th>
                  <th className="text-left px-3 py-2 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {profile.orders.map((o) => (
                  <tr key={o.id} className="border-t border-gray-100">
                    <td className="px-3 py-2">{o.product_name}</td>
                    <td className="px-3 py-2">
                      <span className="text-green-600">{o.status}</span>
                    </td>
                    <td className="px-3 py-2 text-gray-500">
                      {new Date(o.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Transactions</h2>
        {profile.transactions.length === 0 ? (
          <p className="text-gray-500 text-sm">No transactions yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="text-left px-3 py-2 font-medium">Type</th>
                  <th className="text-left px-3 py-2 font-medium">Amount</th>
                  <th className="text-left px-3 py-2 font-medium">Reason</th>
                  <th className="text-left px-3 py-2 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {profile.transactions.map((t) => (
                  <tr key={t.id} className="border-t border-gray-100">
                    <td className="px-3 py-2">
                      <span
                        className={
                          t.type === "SPENT"
                            ? "text-red-600"
                            : "text-green-600"
                        }
                      >
                        {t.type}
                      </span>
                    </td>
                    <td className="px-3 py-2">🪙 {t.amount}</td>
                    <td className="px-3 py-2">{t.reason || "-"}</td>
                    <td className="px-3 py-2 text-gray-500">
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