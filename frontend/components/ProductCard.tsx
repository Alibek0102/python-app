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
    <div className="card-duo overflow-hidden flex flex-col hover:border-duo-blue transition-colors">
      <div className="bg-duo-grayLight aspect-[4/3] flex items-center justify-center overflow-hidden">
        <img
          src={product.image_url || "https://placehold.co/400x300"}
          alt={product.name}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-4 flex flex-col flex-1">
        <h3 className="text-lg font-black text-duo-grayDark">{product.name}</h3>
        <p className="text-sm text-gray-500 mt-1 flex-1">{product.description}</p>
        <div className="mt-4 flex items-center justify-between gap-2">
          <div className="flex flex-col gap-1">
            <span className="pill-coin">
              <span>🪙</span>
              <span>{product.coin_price}</span>
            </span>
            <span className="text-xs font-bold text-gray-400">
              Stock: {product.stock}
            </span>
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
