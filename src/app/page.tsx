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
  UserCheck,
  ChevronDown,
  Upload,
  RefreshCw,
  Search,
  Database,
  FileCheck,
  LayoutDashboard,
  Smile
} from "lucide-react";

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  // FAQ Accordion State
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  // SHA-256 Hasher Widget State
  const [hasherInput, setHasherInput] = useState("");
  const [hasherOutput, setHasherOutput] = useState("");

  // Interactive Clearance Simulator State
  const [selectedOffice, setSelectedOffice] = useState("HOD");
  const [simFileName, setSimFileName] = useState("");
  const [simStep, setSimStep] = useState<"idle" | "uploading" | "hashing" | "verifying" | "cleared" | "failed">("idle");
  const [simProgress, setSimProgress] = useState(0);
  const [simHash, setSimHash] = useState("");
  const [clearedOffices, setClearedOffices] = useState({
    HOD: false,
    College: false,
    Admissions: false,
  });
  const [showMockCertificate, setShowMockCertificate] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("dscs_token");
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  // Update real-time SHA-256 hash in Bento Grid
  useEffect(() => {
    const computeHash = async () => {
      if (!hasherInput) {
        setHasherOutput("");
        return;
      }
      try {
        const msgBuffer = new TextEncoder().encode(hasherInput);
        const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
        setHasherOutput(hashHex);
      } catch (err) {
        setHasherOutput("Hash generation error");
      }
    };
    computeHash();
  }, [hasherInput]);

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

  const toggleFaq = (index: number) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  // Run mock clearance simulator steps
  const startSimulation = (office?: string) => {
    if (simStep !== "idle" && simStep !== "cleared") return;
    const targetOffice = office || selectedOffice;
    setSelectedOffice(targetOffice);
    
    setSimProgress(0);
    setSimStep("uploading");
    setSimFileName(
      targetOffice === "HOD" ? "hod_project_approval.pdf" :
      targetOffice === "College" ? "college_result_verification.pdf" : "admission_letter_file.pdf"
    );

    // Step 1: Simulated Upload
    let progress = 0;
    const uploadInterval = setInterval(() => {
      progress += 10;
      setSimProgress(progress);
      if (progress >= 100) {
        clearInterval(uploadInterval);
        setSimStep("hashing");
        
        // Step 2: Hashing
        setTimeout(() => {
          setSimStep("verifying");
          setSimHash("ef773950b7194a2b9d628c6e7a2b9188cf868bc9");
          
          // Step 3: Server Registry verification
          setTimeout(() => {
            setSimStep("cleared");
            setClearedOffices(prev => {
              const updated = { ...prev, [targetOffice]: true };
              if (updated.HOD && updated.College && updated.Admissions) {
                setShowMockCertificate(true);
              }
              return updated;
            });
          }, 1500);
        }, 1200);
      }
    }, 150);
  };

  const resetSimulation = () => {
    setSimStep("idle");
    setSimProgress(0);
    setSimFileName("");
    setSimHash("");
    setClearedOffices({ HOD: false, College: false, Admissions: false });
    setShowMockCertificate(false);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#1E293B] flex flex-col font-sans selection:bg-[#3482B9] selection:text-white relative overflow-hidden">
      
      {/* Background radial glow meshes */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[15%] -left-[10%] w-[600px] h-[600px] rounded-full bg-[#EAABF0] opacity-15 blur-[120px] animate-pulse-slow"></div>
        <div className="absolute top-[35%] right-[-10%] w-[650px] h-[650px] rounded-full bg-[#3482B9]/10 opacity-15 blur-[160px] animate-pulse-slow"></div>
        <div className="absolute top-[70%] left-[5%] w-[500px] h-[500px] rounded-full bg-[#3482B9]/5 blur-[130px]"></div>
      </div>

      {/* 1. Dual-Tier Navigation Header */}
      <header className="sticky top-0 z-50 shadow-md">
        {/* Tier 1: White logo header banner */}
        <div className="bg-white h-16 px-4 sm:px-6 md:px-8 flex items-center justify-between border-b border-slate-200">
          <div className="flex items-center gap-3">
            <img 
              src="/fupre_logo.png" 
              alt="FUPRE Logo" 
              className="w-10 h-10 object-contain shrink-0"
            />
            <div className="text-left font-poppins">
              <h1 className="font-bold text-slate-800 text-[10px] sm:text-xs leading-tight tracking-tight uppercase">
                Federal University of
              </h1>
              <h1 className="font-bold text-slate-800 text-[10px] sm:text-xs leading-tight tracking-tight uppercase">
                Petroleum Resources, Effurun
              </h1>
              <span className="block font-bold text-red-800 text-[8px] sm:text-[9px] tracking-wider uppercase mt-0.5">
                Excellence and Relevance
              </span>
            </div>
          </div>
          <div className="hidden md:block text-slate-400 font-poppins text-xs font-bold uppercase tracking-wider">
            Digital Student Clearance System
          </div>
        </div>

        {/* Tier 2: Blue Navigation Bar */}
        <div className="bg-[#3482B9] h-12 px-4 sm:px-6 md:px-8 flex items-center justify-between text-white shadow-inner">
          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-6 font-poppins text-xs font-bold">
            <button onClick={() => handleScrollTo("features")} className="hover:text-white/80 transition-colors cursor-pointer">Platform Features</button>
            <button onClick={() => handleScrollTo("workflow")} className="hover:text-white/80 transition-colors cursor-pointer">Clearance Steps</button>
            <button onClick={() => handleScrollTo("faq")} className="hover:text-white/80 transition-colors cursor-pointer">Support FAQ</button>
          </nav>

          {/* Mobile Menu Icon */}
          <button 
            className="md:hidden text-white hover:text-white/80 cursor-pointer p-1"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Action Button */}
          <div>
            <button
              onClick={handleStart}
              className="inline-flex items-center gap-1.5 py-1.5 px-4 rounded-xl text-xs font-bold text-white bg-[#2a6996] hover:bg-[#205175] border border-white/20 transition-all cursor-pointer shadow-sm hover:shadow-md"
            >
              {isAuthenticated ? "Enter Dashboard" : "Sign In Portal"}
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 p-6 space-y-4 font-poppins text-sm font-semibold text-slate-500 flex flex-col absolute top-28 left-0 w-full z-40 shadow-xl animate-in slide-in-from-top-5 duration-200">
          <button onClick={() => { handleScrollTo("features"); setMobileMenuOpen(false); }} className="text-left py-2 hover:text-[#3482B9] cursor-pointer">Platform Features</button>
          <button onClick={() => { handleScrollTo("workflow"); setMobileMenuOpen(false); }} className="text-left py-2 hover:text-[#3482B9] cursor-pointer">Clearance Steps</button>
          <button onClick={() => { handleScrollTo("faq"); setMobileMenuOpen(false); }} className="text-left py-2 hover:text-[#3482B9] cursor-pointer">Support FAQ</button>
        </div>
      )}

      {/* 2. Hero Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 pt-12 pb-20 grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
        
        {/* Left Hero Context */}
        <div className="lg:col-span-7 flex flex-col items-start gap-6 text-left animate-fade-in">
          <div className="inline-flex items-center gap-2 bg-[#3482B9]/10 border border-[#3482B9]/20 rounded-full py-1.5 px-4 text-[11px] font-bold text-[#3482B9]">
            <GraduationCap className="w-4 h-4" /> Official FUPRE Graduation Portal
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.08] font-poppins">
            Clearance processes,{" "}
            <span className="bg-gradient-to-r from-[#3482B9] via-[#5da1d1] to-[#2a6996] bg-clip-text text-transparent">
              fully automated.
            </span>
          </h1>
          
          <p className="text-sm sm:text-base text-slate-500 leading-relaxed max-w-xl font-medium">
            FUPRE's Digital Student Clearance System replaces long queues with a streamlined dashboard. Verify your requirements, submit secure proof, track status approvals in real-time, and download your graduation clearance certificate.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto pt-2">
            <button
              onClick={handleStart}
              className="flex items-center justify-center gap-2 py-3.5 px-8 rounded-2xl text-xs font-bold text-white bg-shimmer shadow-lg shadow-blue-500/20 hover:shadow-xl transition-all cursor-pointer hover:translate-y-[-1px]"
            >
              Get Started Now <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleScrollTo("workflow")}
              className="flex items-center justify-center gap-2 py-3.5 px-8 border border-slate-200 rounded-2xl text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 hover:border-slate-300 transition-all cursor-pointer shadow-sm"
            >
              Watch Clearance Steps
            </button>
          </div>

          {/* Quick stats panel */}
          <div className="flex items-center gap-8 mt-6 pt-6 border-t border-slate-200 w-full max-w-md">
            <div>
              <span className="block font-poppins font-extrabold text-xl text-slate-900">100%</span>
              <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">Digital Submission</span>
            </div>
            <div className="w-px h-8 bg-slate-200"></div>
            <div>
              <span className="block font-poppins font-extrabold text-xl text-slate-900">&lt; 48 Hrs</span>
              <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">Average Turnaround</span>
            </div>
            <div className="w-px h-8 bg-slate-200"></div>
            <div>
              <span className="block font-poppins font-extrabold text-xl text-slate-900">6 Offices</span>
              <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">Unified System</span>
            </div>
          </div>
        </div>

        {/* Right - Interactive Portal Simulator (Redesigned to mimic exact visual language of dashboard) */}
        <div className="lg:col-span-5 relative w-full flex justify-center animate-float">
          <div className="bg-slate-200 border border-slate-300 rounded-2xl shadow-[0px_20px_50px_rgba(15,32,66,0.15)] w-full max-w-[440px] relative overflow-hidden font-poppins flex flex-col min-h-[580px]">
            
            {/* 1. Mini Dual-Tier Header */}
            <div className="shrink-0 shadow-sm border-b border-slate-200">
              {/* Tier 1 logo bar */}
              <div className="bg-white h-10 px-3 flex items-center gap-2">
                <img 
                  src="/fupre_logo.png" 
                  alt="FUPRE Logo" 
                  className="w-6 h-6 object-contain shrink-0"
                />
                <div className="text-left font-poppins scale-[0.85] origin-left">
                  <h1 className="font-bold text-slate-800 text-[9px] leading-none uppercase">
                    Federal University of
                  </h1>
                  <h1 className="font-bold text-slate-800 text-[9px] leading-none uppercase mt-0.5">
                    Petroleum Resources, Effurun
                  </h1>
                </div>
              </div>
              {/* Tier 2 sub-header */}
              <div className="bg-[#3482B9] h-8 px-3 flex items-center justify-between text-white text-[10px]">
                <Menu className="w-3.5 h-3.5" />
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded-full border border-white overflow-hidden bg-slate-200 flex items-center justify-center font-bold text-slate-800 text-[9px]">
                    S
                  </div>
                  <ChevronDown className="w-3 h-3" />
                </div>
              </div>
            </div>

            {/* 2. Mini Content Area */}
            <div className="p-4 flex-1 flex flex-col gap-4 bg-slate-50">
              
              {/* Speedometer Breadcrumbs */}
              <div className="flex flex-col gap-1">
                <span className="font-bold text-slate-800 text-sm">Dashboard</span>
                <div className="bg-[#E2E8F0] px-2.5 py-1.5 rounded-md text-[9px] font-bold text-slate-600 flex items-center gap-1.5 border border-slate-200">
                  <LayoutDashboard className="w-3 h-3 text-slate-500 shrink-0" />
                  <span>Home</span>
                  <span className="text-slate-400 font-normal">&gt;</span>
                  <span className="text-slate-500 font-normal">Dashboard</span>
                </div>
              </div>

              {/* Grid of Mini Stat Cards */}
              <div className="grid grid-cols-2 gap-2 text-[10px] font-poppins">
                {/* Green Card */}
                <div className="bg-[#00A65A] text-white rounded-lg shadow-xs overflow-hidden flex flex-col justify-between h-[65px]">
                  <div className="p-2">
                    <span className="block font-bold text-base leading-none">
                      {3 - (clearedOffices.HOD ? 1 : 0) - (clearedOffices.College ? 1 : 0) - (clearedOffices.Admissions ? 1 : 0)}
                    </span>
                    <span className="text-[7px] font-bold uppercase tracking-wider opacity-90 block mt-1">Pending</span>
                  </div>
                  <div className="bg-[#008d4c] py-0.5 text-center text-[7px] font-semibold text-white/90 font-poppins">
                    More info
                  </div>
                </div>

                {/* Orange Card */}
                <div className="bg-[#F39C12] text-white rounded-lg shadow-xs overflow-hidden flex flex-col justify-between h-[65px]">
                  <div className="p-2">
                    <span className="block font-bold text-base leading-none">
                      {(clearedOffices.HOD ? 1 : 0) + (clearedOffices.College ? 1 : 0) + (clearedOffices.Admissions ? 1 : 0)}
                    </span>
                    <span className="text-[7px] font-bold uppercase tracking-wider opacity-90 block mt-1">Cleared</span>
                  </div>
                  <div className="bg-[#db8b0b] py-0.5 text-center text-[7px] font-semibold text-white/90 font-poppins">
                    More info
                  </div>
                </div>
              </div>

              {/* Clearance Directory Mini Table */}
              <div className="bg-white p-3 rounded-xl shadow-xs border border-slate-200/80 flex-1 flex flex-col justify-between min-h-[220px]">
                <div>
                  <h4 className="font-bold text-xs text-slate-800 mb-2 border-b border-slate-100 pb-1">
                    Clearance Directory
                  </h4>
                  
                  <div className="space-y-2 text-[10px] font-medium text-slate-700">
                    {/* HOD Office */}
                    <div className="flex items-center justify-between bg-slate-50 p-2 rounded-lg border border-slate-200/40">
                      <span>1. Head of Dept</span>
                      {clearedOffices.HOD ? (
                        <span className="bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded text-[8px] font-bold">CLEARED</span>
                      ) : (
                        <button
                          onClick={() => { setSelectedOffice("HOD"); startSimulation(); }}
                          disabled={simStep !== "idle" && simStep !== "cleared"}
                          className="bg-[#3482B9] hover:bg-[#2a6996] text-white font-bold px-2.5 py-1 rounded-md text-[8px] cursor-pointer disabled:opacity-50"
                        >
                          Submit File
                        </button>
                      )}
                    </div>

                    {/* College Office */}
                    <div className="flex items-center justify-between bg-slate-50 p-2 rounded-lg border border-slate-200/40">
                      <span>2. College Office</span>
                      {clearedOffices.College ? (
                        <span className="bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded text-[8px] font-bold">CLEARED</span>
                      ) : (
                        clearedOffices.HOD ? (
                          <button
                            onClick={() => { setSelectedOffice("College"); startSimulation(); }}
                            disabled={simStep !== "idle" && simStep !== "cleared"}
                            className="bg-[#3482B9] hover:bg-[#2a6996] text-white font-bold px-2.5 py-1 rounded-md text-[8px] cursor-pointer disabled:opacity-50"
                          >
                            Submit File
                          </button>
                        ) : (
                          <span className="text-[7.5px] font-bold text-slate-400 bg-slate-100 border border-slate-200/60 px-2 py-1 rounded flex items-center gap-1 select-none">
                            <Lock className="w-2.5 h-2.5" /> Locked
                          </span>
                        )
                      )}
                    </div>

                    {/* Admissions Office */}
                    <div className="flex items-center justify-between bg-slate-50 p-2 rounded-lg border border-slate-200/40">
                      <span>3. Admissions Office</span>
                      {clearedOffices.Admissions ? (
                        <span className="bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded text-[8px] font-bold">CLEARED</span>
                      ) : (
                        clearedOffices.College ? (
                          <button
                            onClick={() => { setSelectedOffice("Admissions"); startSimulation(); }}
                            disabled={simStep !== "idle" && simStep !== "cleared"}
                            className="bg-[#3482B9] hover:bg-[#2a6996] text-white font-bold px-2.5 py-1 rounded-md text-[8px] cursor-pointer disabled:opacity-50"
                          >
                            Submit File
                          </button>
                        ) : (
                          <span className="text-[7.5px] font-bold text-slate-400 bg-slate-100 border border-slate-200/60 px-2 py-1 rounded flex items-center gap-1 select-none">
                            <Lock className="w-2.5 h-2.5" /> Locked
                          </span>
                        )
                      )}
                    </div>
                  </div>
                </div>

                {/* Profile panel bottom mockup */}
                <div className="mt-3 border-t border-slate-100 pt-2 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg border border-slate-200 bg-slate-100 overflow-hidden flex items-center justify-center font-bold text-slate-400 text-xs shadow-inner">
                    E
                  </div>
                  <div className="text-left leading-none">
                    <span className="block font-bold text-slate-800 text-[10px]">EGHRUDJE O. Samuel</span>
                    <span className="block text-[8px] text-slate-400 mt-0.5 font-semibold">soap@fupre.edu.ng</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Document Submission simulation overlay modal inside the simulator box */}
            {simStep !== "idle" && simStep !== "cleared" && (
              <div className="absolute inset-x-0 bottom-0 bg-white border-t border-slate-200 p-6 flex flex-col justify-center min-h-[220px] z-10 animate-in slide-in-from-bottom duration-250">
                {/* Uploading Progress */}
                {simStep === "uploading" && (
                  <div className="flex flex-col gap-3 py-3">
                    <div className="flex items-center justify-between text-[10px] font-bold text-slate-600">
                      <span className="flex items-center gap-1.5 truncate max-w-[150px]">
                        <FileText className="w-3.5 h-3.5 text-[#3482B9]" /> {simFileName}
                      </span>
                      <span>{simProgress}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-[#3482B9] h-1.5 rounded-full transition-all duration-150" style={{ width: `${simProgress}%` }}></div>
                    </div>
                    <span className="text-[9px] font-semibold text-slate-400">Uploading verification data package...</span>
                  </div>
                )}

                {/* Hashing Step */}
                {simStep === "hashing" && (
                  <div className="flex flex-col items-center justify-center text-center gap-3 py-3">
                    <RefreshCw className="w-6 h-6 text-[#3482B9] animate-spin" />
                    <div>
                      <span className="block text-[11px] font-bold text-slate-700">Client-Side Verification</span>
                      <span className="block text-[9px] text-[#3482B9] mt-1 font-semibold">Generating SHA-256 local checksum...</span>
                    </div>
                  </div>
                )}

                {/* Server verification step */}
                {simStep === "verifying" && (
                  <div className="flex flex-col gap-2.5 py-2 text-[10px]">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-600">Checksum Generated</span>
                      <span className="font-mono text-[8px] bg-slate-100 text-slate-500 py-0.5 px-1.5 rounded truncate max-w-[150px]">
                        {simHash}
                      </span>
                    </div>
                    <div className="w-full h-px bg-slate-100"></div>
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#3482B9] animate-ping"></span>
                      <span className="font-bold text-slate-600">Checking against Office Registry...</span>
                    </div>
                    <span className="text-[9px] text-slate-400">Comparing cryptographic signature with server records...</span>
                  </div>
                )}
              </div>
            )}

            {/* Float visual certificate download badge when cleared */}
            {showMockCertificate && (
              <div 
                onClick={resetSimulation}
                className="absolute inset-0 bg-[#3482B9]/95 flex flex-col items-center justify-center text-center p-6 text-white cursor-pointer z-20 animate-in fade-in zoom-in-95 duration-350"
              >
                <div className="w-12 h-12 rounded-full bg-white/10 text-white flex items-center justify-center mb-3 animate-radar">
                  <FileCheck className="w-6 h-6 text-white" />
                </div>
                <h4 className="font-bold text-sm">Clearance Certificate Unlocked</h4>
                <p className="text-[10px] text-white/80 mt-1 max-w-[200px]">
                  All offices cleared. Click anywhere to close simulator preview and reset.
                </p>
              </div>
            )}
            
          </div>
        </div>
      </section>

      {/* 3. Bento Grid Showcase Section */}
      <section id="features" className="relative z-10 bg-white py-24 border-y border-slate-200/50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          
          <div className="max-w-2xl mx-auto text-center mb-16">
            <span className="text-[10px] font-bold text-[#3482B9] uppercase tracking-widest bg-[#3482B9]/10 py-1 px-3 rounded-full">
              Platform Features
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-poppins mt-4 mb-4 tracking-tight">
              Designed For High-Performance Clearance
            </h2>
            <p className="text-sm text-slate-500 leading-relaxed font-medium">
              We replaced physical check-sheets with a secure, real-time database architecture built to avoid exploits, verify integrity, and sync instantly.
            </p>
          </div>

          {/* Bento Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 auto-rows-[250px] lg:auto-rows-[220px]">
            
            {/* Card 1: Live SHA-256 Hasher (Large Bento Grid Item) */}
            <div className="lg:col-span-8 lg:row-span-2 p-6 sm:p-8 rounded-[28px] border border-slate-100 bg-[#F8FAFC] shadow-xs flex flex-col justify-between group transition-all duration-300 hover:border-slate-200">
              <div className="flex flex-col gap-2">
                <div className="w-10 h-10 bg-white border border-slate-200/60 rounded-xl flex items-center justify-center text-[#3482B9] shadow-xs">
                  <Shield className="w-5 h-5" />
                </div>
                <h3 className="font-poppins font-bold text-lg text-slate-900 mt-2">
                  SHA-256 Client-Side Validation
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed font-medium max-w-xl">
                  Submit receipts and book return receipts with confidence. Document hashes are calculated locally inside your browser, ensuring files cannot be tampered with or modified after submission.
                </p>
              </div>

              {/* Hashing Interactive Widget */}
              <div className="mt-4 p-4 bg-white border border-slate-150 rounded-2xl flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Integrity Check Sandbox</span>
                  <span className="text-[9px] text-[#00AC4F] font-bold bg-[#D3FFE7] px-2 py-0.5 rounded">Real-time Hash</span>
                </div>
                
                <div className="flex gap-2 items-center">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={hasherInput}
                      onChange={(e) => setHasherInput(e.target.value)}
                      placeholder="Type something to compute local signature..."
                      className="w-full bg-slate-50/50 border border-slate-200/80 rounded-xl pl-9 pr-4 py-2 text-[10px] text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#3482B9] transition-all font-poppins"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">SHA-256 Signature Output</span>
                  <div className="font-mono text-[9px] text-slate-600 truncate">
                    {hasherOutput || "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855 (empty hash)"}
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2: Immutable Auditing (Small Bento Grid Item) */}
            <div className="lg:col-span-4 lg:row-span-1 p-6 rounded-[28px] border border-slate-100 bg-[#F8FAFC] shadow-xs flex flex-col justify-between hover:border-slate-200 transition-all duration-300">
              <div className="flex flex-col gap-1.5">
                <div className="w-9 h-9 bg-white border border-slate-200/60 rounded-xl flex items-center justify-center text-[#3482B9] shadow-xs">
                  <Database className="w-4.5 h-4.5" />
                </div>
                <h3 className="font-poppins font-bold text-sm text-slate-900 mt-1">
                  Immutable State Audit Log
                </h3>
                <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                  Every clearance decision, staff action, or student upload is recorded in an append-only registry, preventing manual adjustments.
                </p>
              </div>
            </div>

            {/* Card 3: Sync review queue (Small Bento Grid Item) */}
            <div className="lg:col-span-4 lg:row-span-1 p-6 rounded-[28px] border border-slate-100 bg-[#F8FAFC] shadow-xs flex flex-col justify-between hover:border-slate-200 transition-all duration-300">
              <div className="flex flex-col gap-1.5">
                <div className="w-9 h-9 bg-white border border-slate-200/60 rounded-xl flex items-center justify-center text-[#3482B9] shadow-xs">
                  <Clock className="w-4.5 h-4.5" />
                </div>
                <h3 className="font-poppins font-bold text-sm text-slate-900 mt-1">
                  Dynamic Synchronization
                </h3>
                <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                  State reviews sync instantly between the registrar, clearing office personnel, and students, preventing approval delays.
                </p>
              </div>
            </div>

            {/* Card 4: Secure Storage (Medium Bento Grid Item) */}
            <div className="lg:col-span-4 lg:row-span-1 p-6 rounded-[28px] border border-slate-100 bg-[#F8FAFC] shadow-xs flex flex-col justify-between hover:border-slate-200 transition-all duration-300">
              <div className="flex flex-col gap-1.5">
                <div className="w-9 h-9 bg-white border border-slate-200/60 rounded-xl flex items-center justify-center text-[#3482B9] shadow-xs">
                  <Lock className="w-4.5 h-4.5" />
                </div>
                <h3 className="font-poppins font-bold text-sm text-slate-900 mt-1">
                  Supabase Vault Isolation
                </h3>
                <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                  Student documents are vaulted in isolated buckets with RLS (Row Level Security) database policy barriers to protect personal data.
                </p>
              </div>
            </div>

            {/* Card 5: Real-time notification (Medium Bento Grid Item) */}
            <div className="lg:col-span-8 lg:row-span-1 p-6 rounded-[28px] border border-slate-100 bg-[#F8FAFC] shadow-xs flex items-center justify-between hover:border-slate-200 transition-all duration-300 gap-6">
              <div className="flex flex-col gap-1.5">
                <div className="w-9 h-9 bg-white border border-slate-200/60 rounded-xl flex items-center justify-center text-[#3482B9] shadow-xs">
                  <Zap className="w-4.5 h-4.5" />
                </div>
                <h3 className="font-poppins font-bold text-sm text-slate-900 mt-1">
                  Active Status Feedbacks
                </h3>
                <p className="text-[11px] text-slate-500 leading-relaxed font-medium max-w-md">
                  If any department flags or rejects your credentials, the dashboard highlights the exact issue along with detailed staff instructions on how to correct it.
                </p>
              </div>
              <div className="hidden sm:flex flex-col gap-1 border border-slate-150 p-3.5 bg-white rounded-2xl w-48 text-[9px] shadow-xs font-poppins shrink-0">
                <span className="font-bold text-red-500">Academic Department</span>
                <span className="text-slate-400 mt-0.5">Note: Re-upload project fee payment receipt. Original receipt was blurry.</span>
              </div>
            </div>
            
          </div>
        </div>
      </section>

      {/* 4. Workflow Section */}
      <section id="workflow" className="relative z-10 py-24 bg-[#F8FAFC]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
          
          <div className="max-w-2xl mx-auto mb-20">
            <span className="text-[10px] font-bold text-[#3482B9] uppercase tracking-widest bg-[#3482B9]/10 py-1 px-3 rounded-full">
              System Lifecycle
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-poppins mt-4 mb-4 tracking-tight">
              Simple 3-Step Clearances
            </h2>
            <p className="text-sm text-slate-500 leading-relaxed font-medium">
              A transparent flow designed to map student clearance requirements from creation to print.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 relative">
            
            {/* Step 1 */}
            <div className="flex flex-col items-center gap-4 text-center group">
              <div className="w-14 h-14 bg-white border border-slate-150 rounded-2xl text-slate-800 font-extrabold font-poppins flex items-center justify-center shadow-xs text-lg transition-transform group-hover:scale-105 group-hover:border-[#3482B9]/30 duration-300">
                1
              </div>
              <h3 className="font-poppins font-bold text-slate-800 text-sm mt-1">Upload Documents</h3>
              <p className="text-xs text-slate-400 leading-relaxed max-w-xs font-semibold">
                Access your checklist, browse clearing requirements, and submit certificates, cards, or receipts.
              </p>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center gap-4 text-center group">
              <div className="w-14 h-14 bg-white border border-slate-150 rounded-2xl text-slate-800 font-extrabold font-poppins flex items-center justify-center shadow-xs text-lg transition-transform group-hover:scale-105 group-hover:border-[#3482B9]/30 duration-300">
                2
              </div>
              <h3 className="font-poppins font-bold text-slate-800 text-sm mt-1">Staff Queue Reviews</h3>
              <p className="text-xs text-slate-400 leading-relaxed max-w-xs font-semibold">
                Designated staff units verify your submissions. They can approve or reject with instant logs.
              </p>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center gap-4 text-center group">
              <div className="w-14 h-14 bg-white border border-slate-150 rounded-2xl text-slate-800 font-extrabold font-poppins flex items-center justify-center shadow-xs text-lg transition-transform group-hover:scale-105 group-hover:border-[#3482B9]/30 duration-300">
                3
              </div>
              <h3 className="font-poppins font-bold text-slate-800 text-sm mt-1">Unlock & Download</h3>
              <p className="text-xs text-slate-400 leading-relaxed max-w-xs font-semibold">
                Once all 6 clearances match, the system compiles and generates your FUPRE digital certificate for download.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* 5. Interactive FAQ Section */}
      <section id="faq" className="relative z-10 bg-white py-24 border-t border-slate-200/50">
        <div className="max-w-3xl mx-auto px-6 lg:px-8">
          
          <div className="text-center mb-16">
            <span className="text-[10px] font-bold text-[#3482B9] uppercase tracking-widest bg-[#3482B9]/10 py-1 px-3 rounded-full">
              Common Questions
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 font-poppins mt-4 mb-4 tracking-tight">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-4">
            
            {/* FAQ Item 1 */}
            <div className="border border-slate-100 rounded-2xl overflow-hidden transition-all duration-300 bg-slate-50/50">
              <button
                onClick={() => toggleFaq(0)}
                className="w-full flex items-center justify-between p-5 text-left font-poppins font-bold text-slate-700 text-xs sm:text-sm cursor-pointer hover:bg-slate-50 transition-colors"
              >
                <span>How long does a clearance review take?</span>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${expandedFaq === 0 ? "rotate-180 text-[#3482B9]" : ""}`} />
              </button>
              
              <div 
                className={`transition-all duration-300 ease-in-out overflow-hidden ${
                  expandedFaq === 0 ? "max-h-[120px] opacity-100 border-t border-slate-100/50" : "max-h-0 opacity-0"
                }`}
              >
                <p className="p-5 text-xs text-slate-500 leading-relaxed font-medium">
                  Document submissions are routed in real-time to the queues of assigned clearing personnel. Review cycles vary depending on the clearing unit but are generally completed within 24 to 48 hours.
                </p>
              </div>
            </div>

            {/* FAQ Item 2 */}
            <div className="border border-slate-100 rounded-2xl overflow-hidden transition-all duration-300 bg-slate-50/50">
              <button
                onClick={() => toggleFaq(1)}
                className="w-full flex items-center justify-between p-5 text-left font-poppins font-bold text-slate-700 text-xs sm:text-sm cursor-pointer hover:bg-slate-50 transition-colors"
              >
                <span>What happens if my clearance proof is rejected?</span>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${expandedFaq === 1 ? "rotate-180 text-[#3482B9]" : ""}`} />
              </button>
              
              <div 
                className={`transition-all duration-300 ease-in-out overflow-hidden ${
                  expandedFaq === 1 ? "max-h-[120px] opacity-100 border-t border-slate-100/50" : "max-h-0 opacity-0"
                }`}
              >
                <p className="p-5 text-xs text-slate-500 leading-relaxed font-medium">
                  If a staff member rejects your submission, your clearance status turns to "Rejected" and displays a note explaining the reason. You can review the instructions, make corrections, and re-upload the file directly.
                </p>
              </div>
            </div>

            {/* FAQ Item 3 */}
            <div className="border border-slate-100 rounded-2xl overflow-hidden transition-all duration-300 bg-slate-50/50">
              <button
                onClick={() => toggleFaq(2)}
                className="w-full flex items-center justify-between p-5 text-left font-poppins font-bold text-slate-700 text-xs sm:text-sm cursor-pointer hover:bg-slate-50 transition-colors"
              >
                <span>Is my clearance certificate verifiable after graduation?</span>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${expandedFaq === 2 ? "rotate-180 text-[#3482B9]" : ""}`} />
              </button>
              
              <div 
                className={`transition-all duration-300 ease-in-out overflow-hidden ${
                  expandedFaq === 2 ? "max-h-[120px] opacity-100 border-t border-slate-100/50" : "max-h-0 opacity-0"
                }`}
              >
                <p className="p-5 text-xs text-slate-500 leading-relaxed font-medium">
                  Yes. Every generated clearance certificate features a cryptographic signature checksum mapping that matches the digital registry. The university registrar can verify its integrity instantly through the admin module.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 6. Footer Layout */}
      <footer className="bg-white border-t border-slate-150 py-12 relative z-10 text-slate-500">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
          
          <div className="flex items-center gap-2.5">
            <img 
              src="/fupre_logo.png" 
              alt="FUPRE Logo" 
              className="w-8 h-8 object-contain"
            />
            <span className="font-poppins font-bold text-sm text-slate-900 tracking-tight">FUPRE DSCS</span>
          </div>

          <div className="flex flex-col items-center sm:items-end gap-2 text-center sm:text-right">
            <span className="text-xs text-slate-400 font-semibold font-poppins">
              © {new Date().getFullYear()} Federal University of Petroleum Resources, Effurun. All rights reserved.
            </span>
            <div className="text-[10px] text-slate-400 leading-relaxed max-w-lg">
              built by <strong className="text-[#3482B9] font-bold">PETER-SADUWA EJIROGHENE</strong> (COS/9558/2022)<br />
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
