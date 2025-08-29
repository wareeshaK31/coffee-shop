import { Coffee, Facebook, Twitter, Instagram } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-coffee-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <Coffee className="h-8 w-8 text-cream-300" />
              <span className="font-serif text-2xl font-bold">
                Unicorn Coffee
              </span>
            </div>
            <p className="text-cream-100 mb-4 max-w-md">
              Experience the finest coffee blends crafted with passion and served with love. 
              Your perfect cup awaits at Unicorn Coffee.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-cream-200 hover:text-cream-100 transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-cream-200 hover:text-cream-100 transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-cream-200 hover:text-cream-100 transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <a href="/" className="text-cream-200 hover:text-cream-100 transition-colors">
                  Home
                </a>
              </li>
              <li>
                <a href="/menu" className="text-cream-200 hover:text-cream-100 transition-colors">
                  Menu
                </a>
              </li>
              <li>
                <a href="#" className="text-cream-200 hover:text-cream-100 transition-colors">
                  About Us
                </a>
              </li>
              <li>
                <a href="#" className="text-cream-200 hover:text-cream-100 transition-colors">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Contact</h3>
            <div className="space-y-2 text-cream-200">
              <p>123 Coffee Street</p>
              <p>Brew City, BC 12345</p>
              <p>Phone: (555) 123-4567</p>
              <p>Email: hello@unicorncoffee.com</p>
            </div>
          </div>
        </div>

        <div className="border-t border-coffee-800 mt-8 pt-8 text-center">
          <p className="text-cream-200">
            © 2024 Unicorn Coffee. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
