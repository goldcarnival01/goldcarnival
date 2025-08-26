import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  Wallet, 
  Ticket, 
  Trophy, 
  Settings, 
  FileText, 
  Globe,
  BarChart3,
  CreditCard,
  Shield,
  Package
} from "lucide-react";
import AdminUsers from "@/components/admin/AdminUsers";
import AdminJackpots from "@/components/admin/AdminJackpots";
import AdminTickets from "@/components/admin/AdminTickets";
import AdminTransactions from "@/components/admin/AdminTransactions";
import AdminWallets from "@/components/admin/AdminWallets";
import AdminSettings from "@/components/admin/AdminSettings";
import AdminPages from "@/components/admin/AdminPages";
import AdminLanguages from "@/components/admin/AdminLanguages";
import AdminRoles from "@/components/admin/AdminRoles";
import AdminDashboard from "@/components/admin/AdminDashboard";
import AdminPlans from "@/components/admin/AdminPlans";

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState("dashboard");

  const adminTabs = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: BarChart3,
      component: AdminDashboard
    },
    {
      id: "users",
      label: "Users",
      icon: Users,
      component: AdminUsers
    },
    {
      id: "jackpots",
      label: "Jackpots",
      icon: Trophy,
      component: AdminJackpots
    },
    {
      id: "plans",
      label: "Plans",
      icon: Package,
      component: AdminPlans
    },
    {
      id: "tickets",
      label: "Tickets",
      icon: Ticket,
      component: AdminTickets
    },
    {
      id: "transactions",
      label: "Transactions",
      icon: CreditCard,
      component: AdminTransactions
    },
    {
      id: "wallets",
      label: "Wallets",
      icon: Wallet,
      component: AdminWallets
    },
    {
      id: "roles",
      label: "Roles",
      icon: Shield,
      component: AdminRoles
    },
    {
      id: "pages",
      label: "Pages",
      icon: FileText,
      component: AdminPages
    },
    {
      id: "languages",
      label: "Languages",
      icon: Globe,
      component: AdminLanguages
    },
    {
      id: "settings",
      label: "Settings",
      icon: Settings,
      component: AdminSettings
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Admin Panel</h1>
          <p className="text-muted-foreground">Manage your application from here</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 lg:grid-cols-11 mb-6">
            {adminTabs.map((tab) => (
              <TabsTrigger key={tab.id} value={tab.id} className="flex items-center gap-2">
                <tab.icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {adminTabs.map((tab) => (
            <TabsContent key={tab.id} value={tab.id}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <tab.icon className="w-5 h-5" />
                    {tab.label}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <tab.component />
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
};

export default AdminPage; 