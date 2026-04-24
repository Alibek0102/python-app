"use client";

import { useState } from "react";
import { createOrder } from "@/services/api";
import { useUser } from "@/lib/userContext";
import ConfirmModal from "./ConfirmModal";

interface Product {
  id: number;
  name: string;
  coin_price: number;
  stock: number;
}

interface OrderButtonProps {
  product: Product;
  userBalance: number;
  onPurchase: () => void;
}

export default function OrderButton({ product, userBalance, onPurchase }: OrderButtonProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState("");
  const { refreshUser } = useUser();

  const canAfford = userBalance >= product.coin_price;
  const inStock = product.stock > 0;
  const disabled = !canAfford || !inStock || loading;

  const handleBuy = async () => {
    setLoading(true);
    try {
      await createOrder(product.id);
      setToast(`🎉 Purchased ${product.name}!`);
      setTimeout(() => setToast(""), 3000);
      await refreshUser();
      onPurchase();
    } catch (err: any) {
      setToast(err.response?.data?.detail || "Purchase failed");
      setTimeout(() => setToast(""), 3000);
    } finally {
      setLoading(false);
      setShowConfirm(false);
    }
  };

  const label = loading
    ? "…"
    : !inStock
    ? "Out"
    : !canAfford
    ? "Need more"
    : "Buy";

  return (
    <>
      {toast && (
        <div className="fixed top-4 right-4 bg-duo-grayDark text-white px-4 py-3 rounded-2xl shadow-lg z-50 font-bold text-sm">
          {toast}
        </div>
      )}
      <button
        onClick={() => setShowConfirm(true)}
        disabled={disabled}
        className={
          disabled
            ? "btn-duo-ghost opacity-60 cursor-not-allowed"
            : "btn-duo"
        }
      >
        {label}
      </button>

      <ConfirmModal
        open={showConfirm}
        title={`Buy ${product.name}?`}
        description={
          <>
            This will cost you{" "}
            <span className="pill-coin align-middle">
              <span>🪙</span>
              <span>{product.coin_price}</span>
            </span>
          </>
        }
        confirmLabel="Confirm"
        loading={loading}
        onConfirm={handleBuy}
        onCancel={() => setShowConfirm(false)}
      />
    </>
  );
}
