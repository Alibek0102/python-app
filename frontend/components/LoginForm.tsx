"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginUser } from "@/services/api";
import { useUser } from "@/lib/userContext";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { refreshUser } = useUser();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await loginUser(email, password);
      await refreshUser();
      router.push("/");
    } catch (err: any) {
      setError(err.response?.data?.detail || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-duo-redLight text-duo-redDark px-4 py-3 rounded-2xl text-sm font-bold border-2 border-duo-red">
          {error}
        </div>
      )}
      <div>
        <label className="block text-xs font-black uppercase text-gray-500 mb-1 ml-1">
          Email
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="input-duo"
        />
      </div>
      <div>
        <label className="block text-xs font-black uppercase text-gray-500 mb-1 ml-1">
          Password
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="input-duo"
        />
      </div>
      <button type="submit" disabled={loading} className="btn-duo w-full">
        {loading ? "Logging in…" : "Log in"}
      </button>
    </form>
  );
}
