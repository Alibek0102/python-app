"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getMe, logoutUser } from "@/services/api";

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    getMe()
      .then((data) => setUser(data))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = async () => {
    await logoutUser();
    setUser(null);
    router.push("/login");
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-gray-800">
          Merch Store
        </Link>

        <div className="flex items-center gap-4">
          {!loading && user && (
            <>
              <span className="text-sm font-medium text-gray-700">
                🪙 {user.coin_balance} coins
              </span>
              <Link
                href="/profile"
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Profile
              </Link>
              {user.role === "ADMIN" && (
                <Link
                  href="/admin"
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  Admin
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="text-sm text-red-600 hover:text-red-800"
              >
                Logout
              </button>
            </>
          )}
          {!loading && !user && (
            <Link
              href="/login"
              className="text-sm bg-gray-900 text-white px-4 py-2 rounded-md hover:bg-gray-800"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}