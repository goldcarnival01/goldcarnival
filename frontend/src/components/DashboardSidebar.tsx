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
    <div className="w-full lg:w-64 bg-card border-b lg:border-b-0 lg:border-r border-border lg:min-h-screen">
      {/* User Profile */}
      <div className="p-4 lg:p-6 border-b border-border">
        <div className="flex items-center space-x-3">
          <Avatar className="w-10 h-10 lg:w-12 lg:h-12">
            <AvatarImage src="" />
            <AvatarFallback className="gradient-gold text-primary-foreground font-semibold text-sm lg:text-base">
              {getUserInitials(user)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-foreground text-sm lg:text-base truncate">{user?.memberId || 'Loading...'}</p>
            <button className="text-xs lg:text-sm text-primary hover:underline">
              View Profile &gt;
            </button>
            <p className="text-xs text-muted-foreground truncate">{getUserDisplayName(user)}</p>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="p-3 lg:p-4">
        <ul className="flex lg:flex-col lg:space-y-2 space-x-2 lg:space-x-0 overflow-x-auto lg:overflow-x-visible">
          {menuItems.map((item) => (
            <li key={item.title} className="flex-shrink-0 lg:flex-shrink">
              <NavLink
                to={item.url}
                end={item.url === "/dashboard"}
                className={({ isActive }) =>
                  `flex items-center space-x-2 lg:space-x-3 px-3 lg:px-4 py-2 lg:py-3 rounded-lg transition-colors whitespace-nowrap ${
                    isActive
                      ? "gradient-gold text-primary-foreground"
                      : "text-foreground hover:bg-secondary/20"
                  }`
                }
              >
                <item.icon className="w-4 h-4 lg:w-5 lg:h-5 flex-shrink-0" />
                <span className="text-sm lg:text-base">{item.title}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default DashboardSidebar;