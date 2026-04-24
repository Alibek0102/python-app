"use client";

import { useEffect, useState } from "react";
import { getCoinLog } from "@/services/api";

interface LogEntry {
  id: number;
  user_id: number;
  user_name: string | null;
  amount: number;
  type: "EARNED" | "SPENT";
  reason: string | null;
  admin_name: string | null;
  template_name: string | null;
  created_at: string;
}

export default function AdminCoinLog() {
  const [log, setLog] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCoinLog()
      .then((data) => setLog(data))
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return <p className="text-gray-400 font-bold text-center py-10">Loading…</p>;

  return (
    <div className="card-duo overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs uppercase text-gray-400 font-black">
            <th className="px-4 py-3">Date</th>
            <th className="px-4 py-3">Admin</th>
            <th className="px-4 py-3">User</th>
            <th className="px-4 py-3">Template</th>
            <th className="px-4 py-3">Type</th>
            <th className="px-4 py-3 text-right">Amount</th>
          </tr>
        </thead>
        <tbody>
          {log.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-4 py-8 text-center text-gray-400 font-bold">
                No coin operations yet.
              </td>
            </tr>
          ) : (
            log.map((e) => (
              <tr key={e.id} className="border-t-2 border-gray-100">
                <td className="px-4 py-3 text-gray-500">
                  {new Date(e.created_at).toLocaleString()}
                </td>
                <td className="px-4 py-3 font-bold">{e.admin_name || "—"}</td>
                <td className="px-4 py-3 font-bold">{e.user_name || "—"}</td>
                <td className="px-4 py-3">{e.template_name || "—"}</td>
                <td className="px-4 py-3">
                  <span
                    className={`badge-duo ${
                      e.type === "EARNED"
                        ? "bg-duo-greenLight text-duo-greenDark"
                        : "bg-duo-redLight text-duo-redDark"
                    }`}
                  >
                    {e.type}
                  </span>
                </td>
                <td
                  className={`px-4 py-3 text-right font-black ${
                    e.type === "EARNED" ? "text-duo-greenDark" : "text-duo-redDark"
                  }`}
                >
                  {e.type === "EARNED" ? "+" : "−"}
                  {e.amount}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
