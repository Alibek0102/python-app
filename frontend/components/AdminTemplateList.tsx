"use client";

import { useState } from "react";
import AdminTemplateForm, { TemplateFormData } from "./AdminTemplateForm";
import { updateTemplate, deleteTemplate } from "@/services/api";

export interface CoinTemplate {
  id: number;
  name: string;
  type: "AWARD" | "PENALTY";
  amount: number;
  description?: string | null;
  is_active: boolean;
}

interface Props {
  templates: CoinTemplate[];
  onRefresh: () => void;
}

export default function AdminTemplateList({ templates, onRefresh }: Props) {
  const [editingId, setEditingId] = useState<number | null>(null);

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this template?")) return;
    try {
      await deleteTemplate(id);
      onRefresh();
    } catch (err: any) {
      alert(err?.response?.data?.detail || "Delete failed");
    }
  };

  const handleSave = async (id: number, data: TemplateFormData) => {
    await updateTemplate(id, data);
    setEditingId(null);
    onRefresh();
  };

  return (
    <div className="space-y-3">
      {templates.length === 0 && (
        <div className="card-duo p-8 text-center text-gray-400 font-bold">
          No templates yet.
        </div>
      )}
      {templates.map((t) => (
        <div key={t.id} className="card-duo p-4">
          {editingId === t.id ? (
            <AdminTemplateForm
              initialData={{
                name: t.name,
                type: t.type,
                amount: t.amount,
                description: t.description || "",
                is_active: t.is_active,
              }}
              onSubmit={(data) => handleSave(t.id, data)}
              onCancel={() => setEditingId(null)}
            />
          ) : (
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-3">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl border-b-4 ${
                    t.type === "AWARD"
                      ? "bg-duo-greenLight border-duo-green"
                      : "bg-duo-redLight border-duo-red"
                  }`}
                >
                  {t.type === "AWARD" ? "⭐" : "⚠️"}
                </div>
                <div>
                  <div className="font-black text-duo-grayDark">
                    {t.name}{" "}
                    <span
                      className={`badge-duo ml-1 ${
                        t.type === "AWARD"
                          ? "bg-duo-greenLight text-duo-greenDark"
                          : "bg-duo-redLight text-duo-redDark"
                      }`}
                    >
                      {t.type}
                    </span>
                    {!t.is_active && (
                      <span className="badge-duo bg-duo-grayLight text-gray-500 ml-1">
                        Inactive
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-500 mt-0.5">
                    <span className="pill-coin mr-2">
                      <span>🪙</span>
                      <span>{t.amount}</span>
                    </span>
                    {t.description || "—"}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setEditingId(t.id)} className="btn-duo-blue btn-duo-sm">
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(t.id)}
                  className="btn-duo-red btn-duo-sm"
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
