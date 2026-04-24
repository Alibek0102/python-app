"use client";

import { useEffect, useState } from "react";

export interface TemplateFormData {
  name: string;
  type: "AWARD" | "PENALTY";
  amount: number;
  description: string;
  is_active: boolean;
}

interface Props {
  initialData?: Partial<TemplateFormData>;
  onSubmit: (data: TemplateFormData) => Promise<void> | void;
  onCancel: () => void;
}

export default function AdminTemplateForm({ initialData, onSubmit, onCancel }: Props) {
  const [form, setForm] = useState<TemplateFormData>({
    name: "",
    type: "AWARD",
    amount: 0,
    description: "",
    is_active: true,
  });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (initialData) setForm((prev) => ({ ...prev, ...initialData }));
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (form.amount <= 0) {
      setError("Amount must be > 0");
      return;
    }
    setBusy(true);
    try {
      await onSubmit(form);
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Save failed");
    } finally {
      setBusy(false);
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
        <input
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          required
          className="input-duo"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-black uppercase text-gray-500 mb-1 ml-1">Type</label>
          <select
            value={form.type}
            onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as "AWARD" | "PENALTY" }))}
            className="input-duo"
          >
            <option value="AWARD">AWARD</option>
            <option value="PENALTY">PENALTY</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-black uppercase text-gray-500 mb-1 ml-1">
            Amount
          </label>
          <input
            type="number"
            min={1}
            value={form.amount}
            onChange={(e) => setForm((f) => ({ ...f, amount: parseInt(e.target.value) || 0 }))}
            required
            className="input-duo"
          />
        </div>
      </div>
      <div>
        <label className="block text-xs font-black uppercase text-gray-500 mb-1 ml-1">
          Description
        </label>
        <textarea
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          className="input-duo"
        />
      </div>
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={form.is_active}
          onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))}
          className="h-5 w-5 accent-duo-green"
        />
        <span className="text-sm font-bold text-duo-grayDark">Active</span>
      </label>
      <div className="flex gap-3 pt-1">
        <button type="submit" disabled={busy} className="btn-duo">
          Save
        </button>
        <button type="button" onClick={onCancel} className="btn-duo-ghost">
          Cancel
        </button>
      </div>
    </form>
  );
}
