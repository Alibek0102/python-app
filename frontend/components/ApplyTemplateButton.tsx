"use client";

import { useState } from "react";
import ConfirmModal from "./ConfirmModal";
import { applyTemplate } from "@/services/api";

interface Props {
  userId: number;
  userName: string;
  template: {
    id: number;
    name: string;
    type: "AWARD" | "PENALTY";
    amount: number;
  };
  onApplied: () => void;
}

export default function ApplyTemplateButton({ userId, userName, template, onApplied }: Props) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const verb = template.type === "AWARD" ? "Award" : "Penalize";
  const prep = template.type === "AWARD" ? "to" : "from";

  const handleConfirm = async () => {
    setBusy(true);
    try {
      await applyTemplate(userId, template.id);
      setOpen(false);
      setToast(`${verb} applied: ${template.amount} coins`);
      setTimeout(() => setToast(null), 3000);
      onApplied();
    } catch (err: any) {
      setToast(err?.response?.data?.detail || "Failed to apply");
      setTimeout(() => setToast(null), 4000);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      {toast && (
        <div className="fixed top-4 right-4 bg-duo-grayDark text-white px-4 py-3 rounded-2xl shadow-lg z-50 font-bold text-sm">
          {toast}
        </div>
      )}
      <button
        onClick={() => setOpen(true)}
        className={template.type === "AWARD" ? "btn-duo btn-duo-sm" : "btn-duo-red btn-duo-sm"}
      >
        Apply
      </button>
      <ConfirmModal
        open={open}
        title={`${verb} ${template.amount} coins ${prep} ${userName}?`}
        description={
          <>
            Template: <strong>{template.name}</strong>
            <br />
            This action is recorded in the coin log.
          </>
        }
        confirmLabel={verb}
        destructive={template.type === "PENALTY"}
        loading={busy}
        onConfirm={handleConfirm}
        onCancel={() => setOpen(false)}
      />
    </>
  );
}
