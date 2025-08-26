import { Button } from "@/components/ui/button";
import { Menu, User, ChevronDown, LogOut } from "lucide-react";
import ticketIcon from "@/assets/ticket-icon.png";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const Header = () => {
  const { isAuthenticated, logout } = useAuth();

  return (
    <header className="bg-background/95 backdrop-blur-sm border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-3">
          <img src={ticketIcon} alt="Gold Carnival" className="w-10 h-10" />
          <div>
            <h1 className="text-xl font-bold text-primary">GOLD</h1>
            <p className="text-xs text-muted-foreground -mt-1">CARNIVAL</p>
          </div>
        </Link>

        {/* Navigation */}
        <nav className="hidden lg:flex items-center space-x-8">
          <Link to="/" className="text-foreground hover:text-primary transition-colors">
            Home
          </Link>
          <Link to="/about" className="text-foreground hover:text-primary transition-colors">
            About Us
          </Link>
          <Link to="/winners" className="text-foreground hover:text-primary transition-colors">
            Winners
          </Link>
          <Link to="/refer-earn" className="text-foreground hover:text-primary transition-colors">
            Refer & Earn
          </Link>
          {/* <div className="relative group">
            <button className="flex items-center space-x-1 text-foreground hover:text-primary transition-colors">
              <span>Know More</span>
              <ChevronDown className="w-4 h-4" />
            </button>
          </div> */}
        </nav>

        {/* Right side */}
        <div className="flex items-center space-x-4">
          {!isAuthenticated ? (
            <>
              <Link to="/login">
                <Button variant="ghost" size="sm">
                  Sign-In
                </Button>
              </Link>
              <Link to="/signup">
                <Button variant="gold" size="sm">
                  Join Now
                </Button>
              </Link>
            </>
          ) : (
            <div className="flex items-center space-x-2">
              <Link to="/dashboard">
                <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                  <User className="w-4 h-4" />
                  <span>Dashboard</span>
                </Button>
              </Link>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={logout}
                className="flex items-center space-x-2 text-destructive hover:text-destructive"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </Button>
            </div>
          )}
          <div className="flex items-center space-x-2 text-sm">
            <img src="https://flagcdn.com/w20/gb.png" alt="English" className="w-5 h-3" />
            <span className="text-foreground">English</span>
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          </div>
          <Button variant="ghost" size="icon" className="lg:hidden">
            <Menu className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;