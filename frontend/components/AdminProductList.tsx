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
      {products.map((product) => (
        <div key={product.id} className="bg-white p-4 rounded-lg border border-gray-200">
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
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-900">{product.name}</div>
                <div className="text-sm text-gray-500">
                  🪙 {product.coin_price} | Stock: {product.stock} | {" "}
                  <span className={product.is_active ? "text-green-600" : "text-red-600"}>
                    {product.is_active ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => toggleActive(product)}
                  className="text-sm px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  {product.is_active ? "Deactivate" : "Activate"}
                </button>
                <button
                  onClick={() => setEditingId(product.id)}
                  className="text-sm px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(product.id)}
                  className="text-sm px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700"
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