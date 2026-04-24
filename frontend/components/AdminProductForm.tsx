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

  const field = (label: string, el: React.ReactNode) => (
    <div>
      <label className="block text-xs font-black uppercase text-gray-500 mb-1 ml-1">
        {label}
      </label>
      {el}
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="card-duo p-5 space-y-4">
      {field(
        "Name",
        <input name="name" value={form.name} onChange={handleChange} required className="input-duo" />
      )}
      {field(
        "Description",
        <textarea name="description" value={form.description} onChange={handleChange} className="input-duo" />
      )}
      <div className="grid grid-cols-2 gap-3">
        {field(
          "Coin Price",
          <input
            name="coin_price"
            type="number"
            value={form.coin_price}
            onChange={handleNumberChange}
            required
            className="input-duo"
          />
        )}
        {field(
          "Stock",
          <input
            name="stock"
            type="number"
            value={form.stock}
            onChange={handleNumberChange}
            required
            className="input-duo"
          />
        )}
      </div>

      <div>
        <label className="block text-xs font-black uppercase text-gray-500 mb-1 ml-1">Image</label>
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          onChange={handleFileChange}
          disabled={uploading}
          className="w-full text-sm text-gray-700 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-duo-blue file:text-white file:font-bold file:uppercase file:text-xs file:hover:brightness-105"
        />
        {uploading && <p className="text-xs text-gray-500 mt-1 font-bold">Uploading…</p>}
        {uploadError && (
          <p className="text-xs text-duo-redDark mt-1 font-bold">{uploadError}</p>
        )}
        <input
          name="image_url"
          value={form.image_url}
          onChange={handleChange}
          placeholder="or paste image URL"
          className="input-duo mt-3"
        />
        {form.image_url && (
          <img
            src={form.image_url}
            alt="preview"
            className="mt-3 h-28 w-28 object-cover rounded-2xl border-2 border-gray-200"
          />
        )}
      </div>

      <label className="flex items-center gap-2 cursor-pointer">
        <input
          name="is_active"
          type="checkbox"
          checked={form.is_active}
          onChange={handleChange}
          className="h-5 w-5 accent-duo-green"
        />
        <span className="text-sm font-bold text-duo-grayDark">Active</span>
      </label>

      <div className="flex gap-3 pt-1">
        <button type="submit" disabled={uploading} className="btn-duo">
          Save
        </button>
        <button type="button" onClick={onCancel} className="btn-duo-ghost">
          Cancel
        </button>
      </div>
    </form>
  );
}
