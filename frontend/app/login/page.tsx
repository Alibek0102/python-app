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
      <div className="card-duo p-8">
        <div className="flex flex-col items-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-duo-green border-b-4 border-duo-greenDark flex items-center justify-center text-white text-3xl mb-3">
            🦉
          </div>
          <h1 className="text-3xl font-black text-duo-grayDark">Welcome back!</h1>
          <p className="text-sm text-gray-500 mt-1">Sign in to earn coins & shop</p>
        </div>
        <LoginForm />
        <div className="mt-6 pt-5 border-t-2 border-dashed border-gray-200 text-xs text-gray-500 space-y-1">
          <p>
            <span className="badge-duo bg-duo-purpleLight text-duo-purpleDark mr-1">SU</span>
            superadmin@company.com / super123
          </p>
          <p>
            <span className="badge-duo bg-duo-blueLight text-duo-blueDark mr-1">ADM</span>
            admin@company.com / admin123
          </p>
          <p>
            <span className="badge-duo bg-duo-greenLight text-duo-greenDark mr-1">USR</span>
            user@company.com / user123
          </p>
        </div>
      </div>
    </div>
  );
}
