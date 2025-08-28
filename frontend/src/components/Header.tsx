import { Button } from "@/components/ui/button";
import { Menu, User, ChevronDown, LogOut, X } from "lucide-react";
import ticketIcon from "@/assets/ticket-icon.png";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const Header = () => {
  const { isAuthenticated, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <header className="bg-background/95 backdrop-blur-sm border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2 sm:space-x-3" onClick={closeMobileMenu}>
          <img src={ticketIcon} alt="Gold Carnival" className="w-8 h-8 sm:w-10 sm:h-10" />
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-primary">GOLD</h1>
            <p className="text-xs text-muted-foreground -mt-1">CARNIVAL</p>
          </div>
        </Link>

        {/* Desktop Navigation */}
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
        </nav>

        {/* Desktop Right side */}
        <div className="hidden lg:flex items-center space-x-4">
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
        </div>

        {/* Mobile menu button */}
        <Button 
          variant="ghost" 
          size="icon" 
          className="lg:hidden"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
      </div>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-border bg-background/98 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-4 space-y-4">
            {/* Mobile Navigation Links */}
            <nav className="space-y-3">
              <Link 
                to="/" 
                className="block py-2 text-foreground hover:text-primary transition-colors font-medium"
                onClick={closeMobileMenu}
              >
                Home
              </Link>
              <Link 
                to="/about" 
                className="block py-2 text-foreground hover:text-primary transition-colors font-medium"
                onClick={closeMobileMenu}
              >
                About Us
              </Link>
              <Link 
                to="/winners" 
                className="block py-2 text-foreground hover:text-primary transition-colors font-medium"
                onClick={closeMobileMenu}
              >
                Winners
              </Link>
              <Link 
                to="/refer-earn" 
                className="block py-2 text-foreground hover:text-primary transition-colors font-medium"
                onClick={closeMobileMenu}
              >
                Refer & Earn
              </Link>
            </nav>

            {/* Mobile Auth Buttons */}
            <div className="pt-4 border-t border-border space-y-3">
              {!isAuthenticated ? (
                <>
                  <Link to="/login" onClick={closeMobileMenu}>
                    <Button variant="ghost" size="sm" className="w-full justify-start">
                      Sign-In
                    </Button>
                  </Link>
                  <Link to="/signup" onClick={closeMobileMenu}>
                    <Button variant="gold" size="sm" className="w-full">
                      Join Now
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/dashboard" onClick={closeMobileMenu}>
                    <Button variant="ghost" size="sm" className="w-full justify-start">
                      <User className="w-4 h-4 mr-2" />
                      Dashboard
                    </Button>
                  </Link>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => { logout(); closeMobileMenu(); }}
                    className="w-full justify-start text-destructive hover:text-destructive"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </Button>
                </>
              )}
            </div>

            {/* Language selector */}
            <div className="pt-4 border-t border-border">
              <div className="flex items-center space-x-2 text-sm">
                <img src="https://flagcdn.com/w20/gb.png" alt="English" className="w-5 h-3" />
                <span className="text-foreground">English</span>
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;