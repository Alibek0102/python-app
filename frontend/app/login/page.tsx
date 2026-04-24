"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import LoginForm from "@/components/LoginForm";
import { getMe } from "@/services/api";

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    getMe()
      .then(() => router.push("/"))
      .catch(() => {});
  }, [router]);

  return (
    <div className="max-w-md mx-auto mt-12">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Login</h1>
        <LoginForm />
        <div className="mt-4 text-xs text-gray-500">
          <p>Admin: admin@company.com / admin123</p>
          <p>User: user@company.com / user123</p>
        </div>
      </div>
    </div>
  );
}