"use client";

import { useEffect, useState } from "react";
import { getTreasury, getTreasuryOperations, issueTreasury } from "@/services/api";

interface Op {
  id: number;
  amount: number;
  note: string | null;
  performed_by_name: string | null;
  created_at: string;
}

export default function AdminTreasuryPanel() {
  const [balance, setBalance] = useState<number | null>(null);
  const [ops, setOps] = useState<Op[]>([]);
  const [amount, setAmount] = useState<number>(0);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    const [t, o] = await Promise.all([getTreasury(), getTreasuryOperations()]);
    setBalance(t.balance);
    setOps(o);
  };

  useEffect(() => {
    load();
  }, []);

  const handleIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (amount <= 0) {
      setError("Amount must be > 0");
      return;
    }
    setBusy(true);
    try {
      await issueTreasury(amount, note || undefined);
      setAmount(0);
      setNote("");
      await load();
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Issue failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="card-duo p-8 bg-gradient-to-br from-duo-yellowLight to-white text-center">
        <div className="text-sm font-black uppercase text-duo-yellowDark tracking-widest">
          Treasury balance
        </div>
        <div className="text-5xl font-black text-duo-grayDark mt-2 flex items-center justify-center gap-2">
          <span>🪙</span>
          <span>{balance ?? "…"}</span>
        </div>
      </div>

      <div className="card-duo p-5">
        <h3 className="font-black text-duo-grayDark text-lg mb-3">Issue coins into treasury</h3>
        {error && (
          <div className="bg-duo-redLight text-duo-redDark px-4 py-3 rounded-2xl text-sm font-bold border-2 border-duo-red mb-3">
            {error}
          </div>
        )}
        <form onSubmit={handleIssue} className="flex flex-wrap gap-3 items-end">
          <div className="w-32">
            <label className="block text-xs font-black uppercase text-gray-500 mb-1 ml-1">
              Amount
            </label>
            <input
              type="number"
              min={1}
              value={amount}
              onChange={(e) => setAmount(parseInt(e.target.value) || 0)}
              className="input-duo"
            />
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-black uppercase text-gray-500 mb-1 ml-1">
              Note (optional)
            </label>
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="input-duo"
            />
          </div>
          <button type="submit" disabled={busy} className="btn-duo-yellow">
            Issue
          </button>
        </form>
      </div>

      <div className="card-duo p-5">
        <h3 className="font-black text-duo-grayDark text-lg mb-3">Issue history</h3>
        {ops.length === 0 ? (
          <p className="text-gray-400 font-bold">No operations yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase text-gray-400 font-black">
                <th className="px-3 py-2">Date</th>
                <th className="px-3 py-2">By</th>
                <th className="px-3 py-2 text-right">Amount</th>
                <th className="px-3 py-2">Note</th>
              </tr>
            </thead>
            <tbody>
              {ops.map((o) => (
                <tr key={o.id} className="border-t-2 border-gray-100">
                  <td className="px-3 py-3 text-gray-500">
                    {new Date(o.created_at).toLocaleString()}
                  </td>
                  <td className="px-3 py-3 font-bold">{o.performed_by_name || "—"}</td>
                  <td className="px-3 py-3 text-right font-black text-duo-greenDark">
                    +{o.amount}
                  </td>
                  <td className="px-3 py-3">{o.note || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
