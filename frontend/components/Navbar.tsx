"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser } from "@/lib/userContext";

export default function Navbar() {
  const { user, loading, logout } = useUser();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  const isAdminish = user && (user.role === "ADMIN" || user.role === "SUPERADMIN");

  return (
    <nav className="bg-white border-b-2 border-gray-100 sticky top-0 z-30">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="w-9 h-9 rounded-xl bg-duo-green border-b-4 border-duo-greenDark flex items-center justify-center text-white font-black text-lg">
            M
          </span>
          <span className="text-xl font-black text-duo-grayDark tracking-tight">
            MerchQuest
          </span>
        </Link>

        <div className="flex items-center gap-3">
          {!loading && user && (
            <>
              <span className="pill-coin">
                <span className="text-lg">🪙</span>
                <span>{user.coin_balance}</span>
              </span>
              <Link
                href="/profile"
                className="hidden sm:inline-block text-sm font-bold text-duo-grayDark hover:text-duo-blue transition-colors"
              >
                Profile
              </Link>
              {isAdminish && (
                <Link
                  href="/admin"
                  className="text-sm font-black uppercase tracking-wide text-white bg-duo-purple border-b-4 border-duo-purpleDark px-3 py-1.5 rounded-xl hover:brightness-105"
                >
                  {user.role === "SUPERADMIN" ? "Admin ⚡" : "Admin"}
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="text-sm font-bold text-duo-red hover:text-duo-redDark"
              >
                Logout
              </button>
            </>
          )}
          {!loading && !user && (
            <Link href="/login" className="btn-duo">
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
