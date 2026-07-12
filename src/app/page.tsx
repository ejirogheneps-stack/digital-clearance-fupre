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
  FileCheck
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
  const [selectedOffice, setSelectedOffice] = useState("Library");
  const [simFileName, setSimFileName] = useState("");
  const [simStep, setSimStep] = useState<"idle" | "uploading" | "hashing" | "verifying" | "cleared" | "failed">("idle");
  const [simProgress, setSimProgress] = useState(0);
  const [simHash, setSimHash] = useState("");
  const [clearedOffices, setClearedOffices] = useState({
    Library: false,
    Bursary: false,
    Affairs: false,
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
  const startSimulation = () => {
    if (simStep !== "idle" && simStep !== "cleared") return;
    
    setSimProgress(0);
    setSimStep("uploading");
    setSimFileName(
      selectedOffice === "Library" ? "library_returns_receipt.pdf" :
      selectedOffice === "Bursary" ? "tuition_fees_clearance.pdf" : "student_id_surrender.pdf"
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
              const updated = { ...prev, [selectedOffice]: true };
              if (updated.Library && updated.Bursary && updated.Affairs) {
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
    setClearedOffices({ Library: false, Bursary: false, Affairs: false });
    setShowMockCertificate(false);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#1E293B] flex flex-col font-sans selection:bg-[#5932EA] selection:text-white relative overflow-hidden">
      
      {/* Background radial glow meshes */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[15%] -left-[10%] w-[600px] h-[600px] rounded-full bg-[#EAABF0] opacity-15 blur-[120px] animate-pulse-slow"></div>
        <div className="absolute top-[35%] right-[-10%] w-[650px] h-[650px] rounded-full bg-[#4623E9] opacity-10 blur-[160px] animate-pulse-slow"></div>
        <div className="absolute top-[70%] left-[5%] w-[500px] h-[500px] rounded-full bg-[#8B5CF6] opacity-5 blur-[130px]"></div>
      </div>

      {/* 1. Header Navigation */}
      <header className="bg-white/70 backdrop-blur-lg border-b border-[#E2E8F0] sticky top-0 z-50 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Logo */}
          <div className="flex items-center gap-2.5 cursor-pointer group" onClick={() => router.push("/")}>
            <img 
              src="/fupre_logo.png" 
              alt="FUPRE Logo" 
              className="w-10 h-10 object-contain transition-transform group-hover:scale-105 duration-300"
            />
            <div>
              <span className="font-poppins font-bold text-lg text-slate-900 tracking-tight">FUPRE DSCS</span>
              <span className="block text-[9px] text-[#5932EA] uppercase tracking-wider font-bold -mt-1">Digital Clearance</span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 font-poppins text-xs font-semibold text-slate-500">
            <button onClick={() => handleScrollTo("features")} className="hover:text-[#5932EA] transition-colors cursor-pointer">Platform Features</button>
            <button onClick={() => handleScrollTo("workflow")} className="hover:text-[#5932EA] transition-colors cursor-pointer">Clearance Steps</button>
            <button onClick={() => handleScrollTo("faq")} className="hover:text-[#5932EA] transition-colors cursor-pointer">Support FAQ</button>
          </nav>

          {/* Action Button */}
          <div className="hidden md:block">
            <button
              onClick={handleStart}
              className="relative inline-flex items-center gap-2 py-2.5 px-6 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 shadow-md transition-all cursor-pointer hover:shadow-lg hover:-translate-y-[1px] active:translate-y-0 overflow-hidden"
            >
              {isAuthenticated ? "Enter Dashboard" : "Sign In Portal"}
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Mobile Menu Icon */}
          <button 
            className="md:hidden text-slate-800 hover:text-[#5932EA] cursor-pointer"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-[#E2E8F0] p-6 space-y-4 font-poppins text-sm font-semibold text-slate-500 flex flex-col absolute top-20 left-0 w-full z-40 shadow-xl animate-in slide-in-from-top-5 duration-200">
          <button onClick={() => handleScrollTo("features")} className="text-left py-2 hover:text-[#5932EA] cursor-pointer">Platform Features</button>
          <button onClick={() => handleScrollTo("workflow")} className="text-left py-2 hover:text-[#5932EA] cursor-pointer">Clearance Steps</button>
          <button onClick={() => handleScrollTo("faq")} className="text-left py-2 hover:text-[#5932EA] cursor-pointer">Support FAQ</button>
          <button 
            onClick={handleStart}
            className="flex items-center justify-center gap-2 py-3 w-full border border-transparent rounded-xl text-sm font-bold text-white bg-[#5932EA] hover:bg-[#4623E9] transition-all cursor-pointer shadow-lg shadow-[rgba(89,50,234,0.15)]"
          >
            {isAuthenticated ? "Go to Dashboard" : "Sign In Portal"}
          </button>
        </div>
      )}

      {/* 2. Hero Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 pt-12 pb-20 grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
        
        {/* Left Hero Context */}
        <div className="lg:col-span-7 flex flex-col items-start gap-6 text-left animate-fade-in">
          <div className="inline-flex items-center gap-2 bg-[#5932EA]/10 border border-[#5932EA]/20 rounded-full py-1.5 px-4 text-[11px] font-bold text-[#5932EA]">
            <GraduationCap className="w-4 h-4" /> Official FUPRE Graduation Portal
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.08] font-poppins">
            Clearance processes,{" "}
            <span className="bg-gradient-to-r from-[#5932EA] via-[#8B5CF6] to-[#4623E9] bg-clip-text text-transparent">
              fully automated.
            </span>
          </h1>
          
          <p className="text-sm sm:text-base text-slate-500 leading-relaxed max-w-xl font-medium">
            FUPRE's Digital Student Clearance System replaces long queues with a streamlined dashboard. Verify your requirements, submit secure proof, track status approvals in real-time, and download your graduation clearance certificate.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto pt-2">
            <button
              onClick={handleStart}
              className="flex items-center justify-center gap-2 py-3.5 px-8 rounded-2xl text-xs font-bold text-white bg-shimmer shadow-lg shadow-purple-500/20 hover:shadow-xl transition-all cursor-pointer hover:translate-y-[-1px]"
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

        {/* Right - Interactive Portal Simulator */}
        <div className="lg:col-span-5 relative w-full flex justify-center animate-float">
          <div className="bg-white border border-slate-100 rounded-[28px] shadow-[0px_25px_60px_rgba(226,236,249,0.7)] p-6 w-full max-w-[440px] relative overflow-hidden font-poppins">
            
            {/* Custom decorative dots */}
            <div className="absolute top-4 right-4 flex gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-100"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-slate-100"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-slate-100"></span>
            </div>

            {/* Portal Header */}
            <div className="pb-4 border-b border-slate-100 mb-5 flex flex-col gap-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">DSCS SIMULATOR</span>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-7 h-7 bg-[#5932EA]/10 text-[#5932EA] rounded-lg flex items-center justify-center shrink-0">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <span className="font-bold text-slate-800 text-xs">Clearance Dashboard</span>
              </div>
            </div>

            {/* Mock Dashboard Tabs */}
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-50 rounded-xl mb-5">
              {["Library", "Bursary", "Affairs"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => { setSelectedOffice(tab); if(simStep === 'cleared') resetSimulation(); }}
                  className={`py-1.5 px-2 rounded-lg text-[10px] font-bold transition-all cursor-pointer text-center ${
                    selectedOffice === tab 
                      ? "bg-white text-[#5932EA] shadow-xs" 
                      : "text-slate-400 hover:text-slate-600"
                  }`}
                >
                  {tab === "Affairs" ? "Student Affairs" : tab}
                </button>
              ))}
            </div>

            {/* Simulator screen content */}
            <div className="min-h-[160px] flex flex-col justify-center bg-slate-50/50 rounded-2xl border border-slate-100 p-4 relative">
              {simStep === "idle" && (
                <div className="flex flex-col items-center justify-center text-center gap-3 py-4">
                  <div className="w-10 h-10 rounded-full bg-white border border-slate-200/60 shadow-xs flex items-center justify-center text-slate-400 animate-pulse">
                    <Upload className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <span className="block text-[11px] font-bold text-slate-700">Simulate Document Submission</span>
                    <span className="block text-[9px] text-slate-400 mt-1 max-w-[200px]">
                      Test how the system verifies upload integrity for {selectedOffice}
                    </span>
                  </div>
                  <button
                    onClick={startSimulation}
                    className="py-1.5 px-4 bg-[#5932EA] hover:bg-[#4623E9] text-white text-[10px] font-bold rounded-lg transition-all shadow-xs cursor-pointer mt-1"
                  >
                    Start Upload Simulation
                  </button>
                </div>
              )}

              {/* Uploading Progress */}
              {simStep === "uploading" && (
                <div className="flex flex-col gap-3 py-3">
                  <div className="flex items-center justify-between text-[10px] font-bold text-slate-600">
                    <span className="flex items-center gap-1.5 truncate max-w-[150px]">
                      <FileText className="w-3.5 h-3.5 text-[#5932EA]" /> {simFileName}
                    </span>
                    <span>{simProgress}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-[#5932EA] h-1.5 rounded-full transition-all duration-150" style={{ width: `${simProgress}%` }}></div>
                  </div>
                  <span className="text-[9px] font-semibold text-slate-400">Uploading verification data package...</span>
                </div>
              )}

              {/* Hashing Step */}
              {simStep === "hashing" && (
                <div className="flex flex-col items-center justify-center text-center gap-3 py-3">
                  <RefreshCw className="w-6 h-6 text-[#5932EA] animate-spin" />
                  <div>
                    <span className="block text-[11px] font-bold text-slate-700">Client-Side Verification</span>
                    <span className="block text-[9px] text-[#5932EA] mt-1 font-semibold">Generating SHA-256 local checksum...</span>
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
                    <span className="w-1.5 h-1.5 rounded-full bg-[#5932EA] animate-ping"></span>
                    <span className="font-bold text-slate-600">Checking against Office Registry...</span>
                  </div>
                  <span className="text-[9px] text-slate-400">Comparing cryptographic signature with server records...</span>
                </div>
              )}

              {/* Cleared state */}
              {simStep === "cleared" && (
                <div className="flex flex-col items-center justify-center text-center gap-2.5 py-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-[#00AC4F] animate-bounce">
                    <CheckCircle className="w-5.5 h-5.5" />
                  </div>
                  <div>
                    <span className="block text-[11px] font-bold text-emerald-800">Clearance Approved!</span>
                    <span className="block text-[9px] text-slate-400 mt-1">
                      Verification files matched. {selectedOffice} cleared.
                    </span>
                  </div>
                  <button
                    onClick={resetSimulation}
                    className="text-[9px] font-bold text-[#5932EA] hover:underline cursor-pointer"
                  >
                    Reset & Try Another Office
                  </button>
                </div>
              )}
            </div>

            {/* Checklist items representing current approval states */}
            <div className="mt-5 space-y-2 border-t border-slate-100 pt-4 text-[10px]">
              <span className="block font-bold text-slate-400 uppercase tracking-widest text-[9px] mb-2.5">
                Approval Checklist
              </span>
              
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-600">University Library</span>
                <span className={`px-2 py-0.5 rounded-full font-bold text-[9px] ${
                  clearedOffices.Library 
                    ? "bg-emerald-50 text-[#008767]" 
                    : "bg-slate-50 text-slate-400 border border-slate-100"
                }`}>
                  {clearedOffices.Library ? "Approved" : "Pending Demo"}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-600">Bursary Department</span>
                <span className={`px-2 py-0.5 rounded-full font-bold text-[9px] ${
                  clearedOffices.Bursary 
                    ? "bg-emerald-50 text-[#008767]" 
                    : "bg-slate-50 text-slate-400 border border-slate-100"
                }`}>
                  {clearedOffices.Bursary ? "Approved" : "Pending Demo"}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-600">Student Affairs</span>
                <span className={`px-2 py-0.5 rounded-full font-bold text-[9px] ${
                  clearedOffices.Affairs 
                    ? "bg-emerald-50 text-[#008767]" 
                    : "bg-slate-50 text-slate-400 border border-slate-100"
                }`}>
                  {clearedOffices.Affairs ? "Approved" : "Pending Demo"}
                </span>
              </div>
            </div>

            {/* Float visual certificate download badge when cleared */}
            {showMockCertificate && (
              <div 
                onClick={() => alert("Simulated certificate unlocked! Real certificates are generated dynamically via PDFKit once all 6 real departments clear your account in the student dashboard.")}
                className="absolute inset-0 bg-[#5932EA]/95 flex flex-col items-center justify-center text-center p-6 text-white cursor-pointer z-20 animate-in fade-in zoom-in-95 duration-300"
              >
                <div className="w-12 h-12 rounded-full bg-white/10 text-white flex items-center justify-center mb-3 animate-radar">
                  <FileCheck className="w-6 h-6 text-white" />
                </div>
                <h4 className="font-bold text-sm">Clearance Certificate Unlocked</h4>
                <p className="text-[10px] text-white/80 mt-1 max-w-[200px]">
                  All offices cleared. Click anywhere to close simulator preview.
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
            <span className="text-[10px] font-bold text-[#5932EA] uppercase tracking-widest bg-[#5932EA]/10 py-1 px-3 rounded-full">
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
                <div className="w-10 h-10 bg-white border border-slate-200/60 rounded-xl flex items-center justify-center text-[#5932EA] shadow-xs">
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
                      className="w-full bg-slate-50/50 border border-slate-200/80 rounded-xl pl-9 pr-4 py-2 text-[10px] text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#5932EA] transition-all font-poppins"
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
                <div className="w-9 h-9 bg-white border border-slate-200/60 rounded-xl flex items-center justify-center text-[#5932EA] shadow-xs">
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
                <div className="w-9 h-9 bg-white border border-slate-200/60 rounded-xl flex items-center justify-center text-[#5932EA] shadow-xs">
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
                <div className="w-9 h-9 bg-white border border-slate-200/60 rounded-xl flex items-center justify-center text-[#5932EA] shadow-xs">
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
                <div className="w-9 h-9 bg-white border border-slate-200/60 rounded-xl flex items-center justify-center text-[#5932EA] shadow-xs">
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
            <span className="text-[10px] font-bold text-[#5932EA] uppercase tracking-widest bg-[#5932EA]/10 py-1 px-3 rounded-full">
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
              <div className="w-14 h-14 bg-white border border-slate-150 rounded-2xl text-slate-800 font-extrabold font-poppins flex items-center justify-center shadow-xs text-lg transition-transform group-hover:scale-105 group-hover:border-[#5932EA]/30 duration-300">
                1
              </div>
              <h3 className="font-poppins font-bold text-slate-800 text-sm mt-1">Upload Documents</h3>
              <p className="text-xs text-slate-400 leading-relaxed max-w-xs font-semibold">
                Access your checklist, browse clearing requirements, and submit certificates, cards, or receipts.
              </p>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center gap-4 text-center group">
              <div className="w-14 h-14 bg-white border border-slate-150 rounded-2xl text-slate-800 font-extrabold font-poppins flex items-center justify-center shadow-xs text-lg transition-transform group-hover:scale-105 group-hover:border-[#5932EA]/30 duration-300">
                2
              </div>
              <h3 className="font-poppins font-bold text-slate-800 text-sm mt-1">Staff Queue Reviews</h3>
              <p className="text-xs text-slate-400 leading-relaxed max-w-xs font-semibold">
                Designated staff units verify your submissions. They can approve or reject with instant logs.
              </p>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center gap-4 text-center group">
              <div className="w-14 h-14 bg-white border border-slate-150 rounded-2xl text-slate-800 font-extrabold font-poppins flex items-center justify-center shadow-xs text-lg transition-transform group-hover:scale-105 group-hover:border-[#5932EA]/30 duration-300">
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
            <span className="text-[10px] font-bold text-[#5932EA] uppercase tracking-widest bg-[#5932EA]/10 py-1 px-3 rounded-full">
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
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${expandedFaq === 0 ? "rotate-180 text-[#5932EA]" : ""}`} />
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
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${expandedFaq === 1 ? "rotate-180 text-[#5932EA]" : ""}`} />
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
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${expandedFaq === 2 ? "rotate-180 text-[#5932EA]" : ""}`} />
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
              built by <strong className="text-[#5932EA] font-bold">PETER-SADUWA EJIROGHENE</strong> (COS/9558/2022)<br />
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
