"use client";

import { useState } from "react";

export interface AdminUserFormData {
  name: string;
  email: string;
  password: string;
  role: "USER" | "ADMIN";
  coin_balance: number;
}

interface Props {
  onSubmit: (data: AdminUserFormData) => Promise<void> | void;
  onCancel: () => void;
  allowedRoles?: Array<"USER" | "ADMIN">;
}

export default function AdminUserForm({ onSubmit, onCancel, allowedRoles = ["USER"] }: Props) {
  const [form, setForm] = useState<AdminUserFormData>({
    name: "",
    email: "",
    password: "",
    role: allowedRoles[0],
    coin_balance: 0,
  });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "coin_balance" ? parseInt(value) || 0 : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit(form);
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Failed to create user");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card-duo p-5 space-y-4">
      {error && (
        <div className="bg-duo-redLight text-duo-redDark px-4 py-3 rounded-2xl text-sm font-bold border-2 border-duo-red">
          {error}
        </div>
      )}
      <div>
        <label className="block text-xs font-black uppercase text-gray-500 mb-1 ml-1">Name</label>
        <input name="name" value={form.name} onChange={handleChange} required className="input-duo" />
      </div>
      <div>
        <label className="block text-xs font-black uppercase text-gray-500 mb-1 ml-1">Email</label>
        <input
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          required
          className="input-duo"
        />
      </div>
      <div>
        <label className="block text-xs font-black uppercase text-gray-500 mb-1 ml-1">Password</label>
        <input
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          required
          minLength={6}
          className="input-duo"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-black uppercase text-gray-500 mb-1 ml-1">Role</label>
          <select name="role" value={form.role} onChange={handleChange} className="input-duo">
            {allowedRoles.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-black uppercase text-gray-500 mb-1 ml-1">
            Coin Balance
          </label>
          <input
            name="coin_balance"
            type="number"
            min={0}
            value={form.coin_balance}
            onChange={handleChange}
            className="input-duo"
          />
        </div>
      </div>
      <div className="flex gap-3 pt-1">
        <button type="submit" disabled={submitting} className="btn-duo">
          {submitting ? "Creating…" : "Create"}
        </button>
        <button type="button" onClick={onCancel} className="btn-duo-ghost">
          Cancel
        </button>
      </div>
    </form>
  );
}
