"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"email" | "otp">("email");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleSendOtp = async (e: React.FormEvent) => {
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
      setStep("otp");
      setMessage("OTP sent to your email. Please check your inbox.");
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");
    const { error } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: "email",
    });
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      // Check if profile is complete
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError("User not found after login.");
        return;
      }
      const { data: profile } = await supabase
        .from("users")
        .select("name, phone_number")
        .eq("id", user.id)
        .single();
      if (!profile || !profile.name || !profile.phone_number) {
        window.location.href = "/profile";
      } else {
        window.location.href = "/";
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center text-black">Login</h1>
        {step === "email" && (
          <form onSubmit={handleSendOtp} className="space-y-4">
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
              {loading ? "Sending..." : "Send OTP"}
            </button>
          </form>
        )}
        {step === "otp" && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div>
              <label className="block mb-1 font-medium text-black">Enter OTP</label>
              <input
                type="text"
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-400 text-black"
                value={otp}
                onChange={e => setOtp(e.target.value)}
                required
                placeholder="Enter the OTP sent to your email"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-green-500 text-white py-2 rounded font-semibold hover:bg-green-600 transition"
              disabled={loading}
            >
              {loading ? "Verifying..." : "Verify OTP & Login"}
            </button>
          </form>
        )}
        {error && <div className="text-red-500 mt-4 text-center">{error}</div>}
        {message && <div className="text-green-600 mt-4 text-center">{message}</div>}
      </div>
    </div>
  );
} 