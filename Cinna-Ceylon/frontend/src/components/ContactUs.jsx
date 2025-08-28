import React from 'react';
import { PhoneIcon, EnvelopeIcon, MapPinIcon, ClockIcon } from '@heroicons/react/24/outline';
import Header from './Header';
import Footer from './Footer';

/* ----- Color tokens (matching theme) ----- */
const COLORS = {
  RICH_GOLD: '#c5a35a',
  DEEP_CINNAMON: '#CC7722',
  WARM_BEIGE: '#F5EFE6',
  DARK_SLATE: '#2d2d2d',
  SOFT_WHITE: '#FCFBF8',
};

function ContactUs() {
  return (
    <div style={{ backgroundColor: COLORS.SOFT_WHITE }} className="antialiased">
      <Header />

      <main className="text-gray-800">
        {/* ---------- Hero Section ---------- */}
        <section className="py-16 bg-gradient-to-br from-amber-50 to-orange-50">
          <div className="max-w-4xl mx-auto px-6 md:px-8 text-center">
            <h1 
              className="text-4xl md:text-5xl font-extrabold leading-tight mb-6"
              style={{ fontFamily: "'Cormorant Garamond', serif", color: COLORS.DARK_SLATE }}
            >
              Contact Us
            </h1>
            <p className="text-lg md:text-xl text-gray-700 leading-relaxed max-w-2xl mx-auto">
              Get in touch with our team. We're here to help you with any questions about our 
              Ceylon cinnamon supply chain management system.
            </p>
          </div>
        </section>

        {/* ---------- Contact Information & Form ---------- */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-6 md:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              
              {/* Contact Information */}
              <div>
                <h2 
                  className="text-3xl font-bold mb-8"
                  style={{ fontFamily: "'Cormorant Garamond', serif", color: COLORS.DARK_SLATE }}
                >
                  Get In Touch
                </h2>
                
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div 
                      className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: COLORS.RICH_GOLD }}
                    >
                      <PhoneIcon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-2" style={{ color: COLORS.DARK_SLATE }}>
                        Phone
                      </h3>
                      <p className="text-gray-600">+94 77 123 4567</p>
                      <p className="text-gray-600">+94 11 234 5678</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div 
                      className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: COLORS.DEEP_CINNAMON }}
                    >
                      <EnvelopeIcon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-2" style={{ color: COLORS.DARK_SLATE }}>
                        Email
                      </h3>
                      <p className="text-gray-600">info@cinnaceylon.com</p>
                      <p className="text-gray-600">support@cinnaceylon.com</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div 
                      className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: COLORS.RICH_GOLD }}
                    >
                      <MapPinIcon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-2" style={{ color: COLORS.DARK_SLATE }}>
                        Address
                      </h3>
                      <p className="text-gray-600">
                        123 Cinnamon Gardens<br />
                        Colombo 07, Sri Lanka<br />
                        00700
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div 
                      className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: COLORS.DEEP_CINNAMON }}
                    >
                      <ClockIcon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-2" style={{ color: COLORS.DARK_SLATE }}>
                        Business Hours
                      </h3>
                      <p className="text-gray-600">
                        Monday - Friday: 9:00 AM - 6:00 PM<br />
                        Saturday: 9:00 AM - 1:00 PM<br />
                        Sunday: Closed
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Form */}
              <div>
                <h2 
                  className="text-3xl font-bold mb-8"
                  style={{ fontFamily: "'Cormorant Garamond', serif", color: COLORS.DARK_SLATE }}
                >
                  Send Us a Message
                </h2>
                
                <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                        First Name
                      </label>
                      <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-300 focus:border-transparent outline-none transition"
                        placeholder="Your first name"
                      />
                    </div>
                    <div>
                      <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                        Last Name
                      </label>
                      <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-300 focus:border-transparent outline-none transition"
                        placeholder="Your last name"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-300 focus:border-transparent outline-none transition"
                      placeholder="your.email@example.com"
                    />
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number (Optional)
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-300 focus:border-transparent outline-none transition"
                      placeholder="+94 77 123 4567"
                    />
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                      Subject
                    </label>
                    <select
                      id="subject"
                      name="subject"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-300 focus:border-transparent outline-none transition"
                    >
                      <option value="">Select a subject</option>
                      <option value="general">General Inquiry</option>
                      <option value="wholesale">Wholesale Information</option>
                      <option value="technical">Technical Support</option>
                      <option value="partnership">Partnership Opportunities</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                      Message
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows={6}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-300 focus:border-transparent outline-none transition resize-vertical"
                      placeholder="Tell us how we can help you..."
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    className="w-full px-8 py-3 rounded-lg font-semibold text-white shadow-lg transition transform hover:scale-[1.02]"
                    style={{ backgroundColor: COLORS.RICH_GOLD }}
                  >
                    Send Message
                  </button>
                </form>
              </div>
            </div>
          </div>
        </section>


      </main>

      <Footer />
    </div>
  );
}

export default ContactUs;
