import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { adminAPI } from "@/services/api";
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Trophy,
  Calendar,
  DollarSign,
  Users,
  Clock
} from "lucide-react";

interface Jackpot {
  id: number;
  name: string;
  amount: number;
  ticketPrice: number;
  maxWinners: number;
  drawNumber: number;
  status: 'active' | 'drawing' | 'completed';
  drawTime: string;
  totalTicketsSold: number;
  totalRevenue: number;
  winnersSelected: number;
  description?: string;
  isActive: boolean;
  createdAt: string;
}

const AdminJackpots = () => {
  const [jackpots, setJackpots] = useState<Jackpot[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selected, setSelected] = useState<Jackpot | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    amount: "",
    ticketPrice: "",
    maxWinners: "1",
    drawTime: "",
    description: "",
    status: "active"
  });

  useEffect(() => {
    fetchJackpots();
  }, []);

  const fetchJackpots = async () => {
    try {
      const params = {
        page: 1,
        limit: 50,
        search: searchTerm,
        status: statusFilter !== 'all' ? statusFilter : undefined
      };
      
      const response = await adminAPI.getJackpots(params);
      setJackpots(response.data.jackpots);
    } catch (error) {
      console.error('Error fetching jackpots:', error);
      setJackpots([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter jackpots locally (since we're already fetching with search params)
  const filteredJackpots = jackpots.filter(jackpot => {
    const matchesStatus = statusFilter === "all" || jackpot.status === statusFilter;
    return matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const variants = {
      active: "default",
      drawing: "secondary",
      completed: "outline"
    } as const;
    
    return <Badge variant={variants[status as keyof typeof variants]}>{status}</Badge>;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getTimeRemaining = (drawTime: string) => {
    const now = new Date();
    const draw = new Date(drawTime);
    const diff = draw.getTime() - now.getTime();
    
    if (diff <= 0) return "Expired";
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    return `${days}d ${hours}h`;
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Jackpots Management</h2>
          <p className="text-muted-foreground">Manage jackpots and draws</p>
        </div>
        <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) { setSelected(null); setForm({ name: "", amount: "", ticketPrice: "", maxWinners: "1", drawTime: "", description: "", status: "active" }); } }}>
          <DialogTrigger asChild>
            <Button onClick={() => { setSelected(null); setForm({ name: "", amount: "", ticketPrice: "", maxWinners: "1", drawTime: "", description: "", status: "active" }); }}>
              <Plus className="w-4 h-4 mr-2" />
              Create Jackpot
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{selected ? 'Edit Jackpot' : 'Create Jackpot'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <Label>Name</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Amount</Label>
                  <Input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
                </div>
                <div>
                  <Label>Ticket price</Label>
                  <Input type="number" value={form.ticketPrice} onChange={(e) => setForm({ ...form, ticketPrice: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Max winners</Label>
                  <Input type="number" value={form.maxWinners} onChange={(e) => setForm({ ...form, maxWinners: e.target.value })} />
                </div>
                <div>
                  <Label>Draw time</Label>
                  <Input type="datetime-local" value={form.drawTime} onChange={(e) => setForm({ ...form, drawTime: e.target.value })} />
                </div>
              </div>
              <div>
                <Label>Description</Label>
                <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <div>
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="drawing">Drawing</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button disabled={saving} onClick={async () => {
                  setSaving(true);
                  try {
                    if (selected) {
                      await adminAPI.updateJackpot(selected.id, { ...form });
                    } else {
                      await adminAPI.createJackpot({ ...form });
                    }
                    await fetchJackpots();
                    setOpen(false);
                  } catch (e) {
                    console.error('Save jackpot failed', e);
                  } finally {
                    setSaving(false);
                  }
                }}>{saving ? 'Saving...' : 'Save'}</Button>
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
              <Input
                placeholder="Search jackpots..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="drawing">Drawing</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Jackpots Table */}
      <Card>
        <CardHeader>
          <CardTitle>Jackpots ({filteredJackpots.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Ticket Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Tickets Sold</TableHead>
                <TableHead>Revenue</TableHead>
                <TableHead>Draw Time</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredJackpots.map((jackpot) => (
                <TableRow key={jackpot.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Trophy className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <div className="font-medium">{jackpot.name}</div>
                        <div className="text-sm text-muted-foreground">
                          Draw #{jackpot.drawNumber}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">
                    {formatCurrency(jackpot.amount)}
                  </TableCell>
                  <TableCell>
                    {formatCurrency(jackpot.ticketPrice)}
                  </TableCell>
                  <TableCell>{getStatusBadge(jackpot.status)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      {jackpot.totalTicketsSold.toLocaleString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-muted-foreground" />
                      {formatCurrency(jackpot.totalRevenue)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <div className="text-sm">
                          {new Date(jackpot.drawTime).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {getTimeRemaining(jackpot.drawTime)}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Jackpot Details</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="text-sm font-medium">Name</label>
                                <p className="text-sm text-muted-foreground">{jackpot.name}</p>
                              </div>
                              <div>
                                <label className="text-sm font-medium">Status</label>
                                <div className="mt-1">{getStatusBadge(jackpot.status)}</div>
                              </div>
                              <div>
                                <label className="text-sm font-medium">Total Amount</label>
                                <p className="text-sm text-muted-foreground">{formatCurrency(jackpot.amount)}</p>
                              </div>
                              <div>
                                <label className="text-sm font-medium">Ticket Price</label>
                                <p className="text-sm text-muted-foreground">{formatCurrency(jackpot.ticketPrice)}</p>
                              </div>
                              <div>
                                <label className="text-sm font-medium">Max Winners</label>
                                <p className="text-sm text-muted-foreground">{jackpot.maxWinners}</p>
                              </div>
                              <div>
                                <label className="text-sm font-medium">Winners Selected</label>
                                <p className="text-sm text-muted-foreground">{jackpot.winnersSelected}</p>
                              </div>
                              <div>
                                <label className="text-sm font-medium">Tickets Sold</label>
                                <p className="text-sm text-muted-foreground">{jackpot.totalTicketsSold.toLocaleString()}</p>
                              </div>
                              <div>
                                <label className="text-sm font-medium">Revenue</label>
                                <p className="text-sm text-muted-foreground">{formatCurrency(jackpot.totalRevenue)}</p>
                              </div>
                            </div>
                            {jackpot.description && (
                              <div>
                                <label className="text-sm font-medium">Description</label>
                                <p className="text-sm text-muted-foreground">{jackpot.description}</p>
                              </div>
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>
                      
                      <Button variant="ghost" size="sm" onClick={() => { setSelected(jackpot); setForm({ name: jackpot.name, amount: String(jackpot.amount), ticketPrice: String(jackpot.ticketPrice), maxWinners: String(jackpot.maxWinners), drawTime: new Date(jackpot.drawTime).toISOString().slice(0,16), description: jackpot.description || "", status: jackpot.status }); setOpen(true); }}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      
                      <Button variant="ghost" size="sm" className="text-destructive" onClick={async () => { try { await adminAPI.deleteJackpot(jackpot.id); setJackpots(jackpots.filter(j => j.id !== jackpot.id)); } catch (e) { console.error('Delete jackpot failed', e); } }}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
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

export default AdminJackpots; 