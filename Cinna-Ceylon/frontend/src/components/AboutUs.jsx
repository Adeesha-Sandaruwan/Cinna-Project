import React from 'react';
import { Link } from 'react-router-dom';
import { HeartIcon, UsersIcon, SparklesIcon, StarIcon, GlobeAltIcon, AcademicCapIcon } from '@heroicons/react/24/outline';
import AnimatedSection from './AnimatedSection';
import Header from './Header';
import Footer from './Footer';

/* ----- Color tokens (matching HomePage theme) ----- */
const COLORS = {
  RICH_GOLD: '#c5a35a',
  DEEP_CINNAMON: '#CC7722',
  WARM_BEIGE: '#F5EFE6',
  DARK_SLATE: '#2d2d2d',
  SOFT_WHITE: '#FCFBF8',
};

/* ----- Team members data ----- */
const teamMembers = [
  {
    name: 'Adeesha',
    role: 'Team Member',
    image: 'https://ui-avatars.com/api/?name=Adeesha&background=c5a35a&color=ffffff&size=300&bold=true',
    description: 'Project team Leader contributing to the Ceylon cinnamon supply chain management system.'
  },
  {
    name: 'Janith',
    role: 'Team Member',
    image: 'https://ui-avatars.com/api/?name=Janith&background=CC7722&color=ffffff&size=300&bold=true',
    description: 'Project team member contributing to the Ceylon cinnamon supply chain management system.'
  },
  {
    name: 'Sahan',
    role: 'Team Member',
    image: 'https://ui-avatars.com/api/?name=Sahan&background=F5EFE6&color=2d2d2d&size=300&bold=true',
    description: 'Project team member contributing to the Ceylon cinnamon supply chain management system.'
  },
  {
    name: 'Biyuni',
    role: 'Team Member',
    image: 'https://ui-avatars.com/api/?name=Biyuni&background=2d2d2d&color=ffffff&size=300&bold=true',
    description: 'Project team member contributing to the Ceylon cinnamon supply chain management system.'
  },
  {
    name: 'Himasha',
    role: 'Team Member',
    image: 'https://ui-avatars.com/api/?name=Himasha&background=FCFBF8&color=2d2d2d&size=300&bold=true',
    description: 'Project team member contributing to the Ceylon cinnamon supply chain management system.'
  }
];



