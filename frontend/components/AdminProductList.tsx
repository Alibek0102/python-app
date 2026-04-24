"use client";

import { useState } from "react";
import AdminProductForm from "./AdminProductForm";
import { updateAdminProduct, deleteAdminProduct } from "@/services/api";

interface Product {
  id: number;
  name: string;
  coin_price: number;
  stock: number;
  is_active: boolean;
}

interface AdminProductListProps {
  products: Product[];
  onRefresh: () => void;
}

export default function AdminProductList({ products, onRefresh }: AdminProductListProps) {
  const [editingId, setEditingId] = useState<number | null>(null);

  const toggleActive = async (product: Product) => {
    await updateAdminProduct(product.id, { is_active: !product.is_active });
    onRefresh();
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this product?")) return;
    await deleteAdminProduct(id);
    onRefresh();
  };

  return (
    <div className="space-y-3">
      {products.length === 0 && (
        <div className="card-duo p-8 text-center text-gray-400 font-bold">
          No products yet.
        </div>
      )}
      {products.map((product) => (
        <div key={product.id} className="card-duo p-4">
          {editingId === product.id ? (
            <AdminProductForm
              initialData={product}
              onSubmit={async (data) => {
                await updateAdminProduct(product.id, data);
                setEditingId(null);
                onRefresh();
              }}
              onCancel={() => setEditingId(null)}
            />
          ) : (
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div>
                <div className="font-black text-duo-grayDark text-lg">
                  {product.name}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="pill-coin">
                    <span>🪙</span>
                    <span>{product.coin_price}</span>
                  </span>
                  <span className="badge-duo bg-duo-grayLight text-gray-600">
                    Stock: {product.stock}
                  </span>
                  <span
                    className={`badge-duo ${
                      product.is_active
                        ? "bg-duo-greenLight text-duo-greenDark"
                        : "bg-duo-redLight text-duo-redDark"
                    }`}
                  >
                    {product.is_active ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => toggleActive(product)}
                  className="btn-duo-ghost btn-duo-sm"
                >
                  {product.is_active ? "Deactivate" : "Activate"}
                </button>
                <button
                  onClick={() => setEditingId(product.id)}
                  className="btn-duo-blue btn-duo-sm"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(product.id)}
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
