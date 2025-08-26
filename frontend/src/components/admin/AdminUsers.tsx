import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { adminAPI } from "@/services/api";
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff,
  Mail, 
  Phone,
  Calendar,
  User,
  Shield,
  Package
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface User {
  id: number;
  memberId: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  status: 'active' | 'suspended' | 'pending';
  emailVerified: boolean;
  profileCompleted: boolean;
  referralCode: string;
  referredBy?: string;
  roleId?: number;
  roleName?: string;
  role?: { id: number; name: string; slug: string };
  referrer?: { id: number; memberId: string; email: string };
  createdAt: string;
  lastLoginAt?: string;
}

const AdminUsers = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserDialog, setShowUserDialog] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [roles, setRoles] = useState<Array<{id:number; name:string;}>>([]);
  
  const [form, setForm] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    phone: "",
    status: "active",
    roleId: undefined as number | undefined,
  });
  const [viewToken, setViewToken] = useState("");
  const [revealedPassword, setRevealedPassword] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
    (async () => {
      try {
        const res = await adminAPI.getRoles();
        setRoles((res.data.roles || []).map((r:any)=>({id:r.id, name:r.name})));
      } catch {}
    })();
  }, []);

  const fetchUsers = async () => {
    try {
      const params = {
        page: 1,
        limit: 50,
        search: searchTerm,
        status: statusFilter !== 'all' ? statusFilter : undefined
      };
      const response = await adminAPI.getUsers(params);
      setUsers(response.data.users);
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter users locally (since we're already fetching with search params)
  const filteredUsers = users.filter(user => {
    const matchesStatus = statusFilter === "all" || user.status === statusFilter;
    return matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const variants = {
      active: "default",
      pending: "secondary",
      suspended: "destructive"
    } as const;
    return <Badge variant={variants[status as keyof typeof variants]}>{status}</Badge>;
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Users Management</h2>
          <p className="text-muted-foreground">Manage user accounts and permissions</p>
        </div>
        <Dialog open={showUserDialog} onOpenChange={(open) => { 
          setShowUserDialog(open); 
          if (!open) { 
            setSelectedUser(null); 
            setForm({ email: "", password: "", firstName: "", lastName: "", phone: "", status: "active", roleId: undefined }); 
            setShowPassword(false);
            setShowChangePassword(false);
            setCurrentPassword("");
            setViewToken("");
            setRevealedPassword(null);
          } 
        }}>
          <DialogTrigger asChild>
            <Button onClick={() => { 
              setSelectedUser(null); 
              setForm({ email: "", password: "", firstName: "", lastName: "", phone: "", status: "active", roleId: undefined }); 
              setShowPassword(false);
              setShowChangePassword(false);
              setCurrentPassword("");
              setViewToken("");
              setRevealedPassword(null);
            }}>
              <Plus className="w-4 h-4 mr-2" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{selectedUser ? "Edit User" : "Add User"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Email</Label>
                <Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="user@example.com" />
              </div>
              {!selectedUser ? (
                <div>
                  <Label>Password</Label>
                  <div className="relative">
                    <Input 
                      type={showPassword ? "text" : "password"} 
                      value={form.password} 
                      onChange={(e) => setForm({ ...form, password: e.target.value })} 
                      placeholder="••••••••" 
                      className="pr-10"
                    />
                    <Button type="button" variant="ghost" size="sm" className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent" onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <Label>Password</Label>
                    <Button type="button" variant="outline" size="sm" onClick={() => setShowChangePassword(!showChangePassword)}>
                      {showChangePassword ? "Cancel" : "Change Password"}
                    </Button>
                  </div>
                  {showChangePassword ? (
                    <div className="space-y-2">
                      <div>
                        <Label className="text-sm">New Password</Label>
                        <div className="relative">
                          <Input type={showPassword ? "text" : "password"} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Enter new password" className="pr-10" />
                          <Button type="button" variant="ghost" size="sm" className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent" onClick={() => setShowPassword(!showPassword)}>
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">Leave empty to keep current password unchanged</p>
                    </div>
                  ) : (
                    <div className="p-3 bg-muted rounded-md space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm text-muted-foreground">Password is hidden for security</span>
                        <Badge variant="secondary">Protected</Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Input placeholder="Enter token (sankalp)" value={viewToken} onChange={(e)=>setViewToken(e.target.value)} />
                        <Button
                          type="button"
                          size="sm"
                          onClick={async ()=>{
                            if (!selectedUser) return;
                            try {
                              const res = await adminAPI.viewUserPassword(selectedUser.id, viewToken);
                              const pwd = res.data?.password;
                              setRevealedPassword(pwd || null);
                              if (pwd) {
                                await navigator.clipboard.writeText(pwd);
                                alert(`Password: ${pwd} (copied to clipboard)`);
                              }
                            } catch (e:any) {
                              setRevealedPassword(null);
                              alert(e.response?.data?.message || 'Failed to view password');
                            }
                          }}
                        >
                          View
                        </Button>
                      </div>
                      {revealedPassword && (
                        <div className="text-sm font-mono break-all">{revealedPassword}</div>
                      )}
                    </div>
                  )}
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>First name</Label>
                  <Input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
                </div>
                <div>
                  <Label>Last name</Label>
                  <Input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
                </div>
              </div>
              <div>
                <Label>Phone</Label>
                <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
              <div>
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Role</Label>
                <Select value={form.roleId ? String(form.roleId) : undefined} onValueChange={(v) => setForm({ ...form, roleId: Number(v) })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map(r => (
                      <SelectItem key={r.id} value={String(r.id)}>{r.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowUserDialog(false)}>Cancel</Button>
                <Button disabled={isSaving} onClick={async () => {
                  setIsSaving(true);
                  try {
                    if (selectedUser) {
                      const updatePayload: any = { email: form.email, firstName: form.firstName, lastName: form.lastName, phone: form.phone, status: form.status, roleId: form.roleId };
                      if (showChangePassword && form.password && form.password.trim().length >= 6) {
                        updatePayload.password = form.password.trim();
                      }
                      await adminAPI.updateUser(selectedUser.id, updatePayload);
                    } else {
                      await adminAPI.createUser({ email: form.email, password: form.password, firstName: form.firstName, lastName: form.lastName, phone: form.phone, status: form.status, roleId: form.roleId });
                    }
                    await fetchUsers();
                    setShowUserDialog(false);
                  } catch (e) {
                    console.error('Save user failed', e);
                  } finally {
                    setIsSaving(false);
                  }
                }}>{isSaving ? 'Saving...' : 'Save'}</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input placeholder="Search users..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Users ({filteredUsers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Referred By</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-mono text-sm">{user.memberId}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-muted-foreground" />
                      {user.firstName} {user.lastName}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      {user.email}
                    </div>
                  </TableCell>
                  <TableCell>
                    {user.referrer ? `${user.referrer.memberId}` : '-'}
                  </TableCell>
                  <TableCell>{getStatusBadge(user.status)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-muted-foreground" />
                      {user.role?.name || user.roleName || 'User'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      {new Date(user.createdAt).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" title="View Plans" onClick={() => navigate(`/admin/users/${user.id}/plans`)}>
                        <Package className="w-4 h-4" />
                      </Button>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>User Details</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="text-sm font-medium">Member ID</label>
                                <p className="text-sm text-muted-foreground">{user.memberId}</p>
                              </div>
                              <div>
                                <label className="text-sm font-medium">Status</label>
                                <div className="mt-1">{getStatusBadge(user.status)}</div>
                              </div>
                              <div>
                                <label className="text-sm font-medium">Email</label>
                                <p className="text-sm text-muted-foreground">{user.email}</p>
                              </div>
                              <div>
                                <label className="text-sm font-medium">Phone</label>
                                <p className="text-sm text-muted-foreground">{user.phone}</p>
                              </div>
                              <div>
                                <label className="text-sm font-medium">Referral Code</label>
                                <p className="text-sm text-muted-foreground">{user.referralCode}</p>
                              </div>
                              <div>
                                <label className="text-sm font-medium">Email Verified</label>
                                <Badge variant={user.emailVerified ? "default" : "secondary"}>{user.emailVerified ? "Yes" : "No"}</Badge>
                              </div>
                              <div className="col-span-2">
                                <label className="text-sm font-medium">Password</label>
                                <div className="flex items-center gap-2 mt-1">
                                  <Button variant="outline" size="sm" onClick={async ()=>{
                                    try {
                                      const res = await adminAPI.viewUserPasswordSimple(user.id);
                                      const pwd = res.data?.password;
                                      if (pwd) {
                                        await navigator.clipboard.writeText(pwd);
                                        alert(`Password: ${pwd} (copied to clipboard)`);
                                      }
                                    } catch (e:any) {
                                      alert(e.response?.data?.message || 'Failed to view password');
                                    }
                                  }}>View Password</Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                      
                      <Button variant="ghost" size="sm" onClick={() => { 
                        setSelectedUser(user); 
                        setForm({ email: user.email, password: "", firstName: user.firstName || "", lastName: user.lastName || "", phone: user.phone || "", status: user.status, roleId: user.role?.id }); 
                        setShowPassword(false);
                        setShowChangePassword(false);
                        setCurrentPassword("");
                        setShowUserDialog(true); 
                      }}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="text-destructive" title="Delete User">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete this user permanently?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete the user account,
                              wallets, transactions, tickets and related data.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={async () => {
                              try {
                                await adminAPI.deleteUser(user.id);
                                setUsers(users.filter(u => u.id !== user.id));
                              } catch (e) {
                                console.error('Delete user failed', e);
                              }
                            }}>
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminUsers; 