import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FaShoppingCart, 
  FaUserCircle, 
  FaBars, 
  FaTimes, 
  FaChevronDown 
} from 'react-icons/fa';
import logo from '../assets/images/logo.png';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { ShoppingCartIcon } from '@heroicons/react/24/outline';
import ProductSearch from './ProductSearch';

const COLORS = {
  RICH_GOLD: '#c5a35a',
  DEEP_CINNAMON: '#8B4513',
  WARM_BEIGE: '#F5EFE6',
  DARK_SLATE: '#2d2d2d',
  SOFT_WHITE: '#FCFBF8',
};

const navLinks = [
  { name: 'Home', href: '/' },
  { name: 'Products', href: '/products' },
  { name: 'Wholesale', href: '/wholesale' },
  { name: 'About Us', href: '/about' },
  { name: 'Contact Us', href: '/contact' },
  { name: 'Offers', href: '/buyer-offers' },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const { user, logout } = useAuth();
  const { cartItemCount } = useCart();
  const navigate = useNavigate();
  const profileRef = useRef();
  const mobileProfileRef = useRef();

  const handleLogout = async () => {
    try {
      await logout();
      setProfileOpen(false);
      setMenuOpen(false);
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  React.useEffect(() => {
    function handleClick(e) {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    }
    if (profileOpen) {
      document.addEventListener('mousedown', handleClick);
    }
    return () => document.removeEventListener('mousedown', handleClick);
  }, [profileOpen]);

  React.useEffect(() => {
    function handleClick(e) {
      if (mobileProfileRef.current && !mobileProfileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    }
    if (profileOpen && menuOpen) {
      document.addEventListener('mousedown', handleClick);
    }
    return () => document.removeEventListener('mousedown', handleClick);
  }, [profileOpen, menuOpen]);

  const closeAllMenus = () => {
    setMenuOpen(false);
    setProfileOpen(false);
  };

  return (
    <header className="w-full bg-[#8B4513] text-white sticky top-0 shadow-md z-50">
      <nav className="max-w-7xl mx-auto flex items-center justify-between px-4 py-3">
        {/* Logo */}
        <div
          className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition"
          onClick={() => { closeAllMenus(); navigate('/'); }}
          role="button"
          tabIndex={0}
          onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { closeAllMenus(); navigate('/'); } }}
        >
          <img src={logo} alt="CinnaCeylon Logo" className="h-12 w-auto" />
          <span className="font-bold text-xl tracking-wide hidden sm:block">CinnaCeylon</span>
        </div>

        {/* Nav Links (Desktop) */}
        <div className="hidden md:flex gap-6 text-lg font-medium items-center">
          {navLinks.map(link => (
            <Link
              key={link.name}
              to={link.href}
              className="hover:text-[#FFD700] transition-colors duration-200"
            >
              {link.name}
            </Link>
          ))}
          {user && (
            user.userType === 'supplier' ? (
              <Link to="/supplier/dashboard" className="hover:text-[#FFD700] transition-colors duration-200">Supplier Dashboard</Link>
            ) : user.userType === 'driver' ? (
<<<<<<< HEAD
              <Link to="/dashboard/driver" className="hover:text-[#FFD700] transition-colors duration-200">Driver Dashboard</Link>
            ) : null
=======
              <Link to="/driver/dashboard" className="hover:text-[#FFD700] transition-colors duration-200">Driver Dashboard</Link>
            ) : null /* Intentionally hide Buyer Dashboard link for buyers */
>>>>>>> 02cc9dd7424c0b0a7fb45df357870fcf09f9328d
          )}
        </div>

        {/* Right side icons and auth */}
        <div className="flex items-center gap-4">
          {/* Dynamic Product Search (Desktop) */}
          <div className="hidden lg:block">
            <ProductSearch />
          </div>

          {/* Cart Icon */}
          <Link to="/cart" className="relative text-white hover:text-gray-200 transition">
            <FaShoppingCart size={24} />
            {user && cartItemCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {cartItemCount}
              </span>
            )}
          </Link>

          {/* Desktop Auth / Profile */}
          <div className="hidden md:block">
            {!user ? (
              <div className="flex gap-4">
                <Link to="/login" className="hover:text-[#FFD700] transition-colors duration-200">Login</Link>
                <Link to="/register" className="hover:text-[#FFD700] transition-colors duration-200">Register</Link>
              </div>
            ) : (
              <div className="relative" ref={profileRef}>
                <button 
                  onClick={() => setProfileOpen(prev => !prev)} 
                  className="flex items-center gap-2 px-3 py-1 rounded hover:bg-[#A0522D] transition"
                  aria-label="User Profile Menu"
                >
                  <FaUserCircle size={20} />
                  <span className="text-sm font-medium max-w-24 truncate">{user?.username || user?.email || 'User'}</span>
                  <FaChevronDown size={12} className={`transition-transform duration-200 ${profileOpen ? 'rotate-180' : ''}`} />
                </button>
                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-40 bg-white text-gray-800 rounded-lg shadow-lg z-50 border">
                    {user?.isAdmin && (
                      <Link to="/dashboard/admin" className="block px-4 py-2 hover:bg-gray-100 transition-colors" onClick={() => setProfileOpen(false)}>Admin Dashboard</Link>
                    )}
                    {user?.userType === 'buyer' && (
                      <Link to="/dashboard/buyer" className="block px-4 py-2 hover:bg-gray-100 transition-colors" onClick={() => setProfileOpen(false)}>Buyer Dashboard</Link>
                    )}
                    <Link to="/profile" className="block px-4 py-2 hover:bg-gray-100 transition-colors" onClick={() => setProfileOpen(false)}>Profile</Link>
                    <button onClick={handleLogout} className="block w-full text-left px-4 py-2 hover:bg-gray-100 rounded-b-lg transition-colors border-t border-gray-200">Logout</button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile Hamburger */}
          <button className="md:hidden p-2 rounded hover:bg-[#A0522D] transition" onClick={() => setMenuOpen(true)} aria-label="Open menu">
            <FaBars size={20} />
          </button>
        </div>
      </nav>

      {/* Mobile Drawer */}
      <div className={`fixed top-0 right-0 h-full w-80 bg-[#8B4513] text-white flex flex-col p-6 transform transition-transform duration-300 ease-in-out ${menuOpen ? 'translate-x-0' : 'translate-x-full'} z-50 shadow-2xl`}>
        {/* Mobile Header */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#A0522D]">
          <Link to="/" className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition" onClick={closeAllMenus}>
            <img src={logo} alt="CinnaCeylon Logo" className="h-8 w-auto" />
            <span className="font-bold text-lg tracking-wide">CinnaCeylon</span>
          </Link>
          <button className="p-2 rounded hover:bg-[#A0522D] transition" onClick={closeAllMenus} aria-label="Close menu">
            <FaTimes size={20} />
          </button>
        </div>

        {/* Mobile Nav Links */}
        <div className="flex flex-col gap-4 mb-6">
          {navLinks.map(link => (
            <Link key={link.name} to={link.href} className="hover:text-[#FFD700] transition-colors duration-200 text-lg py-2 border-b border-transparent hover:border-[#FFD700]" onClick={closeAllMenus}>
              {link.name}
            </Link>
          ))}
          {user && (
            user.userType === 'supplier' ? <Link to="/supplier/dashboard" onClick={closeAllMenus}>Supplier Dashboard</Link> :
            user.userType === 'driver' ? <Link to="/driver/dashboard" onClick={closeAllMenus}>Driver Dashboard</Link> :
            null /* Buyer Dashboard link hidden intentionally */
          )}
        </div>

        {/* Mobile Auth Section */}
        {!user ? (
          <div className="flex flex-col gap-4 mb-6">
            <Link to="/login" className="bg-[#FFD700] text-black rounded-lg px-4 py-2 hover:bg-yellow-400 transition text-center font-medium" onClick={closeAllMenus}>Login</Link>
            <Link to="/register" className="border border-[#FFD700] text-[#FFD700] rounded-lg px-4 py-2 hover:bg-[#FFD700] hover:text-black transition text-center font-medium" onClick={closeAllMenus}>Register</Link>
          </div>
        ) : (
          <div className="mb-6" ref={mobileProfileRef}>
            <div className="bg-[#A0522D] rounded-lg p-4 mb-4">
              <div className="flex items-center gap-3 mb-3">
                <FaUserCircle size={24} />
                <span className="font-medium truncate">{user?.username || user?.email || 'User'}</span>
              </div>
              <div className="flex flex-col gap-2">
                {user?.isAdmin && (
                  <Link to="/dashboard/admin" className="bg-white text-gray-800 rounded px-3 py-2 hover:bg-gray-100 transition text-center text-sm" onClick={closeAllMenus}>Admin Dashboard</Link>
                )}
                {user?.userType === 'buyer' && (
                  <Link to="/dashboard/buyer" className="bg-white text-gray-800 rounded px-3 py-2 hover:bg-gray-100 transition text-center text-sm" onClick={closeAllMenus}>Buyer Dashboard</Link>
                )}
                <Link to="/profile" className="bg-white text-gray-800 rounded px-3 py-2 hover:bg-gray-100 transition text-center text-sm" onClick={closeAllMenus}>View Profile</Link>
                <button onClick={handleLogout} className="bg-red-600 text-white rounded px-3 py-2 hover:bg-red-700 transition text-center text-sm">Logout</button>
              </div>
            </div>
          </div>
        )}

        {/* Mobile Cart */}
        <div className="mt-auto pt-4 border-t border-[#A0522D]">
          <button className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-[#A0522D] transition" aria-label="Shopping Cart" onClick={closeAllMenus}>
            <FaShoppingCart size={20} />
            <span>Shopping Cart</span>
          </button>
        </div>

        {/* Mobile Search */}
        <div className="mb-6">
          <ProductSearch className="w-full" />
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {menuOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden" onClick={closeAllMenus} />}
    </header>
  );
}
