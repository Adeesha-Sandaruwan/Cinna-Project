import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaShoppingCart, FaUserCircle, FaBars, FaTimes } from 'react-icons/fa';
import logo from '../assets/images/logo.png';

const navLinks = [
  { name: 'Home', href: '/' },
  { name: 'Products', href: '/products' },
  { name: 'Wholesale', href: '/wholesale' },
  { name: 'About Us', href: '/about' },
  { name: 'Contact Us', href: '/contact' },
];

export default function HeaderAfterLogin() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    fetchCartCount();
  }, []);

  const fetchCartCount = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/cart/default');
      if (response.ok) {
        const cart = await response.json();
        if (cart && cart.items) {
          const totalItems = cart.items.reduce((sum, item) => sum + item.qty, 0);
          setCartCount(totalItems);
        } else {
          setCartCount(0);
        }
      }
    } catch (err) {
      console.error('Error fetching cart count:', err);
    }
  };

  // Listen for cart updates
  useEffect(() => {
    const handleCartUpdate = () => {
      fetchCartCount();
    };

    window.addEventListener('cartUpdated', handleCartUpdate);
    return () => window.removeEventListener('cartUpdated', handleCartUpdate);
  }, []);

  return (
    <header className="w-full bg-[#8B4513] text-white sticky top-0 shadow-md z-50">
      <nav className="max-w-7xl mx-auto flex items-center justify-between px-4 py-3">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition">
          <img src={logo} alt="Logo" className="h-12 w-auto" />
          <span className="font-bold text-xl tracking-wide hidden sm:block">CinnaCeylon</span>
        </Link>
        {/* Nav Links (Desktop) */}
        <div className="hidden md:flex gap-6 text-lg font-medium">
          {navLinks.map(link => (
            <Link
              key={link.name}
              to={link.href}
              className="hover:text-[#FFD700] transition-colors duration-200"
            >
              {link.name}
            </Link>
          ))}
        </div>
        {/* Search + Icons */}
        <div className="flex items-center gap-4">
          {/* Search Bar */}
          <form className="hidden sm:flex flex items-center bg-white rounded-full px-3 py-1 shadow-inner">
            <input
              type="text"
              placeholder="Search..."
              className="bg-transparent outline-none text-sm text-gray-700 placeholder-gray-400"
            />
            <button
              type="submit"
              className="bg-[#FFD700] text-black rounded-full px-3 py-1 hover:bg-yellow-400 transition"
            >
              Search
            </button>
          </form>
          {/* Icons */}
          <Link to="/cart" className="relative p-2 rounded-full hover:bg-[#A0522D] transition" aria-label="Cart">
            <FaShoppingCart size={22} />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>
          <button className="p-2 rounded-full hover:bg-[#A0522D] transition" aria-label="Profile">
            <FaUserCircle size={22} />
          </button>
          {/* Hamburger (Mobile) */}
          <button
            className="md:hidden p-2 rounded hover:bg-[#A0522D] transition"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
          >
            <FaBars size={22} />
          </button>
        </div>
      </nav>
      {/* Mobile Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-64 bg-[#8B4513] text-white flex flex-col gap-6 p-6 transform transition-transform duration-300 ${
          menuOpen ? 'translate-x-0' : 'translate-x-full'
        } z-50`}
        style={{ boxShadow: menuOpen ? '-2px 0 16px rgba(0,0,0,0.15)' : 'none' }}
      >
        <div className="flex items-center justify-between mb-4">
          <Link to="/" className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition">
            <img src={logo} alt="Logo" className="h-10 w-auto" />
            <span className="font-bold text-lg tracking-wide">CinnaCeylon</span>
          </Link>
          <button
            className="p-2 rounded hover:bg-[#A0522D] transition"
            onClick={() => setMenuOpen(false)}
            aria-label="Close menu"
          >
            <FaTimes size={22} />
          </button>
        </div>
        <div className="flex flex-col gap-4">
          {navLinks.map(link => (
            <Link
              key={link.name}
              to={link.href}
              className="hover:text-[#FFD700] transition-colors duration-200 text-lg"
              onClick={() => setMenuOpen(false)}
            >
              {link.name}
            </Link>
          ))}
        </div>
        <form className="flex items-center bg-white rounded-full px-3 py-1 shadow-inner mt-4">
          <input
            type="text"
            placeholder="Search..."
            className="bg-transparent outline-none text-sm text-gray-700 placeholder-gray-400 flex-1"
          />
          <button
            type="submit"
            className="bg-[#FFD700] text-black rounded-full px-3 py-1 hover:bg-yellow-400 transition"
          >
            Search
          </button>
        </form>
        <div className="flex items-center gap-4 mt-6">
          <Link to="/cart" className="relative p-2 rounded-full hover:bg-[#A0522D] transition" aria-label="Cart">
            <FaShoppingCart size={22} />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>
          <button className="p-2 rounded-full hover:bg-[#A0522D] transition" aria-label="Profile">
            <FaUserCircle size={22} />
          </button>
        </div>
      </div>
      {/* Overlay for mobile menu */}
      {menuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 z-40"
          onClick={() => setMenuOpen(false)}
        />
      )}
    </header>
  );
}
