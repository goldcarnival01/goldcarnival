import { NavLink } from "react-router-dom";
import { 
  Home,
  ShoppingCart,
  History,
  Trophy,
  Wallet,
  ArrowRightLeft,
  ArrowDownToLine,
  Users
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "../contexts/AuthContext";

const DashboardSidebar = () => {
  const { user } = useAuth();

  // Generate user initials
  const getUserInitials = (user) => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`;
    }
    if (user?.firstName) {
      return user.firstName.charAt(0).toUpperCase();
    }
    if (user?.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return 'U';
  };

  const getUserDisplayName = (user) => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    if (user?.firstName) {
      return user.firstName;
    }
    return user?.memberId || user?.email || 'User';
  };

  const menuItems = [
    { title: "Dashboard", url: "/dashboard", icon: Home },
    { title: "My Plans", url: "/dashboard/my-plans", icon: History },
    { title: "My Winnings", url: "/dashboard/my-winnings", icon: Trophy },
    { title: "Deposit", url: "/dashboard/deposit", icon: Wallet },
    { title: "Withdraw Fund", url: "/dashboard/withdraw-fund", icon: ArrowDownToLine },
    { title: "My Referrals", url: "/dashboard/referrals", icon: Users },
  ];

  return (
    <div className="w-64 bg-card border-r border-border min-h-screen">
      {/* User Profile */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center space-x-3">
          <Avatar className="w-12 h-12">
            <AvatarImage src="" />
            <AvatarFallback className="gradient-gold text-primary-foreground font-semibold">
              {getUserInitials(user)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold text-foreground">{user?.memberId || 'Loading...'}</p>
            <button className="text-sm text-primary hover:underline">
              View Profile &gt;
            </button>
            <p className="text-xs text-muted-foreground">{getUserDisplayName(user)}</p>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.title}>
              <NavLink
                to={item.url}
                end={item.url === "/dashboard"}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? "gradient-gold text-primary-foreground"
                      : "text-foreground hover:bg-secondary/20"
                  }`
                }
              >
                <item.icon className="w-5 h-5" />
                <span>{item.title}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default DashboardSidebar;