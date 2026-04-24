"use client";

import { useState, useEffect } from "react";
import { uploadAdminImage } from "@/services/api";

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
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError(null);
    setUploading(true);
    try {
      const url = await uploadAdminImage(file);
      setForm((prev) => ({ ...prev, image_url: url }));
    } catch (err: any) {
      setUploadError(err?.response?.data?.detail || "Upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
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
        <label className="block text-sm font-medium text-gray-700">Image</label>
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          onChange={handleFileChange}
          disabled={uploading}
          className="w-full text-sm text-gray-700 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:bg-gray-900 file:text-white file:text-sm file:hover:bg-gray-800"
        />
        {uploading && <p className="text-xs text-gray-500 mt-1">Uploading…</p>}
        {uploadError && <p className="text-xs text-red-600 mt-1">{uploadError}</p>}
        <input
          name="image_url"
          value={form.image_url}
          onChange={handleChange}
          placeholder="or paste image URL"
          className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
        />
        {form.image_url && (
          <img
            src={form.image_url}
            alt="preview"
            className="mt-2 h-24 w-24 object-cover rounded-md border border-gray-200"
          />
        )}
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
          disabled={uploading}
          className="px-4 py-2 bg-gray-900 text-white rounded-md text-sm hover:bg-gray-800 disabled:opacity-50"
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
