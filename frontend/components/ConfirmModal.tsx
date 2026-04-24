"use client";

interface Props {
  open: boolean;
  title: string;
  description?: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  destructive = false,
  loading = false,
  onConfirm,
  onCancel,
}: Props) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-duo-grayDark bg-opacity-60 flex items-center justify-center z-40 p-4">
      <div className="bg-white rounded-3xl p-6 max-w-sm w-full border-4 border-white shadow-2xl">
        <h3 className="text-xl font-black text-duo-grayDark mb-2">{title}</h3>
        {description && (
          <div className="text-gray-600 mb-5 text-sm leading-relaxed">{description}</div>
        )}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="btn-duo-ghost flex-1"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`${destructive ? "btn-duo-red" : "btn-duo"} flex-1`}
          >
            {loading ? "…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
