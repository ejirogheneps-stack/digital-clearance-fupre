"use client";

import { useState, useEffect } from "react";
import { 
  GraduationCap, 
  LayoutDashboard, 
  User as UserIcon, 
  HelpCircle, 
  LogOut, 
  Search, 
  ChevronDown, 
  TrendingUp, 
  Activity, 
  AlertCircle, 
  FileText, 
  Upload, 
  Download, 
  Loader2,
  X,
  Menu,
  Smile,
  ArrowRight,
  Lock
} from "lucide-react";

interface ClearanceRequest {
  id: string;
  unitId: string;
  status: string;
  submittedAt: string | null;
  reviewedAt: string | null;
  rejectionNote: string | null;
  clearingUnit: {
    id: string;
    name: string;
    description: string;
    sortOrder: number;
  };
}

interface StudentProfile {
  matricNumber: string;
  department: string;
  faculty: string;
  level: string;
  sessionOfGraduation: string;
  user: {
    name: string;
    email: string;
    phone: string | null;
  };
}

interface StudentDashboardProps {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  onLogout: () => void;
}

export default function StudentDashboard({ user, onLogout }: StudentDashboardProps) {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [requests, setRequests] = useState<ClearanceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadingUnit, setUploadingUnit] = useState<ClearanceRequest | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [checksum, setChecksum] = useState("");
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const token = typeof window !== "undefined" ? localStorage.getItem("dscs_token") : null;

  const fetchData = async () => {
    try {
      const profileRes = await fetch("/api/students/me", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const profileData = await profileRes.json();
      setProfile(profileData);

      const statusRes = await fetch("/api/clearance/my-status", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const statusData = await statusRes.json();
      setRequests(statusData.clearanceRequests || []);
    } catch (e) {
      console.error("Error loading student dashboard details:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchData();
    }
  }, [token]);

  const calculateChecksum = async (file: File) => {
    const arrayBuffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest("SHA-256", arrayBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
    setChecksum(hashHex);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setUploadError("File size exceeds 5MB limit.");
        setSelectedFile(null);
        return;
      }
      setSelectedFile(file);
      setUploadError("");
      await calculateChecksum(file);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !uploadingUnit) return;

    setUploadLoading(true);
    setUploadError("");

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("checksum", checksum);

    try {
      const response = await fetch(`/api/clearance/${uploadingUnit.unitId}/submit`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` },
        body: formData
      });

      const resData = await response.json();
      if (!response.ok) {
        throw new Error(resData.error || "Failed to submit document");
      }

      setUploadingUnit(null);
      setSelectedFile(null);
      setChecksum("");
      fetchData();
    } catch (err: any) {
      setUploadError(err.message || "An error occurred during upload");
    } finally {
      setUploadLoading(false);
    }
  };

  const isRequestUnlocked = (req: ClearanceRequest) => {
    const predecessors = requests.filter(r => r.clearingUnit.sortOrder < req.clearingUnit.sortOrder);
    if (predecessors.length === 0) return true;
    const directPredecessor = [...predecessors].sort((a, b) => b.clearingUnit.sortOrder - a.clearingUnit.sortOrder)[0];
    return directPredecessor.status === "APPROVED";
  };

  // Stats calculation
  const totalUnits = requests.length;
  const clearedCount = requests.filter(r => r.status === "APPROVED").length;
  const isFullyCleared = totalUnits > 0 && clearedCount === totalUnits;

  // Filter & Search
  const filteredRequests = requests.filter(r => {
    const matchesSearch = r.clearingUnit.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          r.clearingUnit.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (filterStatus === "all") return matchesSearch;
    if (filterStatus === "cleared") return matchesSearch && r.status === "APPROVED";
    if (filterStatus === "pending") return matchesSearch && (r.status === "PENDING_REVIEW" || r.status === "UNDER_REVIEW");
    if (filterStatus === "rejected") return matchesSearch && r.status === "REJECTED";
    if (filterStatus === "not_submitted") return matchesSearch && r.status === "NOT_SUBMITTED";
    return matchesSearch;
  });

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "APPROVED":
        return {
          bg: "bg-green-50",
          border: "border-green-300",
          text: "text-green-700",
          label: "Cleared"
        };
      case "REJECTED":
        return {
          bg: "bg-red-50",
          border: "border-red-300",
          text: "text-red-700",
          label: "Rejected"
        };
      case "PENDING_REVIEW":
      case "UNDER_REVIEW":
        return {
          bg: "bg-amber-50",
          border: "border-amber-300",
          text: "text-amber-700",
          label: "Under Review"
        };
      default:
        return {
          bg: "bg-slate-50",
          border: "border-slate-300",
          text: "text-slate-500",
          label: "Not Submitted"
        };
    }
  };

  const handleDownloadCertificate = () => {
    if (!profile) return;
    window.open(`/api/certificates/${user.id}?token=${token}`, "_blank");
  };

  const handleScrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#D2D7DF]">
        <Loader2 className="animate-spin h-10 w-10 text-[#3482B9]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#D2D7DF] relative flex flex-col overflow-x-hidden selection:bg-[#3482B9] selection:text-white">
      
      {/* 1. Dual-Tier Header */}
      <header className="fixed top-0 left-0 w-full z-30 shadow-md">
        {/* Tier 1: White logo header banner */}
        <div className="bg-white h-16 px-4 sm:px-6 flex items-center justify-between border-b border-slate-200">
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
          <div className="hidden sm:block text-slate-400 font-poppins text-xs font-bold uppercase tracking-wider">
            Digital Clearance
          </div>
        </div>

        {/* Tier 2: Blue Navigation Bar */}
        <div className="bg-[#3482B9] h-12 px-4 sm:px-6 flex items-center justify-between text-white shadow-inner">
          <button 
            onClick={() => setMobileMenuOpen(true)}
            className="p-1.5 hover:bg-white/10 rounded transition-colors cursor-pointer"
          >
            <Menu className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="hidden md:inline text-xs font-semibold">{user.name}</span>
              <div className="w-8 h-8 rounded-full border-2 border-white overflow-hidden bg-slate-200 flex items-center justify-center font-bold text-slate-800 text-xs uppercase cursor-pointer" onClick={() => setMobileMenuOpen(true)}>
                {user.name.charAt(0)}
              </div>
            </div>
            <button 
              className="p-1.5 hover:bg-white/10 rounded transition-colors cursor-pointer"
              onClick={() => setMobileMenuOpen(true)}
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Slide-Drawer Side Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div 
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
          ></div>
          
          <aside className="relative w-72 max-w-xs bg-white h-full flex flex-col justify-between py-6 px-5 border-r shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            <div className="flex flex-col">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2">
                  <img 
                    src="/fupre_logo.png" 
                    alt="FUPRE Logo" 
                    className="w-8 h-8 object-contain"
                  />
                  <span className="font-poppins font-bold text-xs text-slate-900">FUPRE DSCS</span>
                </div>
                <button 
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-5 h-5 text-slate-600" />
                </button>
              </div>

              <nav className="space-y-3">
                <a href="#" className="flex items-center justify-between px-3.5 py-2.5 bg-[#3482B9] text-white rounded-lg font-poppins font-medium text-xs">
                  <div className="flex items-center gap-2.5">
                    <LayoutDashboard className="w-4 h-4 text-white" />
                    <span>Dashboard</span>
                  </div>
                </a>
                
                <a href="#" className="flex items-center justify-between px-3.5 py-2.5 text-slate-500 hover:bg-slate-50 rounded-lg font-poppins font-medium text-xs">
                  <div className="flex items-center gap-2.5">
                    <UserIcon className="w-4 h-4 text-slate-500" />
                    <span>Profile</span>
                  </div>
                </a>

                <button 
                  onClick={() => { setMobileMenuOpen(false); onLogout(); }}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-red-500 hover:bg-red-50 rounded-lg font-poppins font-medium text-xs text-left cursor-pointer"
                >
                  <LogOut className="w-4 h-4 text-red-500" />
                  <span>Sign Out</span>
                </button>
              </nav>
            </div>

            <div className="flex items-center pt-4 border-t border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#3482B9] flex items-center justify-center font-bold text-white uppercase text-xs">
                  {user.name.charAt(0)}
                </div>
                <div>
                  <span className="block font-poppins font-semibold text-xs text-slate-800 max-w-[140px] truncate">
                    {user.name}
                  </span>
                  <span className="block text-[8px] text-slate-400 font-poppins">
                    {profile?.matricNumber || "Student"}
                  </span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      )}

      {/* 2. Main Content Grid (Padded for header layout) */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-36 pb-12 flex flex-col gap-6 z-10">
        
        {/* Title & Breadcrumb Block */}
        <div className="flex flex-col gap-2 mt-2">
          <h2 className="font-poppins font-bold text-xl sm:text-2xl text-slate-800">
            Dashboard
          </h2>
          
          <div className="bg-[#E2E8F0] px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 flex items-center gap-2 border border-slate-300/40">
            <LayoutDashboard className="w-4 h-4 text-slate-500 shrink-0" />
            <span>Home</span>
            <span className="text-slate-400 font-normal">&gt;</span>
            <span className="text-slate-500 font-normal">Dashboard</span>
          </div>
        </div>

        {/* 4. Portal-Style Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-poppins">
          {/* Card 1: Outstanding Count (Green) */}
          <div className="bg-[#00A65A] text-white rounded-xl shadow-md overflow-hidden flex flex-col justify-between min-h-[140px] transform hover:scale-[1.01] transition-transform">
            <div className="p-6">
              <span className="block font-bold text-4xl mb-1">{totalUnits - clearedCount}</span>
              <span className="text-xs font-bold uppercase tracking-wider text-white/80">Outstanding Offices</span>
            </div>
            <div 
              className="bg-[#008d4c] py-2 px-4 text-center text-[10px] sm:text-xs font-semibold text-white/95 flex items-center justify-center gap-1.5 cursor-pointer hover:bg-[#00733e] transition-colors" 
              onClick={() => handleScrollToSection("directory")}
            >
              <span>More info</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Card 2: Cleared Count (Orange) */}
          <div className="bg-[#F39C12] text-white rounded-xl shadow-md overflow-hidden flex flex-col justify-between min-h-[140px] transform hover:scale-[1.01] transition-transform">
            <div className="p-6">
              <span className="block font-bold text-4xl mb-1">{clearedCount}</span>
              <span className="text-xs font-bold uppercase tracking-wider text-white/80">Cleared Offices</span>
            </div>
            <div 
              className="bg-[#db8b0b] py-2 px-4 text-center text-[10px] sm:text-xs font-semibold text-white/95 flex items-center justify-center gap-1.5 cursor-pointer hover:bg-[#c87f0a] transition-colors" 
              onClick={() => handleScrollToSection("directory")}
            >
              <span>More info</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>

        {/* 5. Responsive Main Content Area (Directory + Profile card) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Table Directory Box (8-columns on large screens) */}
          <div id="directory" className="lg:col-span-8 bg-white py-6 px-4 sm:px-6 rounded-2xl shadow-md border border-slate-200 flex flex-col justify-between min-h-[500px]">
            <div>
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6 px-2">
                <div>
                  <h3 className="font-poppins font-semibold text-xl text-slate-800">
                    Clearance Directory
                  </h3>
                  <span className="text-xs text-[#00A65A] font-poppins font-semibold">
                    Active Requirements
                  </span>
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
                  <div className="relative w-full sm:w-56">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search Department"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs text-[#292D32] focus:outline-none focus:ring-2 focus:ring-[#3482B9] transition-all font-poppins"
                    />
                  </div>

                  <div className="relative w-full sm:w-auto">
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs text-slate-600 focus:outline-none focus:ring-2 focus:ring-[#3482B9] transition-all font-poppins cursor-pointer"
                    >
                      <option value="all">Sort by : All</option>
                      <option value="cleared">Cleared</option>
                      <option value="pending">Pending Review</option>
                      <option value="rejected">Rejected</option>
                      <option value="not_submitted">Not Submitted</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Responsive Scrollable Table */}
              <div className="overflow-x-auto rounded-lg border border-slate-100">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs font-semibold text-slate-400 font-poppins">
                      <th className="py-3 px-4">Clearing Office</th>
                      <th className="py-3 px-4">Description</th>
                      <th className="py-3 px-4 text-center">Status</th>
                      <th className="py-3 px-4 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-poppins text-xs font-medium text-[#292D32]">
                    {filteredRequests.length > 0 ? (
                      filteredRequests.map((req) => {
                        const style = getStatusStyle(req.status);
                        const unlocked = isRequestUnlocked(req);
                        const isLocked = (req.status === "NOT_SUBMITTED" || req.status === "REJECTED") && !unlocked;
                        
                        return (
                          <tr key={req.id} className="hover:bg-slate-50/55 transition-all">
                            <td className="py-4 px-4 font-semibold text-sm">
                              {req.clearingUnit.name}
                            </td>
                            <td className="py-4 px-4 text-slate-500 max-w-[200px] truncate" title={req.clearingUnit.description}>
                              {req.clearingUnit.description}
                            </td>
                            <td className="py-4 px-4 text-center">
                              {isLocked ? (
                                <span className="inline-block border border-slate-200 bg-slate-100 text-slate-400 rounded-md px-2.5 py-1 text-[11px] font-semibold w-28 text-center">
                                  Locked
                                </span>
                              ) : (
                                <span className={`inline-block border rounded-md px-2.5 py-1 text-[11px] font-semibold ${style.bg} ${style.border} ${style.text} w-28 text-center`}>
                                  {style.label}
                                </span>
                              )}
                            </td>
                            <td className="py-4 px-4 text-center">
                              {req.status === "NOT_SUBMITTED" || req.status === "REJECTED" ? (
                                unlocked ? (
                                  <button
                                    onClick={() => setUploadingUnit(req)}
                                    className="inline-flex items-center justify-center gap-1 text-xs font-semibold text-white bg-[#3482B9] hover:bg-[#2a6996] rounded-xl px-3.5 py-2 transition-all shadow-sm hover:shadow-md cursor-pointer shrink-0"
                                  >
                                    <Upload className="w-3.5 h-3.5" /> Submit File
                                  </button>
                                ) : (
                                  <button
                                    disabled
                                    title="You must obtain approval from the previous clearing office first."
                                    className="inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-400 bg-slate-100 border border-slate-200 rounded-xl px-3.5 py-2 transition-all cursor-not-allowed shrink-0"
                                  >
                                    <Lock className="w-3.5 h-3.5 text-slate-400" /> Locked
                                  </button>
                                )
                              ) : (
                                <button
                                  onClick={() => setUploadingUnit(req)}
                                  className="inline-flex items-center justify-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800 bg-white border border-slate-200 rounded-xl px-3.5 py-2 transition-all cursor-pointer hover:bg-slate-50 shrink-0"
                                >
                                  View Details
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={4} className="py-12 px-4 text-center text-slate-400">
                          No clearing requirements found matching filters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-8 px-2 font-poppins text-xs font-semibold">
              <span className="text-slate-400">
                Showing {filteredRequests.length} of {requests.length} entries
              </span>
              <div className="flex items-center gap-2">
                <button className="flex items-center justify-center w-6 h-6 border border-slate-200 bg-slate-50 rounded text-slate-500 disabled:opacity-50" disabled>
                  &lt;
                </button>
                <button className="flex items-center justify-center w-6 h-6 border border-[#3482B9] bg-[#3482B9] rounded text-white font-bold">
                  1
                </button>
                <button className="flex items-center justify-center w-6 h-6 border border-slate-200 bg-slate-50 rounded text-slate-500 disabled:opacity-50" disabled>
                  &gt;
                </button>
              </div>
            </div>
          </div>

          {/* Profile Card Sidebar Panel (4-columns on large screens) */}
          <div className="lg:col-span-4 flex flex-col gap-6 w-full">
            
            {/* Student Profile Card (Blue top border) */}
            <div className="border-t-4 border-[#3482B9] bg-white p-6 rounded-2xl shadow-md border border-slate-200 flex flex-col items-center justify-center text-center font-poppins">
              <div className="w-24 h-24 rounded-lg border-2 border-slate-200 bg-slate-50 overflow-hidden mb-4 flex items-center justify-center relative shadow-inner">
                <div className="w-full h-full bg-slate-100 flex items-center justify-center font-extrabold text-slate-400 text-3xl uppercase">
                  {user.name.charAt(0)}
                </div>
              </div>
              <h3 className="font-bold text-slate-800 text-base mb-1">{user.name}</h3>
              <div className="px-3 py-1 rounded-full bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-600 mb-4 select-all">
                {profile?.matricNumber || "Student"}
              </div>

              {/* Extra profile details */}
              <div className="w-full border-t border-slate-100 pt-4 mt-2 space-y-2.5 text-left text-xs text-slate-500 font-medium">
                <div className="flex justify-between gap-4">
                  <span className="text-slate-400">Department:</span>
                  <span className="font-bold text-slate-700 text-right">{profile?.department || "N/A"}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-slate-400">Faculty:</span>
                  <span className="font-bold text-slate-700 text-right">{profile?.faculty || "N/A"}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-slate-400">Level:</span>
                  <span className="font-bold text-slate-700 text-right">{profile?.level || "N/A"}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-slate-400">Graduation Session:</span>
                  <span className="font-bold text-slate-700 text-right">{profile?.sessionOfGraduation || "N/A"}</span>
                </div>
              </div>
            </div>

            {/* Certificate Download Panel (If fully cleared) */}
            {isFullyCleared && (
              <button
                onClick={handleDownloadCertificate}
                className="flex items-center justify-center gap-2 py-3.5 px-5 border border-transparent bg-[#3482B9] hover:bg-[#2a6996] text-white font-bold rounded-xl text-sm transition-all shadow-md shadow-[#3482B9]/20 hover:shadow-lg cursor-pointer w-full hover:translate-y-[-1px] active:translate-y-[1px]"
              >
                <Download className="w-4.5 h-4.5" /> Download Certificate
              </button>
            )}

          </div>

        </div>

      </main>

      {/* 6. Document Upload / Detail Modal */}
      {uploadingUnit && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 transition-all">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl border border-slate-200 p-8 flex flex-col gap-6 relative">
            <button 
              onClick={() => { setUploadingUnit(null); setSelectedFile(null); setUploadError(""); }}
              className="absolute right-6 top-6 text-slate-400 hover:text-slate-800 transition-colors cursor-pointer animate-fade-in"
            >
              <X className="w-6 h-6" />
            </button>

            <div>
              <h3 className="font-poppins font-semibold text-xl text-slate-800">
                {uploadingUnit.clearingUnit.name}
              </h3>
              <p className="text-xs text-slate-400 font-poppins mt-1">
                Clearance Submission Portal
              </p>
            </div>

            {uploadingUnit.status === "REJECTED" && uploadingUnit.rejectionNote && (
              <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-semibold">
                <span className="block uppercase text-[10px] tracking-wider mb-1 font-bold text-red-800">Rejection Note:</span>
                "{uploadingUnit.rejectionNote}"
              </div>
            )}

            {uploadingUnit.status !== "NOT_SUBMITTED" && uploadingUnit.status !== "REJECTED" ? (
              <div className="space-y-4">
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="w-8 h-8 text-[#3482B9]" />
                    <div>
                      <span className="block font-semibold text-xs text-slate-800">Submission Receipt</span>
                      <span className="block text-[10px] text-slate-400">
                        Uploaded {uploadingUnit.submittedAt ? new Date(uploadingUnit.submittedAt).toLocaleDateString() : "Pending"}
                      </span>
                    </div>
                  </div>
                  <span className={`inline-block border rounded px-2.5 py-1 text-[10px] font-bold uppercase ${getStatusStyle(uploadingUnit.status).bg} ${getStatusStyle(uploadingUnit.status).border} ${getStatusStyle(uploadingUnit.status).text}`}>
                    {uploadingUnit.status}
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-poppins text-center leading-relaxed mt-4">
                  This unit is locked for review. You will receive a notification if corrections are needed.
                </p>
              </div>
            ) : (
              <form onSubmit={handleUploadSubmit} className="space-y-6">
                {uploadError && (
                  <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-600 font-semibold">
                    {uploadError}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Select Verification Document
                  </label>
                  <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 hover:border-[#3482B9] transition-all cursor-pointer relative group">
                    <input
                      type="file"
                      accept=".pdf,image/*"
                      onChange={handleFileChange}
                      required
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    <Upload className="w-10 h-10 text-slate-450 group-hover:text-[#3482B9] transition-colors mb-3" />
                    {selectedFile ? (
                      <span className="text-xs text-slate-800 font-semibold break-all text-center">
                        {selectedFile.name}
                      </span>
                    ) : (
                      <>
                        <span className="text-xs text-slate-700 font-semibold">
                          Click to browse file
                        </span>
                        <span className="text-[10px] text-slate-400 mt-1">
                          Accepts PDF, PNG, JPG up to 5MB
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {checksum && (
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-[10px]">
                    <span className="font-semibold text-slate-400 uppercase">SHA-256 Checksum:</span>
                    <span className="font-mono text-slate-500 break-all select-all font-semibold max-w-[250px] truncate" title={checksum}>
                      {checksum}
                    </span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={uploadLoading || !selectedFile}
                  className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl text-sm font-semibold text-white bg-[#3482B9] hover:bg-[#2a6996] focus:outline-none shadow-md shadow-[#3482B9]/20 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploadLoading ? (
                    <Loader2 className="animate-spin h-5 w-5 mr-2" />
                  ) : (
                    <>
                      Upload Document & Submit
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
