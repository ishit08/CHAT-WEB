"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleSendLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");
    const isLocalhost = typeof window !== "undefined" && window.location.hostname === "localhost";
    const siteUrl = isLocalhost
      ? window.location.origin
      : process.env.NEXT_PUBLIC_SITE_URL;
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${siteUrl}/`,
        shouldCreateUser: true,
      }
    });
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      setMessage("A login link has been sent to your email. Please check your inbox and click the link to login.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center text-black">Login</h1>
        <form onSubmit={handleSendLink} className="space-y-4">
          <div>
            <label className="block mb-1 font-medium text-black">Gmail Address</label>
            <input
              type="email"
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-400 text-black"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              placeholder="Enter your Gmail address"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-green-500 text-white py-2 rounded font-semibold hover:bg-green-600 transition"
            disabled={loading}
          >
            {loading ? "Sending..." : "Send Login Link"}
          </button>
        </form>
        {error && <div className="text-red-500 mt-4 text-center">{error}</div>}
        {message && <div className="text-green-600 mt-4 text-center">{message}</div>}
      </div>
    </div>
  );
} 