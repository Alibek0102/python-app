"use client";

import { useEffect, useState } from "react";
import ProductCard from "@/components/ProductCard";
import { getProducts } from "@/services/api";
import { useUser } from "@/lib/userContext";

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
  const [loading, setLoading] = useState(true);
  const { user } = useUser();

  const fetchProducts = async () => {
    try {
      const productsData = await getProducts();
      setProducts(productsData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handlePurchase = () => {
    fetchProducts();
  };

  if (loading) {
    return (
      <div className="text-center py-16 text-gray-400 font-bold">Loading…</div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="card-duo p-6 bg-gradient-to-br from-duo-greenLight to-white">
        <h1 className="text-3xl font-black text-duo-grayDark">Store</h1>
        <p className="text-gray-600 mt-1">
          Spend your coins on corporate swag. Earn more by doing great work!
        </p>
      </div>

      {products.length === 0 ? (
        <div className="card-duo p-10 text-center">
          <div className="text-5xl mb-3">🛒</div>
          <p className="text-gray-500 font-bold">No products available.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
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
