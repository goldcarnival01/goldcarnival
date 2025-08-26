import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { adminAPI } from "@/services/api";
import { 
  Users, 
  Wallet, 
  Ticket, 
  Trophy, 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  Activity,
  Settings
} from "lucide-react";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalJackpots: 0,
    totalTickets: 0,
    totalTransactions: 0,
    totalRevenue: 0,
    activeJackpots: 0,
    pendingTransactions: 0,
    recentActivity: []
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await adminAPI.getDashboardStats();
        const { stats: apiStats, recentActivity } = response.data;
        
        setStats({
          totalUsers: apiStats.totalUsers,
          totalJackpots: apiStats.totalJackpots,
          totalTickets: apiStats.totalTickets,
          totalTransactions: apiStats.totalTransactions,
          totalRevenue: apiStats.totalRevenue,
          activeJackpots: apiStats.activeJackpots,
          pendingTransactions: apiStats.pendingTransactions,
          recentActivity: [
            ...recentActivity.users.map(user => ({
              id: user.id,
              type: 'user_registered',
              message: `New user ${user.firstName} ${user.lastName} registered`,
              time: new Date(user.createdAt).toLocaleString()
            })),
            ...recentActivity.transactions.map(transaction => ({
              id: transaction.id,
              type: 'transaction',
              message: `${transaction.transactionType} transaction for $${transaction.amount}`,
              time: new Date(transaction.createdAt).toLocaleString()
            })),
            ...recentActivity.jackpots.map(jackpot => ({
              id: jackpot.id,
              type: 'jackpot_updated',
              message: `Jackpot "${jackpot.name}" status: ${jackpot.status}`,
              time: new Date(jackpot.updatedAt).toLocaleString()
            }))
          ]
        });
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        // Fallback to mock data if API fails
        setStats({
          totalUsers: 0,
          totalJackpots: 0,
          totalTickets: 0,
          totalTransactions: 0,
          totalRevenue: 0,
          activeJackpots: 0,
          pendingTransactions: 0,
          recentActivity: []
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 text-green-500" /> +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 text-green-500" /> +8% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Jackpots</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeJackpots}</div>
            <p className="text-xs text-muted-foreground">
              Out of {stats.totalJackpots} total jackpots
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Transactions</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingTransactions}</div>
            <p className="text-xs text-muted-foreground">
              Require attention
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
              <Trophy className="h-6 w-6" />
              <span>Create Jackpot</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
              <Users className="h-6 w-6" />
              <span>Manage Users</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
              <Wallet className="h-6 w-6" />
              <span>Process Payments</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
              <Settings className="h-6 w-6" />
              <span>System Settings</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Badge variant="secondary" className="capitalize">
                    {activity.type.replace('_', ' ')}
                  </Badge>
                  <span className="text-sm">{activity.message}</span>
                </div>
                <span className="text-xs text-muted-foreground">{activity.time}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard; 