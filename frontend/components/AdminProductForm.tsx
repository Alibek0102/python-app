"use client";

import { useState, useEffect } from "react";

interface ProductFormData {
  name: string;
  description: string;
  coin_price: number;
  stock: number;
  image_url: string;
  is_active: boolean;
}

interface AdminProductFormProps {
  initialData?: Partial<ProductFormData>;
  onSubmit: (data: ProductFormData) => void;
  onCancel: () => void;
}

export default function AdminProductForm({ initialData, onSubmit, onCancel }: AdminProductFormProps) {
  const [form, setForm] = useState<ProductFormData>({
    name: "",
    description: "",
    coin_price: 0,
    stock: 0,
    image_url: "",
    is_active: true,
  });

  useEffect(() => {
    if (initialData) {
      setForm((prev) => ({ ...prev, ...initialData }));
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: parseInt(value) || 0 }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 rounded-lg border border-gray-200 space-y-3">
      <div>
        <label className="block text-sm font-medium text-gray-700">Name</label>
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Description</label>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700">Coin Price</label>
          <input
            name="coin_price"
            type="number"
            value={form.coin_price}
            onChange={handleNumberChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Stock</label>
          <input
            name="stock"
            type="number"
            value={form.stock}
            onChange={handleNumberChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Image URL</label>
        <input
          name="image_url"
          value={form.image_url}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
        />
      </div>
      <div className="flex items-center gap-2">
        <input
          name="is_active"
          type="checkbox"
          checked={form.is_active}
          onChange={handleChange}
          className="h-4 w-4"
        />
        <label className="text-sm text-gray-700">Active</label>
      </div>
      <div className="flex gap-2 pt-2">
        <button
          type="submit"
          className="px-4 py-2 bg-gray-900 text-white rounded-md text-sm hover:bg-gray-800"
        >
          Save
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}