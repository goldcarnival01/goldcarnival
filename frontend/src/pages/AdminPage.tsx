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
      <div className="container mx-auto p-3 sm:p-6">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Admin Panel</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Manage your application from here</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="mb-4 sm:mb-6 overflow-x-auto">
            <TabsList className="grid w-max min-w-full grid-cols-5 lg:grid-cols-11 gap-1">
              {adminTabs.map((tab) => (
                <TabsTrigger key={tab.id} value={tab.id} className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 text-xs sm:text-sm whitespace-nowrap">
                  <tab.icon className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden text-xs">{tab.label.slice(0, 4)}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {adminTabs.map((tab) => (
            <TabsContent key={tab.id} value={tab.id}>
              <Card>
                <CardHeader className="p-3 sm:p-6">
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                    <tab.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                    {tab.label}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3 sm:p-6 pt-0">
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