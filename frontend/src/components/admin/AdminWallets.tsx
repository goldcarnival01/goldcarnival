import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { adminAPI } from "@/services/api";
import { 
  Search, 
  Wallet,
  User,
  DollarSign,
  Calendar,
  CreditCard,
  TrendingUp,
  TrendingDown
} from "lucide-react";

interface WalletData {
  id: number;
  userId: number;
  userName: string;
  walletType: 'deposit' | 'winnings' | 'ticket_bonus';
  balance: number;
  currency: string;
  isActive: boolean;
  createdAt: string;
  lastTransactionAt?: string;
}

const AdminWallets = () => {
  const [wallets, setWallets] = useState<WalletData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  useEffect(() => {
    fetchWallets();
  }, []);

  const fetchWallets = async () => {
    try {
      const params = {
        page: 1,
        limit: 50,
        type: typeFilter !== 'all' ? typeFilter : undefined
      };
      
      const response = await adminAPI.getWallets(params);
      setWallets(response.data.wallets);
    } catch (error) {
      console.error('Error fetching wallets:', error);
      setWallets([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter wallets locally (since we're already fetching with type params)
  const filteredWallets = wallets.filter(wallet => {
    const matchesSearch = 
      wallet.user?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      wallet.user?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      wallet.user?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return !searchTerm || matchesSearch;
  });

  const getTypeBadge = (type: string) => {
    const variants = {
      deposit: "default",
      winnings: "secondary",
      ticket_bonus: "outline"
    } as const;
    
    return <Badge variant={variants[type as keyof typeof variants]}>{type.replace('_', ' ')}</Badge>;
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Wallets Management</h2>
          <p className="text-muted-foreground">Monitor user wallet balances and transactions</p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search wallets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="deposit">Deposit</SelectItem>
                <SelectItem value="winnings">Winnings</SelectItem>
                <SelectItem value="ticket_bonus">Ticket Bonus</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Wallets Table */}
      <Card>
        <CardHeader>
          <CardTitle>Wallets ({filteredWallets.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Wallet Type</TableHead>
                <TableHead>Balance</TableHead>
                <TableHead>Currency</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Transaction</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredWallets.map((wallet) => (
                <TableRow key={wallet.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-muted-foreground" />
                      {wallet.userName}
                    </div>
                  </TableCell>
                  <TableCell>{getTypeBadge(wallet.walletType)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Wallet className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">
                        {formatCurrency(wallet.balance, wallet.currency)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{wallet.currency}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={wallet.isActive ? "default" : "secondary"}>
                      {wallet.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      {wallet.lastTransactionAt ? (
                        new Date(wallet.lastTransactionAt).toLocaleDateString()
                      ) : (
                        <span className="text-muted-foreground">Never</span>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Wallets</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{wallets.length}</div>
            <p className="text-xs text-muted-foreground">
              Active wallets in system
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(
                wallets.reduce((sum, wallet) => sum + wallet.balance, 0),
                "USD"
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Combined wallet balances
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(wallets.map(w => w.userId)).size}
            </div>
            <p className="text-xs text-muted-foreground">
              Users with wallets
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminWallets; 