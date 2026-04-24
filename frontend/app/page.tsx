"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import { getProducts, getMe } from "@/services/api";

interface Product {
  id: number;
  name: string;
  description: string;
  coin_price: number;
  stock: number;
  image_url: string;
}

export default function StorePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchData = async () => {
    try {
      const [productsData, userData] = await Promise.all([
        getProducts(),
        getMe().catch(() => null),
      ]);
      setProducts(productsData);
      setUser(userData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handlePurchase = () => {
    fetchData();
  };

  if (loading) {
    return <div className="text-center py-12 text-gray-500">Loading...</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Store</h1>
      {products.length === 0 ? (
        <p className="text-gray-500">No products available.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              userBalance={user?.coin_balance || 0}
              onPurchase={handlePurchase}
            />
          ))}
        </div>
      )}
    </div>
  );
}