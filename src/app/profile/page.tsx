"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function ProfilePage() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const router = useRouter();

  useEffect(() => {
    // Fetch current user profile if exists
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }
      const { data, error } = await supabase
        .from("users")
        .select("name, phone_number")
        .eq("id", user.id)
        .single();
      if (data) {
        setName(data.name || "");
        setPhone(data.phone_number || "");
        if (data.name && data.phone_number) {
          router.push("/"); // Already complete, go to main UI
        }
      }
    };
    fetchProfile();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError("User not found. Please log in again.");
      setLoading(false);
      return;
    }
    const { error } = await supabase.from("users").upsert({
      id: user.id,
      email: user.email,
      name,
      phone_number: phone,
    });
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      setMessage("Profile updated!");
      router.push("/"); // Go to main chat UI
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Complete Your Profile</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 font-medium">Name</label>
            <input
              type="text"
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-400"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              placeholder="Enter your name"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Phone Number</label>
            <input
              type="text"
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-400"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              required
              placeholder="Enter your phone number"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-green-500 text-white py-2 rounded font-semibold hover:bg-green-600 transition"
            disabled={loading}
          >
            {loading ? "Saving..." : "Save Profile"}
          </button>
        </form>
        {error && <div className="text-red-500 mt-4 text-center">{error}</div>}
        {message && <div className="text-green-600 mt-4 text-center">{message}</div>}
      </div>
    </div>
  );
} 