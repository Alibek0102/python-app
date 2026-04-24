"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { getAdminUserDetail, getTemplates } from "@/services/api";
import { useUser } from "@/lib/userContext";
import ApplyTemplateButton from "@/components/ApplyTemplateButton";

interface UserTransaction {
  id: number;
  amount: number;
  type: "EARNED" | "SPENT";
  reason: string | null;
  admin_name: string | null;
  template_name: string | null;
  created_at: string;
}

interface UserDetail {
  id: number;
  name: string;
  email: string;
  role: string;
  coin_balance: number;
  created_at: string;
  transactions: UserTransaction[];
}

interface Template {
  id: number;
  name: string;
  type: "AWARD" | "PENALTY";
  amount: number;
  description: string | null;
  is_active: boolean;
}

const roleBadge: Record<string, string> = {
  SUPERADMIN: "bg-duo-purpleLight text-duo-purpleDark",
  ADMIN: "bg-duo-blueLight text-duo-blueDark",
  USER: "bg-duo-greenLight text-duo-greenDark",
};

export default function AdminUserDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const userId = Number(params.id);
  const { user: currentUser, loading: meLoading, refreshUser } = useUser();

  const [detail, setDetail] = useState<UserDetail | null>(null);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      const [d, t] = await Promise.all([getAdminUserDetail(userId), getTemplates()]);
      setDetail(d);
      setTemplates(t);
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Failed to load");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (meLoading) return;
    if (!currentUser) {
      router.push("/login");
      return;
    }
    if (currentUser.role !== "ADMIN" && currentUser.role !== "SUPERADMIN") {
      router.push("/");
      return;
    }
    load();
  }, [meLoading, currentUser, userId, router]);

  if (loading) {
    return <div className="text-center py-16 text-gray-400 font-bold">Loading…</div>;
  }
  if (error || !detail) {
    return (
      <div className="card-duo p-8 text-duo-redDark font-bold">
        {error || "Not found"}
      </div>
    );
  }

  const awards = templates.filter((t) => t.type === "AWARD" && t.is_active);
  const penalties = templates.filter((t) => t.type === "PENALTY" && t.is_active);

  const handleApplied = async () => {
    await load();
    await refreshUser();
  };

  return (
    <div className="space-y-6">
      <Link
        href="/admin"
        className="inline-flex items-center text-sm font-black uppercase tracking-wide text-duo-blue hover:text-duo-blueDark"
      >
        ← Back to admin
      </Link>

      <div className="card-duo p-6 bg-gradient-to-br from-duo-blueLight to-white">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-duo-green border-b-4 border-duo-greenDark flex items-center justify-center text-white text-3xl font-black">
              {detail.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-3xl font-black text-duo-grayDark">{detail.name}</h1>
              <div className="text-sm text-gray-500 mt-0.5 flex items-center gap-2 flex-wrap">
                {detail.email}
                <span className={`badge-duo ${roleBadge[detail.role] || roleBadge.USER}`}>
                  {detail.role}
                </span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs font-black uppercase text-gray-400">Balance</div>
            <div className="pill-coin text-xl px-4 py-2 mt-1">
              <span className="text-2xl">🪙</span>
              <span>{detail.coin_balance}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="card-duo p-5">
          <h2 className="font-black text-duo-grayDark text-lg mb-3 flex items-center gap-2">
            <span>⭐</span> Awards
          </h2>
          {awards.length === 0 ? (
            <p className="text-gray-400 font-bold text-sm">No active award templates.</p>
          ) : (
            <ul className="space-y-2">
              {awards.map((t) => (
                <li
                  key={t.id}
                  className="flex items-center justify-between gap-2 border-2 border-gray-100 rounded-2xl px-4 py-3"
                >
                  <div>
                    <div className="font-black text-duo-grayDark">{t.name}</div>
                    <div className="pill-coin mt-1">
                      <span>🪙</span>
                      <span>{t.amount}</span>
                    </div>
                  </div>
                  <ApplyTemplateButton
                    userId={detail.id}
                    userName={detail.name}
                    template={t}
                    onApplied={handleApplied}
                  />
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card-duo p-5">
          <h2 className="font-black text-duo-grayDark text-lg mb-3 flex items-center gap-2">
            <span>⚠️</span> Penalties
          </h2>
          {penalties.length === 0 ? (
            <p className="text-gray-400 font-bold text-sm">No active penalty templates.</p>
          ) : (
            <ul className="space-y-2">
              {penalties.map((t) => (
                <li
                  key={t.id}
                  className="flex items-center justify-between gap-2 border-2 border-gray-100 rounded-2xl px-4 py-3"
                >
                  <div>
                    <div className="font-black text-duo-grayDark">{t.name}</div>
                    <div className="pill-coin mt-1">
                      <span>🪙</span>
                      <span>{t.amount}</span>
                    </div>
                  </div>
                  <ApplyTemplateButton
                    userId={detail.id}
                    userName={detail.name}
                    template={t}
                    onApplied={handleApplied}
                  />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="card-duo p-5">
        <h2 className="font-black text-duo-grayDark text-lg mb-3">History</h2>
        {detail.transactions.length === 0 ? (
          <p className="text-gray-400 font-bold">No transactions.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase text-gray-400 font-black">
                  <th className="px-3 py-2">Date</th>
                  <th className="px-3 py-2">Type</th>
                  <th className="px-3 py-2 text-right">Amount</th>
                  <th className="px-3 py-2">Template</th>
                  <th className="px-3 py-2">By</th>
                  <th className="px-3 py-2">Reason</th>
                </tr>
              </thead>
              <tbody>
                {detail.transactions.map((t) => (
                  <tr key={t.id} className="border-t-2 border-gray-100">
                    <td className="px-3 py-3 text-gray-500">
                      {new Date(t.created_at).toLocaleString()}
                    </td>
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
