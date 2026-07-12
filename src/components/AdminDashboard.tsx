"use client";

import { useState, useEffect } from "react";
import { 
  GraduationCap, 
  LayoutDashboard, 
  Users, 
  FolderLock, 
  ShieldCheck, 
  HelpCircle, 
  LogOut, 
  Search, 
  ChevronDown, 
  Activity, 
  UserCheck, 
  AlertCircle, 
  Eye, 
  Settings, 
  History,
  X,
  Menu,
  Smile,
  Check,
  AlertTriangle,
  Loader2
} from "lucide-react";

interface Student {
  userId: string;
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
  clearanceRequests: Array<{
    id: string;
    status: string;
    unitId: string;
    clearingUnit: {
      name: string;
    };
  }>;
}

interface AuditLog {
  id: string;
  actorId: string | null;
  actorRole: string;
  action: string;
  entityType: string;
  entityId: string | null;
  metadata: any;
  timestamp: string;
  actor?: {
    email: string;
    name: string;
  };
}

interface AdminDashboardProps {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  onLogout: () => void;
}

export default function AdminDashboard({ user, onLogout }: AdminDashboardProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"students" | "audit">("students");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [overrideRequest, setOverrideRequest] = useState<any | null>(null);
  const [overrideNote, setOverrideNote] = useState("");
  const [overrideLoading, setOverrideLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const token = typeof window !== "undefined" ? localStorage.getItem("dscs_token") : null;

  const fetchAdminData = async () => {
    try {
      const studentRes = await fetch("/api/admin/students", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const studentData = await studentRes.json();
      setStudents(studentData.students || []);

      const logsRes = await fetch("/api/admin/audit-logs", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const logsData = await logsRes.json();
      setAuditLogs(logsData.auditLogs || []);
    } catch (e) {
      console.error("Error fetching admin dashboard records:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchAdminData();
    }
  }, [token]);

  const handleOverrideSubmit = async (e: React.FormEvent, forceStatus: "APPROVED" | "REJECTED") => {
    e.preventDefault();
    if (!overrideRequest || !overrideNote.trim()) return;

    setOverrideLoading(true);
    try {
      const res = await fetch(`/api/admin/clearance/${overrideRequest.id}/override`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ 
          status: forceStatus, 
          justification: overrideNote 
        })
      });

      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.error || "Override request failed");
      }

      setOverrideRequest(null);
      setOverrideNote("");
      
      // Reload student data
      await fetchAdminData();
      
      // Update selected student UI state if open
      if (selectedStudent) {
        const updatedStud = students.find(s => s.userId === selectedStudent.userId);
        if (updatedStud) {
          setSelectedStudent(updatedStud);
        }
      }
    } catch (err: any) {
      alert(err.message || "An error occurred");
    } finally {
      setOverrideLoading(false);
    }
  };

  // Stats calculation
  const totalStudentsCount = students.length;
  const fullyClearedCount = students.filter(s => 
    s.clearanceRequests.length > 0 && s.clearanceRequests.every(r => r.status === "APPROVED")
  ).length;
  const pendingStudentsCount = totalStudentsCount - fullyClearedCount;

  // Filter & Search student database
  const filteredStudents = students.filter(s => {
    const nameMatch = s.user.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matricMatch = s.matricNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const deptMatch = s.department.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSearch = nameMatch || matricMatch || deptMatch;

    const allApproved = s.clearanceRequests.length > 0 && s.clearanceRequests.every(r => r.status === "APPROVED");
    if (filterStatus === "all") return matchesSearch;
    if (filterStatus === "cleared") return matchesSearch && allApproved;
    if (filterStatus === "pending") return matchesSearch && !allApproved;
    return matchesSearch;
  });

  const getOverallStatusStyle = (student: Student) => {
    const reqs = student.clearanceRequests;
    if (reqs.length === 0) return { bg: "bg-[#FAFBFF]", text: "text-[#7E7E7E]", label: "Uninitialized" };
    
    const allApproved = reqs.every(r => r.status === "APPROVED");
    if (allApproved) {
      return { 
        bg: "bg-[rgba(22,192,152,0.15)]", 
        border: "border-[#00B087]", 
        text: "text-[#008767]", 
        label: "Fully Cleared" 
      };
    }

    const hasRejections = reqs.some(r => r.status === "REJECTED");
    if (hasRejections) {
      return { 
        bg: "bg-[#FFC5C5]", 
        border: "border-[#DF0404]", 
        text: "text-[#DF0404]", 
        label: "Attention Needed" 
      };
    }

    return { 
      bg: "bg-[rgba(255,197,197,0.15)]", 
      border: "border-[#DF9204]", 
      text: "text-[#DF9204]", 
      label: "Pending Review" 
    };
  };

  const getUnitStatusColor = (status: string) => {
    switch (status) {
      case "APPROVED": return "text-green-600 bg-green-50 border-green-200";
      case "REJECTED": return "text-red-600 bg-red-50 border-red-200";
      case "PENDING_REVIEW":
      case "UNDER_REVIEW": return "text-amber-600 bg-amber-50 border-amber-200";
      default: return "text-zinc-500 bg-zinc-50 border-zinc-200";
    }
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
            <span className="block text-[8px] text-[#5932EA] uppercase tracking-wider font-bold -mt-1">Admin Portal</span>
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
                <button 
                  onClick={() => { setActiveTab("students"); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg transition-all font-poppins font-medium text-xs text-left cursor-pointer ${
                    activeTab === "students" 
                      ? "bg-[#5932EA] text-white" 
                      : "text-[#9197B3] hover:bg-slate-50 hover:text-[#292D32]"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Users className="w-4 h-4" />
                    <span>Graduating Students</span>
                  </div>
                </button>
                
                <button 
                  onClick={() => { setActiveTab("audit"); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg transition-all font-poppins font-medium text-xs text-left cursor-pointer ${
                    activeTab === "audit" 
                      ? "bg-[#5932EA] text-white" 
                      : "text-[#9197B3] hover:bg-slate-50 hover:text-[#292D32]"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <History className="w-4 h-4" />
                    <span>Audit Logs</span>
                  </div>
                </button>

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
                  <span className="block font-poppins font-semibold text-xs text-black max-w-[100px] truncate" title={user.name}>
                    {user.name}
                  </span>
                  <span className="block text-[8px] text-[#757575] font-poppins capitalize">
                    {user.role.toLowerCase()}
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
          {/* Logo Header */}
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
            <button 
              onClick={() => setActiveTab("students")}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all group font-poppins font-medium text-sm cursor-pointer ${
                activeTab === "students" 
                  ? "bg-[#5932EA] text-white" 
                  : "text-[#9197B3] hover:bg-[#FAFBFF] hover:text-[#292D32]"
              }`}
            >
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5" />
                <span>Graduating Students</span>
              </div>
            </button>
            
            <button 
              onClick={() => setActiveTab("audit")}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all group font-poppins font-medium text-sm cursor-pointer ${
                activeTab === "audit" 
                  ? "bg-[#5932EA] text-white" 
                  : "text-[#9197B3] hover:bg-[#FAFBFF] hover:text-[#292D32]"
              }`}
            >
              <div className="flex items-center gap-3">
                <History className="w-5 h-5" />
                <span>Audit Logs</span>
              </div>
            </button>

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
                <span className="block font-poppins font-semibold text-sm text-black max-w-[150px] truncate" title={user.name}>
                  {user.name}
                </span>
                <span className="block text-[10px] text-[#757575] font-poppins capitalize">
                  {user.role.toLowerCase()}
                </span>
              </div>
            </div>
          </div>
      </aside>

      {/* 2. Main Layout Context */}
      <main className="flex-1 min-h-screen pt-24 lg:pt-10 pb-10 px-6 lg:px-12 overflow-y-auto z-10 flex flex-col gap-8">
        {/* Banner Title Greeting */}
        <div>
          <h1 className="font-poppins font-normal text-2xl text-black flex items-center gap-2">
            Hello Administrator <Smile className="w-6 h-6 text-amber-500 inline-block" />
          </h1>
          <p className="text-xs text-[#9197B3] mt-1 font-medium">
            Manage student registrations, clearing units overrides, and view transactions.
          </p>
        </div>

        {/* 3. Statistics Widgets Rows (Figma Earning layout parameters) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-white py-6 px-10 rounded-[30px] shadow-[0px_10px_60px_rgba(226,236,249,0.5)] border border-[#F0F4FA]">
          {/* Stats 1: Total Students */}
          <div className="flex items-center gap-5 pr-6 border-r border-[#F0F0F0] last:border-none">
            <div className="w-[84px] h-[84px] rounded-full bg-gradient-to-tr from-[#D3FFE7] to-[#EFFFF6] flex items-center justify-center">
              <Users className="w-10 h-10 text-[#00AC4F]" />
            </div>
            <div>
              <span className="block text-xs font-poppins text-[#ACACAC] mb-1">Graduating Students</span>
              <span className="block font-poppins font-semibold text-3xl text-[#333333] leading-none mb-1">
                {totalStudentsCount}
              </span>
              <span className="text-[10px] text-[#00AC4F] font-bold">
                Registered profiles
              </span>
            </div>
          </div>

          {/* Stats 2: Fully Cleared */}
          <div className="flex items-center gap-5 pr-6 border-r border-[#F0F0F0] last:border-none">
            <div className="w-[84px] h-[84px] rounded-full bg-blue-50 flex items-center justify-center">
              <UserCheck className="w-10 h-10 text-[#5932EA]" />
            </div>
            <div>
              <span className="block text-xs font-poppins text-[#ACACAC] mb-1">Fully Cleared</span>
              <span className="block font-poppins font-semibold text-3xl text-[#333333] leading-none mb-1">
                {fullyClearedCount}
              </span>
              <span className="text-[10px] text-[#5932EA] font-bold">
                Clearance certificate unlocked
              </span>
            </div>
          </div>

          {/* Stats 3: Action Pending */}
          <div className="flex items-center gap-5 last:border-none">
            <div className="w-[84px] h-[84px] rounded-full bg-orange-50 flex items-center justify-center">
              <AlertCircle className="w-10 h-10 text-orange-500" />
            </div>
            <div>
              <span className="block text-xs font-poppins text-[#ACACAC] mb-1">Uncleared Status</span>
              <span className="block font-poppins font-semibold text-3xl text-[#333333] leading-none mb-1">
                {pendingStudentsCount}
              </span>
              <span className="text-[10px] text-orange-500 font-bold">
                Require clearing reviews
              </span>
            </div>
          </div>
        </div>

        {/* 4. Table Directory Section (Figma Product box card parameters) */}
        {activeTab === "students" ? (
          <div className="bg-white py-8 px-6 rounded-[30px] shadow-[0px_10px_60px_rgba(226,236,249,0.5)] border border-[#F0F4FA] flex-1 flex flex-col justify-between min-h-[500px]">
            <div>
              {/* Header controls inside card table */}
              <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6 px-4">
                <div>
                  <h3 className="font-poppins font-semibold text-2xl text-black">
                    Graduating Students
                  </h3>
                  <span className="text-xs text-[#16C098] font-poppins font-normal">
                    Student database
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
                      placeholder="Search Student name or Matric"
                      className="w-full bg-[#F9FBFF] border border-none rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#292D32] focus:outline-none focus:ring-2 focus:ring-[#5932EA] transition-all font-poppins"
                    />
                  </div>

                  {/* Filter status dropdown */}
                  <div className="relative w-full sm:w-auto">
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="bg-[#F9FBFF] border border-[#EEEEEE] rounded-xl px-4 py-2 text-xs text-[#7E7E7E] focus:outline-none focus:ring-2 focus:ring-[#5932EA] transition-all font-poppins cursor-pointer w-full"
                    >
                      <option value="all">Sort by : All</option>
                      <option value="cleared">Fully Cleared</option>
                      <option value="pending">Review Pending</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Table layout container */}
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-[#EEEEEE] text-left text-xs font-semibold text-[#B5B7C0] font-poppins">
                      <th className="py-4 px-6">Graduating Student</th>
                      <th className="py-4 px-6">Department</th>
                      <th className="py-4 px-6">Faculty</th>
                      <th className="py-4 px-6 text-center">Clearance Status</th>
                      <th className="py-4 px-6 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EEEEEE] font-poppins text-xs font-medium text-[#292D32]">
                    {filteredStudents.length > 0 ? (
                      filteredStudents.map((stud) => {
                        const style = getOverallStatusStyle(stud);
                        return (
                          <tr key={stud.userId} className="hover:bg-[#FAFBFF] transition-all group">
                            <td className="py-4 px-6">
                              <span className="block font-semibold text-sm text-black">
                                {stud.user.name}
                              </span>
                              <span className="block text-[10px] text-[#9197B3]">
                                {stud.matricNumber} / {stud.user.email}
                              </span>
                            </td>
                            <td className="py-4 px-6 text-[#7E7E7E]">
                              {stud.department}
                            </td>
                            <td className="py-4 px-6 text-[#7E7E7E]">
                              {stud.faculty}
                            </td>
                            <td className="py-4 px-6 text-center">
                              <span className={`inline-block border rounded px-3 py-1.5 text-xs font-semibold ${style.bg} ${style.border} ${style.text} w-36 text-center`}>
                                {style.label}
                              </span>
                            </td>
                            <td className="py-4 px-6 text-center">
                              <button
                                onClick={() => setSelectedStudent(stud)}
                                className="inline-flex items-center gap-1 text-xs font-semibold text-white bg-[#5932EA] hover:bg-[#4623E9] border border-[#5932EA] rounded-lg px-3.5 py-2.5 transition-all shadow-md cursor-pointer"
                              >
                                <Eye className="w-3.5 h-3.5" /> View Progress
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={5} className="py-12 px-6 text-center text-[#B5B7C0]">
                          No students found matching search filters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Footer paging */}
            <div className="flex justify-between items-center mt-8 px-4 font-poppins text-xs font-semibold">
              <span className="text-[#B5B7C0]">
                Showing {filteredStudents.length} of {students.length} entries
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
        ) : (
          /* Audit Logs list viewer */
          <div className="bg-white py-8 px-6 rounded-[30px] shadow-[0px_10px_60px_rgba(226,236,249,0.5)] border border-[#F0F4FA] flex-1 flex flex-col justify-between min-h-[500px]">
            <div>
              <div className="mb-6 px-4">
                <h3 className="font-poppins font-semibold text-2xl text-black">
                  System Audit Logs
                </h3>
                <span className="text-xs text-[#16C098] font-poppins font-normal">
                  Append-only immutable transaction entries
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-[#EEEEEE] text-left text-xs font-semibold text-[#B5B7C0] font-poppins">
                      <th className="py-4 px-6">Timestamp</th>
                      <th className="py-4 px-6">Actor Details</th>
                      <th className="py-4 px-6">Action</th>
                      <th className="py-4 px-6">Description / Entity</th>
                      <th className="py-4 px-6">Metadata</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EEEEEE] font-poppins text-xs font-medium text-[#292D32]">
                    {auditLogs.length > 0 ? (
                      auditLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-[#FAFBFF] transition-all">
                          <td className="py-4 px-6 text-[#7E7E7E]">
                            {new Date(log.timestamp).toLocaleString()}
                          </td>
                          <td className="py-4 px-6">
                            <span className="block font-semibold text-black">
                              {log.actor?.name || "System Process"}
                            </span>
                            <span className="block text-[10px] text-[#9197B3]">
                              Role: {log.actorRole}
                            </span>
                          </td>
                          <td className="py-4 px-6 font-mono text-xs font-bold text-indigo-700">
                            {log.action}
                          </td>
                          <td className="py-4 px-6 text-[#7E7E7E]">
                            {log.entityType} ({log.entityId?.substring(0, 8)}...)
                          </td>
                          <td className="py-4 px-6 max-w-xs truncate text-[10px] text-zinc-500 bg-zinc-50" title={JSON.stringify(log.metadata)}>
                            {JSON.stringify(log.metadata)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="py-12 px-6 text-center text-[#B5B7C0]">
                          No audit log transactions registered yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* 5. Student Progress Detail / Override Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-40 p-4 transition-all">
          <div className="bg-white w-full max-w-2xl rounded-[30px] shadow-[0px_10px_60px_rgba(226,236,249,0.9)] border border-[#F0F4FA] p-8 flex flex-col gap-6 relative max-h-[85vh] overflow-y-auto">
            <button 
              onClick={() => setSelectedStudent(null)}
              className="absolute right-6 top-6 text-[#9197B3] hover:text-black transition-colors cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>

            <div>
              <h3 className="font-poppins font-semibold text-2xl text-black">
                {selectedStudent.user.name}
              </h3>
              <p className="text-xs text-[#9197B3] font-poppins mt-1">
                Matric: {selectedStudent.matricNumber} / Dept: {selectedStudent.department} / Faculty: {selectedStudent.faculty}
              </p>
            </div>

            {/* Clearance Request Status List */}
            <div className="space-y-4">
              <span className="block text-xs font-semibold text-[#9197B3] uppercase tracking-wider mb-2">
                Requirements Checklist
              </span>
              <div className="divide-y divide-[#EEEEEE] border border-[#EEEEEE] rounded-2xl overflow-hidden bg-[#FAFBFF]">
                {selectedStudent.clearanceRequests.map((req) => (
                  <div key={req.id} className="flex items-center justify-between p-4 bg-white hover:bg-[#FAFBFF] transition-all">
                    <div>
                      <span className="block font-semibold text-sm text-black">
                        {req.clearingUnit.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`inline-block border rounded px-2.5 py-1 text-[10px] font-bold uppercase ${getUnitStatusColor(req.status)}`}>
                        {req.status}
                      </span>
                      {user.role === "ADMIN" && (
                        <button
                          onClick={() => setOverrideRequest({ id: req.id, unitName: req.clearingUnit.name, currentStatus: req.status })}
                          className="px-2.5 py-1.5 bg-zinc-100 hover:bg-indigo-50 border border-zinc-200 hover:border-[#5932EA] rounded-lg text-[10px] font-bold text-[#9197B3] hover:text-[#5932EA] transition-all cursor-pointer"
                        >
                          Override
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. Admin Override Modal */}
      {overrideRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 transition-all">
          <div className="bg-white w-full max-w-md rounded-[30px] shadow-[0px_10px_60px_rgba(226,236,249,0.9)] border border-[#F0F4FA] p-8 flex flex-col gap-6 relative">
            <button 
              onClick={() => { setOverrideRequest(null); setOverrideNote(""); }}
              className="absolute right-6 top-6 text-[#9197B3] hover:text-black transition-colors cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-[#5932EA]">
                <Settings className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-poppins font-semibold text-lg text-black">
                  Manual Status Override
                </h3>
                <p className="text-xs text-[#9197B3] font-poppins">
                  Office: {overrideRequest.unitName} (Current: {overrideRequest.currentStatus})
                </p>
              </div>
            </div>

            <form className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#9197B3] uppercase tracking-wider mb-2">
                  Override Justification (Required)
                </label>
                <textarea
                  required
                  rows={3}
                  value={overrideNote}
                  onChange={(e) => setOverrideNote(e.target.value)}
                  placeholder="State the administrative reason for this manual clearance override."
                  className="block w-full px-4 py-3 border border-[#EEEEEE] rounded-xl bg-[#FAFBFF] text-[#292D32] placeholder-[#B5B7C0] focus:outline-none focus:ring-2 focus:ring-[#5932EA] focus:border-transparent transition-all text-xs resize-none font-poppins font-medium leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={(e) => handleOverrideSubmit(e, "APPROVED")}
                  disabled={overrideLoading || !overrideNote.trim()}
                  className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl text-xs font-semibold text-white bg-[#00B087] hover:bg-[#008767] focus:outline-none shadow-md transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {overrideLoading ? (
                    <Loader2 className="animate-spin h-4 w-4" />
                  ) : (
                    "Force Approve"
                  )}
                </button>
                <button
                  type="button"
                  onClick={(e) => handleOverrideSubmit(e, "REJECTED")}
                  disabled={overrideLoading || !overrideNote.trim()}
                  className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl text-xs font-semibold text-white bg-[#DF0404] hover:bg-red-700 focus:outline-none shadow-md transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {overrideLoading ? (
                    <Loader2 className="animate-spin h-4 w-4" />
                  ) : (
                    "Force Reject"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
