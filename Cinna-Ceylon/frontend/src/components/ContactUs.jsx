import React from 'react'; // Import React to build component
import { PhoneIcon, EnvelopeIcon, MapPinIcon, ClockIcon } from '@heroicons/react/24/outline'; // Import icons
import Header from './Header'; // Import header component
import Footer from './Footer'; // Import footer component

/* Theme colors used across page */
const COLORS = {
  RICH_GOLD: '#c5a35a', // Gold color
  DEEP_CINNAMON: '#CC7722', // Cinnamon color
  WARM_BEIGE: '#F5EFE6', // Light beige
  DARK_SLATE: '#2d2d2d', // Dark gray
  SOFT_WHITE: '#FCFBF8', // Soft white
};

function ContactUs() {
  return (
    <div style={{ backgroundColor: COLORS.SOFT_WHITE }} className="antialiased"> {/* Main container with background */}
      {/* Navigation bar at top */}
      <Header />

      <main className="text-gray-800"> {/* Content wrapper */}

        {/* ---------- Hero Section ---------- */}
        <section className="py-16 bg-gradient-to-br from-amber-50 to-orange-50"> {/* Hero area with gradient */}
          <div className="max-w-4xl mx-auto px-6 md:px-8 text-center"> {/* Center content */}
            <h1
              className="text-4xl md:text-5xl font-extrabold mb-6"
              style={{ fontFamily: "'Cormorant Garamond', serif", color: COLORS.DARK_SLATE }}
            >
              Contact Us
            </h1>
            <p className="text-lg md:text-xl text-gray-700 max-w-2xl mx-auto">
              Get in touch with our team. We're here to help with any questions about our cinnamon system.
            </p>
          </div>
        </section>

        {/* ---------- Contact Info + Form ---------- */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-6 md:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12">
            
            {/* Contact Information */}
            <div>
              <h2
                className="text-3xl font-bold mb-8"
                style={{ fontFamily: "'Cormorant Garamond', serif", color: COLORS.DARK_SLATE }}
              >
                Get In Touch
              </h2>

              <div className="space-y-6">
                {/* Phone */}
                <div className="flex items-start space-x-4">
                  <div
                    className="w-12 h-12 flex items-center justify-center rounded-full"
                    style={{ backgroundColor: COLORS.RICH_GOLD }}
                  >
                    <PhoneIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2" style={{ color: COLORS.DARK_SLATE }}>Phone</h3>
                    <p className="text-gray-600">+94 77 123 4567</p>
                    <p className="text-gray-600">+94 11 234 5678</p>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-start space-x-4">
                  <div
                    className="w-12 h-12 flex items-center justify-center rounded-full"
                    style={{ backgroundColor: COLORS.DEEP_CINNAMON }}
                  >
                    <EnvelopeIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2" style={{ color: COLORS.DARK_SLATE }}>Email</h3>
                    <p className="text-gray-600">info@cinnaceylon.com</p>
                    <p className="text-gray-600">support@cinnaceylon.com</p>
                  </div>
                </div>

                {/* Address */}
                <div className="flex items-start space-x-4">
                  <div
                    className="w-12 h-12 flex items-center justify-center rounded-full"
                    style={{ backgroundColor: COLORS.RICH_GOLD }}
                  >
                    <MapPinIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2" style={{ color: COLORS.DARK_SLATE }}>Address</h3>
                    <p className="text-gray-600">
                      123 Cinnamon Gardens<br />Colombo 07, Sri Lanka<br />00700
                    </p>
                  </div>
                </div>

                {/* Business Hours */}
                <div className="flex items-start space-x-4">
                  <div
                    className="w-12 h-12 flex items-center justify-center rounded-full"
                    style={{ backgroundColor: COLORS.DEEP_CINNAMON }}
                  >
                    <ClockIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2" style={{ color: COLORS.DARK_SLATE }}>Business Hours</h3>
                    <p className="text-gray-600">
                      Mon-Fri: 9:00 AM - 6:00 PM<br />
                      Sat: 9:00 AM - 1:00 PM<br />
                      Sun: Closed
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
                {/* First + Last Name */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <input
                    type="text"
                    id="firstName"
                    required
                    placeholder="First Name"
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-yellow-300"
                  />
                  <input
                    type="text"
                    id="lastName"
                    required
                    placeholder="Last Name"
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-yellow-300"
                  />
                </div>

                {/* Email */}
                <input
                  type="email"
                  id="email"
                  required
                  placeholder="your.email@example.com"
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-yellow-300"
                />

                {/* Phone */}
                <input
                  type="tel"
                  id="phone"
                  placeholder="+94 77 123 4567"
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-yellow-300"
                />

                {/* Subject */}
                <select
                  id="subject"
                  required
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-yellow-300"
                >
                  <option value="">Select a subject</option>
                  <option value="general">General Inquiry</option>
                  <option value="wholesale">Wholesale Information</option>
                  <option value="technical">Technical Support</option>
                  <option value="partnership">Partnership Opportunities</option>
                  <option value="other">Other</option>
                </select>

                {/* Message */}
                <textarea
                  id="message"
                  rows={6}
                  required
                  placeholder="Tell us how we can help..."
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-yellow-300 resize-vertical"
                ></textarea>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full px-8 py-3 rounded-lg font-semibold text-white shadow-lg"
                  style={{ backgroundColor: COLORS.RICH_GOLD }}
                >
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </section>
      </main>

      {/* Bottom footer */}
      <Footer />
    </div>
  );
}

export default ContactUs;
