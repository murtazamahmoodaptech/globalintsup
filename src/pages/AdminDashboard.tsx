import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LogOut, Search, Filter, Pencil, Trash2, Eye, Download, Plus,
  CalendarDays, Clock, DollarSign, Users, CheckCircle, AlertCircle, Tag
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { MOCK_APPOINTMENTS, Appointment } from "@/data/mockAppointments";

interface User {
  _id: string;
  email: string;
  fullName: string;
  role: 'admin' | 'user';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Coupon {
  _id: string;
  code: string;
  discountPercentage: number;
  isActive: boolean;
  expiryDate: string;
  createdAt: string;
  updatedAt: string;
}

const STATUS_COLORS: Record<string, string> = {
  Pending: "bg-primary/20 text-primary border-primary/30",
  Confirmed: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  Completed: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  Cancelled: "bg-destructive/20 text-red-400 border-destructive/30",
};

export default function AdminDashboard() {
  const { logout, token } = useAdminAuth();
  const navigate = useNavigate();
  
  // Appointments state
  const [appointments, setAppointments] = useState<Appointment[]>(MOCK_APPOINTMENTS);
  const [statusFilter, setStatusFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [editApt, setEditApt] = useState<Appointment | null>(null);
  const [viewApt, setViewApt] = useState<Appointment | null>(null);
  const [editStatus, setEditStatus] = useState("");

  // Users state
  const [users, setUsers] = useState<User[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userSearch, setUserSearch] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState("all");
  const [userStatusFilter, setUserStatusFilter] = useState("all");
  const [showAddUser, setShowAddUser] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [newUser, setNewUser] = useState({ email: "", password: "", fullName: "", role: "user" });
  const [editUserData, setEditUserData] = useState({ fullName: "", role: "user", isActive: true });

  // Coupons state
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [couponsLoading, setCouponsLoading] = useState(false);
  const [couponSearch, setCouponSearch] = useState("");
  const [couponStatusFilter, setCouponStatusFilter] = useState("all");
  const [showAddCoupon, setShowAddCoupon] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [newCoupon, setNewCoupon] = useState({ code: "", discountPercentage: "", expiryDate: "" });
  const [editCouponData, setEditCouponData] = useState({ discountPercentage: "", expiryDate: "" });

  // Load users and coupons on mount
  useEffect(() => {
    if (token) {
      fetchUsers();
      fetchCoupons();
    }
  }, [token]);

  // API calls
  const fetchUsers = async () => {
    setUsersLoading(true);
    try {
      const params = new URLSearchParams();
      if (userSearch) params.append('search', userSearch);
      if (userRoleFilter !== 'all') params.append('role', userRoleFilter);
      if (userStatusFilter !== 'all') params.append('status', userStatusFilter);

      const response = await fetch(`/api/users?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setUsers(data.users);
      } else {
        toast.error(data.message || 'Failed to load users');
      }
    } catch (error) {
      console.error("[v0] Error fetching users:", error);
      toast.error('Error loading users');
    } finally {
      setUsersLoading(false);
    }
  };

  const fetchCoupons = async () => {
    setCouponsLoading(true);
    try {
      const params = new URLSearchParams();
      if (couponSearch) params.append('search', couponSearch);
      if (couponStatusFilter !== 'all') params.append('status', couponStatusFilter);

      const response = await fetch(`/api/coupons?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setCoupons(data.coupons);
      } else {
        toast.error(data.message || 'Failed to load coupons');
      }
    } catch (error) {
      console.error("[v0] Error fetching coupons:", error);
      toast.error('Error loading coupons');
    } finally {
      setCouponsLoading(false);
    }
  };

  const handleCreateUser = async () => {
    if (!newUser.email || !newUser.password || !newUser.fullName) {
      toast.error('Fill all required fields');
      return;
    }

    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newUser)
      });
      const data = await response.json();
      if (data.success) {
        toast.success('User created successfully');
        setNewUser({ email: "", password: "", fullName: "", role: "user" });
        setShowAddUser(false);
        fetchUsers();
      } else {
        toast.error(data.message || 'Failed to create user');
      }
    } catch (error) {
      console.error("[v0] Error creating user:", error);
      toast.error('Error creating user');
    }
  };

  const handleUpdateUser = async (userId: string) => {
    if (!editUserData.fullName) {
      toast.error('Full name is required');
      return;
    }

    try {
      const response = await fetch(`/api/users?id=${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editUserData)
      });
      const data = await response.json();
      if (data.success) {
        toast.success('User updated successfully');
        setEditingUser(null);
        fetchUsers();
      } else {
        toast.error(data.message || 'Failed to update user');
      }
    } catch (error) {
      console.error("[v0] Error updating user:", error);
      toast.error('Error updating user');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;

    try {
      const response = await fetch(`/api/users?id=${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        toast.success('User deleted successfully');
        fetchUsers();
      } else {
        toast.error(data.message || 'Failed to delete user');
      }
    } catch (error) {
      console.error("[v0] Error deleting user:", error);
      toast.error('Error deleting user');
    }
  };

  const handleCreateCoupon = async () => {
    if (!newCoupon.code || !newCoupon.discountPercentage || !newCoupon.expiryDate) {
      toast.error('Fill all required fields');
      return;
    }

    try {
      const response = await fetch('/api/coupons', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          code: newCoupon.code,
          discountPercentage: Number(newCoupon.discountPercentage),
          expiryDate: newCoupon.expiryDate
        })
      });
      const data = await response.json();
      if (data.success) {
        toast.success('Coupon created successfully');
        setNewCoupon({ code: "", discountPercentage: "", expiryDate: "" });
        setShowAddCoupon(false);
        fetchCoupons();
      } else {
        toast.error(data.message || 'Failed to create coupon');
      }
    } catch (error) {
      console.error("[v0] Error creating coupon:", error);
      toast.error('Error creating coupon');
    }
  };

  const handleUpdateCoupon = async (couponId: string) => {
    if (!editCouponData.discountPercentage || !editCouponData.expiryDate) {
      toast.error('Fill all required fields');
      return;
    }

    try {
      const response = await fetch(`/api/coupons?id=${couponId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          discountPercentage: Number(editCouponData.discountPercentage),
          expiryDate: editCouponData.expiryDate
        })
      });
      const data = await response.json();
      if (data.success) {
        toast.success('Coupon updated successfully');
        setEditingCoupon(null);
        fetchCoupons();
      } else {
        toast.error(data.message || 'Failed to update coupon');
      }
    } catch (error) {
      console.error("[v0] Error updating coupon:", error);
      toast.error('Error updating coupon');
    }
  };

  const handleToggleCouponStatus = async (couponId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/coupons?id=${couponId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ isActive: !currentStatus })
      });
      const data = await response.json();
      if (data.success) {
        toast.success('Coupon status updated');
        fetchCoupons();
      } else {
        toast.error(data.message || 'Failed to update coupon');
      }
    } catch (error) {
      console.error("[v0] Error toggling coupon:", error);
      toast.error('Error updating coupon');
    }
  };

  const handleDeleteCoupon = async (couponId: string) => {
    if (!window.confirm('Are you sure you want to delete this coupon?')) return;

    try {
      const response = await fetch(`/api/coupons?id=${couponId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        toast.success('Coupon deleted successfully');
        fetchCoupons();
      } else {
        toast.error(data.message || 'Failed to delete coupon');
      }
    } catch (error) {
      console.error("[v0] Error deleting coupon:", error);
      toast.error('Error deleting coupon');
    }
  };

  const handleLogout = () => { logout(); navigate("/admin/login"); };

  const filtered = appointments.filter((a) => {
    const matchStatus = statusFilter === "All" || a.status === statusFilter;
    const matchSearch = !search || a.fullName.toLowerCase().includes(search.toLowerCase()) || a.email.toLowerCase().includes(search.toLowerCase()) || a.id.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const stats = {
    total: appointments.length,
    pending: appointments.filter((a) => a.status === "Pending").length,
    confirmed: appointments.filter((a) => a.status === "Confirmed").length,
    revenue: appointments.filter((a) => a.status !== "Cancelled").reduce((sum, a) => sum + a.totalPrice, 0),
  };

  const handleDelete = (id: string) => { setAppointments((prev) => prev.filter((a) => a.id !== id)); toast.success("Appointment deleted."); };

  const handleEditSave = () => {
    if (!editApt) return;
    setAppointments((prev) => prev.map((a) => (a.id === editApt.id ? { ...a, status: editStatus as Appointment["status"] } : a)));
    toast.success("Appointment updated.");
    setEditApt(null);
  };

  const handleExportCSV = () => {
    const headers = "ID,Name,Phone,Email,Service,Vehicle,Date,Time,Status,Total\n";
    const rows = filtered.map((a) => `${a.id},${a.fullName},${a.phone},${a.email},${a.serviceType},${a.vehicleCategory},${a.date},${a.timeSlot},${a.status},${a.totalPrice}`).join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url; link.download = "appointments.csv"; link.click();
    URL.revokeObjectURL(url);
    toast.success("CSV exported!");
  };

  const handleAddPromo = () => {
    if (!newPromo.code || !newPromo.discountPercentage || !newPromo.expiryDate) {
      toast.error("Fill all promo fields."); return;
    }
    setPromos((prev) => [...prev, { id: Date.now().toString(), code: newPromo.code.toUpperCase(), discountPercentage: Number(newPromo.discountPercentage), isActive: true, expiryDate: newPromo.expiryDate }]);
    setNewPromo({ code: "", discountPercentage: "", expiryDate: "" });
    setShowAddPromo(false);
    toast.success("Promo code added!");
  };

  const togglePromo = (id: string) => {
    setPromos((prev) => prev.map((p) => p.id === id ? { ...p, isActive: !p.isActive } : p));
  };

  const deletePromo = (id: string) => {
    setPromos((prev) => prev.filter((p) => p.id !== id));
    toast.success("Promo code deleted.");
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="glass-dark border-b border-border sticky top-0 z-40">
        <div className="container mx-auto px-4 lg:px-8 flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <span className="text-gradient-sky font-display text-xl font-bold">PREMIUM</span>
            <span className="text-foreground font-display text-xl font-light">Admin</span>
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout} className="border-border text-muted-foreground hover:text-foreground">
            <LogOut className="w-4 h-4 mr-2" /> Logout
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { icon: Users, label: "Total Bookings", value: stats.total, color: "text-primary" },
            { icon: AlertCircle, label: "Pending", value: stats.pending, color: "text-primary" },
            { icon: CheckCircle, label: "Confirmed", value: stats.confirmed, color: "text-emerald-400" },
            { icon: DollarSign, label: "Revenue", value: `$${stats.revenue.toFixed(2)}`, color: "text-primary" },
          ].map((s) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-gradient-card border border-border rounded-xl p-5">
              <div className="flex items-center gap-3 mb-2">
                <s.icon className={`w-5 h-5 ${s.color}`} />
                <span className="text-xs text-muted-foreground uppercase tracking-wider">{s.label}</span>
              </div>
              <div className="text-2xl font-display font-bold text-foreground">{s.value}</div>
            </motion.div>
          ))}
        </div>

        <Tabs defaultValue="appointments">
          <TabsList className="bg-secondary border border-border mb-6">
            <TabsTrigger value="appointments" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Appointments</TabsTrigger>
            <TabsTrigger value="users" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Users className="w-4 h-4 mr-1" /> Users
            </TabsTrigger>
            <TabsTrigger value="coupons" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Tag className="w-4 h-4 mr-1" /> Coupons
            </TabsTrigger>
          </TabsList>

          {/* Appointments Tab */}
          <TabsContent value="appointments">
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name, email, or ID..." className="bg-secondary border-border text-foreground pl-10" />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-48 bg-secondary border-border text-foreground">
                  <Filter className="w-4 h-4 mr-2" /><SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  {["All", "Pending", "Confirmed", "Completed", "Cancelled"].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
              <Button onClick={handleExportCSV} variant="outline" className="border-border text-muted-foreground hover:text-foreground">
                <Download className="w-4 h-4 mr-2" /> Export CSV
              </Button>
            </div>

            <div className="bg-gradient-card border border-border rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      {["ID", "Customer", "Service", "Vehicle", "Date", "Status", "Total", "Actions"].map((h) => (
                        <th key={h} className="text-left px-4 py-3 text-xs text-muted-foreground uppercase tracking-wider font-medium">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.length === 0 ? (
                      <tr><td colSpan={8} className="text-center py-12 text-muted-foreground">No appointments found.</td></tr>
                    ) : filtered.map((apt) => (
                      <tr key={apt.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                        <td className="px-4 py-3 text-primary font-mono text-xs">{apt.id}</td>
                        <td className="px-4 py-3"><div className="text-foreground font-medium">{apt.fullName}</div><div className="text-xs text-muted-foreground">{apt.email}</div></td>
                        <td className="px-4 py-3 text-foreground">{apt.serviceType}</td>
                        <td className="px-4 py-3"><div className="text-foreground">{apt.vehicleName}</div><div className="text-xs text-muted-foreground">{apt.vehicleCategory}</div></td>
                        <td className="px-4 py-3">
                          <div className="text-foreground flex items-center gap-1"><CalendarDays className="w-3 h-3" /> {apt.date}</div>
                          <div className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" /> {apt.timeSlot}</div>
                        </td>
                        <td className="px-4 py-3"><Badge variant="outline" className={`text-xs ${STATUS_COLORS[apt.status]}`}>{apt.status}</Badge></td>
                        <td className="px-4 py-3"><span className="text-foreground font-semibold">${apt.totalPrice.toFixed(2)}</span>{apt.discountApplied && <div className="text-xs text-primary">Promo applied</div>}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <button onClick={() => setViewApt(apt)} className="p-1.5 rounded hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"><Eye className="w-4 h-4" /></button>
                            <button onClick={() => { setEditApt(apt); setEditStatus(apt.status); }} className="p-1.5 rounded hover:bg-secondary text-muted-foreground hover:text-primary transition-colors"><Pencil className="w-4 h-4" /></button>
                            <button onClick={() => handleDelete(apt.id)} className="p-1.5 rounded hover:bg-secondary text-muted-foreground hover:text-red-400 transition-colors"><Trash2 className="w-4 h-4" /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users">
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input value={userSearch} onChange={(e) => setUserSearch(e.target.value)} placeholder="Search by email or name..." className="bg-secondary border-border text-foreground pl-10" />
              </div>
              <Select value={userRoleFilter} onValueChange={setUserRoleFilter}>
                <SelectTrigger className="w-full md:w-48 bg-secondary border-border text-foreground">
                  <Filter className="w-4 h-4 mr-2" /><SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  {["all", "admin", "user"].map((r) => <SelectItem key={r} value={r}>{r === "all" ? "All Roles" : r.charAt(0).toUpperCase() + r.slice(1)}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={userStatusFilter} onValueChange={setUserStatusFilter}>
                <SelectTrigger className="w-full md:w-48 bg-secondary border-border text-foreground">
                  <Filter className="w-4 h-4 mr-2" /><SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  {["all", "active", "inactive"].map((s) => <SelectItem key={s} value={s}>{s === "all" ? "All Status" : s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>)}
                </SelectContent>
              </Select>
              <Button onClick={() => setShowAddUser(true)} className="bg-gradient-sky text-primary-foreground font-semibold hover:opacity-90">
                <Plus className="w-4 h-4 mr-2" /> Add User
              </Button>
            </div>

            <div className="bg-gradient-card border border-border rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      {["Email", "Full Name", "Role", "Status", "Created", "Actions"].map((h) => (
                        <th key={h} className="text-left px-4 py-3 text-xs text-muted-foreground uppercase tracking-wider font-medium">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {usersLoading ? (
                      <tr><td colSpan={6} className="text-center py-12 text-muted-foreground">Loading users...</td></tr>
                    ) : users.length === 0 ? (
                      <tr><td colSpan={6} className="text-center py-12 text-muted-foreground">No users found.</td></tr>
                    ) : users.map((user) => (
                      <tr key={user._id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                        <td className="px-4 py-3 text-primary text-xs">{user.email}</td>
                        <td className="px-4 py-3 text-foreground font-medium">{user.fullName}</td>
                        <td className="px-4 py-3"><Badge variant="outline" className={user.role === 'admin' ? 'bg-primary/20 text-primary border-primary/30' : 'bg-muted text-muted-foreground'}>{user.role}</Badge></td>
                        <td className="px-4 py-3"><Badge variant="outline" className={user.isActive ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-destructive/20 text-red-400 border-destructive/30'}>{user.isActive ? 'Active' : 'Inactive'}</Badge></td>
                        <td className="px-4 py-3 text-muted-foreground text-xs">{new Date(user.createdAt).toLocaleDateString()}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <button onClick={() => { setEditingUser(user); setEditUserData({ fullName: user.fullName, role: user.role, isActive: user.isActive }); }} className="p-1.5 rounded hover:bg-secondary text-muted-foreground hover:text-primary transition-colors"><Pencil className="w-4 h-4" /></button>
                            <button onClick={() => handleDeleteUser(user._id)} className="p-1.5 rounded hover:bg-secondary text-muted-foreground hover:text-red-400 transition-colors"><Trash2 className="w-4 h-4" /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          {/* Coupons Tab */}
          <TabsContent value="coupons">
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input value={couponSearch} onChange={(e) => setCouponSearch(e.target.value)} placeholder="Search by code..." className="bg-secondary border-border text-foreground pl-10" />
              </div>
              <Select value={couponStatusFilter} onValueChange={setCouponStatusFilter}>
                <SelectTrigger className="w-full md:w-48 bg-secondary border-border text-foreground">
                  <Filter className="w-4 h-4 mr-2" /><SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  {["all", "active", "inactive"].map((s) => <SelectItem key={s} value={s}>{s === "all" ? "All Status" : s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>)}
                </SelectContent>
              </Select>
              <Button onClick={() => setShowAddCoupon(true)} className="bg-gradient-sky text-primary-foreground font-semibold hover:opacity-90">
                <Plus className="w-4 h-4 mr-2" /> Add Coupon
              </Button>
            </div>

            <div className="grid gap-4">
              {couponsLoading ? (
                <div className="text-center py-12 text-muted-foreground">Loading coupons...</div>
              ) : coupons.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">No coupons found.</div>
              ) : coupons.map((coupon) => (
                <motion.div key={coupon._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-gradient-card border border-border rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center">
                      <Tag className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <div className="text-foreground font-bold text-lg font-mono">{coupon.code}</div>
                      <div className="text-sm text-muted-foreground">{coupon.discountPercentage}% off · Expires {new Date(coupon.expiryDate).toLocaleDateString()}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">{coupon.isActive ? "Active" : "Inactive"}</span>
                      <Switch checked={coupon.isActive} onCheckedChange={() => handleToggleCouponStatus(coupon._id, coupon.isActive)} />
                    </div>
                    <button onClick={() => { setEditingCoupon(coupon); setEditCouponData({ discountPercentage: coupon.discountPercentage.toString(), expiryDate: coupon.expiryDate.split('T')[0] }); }} className="p-2 rounded hover:bg-secondary text-muted-foreground hover:text-primary transition-colors">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDeleteCoupon(coupon._id)} className="p-2 rounded hover:bg-secondary text-muted-foreground hover:text-red-400 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* View Dialog */}
      <Dialog open={!!viewApt} onOpenChange={() => setViewApt(null)}>
        <DialogContent className="bg-card border-border text-foreground max-w-lg">
          <DialogHeader><DialogTitle className="font-display text-xl">Appointment Details</DialogTitle></DialogHeader>
          {viewApt && (
            <div className="space-y-3 text-sm">
              {[["ID", viewApt.id], ["Customer", viewApt.fullName], ["Phone", viewApt.phone], ["Email", viewApt.email], ["Address", viewApt.address], ["Vehicle", `${viewApt.year} ${viewApt.make} ${viewApt.model}`], ["Category", viewApt.vehicleCategory], ["Service", viewApt.serviceType], ["Date", `${viewApt.date} at ${viewApt.timeSlot}`], ["Promo Code", viewApt.promoCode || "None"], ["Status", viewApt.status], ["Total", `$${viewApt.totalPrice.toFixed(2)}`]].map(([label, val]) => (
                <div key={label} className="flex justify-between"><span className="text-muted-foreground">{label}</span><span className="text-foreground font-medium">{val}</span></div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editApt} onOpenChange={() => setEditApt(null)}>
        <DialogContent className="bg-card border-border text-foreground max-w-md">
          <DialogHeader><DialogTitle className="font-display text-xl">Edit Appointment</DialogTitle></DialogHeader>
          {editApt && (
            <div className="space-y-4">
              <div><Label className="text-foreground">Customer</Label><Input value={editApt.fullName} disabled className="bg-secondary border-border text-muted-foreground mt-1" /></div>
              <div><Label className="text-foreground">Status</Label>
                <Select value={editStatus} onValueChange={setEditStatus}>
                  <SelectTrigger className="bg-secondary border-border text-foreground mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-card border-border">{["Pending", "Confirmed", "Completed", "Cancelled"].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditApt(null)} className="border-border text-muted-foreground">Cancel</Button>
            <Button onClick={handleEditSave} className="bg-gradient-sky text-primary-foreground font-semibold hover:opacity-90">Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add User Dialog */}
      <Dialog open={showAddUser} onOpenChange={setShowAddUser}>
        <DialogContent className="bg-card border-border text-foreground max-w-md">
          <DialogHeader><DialogTitle className="font-display text-xl">Add User</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label className="text-foreground">Email</Label><Input value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} placeholder="user@example.com" type="email" className="bg-secondary border-border text-foreground mt-1" /></div>
            <div><Label className="text-foreground">Full Name</Label><Input value={newUser.fullName} onChange={(e) => setNewUser({ ...newUser, fullName: e.target.value })} placeholder="John Doe" className="bg-secondary border-border text-foreground mt-1" /></div>
            <div><Label className="text-foreground">Password</Label><Input value={newUser.password} onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} type="password" placeholder="Min 6 characters" className="bg-secondary border-border text-foreground mt-1" /></div>
            <div><Label className="text-foreground">Role</Label>
              <Select value={newUser.role} onValueChange={(value) => setNewUser({ ...newUser, role: value as 'admin' | 'user' })}>
                <SelectTrigger className="bg-secondary border-border text-foreground mt-1"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-card border-border">{["user", "admin"].map((r) => <SelectItem key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddUser(false)} className="border-border text-muted-foreground">Cancel</Button>
            <Button onClick={handleCreateUser} className="bg-gradient-sky text-primary-foreground font-semibold hover:opacity-90">Create User</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
        <DialogContent className="bg-card border-border text-foreground max-w-md">
          <DialogHeader><DialogTitle className="font-display text-xl">Edit User</DialogTitle></DialogHeader>
          {editingUser && (
            <div className="space-y-4">
              <div><Label className="text-foreground">Email</Label><Input value={editingUser.email} disabled className="bg-secondary border-border text-muted-foreground mt-1" /></div>
              <div><Label className="text-foreground">Full Name</Label><Input value={editUserData.fullName} onChange={(e) => setEditUserData({ ...editUserData, fullName: e.target.value })} className="bg-secondary border-border text-foreground mt-1" /></div>
              <div><Label className="text-foreground">Role</Label>
                <Select value={editUserData.role} onValueChange={(value) => setEditUserData({ ...editUserData, role: value as 'admin' | 'user' })}>
                  <SelectTrigger className="bg-secondary border-border text-foreground mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-card border-border">{["user", "admin"].map((r) => <SelectItem key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={editUserData.isActive} onCheckedChange={(checked) => setEditUserData({ ...editUserData, isActive: checked })} />
                <Label className="text-foreground">Active</Label>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingUser(null)} className="border-border text-muted-foreground">Cancel</Button>
            <Button onClick={() => editingUser && handleUpdateUser(editingUser._id)} className="bg-gradient-sky text-primary-foreground font-semibold hover:opacity-90">Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Coupon Dialog */}
      <Dialog open={showAddCoupon} onOpenChange={setShowAddCoupon}>
        <DialogContent className="bg-card border-border text-foreground max-w-md">
          <DialogHeader><DialogTitle className="font-display text-xl">Add Coupon</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label className="text-foreground">Code</Label><Input value={newCoupon.code} onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value })} placeholder="e.g. SUMMER20" className="bg-secondary border-border text-foreground mt-1 uppercase" /></div>
            <div><Label className="text-foreground">Discount %</Label><Input type="number" value={newCoupon.discountPercentage} onChange={(e) => setNewCoupon({ ...newCoupon, discountPercentage: e.target.value })} placeholder="e.g. 20" min="1" max="100" className="bg-secondary border-border text-foreground mt-1" /></div>
            <div><Label className="text-foreground">Expiry Date</Label><Input type="date" value={newCoupon.expiryDate} onChange={(e) => setNewCoupon({ ...newCoupon, expiryDate: e.target.value })} className="bg-secondary border-border text-foreground mt-1" /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddCoupon(false)} className="border-border text-muted-foreground">Cancel</Button>
            <Button onClick={handleCreateCoupon} className="bg-gradient-sky text-primary-foreground font-semibold hover:opacity-90">Add Coupon</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Coupon Dialog */}
      <Dialog open={!!editingCoupon} onOpenChange={() => setEditingCoupon(null)}>
        <DialogContent className="bg-card border-border text-foreground max-w-md">
          <DialogHeader><DialogTitle className="font-display text-xl">Edit Coupon</DialogTitle></DialogHeader>
          {editingCoupon && (
            <div className="space-y-4">
              <div><Label className="text-foreground">Code</Label><Input value={editingCoupon.code} disabled className="bg-secondary border-border text-muted-foreground mt-1" /></div>
              <div><Label className="text-foreground">Discount %</Label><Input type="number" value={editCouponData.discountPercentage} onChange={(e) => setEditCouponData({ ...editCouponData, discountPercentage: e.target.value })} min="1" max="100" className="bg-secondary border-border text-foreground mt-1" /></div>
              <div><Label className="text-foreground">Expiry Date</Label><Input type="date" value={editCouponData.expiryDate} onChange={(e) => setEditCouponData({ ...editCouponData, expiryDate: e.target.value })} className="bg-secondary border-border text-foreground mt-1" /></div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingCoupon(null)} className="border-border text-muted-foreground">Cancel</Button>
            <Button onClick={() => editingCoupon && handleUpdateCoupon(editingCoupon._id)} className="bg-gradient-sky text-primary-foreground font-semibold hover:opacity-90">Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
