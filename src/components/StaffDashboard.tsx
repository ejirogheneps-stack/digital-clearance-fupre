"use client";

import { useState, useEffect } from "react";
import { 
  GraduationCap, 
  LayoutDashboard, 
  HelpCircle, 
  LogOut, 
  Search, 
  ChevronDown, 
  Users, 
  Clock, 
  CheckSquare, 
  Eye, 
  Check, 
  X,
  Menu,
  Smile,
  Loader2,
  AlertTriangle 
} from "lucide-react";

interface Document {
  id: string;
  fileName: string;
  fileUrl: string;
  checksum: string;
  uploadedAt: string;
}

interface Submission {
  id: string;
  studentId: string;
  status: string;
  submittedAt: string | null;
  reviewedAt: string | null;
  rejectionNote: string | null;
  student: {
    matricNumber: string;
    department: string;
    faculty: string;
    user: {
      name: string;
      email: string;
    };
  };
  documents: Document[];
}

interface StaffDashboardProps {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  onLogout: () => void;
}

export default function StaffDashboard({ user, onLogout }: StaffDashboardProps) {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [unitName, setUnitName] = useState("");
  const [unitId, setUnitId] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [rejectingRequest, setRejectingRequest] = useState<Submission | null>(null);
  const [rejectionNote, setRejectionNote] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const token = typeof window !== "undefined" ? localStorage.getItem("dscs_token") : null;

  const fetchSubmissions = async () => {
    try {
      // 1. Get staff unit assignment
      // Since a staff is assigned to a unit, let's fetch staff profile or units first
      // In the seed script, we assigned staff member users to units
      // Let's call the admin endpoints or load dynamically by checking which unit this staff belongs to
      // To get the unit assigned to the logged-in staff member, we can make a query to get staff assignment
      // Wait, let's call the GET /api/students/me to load, or wait:
      // The staff user ID matches their staff record ID.
      // Let's fetch unitId by calling the submissions endpoint with a dummy 'my-unit' or checking all units.
      // Wait! We can call GET /api/admin/staff and find this staff, OR let's call `/api/units/` or submissions queue.
      // Wait, is there a unit detection endpoint?
      // In our route implementation: GET `/api/units/[unitId]/submissions`
      // Wait! How does the staff know their unitId?
      // We can fetch the list of all clearing units `/api/admin/units`, and for each unit fetch submissions.
      // Or, better yet, the staff can load their details from the database!
      // Let's check how staff details are queried:
      // We can fetch `GET /api/admin/staff` and look for the staff entry where `userId === user.id`.
      // The staff record contains `assignments` listing their `unitId`!
      const staffRes = await fetch("/api/admin/staff", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const staffData = await staffRes.json();
      
      const currentStaff = staffData.staff?.find((s: any) => s.userId === user.id);
      const assignedUnit = currentStaff?.assignments?.[0]?.clearingUnit;

      if (assignedUnit) {
        setUnitName(assignedUnit.name);
        setUnitId(assignedUnit.id);
        
        // 2. Fetch submissions for this unit
        const subRes = await fetch(`/api/units/${assignedUnit.id}/submissions`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        const subData = await subRes.json();
        setSubmissions(subData.submissions || []);
      }
    } catch (e) {
      console.error("Error loading staff review queue:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchSubmissions();
    }
  }, [token]);

  const handleApprove = async (requestId: string) => {
    if (!confirm("Are you sure you want to approve this student's clearance request?")) return;
    setActionLoading(requestId);

    try {
      const res = await fetch(`/api/submissions/${requestId}/approve`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });
      
      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.error || "Approval failed");
      }

      fetchSubmissions();
    } catch (err: any) {
      alert(err.message || "An error occurred");
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingRequest || !rejectionNote.trim()) return;
    
    const requestId = rejectingRequest.id;
    setActionLoading(requestId);

    try {
      const res = await fetch(`/api/submissions/${requestId}/reject`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ rejectionNote })
      });
      
      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.error || "Rejection failed");
      }

      setRejectingRequest(null);
      setRejectionNote("");
      fetchSubmissions();
    } catch (err: any) {
      alert(err.message || "An error occurred");
    } finally {
      setActionLoading(null);
    }
  };

  // Filter & Search table submissions
  const filteredSubmissions = submissions.filter(sub => {
    const matchesSearch = sub.student.user.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          sub.student.matricNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          sub.student.department.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (filterStatus === "all") return matchesSearch;
    if (filterStatus === "pending") return matchesSearch && (sub.status === "PENDING_REVIEW" || sub.status === "UNDER_REVIEW");
    if (filterStatus === "approved") return matchesSearch && sub.status === "APPROVED";
    if (filterStatus === "rejected") return matchesSearch && sub.status === "REJECTED";
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
      default:
        return {
          bg: "bg-[rgba(255,197,197,0.15)]",
          border: "border-[#DF9204]",
          text: "text-[#DF9204]",
          label: "Action Pending"
        };
    }
  };

  // Stats calculation
  const totalSubmissions = submissions.length;
  const pendingCount = submissions.filter(s => s.status === "PENDING_REVIEW" || s.status === "UNDER_REVIEW").length;
  const completedCount = submissions.filter(s => s.status === "APPROVED" || s.status === "REJECTED").length;

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
            <span className="block text-[8px] text-[#5932EA] uppercase tracking-wider font-bold -mt-1">Staff Portal</span>
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
                  <span className="block font-poppins font-semibold text-xs text-black max-w-[100px] truncate" title={user.name}>
                    {user.name}
                  </span>
                  <span className="block text-[8px] text-[#757575] font-poppins max-w-[100px] truncate" title={unitName || "Staff Member"}>
                    {unitName || "Staff Member"}
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
            <a href="#" className="flex items-center justify-between px-4 py-3 bg-[#5932EA] text-white rounded-lg transition-all group font-poppins font-medium text-sm">
              <div className="flex items-center gap-3">
                <LayoutDashboard className="w-5 h-5 text-white" />
                <span>Dashboard</span>
              </div>
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

          {/* User profile card (Ellipse 8 / Group 30) */}
          <div className="flex items-center pt-4 border-t border-[#EEEEEE]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#EAABF0] to-[#5932EA] flex items-center justify-center font-bold text-white uppercase shadow-sm">
                {user.name.charAt(0)}
              </div>
              <div>
                <span className="block font-poppins font-semibold text-sm text-black max-w-[150px] truncate" title={user.name}>
                  {user.name}
                </span>
                <span className="block text-[10px] text-[#757575] font-poppins max-w-[150px] truncate" title={unitName || "Staff Member"}>
                  {unitName || "Staff Member"}
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
            Hello {user.name.split(" ")[0]} <Smile className="w-6 h-6 text-amber-500 inline-block" />
          </h1>
          <p className="text-xs text-[#9197B3] mt-1 font-medium">
            You are managing the queue for the **{unitName || "Clearance Office"}**.
          </p>
        </div>

        {/* 3. Statistics Widgets Rows (Figma Earning layout parameters) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-white py-6 px-10 rounded-[30px] shadow-[0px_10px_60px_rgba(226,236,249,0.5)] border border-[#F0F4FA]">
          {/* Stats 1: Total Submissions */}
          <div className="flex items-center gap-5 pr-6 border-r border-[#F0F0F0] last:border-none">
            <div className="w-[84px] h-[84px] rounded-full bg-gradient-to-tr from-[#D3FFE7] to-[#EFFFF6] flex items-center justify-center">
              <Users className="w-10 h-10 text-[#00AC4F]" />
            </div>
            <div>
              <span className="block text-xs font-poppins text-[#ACACAC] mb-1">Total Submissions</span>
              <span className="block font-poppins font-semibold text-3xl text-[#333333] leading-none mb-1">
                {totalSubmissions}
              </span>
              <span className="text-[10px] text-[#00AC4F] font-bold">
                Student requests in database
              </span>
            </div>
          </div>

          {/* Stats 2: Action Pending */}
          <div className="flex items-center gap-5 pr-6 border-r border-[#F0F0F0] last:border-none">
            <div className="w-[84px] h-[84px] rounded-full bg-orange-50 flex items-center justify-center">
              <Clock className="w-10 h-10 text-orange-500" />
            </div>
            <div>
              <span className="block text-xs font-poppins text-[#ACACAC] mb-1">Pending Action</span>
              <span className="block font-poppins font-semibold text-3xl text-[#333333] leading-none mb-1">
                {pendingCount}
              </span>
              <span className={`text-[10px] font-bold ${pendingCount > 0 ? "text-orange-500" : "text-[#ACACAC]"}`}>
                {pendingCount > 0 ? "Needs immediate review" : "Queue is fully cleared"}
              </span>
            </div>
          </div>

          {/* Stats 3: Completed Reviews */}
          <div className="flex items-center gap-5 last:border-none">
            <div className="w-[84px] h-[84px] rounded-full bg-indigo-50 flex items-center justify-center">
              <CheckSquare className="w-10 h-10 text-[#5932EA]" />
            </div>
            <div>
              <span className="block text-xs font-poppins text-[#ACACAC] mb-1">Reviewed</span>
              <span className="block font-poppins font-semibold text-3xl text-[#333333] leading-none mb-1">
                {completedCount}
              </span>
              <span className="text-[10px] text-[#5932EA] font-bold">
                Decisions submitted
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
                  Clearance Queue
                </h3>
                <span className="text-xs text-[#16C098] font-poppins font-normal">
                  Graduating Submissions
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
                    placeholder="Search Student or Matric"
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
                    <option value="pending">Pending Action</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Table layout container */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-[#EEEEEE] text-left text-xs font-semibold text-[#B5B7C0] font-poppins">
                    <th className="py-4 px-6">Student details</th>
                    <th className="py-4 px-6">Department</th>
                    <th className="py-4 px-6 text-center">Submission File</th>
                    <th className="py-4 px-6 text-center">Status</th>
                    <th className="py-4 px-6 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EEEEEE] font-poppins text-xs font-medium text-[#292D32]">
                  {filteredSubmissions.length > 0 ? (
                    filteredSubmissions.map((sub) => {
                      const style = getStatusStyle(sub.status);
                      const file = sub.documents?.[0];
                      
                      return (
                        <tr key={sub.id} className="hover:bg-[#FAFBFF] transition-all group">
                          {/* Student Details */}
                          <td className="py-4 px-6">
                            <span className="block font-semibold text-sm text-black">
                              {sub.student.user.name}
                            </span>
                            <span className="block text-[10px] text-[#9197B3]">
                              {sub.student.matricNumber} / {sub.student.user.email}
                            </span>
                          </td>
                          {/* Department */}
                          <td className="py-4 px-6 text-[#7E7E7E] font-poppins">
                            {sub.student.department}
                          </td>
                          {/* Submission File */}
                          <td className="py-4 px-6 text-center">
                            {file ? (
                              <a
                                href={file.fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 text-[#5932EA] hover:underline font-semibold"
                              >
                                <Eye className="w-4 h-4" /> View Doc
                              </a>
                            ) : (
                              <span className="text-[#B5B7C0] italic">No file uploaded</span>
                            )}
                          </td>
                          {/* Status */}
                          <td className="py-4 px-6 text-center">
                            <span className={`inline-block border rounded px-3 py-1.5 text-xs font-semibold ${style.bg} ${style.border} ${style.text} w-32 text-center`}>
                              {style.label}
                            </span>
                          </td>
                          {/* Actions */}
                          <td className="py-4 px-6 text-center">
                            {sub.status === "PENDING_REVIEW" || sub.status === "UNDER_REVIEW" ? (
                              <div className="inline-flex items-center gap-2">
                                <button
                                  onClick={() => handleApprove(sub.id)}
                                  disabled={actionLoading !== null}
                                  className="w-8 h-8 rounded-lg bg-[rgba(22,192,152,0.15)] text-[#008767] border border-[#00B087] flex items-center justify-center hover:bg-[rgba(22,192,152,0.25)] transition-colors cursor-pointer disabled:opacity-50"
                                  title="Approve student clearance"
                                >
                                  {actionLoading === sub.id ? (
                                    <Loader2 className="animate-spin w-4 h-4" />
                                  ) : (
                                    <Check className="w-4 h-4" />
                                  )}
                                </button>
                                <button
                                  onClick={() => setRejectingRequest(sub)}
                                  disabled={actionLoading !== null}
                                  className="w-8 h-8 rounded-lg bg-[#FFC5C5] text-[#DF0404] border border-[#DF0404] flex items-center justify-center hover:bg-[#FFAAAA] transition-colors cursor-pointer disabled:opacity-50"
                                  title="Reject student clearance"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            ) : (
                              <span className="text-[#B5B7C0] italic">Decision Finalized</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-12 px-6 text-center text-[#B5B7C0]">
                        No submissions in this unit review queue.
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
              Showing {filteredSubmissions.length} of {submissions.length} entries
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

      {/* 5. Rejection Reason Modal */}
      {rejectingRequest && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 transition-all">
          <div className="bg-white w-full max-w-md rounded-[30px] shadow-[0px_10px_60px_rgba(226,236,249,0.9)] border border-[#F0F4FA] p-8 flex flex-col gap-6 relative">
            <button 
              onClick={() => { setRejectingRequest(null); setRejectionNote(""); }}
              className="absolute right-6 top-6 text-[#9197B3] hover:text-black transition-colors cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-[#DF0404]">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-poppins font-semibold text-lg text-black">
                  Reject Clearance
                </h3>
                <p className="text-xs text-[#9197B3] font-poppins">
                  Specify details for correction
                </p>
              </div>
            </div>

            <form onSubmit={handleRejectSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#9197B3] uppercase tracking-wider mb-2">
                  Rejection Reason / Notes
                </label>
                <textarea
                  required
                  rows={4}
                  value={rejectionNote}
                  onChange={(e) => setRejectionNote(e.target.value)}
                  placeholder="State the reason (e.g. Missing receipts, incorrect files, unpaid dues)."
                  className="block w-full px-4 py-3 border border-[#EEEEEE] rounded-xl bg-[#FAFBFF] text-[#292D32] placeholder-[#B5B7C0] focus:outline-none focus:ring-2 focus:ring-[#5932EA] focus:border-transparent transition-all text-xs resize-none font-poppins font-medium leading-relaxed"
                />
              </div>

              <button
                type="submit"
                disabled={actionLoading !== null || !rejectionNote.trim()}
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl text-xs font-semibold text-white bg-[#DF0404] hover:bg-red-700 focus:outline-none shadow-md transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {actionLoading === rejectingRequest.id ? (
                  <Loader2 className="animate-spin h-5 w-5 mr-2" />
                ) : (
                  "Submit Rejection"
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
