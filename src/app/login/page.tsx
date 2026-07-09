"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GraduationCap, ArrowRight, Lock, Mail, Loader2 } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Authentication failed");
      }

      // Store the stateless access token in localStorage for client-side API requests
      localStorage.setItem("dscs_token", data.accessToken);
      localStorage.setItem("dscs_user", JSON.stringify(data.user));

      router.push("/dashboard");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  // Helper function to auto-login with seeded credentials
  const handleQuickLogin = (emailVal: string, passwordVal: string) => {
    setEmail(emailVal);
    setPassword(passwordVal);
    setError("");
    // Autofill and submit after state update
    setTimeout(() => {
      const form = document.getElementById("login-form") as HTMLFormElement;
      if (form) {
        form.requestSubmit();
      }
    }, 100);
  };

  const quickProfiles = [
    { label: "Graduating Student", email: "student@fupre.edu.ng", pass: "studentpassword", role: "STUDENT" },
    { label: "Library Staff", email: "library_staff@fupre.edu.ng", pass: "librarypassword", role: "STAFF" },
    { label: "Bursary Staff", email: "bursary_staff@fupre.edu.ng", pass: "bursarypassword", role: "STAFF" },
    { label: "Academic Registrar", email: "registrar@fupre.edu.ng", pass: "registrarpassword", role: "REGISTRAR" },
    { label: "System Administrator", email: "admin@fupre.edu.ng", pass: "adminpassword", role: "ADMIN" },
  ];

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-[#FAFBFF] py-12 px-4 sm:px-6 lg:px-8">
      {/* Background decoration elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[20%] -left-[10%] w-[500px] h-[500px] rounded-full bg-[#EAABF0] opacity-30 blur-[120px]"></div>
        <div className="absolute -bottom-[20%] -right-[10%] w-[600px] h-[600px] rounded-full bg-[#4623E9] opacity-20 blur-[150px]"></div>
      </div>

      <div className="w-full max-w-md z-10">
        {/* FUPRE Logo Banner */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-tr from-[#5932EA] to-[#4623E9] rounded-2xl flex items-center justify-center shadow-lg shadow-[rgba(89,50,234,0.3)] mb-4 transform hover:rotate-6 transition-transform">
            <GraduationCap className="w-9 h-9 text-white" />
          </div>
          <h2 className="text-center text-3xl font-extrabold text-[#292D32] tracking-tight">
            FUPRE DSCS
          </h2>
          <p className="mt-2 text-center text-sm text-[#9197B3]">
            Digital Student Clearance System
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white py-8 px-6 sm:px-10 rounded-[30px] shadow-[0px_10px_60px_rgba(226,236,249,0.8)] border border-[#F0F4FA]">
          <h3 className="text-xl font-semibold text-[#000000] mb-6">
            Sign In
          </h3>

          {error && (
            <div className="mb-4 p-4 rounded-xl bg-[#FFC5C5] border border-[#DF0404] text-sm text-[#DF0404] font-medium transition-all">
              {error}
            </div>
          )}

          <form id="login-form" onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-[#9197B3] uppercase tracking-wider mb-2">
                Institutional Email
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 h-5 text-[#9197B3]" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-4 py-3 border border-[#EEEEEE] rounded-xl bg-[#FAFBFF] text-[#292D32] font-medium placeholder-[#B5B7C0] focus:outline-none focus:ring-2 focus:ring-[#5932EA] focus:border-transparent transition-all text-sm"
                  placeholder="name@fupre.edu.ng"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#9197B3] uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 h-5 text-[#9197B3]" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-4 py-3 border border-[#EEEEEE] rounded-xl bg-[#FAFBFF] text-[#292D32] font-medium placeholder-[#B5B7C0] focus:outline-none focus:ring-2 focus:ring-[#5932EA] focus:border-transparent transition-all text-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl text-sm font-semibold text-white bg-[#5932EA] hover:bg-[#4623E9] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#5932EA] shadow-lg shadow-[rgba(89,50,234,0.25)] transition-all cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Loader2 className="animate-spin h-5 w-5 mr-2" />
                ) : (
                  <>
                    Continue <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Quick Login Section */}
          <div className="mt-8 pt-6 border-t border-[#EEEEEE]">
            <span className="block text-center text-xs font-semibold text-[#B5B7C0] uppercase tracking-wider mb-4">
              Demo Access Shortcuts
            </span>
            <div className="flex flex-col gap-2">
              {quickProfiles.map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => handleQuickLogin(p.email, p.pass)}
                  className="flex items-center justify-between px-4 py-2.5 rounded-xl border border-[#EEEEEE] bg-[#FAFBFF] hover:bg-[#F0F4FA] hover:border-[#5932EA] transition-all text-left text-xs cursor-pointer group"
                >
                  <div>
                    <span className="font-semibold text-[#292D32]">{p.label}</span>
                    <span className="block text-[10px] text-[#9197B3]">{p.email}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-white border border-[#EEEEEE] group-hover:border-[#5932EA] group-hover:text-[#5932EA] transition-all text-[10px] font-bold tracking-wider text-[#9197B3]">
                    {p.role}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
