"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  GraduationCap, 
  ArrowRight, 
  Shield, 
  Zap, 
  CheckCircle, 
  Clock, 
  Lock, 
  Menu, 
  X,
  FileText,
  UserCheck
} from "lucide-react";

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("dscs_token");
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  const handleStart = () => {
    router.push("/dashboard");
  };

  const handleScrollTo = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#FAFBFF] text-[#292D32] flex flex-col font-sans selection:bg-[#5932EA] selection:text-white">
      {/* Background decoration elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[10%] -left-[10%] w-[600px] h-[600px] rounded-full bg-[#EAABF0] opacity-20 blur-[130px]"></div>
        <div className="absolute top-[40%] right-[5%] w-[500px] h-[500px] rounded-full bg-[#4623E9] opacity-10 blur-[150px]"></div>
      </div>

      {/* 1. Header Navigation */}
      <header className="bg-white/80 backdrop-blur-md border-b border-[#F0F4FA] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => router.push("/")}>
            <div className="w-10 h-10 bg-gradient-to-tr from-[#5932EA] to-[#4623E9] rounded-xl flex items-center justify-center shadow-lg shadow-[rgba(89,50,234,0.25)]">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="font-poppins font-bold text-xl text-black">FUPRE DSCS</span>
              <span className="block text-[9px] text-[#9197B3] uppercase tracking-wider font-semibold -mt-1">Digital Clearance</span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 font-poppins text-sm font-semibold text-[#9197B3]">
            <button onClick={() => handleScrollTo("features")} className="hover:text-black transition-colors cursor-pointer">Features</button>
            <button onClick={() => handleScrollTo("workflow")} className="hover:text-black transition-colors cursor-pointer">How It Works</button>
            <button onClick={() => handleScrollTo("faq")} className="hover:text-black transition-colors cursor-pointer">FAQ</button>
          </nav>

          {/* Action Button */}
          <div className="hidden md:block">
            <button
              onClick={handleStart}
              className="flex items-center gap-2 py-2.5 px-6 border border-transparent rounded-xl text-sm font-bold text-white bg-[#5932EA] hover:bg-[#4623E9] shadow-lg shadow-[rgba(89,50,234,0.2)] transition-all cursor-pointer hover:-translate-y-[1px] active:translate-y-0"
            >
              {isAuthenticated ? "Go to Dashboard" : "Student / Staff Portal"}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Mobile Menu Icon */}
          <button 
            className="md:hidden text-black hover:text-[#5932EA] cursor-pointer"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-[#F0F4FA] p-6 space-y-4 font-poppins text-sm font-semibold text-[#9197B3] flex flex-col absolute top-20 left-0 w-full z-40 shadow-lg animate-in slide-in-from-top-5 duration-200">
          <button onClick={() => handleScrollTo("features")} className="text-left py-2 hover:text-black cursor-pointer">Features</button>
          <button onClick={() => handleScrollTo("workflow")} className="text-left py-2 hover:text-black cursor-pointer">How It Works</button>
          <button onClick={() => handleScrollTo("faq")} className="text-left py-2 hover:text-black cursor-pointer">FAQ</button>
          <button 
            onClick={handleStart}
            className="flex items-center justify-center gap-2 py-3 w-full border border-transparent rounded-xl text-sm font-bold text-white bg-[#5932EA] hover:bg-[#4623E9] transition-all cursor-pointer"
          >
            {isAuthenticated ? "Go to Dashboard" : "Sign In Portal"}
          </button>
        </div>
      )}

      {/* 2. Hero Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 pt-16 pb-24 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left text context */}
        <div className="lg:col-span-7 flex flex-col items-start gap-6 text-left">
          <div className="inline-flex items-center gap-2 bg-[rgba(22,192,152,0.08)] border border-[rgba(22,192,152,0.15)] rounded-full py-1.5 px-4 text-xs font-semibold text-[#008767]">
            <GraduationCap className="w-4 h-4" /> Official FUPRE Graduation Portal
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#292D32] tracking-tight leading-[1.1] font-poppins">
            Graduation Clearance{" "}
            <span className="bg-gradient-to-r from-[#5932EA] to-[#4623E9] bg-clip-text text-transparent">
              Simplified.
            </span>
          </h1>
          <p className="text-base sm:text-lg text-[#9197B3] leading-relaxed max-w-xl font-medium">
            FUPRE's Digital Student Clearance System replaces physical paperwork with a secure, instant dashboard. Submit verification files, track unit feedback, and download your final clearance certificate in minutes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto pt-2">
            <button
              onClick={handleStart}
              className="flex items-center justify-center gap-2 py-4 px-8 border border-transparent rounded-2xl text-sm font-bold text-white bg-[#5932EA] hover:bg-[#4623E9] shadow-xl shadow-[rgba(89,50,234,0.25)] transition-all cursor-pointer hover:translate-y-[-1px]"
            >
              Get Started Now <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleScrollTo("workflow")}
              className="flex items-center justify-center gap-2 py-4 px-8 border border-[#EEEEEE] rounded-2xl text-sm font-bold text-[#292D32] bg-white hover:bg-[#FAFBFF] hover:border-[#5932EA] transition-all cursor-pointer shadow-sm"
            >
              Watch How It Works
            </button>
          </div>
        </div>

        {/* Right Dashboard Visual frame mockup */}
        <div className="lg:col-span-5 relative w-full flex justify-center">
          <div className="bg-white border border-[#F0F4FA] rounded-[30px] shadow-[0px_20px_80px_rgba(226,236,249,0.9)] p-6 w-full max-w-[450px] relative overflow-hidden font-poppins text-xs">
            {/* Visual Header */}
            <div className="flex justify-between items-center pb-4 border-b border-[#F5F5F5] mb-5">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-gradient-to-tr from-[#5932EA] to-[#4623E9] rounded-lg flex items-center justify-center">
                  <GraduationCap className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="font-bold text-black text-[10px]">Student Progress</span>
              </div>
              <span className="text-[10px] text-[#00AC4F] font-bold bg-[#D3FFE7] py-0.5 px-2 rounded">
                83% Cleared
              </span>
            </div>

            {/* List items mimicking student view */}
            <div className="space-y-3.5">
              {/* Item 1 */}
              <div className="flex items-center justify-between p-3.5 bg-[#FAFBFF] border border-[#EEEEEE] rounded-2xl">
                <div>
                  <span className="block font-semibold text-black text-[11px]">University Library</span>
                  <span className="block text-[9px] text-[#9197B3] mt-0.5">Dues & Book Returns</span>
                </div>
                <span className="border rounded-full px-3 py-1 text-[9px] font-bold bg-[rgba(22,192,152,0.15)] border-[#00B087] text-[#008767]">
                  Cleared
                </span>
              </div>
              
              {/* Item 2 */}
              <div className="flex items-center justify-between p-3.5 bg-[#FAFBFF] border border-[#EEEEEE] rounded-2xl">
                <div>
                  <span className="block font-semibold text-black text-[11px]">Bursary Office</span>
                  <span className="block text-[9px] text-[#9197B3] mt-0.5">Tuition & Levies</span>
                </div>
                <span className="border rounded-full px-3 py-1 text-[9px] font-bold bg-[rgba(22,192,152,0.15)] border-[#00B087] text-[#008767]">
                  Cleared
                </span>
              </div>

              {/* Item 3 */}
              <div className="flex items-center justify-between p-3.5 bg-[#FAFBFF] border border-[#EEEEEE] rounded-2xl">
                <div>
                  <span className="block font-semibold text-black text-[11px]">Student Affairs</span>
                  <span className="block text-[9px] text-[#9197B3] mt-0.5">Hostel & ID Cards</span>
                </div>
                <span className="border rounded-full px-3 py-1 text-[9px] font-bold bg-[rgba(255,197,197,0.15)] border-[#DF9204] text-[#DF9204]">
                  Under Review
                </span>
              </div>
            </div>

            {/* Float visual certificate download receipt */}
            <div className="absolute -bottom-6 -right-6 bg-white border border-[#F0F4FA] rounded-2xl shadow-xl p-4 flex items-center gap-3 max-w-[200px] border-l-4 border-l-[#00B087] animate-bounce duration-[2000ms]">
              <div className="w-8 h-8 rounded-full bg-emerald-50 text-[#008767] flex items-center justify-center shrink-0">
                <UserCheck className="w-4.5 h-4.5" />
              </div>
              <div>
                <span className="block font-bold text-[9px] text-black">Certificate Unlocked</span>
                <span className="block text-[8px] text-[#9197B3] mt-0.5">Download Active</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Core Features Section */}
      <section id="features" className="relative z-10 bg-white py-24 border-y border-[#F0F4FA]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
          <div className="max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold text-black font-poppins mb-4 tracking-tight">
              Designed For High Performance
            </h2>
            <p className="text-sm text-[#9197B3] leading-relaxed font-medium">
              DSCS is engineered to deliver visual excellence, data transparency, and security at every checkpoint of the clearance process.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-8 rounded-[30px] border border-[#EEEEEE] hover:border-[#5932EA] hover:bg-[#FAFBFF] transition-all text-left group">
              <div className="w-12 h-12 bg-indigo-50 group-hover:bg-[#5932EA] transition-colors rounded-2xl flex items-center justify-center text-[#5932EA] group-hover:text-white mb-6 shadow-sm">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="font-poppins font-bold text-lg text-black mb-3">
                SHA-256 Validation
              </h3>
              <p className="text-xs text-[#9197B3] leading-relaxed font-medium">
                Verify document integrity directly in the browser with local SHA-256 checksum mapping, protecting submissions from tamper exploits.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-8 rounded-[30px] border border-[#EEEEEE] hover:border-[#5932EA] hover:bg-[#FAFBFF] transition-all text-left group">
              <div className="w-12 h-12 bg-indigo-50 group-hover:bg-[#5932EA] transition-colors rounded-2xl flex items-center justify-center text-[#5932EA] group-hover:text-white mb-6 shadow-sm">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="font-poppins font-bold text-lg text-black mb-3">
                Real-time Sync Review
              </h3>
              <p className="text-xs text-[#9197B3] leading-relaxed font-medium">
                Eliminate physical queues. Review queues for clearing departments are automatically populated, enabling staff to approve/reject in one click.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-8 rounded-[30px] border border-[#EEEEEE] hover:border-[#5932EA] hover:bg-[#FAFBFF] transition-all text-left group">
              <div className="w-12 h-12 bg-indigo-50 group-hover:bg-[#5932EA] transition-colors rounded-2xl flex items-center justify-center text-[#5932EA] group-hover:text-white mb-6 shadow-sm">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="font-poppins font-bold text-lg text-black mb-3">
                Audit Log Immutability
              </h3>
              <p className="text-xs text-[#9197B3] leading-relaxed font-medium">
                Every clearance request, administrative override, and rejection note registers in an append-only audit trail that prevents state tampering.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Workflow Section */}
      <section id="workflow" className="relative z-10 py-24 bg-[#FAFBFF]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
          <div className="max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold text-black font-poppins mb-4 tracking-tight">
              Simple 3-Step Operations
            </h2>
            <p className="text-sm text-[#9197B3] leading-relaxed font-medium">
              Understand the automated state tracking lifecycle from document upload to certificate issue.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 relative">
            {/* Step 1 */}
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="w-14 h-14 bg-gradient-to-tr from-[#EAABF0] to-[#5932EA] rounded-full text-white font-bold font-poppins flex items-center justify-center shadow-lg text-lg mb-2">
                1
              </div>
              <h3 className="font-poppins font-bold text-base text-black">Upload Files</h3>
              <p className="text-xs text-[#9197B3] leading-relaxed max-w-xs font-medium">
                Login, check requirements for Library, Bursary, etc., and upload proof of returns or fee receipts.
              </p>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="w-14 h-14 bg-gradient-to-tr from-[#EAABF0] to-[#5932EA] rounded-full text-white font-bold font-poppins flex items-center justify-center shadow-lg text-lg mb-2">
                2
              </div>
              <h3 className="font-poppins font-bold text-base text-black">Staff Review Queue</h3>
              <p className="text-xs text-[#9197B3] leading-relaxed max-w-xs font-medium">
                Assigned staff check the submitted proof and instantly Approve or Reject with documented correction instructions.
              </p>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="w-14 h-14 bg-gradient-to-tr from-[#EAABF0] to-[#5932EA] rounded-full text-white font-bold font-poppins flex items-center justify-center shadow-lg text-lg mb-2">
                3
              </div>
              <h3 className="font-poppins font-bold text-base text-black">Certificate Generated</h3>
              <p className="text-xs text-[#9197B3] leading-relaxed max-w-xs font-medium">
                Once all 6 clearing offices approve, the system unlocks your PDF clearance certificate for instant download.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. FAQ Accordion Section */}
      <section id="faq" className="relative z-10 bg-white py-24 border-t border-[#F0F4FA]">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold text-black font-poppins text-center mb-12 tracking-tight">
            Frequently Asked Questions
          </h2>

          <div className="space-y-6">
            <div className="p-6 rounded-2xl border border-[#EEEEEE] bg-[#FAFBFF]">
              <h4 className="font-poppins font-bold text-sm text-black mb-2">How long does clearance review take?</h4>
              <p className="text-xs text-[#9197B3] leading-relaxed font-medium">
                Clearance requests are pushed instantly to the staff members assigned to that office. Reviews are typically completed within 24 to 48 hours.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-[#EEEEEE] bg-[#FAFBFF]">
              <h4 className="font-poppins font-bold text-sm text-black mb-2">What happens if my document is rejected?</h4>
              <p className="text-xs text-[#9197B3] leading-relaxed font-medium">
                If rejected, you will receive an active notification panel showing the staff's rejection reason. You can re-upload corrected files immediately to re-queue.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Footer Layout */}
      <footer className="bg-white border-t border-[#F0F4FA] py-12 relative z-10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-tr from-[#5932EA] to-[#4623E9] rounded-lg flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="font-poppins font-bold text-base text-black">FUPRE DSCS</span>
          </div>
          <div className="flex flex-col items-center sm:items-end gap-1 text-center sm:text-right">
            <span className="text-xs text-[#9197B3] font-medium font-poppins">
              © {new Date().getFullYear()} Federal University of Petroleum Resources, Effurun. All rights reserved.
            </span>
            <div className="text-[10px] text-[#9197B3]/80 font-poppins mt-1 max-w-md leading-relaxed">
              built by <strong className="text-[#5932EA] font-semibold">PETER-SADUWA EJIROGHENE</strong> (COS/9558/2022)<br />
              DEPARTMENT OF COMPUTER SCIENCE,<br />
              FEDERAL UNIVERSITY OF PETROLEUM RESOURCES, EFFURUN, DELTA STATE, NIGERIA.<br />
              JULY, 2026
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
