import React from 'react';
import { Tractor, Mail, Phone, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="bg-primary text-primary-foreground mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary-foreground/10 flex items-center justify-center">
                <Tractor className="w-6 h-6" />
              </div>
              <div>
                <span className="font-display font-bold text-lg">Standard Agro Engineering India</span>
                <span className="block text-xs text-primary-foreground/70 -mt-1">
                  Agricultural Machinery
                </span>
              </div>
            </div>
            <p className="text-primary-foreground/80 text-sm leading-relaxed">
              Your trusted partner for quality agricultural machinery. We provide the best equipment to help farmers succeed.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-display font-semibold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/cart" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                  Cart
                </Link>
              </li>
              <li>
                <Link to="/login" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                  Login
                </Link>
              </li>
              <li>
                <Link to="/register" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                  Register
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-display font-semibold text-lg mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-primary-foreground/80">
                <Mail className="w-4 h-4" />
                <span>support@agrimach.com</span>
              </li>
              <li className="flex items-center gap-3 text-primary-foreground/80">
                <Phone className="w-4 h-4" />
                <span>+91 98765 43210</span>
              </li>
              <li className="flex items-start gap-3 text-primary-foreground/80">
                <MapPin className="w-4 h-4 mt-1" />
                <span>5/42, Oodaikadu, Sitheri PO, Thalaivasal TK, Salem - 636101</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 mt-8 pt-8 text-center text-primary-foreground/60 text-sm">
          <p>&copy; {new Date().getFullYear()} AgriMach. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
