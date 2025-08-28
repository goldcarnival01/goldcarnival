import { Facebook, Instagram, Twitter, Youtube, Phone, Mail, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import ticketIcon from "@/assets/ticket-icon.png";

const Footer = () => {
  return (
    <footer className="bg-secondary/10 border-t border-border pt-16 pb-8">
      <div className="container mx-auto px-4">
        {/* Main footer content */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mb-8 sm:mb-12">
          {/* Company info */}
          <div className="lg:col-span-1 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center space-x-3 mb-4 sm:mb-6">
              <img src={ticketIcon} alt="Gold Carnival" className="w-10 h-10 sm:w-12 sm:h-12" />
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-primary">GOLD</h3>
                <p className="text-xs sm:text-sm text-muted-foreground -mt-1">CARNIVAL</p>
              </div>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed mb-4 sm:mb-6">
              With GOLD CARNIVAL, you join a league where winners are made. We are an organization that helps the people across the world to achieve their dreams and much more.
            </p>
          </div>

          {/* About Gold Carnival */}
          <div>
            <h4 className="text-base sm:text-lg font-semibold text-primary mb-3 sm:mb-4">ABOUT GOLD CARNIVAL</h4>
            <ul className="space-y-2 sm:space-y-3">
              <li><Link to="/refer-earn" className="text-muted-foreground hover:text-primary transition-colors text-sm">Refer & Earn</Link></li>
              <li><Link to="/faq" className="text-muted-foreground hover:text-primary transition-colors text-sm">FAQ</Link></li>
              <li><Link to="/contact" className="text-muted-foreground hover:text-primary transition-colors text-sm">Contact</Link></li>
            </ul>
          </div>

          {/* Legal Info */}
          <div>
            <h4 className="text-base sm:text-lg font-semibold text-primary mb-3 sm:mb-4">LEGAL INFO</h4>
            <ul className="space-y-2 sm:space-y-3">
              <li><Link to="/privacy-policy" className="text-muted-foreground hover:text-primary transition-colors text-sm">Privacy Policy</Link></li>
              <li><Link to="/terms" className="text-muted-foreground hover:text-primary transition-colors text-sm">Terms and Conditions</Link></li>
            </ul>
          </div>

          {/* Get in Touch */}
          <div>
            <h4 className="text-base sm:text-lg font-semibold text-primary mb-3 sm:mb-4">GET IN TOUCH</h4>
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-start space-x-3">
                <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-muted-foreground text-sm break-all">support@goldcarnival.com</span>
              </div>
              <div className="flex items-start space-x-3">
                <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-muted-foreground text-sm">+44 7537185219</span>
              </div>
              <div className="flex items-start space-x-3">
                <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-muted-foreground text-sm">
                  Intershore Chambers, Road Town, Tortola, British Virgin Islands
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-border text-center">
          <p className="text-muted-foreground text-sm">
            © 2025 JT Global Tech Limited. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;