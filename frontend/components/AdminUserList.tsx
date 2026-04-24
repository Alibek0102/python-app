"use client";

import { useState } from "react";
import Link from "next/link";
import { deleteAdminUser, updateAdminUser } from "@/services/api";

interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: string;
  coin_balance: number;
}

interface Props {
  users: AdminUser[];
  currentUserId: number;
  onRefresh: () => void;
}

const roleBadge: Record<string, string> = {
  SUPERADMIN: "bg-duo-purpleLight text-duo-purpleDark",
  ADMIN: "bg-duo-blueLight text-duo-blueDark",
  USER: "bg-duo-greenLight text-duo-greenDark",
};

export default function AdminUserList({ users, currentUserId, onRefresh }: Props) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [draft, setDraft] = useState<{
    name: string;
    role: string;
    coin_balance: number;
    password: string;
  }>({
    name: "",
    role: "USER",
    coin_balance: 0,
    password: "",
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startEdit = (u: AdminUser) => {
    setDraft({ name: u.name, role: u.role, coin_balance: u.coin_balance, password: "" });
    setEditingId(u.id);
    setError(null);
  };

  const save = async (id: number) => {
    setBusy(true);
    setError(null);
    try {
      const payload: any = {
        name: draft.name,
        role: draft.role,
        coin_balance: draft.coin_balance,
      };
      if (draft.password) payload.password = draft.password;
      await updateAdminUser(id, payload);
      setEditingId(null);
      onRefresh();
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Update failed");
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this user?")) return;
    try {
      await deleteAdminUser(id);
      onRefresh();
    } catch (err: any) {
      alert(err?.response?.data?.detail || "Delete failed");
    }
  };

  return (
    <div className="space-y-3">
      {error && (
        <div className="bg-duo-redLight text-duo-redDark px-4 py-3 rounded-2xl text-sm font-bold border-2 border-duo-red">
          {error}
        </div>
      )}
      {users.length === 0 && (
        <div className="card-duo p-8 text-center text-gray-400 font-bold">
          No users yet.
        </div>
      )}
      {users.map((u) => (
        <div key={u.id} className="card-duo p-4">
          {editingId === u.id ? (
            <div className="space-y-3">
              <input
                value={draft.name}
                onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
                placeholder="Name"
                className="input-duo"
              />
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={draft.role}
                  onChange={(e) => setDraft((d) => ({ ...d, role: e.target.value }))}
                  className="input-duo"
                >
                  <option value="USER">USER</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
                <input
                  type="number"
                  min={0}
                  value={draft.coin_balance}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, coin_balance: parseInt(e.target.value) || 0 }))
                  }
                  className="input-duo"
                />
              </div>
              <input
                type="password"
                value={draft.password}
                onChange={(e) => setDraft((d) => ({ ...d, password: e.target.value }))}
                placeholder="New password (leave empty to keep)"
                className="input-duo"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => save(u.id)}
                  disabled={busy}
                  className="btn-duo btn-duo-sm"
                >
                  Save
                </button>
                <button
                  onClick={() => setEditingId(null)}
                  className="btn-duo-ghost btn-duo-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <Link href={`/admin/users/${u.id}`} className="flex-1 min-w-0 group">
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="w-10 h-10 rounded-xl bg-duo-greenLight border-2 border-duo-green flex items-center justify-center font-black text-duo-greenDark">
                    {u.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-black text-duo-grayDark group-hover:text-duo-blue transition-colors">
                      {u.name}{" "}
                      <span
                        className={`badge-duo ml-1 ${roleBadge[u.role] || roleBadge.USER}`}
                      >
                        {u.role}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500 font-bold">
                      {u.email}
                    </div>
                  </div>
                </div>
              </Link>
              <span className="pill-coin">
                <span>🪙</span>
                <span>{u.coin_balance}</span>
              </span>
              <div className="flex gap-2">
                <button onClick={() => startEdit(u)} className="btn-duo-blue btn-duo-sm">
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(u.id)}
                  disabled={u.id === currentUserId}
                  title={u.id === currentUserId ? "You cannot delete yourself" : ""}
                  className="btn-duo-red btn-duo-sm disabled:opacity-40"
                >
                  Delete
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
