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
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="text-left px-4 py-2 font-medium text-gray-700">ID</th>
            <th className="text-left px-4 py-2 font-medium text-gray-700">User</th>
            <th className="text-left px-4 py-2 font-medium text-gray-700">Product</th>
            <th className="text-left px-4 py-2 font-medium text-gray-700">Status</th>
            <th className="text-left px-4 py-2 font-medium text-gray-700">Date</th>
          </tr>
        </thead>
        <tbody>
          {orders.length === 0 && (
            <tr>
              <td colSpan={5} className="px-4 py-4 text-center text-gray-500">No orders yet.</td>
            </tr>
          )}
          {orders.map((o) => (
            <tr key={o.id} className="border-t border-gray-100">
              <td className="px-4 py-2">{o.id}</td>
              <td className="px-4 py-2">{o.user_name}</td>
              <td className="px-4 py-2">{o.product_name}</td>
              <td className="px-4 py-2">
                <span className="text-green-600">{o.status}</span>
              </td>
              <td className="px-4 py-2 text-gray-500">
                {new Date(o.created_at).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}