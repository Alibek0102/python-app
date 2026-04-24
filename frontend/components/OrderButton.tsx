"use client";

import { useState } from "react";
import { createOrder } from "@/services/api";

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

  const canAfford = userBalance >= product.coin_price;
  const inStock = product.stock > 0;
  const disabled = !canAfford || !inStock || loading;

  const handleBuy = async () => {
    setLoading(true);
    try {
      await createOrder(product.id);
      setToast(`Successfully purchased ${product.name}!`);
      setTimeout(() => setToast(""), 3000);
      onPurchase();
    } catch (err: any) {
      setToast(err.response?.data?.detail || "Purchase failed");
      setTimeout(() => setToast(""), 3000);
    } finally {
      setLoading(false);
      setShowConfirm(false);
    }
  };

  return (
    <>
      {toast && (
        <div className="fixed top-4 right-4 bg-gray-900 text-white px-4 py-2 rounded-md shadow-lg z-50">
          {toast}
        </div>
      )}
      <button
        onClick={() => setShowConfirm(true)}
        disabled={disabled}
        className={`px-4 py-2 rounded-md text-sm font-medium ${
          disabled
            ? "bg-gray-200 text-gray-400 cursor-not-allowed"
            : "bg-gray-900 text-white hover:bg-gray-800"
        }`}
      >
        {loading ? "Processing..." : inStock ? (canAfford ? "Buy" : "Not enough coins") : "Out of stock"}
      </button>

      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold mb-2">Confirm Purchase</h3>
            <p className="text-gray-600 mb-4">
              Buy <strong>{product.name}</strong> for 🪙 {product.coin_price}?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleBuy}
                className="flex-1 px-4 py-2 bg-gray-900 text-white rounded-md text-sm hover:bg-gray-800"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}