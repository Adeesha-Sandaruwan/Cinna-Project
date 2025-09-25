import React from 'react'; // Import React
import { Link } from 'react-router-dom'; // For page navigation
import { HeartIcon, UsersIcon, SparklesIcon, StarIcon, GlobeAltIcon, AcademicCapIcon } from '@heroicons/react/24/outline'; // Icons
import AnimatedSection from './AnimatedSection'; // Animation wrapper
// Header & Footer removed (provided globally by App layout)

// Theme colors
const COLORS = {
  RICH_GOLD: '#c5a35a',
  DEEP_CINNAMON: '#CC7722',
  WARM_BEIGE: '#F5EFE6',
  DARK_SLATE: '#2d2d2d',
  SOFT_WHITE: '#FCFBF8',
};

// Team data
const teamMembers = [
  {
    name: 'Adeesha',
    role: 'Team Leader',
    image: 'https://ui-avatars.com/api/?name=Adeesha&background=c5a35a&color=ffffff&size=300&bold=true',
    description: 'Handle Product management and Leads project and vision.'
  },
  {
    name: 'Janith',
    role: 'Team Member',
    image: 'https://ui-avatars.com/api/?name=Janith&background=CC7722&color=ffffff&size=300&bold=true',
    description: 'Works on delivery management system.'
  },
  {
    name: 'Sahan',
    role: 'Team Member',
    image: 'https://ui-avatars.com/api/?name=Sahan&background=F5EFE6&color=2d2d2d&size=300&bold=true',
    description: 'Helps connect financial base to site.'
  },
  {
    name: 'Biyuni',
    role: 'Team Member',
    image: 'https://ui-avatars.com/api/?name=Biyuni&background=2d2d2d&color=ffffff&size=300&bold=true',
    description: 'Helps to connect farmers and raw cinnamon.'
  },
  {
    name: 'Himasha',
    role: 'Team Member',
    image: 'https://ui-avatars.com/api/?name=Himasha&background=FCFBF8&color=2d2d2d&size=300&bold=true',
    description: 'Builds User management system.'
  }
];

// Main component
function AboutUs() {
  return (
    <div style={{ backgroundColor: COLORS.SOFT_WHITE }}>

      <main>
        {/* Hero Section */}
        <section className="relative py-20 bg-gradient-to-br from-amber-50 to-orange-50 text-center">
          <h1 className="text-4xl md:text-6xl font-bold" style={{ color: COLORS.DARK_SLATE }}>
            Our Story
          </h1>
          <p className="mt-6 text-lg text-gray-700 max-w-2xl mx-auto">
            From Sri Lanka’s highlands to the world, Cinna Ceylon brings
            authentic cinnamon with trust and transparency.
          </p>
        </section>

        {/* Company Overview */}
        <AnimatedSection className="py-16">
          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center px-6">
            {/* Left side text */}
            <div>
              <h2 className="text-3xl font-bold mb-6" style={{ color: COLORS.DARK_SLATE }}>
                Tradition Meets Innovation
              </h2>
              <p className="text-gray-700 mb-4">
                Our system links farmers, suppliers and distributors on one platform —
                simple, clear and fair.
              </p>
              <p className="text-gray-700">
                Inspired by heritage, we use tech to give farmers fair trade
                and customers true quality.
              </p>
            </div>

            {/* Right side images */}
            <div className="space-y-6">
              <img
                src="https://ideogram.ai/assets/image/lossless/response/bztddh2gSkSHSkD9lvh4_g"
                alt="Cinnamon plantation"
                className="rounded-lg shadow-xl w-full h-64 object-cover"
              />
              <img
                src="https://ideogram.ai/assets/image/lossless/response/Ew38Un6zQUCMWlKagMGLVA"
                alt="Cinnamon processing"
                className="rounded-lg shadow-xl w-full h-48 object-cover"
              />
            </div>
          </div>
        </AnimatedSection>

        {/* Core Values */}
        <AnimatedSection className="py-16 bg-gradient-to-r from-amber-50/50 to-orange-50/50">
          <div className="max-w-7xl mx-auto px-6 text-center">
            <h2 className="text-3xl font-bold mb-6" style={{ color: COLORS.DARK_SLATE }}>
              Our Core Values
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {[
                { icon: <HeartIcon />, title: "Quality" },
                { icon: <UsersIcon />, title: "Community" },
                { icon: <SparklesIcon />, title: "Sustainability" },
                { icon: <StarIcon />, title: "Authenticity" },
                { icon: <GlobeAltIcon />, title: "Global Reach" },
                { icon: <AcademicCapIcon />, title: "Innovation" },
              ].map((val, i) => (
                <div key={i} className="bg-white rounded-lg p-6 shadow text-center">
                  <div className="w-10 h-10 mx-auto mb-2 text-orange-600">{val.icon}</div>
                  <p className="font-semibold">{val.title}</p>
                </div>
              ))}
            </div>
          </div>
        </AnimatedSection>

        {/* Meet the Team */}
        <AnimatedSection className="py-16">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-3xl font-bold text-center mb-8" style={{ color: COLORS.DARK_SLATE }}>
              Meet Our Team
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
              {teamMembers.map((m, i) => (
                <div key={i} className="bg-white rounded-lg shadow p-4 text-center">
                  <img src={m.image} alt={m.name} className="w-full h-40 object-cover rounded" />
                  <h3 className="mt-4 font-semibold">{m.name}</h3>
                  <p className="text-orange-600">{m.role}</p>
                  <p className="text-gray-600 text-sm">{m.description}</p>
                </div>
              ))}
            </div>
          </div>
        </AnimatedSection>

        {/* Call to Action */}
        <section className="py-16 bg-amber-100 text-center">
          <h3 className="text-2xl font-bold">Experience Cinna Ceylon</h3>
          <p className="mt-2 text-gray-700">Taste the true flavor of Ceylon cinnamon.</p>
          <div className="mt-6 flex justify-center gap-4">
            <Link
              to="/products"
              className="px-6 py-2 rounded-full font-semibold shadow"
              style={{ backgroundColor: COLORS.RICH_GOLD, color: '#111' }}
            >
              Shop
            </Link>
            <Link
              to="/contact"
              className="px-6 py-2 rounded-full border-2 font-semibold"
              style={{ borderColor: COLORS.DEEP_CINNAMON, color: COLORS.DEEP_CINNAMON }}
            >
              Contact
            </Link>
          </div>
        </section>
      </main>

    </div>
  );
}

export default AboutUs;
