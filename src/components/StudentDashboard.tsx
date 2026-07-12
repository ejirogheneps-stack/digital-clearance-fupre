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
  CheckCircle, 
  AlertCircle, 
  FileText, 
  Upload, 
  Download, 
  Loader2,
  X,
  Menu,
  Smile
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

  // Calculate SHA-256 checksum locally on client side for security validation
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
      fetchData(); // reload status
    } catch (err: any) {
      setUploadError(err.message || "An error occurred during upload");
    } finally {
      setUploadLoading(false);
    }
  };

  // Stats calculation
  const totalUnits = requests.length;
  const clearedCount = requests.filter(r => r.status === "APPROVED").length;
  const pendingCount = requests.filter(r => r.status === "PENDING_REVIEW" || r.status === "UNDER_REVIEW").length;
  const rejectedCount = requests.filter(r => r.status === "REJECTED").length;
  const isFullyCleared = totalUnits > 0 && clearedCount === totalUnits;
  const progressPercent = totalUnits > 0 ? Math.round((clearedCount / totalUnits) * 100) : 0;

  // Filter & Search table directory
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
          bg: "bg-[rgba(22,192,152,0.15)]",
          border: "border-[#00B087]",
          text: "text-[#008767]",
          label: "Cleared"
        };
      case "REJECTED":
        return {
          bg: "bg-[#FFC5C5]",
          border: "border-[#DF0404]",
          text: "text-[#DF0404]",
          label: "Rejected"
        };
      case "PENDING_REVIEW":
      case "UNDER_REVIEW":
        return {
          bg: "bg-[rgba(255,197,197,0.15)]",
          border: "border-[#DF9204]",
          text: "text-[#DF9204]",
          label: "Under Review"
        };
      default:
        return {
          bg: "bg-[#FAFBFF]",
          border: "border-[#B5B7C0]",
          text: "text-[#7E7E7E]",
          label: "Not Submitted"
        };
    }
  };

  const handleDownloadCertificate = () => {
    if (!profile) return;
    window.open(`/api/certificates/${user.id}?token=${token}`, "_blank");
  };

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#FAFBFF]">
        <Loader2 className="animate-spin h-10 w-10 text-[#5932EA]" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#FAFBFF] relative overflow-hidden">
      {/* Mobile Top Navigation Header */}
      <header className="lg:hidden fixed top-0 left-0 w-full h-16 bg-white border-b border-[#F0F4FA] flex items-center justify-between px-6 z-20 shadow-sm">
        <div className="flex items-center gap-2.5">
          <img 
            src="/fupre_logo.png" 
            alt="FUPRE Logo" 
            className="w-8 h-8 object-contain"
          />
          <div>
            <span className="font-poppins font-bold text-sm text-slate-900 tracking-tight">FUPRE DSCS</span>
            <span className="block text-[8px] text-[#5932EA] uppercase tracking-wider font-bold -mt-1">Digital Clearance</span>
          </div>
        </div>
        <button 
          onClick={() => setMobileMenuOpen(true)}
          className="p-1.5 rounded-lg border border-[#EEEEEE] hover:bg-slate-50 cursor-pointer"
        >
          <Menu className="w-6 h-6 text-slate-700" />
        </button>
      </header>

      {/* Mobile Side-Drawer Overlay */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop overlay */}
          <div 
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
          ></div>
          
          {/* Drawer Panel */}
          <aside className="relative w-72 max-w-xs bg-white h-full flex flex-col justify-between py-6 px-5 border-r shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            <div className="flex flex-col">
              {/* Close Button & Header */}
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

              {/* Navigation Menu */}
              <nav className="space-y-3">
                <a href="#" className="flex items-center justify-between px-3.5 py-2.5 bg-[#5932EA] text-white rounded-lg font-poppins font-medium text-xs">
                  <div className="flex items-center gap-2.5">
                    <LayoutDashboard className="w-4 h-4 text-white" />
                    <span>Dashboard</span>
                  </div>
                </a>
                
                <a href="#" className="flex items-center justify-between px-3.5 py-2.5 text-[#9197B3] hover:bg-slate-50 rounded-lg font-poppins font-medium text-xs">
                  <div className="flex items-center gap-2.5">
                    <UserIcon className="w-4 h-4 text-[#9197B3]" />
                    <span>Profile</span>
                  </div>
                </a>

                <a href="#" className="flex items-center justify-between px-3.5 py-2.5 text-[#9197B3] hover:bg-slate-50 rounded-lg font-poppins font-medium text-xs">
                  <div className="flex items-center gap-2.5">
                    <HelpCircle className="w-4 h-4 text-[#9197B3]" />
                    <span>Help</span>
                  </div>
                </a>

                {/* Accessible Sign Out */}
                <button 
                  onClick={() => { setMobileMenuOpen(false); onLogout(); }}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-red-500 hover:bg-red-50 rounded-lg font-poppins font-medium text-xs text-left cursor-pointer"
                >
                  <LogOut className="w-4 h-4 text-red-500" />
                  <span>Sign Out</span>
                </button>
              </nav>
            </div>

            {/* Profile bottom */}
            <div className="flex items-center justify-between pt-4 border-t border-[#EEEEEE]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#EAABF0] to-[#5932EA] flex items-center justify-center font-bold text-white uppercase text-xs">
                  {user.name.charAt(0)}
                </div>
                <div>
                  <span className="block font-poppins font-semibold text-xs text-black max-w-[100px] truncate">
                    {user.name}
                  </span>
                  <span className="block text-[8px] text-[#757575] font-poppins">
                    {profile?.matricNumber || "Student"}
                  </span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      )}

      {/* 1. Desktop Sidebar Menu */}
      <aside className="hidden lg:flex w-[306px] min-h-screen bg-white shadow-[0px_10px_60px_rgba(226,236,249,0.5)] flex flex-col justify-between py-9 px-7 border-r border-[#F0F4FA] shrink-0 z-10">
        <div className="flex flex-col">
          {/* FUPRE Logo Header */}
          <div className="flex items-center gap-3 mb-12">
            <img 
              src="/fupre_logo.png" 
              alt="FUPRE Logo" 
              className="w-10 h-10 object-contain"
            />
            <div>
              <span className="font-poppins font-semibold text-xl text-black">Dashboard</span>
              <span className="block text-[10px] text-[#838383] -mt-1 font-medium">v.01</span>
            </div>
          </div>

          {/* List Menu Items */}
          <nav className="space-y-4">
            <a href="#" className="flex items-center justify-between px-4 py-3 bg-[#5932EA] text-white rounded-lg transition-all group font-poppins font-medium text-sm">
              <div className="flex items-center gap-3">
                <LayoutDashboard className="w-5 h-5 text-white" />
                <span>Dashboard</span>
              </div>
            </a>
            
            <a href="#" className="flex items-center justify-between px-4 py-3 text-[#9197B3] hover:bg-[#FAFBFF] rounded-lg transition-all font-poppins font-medium text-sm group">
              <div className="flex items-center gap-3">
                <UserIcon className="w-5 h-5 text-[#9197B3] group-hover:text-[#5932EA]" />
                <span className="group-hover:text-[#292D32]">Profile</span>
              </div>
              <ChevronDown className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
            </a>

            <a href="#" className="flex items-center justify-between px-4 py-3 text-[#9197B3] hover:bg-[#FAFBFF] rounded-lg transition-all font-poppins font-medium text-sm group">
              <div className="flex items-center gap-3">
                <HelpCircle className="w-5 h-5 text-[#9197B3] group-hover:text-[#5932EA]" />
                <span className="group-hover:text-[#292D32]">Help</span>
              </div>
              <ChevronDown className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
            </a>

            {/* Accessible Labeled Logout Button */}
            <button 
              onClick={onLogout}
              className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 rounded-lg transition-all font-poppins font-medium text-sm text-left cursor-pointer"
            >
              <LogOut className="w-5 h-5 text-red-500" />
              <span>Sign Out</span>
            </button>
          </nav>
        </div>

          {/* User profile section bottom sidebar (Ellipse 8 / Group 30) */}
          <div className="flex items-center pt-4 border-t border-[#EEEEEE]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#EAABF0] to-[#5932EA] flex items-center justify-center font-bold text-white uppercase shadow-sm">
                {user.name.charAt(0)}
              </div>
              <div>
                <span className="block font-poppins font-semibold text-sm text-black max-w-[150px] truncate">
                  {user.name}
                </span>
                <span className="block text-[10px] text-[#757575] font-poppins">
                  {profile?.matricNumber || "Student"}
                </span>
              </div>
            </div>
          </div>
      </aside>

      {/* 2. Main Layout Context */}
      <main className="flex-1 min-h-screen pt-24 lg:pt-10 pb-10 px-6 lg:px-12 overflow-y-auto z-10 flex flex-col gap-8">
        {/* Banner Title Greeting */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-poppins font-normal text-2xl text-black flex items-center gap-2">
              Hello {user.name.split(" ")[0]} <Smile className="w-6 h-6 text-amber-500 inline-block" />
            </h1>
            <p className="text-xs text-[#9197B3] mt-1 font-medium">
              Check your requirements and clearance status details below.
            </p>
          </div>

          {/* Fully Cleared Certificate banner */}
          {isFullyCleared && (
            <button
              onClick={handleDownloadCertificate}
              className="flex items-center justify-center gap-2 py-3 px-5 border border-[#00B087] bg-[rgba(22,192,152,0.1)] hover:bg-[rgba(22,192,152,0.2)] text-[#008767] font-semibold rounded-xl text-sm transition-all shadow-md cursor-pointer w-full sm:w-auto hover:translate-y-[-1px] active:translate-y-[1px]"
            >
              <Download className="w-4 h-4" /> Download Clearance Certificate
            </button>
          )}
        </div>

        {/* 3. Statistics Widgets Rows (Figma Earning layout parameters) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-white py-6 px-10 rounded-[30px] shadow-[0px_10px_60px_rgba(226,236,249,0.5)] border border-[#F0F4FA]">
          {/* Stats 1: Progress */}
          <div className="flex items-center gap-5 pr-6 border-r border-[#F0F0F0] last:border-none">
            <div className="w-[84px] h-[84px] rounded-full bg-gradient-to-tr from-[#D3FFE7] to-[#EFFFF6] flex items-center justify-center">
              <TrendingUp className="w-10 h-10 text-[#00AC4F]" />
            </div>
            <div>
              <span className="block text-xs font-poppins text-[#ACACAC] mb-1">Clearance Progress</span>
              <span className="block font-poppins font-semibold text-3xl text-[#333333] leading-none mb-1">
                {progressPercent}%
              </span>
              <span className="text-[10px] text-[#00AC4F] font-bold">
                {clearedCount} of {totalUnits} cleared
              </span>
            </div>
          </div>

          {/* Stats 2: Reviewing */}
          <div className="flex items-center gap-5 pr-6 border-r border-[#F0F0F0] last:border-none">
            <div className="w-[84px] h-[84px] rounded-full bg-gradient-to-tr from-[#E6E6FA] to-[#F5F5FC] flex items-center justify-center">
              <Activity className="w-10 h-10 text-[#5932EA]" />
            </div>
            <div>
              <span className="block text-xs font-poppins text-[#ACACAC] mb-1">Pending Review</span>
              <span className="block font-poppins font-semibold text-3xl text-[#333333] leading-none mb-1">
                {pendingCount}
              </span>
              <span className="text-[10px] text-[#5932EA] font-bold">
                Under review by staff
              </span>
            </div>
          </div>

          {/* Stats 3: Rejected */}
          <div className="flex items-center gap-5 last:border-none">
            <div className="w-[84px] h-[84px] rounded-full bg-[#FFEAEA] flex items-center justify-center">
              <AlertCircle className="w-10 h-10 text-[#DF0404]" />
            </div>
            <div>
              <span className="block text-xs font-poppins text-[#ACACAC] mb-1">Attention Required</span>
              <span className="block font-poppins font-semibold text-3xl text-[#333333] leading-none mb-1">
                {rejectedCount}
              </span>
              <span className={`text-[10px] font-bold ${rejectedCount > 0 ? 'text-[#DF0404]' : 'text-[#ACACAC]'}`}>
                {rejectedCount > 0 ? "Requires correction" : "No active warnings"}
              </span>
            </div>
          </div>
        </div>

        {/* 4. Table Directory Section (Figma Product box card parameters) */}
        <div className="bg-white py-8 px-6 rounded-[30px] shadow-[0px_10px_60px_rgba(226,236,249,0.5)] border border-[#F0F4FA] flex-1 flex flex-col justify-between min-h-[500px]">
          <div>
            {/* Header controls inside card table */}
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6 px-4">
              <div>
                <h3 className="font-poppins font-semibold text-2xl text-black">
                  Clearance Directory
                </h3>
                <span className="text-xs text-[#16C098] font-poppins font-normal">
                  Active Requirements
                </span>
              </div>

              {/* Search & Sort Widgets */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
                {/* Search control */}
                <div className="relative w-full md:w-64">
                  <Search className="w-5 h-5 text-[#B5B7C0] absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search Department"
                    className="w-full bg-[#F9FBFF] border border-none rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#292D32] focus:outline-none focus:ring-2 focus:ring-[#5932EA] transition-all font-poppins"
                  />
                </div>

                {/* Filter status dropdown */}
                <div className="relative w-full sm:w-auto">
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="bg-[#F9FBFF] border border-[#EEEEEE] rounded-xl px-4 py-2 text-xs text-[#7E7E7E] focus:outline-none focus:ring-2 focus:ring-[#5932EA] transition-all font-poppins cursor-pointer"
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

            {/* Table layout container */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-[#EEEEEE] text-left text-xs font-semibold text-[#B5B7C0] font-poppins">
                    <th className="py-4 px-6">Clearing Office</th>
                    <th className="py-4 px-6">Description</th>
                    <th className="py-4 px-6 text-center">Status</th>
                    <th className="py-4 px-6 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EEEEEE] font-poppins text-xs font-medium text-[#292D32]">
                  {filteredRequests.length > 0 ? (
                    filteredRequests.map((req) => {
                      const style = getStatusStyle(req.status);
                      return (
                        <tr key={req.id} className="hover:bg-[#FAFBFF] transition-all group">
                          <td className="py-4 px-6 font-semibold text-sm">
                            {req.clearingUnit.name}
                          </td>
                          <td className="py-4 px-6 text-[#7E7E7E] max-w-sm truncate" title={req.clearingUnit.description}>
                            {req.clearingUnit.description}
                          </td>
                          <td className="py-4 px-6 text-center">
                            <span className={`inline-block border rounded px-3 py-1.5 text-xs font-semibold ${style.bg} ${style.border} ${style.text} w-28 text-center`}>
                              {style.label}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-center">
                            {req.status === "NOT_SUBMITTED" || req.status === "REJECTED" ? (
                              <button
                                onClick={() => setUploadingUnit(req)}
                                className="inline-flex items-center gap-1 text-xs font-semibold text-white bg-[#5932EA] hover:bg-[#4623E9] border border-[#5932EA] rounded-lg px-3.5 py-2.5 transition-all shadow-md hover:shadow-lg cursor-pointer"
                              >
                                <Upload className="w-3.5 h-3.5" /> Submit File
                              </button>
                            ) : (
                              <button
                                onClick={() => setUploadingUnit(req)}
                                className="inline-flex items-center gap-1 text-xs font-semibold text-[#5932EA] hover:text-[#4623E9] bg-white border border-[#EEEEEE] rounded-lg px-3.5 py-2.5 transition-all cursor-pointer"
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
                      <td colSpan={4} className="py-12 px-6 text-center text-[#B5B7C0]">
                        No clearing requirements found matching filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Footer showing item details (Figma pagination specs) */}
          <div className="flex justify-between items-center mt-8 px-4 font-poppins text-xs font-semibold">
            <span className="text-[#B5B7C0]">
              Showing {filteredRequests.length} of {requests.length} entries
            </span>
            <div className="flex items-center gap-2">
              <button className="flex items-center justify-center w-6 h-6 border border-[#EEEEEE] bg-[#F5F5F5] rounded text-[#404B52] disabled:opacity-50" disabled>
                &lt;
              </button>
              <button className="flex items-center justify-center w-6 h-6 border border-[#5932EA] bg-[#5932EA] rounded text-white font-bold">
                1
              </button>
              <button className="flex items-center justify-center w-6 h-6 border border-[#EEEEEE] bg-[#F5F5F5] rounded text-[#404B52] disabled:opacity-50" disabled>
                &gt;
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* 5. Document Upload / Detail Modal */}
      {uploadingUnit && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 transition-all">
          <div className="bg-white w-full max-w-lg rounded-[30px] shadow-[0px_10px_60px_rgba(226,236,249,0.9)] border border-[#F0F4FA] p-8 flex flex-col gap-6 relative">
            <button 
              onClick={() => { setUploadingUnit(null); setSelectedFile(null); setUploadError(""); }}
              className="absolute right-6 top-6 text-[#9197B3] hover:text-black transition-colors cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>

            <div>
              <h3 className="font-poppins font-semibold text-2xl text-black">
                {uploadingUnit.clearingUnit.name}
              </h3>
              <p className="text-xs text-[#9197B3] font-poppins mt-1">
                Clearance Submission Portal
              </p>
            </div>

            {/* If there is a rejection note, display it */}
            {uploadingUnit.status === "REJECTED" && uploadingUnit.rejectionNote && (
              <div className="p-4 bg-[#FFEAEA] border border-[#DF0404] text-[#DF0404] rounded-xl text-xs font-semibold">
                <span className="block uppercase text-[10px] tracking-wider mb-1 font-bold text-red-700">Rejection Note:</span>
                "{uploadingUnit.rejectionNote}"
              </div>
            )}

            {/* If it's already cleared or pending, show read-only details */}
            {uploadingUnit.status !== "NOT_SUBMITTED" && uploadingUnit.status !== "REJECTED" ? (
              <div className="space-y-4">
                <div className="p-4 bg-[#FAFBFF] border border-[#EEEEEE] rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="w-8 h-8 text-[#5932EA]" />
                    <div>
                      <span className="block font-semibold text-xs text-black">Submission Receipt</span>
                      <span className="block text-[10px] text-[#9197B3]">
                        Uploaded {uploadingUnit.submittedAt ? new Date(uploadingUnit.submittedAt).toLocaleDateString() : "Pending"}
                      </span>
                    </div>
                  </div>
                  <span className={`inline-block border rounded px-3 py-1 text-[10px] font-bold uppercase ${getStatusStyle(uploadingUnit.status).bg} ${getStatusStyle(uploadingUnit.status).border} ${getStatusStyle(uploadingUnit.status).text}`}>
                    {uploadingUnit.status}
                  </span>
                </div>
                <p className="text-xs text-[#9197B3] font-poppins text-center leading-relaxed mt-4">
                  This unit is locked for review. You will receive an notification if corrections are needed.
                </p>
              </div>
            ) : (
              /* Otherwise, show the upload form */
              <form onSubmit={handleUploadSubmit} className="space-y-6">
                {uploadError && (
                  <div className="p-4 rounded-xl bg-[#FFEAEA] border border-[#DF0404] text-xs text-[#DF0404] font-semibold">
                    {uploadError}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-[#9197B3] uppercase tracking-wider mb-2">
                    Select Verification Document
                  </label>
                  <div className="border-2 border-dashed border-[#EEEEEE] rounded-2xl p-8 flex flex-col items-center justify-center bg-[#FAFBFF] hover:bg-[#F9FBFF] hover:border-[#5932EA] transition-all cursor-pointer relative group">
                    <input
                      type="file"
                      accept=".pdf,image/*"
                      onChange={handleFileChange}
                      required
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    <Upload className="w-10 h-10 text-[#B5B7C0] group-hover:text-[#5932EA] transition-colors mb-3" />
                    {selectedFile ? (
                      <span className="text-xs text-[#292D32] font-semibold break-all text-center">
                        {selectedFile.name}
                      </span>
                    ) : (
                      <>
                        <span className="text-xs text-[#292D32] font-semibold">
                          Click to browse file
                        </span>
                        <span className="text-[10px] text-[#9197B3] mt-1">
                          Accepts PDF, PNG, JPG up to 5MB
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {checksum && (
                  <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl flex items-center justify-between text-[10px]">
                    <span className="font-semibold text-zinc-500 uppercase">SHA-256 Checksum:</span>
                    <span className="font-mono text-zinc-600 break-all select-all font-semibold max-w-[250px] truncate" title={checksum}>
                      {checksum}
                    </span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={uploadLoading || !selectedFile}
                  className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl text-sm font-semibold text-white bg-[#5932EA] hover:bg-[#4623E9] focus:outline-none shadow-lg shadow-[rgba(89,50,234,0.25)] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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
