import { Link } from 'react-router';

const Footer = () => {
  return (
    <footer className="w-full bg-white border-t border-palette-light py-8 px-8 mt-auto">
      <div className="max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
        {/* Brand / Copyright */}
        <div className="flex items-center space-x-2">
          <span className="font-serif font-bold text-palette-dark text-lg">Pro Blog</span>
          <span className="text-gray-400 text-sm">© {new Date().getFullYear()} All rights reserved.</span>
        </div>

        {/* Navigation Links */}
        <div className="flex items-center space-x-6 text-sm text-gray-500 font-medium">
          <Link to="/" className="hover:text-palette-dark transition">Home</Link>
          <Link to="/dashboard" className="hover:text-palette-dark transition">Dashboard</Link>
          <Link to="/write" className="hover:text-palette-dark transition">Write Story</Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;