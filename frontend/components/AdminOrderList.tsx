"use client";

interface Order {
  id: number;
  user_name: string;
  product_name: string;
  status: string;
  created_at: string;
}

interface AdminOrderListProps {
  orders: Order[];
}

export default function AdminOrderList({ orders }: AdminOrderListProps) {
  return (
    <div className="card-duo overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs uppercase text-gray-400 font-black">
            <th className="px-4 py-3">ID</th>
            <th className="px-4 py-3">User</th>
            <th className="px-4 py-3">Product</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Date</th>
          </tr>
        </thead>
        <tbody>
          {orders.length === 0 && (
            <tr>
              <td colSpan={5} className="px-4 py-8 text-center text-gray-400 font-bold">
                No orders yet.
              </td>
            </tr>
          )}
          {orders.map((o) => (
            <tr key={o.id} className="border-t-2 border-gray-100">
              <td className="px-4 py-3 font-bold text-gray-400">#{o.id}</td>
              <td className="px-4 py-3 font-bold">{o.user_name}</td>
              <td className="px-4 py-3">{o.product_name}</td>
              <td className="px-4 py-3">
                <span className="badge-duo bg-duo-greenLight text-duo-greenDark">
                  {o.status}
                </span>
              </td>
              <td className="px-4 py-3 text-gray-500">
                {new Date(o.created_at).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
