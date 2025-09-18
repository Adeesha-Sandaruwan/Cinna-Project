import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebook, FaTwitter, FaInstagram } from 'react-icons/fa';
import logo from '../assets/images/logo.png';

const quickLinks = [
  { name: 'Home', href: '/' },
  { name: 'Products', href: '/products' },
  { name: 'Wholesale', href: '/wholesale' },
  { name: 'About Us', href: '/about' },
  { name: 'Contact Us', href: '/contact' },
];

export default function Footer() {
  return (
    <footer className="w-full bg-[#8B4513] text-white py-10">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Logo + About */}
        <div className="flex flex-col gap-4">
          <img src={logo} alt="Logo" className="w-48 md:w-64 h-auto" />
          <p className="text-sm leading-relaxed">
            CinnaCeylon brings you the finest Ceylon cinnamon and spices, sourced directly from Sri Lanka. Quality and authenticity in every product.
          </p>
        </div>
        {/* Quick Links */}
        <div className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold border-b border-[#FFD700] pb-2">Quick Links</h2>
          {quickLinks.map(link => (
            <Link
              key={link.name}
              to={link.href}
              className="bg-white text-[#8B4513] rounded-full px-4 py-2 hover:bg-[#FFD700] hover:text-black transition"
            >
              {link.name}
            </Link>
          ))}
        </div>
        {/* Contact + Social */}
        <div className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold border-b border-[#FFD700] pb-2">Contact Us</h2>
          <div className="flex items-center gap-2">
            <span className="material-icons">email</span>
            <span className="bg-white text-[#8B4513] rounded-full px-3 py-1">info@cinnaceylon.com</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="material-icons">phone</span>
            <span className="bg-white text-[#8B4513] rounded-full px-3 py-1">+94 77 123 4567</span>
          </div>
          <div className="flex gap-3 mt-4">
            <a
              href="https://facebook.com"
              className="w-10 h-10 rounded-full flex items-center justify-center bg-white text-[#8B4513] hover:bg-[#FFD700] hover:text-black transition"
              aria-label="Facebook"
              target="_blank" rel="noopener noreferrer"
            >
              <FaFacebook size={20} />
            </a>
            <a
              href="https://twitter.com"
              className="w-10 h-10 rounded-full flex items-center justify-center bg-white text-[#8B4513] hover:bg-[#FFD700] hover:text-black transition"
              aria-label="Twitter"
              target="_blank" rel="noopener noreferrer"
            >
              <FaTwitter size={20} />
            </a>
            <a
              href="https://instagram.com"
              className="w-10 h-10 rounded-full flex items-center justify-center bg-white text-[#8B4513] hover:bg-[#FFD700] hover:text-black transition"
              aria-label="Instagram"
              target="_blank" rel="noopener noreferrer"
            >
              <FaInstagram size={20} />
            </a>
          </div>
        </div>
      </div>
      <div className="text-center text-xs text-gray-300 mt-6">
        &copy; {new Date().getFullYear()} CinnaCeylon. All rights reserved.
      </div>
    </footer>
  );
}
