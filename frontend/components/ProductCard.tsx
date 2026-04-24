"use client";

import OrderButton from "./OrderButton";

interface Product {
  id: number;
  name: string;
  description: string;
  coin_price: number;
  stock: number;
  image_url: string;
}

interface ProductCardProps {
  product: Product;
  userBalance: number;
  onPurchase: () => void;
}

export default function ProductCard({ product, userBalance, onPurchase }: ProductCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <img
        src={product.image_url || "https://placehold.co/400x300"}
        alt={product.name}
        className="w-full h-48 object-cover"
      />
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900">{product.name}</h3>
        <p className="text-sm text-gray-500 mt-1">{product.description}</p>
        <div className="mt-3 flex items-center justify-between">
          <div>
            <span className="text-sm font-medium text-gray-700">🪙 {product.coin_price}</span>
            <span className="text-xs text-gray-400 ml-2">Stock: {product.stock}</span>
          </div>
          <OrderButton
            product={product}
            userBalance={userBalance}
            onPurchase={onPurchase}
          />
        </div>
      </div>
    </div>
  );
}