function AboutUs() {
  return (
    <div style={{ backgroundColor: COLORS.SOFT_WHITE }} className="antialiased">
      <Header />

      <main className="text-gray-800">
        {/* ---------- Hero Section ---------- */}
        <section className="relative py-20 bg-gradient-to-br from-amber-50 to-orange-50">
          <div className="absolute inset-0 bg-black/10"></div>
          <div 
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: 'url("https://ideogram.ai/assets/image/lossless/response/2nIN32B7SCmpA7S8n431ng")',
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          ></div>
          
          <div className="relative z-10 max-w-4xl mx-auto px-6 md:px-8 text-center">
            <h1 
              className="text-4xl md:text-6xl font-extrabold leading-tight"
              style={{ fontFamily: "'Cormorant Garamond', serif", color: COLORS.DARK_SLATE }}
            >
              Our Story
            </h1>
            <p className="mt-6 text-lg md:text-xl text-gray-700 leading-relaxed max-w-3xl mx-auto">
            From the lush highlands of Sri Lanka to global markets, Cinna Ceylon ensures a seamless and transparent
            cinnamon supply chain. For over two decades, we have combined tradition with innovation
             to deliver efficiency, traceability, and trust at every stage from
              cultivation to distribution. Our system empowers growers,
               suppliers, and businesses with the tools they need to manage, track, and optimize the journey of authentic Ceylon cinnamon
            </p>
          </div>
        </section>

        {/* ---------- Company Overview ---------- */}
        <AnimatedSection className="py-16">
          <div className="max-w-7xl mx-auto px-6 md:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 
                className="text-3xl md:text-4xl font-bold mb-6"
                style={{ fontFamily: "'Cormorant Garamond', serif", color: COLORS.DARK_SLATE }}
              >
                Rooted in Tradition, Driven by Excellence
              </h2>
              <p className="text-gray-700 leading-relaxed mb-6">
              Cinna Ceylon Supply Chain Management System was developed as a university project with 
              the aim of modernizing and streamlining the Ceylon cinnamon supply chain. While still
               in its early stages, the system is designed to connect farmers, suppliers,
                and distributors under one digital platform, ensuring greater transparency,
                 efficiency, and trust.
              </p>
              <p className="text-gray-700 leading-relaxed mb-6">
              Inspired by Sri Lanka’s long-standing cinnamon heritage, our project focuses on supporting
              small-scale farmers from the central highlands by providing fair opportunities, improved traceability,
               and sustainable practices. Through this initiative, we seek to bridge tradition with technology and
                lay the foundation for a smarter, more reliable cinnamon supply chain.
              </p>
                              <div className="grid grid-cols-2 gap-4 mt-8">
                  <div className="text-center p-4 bg-white rounded-lg shadow">
                    <div className="text-2xl font-bold" style={{ color: COLORS.RICH_GOLD }}>100%</div>
                    <div className="text-sm text-gray-600">Quality Ensured</div>
                  </div>
                  <div className="text-center p-4 bg-white rounded-lg shadow">
                    <div className="text-2xl font-bold" style={{ color: COLORS.RICH_GOLD }}>150+</div>
                    <div className="text-sm text-gray-600">Partner Farms</div>
                  </div>
                </div>
            </div>
            
            <div className="space-y-6">
              <img
                src="https://ideogram.ai/assets/image/lossless/response/bztddh2gSkSHSkD9lvh4_g"
                alt="Ceylon cinnamon plantation"
                className="rounded-lg shadow-xl w-full object-cover h-64"
              />
              <img
                src="https://ideogram.ai/assets/image/lossless/response/Ew38Un6zQUCMWlKagMGLVA"
                alt="Traditional cinnamon processing"
                className="rounded-lg shadow-xl w-full object-cover h-48"
              />
            </div>
          </div>
        </AnimatedSection>

        {/* ---------- Our Values ---------- */}
        <AnimatedSection className="py-16 bg-gradient-to-r from-amber-50/50 to-orange-50/50">
          <div className="max-w-7xl mx-auto px-6 md:px-8">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <h2 
                className="text-3xl md:text-4xl font-bold mb-4"
                style={{ fontFamily: "'Cormorant Garamond', serif", color: COLORS.DARK_SLATE }}
              >
                Our Core Values
              </h2>
              <p className="text-gray-700 text-lg">
                These principles guide everything we do, from farm partnerships to customer service.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="bg-white rounded-lg p-6 shadow-lg text-center">
                <HeartIcon className="w-12 h-12 mx-auto mb-4" style={{ color: COLORS.DEEP_CINNAMON }} />
                <h3 className="text-xl font-semibold mb-3" style={{ color: COLORS.DARK_SLATE }}>
                  Passion for Quality
                </h3>
                <p className="text-gray-600">
                  Every batch is carefully tested and processed to ensure the highest standards of 
                  aroma, flavor, and purity that Ceylon cinnamon is renowned for.
                </p>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-lg text-center">
                <UsersIcon className="w-12 h-12 mx-auto mb-4" style={{ color: COLORS.DEEP_CINNAMON }} />
                <h3 className="text-xl font-semibold mb-3" style={{ color: COLORS.DARK_SLATE }}>
                  Community First
                </h3>
                <p className="text-gray-600">
                  We believe in fair trade practices, supporting local farmers with better prices 
                  and investing in community development programs.
                </p>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-lg text-center">
                <SparklesIcon className="w-12 h-12 mx-auto mb-4" style={{ color: COLORS.DEEP_CINNAMON }} />
                <h3 className="text-xl font-semibold mb-3" style={{ color: COLORS.DARK_SLATE }}>
                  Sustainability
                </h3>
                <p className="text-gray-600">
                  Environmental responsibility is at our core. We promote organic farming, 
                  sustainable packaging, and carbon-neutral shipping practices.
                </p>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-lg text-center">
                <StarIcon className="w-12 h-12 mx-auto mb-4" style={{ color: COLORS.DEEP_CINNAMON }} />
                <h3 className="text-xl font-semibold mb-3" style={{ color: COLORS.DARK_SLATE }}>
                  Authenticity
                </h3>
                <p className="text-gray-600">
                  We source only true Ceylon cinnamon (Cinnamomum verum) and maintain complete 
                  transparency in our supply chain from farm to table.
                </p>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-lg text-center">
                <GlobeAltIcon className="w-12 h-12 mx-auto mb-4" style={{ color: COLORS.DEEP_CINNAMON }} />
                <h3 className="text-xl font-semibold mb-3" style={{ color: COLORS.DARK_SLATE }}>
                  Global Reach
                </h3>
                <p className="text-gray-600">
                  While rooted in Sri Lankan tradition, we serve customers worldwide, sharing 
                  the exceptional taste of authentic Ceylon spices globally.
                </p>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-lg text-center">
                <AcademicCapIcon className="w-12 h-12 mx-auto mb-4" style={{ color: COLORS.DEEP_CINNAMON }} />
                <h3 className="text-xl font-semibold mb-3" style={{ color: COLORS.DARK_SLATE }}>
                  Innovation
                </h3>
                <p className="text-gray-600">
                  We continuously improve our processing methods and develop new products while 
                  respecting traditional techniques passed down through generations.
                </p>
              </div>
            </div>
          </div>
        </AnimatedSection>

        {/* ---------- Meet Our Team ---------- */}
        <AnimatedSection className="py-16">
          <div className="max-w-7xl mx-auto px-6 md:px-8">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <h2 
                className="text-3xl md:text-4xl font-bold mb-4"
                style={{ fontFamily: "'Cormorant Garamond', serif", color: COLORS.DARK_SLATE }}
              >
                Meet Our Team
              </h2>
              <p className="text-gray-700 text-lg">
                The dedicated team members behind the Cinna Ceylon supply chain management system.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              {teamMembers.map((member, index) => (
                <div key={index} className="bg-white rounded-lg overflow-hidden shadow-lg">
                  <img 
                    src={member.image} 
                    alt={member.name}
                    className="w-full h-64 object-cover"
                  />
                  <div className="p-6">
                    <h3 className="text-xl font-semibold mb-2" style={{ color: COLORS.DARK_SLATE }}>
                      {member.name}
                    </h3>
                    <p className="font-medium mb-3" style={{ color: COLORS.RICH_GOLD }}>
                      {member.role}
                    </p>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {member.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </AnimatedSection>



        {/* ---------- Call to Action ---------- */}
        <section className="py-16 bg-gradient-to-r from-amber-100 to-orange-100">
          <div className="max-w-4xl mx-auto px-6 md:px-8 text-center">
            <h3 
              className="text-2xl md:text-3xl font-bold mb-4"
              style={{ fontFamily: "'Cormorant Garamond', serif", color: COLORS.DARK_SLATE }}
            >
              Experience the CinnaCeylon Difference
            </h3>
            <p className="text-gray-700 text-lg mb-8 max-w-2xl mx-auto">
              Join thousands of satisfied customers who have discovered the unmatched quality 
              and authentic flavor of true Ceylon cinnamon. Taste the difference tradition makes.
            </p>
            
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                to="/products"
                className="inline-block px-8 py-3 rounded-full font-semibold shadow-lg transition transform hover:scale-[1.02]"
                style={{ backgroundColor: COLORS.RICH_GOLD, color: '#111' }}
              >
                Shop Our Products
              </Link>
              <Link
                to="/contact"
                className="inline-block px-8 py-3 rounded-full border-2 font-semibold transition"
                style={{ 
                  borderColor: COLORS.DEEP_CINNAMON, 
                  color: COLORS.DEEP_CINNAMON 
                }}
              >
                Contact Us
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default AboutUs;
